# Docker Workshop - Part 2
Composition and Scheduling

## Collaborating Containers

Containers work together through two means, _volume mounts_ and _network
connections_ .  A container run with the ```--volumes-from``` option
mounts volumes from another container. If it is run with ```--link```
option, it can consume network services from another container.

Create a new directory and make it current. Create a ```data``` directory
and deposit an ```index.html``` file there:
```html
<html>
  <head><title>From Docker</title></head>
  </body><p>Truly the best paragraph.</p></body>
</html>
```

Now do these things in Docker:

0. ```docker create --name data1 -v "$(pwd)/data:/usr/share/nginx/html:ro" tianon/true```
0. ```docker run -d --name service1 nginx```
0. ```docker run --link service1:webs aztecrex/curl http://webs``` .

Here's what happened. You created a data volume based on *tianon/true*. Then
you started Nginx with the data from that container. Finally, you ran curl
in a container to pull data from the Nginx service running in your service
container.

Stop the service container with ```docker stop service1``` . Cleanup the
containers with ```docker rm -v data1 service1``` .

## That Was Typing Into a Shell

Using the ```docker``` command to share data and services is tedious. Instead,
you can declare all your interconnections and configurations with *Docker
Compose*.  Compose doesn't add any docker functionality, it just lets you
specify collections of collaborating containers with a configuration file.
This lets you develop your application incrementally and have easily
repeatable results.

In a directory to which you can clone a project, clone the
aztecrex/docker-workshop project from
Github: ```git clone ```

Type ```docker-compose run curl``` . After some churning, you will see some
HTML in the terminal. This command is performing pretty much what you did
with the Docker CLI before. Take a look at ```docker-compose.yml```

```yaml
version: '2'
services:
  data:
    build: ./data
  nginx:
    image: nginx
    volumes_from:
      - data
  curl:
    image: aztecrex/curl
    command: http://website
    links:
      - nginx:website
```

This is the basic structure of all Docker Compose configurations. The heart
of the configuration is a list of services, which are containers either
pulled from a repository or built from source.  The *version* directive
tells Compose about the grammar in use. You should use version 2 unless you
need to support older versions of the Docker toolset.

Notice the *volumes_from* property. This directly corresponds to
the ```--volumes-from``` option of the ```docker``` command. Rather than
specify the option multiple times for multiple data containers, just list
them under the property key.  Similary, the ```links``` property corresponds
with multiple ```--link``` options to the ```docker``` command.

Now type ```docker-compose down -v --rmi local``` to stop and remove running
containers and any locally-built images.

## Self-contained Application

Make ```part2-b``` your working directory. Before doing anything, take a look
at the ```docker-compose.yml``` file. This is a complete application with
4 components: a Redis data store, two services, and a load balancer/static
web server.

Type ```docker-compose build``` . Notice all the services with source
are built. This works from within any sub-directory.

Type ```docker-compose up -d``` .  The ```-d``` flag tells compose to
detach from your terminal. To see the logs, type ```docker-compose logs``` .
Press ```Ctl-C``` to terminate the log roll.

Bring down the application with ```docker-compose down -v``` .

Add an alias to quickly restart
```bash
alias kick='docker-compose down -v; docker-compose build; docker-compose up -d'
```

## Network Segmentation

Say you want to protect your data store from any breach of your load
balancer. In a data center, you might setup VLANS or even distinct
physical cabling. For containers, Compose lets you create isolated networks
within your application configuration.

### Default network

In the manual composition at the beginning of this workshop, you were
able to link a new container to a container you had running already. Try
that with the composed application.  With the application up,
type ```docker run -it --link part2b_store_1:redis --rm redis redis-cli -h redis -p 6379```
The error you see suggests that Compose is running your application in
an isolated network. It is.

### Docker Compose Override

Create a file called ```docker-compose.override.yml``` in the *part2-b*
directory. An override lets you make changes to a composition without
touching the main configuration and is useful during development. The
project's ```.gitignore``` includes that file so it won't be checked in.

Add the version directive from the main compose configuration.

### Add Networks

Add service and storage networks to your override.

```yaml
version: '2'
services:
  counter:
    networks:
      - service
      - database
  motd:
    networks:
      - service
      - database
  store:
    networks:
      - database
  balancer:
    networks:
      - service
networks:
  service:
  database:
```

## Container Scheduling

Sometimes called orchestration, container scheduling runs collaborating
containers on groups of hosts according to a scheduling configuration.
A scheduling rule could be "run this container on any available host",
"always keep 3 containers from this image running at all times on
separate hosts", or a variety of other rules supported by the scheduler.

Docker provides its own scheduler, Docker Swarm, but many 3rd-party
schedulers exist such as Kubernetes and AWS ECS.

### Docker Swarm in a Local Sandbox

To try out Swarm, you need Docker Machine. This is installed as part of
the Docker tooling on Mac and Windows. On Linux it is a separate installation
and is documented well on the Docker site.

Stop your default docker machine (yours might not be named default):
```bash
docker-machine ls
docker-machine stop default
```

Create the external key store:
```bash
docker-machine create -d virtualbox keystore
val $(docker-machine env keystore)
docker run -d \
    -p "8500:8500" \
    -h "consul" \
    progrium/consul -server -bootstrap

```

Create the managing node:
```bash
docker-machine create \
    -d virtualbox \
    --swarm --swarm-master \
    --swarm-discovery="consul://$(docker-machine ip keystore):8500" \
    --engine-opt="cluster-store=consul://$(docker-machine ip keystore):8500" \
    --engine-opt="cluster-advertise=eth1:2376" \
    manager
```

Create additional agent nodes:
```bash
docker-machine create -d virtualbox \
    --swarm \
    --swarm-discovery="consul://$(docker-machine ip keystore):8500" \
    --engine-opt="cluster-store=consul://$(docker-machine ip keystore):8500" \
    --engine-opt="cluster-advertise=eth1:2376" \
  agent-a

docker-machine create -d virtualbox \
    --swarm \
    --swarm-discovery="consul://$(docker-machine ip keystore):8500" \
    --engine-opt="cluster-store=consul://$(docker-machine ip keystore):8500" \
    --engine-opt="cluster-advertise=eth1:2376" \
  agent-b

```

Connect to the master machine ```eval $(docker-machine env --swarm manager)``` and get some information ```docker info``` .






