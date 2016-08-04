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
3 components: a Redis data store, a web service, and a load balancer.

Type ```docker-compose -d up``` .  The ```-d``` flag tells compose to
detach from your terminal. To see the logs, type ```docker-compose logs``` .
```Ctl-C``` terminates the log roll.


