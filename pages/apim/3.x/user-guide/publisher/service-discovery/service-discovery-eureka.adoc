:page-sidebar: apim_3_x_sidebar
:page-permalink: apim/3.x/apim_service_discovery_eureka.html
:page-folder: apim/user-guide/publisher/service-discovery
:page-layout: apim3x
:page-title: Eureka service discovery

== Configuration

The configuration is loaded from the common GraviteeIO Gateway configuration file (gravitee.yml) All configurations described by official Eureka discovery client documentation are available on the official github repository: https://github.com/Netflix/eureka/wiki. Gravitee Gateway uses Eureka Discovery client v1 and fetch configured Eureka Servers. It does not register the gateway application into Eureka registry. Please refer the official Eureka documentation for advanced uses and advanced concepts.

For more information, see the complete link:{{ 'https://github.com/gravitee-io-community/gravitee-service-discovery-eureka/blob/master/README.adoc' }}[Eureka client configuration].

== Enable Eureka Service Discovery in Gravitee APIM

Once you have configured your Eureka service, go to the APIM console:

. Create or select an existing API.
. Under API's submenu, click *Proxy*.
. Under *Backend Service*, select *Endpoints*.

image::{% link images/apim/3.x/api-publisher-guide/service-discovery/service-discovery-endpoints.png %}[]

[start=4]
. Click on the *Edit Group* icon.
. Select the *SERVICE DISCOVERY* tab.
. Click the *Enabled service discovery* checkbox to activate this option.
. Select *Eureka Service Discovery* in the *Type* dropdown list.
. For *Application*, enter your application name.

image::{% link images/apim/3.x/api-publisher-guide/service-discovery/service-discovery-eureka-configuration.png %}[]

[start=9]
. Click *SAVE*.

Your API should now appear out of sync in the top banner - click *deploy your API* to rectify this

image::{% link images/apim/3.x/api-publisher-guide/service-discovery/service-discovery-redeploy.png %}[]

NOTE: Gravitee Gateway will not remove endpoints configured through the APIM console before service discovery was enabled - it will continue to consider such endpoints in addition to the ones dynamically discovered through Eureka integration (these are not shown in the APIM console). You can manually remove any endpoints defined through the APIM console. However, it is highly recommended that you keep at least one such endpoint declared as secondary - secondary endpoints are not included in the load-balancer pool and are only selected to handle requests if Eureka is no longer responding.

To declare an endpoint as secondary:

. Click on the *Edit* icon.
. Click the *Secondary endpoint* checkbox to enable it.
. Select *SAVE*.

image::{% link images/apim/3.x/api-publisher-guide/service-discovery/service-discovery-secondary-endpoint.png %}[]

== Verify that your service is properly discovered by the APIM gateway

To verify that your service has been successfully discovered through Eureka, check out the API gateway logs:

[source]
----
INFO  i.g.g.h.a.m.impl.ApiManagerImpl - API id[194c560a-fcd1-4e26-8c56-0afcd17e2630] name[Time] version[1.0.0] has been updated
INFO  i.g.g.s.e.d.v.EndpointDiscoveryVerticle - Receiving a service discovery event id[eureka:whattimeisit] type[REGISTER]
----

You can now try to call your API to make sure that incoming API requests are properly routed to the right backend service.

[source,bash]
----
curl -X PUT -v "http://localhost:8082/whattimeisit"
----

If you encounter any issues, enable logs in order to troubleshoot. Refer to the link:{{'/apim/3.x/apim_publisherguide_logging_analytics.html#logs' | relative_url}}[Logging and analytics documentation] to learn how to configure logging on your API.

== Additional considerations

=== Enable Health Check to monitor backend endpoints managed by Eureka

To view the status of all endpoints, including the ones managed by Eureka, enable the Health Check option for your API in the *Per-endpoint availability* section.

image::{% link images/apim/3.x/api-publisher-guide/service-discovery/service-discovery-eureka-healthcheck.png %}[]

See the link:{{'/apim/3.x/apim_publisherguide_backend_services.html#configure_health_check' | relative_url}}[Health Check documentation] for more information on how to enable the Health Check option for your API.
