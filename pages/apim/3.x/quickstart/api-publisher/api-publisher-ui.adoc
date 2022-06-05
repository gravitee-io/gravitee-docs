= Publish your first API with APIM Console
:page-sidebar: apim_3_x_sidebar
:page-permalink: apim/3.x/apim_quickstart_publish_ui.html
:page-folder: apim/quickstart/api-publisher
:page-layout: apim3x

== Overview

This section walks you through creating and publishing your first API with APIM Console. To learn more about creating and publishing APIs, see the link:{{ '/apim/3.x/apim_publisherguide_manage_apis.html' | relative_url }}[API Publisher Guide].

== Create your API with APIM Console

. Log in to APIM Console.
. Click **Start creating an API**.
+
image::{% link images/apim/3.x/quickstart/publish/graviteeio-create-api-1.png %}[]

. Click *CREATE*.
+
image::{% link images/apim/3.x/quickstart/publish/graviteeio-create-api-2.png %}[]

. Give your API a name, a version, a description and a context path. **Click NEXT**.
+
image::{% link images/apim/3.x/quickstart/publish/graviteeio-create-first-api-1.png %}[]

. Set **Backend** to the URL of the API, in this example `https://api.gravitee.io/echo`. Click **NEXT**.
+
image::{% link images/apim/3.x/quickstart/publish/graviteeio-create-first-api-2.png %}[]
+
NOTE: Before consumers can subscribe to your API, you must publish one or more _plans_, as described in the following step. A plan gives access to the API operations.

. Create a plan by giving it a name, a description and a security type. Switch on the **Auto validate subscription** option. Click **NEXT**.
+
image::{% link images/apim/3.x/quickstart/publish/graviteeio-create-first-api-3.png %}[]
+
NOTE: Ensure you set the link:{{ '/apim/3.x/apim_policies_apikey.html' | relative_url }}[API Key] **security type**. For more information about plan configuration, see the link:{{ '/apim/3.x/apim_publisherguide_plans_subscriptions.html' | relative_url }}[API Publisher Plans and subscriptions Guide].

. In the **Doc** step, you can add some Markdown and OpenAPI files. You can skip this step for now. Click **SKIP**.
+
image::{% link images/apim/3.x/quickstart/publish/graviteeio-create-first-api-4.png %}[]

. Check your API information before deploying it. When you are ready, click **CREATE AND START THE API**.
+
image::{% link images/apim/3.x/quickstart/publish/graviteeio-create-first-api-5.png %}[]

Congratulations! You have created your brand new API, published a plan and, if an APIM Gateway instance is running, deployed your API.

image::{% link images/apim/3.x/quickstart/publish/graviteeio-create-first-api-6.png %}[]

You need to complete one more step before your API is ready to be used by your consumers: click **PUBLISH THE API** to display the API in APIM Portal.

image::{% link images/apim/3.x/quickstart/publish/graviteeio-create-first-api-7.png %}[]


== Import your API with APIM Console

Alternatively you can import an existing API specification.

We are going to use an existing API specification. For this example, we’ll use the link:{{'https://petstore.swagger.io/v2/swagger.json'}}[Swagger PetStore API example, window=\"_blank\"]. Download a copy, and click ‘Import’ and then ‘Choose File’ on the next screen:

image::{% link images/apim/3.x/quickstart/publish/graviteeio-import-api-1.png %}[]
image::{% link images/apim/3.x/quickstart/publish/graviteeio-import-api-2.png %}[]

. Once the file has been selected, you will have some additional options available to you. In this quick example, we will focus on 2 options only. Check that they are selected :
* **Create policies on path** — this option will create each endpoint and associated methods based on the imported swagger file
* **Apply Mock policies** — this option will create a mock policy for each endpoint based on examples provided in the imported swagger file
+
Then click import :
+
image::{% link images/apim/3.x/quickstart/publish/graviteeio-import-api-3.png %}[]

. A screen with options to configure your API will now appear. Don’t worry about the gold bar ‘API out of sync, deploy your API’, we have a number of things to do first.
+
To be able to test out our API, we will need to create a plan. A plan always needs to be created, and gives us the ability to control how an API is accessed. For this example, we’re going to create a keyless plan — this will allow anybody to access the API. Select ‘Plans’, the Plans window will appear:
+
image::{% link images/apim/3.x/quickstart/publish/graviteeio-import-api-4.png %}[]
image::{% link images/apim/3.x/quickstart/publish/graviteeio-import-api-5.png %}[]

. To add a new plan, press (+). Then provide a Name and Description for the plan, scroll down and click ‘Next’:
+
image::{% link images/apim/3.x/quickstart/publish/graviteeio-import-api-6.png %}[]

. On the next screen, select ‘Keyless (public)’ from the ‘Authentication type’ drop-down menu:
+
image::{% link images/apim/3.x/quickstart/publish/graviteeio-import-api-7.png %}[]

. Keep clicking through on ‘Next’ until you’ve completed the plan creation process. We will now need to publish the plan so that it can be used. Click the picture of the Cloud with the upward pointing arrow:
+
image::{% link images/apim/3.x/quickstart/publish/graviteeio-import-api-8.png %}[]

. The last step that remains is to start the API. Go to ‘Details’ under ‘General’, scrolling down to the ‘Danger Zone’. Select ‘START THE API’. This will sync the deployment of the API and associated plan, as well as starting the API itself.
+
image::{% link images/apim/3.x/quickstart/publish/graviteeio-import-api-9.png %}[]
