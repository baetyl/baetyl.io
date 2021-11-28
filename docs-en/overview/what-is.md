# What is Baetyl

**[Baetyl](https://baetyl.io) is an open edge computing framework of
[Linux Foundation Edge](https://www.lfedge.org) that extends cloud computing,
data and service seamlessly to edge devices.** It can provide temporary offline, low-latency computing services include device connection, message routing, remote synchronization, function computing, video capture, AI inference, status reporting, configuration ota etc.

Baetyl v2 provides a new edge cloud integration platform, which adopts cloud management and edge operation solutions, and is divided into [**Edge Computing Framework**](https://github.com/baetyl/baetyl) and [**Cloud Management Suite**](https://github.com/baetyl/baetyl-cloud) supports varius deployment methods. It can manage all resources in the cloud, such as nodes, applications, configuration, etc., and automatically deploy applications to edge nodes to meet various edge computing scenarios. It is especially suitable for emerging strong edge devices, such as AI all-in-one machines and 5G roadside boxes.

The main differences between v2 and v1 versions are as follows:
* Edge and cloud frameworks have all evolved to cloud native, and already support running on K8S or K3S.
* Introduce declarative design, realize data synchronization (OTA) through shadow (Report/Desire).
* The edge framework does not support native process mode currently. Since it runs on K3S, the overall resource overhead will increase.
* The edge framework will support edge node clusters in the future.
