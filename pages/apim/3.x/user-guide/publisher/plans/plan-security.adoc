= Configure plan security
:page-sidebar: apim_3_x_sidebar
:page-permalink: apim/3.x/apim_publisherguide_plan_security.html
:page-folder: apim/user-guide/publisher
:page-keywords: Gravitee.io, API Platform, API Management, API Gateway, documentation, manual, guide, reference, api, CGU, GCU
:page-layout: apim3x

== Overview

You configure the level of security required for accessing your API in your plan.
APIM supports the following four security types:

* Keyless (public)
* API Key
* OAuth 2.0
* JWT

== Configure security

You can find examples of configuring OAuth2 security and JTW security in the following sections:

  * <<Add OAuth 2.0 security to a plan>>
  * <<Add JWT security to a plan>>

You configure security on the **Secure** page of a new or existing plan.

. To edit an existing plan:
  .. In APIM Console, select your API.
  .. Click **Portal > Plans**.
  .. Click the edit icon image:{% link images/icons/edit-icon.png %}[role="icon"]
. On the **Secure** page, configure the type of security you require for your plan, as described in the sections below.
+
image::{% link images/apim/3.x/api-publisher-guide/plans-subscriptions/create-plan-secure.png %}[]
. Click *NEXT* to link:{{ '/apim/3.x/apim_publisherguide_plan_restrictions.html' | relative_url }}[configure plan restrictions].

=== Keyless plans

Keyless plans allow public access to the API and bypass any security mechanisms on the whole request process.

By default, keyless plans offer no security and are most useful for quickly and easily exposing your API to external users and getting their feedback.
Due to the lack of consumer identifier token (API key), keyless consumers are set as `unknown application` in the API analytics section.

==== Basic authentication

You can configure basic authentication for keyless plans, by associating a basic authentication policy with either an LDAP or inline resource. For more details, see link:{{ '/apim/3.x/apim_policies_basic_authentication.html' | relative_url }}[Basic authentication policy^].

=== API key plans

You use API key plans to enforce verification of API keys during request processing, allowing only apps with approved API keys to access your APIs.
This plan type ensures that API keys are valid, are not revoked or expired and are approved to consume the specific resources associated with your API.

API key plans offer only a basic level of security, acting more as a unique identifier than a security token, since the API key can easily be found in the app code.
For a higher level of security, see OAuth 2.0 and JWT plans.

==== Use a custom API key

You can specify a custom API key for an API key plan. This is particularly useful when you want to silently migrate to APIM and have a pre-defined API key.

NOTE: The custom API key feature can be enabled in the global settings of APIM.

The custom API key must have more than 8 characters, less than 64 characters and be URL compliant (^ # % @ \ / ; = ? | ~ , (space) are all invalid characters).

When prompted, you can choose to provide your custom API key or let APIM generate one for you by leaving the field empty.

You can provide a custom API key when:

* creating a subscription:

image::{% link images/apim/3.x/api-publisher-guide/plans-subscriptions/custom-api-key-1.png %}[]

* accepting a subscription:

image::{% link images/apim/3.x/api-publisher-guide/plans-subscriptions/custom-api-key-2.png %}[]

* renewing a subscription:

image::{% link images/apim/3.x/api-publisher-guide/plans-subscriptions/custom-api-key-3.png %}[]

==== Use a shared API key

The shared API key mode makes consumers reuse the same API key across all API subscriptions of an application.

This mode can be enabled in environment settings:

image::{% link images/apim/3.x/api-publisher-guide/plans-subscriptions/shared-api-key-1.png %}[]

With this mode enabled, consumers will be asked on their second subscription to choose between reusing their key across all subscriptions or generate one different API key for each subscription (which is the default mode).

.When subscribing in the console
image::{% link images/apim/3.x/api-publisher-guide/plans-subscriptions/shared-api-key-2.png %}[]
.When subscribing in the portal
image::{% link images/apim/3.x/api-publisher-guide/plans-subscriptions/shared-api-key-2-portal.png %}[]

This choice is permanent and consumers will not be able to switch back to one key per subscription for their application.

NOTE: When disabling the shared API key mode in environment settings, applications that have already been configured to use a shared key will continue to work this way, but consumers will stop being asked to choose between one mode or the other on their second subscription.

NOTE: For technical reasons, in shared mode, API keys can only be shared across API key plans that belong to distinct APIs. This means that if subscribing to two API key plans on the same API while creating an application, no prompt will be made to
choose for a mode and the default mode will be used automatically.

Because they may be used to call APIs that are owned by another group of publishers, shared API keys cannot be edited from the API publisher subscription view. This means that while they are still readable, renewal and revocation of shared API keys cannot be performed by the API publisher when a subscription has been made in shared mode.

image::{% link images/apim/3.x/api-publisher-guide/plans-subscriptions/shared-api-key-3.png %}[]

Instead, it is the responsability of the application owner to perform such operations, and for this reason, shared API keys can only be revoked from the application owner subscription view.

.Manage your shared API in the console
image::{% link images/apim/3.x/api-publisher-guide/plans-subscriptions/shared-api-key-4.png %}[]
.Manage your shared API in the portal
image::{% link images/apim/3.x/api-publisher-guide/plans-subscriptions/shared-api-key-4-portal.png %}[]

=== OAuth 2.0 plans

To configure an OAuth 2.0 plan for an API, you need to:

* create an OAuth 2.0 client resource that represents your OAuth 2.0 authorization server
* create a new plan for it or apply it to an existing plan

==== Create and specify an OAuth 2.0 authorization server

NOTE: The instructions below explain how to create an OAuth 2.0 resource in Design Studio. For APIs not migrated to Design Studio, you can create resources with the *Design > Resources* menu option.

. Open your API in APIM Console and click *Design*.
. Click the *RESOURCES* tab and create a new *Generic OAuth2 Authorization Server* resource.
+
NOTE: If you use https://gravitee.io/[Gravitee.io Access Management], we provide a dedicated OAuth 2.0 AM resource.
+
image::{% link images/apim/3.x/api-publisher-guide/plans-subscriptions/create-oauth2-resource.png %}[Gravitee.io - Create OAuth 2.0 resource, 873, 530, align=center, title-align=center]

. Enter the *Resource name*.
. Set the *OAuth 2.0 Authorization server URL*.
. Set the https://tools.ietf.org/html/rfc7662[Token introspection endpoint^] URI with the correct HTTP method and https://tools.ietf.org/html/rfc6749#section-3.3[scope^] delimiter.
. Enter the *Scope separator*.
. If you want to retrieve consented claims about the end user, enter the http://openid.net/specs/openid-connect-core-1_0.html#UserInfo[UserInfo Endpoint^] URI.
. Enter the *Client Id* and *Client Secret* used for token introspection.
+
NOTE: Why do I need this? As defined in https://tools.ietf.org/html/rfc7662#section-2.1[RFC 7662^], to prevent token scanning attacks,
the introspection endpoint must also require some form of authorization to access this endpoint, such as client authentication.

. Enter any other required information, then click the tick icon image:{% link images/icons/tick-icon.png %}[role="icon"].
. Click *SAVE* to save the resource.

==== Add OAuth 2.0 security to a plan

NOTE: If you already have a suitable plan defined, you can add your OAuth2 resource to one of the flows defined for it in Design Studio, by following the steps in link:{{ '/apim/3.x/apim_publisherguide_design_studio_create.html#flow-policies' | relative_url }}[Add policies to a flow^].

. In APIM Console, select your API and click *Portal > Plans*.
. On the **Secure** page, choose *OAuth2* as the authorization type.
. Specify the OAuth2 resource name you created and check any https://tools.ietf.org/html/rfc6749#section-3.3[scopes^] to access the API.
+
image::{% link images/apim/3.x/api-publisher-guide/plans-subscriptions/create-oauth2-plan.png %}[]

Your API is now OAuth 2.0 secured and consumers must call the API with an `Authorization Bearer :token:` HTTP header to access the API resources.

IMPORTANT: Any applications wanting to subscribe to an OAuth 2.0 plan must have an existing client with a valid `client_id` registered in the OAuth 2.0 authorization server.
The `client_id` will be used to establish a connection between the OAuth 2.0 client and the APIM consumer application.

=== JSON Web Tokens (JWT) plans

JWT plans ensure that JWT tokens issued by third parties are valid. Only apps with approved JWT tokens can access APIs associated with a JWT plan.

https://tools.ietf.org/html/rfc7519[JSON Web Tokens] are an open method for representing claims securely between two parties.
JWT are digitally-signed using HMAC shared keys or RSA public/private key pairs. JWT plans allow you to verify the signature of the JWT and check if the JWT is still valid according to its expiry date.

NOTE: JWT define some https://tools.ietf.org/html/rfc7519#section-4.1[registered claim names] including subject, issuer, audience, expiration time and not-before time. In addition to these claims, the inbound JWT payload
must include the `client_id` claim (see below) to establish a connection between the JWT and the APIM application subscription.

The policy searches for a client ID in the payload as follows:

* First in the `azp` claim
* Next in the `aud` claim
* Finally in the `client_id` claim

==== Add JWT security to a plan

. In APIM Console, select your API and click *Portal > Plans*.
. On the **Secure** page, choose *JWT* as the authorization type.
. Specify the public key used to verify the incoming JWT token.
+
NOTE: You can also set the public key in the `gravitee.yml` file. See link:{{ '/apim/3.x/apim_policies_jwt.html' | relative_url }}[JWT policy] for more information. APIM only supports the RSA Public Key format.
+
image::{% link images/apim/3.x/api-publisher-guide/plans-subscriptions/create-jwt-plan.png %}[]

Your API is now JWT secured and consumers must call the API with an `Authorization Bearer :JWT Token:` HTTP header to access the API resources.
