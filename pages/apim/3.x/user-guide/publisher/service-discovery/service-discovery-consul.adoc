= HashiCorp Consul Service Discovery
:page-sidebar: apim_3_x_sidebar
:page-permalink: apim/3.x/apim_service_discovery_consul.html
:page-folder: apim/user-guide/publisher/service-discovery
:page-layout: apim3x
:page-title: HashiCorp Consul Service Discovery

// include::https://raw.githubusercontent.com/gravitee-io/gravitee-service-discovery-consul/master/README.adoc[]

== Introduction

https://www.consul.io[HashiCorp Consul^] is a service mesh solution providing a full featured control plane with service discovery, configuration, and segmentation functionality.

. *Service Discovery*: One of the main goals of service discovery is to provide a catalog of available services and to potentially associate it with a health check. Clients of HashiCorp Consul can register a service, such as a backend api, and other clients can use HashiCorp Consul to discover providers of a given service. Using either DNS or HTTP, applications can easily find the services they depend upon.

. *Health Checking*: HashiCorp Consul clients can provide any number of health checks, either associated with a given service ("is the webserver returning 200 OK"), or with the local node ("is memory utilization below 90%"). This information is used by the service discovery components to route traffic away from unhealthy hosts.

*Gravitee.io Service discovery for HashiCorp Consul allows you to bind the backend endpoints of your API to a service managed by HashiCorp Consul so that API requests are always routed to the proper, healthy backend service dynamically managed by HashiCorp Consul.*

== Prerequisites

We will be using docker-compose to setup an integration between Gravitee.io APIM and HashiCorp Consul.

Refer to this link:{{'/apim/3.x/apim_installation_guide_docker_compose.html' | relative_url }}[guide] to install Gravitee thanks to docker-compose.

== Install HashiCorp Consul Server

The first thing to do is install a Consul server. Consul agents that run in server mode become the centralized registry for service discovery information in your network. They answer queries from other Consul agents about where a particular service can be found. For example, if you ask them where the log service is running, they may return to you that it is running on three machines, with these IP addresses, on these ports. Meanwhile, services such as the log service register themselves with the Consul clients so that they can become discoverable.

Read the https://www.consul.io/docs/install[official Consul documentation] to see how to install a Consul server. 

To get started, edit the _docker-compose.yml_ used to install Gravitee and declare an addtional service for Consul server as follows:

[source,yaml]
----
  consul-server:
    image: hashicorp/consul:1.11.4
    container_name: consul-server
    restart: always
    volumes:
     - ./consul/server.json:/consul/config/server.json:ro
    ports:
     - "8500:8500"
     - "8600:8600/tcp"
     - "8600:8600/udp"
    command: "agent"
    networks:
     - backend
----

In the example above, we declare a volume to mount the directory containing Consul configuration files as read-only (`:ro`) volume.

Consul containers loads their configuration from `/consul/config/` folder, at startup. 

We use the following _server.json_ to initialize the Consul server:

[source,yaml]
----
{
  "node_name": "consul-server",
  "server": true,
  "bootstrap" : true,
  "ui_config": {
      "enabled" : true
  },
  "data_dir": "/consul/data",
  "addresses": {
      "http" : "0.0.0.0"
  }
}
----

Notice that the `server` field is set to `true` to indicate that this Consul agent should run in **server mode**.

We are also enabling Consul’s web UI via `ui_config` attribute by setting sub key `enabled` to `true`.

Once Consul server's container is running, Consul’s web UI is accessible at port `8500`.

The `addresses` field specifies the address that the agent will listen on for communication from other Consul members. 

By default, this is `0.0.0.0`, meaning Consul will bind to all addresses on the local machine and will advertise the private IPv4 address to the rest of the cluster.

== Register a Service with HashiCorp Consul

An easy way to register a service in Consul is to request `/v1/agent/service/register` endpoint of Consul's https://www.consul.io/api-docs/catalog[Catalog HTTP API^].

Consul does not allow you to directly specify an extra path of your service when registering it. 

To overcome this limitation, Gravitee.io supports extra `Meta` attributes in addition to the standard `Address` attribute.

Meta attributes must be provided as part of the definition of your service:

* `gravitee_path` to specify on which path your service is reachable.
* `gravitee_ssl` to specify whether your service should be called with `http://` or `https://` scheme.

Below an cURL command example to register a service in Consul with extra attributes supported by Gravitee.io: 

[source,bash]
----
curl -X PUT -d '{ "ID": "whattimeisit_1", "Name": "whattimeisit", "Address": "api.gravitee.io", "Meta": {"gravitee_path":"/whattimeisit", "gravitee_ssl":"true" }, "Port": 443}' http://localhost:8500/v1/agent/service/register
----

Check the Consul web UI and you should see the new service named `whattimeisit`:

image::{% link images/apim/3.x/api-publisher-guide/service-discovery/service-discovery-consul-services.png %}[]

You can also verify that your service is successfully registered in Consul by interacting with Consul Agent API.

Use the following cURL command:

[source, bash]
----
curl "http://localhost:8500/v1/agent/service/whattimeisit"
----

You should get a response as follows:
[source,json]
----
{
   "ID":"whattimeisit",
   "Service":"whattimeisit",
   "Tags":[
      
   ],
   "Meta":{
      "gravitee_path":"/whattimeisit",
      "gravitee_ssl":"true"
   },
   "Port":443,
   "Address":"api.gravitee.io",
   "Weights":{
      "Passing":1,
      "Warning":1
   },
   "EnableTagOverride":false,
   "ContentHash":"d43a25497735099",
   "Datacenter":"dc1"
}
----

In order to test that incoming requests on APIM gateway are dynamically routed to different service instances, let's register another instance for service `whattimeisit` that serves a different content with `gravitee_path` set to `/echo`: 

[source,bash]
----
curl -X PUT -d '{ "ID": "whattimeisit_2", "Name": "whattimeisit", "Address": "api.gravitee.io", "Meta": {"gravitee_path":"/echo", "gravitee_ssl":"true" }, "Port": 443}' http://localhost:8500/v1/agent/service/register
----

== Enable Consul Service Discovery in Gravitee.io APIM

Now that your service instances are registered in Consul, go to APIM console:

* Create or select an existing API.
* Under API's submenu, click *Proxy*.
* Under *Backend Service*, select *Endpoints*.

image::{% link images/apim/3.x/api-publisher-guide/service-discovery/service-discovery-endpoints.png %}[]

* Click on the *Edit Group* icon.
* Select *SERVICE DISCOVERY* tab.
* Check *Enabled service discovery* checkbox.
* For *Type* dropdown list, select *Consul.io Service Discovery*. 

image::{% link images/apim/3.x/api-publisher-guide/service-discovery/service-discovery-consul-configuration.png %}[]

* *Consul.io URL*: Enter the URL on which your Consul is deployed (make sure it is reacheable from the Gravitee APIM gateway).
* *Service*: Enter the name of the service registered in Consul.
* *DC*:  The consul datacenter is an optional part of the Fully Qualified Domain Name (FQDN). if not provided, it defaults to the datacenter of the agent. Refer to this https://www.consul.io/docs/architecture[documentation^] for more details.
* *ACL*: Provide the ACL token if you've secured the access to Consul. For more information on how to setup ACLs, check this https://learn.hashicorp.com/tutorials/consul/access-control-setup-production[ACL tutorial^]

* *Truststore Type*: Allows to select the type of truststore (Java KeyStore or PKCS#12) storing the certificates that will be presented Consul agent to Gravitee during the secure connection handshake (SSL/TLS). When selecting `None (Trust All)` you configure Gravitee.io to trust all certificates presented by Consul during connection handshake. You can either copy/paste the content of your Truststore directly under *Truststore content* field or provide the path to you external Truststore under *Truststore path*. At least one of the two must be provided.

* *KeyStore Type* allows to select the type of keystore (Java KeyStore or PKCS#12) storing certificates that will be presented by Gravitee.io to Consul agent during the secure connection handshake (SSL/TLS). You can either copy/paste the content of your keystore directly under *KeyStore content* field or provide the path to you external Keystore under *KeyStore path*. At least one of the two must be provided.
* Click *SAVE*.

Your API should now appear out of sync in the top banner. Be sure to click *deploy your API*.

image::{% link images/apim/3.x/api-publisher-guide/service-discovery/service-discovery-redeploy.png %}[]

NOTE: Endpoints configured through the APIM console before service discovery was enabled are not removed. The Gravitee.io gateway will continue to consider those endpoints in addition to the ones discovered through Consul integration. The endpoints dynamically discovered through Consul are not displayed in APIM console. You can remove the endpoints define through the APIM console. However, we encourage you to keep at least one endpoint declared as secondary. Secondary endpoints are not included in the load-balancer pool and are only selected to handle requests if Consul is no longer responding.

To declare an endpoint as secondary:

* Click on the *Edit* icon.
* Check Secondary endpoint checkbox.
* Select *SAVE*.

image::{% link images/apim/3.x/api-publisher-guide/service-discovery/service-discovery-secondary-endpoint.png %}[]

== Verify that your service is properly discovered by APIM gateway

You can check API gateway's logs to verify that your service have been successfully discovered thanks to HashiCorp Consul: 

[source]
----
INFO  i.g.g.h.a.m.impl.ApiManagerImpl - API id[194c560a-fcd1-4e26-8c56-0afcd17e2630] name[Time] version[1.0.0] has been updated
INFO  i.g.d.consul.ConsulServiceDiscovery - Register a new service from Consul.io: id[whattimeisit] name[whattimeisit]
INFO  i.g.g.s.e.d.v.EndpointDiscoveryVerticle - Receiving a service discovery event id[consul:whattimeisit] type[REGISTER]
----

You can now try to call your API to make sure that incoming API requests are properly routed to the proper backend service.

You can also deregister your service instance from Consul by refering to their ID and call your API again to observe how APIM dynamically routes the trafic based on Consul's Service Catalog.

[source,bash]
----
curl -X PUT -v "http://localhost:8500/v1/agent/service/deregister/whattimeisit"
----

If you encounter any issues, enable logs in order to troubleshoot. Refer to the link:{{'/apim/3.x/apim_publisherguide_logging_analytics.html#logs' | relative_url}}[Logging and analytics] to learn how to configure logging on your API.

**You learned how to integrate Gravitee.io APIM gateway with HashiCorp Consul, which enables dynamic load balancer configuration changes that are pulled directly from Consul’s service discovery registry.**

== Additional considerations

=== Enable Health Check to monitor backend endpoints managed by HashiCorp Consul

You can optionally enable health checks for your API. You will then be able to view the status of all endpoints under *Per-endpoint availability* section, including the ones managed by Consul.

image::{% link images/apim/3.x/api-publisher-guide/service-discovery/service-discovery-consul-healthcheck.png %}[]

For more details on how to enable Health Check, refer tot this link:{{'/apim/3.x/apim_publisherguide_backend_services.html#configure_health_check' | relative_url}}[section].
