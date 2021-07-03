This one's weird.

So the normal doc contains almost literally nothing:
https://developer.salesforce.com/docs/atlas.en-us.lwc.meta/lwc/lwc_intro.htm

It only contains a reference to the aura app we've broken down in [aura_lwc_component_docs.md](aura_lwc_component_docs.md): https://developer.salesforce.com/docs/component-library/documentation/en/lwc

However, when peeking the network tab in dev tools for the Developer Guide tab on the website, it pings a URL for one of the methods we identified in [aura_lwc_component_docs.md](aura_lwc_component_docs.md)

https://developer.salesforce.com/docs/component-library/aura?r=3&ui-lightning-docs-components-aura-components-controllers.ComponentLibraryDataProvider.getExternalDocumentationDocumentWithDefaultContent=1

    await fetch("https://developer.salesforce.com/docs/component-library/aura?r=3&ui-lightning-docs-components-aura-components-controllers.ComponentLibraryDataProvider.getExternalDocumentationDocumentWithDefaultContent=1", {
        "credentials": "include",
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.5",
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
        },
        "referrer": "https://developer.salesforce.com/docs/component-library/documentation/en/lwc",
        "body": "message=%7B%22actions%22%3A%5B%7B%22id%22%3A%2294%3Ba%22%2C%22descriptor%22%3A%22serviceComponent%3A%2F%2Fui.lightning.docs.components.aura.components.controllers.ComponentLibraryDataProviderController%2FACTION%24getExternalDocumentationDocumentWithDefaultContent%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22documentId%22%3A%22lwc%22%2C%22major%22%3A%22232%22%2C%22language%22%3A%22en%22%2C%22countryCode%22%3A%22us%22%7D%2C%22storable%22%3Atrue%7D%5D%7D&aura.context=%7B%22mode%22%3A%22PROD%22%2C%22fwuid%22%3A%220lEhuHYJBRuSnxadQW0Iww%22%2C%22app%22%3A%22componentReference%3AoffCoreSuite%22%2C%22loaded%22%3A%7B%22APPLICATION%40markup%3A%2F%2FcomponentReference%3AoffCoreSuite%22%3A%220dOFyxt2Rt-bEEK06flBpA%22%2C%22MODULE%40markup%3A%2F%2Fcomponentreference%3AexternalDocumentation%22%3A%221dvrQV6PwzcsuOLHAj_uoQ%22%7D%2C%22dn%22%3A%5B%5D%2C%22globals%22%3A%7B%7D%2C%22uad%22%3Afalse%7D&aura.pageURI=%2Fdocs%2Fcomponent-library%2Fdocumentation%2Fen%2Flwc&aura.token=aura",
        "method": "POST",
        "mode": "cors"
    });

Now - see [aura_lwc_component_docs.md](aura_lwc_component_docs.md) for guidelines on stripping that fetch request down.

But in terms of the actual JSON content, what's interesting is that it looks suspiciously similar to regular docs once you get down to `actions[0].returnValue.document.topics`. So possibly there was some reuse under the hood of the ToC structure used in the angular doc app, when they moved things over to the aura component-library app. Here's an example request for a specific page. We can probably strip this down too. Should be fun

    await fetch("https://developer.salesforce.com/docs/component-library/aura?r=5&ui-lightning-docs-components-aura-components-controllers.ComponentLibraryDataProvider.getExternalDocumentationTopicContent=1", {
        "credentials": "include",
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.5",
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
        },
        "referrer": "https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.security_locker_strict_mode",
        "body": "message=%7B%22actions%22%3A%5B%7B%22id%22%3A%22105%3Ba%22%2C%22descriptor%22%3A%22serviceComponent%3A%2F%2Fui.lightning.docs.components.aura.components.controllers.ComponentLibraryDataProviderController%2FACTION%24getExternalDocumentationTopicContent%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22contentId%22%3A%22lwc.security_locker_strict_mode%22%2C%22major%22%3A%22232%22%2C%22language%22%3A%22en%22%2C%22countryCode%22%3A%22us%22%7D%2C%22storable%22%3Atrue%7D%5D%7D&aura.context=%7B%22mode%22%3A%22PROD%22%2C%22fwuid%22%3A%220lEhuHYJBRuSnxadQW0Iww%22%2C%22app%22%3A%22componentReference%3AoffCoreSuite%22%2C%22loaded%22%3A%7B%22APPLICATION%40markup%3A%2F%2FcomponentReference%3AoffCoreSuite%22%3A%220dOFyxt2Rt-bEEK06flBpA%22%2C%22MODULE%40markup%3A%2F%2Fcomponentreference%3AexternalDocumentation%22%3A%221dvrQV6PwzcsuOLHAj_uoQ%22%7D%2C%22dn%22%3A%5B%5D%2C%22globals%22%3A%7B%7D%2C%22uad%22%3Afalse%7D&aura.pageURI=%2Fdocs%2Fcomponent-library%2Fdocumentation%2Fen%2Flwc%2Flwc.security_locker_strict_mode&aura.token=aura",
        "method": "POST",
        "mode": "cors"
    });