# Configuration Interpretation

## baetyl-cloud configuration

The default configuration file is `etc/baetyl/service.yml` in the working directory, and the configuration definition is as follows:

```yaml
adminServer:
  port: #The management server port

nodeServer:
  port: #The server port for edge-cloud synchronization
  ca: #The server root ca certificate file
  cert: #The server certificate file
  key: #The Server certificate's key file

activeServer:
  port: #The server port for device activate
  ca: #The server root ca certificate file
  cert: #The server certificate file
  key: #The Server certificate's key file

plugin: #In baetyl-cloud design, auth, lincese, pki, shadow, and model storage are implemented in the form of plug-ins, supporting customization
  auth: #Authentication plugin, defaultauth is used by default, no authentication
  license: #license plugin, defaultlicense is used by default, no license check.
  pki: #Certificate management plugin, defaultpki is used by default, self-signed certificate.
  shadow: #Shadow storage plugin, database is used by default.
  modelStorage: #CRD storage plugin, kubernetes  is used by default.
  databaseStorage: #Database configuration, database  is used by default.

logger:
  filename: #Log file 
  level: #Log level

kubernetes:
  inCluster: #Whether to use k8s cluster configuration, true is used, false is not used
  configPath: #When inCluster is false, configure the k8s configuration file

database:
  type: #Which Database to be chosed, such as mysql, sqlite3, etc.
  url: #The database connection url

defaultpki:
  rootCAFile: #Root certificate path, used to issue the root certificate of the connection certificate between the node and the cloud,
  rootCAKeyFile: #Root certificate key file path, used to sign the key file of the connection certificate between the node and the cloud
  persistent:
    kind: #Storage type Default database: database
    database:
      type: #Which Database to be used, like mysql, sqlite3, etc.
      url: #The database connection url
      
defaultauth:
  namespace: #The namespace for baetyl-cloud, default is baetyl-cloud
  keyFile: # The secret key file, sign the token for the node installation script

```
