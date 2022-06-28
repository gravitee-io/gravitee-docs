= MongoDB
:page-sidebar: apim_3_x_sidebar
:page-permalink: apim/3.x/apim_installguide_repositories_mongodb.html
:page-folder: apim/installation-guide/repositories
:page-description: Gravitee.io API Management - Repositories - MongoDB
:page-keywords: Gravitee.io, API Platform, API Management, API Gateway, oauth2, openid, documentation, manual, guide, reference, api
:page-layout: apim3x

== Supported versions

|===
|APIM Version |Version tested | APIM plugin

|1.30.x to 3.9.x
|3.6 / 4.0 / 4.2
.2+^.^|https://download.gravitee.io/#graviteeio-apim/plugins/repositories/gravitee-apim-repository-mongodb/[Download the same version as your APIM platform, window=\"_blank\"]

|3.10.x
|3.6 / 4.0 / 4.2 / 4.4
|===

== Configuration
https://www.mongodb.org/[MongoDB, window=\"_blank\"] is the default repository implementation used by APIM.

=== Mandatory configuration

[source,yaml]
----
# ===================================================================
# MINIMUM MONGO REPOSITORY PROPERTIES
#
# This is a minimal sample file declared connection to MongoDB
# ===================================================================
management:
  type: mongodb             # repository type
  mongodb:                  # mongodb repository
    dbname:                 # mongodb name (default gravitee)
    host:                   # mongodb host (default localhost)
    port:                   # mongodb port (default 27017)
----

=== Optional configuration

The example above shows the minimum configuration required to get started with a MongoDB database. You can configure the following additional properties to customize the behavior of a MongoDB database.

[source,yaml]
----
# ===================================================================
# MONGO REPOSITORY PROPERTIES
#
# This is a sample file declared all properties for MongoDB Repository
# ===================================================================
management:
  type: mongodb                 # repository type
  mongodb:                      # mongodb repository
    prefix:                     # collections prefix
    dbname:                     # mongodb name (default gravitee)
    host:                       # mongodb host (default localhost)
    port:                       # mongodb port (default 27017)

## Client settings
    description:                # mongodb description (default gravitee.io)
    username:                   # mongodb username (default null)
    password:                   # mongodb password (default null)
    authSource:                 # mongodb authentication source (when at least a user or a password is defined, default gravitee)
    readPreference:              # possible values are 'nearest', 'primary', 'primaryPreferred', 'secondary', 'secondaryPreferred'
    readPreferenceTags:          # list of read preference tags (https://docs.mongodb.com/manual/core/read-preference-tags/#std-label-replica-set-read-preference-tag-sets)
### Write concern
    writeConcern:               # possible values are 1,2,3... (the number of node) or 'majority' (default is 1)
    wtimeout:                   # (default is 0)
    journal:                    # (default is true)

## Socket settings
    connectTimeout:             # mongodb connection timeout (default 1000)
    socketTimeout:              # mongodb socket timeout (default 1000)

## Cluster settings
    serverSelectionTimeout:     # mongodb server selection timeout (default 1000)
    localThreshold:             # mongodb local threshold (default 15)

## Connection pool settings
    maxWaitTime:                # mongodb max wait time (default 120000)
    maxConnectionLifeTime:      # mongodb max connection life time (default 0)
    maxConnectionIdleTime:      # mongodb max connection idle time (default 0)
    connectionsPerHost:         # mongodb max connections per host (default 100)
    minConnectionsPerHost:      # mongodb min connections per host (default 0)

## Server settings
    heartbeatFrequency:         # mongodb heartbeat frequency (default 10000)
    minHeartbeatFrequency:      # mongodb min heartbeat frequency (default 500)

## SSL settings (Available in APIM 3.10.14+, 3.15.8+, 3.16.4+, 3.17.2+, 3.18+)
    sslEnabled:                 # mongodb ssl mode (default false)
    keystore:
      path:                     # Path to the keystore (when sslEnabled is true, default null)
      type:                     # Type of the keystore, supports jks, pem, pkcs12 (when sslEnabled is true, default null)
      password:                 # KeyStore password (when sslEnabled is true, default null)
      keyPassword:              # Password for recovering keys in the KeyStore (when sslEnabled is true, default null)
    truststore:
      path:                     # Path to the truststore (when sslEnabled is true, default null)
      type:                     # Type of the truststore, supports jks, pem, pkcs12 (when sslEnabled is true, default null)
      password:                 # Truststore password (when sslEnabled is true, default null)
## Deprecated SSL settings that will be removed in 3.19.0
    sslEnabled:                 # mongodb ssl mode (default false)
    keystore:                   # path to KeyStore (when sslEnabled is true, default null)
    keystorePassword:           # KeyStore password (when sslEnabled is true, default null)
    keyPassword:                # password for recovering keys in the KeyStore (when sslEnabled is true, default null)
----

[WARNING]
====
From version 3.10.0, Gravitee.io APIM uses the 4.1.2 version of the Java Driver. Therefore, some settings are no longer available.

`threadsAllowedToBlockForConnectionMultiplier` and `socketKeepAlive` have been deprecated in 3.12 and removed in 4.0.

`heartbeatConnectTimeout` and `heartbeatSocketTimeout` can't be used to configure the `MongoClient` object. Instead, `connectTimeout` and `socketTimeout` values are used to configure the heartbeat.

`cursorFinalizerEnabled` has been removed.

See: +
https://mongodb.github.io/mongo-java-driver/3.12/javadoc/com/mongodb/MongoClientOptions.html#getThreadsAllowedToBlockForConnectionMultiplier()

https://mongodb.github.io/mongo-java-driver/3.12/javadoc/com/mongodb/MongoClientOptions.html#isSocketKeepAlive()

https://github.com/mongodb/mongo-java-driver/blob/master/driver-core/src/main/com/mongodb/MongoClientSettings.java#L807-L814
====

[[use_a_custom_prefix]]
== Use a custom prefix

From APIM 3.7, you can use a custom prefix for your collection names. This is useful if you want to use the same databases for APIM and AM, for example.

=== On a new installation

If you are installing APIM for the first time, you need to update the following two values in the APIM Gateway and APIM API `gravitee.yml` files:

* `management.mongodb.prefix`
* `ratelimit.mongodb.prefix`

By default, these values are empty.

=== Migrating an existing installation

NOTE: Before running any scripts, you must create a dump of your existing database. You need to repeat these steps on both APIM Gateway and APIM API.

. To prefix your collections, you need to rename them. You can use following https://raw.githubusercontent.com/gravitee-io/gravitee-api-management/master/gravitee-apim-repository/gravitee-apim-repository-mongodb/src/main/resources/scripts/3.7.0/1-rename-collections-with-prefix.js[this script^], which renames all the collections by adding a prefix and rateLimitPrefix of your choice.
. Update values `management.mongodb.prefix` and `ratelimit.mongodb.prefix` in the `gravitee.yml` file.

== Index

You can create an index using the https://github.com/gravitee-io/gravitee-api-management/blob/master/gravitee-apim-repository/gravitee-apim-repository-mongodb/src/main/resources/scripts/create-index.js[script, window=\"_blank\"] available from our MongoDB GitHub repository.
You must use the correct version of this script for the version of APIM you are running.

NOTE: If you use a custom prefix for collections, do not forget to set it on the first line of the script.

== Security

Sometimes you need to apply specific security constraints and rules to users accessing your database.
The following table summarizes how to define fine-grained constraints per collection.

|===
|Component|Read-only |Read-write

|APIM Gateway
|apis - keys - subscriptions - plans | events - ratelimit - commands

|APIM API
|- | all collections except ratelimit

|===
