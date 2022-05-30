[[gravitee-installation-repositories-elasticsearch]]
= Elasticsearch
:page-sidebar: apim_3_x_sidebar
:page-permalink: apim/3.x/apim_installguide_repositories_elasticsearch.html
:page-folder: apim/installation-guide/repositories
:page-description: Gravitee.io API Management - Repositories - Elasticsearch
:page-keywords: Gravitee.io, API Platform, API Management, API Gateway, oauth2, openid, documentation, manual, guide, reference, api, elastic, es, elasticsearch, ilm
:page-layout: apim3x

The Elasticsearch connector is based on the HTTP API exposed by ES instances.
This connector supports all versions of ES, from 5.x to 7.x, and OpenSearch v1.x.

You can find more detail about supported versions of ElasticSearch at https://www.elastic.co/support/eol.

WARNING: Gravitee.io no longer supports native ES client. Previous connectors provided by us are no longer supported.

== Configuration

=== APIM API configuration

WARNING: The Elasticsearch client does not support URL schemes in format `http://USERNAME:PASSWORD@server.org`. You must provide the username and password using the `analytics.elasticsearch.security.username` and `analytics.elasticsearch.security.password` properties.

[source,yaml]
----
analytics:
  type: elasticsearch
  elasticsearch:
    endpoints:
      - http://localhost:9200
#    index: gravitee
#    index_mode: daily    # "daily" indexes, suffixed with date. Or "ilm" managed indexes, without date
#    security:
#       username:
#       password:
#    ssl:                        # for https es connection
#      keystore:
#        type: jks               # required. also valid values are "pem", "pfx"
#        path: path/to/jks         # only for only for jks / pkcs12
#        password: <keystore pass> # only for only for jks / pkcs12
#        certs: 'path/to/cert'      # only for pems
#        keys: 'path/to/key'        # only for pems
----

=== API Gateway configuration
[source,yaml]
----
reporters:
  elasticsearch:
    enabled: true # Is the reporter enabled or not (default to true)
    endpoints:
      - http://${ds.elastic.host}:${ds.elastic.port}
#    index: gravitee
#    index_mode: daily    # "daily" indexes, suffixed with date. Or "ilm" managed indexes, without date
#    cluster: elasticsearch
#    bulk:
#      actions: 1000           # Number of requests action before flush
#      flush_interval: 5       # Flush interval in seconds
#      concurrent_requests: 5  # Concurrent requests
#    settings:
#      number_of_shards: 5
#      number_of_replicas: 1
#    pipeline:
#      plugins:
#        ingest: geoip
#    ssl:                        # for https es connection
#      keystore:
#        type: jks               # required. also valid values are "pem", "pfx"
#        path: path/to/jks         # only for only for jks / pkcs12
#        password: <keystore pass> # only for only for jks / pkcs12
#        certs: 'path/to/cert'      # only for pems
#        keys: 'path/to/key'        # only for pems
----

== Index management with ES Curator

ES Curator is a great tool for ES administration.
For optimizing data footprint and ES performance you can define a retention window and periodically merge shards into only one segment.

[source,bash]
----
/usr/bin/curator --config /opt/curator/curator.yml /opt/curator/action-curator.yml
----

curator.yml :
[source,yaml]
----
client:
  hosts:
    - node1
    - node2
  port: 9200

logging:
  loglevel: INFO
  logfile:
  logformat: default
  blacklist: ['elasticsearch', 'urllib3']
----

action-curator.yml :
[source,yaml]
----
actions:
  1:
    action: forcemerge
    description: "Perform a forceMerge on selected indices to 'max_num_segments' per shard. Merge Days - 1 index for optimize disk space footprint on Elasticsearch TS"
    options:
      max_num_segments: 1
      continue_if_exception: True
      ignore_empty_list: True
    filters:
    - filtertype: pattern
      kind: prefix
      value: '^(gravitee-).*$'
      exclude: False
    - filtertype: age
      source: name
      direction: older
      unit: days
      unit_count: 1
      timestring: '%Y.%m.%d'
  2:
    action: delete_indices
    description: "Delete selected indices older than 15d days"
    options:
      continue_if_exception: True
      ignore_empty_list: True
    filters:
    - filtertype: pattern
      kind: prefix
      value: '^(gravitee-).*$'
      exclude: False
    - filtertype: age
      source: name
      direction: older
      unit: days
      unit_count: 15
      timestring: '%Y.%m.%d'
----

NOTE: If you deploy ES Curator on every ES data node, you need to set `master_only: True` in the curator configuration file.
This ensures the curator is run only once on the elected current master.

== Index management with ES ILM

IMPORTANT: To use ILM feature you need to use at least version 3.8.5 (for APIM 3.10.x) or 3.12.1 of the plugin (for APIM 3.15.x and upper).

You can configure Index Lifecycle Management (ILM) policies to automatically manage indices according to your retention requirements.
For example, you can use ILM to create a new index each day and archive the previous ones.
You can check the documentation https://www.elastic.co/guide/en/elasticsearch/reference/current/set-up-lifecycle-policy.html#ilm-create-policy[here] for more information.

By default, the `index_mode` configuration value is `daily`: Gravitee suffixes index names with the date.

If you want to let ILM handles that, you can set `index_mode` to `ILM`. Gravitee will no longer adds a suffix to index names.

You also need to tell your APIM Gateway which ILM policies to use.

Here's an example of configuration for APIM Gateway:
```yaml
  elasticsearch:
    enabled: true # Is the reporter enabled or not (default to true)
    endpoints:
      - http://${ds.elastic.host}:${ds.elastic.port}
    lifecycle:
      policies:
        health: hot_delete_health # ILM policy for the gravitee-health-* indexes
        monitor: hot_delete_monitor # ILM policy for the gravitee-monitor-* indexes
        request: hot_delete_request # ILM policy for the gravitee-request-* indexes
        log: hot_delete_log # ILM policy for the gravitee-log-* indexes
    index_mode: ilm         # "daily" indexes, suffixed with date. Or "ilm" managed indexes, without date
```

