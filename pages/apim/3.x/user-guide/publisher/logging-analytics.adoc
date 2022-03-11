= Logging and analytics
:page-sidebar: apim_3_x_sidebar
:page-permalink: apim/3.x/apim_publisherguide_logging_analytics.html
:page-folder: apim/user-guide/publisher
:page-layout: apim3x

== Overview

You can view metrics and logs for applications and APIs using the *Analytics* menu options in APIM Console.

TIP: From APIM version 3.6.x, you can mask secure data in your logs by adding the Data logging masking policy to your API. For more details, see link:{{ '/apim/3.x/apim_policies_data_logging_masking.html' | relative_url }}[Data logging masking^].

=== Metrics

Metrics are presented in one or more _dashboards_. You can select the dashboard with the metrics you want to see from the *Select a dashboard* drop-down menu.
You can then select a time period and view several different types of analytics -- such as requests received and responses sent, the most frequently called applications and response times, presented in different views and formats -- such as bar charts and maps.

image:{% link images/apim/3.x/api-publisher-guide/analytics/dashboards.png %}[]

For more details on creating and configuring dashboards, see link:{{ '/apim/3.x/apim_installguide_dashboard_configuration.html' | relative_url }}[Configure dashboards^].

=== Logs

You can list the API requests for a single API or for an application by viewing the logs, as follows:

* Select the API and click *Analytics > Logs*.
* Select the application and click *Logs*.

This lists all the API requests in date and time order.
You can filter by date or search term and click on an individual entry to view more details.

image:{% link images/apim/3.x/api-publisher-guide/analytics/logs.png %}[]

Log entries include details such as:

- the API endpoint for the request
- the URL of the gateway through which the request was sent

By default, the request header and payload are not logged in APIM, to save space, as shown in the basic logging detail page below. You specify how much detail to log in the logging configuration.

image:{% link images/apim/3.x/api-publisher-guide/analytics/logs-simple-view.png %}[Basic logging detail]

== Configure API logging

NOTE: If you configured a maximum logging duration in the global settings, the maximum duration will be applied to the API logging configuration specified here.
For more details, see link:{{ '/apim/3.x/apim_how_to_configuration.html#update-the-default-apim-settings' | relative_url }}[Update the default APIM settings^].

WARNING: Logging configuration changes can have a significant impact on performance. Proceed with caution.

. link:{{ '/apim/3.x/apim_quickstart_console_login.html' | relative_url }}[Log in to APIM Console^].
. Click *APIs* and select the API from the list.
. Click *Analytics > Logs*.
. Click the *Configure the logging* link at the top.
+
image:{% link images/apim/3.x/api-publisher-guide/analytics/logs-configure.png %}[]

+
If you configured a maximum logging duration in the global settings, APIM displays a message to remind you:
image:{% link images/apim/3.x/api-publisher-guide/analytics/logs-configure-max-duration.png %}[]

ifeval::[{{ site.products.apim._3x.version }} < 3.6.0]

. In the *Mode* drop-down, select the type of logging required:
* *Client only* -- to log HTTP request header and payload details between the client and the gateway
* *Proxy only* -- to log HTTP request header and payload details between the gateway and the backend
* *Client and proxy* -- to log HTTP request header and payload details for both
. Select *Logging enabled* to go ahead and enable logging, or *Conditional logging* to specify conditions for logging.
. To specify logging conditions, click *SHOW EDITOR* and select all the conditions which apply. You can restrict logging by:
* application or plan
* request header or query parameter
* HTTP method
* request IP address
* duration
* end date
+
You can create rules by combining conditions. Each new condition is added to the *Condition* field. See the example below for more details.

== Example

The following example shows how to configure logging to only log `GET` HTTP methods which include an `X-debug` request header with a value of `true`.
We need to specify it as a combined condition in two parts.

. Click *SHOW EDITOR* and in the condition editor, select *Condition type* as *HTTP Method*. Click *ADD*.
+
image:{% link images/apim/3.x/api-publisher-guide/analytics/logs-configure-example-step1.png %}[]

. Select *GET* as the HTTP method.
+
image:{% link images/apim/3.x/api-publisher-guide/analytics/logs-configure-example-step2.png %}[]

. Click *SAVE*. The new condition is added. Note that you need to take a copy the syntax of the condition, as it will be overwritten when you specify the next one.
+
image:{% link images/apim/3.x/api-publisher-guide/analytics/logs-configure-example-step3.png %}[]

. Now click *SHOW EDITOR* again to specify the second part of the condition.
. Select *Request query-parameter* as the *Condition type*. Click *ADD*.
+
image:{% link images/apim/3.x/api-publisher-guide/analytics/logs-configure-example-step4.png %}[]

. Enter *X-debug* as the *Query parameter name* and *true* as the value.
+
image:{% link images/apim/3.x/api-publisher-guide/analytics/logs-configure-example-step5.png %}[]

. Click *SAVE*. We can see that the second condition has been added. To add back in the first condition, go to the end of the condition line and type *&&*, then paste it at the end.
+
image:{% link images/apim/3.x/api-publisher-guide/analytics/logs-configure-example-step6.png %}[]
endif::[]
ifeval::[{{ site.products.apim._3x.version }} >= 3.6.0]
. Toggle on the *Enabled* option.
. Select the level of logging required for the mode, content and scope.
+
image:{% link images/apim/3.x/api-publisher-guide/analytics/logs-configure-3-6.png %}[]

. Specify all logging conditions which apply in link:{{ '/apim/3.x/apim_publisherguide_expression_language.html' | relative_url }}[Gravitee Expression Language^]. You can restrict logging by:
* application or plan
* request header or query parameter
* HTTP method
* request IP address
* duration
* end date
+
You can combine conditions, as in the example below:
+
image:{% link images/apim/3.x/api-publisher-guide/analytics/logs-configure-example-step6.png %}[]
endif::[]

. Click *SAVE* to save the new logging configuration. Don't forget to redeploy your API.
+
We can now return to the logging screen and see the logging detail when we click on a log entry, as in the image below:
+
image:{% link images/apim/3.x/api-publisher-guide/analytics/logs-detailed-view2.png %}[]
