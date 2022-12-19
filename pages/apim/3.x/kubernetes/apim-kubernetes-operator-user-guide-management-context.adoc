[[apim-kubernetes-operator-user-guide-management-context]]
= How to use the Management Context custom resource
:page-sidebar: apim_3_x_sidebar
:page-permalink: apim/3.x/apim_kubernetes_operator_user_guide_management_context.html
:page-folder: apim/kubernetes
:page-layout: apim3x

[label label-version]#New in version 3.19.0#
[label label-version]#BETA release#

== How to use the Management Context (`ManagementContext`) custom resource

To enable synchronization of CRDs with a remote link:https://docs.gravitee.io/apim/3.x/apim_overview_architecture.html[management API^], you need to create a Management Context referring to an existing link:https://docs.gravitee.io/am/current/am_adminguide_organizations_and_environments.html[organization and environment^].

You can create multiple Management Contexts, each targeting a specific environment and defined in a specific organization of a management API instance.

A Management Context can authenticate to your management API instance by using either basic authentication or a bearer token. Authentication credentials may either be added inline in the Management Context definition or referenced from a Kubernetes secret.

NOTE: If both credentials and a bearer token are defined in your custom resource, the bearer token will take precedence.

== Examples

The custom resource in the example below refers to a Management API instance exposed at `+https://gravitee-api.acme.com+`, and targets the `dev` environment of the `acme` organization, with the `admin` account, using basic authentication credentials defined in a Kubernetes secret:

Creating a secret to store the credentials:

[source,yaml]
----
kubectl create secret generic management-context-credentials \
  --from-literal=username=admin \
  --from-literal=password=admin \
  --namespace graviteeio
----

Defining a Management Context referencing the secret:

[,yaml]
----
apiVersion: gravitee.io/v1alpha1
kind: ManagementContext
metadata:
  name: apim-example-context
  namespace: graviteeio
spec:
  baseUrl: https://gravitee-api.acme.com
  environmentId: dev
  organizationId: acme
  auth:
    secretRef:
      name: management-context-credentials
----

NOTE: If no namespace has been specified for the secret reference, the management context resource namespace will be used to resolve the secret.

NOTE: To target another environment on the same API instance, add another Management Context configured to do that.

Although Kubernetes secrets should be the preferred way to store credentials, you can also add credentials inline in the Management Context definition:

[,yaml]
----
apiVersion: gravitee.io/v1alpha1
kind: ManagementContext
metadata:
  name: apim-example-context
  namespace: graviteeio
spec:
  baseUrl: https://gravitee-api.acme.com
  environmentId: dev
  organizationId: acme
  auth:
    credentials:
      username: admin
      password: admin
----

[,yaml]

The example below uses a `bearerToken` to authenticate the requests. Note that the token must have been generated beforehand for the admin account:

[,yaml]
----
apiVersion: gravitee.io/v1alpha1
kind: ManagementContext
metadata:
  name: apim-example-context
spec:
  baseUrl: https://gravitee-api.acme.com
  environmentId: staging
  organizationId: acme
  auth:
    bearerToken: xxxx-yyyy-zzzz
----

Alternatively, here is how to use a Kubernetes secret to store the token:

[source,yaml]
----
kubectl create secret generic management-context-credentials \
  --from-literal=bearerToken=xxxx-yyyy-zzzz \
  --namespace graviteeio
----

[,yaml]
----
apiVersion: gravitee.io/v1alpha1
kind: ManagementContext
metadata:
  name: apim-example-context
spec:
  baseUrl: https://gravitee-api.acme.com
  environmentId: staging
  organizationId: acme
  auth:
    secretRef:
      name: management-context-credentials
----
