= Publish your first API with APIM API
:page-sidebar: apim_3_x_sidebar
:page-permalink: apim/3.x/apim_quickstart_publish_api.html
:page-folder: apim/quickstart/api-publisher
:page-layout: apim3x

== Overview

This section walks you through creating and publishing your first API with APIM API. You can find more information in the link:{{ '/apim/3.x/apim_publisherguide_manage_apis.html' | relative_url }}[API Publisher Guide].

NOTE: In this example we will use the https://api.gravitee.io/echo[Gravitee.io Echo API] to set up our first proxy API.
The Gravitee.io Echo API returns JSON-formatted data via the following URL: https://api.gravitee.io/echo

IMPORTANT: If option *Enable API review* is enabled in APIM Console, the API `workflow_state` attribute must be set to `REVIEW_OK` before you can deploy or start the API. See *APIs > Manage the API's review state* in the link:{{ '/apim/3.x/apim_installguide_rest_apis_documentation.html' | relative_url }}[API Reference^].

== Create your API with APIM API

Create API request::
[source]
----
curl -H "Authorization: Basic YWRtaW46YWRtaW4=" \
     -H "Content-Type:application/json;charset=UTF-8" \
     -X POST \
     -d '{"name":"My first API","version":"1","description":"Gravitee.io Echo API Proxy","contextPath":"/myfirstapi","endpoint":"https://api.gravitee.io/echo"}' \
     http://MANAGEMENT_API_SERVER_DOMAIN/management/organizations/DEFAULT/environments/DEFAULT/apis
----

Create Plan request::

[source]
----
curl -H "Authorization: Basic YWRtaW46YWRtaW4=" \
     -H "Content-Type:application/json;charset=UTF-8" \
     -X POST \
     -d '{"name":"My Plan","description":"Unlimited access plan","validation":"auto","characteristics":[],"paths":{"/":[]},"security":"api_key"}' \
     http://MANAGEMENT_API_SERVER_DOMAIN/management/organizations/DEFAULT/environments/DEFAULT/apis/{api-id}/plans
----

Publish Plan request::

[source]
----
curl -H "Authorization: Basic YWRtaW46YWRtaW4=" \
     -H "Content-Type:application/json;charset=UTF-8" \
     -X POST \
     http://MANAGEMENT_API_SERVER_DOMAIN/management/organizations/DEFAULT/environments/DEFAULT/apis/{api-id}/plans/{plan-id}/_publish
----

Deploy API request::
[source]
----
curl -H "Authorization: Basic YWRtaW46YWRtaW4=" \
     -X POST \
     http://MANAGEMENT_API_SERVER_DOMAIN/management/organizations/DEFAULT/environments/DEFAULT/apis/{api-id}/deploy
----

Start API request::
[source]
----
curl -H "Authorization: Basic YWRtaW46YWRtaW4=" \
     -X POST \
     http://MANAGEMENT_API_SERVER_DOMAIN/management/organizations/DEFAULT/environments/DEFAULT/apis/{api-id}?action=START
----

Publish API on APIM Portal request::

From the JSON response of the *Create API Request*, add the field `lifecycle_state` with value =`"published"` and send the result in a PUT request.
[source]
----
curl -H "Authorization: Basic YWRtaW46YWRtaW4=" \
     -H "Content-Type:application/json;charset=UTF-8" \
     -X PUT \
     -d '<RESPONSE_FROM_CREATE_API_REQUEST + ",lifecycle_state":"published">'
'     http://MANAGEMENT_API_SERVER_DOMAIN/management/organizations/DEFAULT/environments/DEFAULT/apis/{api-id}
----

For more information, see the complete link:{{ '/apim/3.x/apim_installguide_rest_apis_documentation.html' | relative_url }}[APIM API documentation].
