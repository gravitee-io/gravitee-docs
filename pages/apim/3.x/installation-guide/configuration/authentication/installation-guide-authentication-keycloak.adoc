[[gravitee-installation-authentication-keycloak]]
= Configure Keycloak authentication
:page-sidebar: apim_3_x_sidebar
:page-permalink: apim/3.x/apim_installguide_authentication_keycloak.html
:page-folder: apim/installation-guide/portal/authentication
:page-description: Gravitee.io API Management - Portal - Authentication - Keycloak
:page-keywords: Gravitee.io, API Platform, API Management, API Gateway, oauth2, openid, documentation, manual, guide, reference, api
:page-layout: apim3x

== Overview

This page explains how to configure APIM to allow users to connect using https://www.keycloak.org/[Keycloak^].

== Create a Keycloak client

Before you can connect to the Gravitee.io portal using Keycloak, you need to create a new client.

=== Create a new client

. In Keycloak, create a new client.
+
image::{% link images/apim/3.x/installation/authentication/keycloak_create_client.png %}[Create a new client]

. Enter the client details.
+
image::{% link images/apim/3.x/installation/authentication/keycloak_configure_client.png %}[Fill the form]

WARNING: The `Valid Redirect URIs` value must exactly match the domain which is hosting APIM Portal.

=== Retrieve client credentials

After you create the client, you can retrieve its details for authentication configuration.

image::{% link images/apim/3.x/installation/authentication/keycloak_client_credentials.png %}[Get Client credentials]

== Configure APIM

=== SSL support

When using custom a Public Key Infrastructure (PKI) for your OAuth2 authentication provider, you may have to specify the certificate authority chain of your provider in APIM.

[source,bash]
----
export JAVA_OPTS="
  -Djavax.net.ssl.trustStore=/opt/graviteeio-management-api/security/truststore.jks
  -Djavax.net.ssl.trustStorePassword=<MYPWD>"
----

Docker environment::

[source,yaml]
----
 local_managementapi:
    extends:
      file: common.yml
      service: managementapi
    ports:
      - "8005:8083"
    volumes:
      - ./conf/ssl/truststore.jks:/opt/graviteeio-management-api/security/truststore.jks:ro
      - ./logs/management-api:/home/gravitee/logs
    links:
      - "local_mongodb:demo-mongodb"
      - "local_elasticsearch:demo-elasticsearch"
    environment:
      - JAVA_OPTS=-Djavax.net.ssl.trustStore=/opt/graviteeio-management-api/security/truststore.jks -Djavax.net.ssl.trustStorePassword=<MYPWD>
      - gravitee_management_mongodb_uri=mongodb://demo-mongodb:27017/gravitee?serverSelectionTimeoutMS=5000&connectTimeoutMS=5000&socketTimeoutMS=5000
      - gravitee_analytics_elasticsearch_endpoints_0=http://demo-elasticsearch:9200
----

include::../../partial/management-api-configuration-idp-override.adoc[leveloffset=+2]

==== APIM Console configuration

. Click *Organization Settings > Authentication*.
. Click the plus icon image:{% link images/icons/plus-icon.png %}[role="icon"] and select the *OpenID Connect* icon.
. If you want to use this provider to log in to APIM Portal, ensure that *Allow portal authentication to use this identity provider* is checked. To use it only for APIM Console, uncheck this option.
. Enter the details of the provider, including the credentials created in the AM client.
+
image::{% link images/apim/3.x/management-api-configuration-idp/new-oidc.png %}[Gravitee.io - New OIDC IDP]
. Click *CREATE*.
. Activate the provider for Portal or Console login, as described in link:{{ '/apim/3.x/apim_installguide_authentication.html#activating-providers' | relative_url }}[Activating providers^].

==== `gravitee.yml` file configuration

Update the following section of the file with the Keycloak client credentials.

[source,yaml]
----
security:
  providers:
    - type: oidc
      id: keycloak # not required if not present, the type is used
      clientId: gravitee
      clientSecret: 3aea136c-f056-49a8-80f4-a6ea521b0c94
      tokenIntrospectionEndpoint: http://localhost:8080/auth/realms/master/protocol/openid-connect/token/introspect
      tokenEndpoint: http://localhost:8080/auth/realms/master/protocol/openid-connect/token
      authorizeEndpoint: http://localhost:8080/auth/realms/master/protocol/openid-connect/auth
      userInfoEndpoint: http://localhost:8080/auth/realms/master/protocol/openid-connect/userinfo
      userLogoutEndpoint: http://localhost:8080/auth/realms/master/protocol/openid-connect/logout
      color: "#0076b4"
      syncMappings: false
      scopes:
        - openid
        - profile
      userMapping:
        id: sub
        email: email
        lastname: family_name
        firstname: given_name
        picture: picture
      groupMapping:
        - condition: "{#jsonPath(#profile, '$.identity_provider_id') == 'PARTNERS' && #jsonPath(#profile, '$.job_id') != 'API_MANAGER'}"
          groups:
            - Group 1
            - Group 2
      roleMapping:
        - condition: "{#jsonPath(#profile, '$.job_id') != 'API_MANAGER'}"
          roles:
            - "ORGANIZATION:USER"
            - "ENVIRONMENT:API_CONSUMER"                  #applied to the DEFAULT environment
            - "ENVIRONMENT:DEFAULT:API_CONSUMER"          #applied to the DEFAULT environment
            - "ENVIRONMENT:<ENVIRONMENT_ID>:API_CONSUMER" #applied to environment whose id is <ENVIRONMENT_ID>
----

== Test the connection

=== Create a new user in Keycloak

. Create your new user.
+
image::{% link images/apim/3.x/installation/authentication/keycloak_users.png %}[Create a user]
+
. Enter the user details.
+
image::{% link images/apim/3.x/installation/authentication/keycloak_create_user.png %}[Fill the user form]

. Define the user credentials.
+
image::{% link images/apim/3.x/installation/authentication/keycloak_create_user_credentials.png %}[Define user credentials]

=== Log in to APIM Portal
. Click *Sign in with Keycloak*.
+
image::{% link images/apim/3.x/installation/authentication/keycloak_login_form.png %}[Login Form]

. Enter the Keycloak credentials and click *Log In*.
+
image::{% link images/apim/3.x/installation/authentication/keycloak_login_form2.png %}[Keycloak Login Form]
+
You have successfully logged in:
+
image::{% link images/apim/3.x/installation/authentication/keycloak_login_success.png %}[Here we are !]

== Managing roles with keycloak

Configure Keycloak and Gravitee to map your own organization with available built-in or your custom registered roles. 

=== Gravitee roles console

. Consider built-in or create custom Gravitee roles.
+
image::{% link images/apim/3.x/installation/authentication/keycloak_mng-00-gravitee-default_roles.png %}[Gravitee console - roles page]

=== Create and configure Keycloak Client scope
. In your realm, go to the `Client scopes` page.

. Set a special gravitee-client-groups https://oauth.net/2/scope/[Scope] that will contain users' roles.
+
image::{% link images/apim/3.x/installation/authentication/keycloak_mng-01-client_scopes-roles_add_client_scope.png %}[Keycloak console - Create scope]

.  In the new client scope, set a mapper with Claim name "groups".
+
image::{% link images/apim/3.x/installation/authentication/keycloak_mng-02-client_scopes-mapper.png %}[Keycloak console - Add mapper to scope]

. In your realm, go to the `Client` page, and select your Client.
. Add the new configured scope in the `Client Scopes` tab.
+
image::{% link images/apim/3.x/installation/authentication/keycloak_mng-03-client-add_scope.png %}[Keycloak console - Add scope to client]

=== Create Keycloak Client roles 

. In your client, create roles as needed by organization.
+
image::{% link images/apim/3.x/installation/authentication/keycloak_mng-04-client-add_roles.png %}[Keycloak console - Create client roles ]

=== Configure Keycloack users with appropiate roles

image::{% link images/apim/3.x/installation/authentication/keycloak_mng-roles-05-users-add_user_client_roles.png %}[Keycloak console - Add roles to user]

=== Configure Gravitee role mappings

Gravitee role mapping uses Spring Expression Language (https://docs.spring.io/spring-framework/docs/3.0.x/reference/expressions.html[SpEL^]) for writting conditions. The only available object in context is #profile set from https://www.oauth.com/oauth2-servers/signing-in-with-google/verifying-the-user-info/[userInfoEndpoint^].

[source,yaml]
----
security:
  providers:
    - type: oidc
      ...
      roleMapping:
        - condition: "{(#jsonPath(#profile, '$.groups') matches 'gravitee-admin' )}"
          roles:
            - "ORGANIZATION:ADMIN"
            - "ENVIRONMENT:ADMIN"
----


