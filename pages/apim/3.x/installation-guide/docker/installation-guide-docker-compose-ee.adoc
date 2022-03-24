= Docker Compose Installation
:page-sidebar: apim_3_x_sidebar
:page-permalink: apim/3.x/apim_installation_guide_docker_compose_ee.html
:page-folder: apim/installation-guide/docker
:page-layout: apim3x
:page-description: Gravitee.io API Management - Installation Guide - Docker - Compose - Enterprise Edition
:page-keywords: Gravitee.io, API Management, apim, guide, manual, docker, compose, linux, enterprise edition, ee
:page-toc: false
:page-liquid:
:table-caption!:

// author: Tom Geudens

== Setup
Before you can get into the actual installation, a couple of things need to be set up

. *Docker*
+
Is assumed to be installed.

. *Docker Compose*
+
Is assumed to be installed.

. *Persistence*
+
Containers are great, but you do want persistence in case they need to be restarted. You are going to persist the MongoDB data, the Elasticsearch data and provide locations for additional plugins (both for the Gateway and the REST API). It is assumed in this page that these will live under a filesystem mounted at `/gravitee` on the host system. 
+
[source,bash]
----
mkdir /gravitee/mongodb
mkdir /gravitee/mongodb/data
mkdir /gravitee/elasticsearch
mkdir /gravitee/elasticsearch/data
mkdir /gravitee/apim-gateway
mkdir /gravitee/apim-gateway/plugins
mkdir /gravitee/apim-gateway/logs
mkdir /gravitee/apim-management-api
mkdir /gravitee/apim-management-api/plugins
mkdir /gravitee/apim-management-api/logs
mkdir /gravitee/apim-management-ui
mkdir /gravitee/apim-management-ui/logs
mkdir /gravitee/apim-portal-ui
mkdir /gravitee/apim-portal-ui/logs
----

. *License*
+
The Enterprise installation assumes you have a license. For more information on getting one, check https://www.gravitee.io/pricing. It is assumed below that you have a `/gravitee/license.key` file.

NOTE: As was indicated before, your architecture may differ and thus require a different setup.

== Compose
First you need to download the *docker-compose.yml* file.
[source,bash]
----
curl -L https://raw.githubusercontent.com/gravitee-io/gravitee-docker/master/apim/3.x/docker-compose.yml -o "docker-compose.yml"
----

Next you should create an environment file (`.env`) that overrides the default product versions in the compose file with those for the Enterprise edition.
[source]
----
APIM_VERSION={{ site.products.apim._3x.version }}-ee
----

And then you should *modify* the docker-compose.yml file to match your own architecture and preferences. You'll find a reference to each part of the compose file below and the changes necessary to match our basic architecture.

NOTE: You *must* make at least the changes that provide the `license.key` file to the containers.

Once you are happy with things ... start the whole setup in one go
[source,bash]
----
docker-compose up -d 
----

== Reference - Volumes
In the file you'll find this ...
[source,yaml]
----
volumes:
  data-elasticsearch:
  data-mongo:
----

As we are using a plain filesystem at `/gravitee`, you can *remove* those lines.

== Reference - MongoDB
In the file you'll find this ...
[source,yaml]
----
  mongodb:
    image: mongo:${MONGODB_VERSION:-3.6}
    container_name: gio_apim_mongodb
    restart: always
    volumes:
      - data-mongo:/data/db
      - ./logs/apim-mongodb:/var/log/mongodb
    networks:
      - storage
----

And you turn it into this
[source,yaml]
----
  mongodb:
    image: mongo:${MONGODB_VERSION:-3.6}
    container_name: gio_apim_mongodb
    restart: always
    volumes:
      - /gravitee/mongodb/data:/data/db
    networks:
      - storage
----

NOTE: Accessing the logs of the MongoDB container should be done through `docker logs gio_apim_mongodb`.

== Reference - Elasticsearch
In the file you'll find this ...
[source,yaml]
----
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:${ELASTIC_VERSION:-7.7.0}
    container_name: gio_apim_elasticsearch
    restart: always
    volumes:
      - data-elasticsearch:/usr/share/elasticsearch/data
    environment:
      - http.host=0.0.0.0
      - transport.host=0.0.0.0
      - xpack.security.enabled=false
      - xpack.monitoring.enabled=false
      - cluster.name=elasticsearch
      - bootstrap.memory_lock=true
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ulimits:
      memlock:
        soft: -1
        hard: -1
      nofile: 65536
    networks:
      - storage
----

And you turn it into this
[source,yaml]
----
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:${ELASTIC_VERSION:-7.7.0}
    container_name: gio_apim_elasticsearch
    restart: always
    volumes:
      - /gravitee/elasticsearch/data:/usr/share/elasticsearch/data
    environment:
      - http.host=0.0.0.0
      - transport.host=0.0.0.0
      - xpack.security.enabled=false
      - xpack.monitoring.enabled=false
      - cluster.name=elasticsearch
      - bootstrap.memory_lock=true
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ulimits:
      memlock:
        soft: -1
        hard: -1
      nofile: 65536
    networks:
      - storage
----

NOTE: Accessing the logs of the Elasticsearch container should be done through `docker logs gio_apim_elasticsearch`

== Reference - API Management Gateway
In the file you'll find this ...
[source,yaml]
----
  gateway:
    image: graviteeio/apim-gateway:${APIM_VERSION:-3}
    container_name: gio_apim_gateway
    restart: always
    ports:
      - "8082:8082"
    depends_on:
      - mongodb
      - elasticsearch
    volumes:
      - ./logs/apim-gateway:/opt/graviteeio-gateway/logs
    environment:
      - gravitee_management_mongodb_uri=mongodb://mongodb:27017/gravitee?serverSelectionTimeoutMS=5000&connectTimeoutMS=5000&socketTimeoutMS=5000
      - gravitee_ratelimit_mongodb_uri=mongodb://mongodb:27017/gravitee?serverSelectionTimeoutMS=5000&connectTimeoutMS=5000&socketTimeoutMS=5000
      - gravitee_reporters_elasticsearch_endpoints_0=http://elasticsearch:9200
    networks:
      - storage
      - frontend
----

And you turn it into this
[source,yaml]
----
  gateway:
    image: graviteeio/apim-gateway:${APIM_VERSION:-3}
    container_name: gio_apim_gateway
    restart: always
    ports:
      - "8082:8082"
    depends_on:
      - mongodb
      - elasticsearch
    volumes:
      - /gravitee/apim-gateway/logs:/opt/graviteeio-gateway/logs
      - /gravitee/apim-gateway/plugins:/opt/graviteeio-gateway/plugins-ext
      - /gravitee/license.key:/opt/graviteeio-gateway/license/license.key      
    environment:
      - gravitee_management_mongodb_uri=mongodb://mongodb:27017/gravitee?serverSelectionTimeoutMS=5000&connectTimeoutMS=5000&socketTimeoutMS=5000
      - gravitee_ratelimit_mongodb_uri=mongodb://mongodb:27017/gravitee?serverSelectionTimeoutMS=5000&connectTimeoutMS=5000&socketTimeoutMS=5000
      - gravitee_reporters_elasticsearch_endpoints_0=http://elasticsearch:9200
      - gravitee_plugins_path_0=/opt/graviteeio-gateway/plugins
      - gravitee_plugins_path_1=/opt/graviteeio-gateway/plugins-ext
    networks:
      - storage
      - frontend
----

== Reference - API Management REST API
In the file you'll find this ...
[source,yaml]
----
  management_api:
    image: graviteeio/apim-management-api:${APIM_VERSION:-3}
    container_name: gio_apim_management_api
    restart: always
    ports:
      - "8083:8083"
    links:
      - mongodb
      - elasticsearch
    depends_on:
      - mongodb
      - elasticsearch
    volumes:
      - ./logs/apim-management-api:/opt/graviteeio-management-api/logs
    environment:
      - gravitee_management_mongodb_uri=mongodb://mongodb:27017/gravitee?serverSelectionTimeoutMS=5000&connectTimeoutMS=5000&socketTimeoutMS=5000
      - gravitee_analytics_elasticsearch_endpoints_0=http://elasticsearch:9200
    networks:
      - storage
      - frontend
----

And you turn it into this
[source,yaml]
----
  management-api:
    image: graviteeio/apim-management-api:${APIM_VERSION:-3}
    container_name: gio_apim_management_api
    restart: always
    ports:
      - "8083:8083"
    depends_on:
      - mongodb
      - elasticsearch
    volumes:
      - /gravitee/apim-management-api/logs:/opt/graviteeio-management-api/logs
      - /gravitee/apim-management-api/plugins:/opt/graviteeio-management-api/plugins-ext
      - /gravitee/license.key:/opt/graviteeio-management-api/license/license.key      
    environment:
      - gravitee_management_mongodb_uri=mongodb://mongodb:27017/gravitee?serverSelectionTimeoutMS=5000&connectTimeoutMS=5000&socketTimeoutMS=5000
      - gravitee_analytics_elasticsearch_endpoints_0=http://elasticsearch:9200
      - gravitee_plugins_path_0=/opt/graviteeio-management-api/plugins
      - gravitee_plugins_path_1=/opt/graviteeio-management-api/plugins-ext
    networks:
      - storage
      - frontend
----

== Reference - API Management Management UI
In the file you'll find this ...
[source,yaml]
----
  management_ui:
    image: graviteeio/apim-management-ui:${APIM_VERSION:-3}
    container_name: gio_apim_management_ui
    restart: always
    ports:
      - "8084:8080"
    depends_on:
      - management_api
    environment:
      - MGMT_API_URL=http://localhost:8083/management/organizations/DEFAULT/environments/DEFAULT/
    volumes:
      - ./logs/apim-management-ui:/var/log/nginx
    networks:
      - frontend
----

And you turn it into this
[source,yaml]
----
  management-ui:
    image: graviteeio/apim-management-ui:${APIM_VERSION:-3}
    container_name: gio_apim_management_ui
    restart: always
    ports:
      - "8084:8080"
    depends_on:
      - management-api
    environment:
      - MGMT_API_URL=http://localhost:8083/management/organizations/DEFAULT/environments/DEFAULT/
    volumes:
      - /gravitee/apim-management-ui/logs:/var/log/nginx
    networks:
      - frontend
----

== Reference - API Management Portal UI
In the file you'll find this ...
[source,yaml]
----
  portal_ui:
    image: graviteeio/apim-portal-ui:${APIM_VERSION:-3}
    container_name: gio_apim_portal_ui
    restart: always
    ports:
      - "8085:8080"
    depends_on:
      - management_api
    environment:
      - PORTAL_API_URL=http://localhost:8083/portal/environments/DEFAULT
    volumes:
      - ./logs/apim-portal-ui:/var/log/nginx
    networks:
      - frontend
----

And you turn it into this
[source,yaml]
----
  portal-ui:
    image: graviteeio/apim-portal-ui:${APIM_VERSION:-3}
    container_name: gio_apim_portal_ui
    restart: always
    ports:
      - "8085:8080"
    depends_on:
      - management-api
    environment:
      - PORTAL_API_URL=http://localhost:8083/portal/environments/DEFAULT
    volumes:
      - /gravitee/apim-portal-ui/logs:/var/log/nginx
    networks:
      - frontend
----
