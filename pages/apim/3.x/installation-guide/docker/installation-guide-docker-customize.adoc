= Customize
:page-toc: false
:page-sidebar: apim_3_x_sidebar
:page-permalink: apim/3.x/apim_installation_guide_docker_customize.html
:page-folder: apim/installation-guide/docker
:page-layout: apim3x
:page-description: Gravitee.io API Management - Installation Guide - Docker - Customize
:page-keywords: Gravitee.io, API Management, apim, guide, manual, docker, customize, linux
:page-toc: false
:page-liquid:


== Overview

This section explains how to customize your Docker installation. These procedures are intended for users who are already familiar with Docker.

== Install an additional plugin

APIM Docker images contain the default plugins. In order to add a custom plugin, it needs to be in the folder mapped to the `plugins-ext` folder of the image. In our architecture that is in:

[source]
----
/gravitee/apim-gateway/plugins
/gravitee/apim-management-api/plugins
----

NOTE: Some plugins need to be installed on both the gateway and the management API. Please verify the specific plugin's documentation for the details.

=== Use Redis as the datastore for rate-limit counters

This requires a couple of additional environment parameters on starting the gateway container

[source]
----
  --env gravitee_ratelimit_type=redis \
  --env gravitee_ratelimit_redis_host=gravitee-redis \
  --env gravitee_ratelimit_redis_port=6379 \  
----

and you can then drop the equivalent parameter for mongodb

[source]
----
  --env gravitee_ratelimit_mongodb_uri="mongodb://gravitee-mongo:27017/gravitee-apim?serverSelectionTimeoutMS=5000&connectTimeoutMS=5000&socketTimeoutMS=5000" \
----

NOTE: Your hostname and port may differ!

=== Use JDBC connection as the datastore for management

This requires a couple of additional environment parameters on starting the gateway container

[source]
----
  --env gravitee_management_type=jdbc \
  --env gravitee_management_jdbc_url=jdbc:mysql://gravitee-mysql:3306/gravitee?useSSL=false&user=mysql_users&password=mysql_password \
----

and you can then drop the equivalent parameter for mongodb

[source]
----
  --env gravitee_management_mongodb_uri="mongodb://gravitee-mongo:27017/gravitee-apim?serverSelectionTimeoutMS=5000&connectTimeoutMS=5000&socketTimeoutMS=5000" \
----

NOTE: Your hostname and port may differ!
