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



