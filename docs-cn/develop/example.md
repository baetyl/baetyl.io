# OpenAPI调用示例

## 前言

在baetyl-cloud成功运行，并且你已经准备好了边缘k3s/k8s的运行环境后，就可以参考本章，调用baetyl-cloud的OpenAPI，来完成一个yolo图像识别应用的下发测试。

## 边缘节点

在前面一章中[baetyl-cloud安装](../develop/install.html)，我们成功在云端创建了名为`demo-node`的节点，并且在边缘安装了BIE的系统应用。

## 创建应用

本示例中使用了yolo v3提供的开源物体识别模型，详细信息请参考[yolo github](https://github.com/xwdreamer/video-analyzer/tree/main/edge-modules/extensions/yolo/yolov3/http-cpu)

调用云端OpenAPI的创建应用接口:

```shell
curl --location --request POST '127.0.0.1:30004/v1/apps' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "yolo",
    "type": "container",
    "description": "",
    "labels": {},
    "services": [
        {
            "name": "yolo",
            "baseName": "",
            "image": "registry.baidubce.com/azure/avaextension:http-yolov3-onnx-v1.0-amd64",
            "labels": {},
            "volumeMounts": [],
            "ports": [
                {
                    "serviceType": "ClusterIP",
                    "protocol": "TCP",
                    "containerPort": 8000,
                    "hostPort": 30011
                }
            ],
            "type": "deployment",
            "replica": 1,
            "jobConfig": {},
            "env": [],
            "command": [],
            "args": [],
            "devices": [],
            "resources": {
                "limits": {}
            },
            "hostNetwork": false,
            "security": {
                "privileged": false
            }
        }
    ],
    "initServices": [],
    "volumes": [],
    "registries": [],
    "jobConfig": {},
    "replica": 1,
    "hostNetwork": false,
    "workload": "deployment",
    "selector": "baetyl-node-mode=kube,baetyl-node-name=demo-node",
    "nodeSelector": "",
    "cronStatus": 0,
    "mode": "kube"
}'
```

上述请求中，我们创建了一个名为`yolo`的应用。通过image字段，指定了镜像地址为`registry.baidubce.com/azure/avaextension:http-yolov3-onnx-v1.0-amd64`，如果是arm机器，需要替换其中的amd为arm。

通过selector标签，将该应用绑定到了我们之前创建`demo-node`节点。

通过`services->ports`中，使用hostPort将该容器内的8000端口，映射到了宿主机的300011端口上。

## 边缘访问

在接口返回200后，等待一段时间，边缘执行`kubectl get pods -A|grep baetyl`，就可以看到yolo应用已经在边缘节点运行了。

```
baetyl-edge-system   baetyl-broker-ekfn7dr2d-67dfcbbbb5-h7cvp               1/1     Running   0          40s
baetyl-edge-system   baetyl-core-nj7riguvp-577dbbcc65-54cgg                 1/1     Running   0          52s
baetyl-edge-system   baetyl-init-6d75f56bf6-6grwv                           1/1     Running   0          64s
baetyl-edge          yolo-cd95b4dfb-hcjqt                                   1/1     Running   0          39s
```

此时，我们尝试使用下面的图片：

![创建节点1](../images/examples/car2.jpeg)

Http调用yolo的物体检测服务，注意替换其中图片文件的地址：

```shell
curl --location --request POST 'http://127.0.0.1:30011/score' \
--header 'Content-Type: image/jpeg' \
--data-binary '@/Desktop/car2.jpeg'
```

就能得到以下的物体识别结果：

```json
{
    "inferences": [
        {
            "type": "entity",
            "entity": {
                "tag": {
                    "value": "car",
                    "confidence": 0.9943568706512451
                },
                "box": {
                    "l": 0.2618702008174016,
                    "t": 0.3648386001586914,
                    "w": 0.07523943827702449,
                    "h": 0.060178206517146185
                }
            }
        }
    ]
}
```
