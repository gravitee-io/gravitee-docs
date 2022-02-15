= Load balancing, failover and health check
:page-sidebar: apim_3_x_sidebar
:page-permalink: apim/3.x/apim_publisherguide_backend_services.html
:page-folder: apim/user-guide/publisher
:page-layout: apim3x

== Overview

APIM includes a number of backend services for managing your APIs. This page explains how to configure the following services for your APIs:

* Load balancing
* Failover
* Health check

=== How to access the API backend service configuration

To update the configuration for these services:

. link:{{ '/apim/3.x/apim_quickstart_console_login.html' | relative_url }}[Log in to APIM Console^].
. Click *APIs* and select an API.
. Click *Proxy*.
+
The backend service configuration options are in the *BACKEND SERVICES* section.
+
image:{% link images/apim/3.x/api-publisher-guide/backend-services/api-backend-services.png %}[]

WARNING: You must redeploy your API with the *deploy the API* link after each new configuration.

== Configure load balancing

APIM Gateway includes a built-in load balancer, which you can enable and configure for your API endpoints according to your requirements.

[[endpoint-groups]]
=== Endpoint groups

You configure load balancing by creating a logical grouping of endpoints and specifying a load balancing algorithm for them. For example, you can define a group of endpoints representing instances of the same API deployed on different servers.

APIM always uses the first group defined for load balancing. Any additional groups you define are for use in policies:

* redirection rules including named groups in the link:{{ '/apim/3.x/apim_policies_dynamic_routing.html#regular_expressions' | relative_url }}[Dynamic routing^] policy
* traffic shadowing using endpoints in these groups link:{{ '/apim/3.x/apim_policies_traffic_shadowing.html' | relative_url }}[Traffic shadowing^] policy

=== Load balancing types

You can configure four types of load balancing:

* Round robin
* Random
* Weighted round robin
* Weighted random

For the two weighted types, you need to assign a weight to your endpoints to determine the frequency with which APIM Gateway selects one endpoint for load balancing compared to another.

For example, if you have the following two endpoints:

* Endpoint 1 with a weight of 9
* Endpoint 2 with a weight of 1

Endpoint 1 is selected 9 times out of 10, whereas Endpoint 2 is selected only 1 time out of 10.

=== Create a group

. Click *Endpoints*.
. Click *ADD A NEW GROUP*.
. In the *GENERAL* tab, enter a *Name* for the group and the type of load balancing algorithm to use.
. In the *CONFIGURATION* tab, configure any additional HTTP details for the group, such as proxy and SSL details.
. In the *SERVICE DISCOVERY* tab, enable *Enabled service discovery* if you want external endpoints to be dynamically added or removed to or from the group, then specify the type of service discovery. For more details of service discovery in APIM, see link:{{ '/apim/3.x/apim_service_discovery_overview.html' | relative_url }}[Service discovery^]).
. Click *SAVE*.

Your group is added to the list. You can now perform any of the following actions on the group by clicking the corresponding icon in the group header:

* Add endpoints to your group by clicking the plus icon image:{% link images/icons/lb-plus-icon.png %}[role="icon"]
* Update the group configuration by clicking the settings icon image:{% link images/icons/settings-icon.png %}[role="icon"]
* Delete the group by clicking the delete icon image:{% link images/icons/delete-icon.png %}[role="icon"]
* Change the display order of the endpoints from ascending to descending and vice versa, by clicking the arrow icon image:{% link images/icons/up-arrow-icon.png %}[role="icon"] next to the *Name*, *Type* or *Weight* header

=== Add endpoints to your group

. Click the plus icon image:{% link images/icons/lb-plus-icon.png %}[role="icon"] to add new endpoints to your group.
. In the *GENERAL* tab, specify the endpoint details as follows:

* The *Type* and *Name* of the endpoint
* The endpoint URL in the *Target* field
* A number in the *Weight* field (only if the endpoint is in a group configured with *Weighted Round-Robin* or *Weighted Random* load balancing), representing the weight the endpoint has in terms of selecting it for
*Weighted* load balancing
* If a global health check configuration exists, it is automatically applied to this endpoint. If you want to change the health check behavior for your endpoint, click the settings icon image:{% link images/icons/settings-icon.png %}[role="icon"]in the *Health-check* section, then:
** Uncheck *Enable health-check* to disable health checking for your endpoint
** Uncheck *Inherit configuration* and specify a different health check configuration, as described in <<Configure health check>> from step 4
* Check the *Secondary endpoint* option to define this endpoint outside the main load balancing pool, to be used for load balancing only if all the primary endpoints are marked as down by the health check

. In the *CONFIGURATION* tab, uncheck the option to inherit the HTTP configuration specified for the group if you want to specify a different HTTP configuration for this endpoint, then enter the details of the HTTP configuration.
. Click *SAVE*.
+
Your new endpoint is added to the list. Endpoints with inherited configuration are denoted by a right-angled arrow and endpoints with health checking configured are denoted by a heart:
+
image:{% link images/apim/3.x/api-publisher-guide/backend-services/api-backend-inherited-config.png %}[]

You can now perform any of the following actions on the endpoint:

* Update the endpoint configuration by clicking the settings icon image:{% link images/icons/settings-icon.png %}[role="icon"] next to the endpoint
* Delete one or more of the endpoints in the group by selecting the relevant checkboxes and clicking the delete icon image:{% link images/icons/delete-icon.png %}[role="icon"] in the header row

== Configure failover

Once you have configured your endpoints, as described in <<Configure load balancing>>, you can configure failover for the endpoints and load balancing algorithm configured.

. Click *Failover*.
. Select *Enabled* to enable failover.
+
image:{% link images/apim/3.x/api-publisher-guide/backend-services/api-backend-failover.png %}[]

. Enter a *Max attempts* number, for the number of times APIM Gateway attempts to find a suitable endpoint, according to the load balancing algorithm, before returning an error.
. Enter a *Timeout*, for the number of milliseconds between each attempt.
. Click *SAVE*.

== Configure health check

This section explains how to create a global health check configuration. When you create a global health check configuration, APIM applies the configuration to all existing endpoints and all new endpoints you create by default.

To create an endpoint-specific health check configuration or disable health checking for an endpoint, choose the endpoint first and click the health check settings, as described in <<Add endpoints to your group>>.

From APIM version 3.6, you can view the health of your APIs in *Dashboard*, by clicking the *APIS STATUS* tab:

image:{% link images/apim/3.x/api-publisher-guide/backend-services/api-status-dashboard.png %}[]

To configure health checking:

. Click *Health-check*.
. Click the *Configure Health-check* link at the top of the page.
. Select *Enable health-check*.
+
image:{% link images/apim/3.x/api-publisher-guide/backend-services/api-backend-health-check.png %}[]

ifeval::[{{ site.products.apim._3x.version }} < 3.6.0]
. Enter the interval between each health check as an *Interval* number and a *Time Unit*. Note that this interval is applied for each gateway in your APIM environment.
endif::[]
ifeval::[{{ site.products.apim._3x.version }} >= 3.6.0]
. Enter the schedule as a `cron` expression.
endif::[]

. Enter the *HTTP Method* which triggers the health check.
. Add the path which triggers the health check. Select *From root path* to apply the path specified at root URL level. For example, if your endpoint URL is `www.test.com/api`, this option removes `/api` before appending the path.
. Specify headers which trigger the health check, if any. You can use link:{{ '/apim/3.x/apim_publisherguide_expression_language.html' | relative_url }}[Gravitee Expression Language^] to configure a header. Available variables are link:{{ '/apim/3.x/apim_publisherguide_expression_language.html#dictionaries' | relative_url }}[dictionaries^] and link:{{ '/apim/3.x/apim_publisherguide_expression_language.html#properties' | relative_url }}[api's properties^] access.
. In *Assertions*, specify any conditions to test for in the API response in order to trigger the health check. Assertions are written in link:{{ '/apim/3.x/apim_publisherguide_expression_language.html' | relative_url }}[Gravitee Expression Language^]. An assertion can be a simple 200 response (`#response.status == 200`) but you can also test for specific content.
. Click *SAVE*.
+
You can see a visual summary of the health check configuration you specified on the right.
+
After you deploy your API, click *Back to Health-check* to view the health check. You can filter the display by date and time period.
