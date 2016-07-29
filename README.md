# Docker Workshop

## Docker is...
0. Tooling for Linux Containers (LXC) kernel features
 * isolated process namespace
 * root filesystem
 * copy on write storage via AUFS
 * virtual network interfaces and LANs
0. Ecosystem for Container storage and transport
 * format for specifying incremental filesystem composition (layers)
 * protocol for storing and retrieving remote filesystem images

... a better chroot.


## VMs vs Containers

A Docker container is zero or more processes running on a Linux host.  A
container is not a virtual machine. It is sometimes described in ways that
make it seem like a virtual machine.

Many containers can run simultaneously on a single Linux physical or virtual
host. The only difference between processes running in a container and
those running outside a container is that the processes in the container are
in an isolated "jail" that prevents them from touching arbitrary data on
the host filesystem, keeps them from discovering other processes, and lets
them communicate on their own virtual networks.

A VM is an instance of an OS running on hardware managed by a hypervisor or
other resource management software. A VM is a full operating system with
its own kernel.


## Basic Docker Commands

The command-line interface to docker is the ```docker``` command. Some of the
most-used subcommands include:

0. ```docker run``` run the main process of a docker container
0. ```docker ps``` list the running (and optionally stopped) containers
0. ```docker images``` list the cached container images

## The Docker Daemon

Under the hood, all docker operation is via HTTP requests to the Docker
daemon.  You can access docker functionality through a number of language
bindings or through HTTP invocations directly.

Access to the Docker daemon requires special privilege. The ability to run
commands through the daemon is equivalent to having root access on the
host machine. This is one of the biggest criticisms of Docker.

## So Let's Run a Container

Type ```docker run alpine echo hi```

It looks like it just ran ```echo hi```.  It did. But it ran it from an
image named 'alpine'. Alpine contains the busybox runtime so the ```echo```
process was buybox, not your shell's built-in.

Type ```docker run ubuntu echo hi```

Wow, ```echo hi``` again.  And what was with all that downloading? In this
case, you ran the ```echo``` command from a copy of the Ubuntu Linux filesystem.

In both cases, the process ran on your kernel (or your Docker Machine's kernel),
not a separate virtual machine. It's as if you copied the busybox or bash
binary to your own machine and ran it.

Type ```docker ps``` . Your container is not listed. That's because ```ps```
only lists running containers by default. To see your stopped container,
type ```docker ps -a``` .  Notice that Docker gave it a name. That's because
you didn't give it one.  You can name a container with an option
to  ```docker run``` but be aware only one container, stopped or running,
can have any particular name.

Type ```docker run --name hi alpine echo hi``` then ```docker ps -a``` . You
see your container was named 'hi.' Now
try ```docker run --name hi alpine echo hi``` again. Whoops.
Type ```docker rm -v hi``` to remove it then you can re-use the name.

## Make a New Image

Start a container this way: ```docker run --name hello -ti alpine sh```

You are now operating the busybox shell in a container's jail. Spooky in
here.

Make a file: ```echo Hello from Docker Jail! > /hello.txt``` . See what you
made with ```ls``` . Control-D to
exit. ```docker ps -a``` lists your 'hello' container.

Type ```docker commit hello helloworld``` . Now you've turned a snapshot
of your container's filesystem into an image, 'helloworld' . Run a command
with your new image ```docker run helloworld cat /hello.txt``` . Cool.

## Make an Image With a Dockerfile

That was great and all but you really need a container image that performs
the operations you prescribe without having to supply the shell command
at run time.  To do this, you need to create an image with a default command.

The Docker build system specifies an instruction set for describing images.
You put your image-building instructions into a 'Dockerfile' then use the
docker command to build your image. A Dockerfile is only one way to
describe an image build. But it is nothing much more than what we did above:
create a container, modify it, then commit a snapshot of it to create an
image.

Create a new directory and create a 'Dockerfile' with this content:
```sh
FROM alpine

RUN mkdir -p /data
RUN echo Hello from a useful container! > /data/welcome.txt

CMD ["cat", "/data/welcome.txt"]
```

With that directory current, type ```docker build .``` .  
The dot is important, it tells docker where to find the docker _context_; in
this case, the context is the current directory. But you can use a full path
to the context if it is not your current directory. Notice that the
last line of output shows a peculiar hex number. That is actually the first
few digits of the image name. You can actually run your image from that but
it is often easier to give the image a friendly name.

Type ```docker build -t hellodockerfile .```  to build and name the image in
one step.

Type ```docker run hellodockerfile```

Sweet.


## Extend an Image

Docker containers can be combined in several ways. A fundamental way
is by extending an image with a new file system layer. You already
saw that you could extend the *alpine* image with customer content
and configuration.  Let's extend your new container by replacing some
of its data.

Create a new directory and save a 'Dockerfile' with this:

```sh
FROM hellodockerfile

RUN echo Hello from an extended image! > /data/welcome.txt

```

Build the container with ```docker build -t helloextended .``` then
run it with ```docker run helloextended``` . Notice that all that changed was
the output string.  The command configuration and original access to
busybox is intact.

# Attach Data

Another way to combine containers is by merging their data at run time.

Type ```docker create --name datavolumes aztecrex/welcometext```
then ```docker ps -a | egrep datavolumes``` .  You will see that a container
was created but it is no longer running.  Any container, even one that is
not running can supply its data to another container as one or move *volumes*.

Type ```docker run --volumes-from datavolumes hellodockerfile```

# Publish an Image

To share an image, you can publish it in a Docker *registry*. A registry is
made up of one or more *repositories* . A repository is usually focused on
a particular need such as an application implementation. Within a repository,
images can be *tagged* . The default tag when pushing an image to a repository
is *latest*.

Before you can publish, you must be logged into your registry.
Type ```docker login``` and enter your information.

Alias your image with the unfortunately named ```tag```
command: ```docker tag helloextended <mynamespace>/helloextended``` . Use
your own Docker Hub username instead of ```<mynamespace>``` .  Now push
your image to your own repository
with ```docker push <mynamespace>/helloextended``` .

Try to run someone else's image
with ```docker run <theirnamespace>/helloextended``` .


