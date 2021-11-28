# Install from source

quick installation of baetyl-cloud, you can build baetyl-cloud from source to get the latest features.

## Prerequisites

- The Go tools and modules

The minimum required go version is 1.13. Refer to [golang.org](https://golang.org/dl/) or [golang.google.cn](https://golang.google.cn/dl/) to download and install the Go tools. Now we use Go Modules to manage packages，you can refer [goproxy.baidu.com](https://goproxy.baidu.com/)  to set GOPROXY if needs.

- The Docker Engine and Buildx

The minimum required Docker version is 19.03, because the Docker Buildx feature is introduced to build multi-platform images. Refer to  [docker.com/install](https://docs.docker.com/install/)to install the Docker Engine and refer to [github.com/docker/buildx](https://github.com/docker/buildx) to enable the Docker Buildx.


## Download source code

Download the code from [Baetyl Github](https://github.com/baetyl/baetyl-cloud) and execute the following command:

```shell
git clone https://github.com/baetyl/baetyl-cloud.git
```

## Build baetyl-cloud

Go into the baetyl-cloud project directory and execute `make` to build the baetyl-cloud main program.

```shell
make
```

After the make command is completed, the baetyl-cloud main program will be generated in the project's `output` directory.
 
## Make image
 
If you use container mode to run baetyl-cloud, we recommend using officially released official images. If you want to make your own image, you can use the commands provided below, but only if the Buildx function mentioned in the first preparation is turned on.

Go into the baetyl-cloud project directory and execute `make image` to generate baetyl-cloud image.

```shell
make image
```

After the command is completed, you can execute `docker images` to view the generated image.

```shell
docker images

REPOSITORY    TAG          IMAGE ID         CREATED SIZE
cloud       git-be2c5a9   d70a7faf5443    About an hour ago 40.7MB
```

Modify the image configuration in scripts/demo/charts/baetyl-cloud/values.yaml, and use helm install command to deploy baetyl-cloud.