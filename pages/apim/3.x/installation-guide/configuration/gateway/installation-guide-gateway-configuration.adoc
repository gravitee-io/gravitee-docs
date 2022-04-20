= Configure APIM Gateway
:page-sidebar: apim_3_x_sidebar
:page-permalink: apim/3.x/apim_installguide_gateway_configuration.html
:page-folder: apim/installation-guide/gateway
:page-description: Gravitee.io API Management - Configuration - Gateway
:page-keywords: Gravitee.io, API Platform, API Management, API Gateway, oauth2, openid, documentation, manual, guide, reference, api
:page-layout: apim3x

include::../../partial/how-to-configure.adoc[leveloffset=+1]

== `gravitee.yml` configuration

[[api-gateway-http-server]]
=== Configure HTTP Server

You configure the HTTP Server configuration in the following section of the `gravitee.yml` file:

[source,yaml]
----
http:
  port: 8082
  host: 0.0.0.0
  idleTimeout: 0
  tcpKeepAlive: true
  compressionSupported: false
  maxHeaderSize: 8192
  maxChunkSize: 8192
  instances: 0
  requestTimeout: 30000
  secured: false
  alpn: false
  ssl:
    clientAuth: none # Supports none, request, requires
    keystore:
      path: ${gravitee.home}/security/keystore.jks
      password: secret
    truststore:
      path: ${gravitee.home}/security/truststore.jks
      password: secret
----

==== Enable HTTPS support
First, you need to provide a keystore. If you do not have one, you can generate it:
----
keytool -genkey \
  -alias test \
  -keyalg RSA \
  -keystore server-keystore.jks \
  -keysize 2048 \
  -validity 360 \
  -dname CN=localhost \
  -keypass secret \
  -storepass secret
----

===== File keystore

You then need to enable secure mode in `gravitee.yml` and provide a path pointing to the keystore containing the certificate and the associated private key:
----
http:
  # ... skipped for simplicity
  secured: true
  ssl:
    clientAuth: none # Supports none, request, requires
    keystore:
      path: /path/to/keystore.jks
      password: adminadmin
    truststore:
      path:
      password:
----

NOTE: since APIM v3.13.0, the keystore file is automatically watched for any modifications and reloaded without having to restart the gateway server.

===== Kubernetes Secret/ConfigMap keystore

Since v3.14.0, it is possible to load the keystore directly from Kubernetes secret or configmap by just specifying the appropriate kubernetes location.

----
http:
  # ... skipped for simplicity
  secured: true
  ssl:
    clientAuth: none # Supports none, request, requires
    keystore:
      type: pkcs12
      kubernetes: /my-namespace/secrets/my-secret/keystore
      password: adminadmin
----

The expected `http.ssl.keystore.kubernetes` is structured as follows: `/{namespace}/{type}/{name}/{key}`
With:

- `namespace`: the name of the targeted Kubernetes namespace
- `type`: can be either `secrets` either `configmaps`, depending on the type of Kubernetes resources to retrieve
- `name`: the name of the secret or configmap to retrieve
- `key`: the name of the key holding the value to retrieve. The `key` is optional when using a standard `kubernetes.io/tls` secret (note: it only supports PEM cert & key). The `key` is mandatory for any `Opaque` secret or configmap (note: they only support JKS & PKC12 keystore type).

NOTE: The keystore (or PEM cert & key) stored in the Kubernetes secret or configmap is automatically watched for any modifications and reloaded without having to restart the gateway server.

==== Enable HTTP/2 support

First, enable HTTPS support as described in the section above.

You then need to enable `alpn` in `gravitee.yml`:
----
http:
  alpn: true
  ...
----

You can now consume your API with both HTTP/1 and HTTP/2 protocols:
----
curl -k -v --http2 https://localhost:8082/my_api
----

==== Enable WebSocket support
----
http:
  websocket:
    enabled: true
----

You can now consume your API with both WS and WSS protocols:
----
curl ws://localhost:8082/my_websocket
----


==== Enable certificate-based client authentication
----
http:
  ssl:
    clientAuth: none # Supports none, request, requires
    truststore:
      path: /path/to/truststore.jks
      password: adminadmin
----

Available modes for `clientAuth` are:

* none: Client authentication is disabled (replacement of the `false` value)
* request: Client authentication is not required but can be if using link:apim_policies_ssl_enforcement.html[SSL enforcement policy]
* requires: Client authentication is required (replacement of `true` value)

=== Configure the Plugins repository

You can configure the APIM Gateway link:{{ '/apim/3.x/apim_devguide_plugins.html' | relative_url }}[plugins] directory.

[source,yaml]
----
plugins:
  path: ${gravitee.home}/plugins
----

=== Configure the Management repository

The Management repository is used to store global configuration such as APIs, applications and apikeys.
The default configuration uses MongoDB (single server). For more information about MongoDB configuration, see:

http://api.mongodb.org/java/current/com/mongodb/MongoClientOptions.html[window=\"_blank\"]

[source,yaml]
----
management:
  type: mongodb
  mongodb:
    dbname: ${ds.mongodb.dbname}
    host: ${ds.mongodb.host}
    port: ${ds.mongodb.port}
#    username:
#    password:
#    connectionsPerHost: 0
#    connectTimeout: 500
#    maxWaitTime: 120000
#    socketTimeout: 500
#    socketKeepAlive: false
#    maxConnectionLifeTime: 0
#    maxConnectionIdleTime: 0
#    serverSelectionTimeout: 0
#    description: gravitee.io
#    heartbeatFrequency: 10000
#    minHeartbeatFrequency: 500
#    heartbeatConnectTimeout: 1000
#    heartbeatSocketTimeout: 20000
#    localThreshold: 15
#    minConnectionsPerHost: 0
#    threadsAllowedToBlockForConnectionMultiplier: 5
#    cursorFinalizerEnabled: true
## SSL settings (Available in APIM 3.10.14+, 3.15.8+, 3.16.4+, 3.17.2+, 3.18+)
#    sslEnabled:
#    keystore:
#      path:
#      type:
#      password:
#      keyPassword:
#    truststore:
#      path:
#      type:
#      password:
## Deprecated SSL settings that will be removed in 3.19.0
#    sslEnabled:
#    keystore:
#    keystorePassword:
#    keyPassword:

# Management repository: single MongoDB using URI
# For more information about MongoDB configuration using URI, please have a look to:
# - http://api.mongodb.org/java/current/com/mongodb/MongoClientURI.html
#management:
#  type: mongodb
#  mongodb:
#    uri: mongodb://[username:password@]host1[:port1][,host2[:port2],...[,hostN[:portN]]][/[database][?options]]

# Management repository: clustered MongoDB
#management:
#  type: mongodb
#  mongodb:
#    servers:
#      - host: mongo1
#        port: 27017
#      - host: mongo2
#        port: 27017
#    dbname: ${ds.mongodb.dbname}
#    connectTimeout: 500
#    socketTimeout: 250
----

=== Configure the Rate Limit repository

When defining the <</apim_policies_rate_limiting.html, rate-limiting policy>>, APIM Gateway needs to store data to share with other APIM Gateway instances.

For Management repositories, you can define a custom prefix for the Rate Limit table or collection name.

==== Store counters in MongoDB

NOTE: If you want to use a custom prefix, you need to follow the following link:apim_installguide_repositories_mongodb.html#use_a_custom_prefix[instructions^].

[source,yaml]
----
ratelimit:
  type: mongodb
  mongodb:
    uri: mongodb://${ds.mongodb.host}/${ds.mongodb.dbname}
    prefix: # collection prefix
----

==== Store counters in JDBC

NOTE: If you want to use a custom prefix, you need to follow the following link:apim_installguide_repositories_jdbc.html#use_a_custom_prefix[instructions^].

[source,yaml]
----
ratelimit:
  type: jdbc
  jdbc:
    url: jdbc:postgresql://host:port/dbname
    password: # password
    username: # username
    prefix:   # collection prefix
----

=== Configure the Reporters

You can configure various aspects of reporters, such as reporting monitoring data, request metrics and health checks.
All reporters are enabled by default. To stop a reporter, you need to add the property 'enabled: false'

[source,yaml]
----
reporters:
  elasticsearch:
    endpoints:
      - http://localhost:9200
#    index: gravitee
#    bulk:
#       actions: 500           # Number of requests action before flush
#       flush_interval: 1      # Flush interval in seconds
#    security:
#       username:
#       password:
----

=== Configure services

You can update the default APIM Gateway default values. All services are enabled by default. To stop a service, you need to add the property 'enabled: false' (you can see an example in the 'local' service).

[source,yaml]
----
services:
  # Synchronization daemon used to keep the gateway state in sync with the configuration from the management repository
  # Be aware that, by disabling it, the gateway will not be sync with the configuration done through management API and management UI
  sync:
    # Synchronization is done each 5 seconds
    cron: '*/5 * * * * *'

  # Service used to store and cache api-keys from the management repository to avoid direct repository communication
  # while serving requests.
  apikeyscache:
    delay: 10000
    unit: MILLISECONDS
    threads: 3 # Threads core size used to retrieve api-keys from repository.

  # Local registry service.
  # This registry is used to load API Definition with json format from the file system. By doing so, you do not need
  # to configure your API using the web console or the rest API (but you need to know and understand the json descriptor
  # format to make it work....)
  local:
    enabled: false
    path: ${gravitee.home}/apis # The path to API descriptors

  # Gateway monitoring service.
  # This service retrieves metrics like os / process / jvm metrics and send them to an underlying reporting service.
  monitoring:
    delay: 5000
    unit: MILLISECONDS

  # Endpoint healthcheck service.
  healthcheck:
    threads: 3 # Threads core size used to check endpoint availability
----

=== Configure sharding tags

You can apply sharding on APIM Gateway instances either at the system property level or with `gravitee.yml`.

In this example, we are configuring deployment only for APIs tagged as `product` or `store` and of those, we are excluding APIs tagged as `international`.

[source,yaml]
----
tags: 'product,store,!international'
----

=== Configure organizations and environments

You can configure organizations and environments using their `hrids` on APIM Gateway instances either at the system property level or with `gravitee.yml`.

Only APIs and dictionaries belonging to the configured organizations and environments will be loaded.

If only `organizations` configuration is set, then all environments belonging to these organizations are used.
If only `environments` configuration is set, then all environments matching the setting will be used, regardless their organization.
If both `organizations` and `environments` are set, all environments matching the setting and belonging to these organizations will be used.
If none of these fields is set, then all organizations and environment are used.

In this example, we are configuring deployment only for `dev` and `integration` environments for `mycompany` organization.

[source,yaml]
----
organizations: mycompany
environments: dev,integration
----

=== Default configuration

You can configure various default properties of APIM Gateway in your `gravitee.yml` file.

[source,yaml]
----
include::https://raw.githubusercontent.com/gravitee-io/gravitee-api-management/{{ site.products.apim._3x.version }}/gravitee-apim-gateway/gravitee-apim-gateway-standalone/gravitee-apim-gateway-standalone-distribution/src/main/resources/config/gravitee.yml[]
----
