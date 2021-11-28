# Installation

----

## Preparation

- Install k8s or k3s. For the introduction of k8s, please refer to [kubernetes official website](https://kubernetes.io).

## Statement

- The k8s related informations used in this article are as follows:
```
// kubectl version
Client Version: version.Info{Major:"1", Minor:"17", GitVersion:"v1.17.3", GitCommit:"06ad960bfd03b39c8310aaf92d1e7c12ce618213", GitTreeState:"clean", BuildDate:"2020-02-11T18:14:22Z", GoVersion:"go1.13.6", Compiler:"gc", Platform:"darwin/amd64"}
Server Version: version.Info{Major:"1", Minor:"15", GitVersion:"v1.15.5", GitCommit:"20c265fef0741dd71a66480e35bd69f18351daea", GitTreeState:"clean", BuildDate:"2019-10-15T19:07:57Z", GoVersion:"go1.12.10", Compiler:"gc", Platform:"linux/amd64"}
```

- The baetyl-cloud related informations used in this article are as follows:
```
// git log
commit 6d96271e24dbd4d5bb5f3e0509c2af7d085676af
Author: chensheng <chensheng06@baidu.com>
Date:   Tue Aug 11 15:54:26 2020 +0800

    fix cert error (#50)
```

Because the baetyl-cloud code is rapidly iterating, the latest code cannot be adapted in real time. So users need to switch to this version after downloading the baetyl-cloud code:
```shell script
git reset --hard 6d96271e24dbd4
```
In addition, this article will be updated regularly to adapt to the latest baetyl-cloud code.

----

## Helm Quick Installation

This article supports using helm v2/v3 for installation. The relevant version information during testing is as follows:
```
// helm v3: helm version
version.BuildInfo{Version:"v3.2.3", GitCommit:"8f832046e258e2cb800894579b1b3b50c2d83492", GitTreeState:"clean", GoVersion:"go1.13.12"}

// helm v2: helm version
Client: &version.Version{SemVer:"v2.16.9", GitCommit:"8ad7037828e5a0fca1009dabe290130da6368e39", GitTreeState:"clean"}
Server: &version.Version{SemVer:"v2.16.9", GitCommit:"8ad7037828e5a0fca1009dabe290130da6368e39", GitTreeState:"clean"}
```
For the installation of helm, please refer to [helm installation link](https://helm.sh/docs/intro/install).

### 1. Install database

Before installing baetyl-cloud, we need to install the database first, and execute the following command to install it.

```shell
// helm v3
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install mariadb --set rootUser.password=secretpassword,db.name=baetyl_cloud bitnami/mariadb
helm install phpmyadmin bitnami/phpmyadmin 

// helm v2
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install --name mariadb --set rootUser.password=secretpassword,db.name=baetyl_cloud bitnami/mariadb
helm install --name phpmyadmin bitnami/phpmyadmin 
```
**Note**: For the convenience of demonstration, we have hardcoded the password, please modify it yourself, and you can replace secretpassword globally.

### 2. Initialize data

Confirm that mariadb and phpmyadmin are in the Running state.

```shell
kubectl get pod
# NAME                            READY   STATUS             RESTARTS   AGE
# mariadb-master-0                1/1     Running            0          2m56s
# mariadb-slave-0                 1/1     Running            0          2m56s
# phpmyadmin-55f4f964d7-ctmxj     1/1     Running            0          117s
```

Then execute the following command to keep the terminal from exiting.

```shell
export POD_NAME=$(kubectl get pods --namespace default -l "app=phpmyadmin,release=phpmyadmin" -o jsonpath="{.items[0].metadata.name}")
echo "phpMyAdmin URL: http://127.0.0.1:8080"
kubectl port-forward --namespace default svc/phpmyadmin 8080:80
```

Then use a browser to open http://127.0.0.1:8080/index.php, Server input: mariadb, Username input: root, Password input: secretpassword. After logging in, select the database baetyl_cloud, click the SQL button, and enter tables.sql and data.sql in the scripts/sql directory under the baetyl-cloud project into the page for execution. If no error is reported during execution, the data initialization is successful. If you have installed before, please pay attention to delete the historical data under the baetyl-cloud database when installing again.

### 3. Install baetyl-cloud

For helm v3, enter the directory where the baetyl-cloud project is located and execute the following commands.

```shell
# helm v3
helm install baetyl-cloud ./scripts/charts/baetyl-cloud/
```

For helm v2, users need to do some additional operations in the above directories:

- Modify the apiVersion version in ./scripts/charts/baetyl-cloud/Chart.yaml from v2 to v1 and save it as follows:
```yaml
apiVersion: v1
name: baetyl-cloud
description: A Helm chart for Kubernetes

...
```
- Import crds manually:
```shell script
# k8s version is v1.16 or higher 
# k3s version is v1.17.4 or higher
kubectl apply -f ./scripts/charts/baetyl-cloud/apply/
# k8s version less than v1.16
# k3s version less than v1.17.4
kubectl apply -f ./scripts/charts/baetyl-cloud/apply_v1beta1/
```
- use helm v2 to install baetyl-cloud:
```shell script
# helm v2
helm install --name baetyl-cloud ./scripts/charts/baetyl-cloud/
```

To make sure that baetyl-cloud is in the Running state, and you can also check the log for errors.

```shell
kubectl get pod
# NAME                            READY   STATUS    RESTARTS   AGE
# baetyl-cloud-57cd9597bd-z62kb   1/1     Running   0          97s

kubectl logs -f baetyl-cloud-57cd9597bd-z62kb
```

### 4. Install edge node

Call the RESTful API to create a node.

```shell
curl -d "{\"name\":\"demo-node\"}" -H "Content-Type: application/json" -X POST http://0.0.0.0:30004/v1/nodes
# {"namespace":"baetyl-cloud","name":"demo-node","version":"1931564","createTime":"2020-07-22T06:25:05Z","labels":{"baetyl-node-name":"demo-node"},"ready":false}
```

Obtain the online installation script of the edge node.

```shell
curl http://0.0.0.0:30004/v1/nodes/demo-node/init
# {"cmd":"curl -skfL 'https://0.0.0.0:30003/v1/active/setup.sh?token=f6d21baa9b7b2265223a333630302c226b223a226e6f6465222c226e223a2264656d6f2d6e6f6465222c226e73223a2262616574796c2d636c6f7564222c227473223a313539353430323132367d' -osetup.sh && sh setup.sh"}
```

Execute the installation script on the machine where baetyl-cloud is deployed.

```shell
curl -skfL 'https://0.0.0.0:30003/v1/active/setup.sh?token=f6d21baa9b7b2265223a333630302c226b223a226e6f6465222c226e223a2264656d6f2d6e6f6465222c226e73223a2262616574796c2d636c6f7564222c227473223a313539353430323132367d' -osetup.sh && sh setup.sh
```

**Note**: If you need to install an edge node on a device other than the machine where baetyl-cloud is deployed, please modify the database, change the node-address and active-address in the baetyl_system_config table to real addresses.

Check the status of the edge node. Eventually, two edge services will be in the Running state. You can also call the cloud RESTful API to view the edge node status. You can see that the edge node is online ("ready":true).

```shell
kubectl get pod -A
# NAMESPACE            NAME                                      READY   STATUS    RESTARTS   AGE
# baetyl-edge-system   baetyl-core-8668765797-4kt7r              1/1     Running   0          2m15s
# baetyl-edge-system   baetyl-function-5c5748957-nhn88           1/1     Running   0          114s

curl http://0.0.0.0:30004/v1/nodes/demo-node
# {"namespace":"baetyl-cloud","name":"demo-node","version":"1939112",...,"report":{"time":"2020-07-22T07:25:27.495362661Z","sysapps":...,"node":...,"nodestats":...,"ready":true}
```

### 5. Uninstall baetyl-cloud

```shell
helm delete baetyl-cloud
```

----

## K8S Installation

### 1. Install database

Install mysql database, and initialize the data as follows:

- Create 'baetyl_cloud' database and tables, see specific sql statements in: *scripts/sql/tables.sql*

- Initialize table data, see specific sql setatements in: *scripts/sql/data.sql*

  ```shell
  # Note: modify the node-address and active-address in baetyl_system_config to real server address：
  # For example, if the service is deployed locally, the address can be configured as follows：
  # node-address : https://0.0.0.0:30005
  # active-address : https://0.0.0.0:30003
  # If the service is deployed on a non-local machine, please change IP to real server IP
  ```

- Modify the database configuration in *baetyl-cloud-configmap.yml*

### 2. Install baetyl-cloud

```shell
cd scripts/k8s
# k8s version is v1.16 or higher 
# k3s version is v1.17.4 or higher
kubectl apply -f ./apply/
# k8s version less than v1.16
# k3s version less than v1.17.4
kubectl apply -f ./apply_v1beta1/
```

After the execution is successful, you can execute `kubectl get pods |grep baetyl-cloud` command to check the program running status, and then you can operate the baetyl-cloud API via *http://0.0.0.0:30004*.
### 3. Install edge node

Call the RESTful API to create a node.

```shell
curl -d "{\"name\":\"demo-node\"}" -H "Content-Type: application/json" -X POST http://0.0.0.0:30004/v1/nodes
# {"namespace":"baetyl-cloud","name":"demo-node","version":"1931564","createTime":"2020-07-22T06:25:05Z","labels":{"baetyl-node-name":"demo-node"},"ready":false}
```

Obtain the online installation script of the edge node.

```shell
curl http://0.0.0.0:30004/v1/nodes/demo-node/init
# {"cmd":"curl -skfL 'https://0.0.0.0:30003/v1/active/setup.sh?token=f6d21baa9b7b2265223a333630302c226b223a226e6f6465222c226e223a2264656d6f2d6e6f6465222c226e73223a2262616574796c2d636c6f7564222c227473223a313539353430323132367d' -osetup.sh && sh setup.sh"}
```

Execute the installation script on the machine where baetyl-cloud is deployed.

```shell
curl -skfL 'https://0.0.0.0:30003/v1/active/setup.sh?token=f6d21baa9b7b2265223a333630302c226b223a226e6f6465222c226e223a2264656d6f2d6e6f6465222c226e73223a2262616574796c2d636c6f7564222c227473223a313539353430323132367d' -osetup.sh && sh setup.sh
```

**Note**: If you need to install an edge node on a device other than the machine where baetyl-cloud is deployed, please modify the database, change the node-address and active-address in the baetyl_system_config table to real addresses.

Check the status of the edge node. Eventually, two edge services will be in the Running state. You can also call the cloud RESTful API to view the edge node status. You can see that the edge node is online ("ready":true).

```shell
kubectl get pod -A
# NAMESPACE            NAME                                      READY   STATUS    RESTARTS   AGE
# baetyl-edge-system   baetyl-core-8668765797-4kt7r              1/1     Running   0          2m15s
# baetyl-edge-system   baetyl-function-5c5748957-nhn88           1/1     Running   0          114s

curl http://0.0.0.0:30004/v1/nodes/demo-node
# {"namespace":"baetyl-cloud","name":"demo-node","version":"1939112",...,"report":{"time":"2020-07-22T07:25:27.495362661Z","sysapps":...,"node":...,"nodestats":...,"ready":true}
```

### 4. Uninstall baetyl-cloud

```shell
cd scripts/k8s
# k8s version is v1.16 or higher 
# k3s version is v1.17.4 or higher
kubectl delete -f ./apply/
# k8s version less than v1.16
# k3s version less than v1.17.4
kubectl delete -f ./apply_v1beta1/
```

----

## Process installation

### 1. Install database

Install mysql database, and initialize the data as follows:

- Create 'baetyl_cloud' database and tables, see specific sql statement in: *scripts/sql/tables.sql*

- Initialize table data, see specific sql statement in : *scripts/sql/data.sql*

  ```shell
  # Note: modify the node-address and active-address in baetyl_system_config to real server address：
  # For example, if the service is deployed locally, the address can be configured as follows：
  # node-address : https://0.0.0.0:30005
  # active-address : https://0.0.0.0:30003
  # If the service is deployed on a non-local machine, please change IP to real server IP
  ```

- Modify the database configuration in *conf/cloud.yml*

### 2. Source code compilation

Refer [Source code compilation](../develop/build.md)

### 3. Install baetyl-cloud

```shell
# Import k8s crd resources
cd scripts/native

# k8s version is v1.16 or higher 
# k3s version is v1.17.4 or higher
kubectl apply -f ./apply/
# k8s version less than v1.16
# k3s version less than v1.17.4
kubectl apply -f ./apply_v1beta1/

# Execute the following command, replace example in the conf/kubeconfig.yml file
kubectl config view --raw
# Execute the following command
nohup ../../../output/baetyl-cloud -c ./conf/cloud.yml > /dev/null &
# After successful execution, it will return the successfully established baetyl-cloud process number
```

After successful execution, you can operate baetyl-cloud API via *http://0.0.0.0:9004*.
### 4. Install edge node

Call the RESTful API to create a node.

```shell
curl -d "{\"name\":\"demo-node\"}" -H "Content-Type: application/json" -X POST http://0.0.0.0:30004/v1/nodes
# {"namespace":"baetyl-cloud","name":"demo-node","version":"1931564","createTime":"2020-07-22T06:25:05Z","labels":{"baetyl-node-name":"demo-node"},"ready":false}
```

Obtain the online installation script of the edge node.

```shell
curl http://0.0.0.0:30004/v1/nodes/demo-node/init
# {"cmd":"curl -skfL 'https://0.0.0.0:30003/v1/active/setup.sh?token=f6d21baa9b7b2265223a333630302c226b223a226e6f6465222c226e223a2264656d6f2d6e6f6465222c226e73223a2262616574796c2d636c6f7564222c227473223a313539353430323132367d' -osetup.sh && sh setup.sh"}
```

Execute the installation script on the machine where baetyl-cloud is deployed.

```shell
curl -skfL 'https://0.0.0.0:30003/v1/active/setup.sh?token=f6d21baa9b7b2265223a333630302c226b223a226e6f6465222c226e223a2264656d6f2d6e6f6465222c226e73223a2262616574796c2d636c6f7564222c227473223a313539353430323132367d' -osetup.sh && sh setup.sh
```

**Note**: If you need to install an edge node on a device other than the machine where baetyl-cloud is deployed, please modify the database, change the node-address and active-address in the baetyl_system_config table to real addresses.

Check the status of the edge node. Eventually, two edge services will be in the Running state. You can also call the cloud RESTful API to view the edge node status. You can see that the edge node is online ("ready":true).

```shell
kubectl get pod -A
# NAMESPACE            NAME                                      READY   STATUS    RESTARTS   AGE
# baetyl-edge-system   baetyl-core-8668765797-4kt7r              1/1     Running   0          2m15s
# baetyl-edge-system   baetyl-function-5c5748957-nhn88           1/1     Running   0          114s

curl http://0.0.0.0:30004/v1/nodes/demo-node
# {"namespace":"baetyl-cloud","name":"demo-node","version":"1939112",...,"report":{"time":"2020-07-22T07:25:27.495362661Z","sysapps":...,"node":...,"nodestats":...,"ready":true}
```

### 5. Uninstall baetyl-cloud

```shell
# Kill the process according to the process number when the creation is successful:
sudo kill process number
```

