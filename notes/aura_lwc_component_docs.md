# General Comments
https://developer.salesforce.com/docs/component-library/overview/components
Seems like the Component Reference page might be a "dogfood" type thing - very differently structured to the standard atlas/json toc angular app that drives the standard documentation.

# Possible driver of component reference page
https://developer.salesforce.com/components/componentReference/baseSuite.js

# A possible ToC of Sorts?
https://developer.salesforce.com/components/componentReference/dataProviderLib.js
e.g. searching for "accordion" in Debugger gives few results, but turns up this file, which has a variety of arrays. These seem to describe some aspects of the interface. The arrays seem to relate to the `aura` part of the sidebar, but not the `Lightning Web Components`? e.g. includes lightning:accordion from the aura>lightning menu, but not lightning-accordion from the LWC>lightning menu

Doesn't seem to include the Events menu either (e.g. no results for conversationAgentSend)

# DataProvider
Somewhere, in some form, appears to be a thing called a dataProvider, providing methods like:
- b.get('v.dataProvider.0').getBundleDefinitionsList()
- b.get('v.dataProvider.0').getBundleDefinition(d.descriptorName)
  - Where e.g. descriptorName = 'lightning-accordion'
- Here's a dump of interesting things (from breakpointing line 203 in baseSuite.js, in the viewBundle Function)
  - getAppConfiguration: function nE()
  - getBundleDefinition: function nE()
  - getBundleDefinitions: function nE()
  - getBundleDefinitionsList: function nE()
  - getCustomBundleDefinitionsList: function nE()
  - getExternalDocumentationDocument: function nE()
  - getExternalDocumentationDocumentWithDefaultContent: function nE()
  - getExternalDocumentationTopicContent: function nE()
  - getGlobalStandardBundleDefinitionsList: function nE()
  - getPackagedComponentDefinitionsList: function nE()
  - searchExternalDocumentation: function nE()
  - setAppConfiguration: function nE()
- See a little lower for an exploration of some of these. Just ctrl/cmd+f for them


In viewBundle, the getBundleDefinition method is given a parameter d.descriptorName, where d is (e.g.) this object. Maybe finding the source of this d object will help?
{
  "descriptorName": "lightning:omniChannelLogout",
  "namespace": "lightning",
  "name": "omniChannelLogout",
  "defType": "event",
  "owner": "Salesforce",
  "image": "/docs/component-library/app/images/components/genericIcon.png",
  "experience": "N/A",
  "category": "N/A",
  "framework": "Aura Components"
}

viewBundle takes two params (b,a).
- b is fairly arcane/minified
- a is e.g. {
        "target": "bundle",
        "component": "lightning:omniChannelLogout"
    }

the `d` object discussed above is obtained from these two:
- var d = b.get('v.inventory') [a.component];
- the `get` method is a prototype method on `G`
  - Debugging `get` is interesting, an intermediate object d seems to come into existence, and includes on it an object A, which includes a prop selectedRoute: Object { target: "bundle", component: "lightning:conversationChatEnded" }
​​

Calling the method `b.get('v.dataProvider.0').getBundleDefinitionsList().then(res=>console.log(res));`  looks like a bit of a goldmine:
- added to `getBundleDefinitionsList.json`
- Probing the Network tab, we can get a `fetch` call for this:
  - var myResponse = await fetch("https://developer.salesforce.com/docs/component-library/aura?r=30&ui-lightning-docs-components-aura-components-controllers.ComponentLibraryDataProvider.getBundleDefinitionsList=1", {
        "credentials": "include",
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.5",
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
        },
        "referrer": "https://developer.salesforce.com/docs/component-library/bundle/ui:menuFocusChange",
        "body": "message=%7B%22actions%22%3A%5B%7B%22id%22%3A%22649%3Ba%22%2C%22descriptor%22%3A%22serviceComponent%3A%2F%2Fui.lightning.docs.components.aura.components.controllers.ComponentLibraryDataProviderController%2FACTION%24getBundleDefinitionsList%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%7D%2C%22storable%22%3Atrue%7D%5D%7D&aura.context=%7B%22mode%22%3A%22PROD%22%2C%22fwuid%22%3A%220lEhuHYJBRuSnxadQW0Iww%22%2C%22app%22%3A%22componentReference%3AoffCoreSuite%22%2C%22loaded%22%3A%7B%22APPLICATION%40markup%3A%2F%2FcomponentReference%3AoffCoreSuite%22%3A%220dOFyxt2Rt-bEEK06flBpA%22%2C%22MODULE%40markup%3A%2F%2Fcomponentreference%3AexternalDocumentation%22%3A%221dvrQV6PwzcsuOLHAj_uoQ%22%2C%22COMPONENT%40markup%3A%2F%2Flightningcomponentdemo%3AexampleAccordionBasic%22%3A%22riEo4KQhYsoNg4d09UdBwQ%22%2C%22MODULE%40markup%3A%2F%2FcomponentReference%3Aevents%22%3A%22oRhNJMHerwIIkIkPANPIKQ%22%7D%2C%22dn%22%3A%5B%5D%2C%22globals%22%3A%7B%7D%2C%22uad%22%3Afalse%7D&aura.pageURI=%2Fdocs%2Fcomponent-library%2Fbundle%2Fui%3AmenuFocusChange&aura.token=aura",
        "method": "POST",
        "mode": "cors"
    });
    myResponse.text().then(data=>console.log(data))
  - this gets us essentially the same result
    - Also useful to note, getBundleDefinitions and getBundleDefinitionsList appear to visually be the same thing, and have the same number of keys
      - getBundleDefinitions().then(res=>console.log(Object.keys(res).length)) = 358
      - getBundleDefinitionsList().then(res=>console.log(Object.keys(res).length)) = 358
      - as does getGlobalStandardBundleDefinitionsList()
    - More notes:
      - getPackagedComponentDefinitionsList returns nothing, though this was in an unuathed context. I STRONGLY suspect this will return info on custom LWCs when in an authed context (with LWCs present in Org)
        - Either that or getCustomBundleDefinitionsList - which also returned nothing. Quite likely both do something useful when authed
      - getAppConfiguration DOES nothing, just gives undefined
  - Question then is likely, what's the minimum we can get away with. How much garbage do we need to send?
    - Removing:
      - `referrer` = still works
      - `mode` = still works (though note, calling from console in LWC doc page
      - `method` = BREAKS
      - `body` = BREAKS
      - `headers` = BREAKS if removing entire thing
        - `User-Agent` = still works if removed
        - `Accept-Language` = still works if removed
        - `Accept` = still works if removed
        - `Content-Type` = BREAKS if removed
          - Likely linked to the `body` of course - may be able to switch it to a more legible JSON input? Will try to decode that body shortly
      - `credentials` = still works.
        - Suspect this may be linked to the ability of this doc viewer to show custom components from an SF Org if authenticated? Could be worth looking into, in the far future
  - So decoding the body reveals it's hiding a bunch of json params, and some other stuff too.
    - url enc
      - message=%7B%22actions%22%3A%5B%7B%22id%22%3A%22649%3Ba%22%2C%22descriptor%22%3A%22serviceComponent%3A%2F%2Fui.lightning.docs.components.aura.components.controllers.ComponentLibraryDataProviderController%2FACTION%24getBundleDefinitionsList%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%7D%2C%22storable%22%3Atrue%7D%5D%7D&aura.context=%7B%22mode%22%3A%22PROD%22%2C%22fwuid%22%3A%220lEhuHYJBRuSnxadQW0Iww%22%2C%22app%22%3A%22componentReference%3AoffCoreSuite%22%2C%22loaded%22%3A%7B%22APPLICATION%40markup%3A%2F%2FcomponentReference%3AoffCoreSuite%22%3A%220dOFyxt2Rt-bEEK06flBpA%22%2C%22MODULE%40markup%3A%2F%2Fcomponentreference%3AexternalDocumentation%22%3A%221dvrQV6PwzcsuOLHAj_uoQ%22%2C%22COMPONENT%40markup%3A%2F%2Flightningcomponentdemo%3AexampleAccordionBasic%22%3A%22riEo4KQhYsoNg4d09UdBwQ%22%2C%22MODULE%40markup%3A%2F%2FcomponentReference%3Aevents%22%3A%22oRhNJMHerwIIkIkPANPIKQ%22%7D%2C%22dn%22%3A%5B%5D%2C%22globals%22%3A%7B%7D%2C%22uad%22%3Afalse%7D&aura.pageURI=%2Fdocs%2Fcomponent-library%2Fbundle%2Fui%3AmenuFocusChange&aura.token=aura
    - decoded
      - message={"actions":[{"id":"649;a","descriptor":"serviceComponent://ui.lightning.docs.components.aura.components.controllers.ComponentLibraryDataProviderController/ACTION$getBundleDefinitionsList","callingDescriptor":"UNKNOWN","params":{},"storable":true}]}&aura.context={"mode":"PROD","fwuid":"0lEhuHYJBRuSnxadQW0Iww","app":"componentReference:offCoreSuite","loaded":{"APPLICATION@markup://componentReference:offCoreSuite":"0dOFyxt2Rt-bEEK06flBpA","MODULE@markup://componentreference:externalDocumentation":"1dvrQV6PwzcsuOLHAj_uoQ","COMPONENT@markup://lightningcomponentdemo:exampleAccordionBasic":"riEo4KQhYsoNg4d09UdBwQ","MODULE@markup://componentReference:events":"oRhNJMHerwIIkIkPANPIKQ"},"dn":[],"globals":{},"uad":false}&aura.pageURI=/docs/component-library/bundle/ui:menuFocusChange&aura.token=aura
    - So contains 4 url params:
      - message
      - aura.context
      - aura.pageURI
      - aura.token
    - Trying to simplify that - we can't sent just the `message`. That gives us:
      - */{"event":{"descriptor":"markup://aura:clientOutOfSync","eventDef":{"descriptor":"markup://aura:clientOutOfSync","t":"APPLICATION","xs":"I"}},"exceptionEvent":true}/*ERROR*/
    - What about just `message` and `aura.context` - nope
      - */{"event":{"descriptor":"markup://aura:systemError","attributes":{"values":{"message":"Missing parameter value for aura.token"}}},"exceptionEvent":true}/*ERROR*/
    - What about everything but pageURI
      - That works - so aura.pageURI is not necessary?
      - Here's the sample:
        - message=%7B%22actions%22%3A%5B%7B%22id%22%3A%22649%3Ba%22%2C%22descriptor%22%3A%22serviceComponent%3A%2F%2Fui.lightning.docs.components.aura.components.controllers.ComponentLibraryDataProviderController%2FACTION%24getBundleDefinitionsList%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%7D%2C%22storable%22%3Atrue%7D%5D%7D&aura.context=%7B%22mode%22%3A%22PROD%22%2C%22fwuid%22%3A%220lEhuHYJBRuSnxadQW0Iww%22%2C%22app%22%3A%22componentReference%3AoffCoreSuite%22%2C%22loaded%22%3A%7B%22APPLICATION%40markup%3A%2F%2FcomponentReference%3AoffCoreSuite%22%3A%220dOFyxt2Rt-bEEK06flBpA%22%2C%22MODULE%40markup%3A%2F%2Fcomponentreference%3AexternalDocumentation%22%3A%221dvrQV6PwzcsuOLHAj_uoQ%22%2C%22COMPONENT%40markup%3A%2F%2Flightningcomponentdemo%3AexampleAccordionBasic%22%3A%22riEo4KQhYsoNg4d09UdBwQ%22%2C%22MODULE%40markup%3A%2F%2FcomponentReference%3Aevents%22%3A%22oRhNJMHerwIIkIkPANPIKQ%22%7D%2C%22dn%22%3A%5B%5D%2C%22globals%22%3A%7B%7D%2C%22uad%22%3Afalse%7D&aura.token=aura
    - So let's decompose the url params:
      - message
        - decoded: message={"actions":[{"id":"649;a","descriptor":"serviceComponent://ui.lightning.docs.components.aura.components.controllers.ComponentLibraryDataProviderController/ACTION$getBundleDefinitionsList","callingDescriptor":"UNKNOWN","params":{},"storable":true}]}
        - So it's just some JSON
        - Probably need to see if we can trim it down?
      - TODO: Setting this aside for a second. When reloading the page, there's another request that seems to contain what we want, and it is GNARLY
      - [POSS COME BACK TO THIS LATER]


- So this happens on page load, and seems to be the initial source for the menu:
  - var myResponse = await fetch("https://developer.salesforce.com/docs/component-library/aura?r=0&aura.Label.getLabel=51&ui-lightning-docs-components-aura-components-controllers.ComponentLibraryDataProvider.getBundleDefinitionsList=1&ui-lightning-docs-components-aura-components-controllers.DSC.getHeaderMarkup=1", {
        "credentials": "include",
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.5",
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
        },
        "referrer": "https://developer.salesforce.com/docs/component-library",
        "body": "message=%7B%22actions%22%3A%5B%7B%22id%22%3A%221%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22Duration%22%2C%22name%22%3A%22secondsLater%22%7D%7D%2C%7B%22id%22%3A%222%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22Duration%22%2C%22name%22%3A%22secondsAgo%22%7D%7D%2C%7B%22id%22%3A%226%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22LightningHelptext%22%2C%22name%22%3A%22buttonAlternativeText%22%7D%7D%2C%7B%22id%22%3A%227%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22LightningColorPicker%22%2C%22name%22%3A%22bInput%22%7D%7D%2C%7B%22id%22%3A%228%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22LightningColorPicker%22%2C%22name%22%3A%22blueAbbr%22%7D%7D%2C%7B%22id%22%3A%229%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22LightningColorPicker%22%2C%22name%22%3A%22colorPickerInstructions%22%7D%7D%2C%7B%22id%22%3A%2210%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22LightningColorPicker%22%2C%22name%22%3A%22errorMessage%22%7D%7D%2C%7B%22id%22%3A%2211%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22LightningColorPicker%22%2C%22name%22%3A%22gInput%22%7D%7D%2C%7B%22id%22%3A%2212%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22LightningColorPicker%22%2C%22name%22%3A%22greenAbbr%22%7D%7D%2C%7B%22id%22%3A%2213%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22LightningColorPicker%22%2C%22name%22%3A%22hexLabel%22%7D%7D%2C%7B%22id%22%3A%2214%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22LightningColorPicker%22%2C%22name%22%3A%22hueInput%22%7D%7D%2C%7B%22id%22%3A%2215%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22LightningColorPicker%22%2C%22name%22%3A%22rInput%22%7D%7D%2C%7B%22id%22%3A%2216%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22LightningColorPicker%22%2C%22name%22%3A%22redAbbr%22%7D%7D%2C%7B%22id%22%3A%2217%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22LightningErrorMessage%22%2C%22name%22%3A%22validityBadInput%22%7D%7D%2C%7B%22id%22%3A%2218%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22LightningErrorMessage%22%2C%22name%22%3A%22validityPatternMismatch%22%7D%7D%2C%7B%22id%22%3A%2219%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22LightningErrorMessage%22%2C%22name%22%3A%22validityRangeOverflow%22%7D%7D%2C%7B%22id%22%3A%2220%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22LightningErrorMessage%22%2C%22name%22%3A%22validityRangeUnderflow%22%7D%7D%2C%7B%22id%22%3A%2221%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22LightningErrorMessage%22%2C%22name%22%3A%22validityStepMismatch%22%7D%7D%2C%7B%22id%22%3A%2222%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22LightningErrorMessage%22%2C%22name%22%3A%22validityTooLong%22%7D%7D%2C%7B%22id%22%3A%2223%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22LightningErrorMessage%22%2C%22name%22%3A%22validityTooShort%22%7D%7D%2C%7B%22id%22%3A%2224%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22LightningErrorMessage%22%2C%22name%22%3A%22validityTypeMismatch%22%7D%7D%2C%7B%22id%22%3A%2225%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22LightningErrorMessage%22%2C%22name%22%3A%22validityValueMissing%22%7D%7D%2C%7B%22id%22%3A%2226%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22LightningColorPicker%22%2C%22name%22%3A%22cancelButton%22%7D%7D%2C%7B%22id%22%3A%2227%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22LightningColorPickerPanel%22%2C%22name%22%3A%22customTab%22%7D%7D%2C%7B%22id%22%3A%2228%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22LightningColorPickerPanel%22%2C%22name%22%3A%22defaultTab%22%7D%7D%2C%7B%22id%22%3A%2229%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22LightningColorPicker%22%2C%22name%22%3A%22doneButton%22%7D%7D%2C%7B%22id%22%3A%2230%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22LightningColorPicker%22%2C%22name%22%3A%22a11yTriggerText%22%7D%7D%2C%7B%22id%22%3A%2231%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22LightningControl%22%2C%22name%22%3A%22required%22%7D%7D%2C%7B%22id%22%3A%2232%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22LightningDateTimePicker%22%2C%22name%22%3A%22ariaLabelMonth%22%7D%7D%2C%7B%22id%22%3A%2233%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22LightningDateTimePicker%22%2C%22name%22%3A%22nextMonth%22%7D%7D%2C%7B%22id%22%3A%2234%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22LightningDateTimePicker%22%2C%22name%22%3A%22previousMonth%22%7D%7D%2C%7B%22id%22%3A%2235%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22LightningDateTimePicker%22%2C%22name%22%3A%22today%22%7D%7D%2C%7B%22id%22%3A%2236%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22LightningDateTimePicker%22%2C%22name%22%3A%22yearSelector%22%7D%7D%2C%7B%22id%22%3A%2237%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22LightningDateTimePicker%22%2C%22name%22%3A%22invalidDate%22%7D%7D%2C%7B%22id%22%3A%2238%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22LightningDateTimePicker%22%2C%22name%22%3A%22rangeOverflow%22%7D%7D%2C%7B%22id%22%3A%2239%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22LightningDateTimePicker%22%2C%22name%22%3A%22rangeUnderflow%22%7D%7D%2C%7B%22id%22%3A%2240%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22LightningDateTimePicker%22%2C%22name%22%3A%22selectDate%22%7D%7D%2C%7B%22id%22%3A%2241%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22LightningCombobox%22%2C%22name%22%3A%22ariaSelectedOptions%22%7D%7D%2C%7B%22id%22%3A%2242%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22LightningCombobox%22%2C%22name%22%3A%22deselectOptionKeyboard%22%7D%7D%2C%7B%22id%22%3A%2243%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22LightningCombobox%22%2C%22name%22%3A%22loadingText%22%7D%7D%2C%7B%22id%22%3A%2244%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22LightningCombobox%22%2C%22name%22%3A%22pillCloseButtonAlternativeText%22%7D%7D%2C%7B%22id%22%3A%2245%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22LightningDateTimePicker%22%2C%22name%22%3A%22dateLabel%22%7D%7D%2C%7B%22id%22%3A%2246%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22LightningDateTimePicker%22%2C%22name%22%3A%22timeLabel%22%7D%7D%2C%7B%22id%22%3A%2247%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22LightningInputFile%22%2C%22name%22%3A%22bodyText%22%7D%7D%2C%7B%22id%22%3A%2248%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22LightningInputFile%22%2C%22name%22%3A%22buttonLabel%22%7D%7D%2C%7B%22id%22%3A%2249%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22LightningControl%22%2C%22name%22%3A%22activeCapitalized%22%7D%7D%2C%7B%22id%22%3A%2250%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22LightningControl%22%2C%22name%22%3A%22inactiveCapitalized%22%7D%7D%2C%7B%22id%22%3A%2251%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22LightningControl%22%2C%22name%22%3A%22clear%22%7D%7D%2C%7B%22id%22%3A%2252%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22LightningControl%22%2C%22name%22%3A%22loading%22%7D%7D%2C%7B%22id%22%3A%2253%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22LightningInputNumber%22%2C%22name%22%3A%22incrementCounter%22%7D%7D%2C%7B%22id%22%3A%2254%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22LightningInputNumber%22%2C%22name%22%3A%22decrementCounter%22%7D%7D%2C%7B%22id%22%3A%2265%3Ba%22%2C%22descriptor%22%3A%22serviceComponent%3A%2F%2Fui.lightning.docs.components.aura.components.controllers.DSCController%2FACTION%24getHeaderMarkup%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%7D%2C%22storable%22%3Atrue%7D%2C%7B%22id%22%3A%2271%3Ba%22%2C%22descriptor%22%3A%22serviceComponent%3A%2F%2Fui.lightning.docs.components.aura.components.controllers.ComponentLibraryDataProviderController%2FACTION%24getBundleDefinitionsList%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%7D%2C%22storable%22%3Atrue%7D%5D%7D&aura.context=%7B%22mode%22%3A%22PROD%22%2C%22fwuid%22%3A%220lEhuHYJBRuSnxadQW0Iww%22%2C%22app%22%3A%22componentReference%3AoffCoreSuite%22%2C%22loaded%22%3A%7B%22APPLICATION%40markup%3A%2F%2FcomponentReference%3AoffCoreSuite%22%3A%220dOFyxt2Rt-bEEK06flBpA%22%7D%2C%22dn%22%3A%5B%5D%2C%22globals%22%3A%7B%7D%2C%22uad%22%3Afalse%7D&aura.pageURI=%2Fdocs%2Fcomponent-library&aura.token=aura",
        "method": "POST",
        "mode": "cors"
    });
    myResponse.json().then(data=>console.log(data));
  - As discussed above, a lot of this is unnecessary. Let's build our own
    - using the message part from our original request (where we were getting a specific thing), but then using the aura.context and aura.token from the second request (where we're just on the page load)
    - var myResponse = await fetch("https://developer.salesforce.com/docs/component-library/aura?r=30&ui-lightning-docs-components-aura-components-controllers.ComponentLibraryDataProvider.getBundleDefinitionsList=1", {
            "headers": {
                "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
            },
            "body": "message=%7B%22actions%22%3A%5B%7B%22id%22%3A%22649%3Ba%22%2C%22descriptor%22%3A%22serviceComponent%3A%2F%2Fui.lightning.docs.components.aura.components.controllers.ComponentLibraryDataProviderController%2FACTION%24getBundleDefinitionsList%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%7D%2C%22storable%22%3Atrue%7D%5D%7D&aura.context=%7B%22mode%22%3A%22PROD%22%2C%22fwuid%22%3A%220lEhuHYJBRuSnxadQW0Iww%22%2C%22app%22%3A%22componentReference%3AoffCoreSuite%22%2C%22loaded%22%3A%7B%22APPLICATION%40markup%3A%2F%2FcomponentReference%3AoffCoreSuite%22%3A%220dOFyxt2Rt-bEEK06flBpA%22%7D%2C%22dn%22%3A%5B%5D%2C%22globals%22%3A%7B%7D%2C%22uad%22%3Afalse%7D&aura.token=aura",
            "method": "POST"
        });
        myResponse.json().then(data=>console.log(data))
    - body looks pretty sensible for that, nothing too component specific in it - decoded version:
      - message={"actions":[{"id":"649;a","descriptor":"serviceComponent://ui.lightning.docs.components.aura.components.controllers.ComponentLibraryDataProviderController/ACTION$getBundleDefinitionsList","callingDescriptor":"UNKNOWN","params":{},"storable":true}]}&aura.context={"mode":"PROD","fwuid":"0lEhuHYJBRuSnxadQW0Iww","app":"componentReference:offCoreSuite","loaded":{"APPLICATION@markup://componentReference:offCoreSuite":"0dOFyxt2Rt-bEEK06flBpA"},"dn":[],"globals":{},"uad":false}&aura.token=aura
    - However, the aura context is interesting - specifically the two things that look token-ish in it: `fwuid`, and the loaded object's `APPLICATION@markup://componentReference:offCoreSuite`
      - We can't remove fwuid, that causes outOfSync
        - Marginally surprised about this - not totally familiar, but I thought this was some sort of session token. Given this is all public, maybe the value doesn't matter?
        - Changing the value to some random garbage doesn't work
        - However, I've noted that across reloads/browsers/time, the value seems to remain the same: "0lEhuHYJBRuSnxadQW0Iww"
        - Searching it turns up this: https://github.com/forcedotcom/aura/blob/master/aura-impl/src/main/java/org/auraframework/impl/context/AuraContextImpl.java
          - Seems to suggest that frameworkUID might not be a super important secret value. Might poss change over time with releases etc?
        - Source seems to be https://github.com/forcedotcom/aura/blob/master/aura/src/main/java/org/auraframework/adapter/ConfigAdapter.java
          - /** Returns a string to identify this unique version of the Aura framework. */
            String getAuraFrameworkNonce();
          - This will be something to keep an eye on over time, but this all suggests it's stable for a given Aura version. Who knows how/when Aura versions change however. Maybe with seasonal releases?
          - Comment here suggests something like that: https://www.reddit.com/r/netsec/comments/j8mutj/indepth_salesforce_lightning_exploitation/
            - > I tried it on a target and got "clientOutOfSync"\nA bit of googling tells me that it's refusing to deserialize because your community is either older or newer than my target. (fwuid field)\nDo you know a way around this?
      - What about the loaded object
        - var myResponse = await fetch("https://developer.salesforce.com/docs/component-library/aura?r=30&ui-lightning-docs-components-aura-components-controllers.ComponentLibraryDataProvider.getBundleDefinitionsList=1", {
                "headers": {
                    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
                },
                "body": "message=%7B%22actions%22%3A%5B%7B%22id%22%3A%22649%3Ba%22%2C%22descriptor%22%3A%22serviceComponent%3A%2F%2Fui.lightning.docs.components.aura.components.controllers.ComponentLibraryDataProviderController%2FACTION%24getBundleDefinitionsList%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%7D%2C%22storable%22%3Atrue%7D%5D%7D&aura.context=%7B%22mode%22%3A%22PROD%22%2C%22fwuid%22%3A%220lEhuHYJBRuSnxadQW0Iww%22%2C%22app%22%3A%22componentReference%3AoffCoreSuite%22%2C%22dn%22%3A%5B%5D%2C%22globals%22%3A%7B%7D%2C%22uad%22%3Afalse%7D&aura.token=aura",
                "method": "POST"
            });
            myResponse.json().then(data=>console.log(data))
        - Removing the loaded object still works.
      - Trying to strip back the message a bit more?
        - var myResponse = await fetch("https://developer.salesforce.com/docs/component-library/aura?r=30&ui-lightning-docs-components-aura-components-controllers.ComponentLibraryDataProvider.getBundleDefinitionsList=1", {
                "headers": {
                    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
                },
                "body": "message=%7B%22actions%22%3A%5B%7B%22id%22%3A%22649%3Ba%22%2C%22descriptor%22%3A%22serviceComponent%3A%2F%2Fui.lightning.docs.components.aura.components.controllers.ComponentLibraryDataProviderController%2FACTION%24getBundleDefinitionsList%22%7D%5D%7D&aura.context=%7B%22mode%22%3A%22PROD%22%2C%22fwuid%22%3A%220lEhuHYJBRuSnxadQW0Iww%22%2C%22app%22%3A%22componentReference%3AoffCoreSuite%22%2C%22dn%22%3A%5B%5D%2C%22globals%22%3A%7B%7D%2C%22uad%22%3Afalse%7D&aura.token=aura",
                "method": "POST"
            });
            myResponse.json().then(data=>console.log(data))
        - removing `storable` works
        - removing `params` works
        - removing `callingDescriptor` works
        - Now we're into the danger zone - stuff that actually looks important!
          - removing `descriptor` DOES NOT WORK - IT BREAKS
          - removing `id` does work - which is a relief, that `649;a` value looks very arbitrary
          - So only thing required is `descriptor`
          - So current working request in vscode dev tools is:
            - var myResponse = await fetch("https://developer.salesforce.com/docs/component-library/aura?r=30&ui-lightning-docs-components-aura-components-controllers.ComponentLibraryDataProvider.getBundleDefinitionsList=1", {
                "headers": {
                    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
                },
                "body": "message=%7B%22actions%22%3A%5B%7B%22descriptor%22%3A%22serviceComponent%3A%2F%2Fui.lightning.docs.components.aura.components.controllers.ComponentLibraryDataProviderController%2FACTION%24getBundleDefinitionsList%22%7D%5D%7D&aura.context=%7B%22mode%22%3A%22PROD%22%2C%22fwuid%22%3A%220lEhuHYJBRuSnxadQW0Iww%22%2C%22app%22%3A%22componentReference%3AoffCoreSuite%22%2C%22dn%22%3A%5B%5D%2C%22globals%22%3A%7B%7D%2C%22uad%22%3Afalse%7D&aura.token=aura",
                "method": "POST"
            });
            myResponse.json().then(data=>console.log(data))
          - with decoded body:
            - message={"actions":[{"descriptor":"serviceComponent://ui.lightning.docs.components.aura.components.controllers.ComponentLibraryDataProviderController/ACTION$getBundleDefinitionsList"}]}&aura.context={"mode":"PROD","fwuid":"0lEhuHYJBRuSnxadQW0Iww","app":"componentReference:offCoreSuite","dn":[],"globals":{},"uad":false}&aura.token=aura
          - Let's see if we can strip anything further from `aura.context`
            - removing `mode` works - a little surprised. The mode prop is still present on the returned context. Fine by me though
            - removing `uad` works
            - removing `globals` works
            - removing `dn` works
            - removing `app` works
            - literally the only required thing is the valid `fwuid`
            - turns out, in the url itself, the url param `r=30` is doing nothing either, so we strip that
            - in fact, even `ui-lightning-docs-components-aura-components-controllers.ComponentLibraryDataProvider.getBundleDefinitionsList=1` is doing nothing!
            - var myResponse = await fetch("https://developer.salesforce.com/docs/component-library/aura", {
                    "headers": {
                        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
                    },
                    "body": "message=%7B%22actions%22%3A%5B%7B%22descriptor%22%3A%22serviceComponent%3A%2F%2Fui.lightning.docs.components.aura.components.controllers.ComponentLibraryDataProviderController%2FACTION%24getBundleDefinitionsList%22%7D%5D%7D&aura.context=%7B%22fwuid%22%3A%220lEhuHYJBRuSnxadQW0Iww%22%7D&aura.token=aura",
                    "method": "POST"
                });
                myResponse.json().then(data=>console.log(data))
          - So our new decoded body is message={"actions":[{"descriptor":"serviceComponent://ui.lightning.docs.components.aura.components.controllers.ComponentLibraryDataProviderController/ACTION$getBundleDefinitionsList"}]}&aura.context={"fwuid":"0lEhuHYJBRuSnxadQW0Iww"}&aura.token=aura
          - That looks pretty stripped down

- XXXXXXX See notes near bottom of this block re CORS XXXXXXX Sadly, all of this might be dead in the water - CORS prevents us from retrieving any of it if we're not on the site itself, in Firefox at least.
  - Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at https://developer.salesforce.com/docs/component-library/aura?r=30&ui-lightning-docs-components-aura-components-controllers.ComponentLibraryDataProvider.getBundleDefinitionsList=1. (Reason: CORS header ‘Access-Control-Allow-Origin’ missing).
  - Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at https://developer.salesforce.com/docs/component-library/aura?r=30&ui-lightning-docs-components-aura-components-controllers.ComponentLibraryDataProvider.getBundleDefinitionsList=1. (Reason: CORS request did not succeed).
- However we seem to be able to get away with it inside VSCode? Mild concern. Will crack on though
  - Interestingly, for the get_document URLs used as the basis for everything else, the Response Headers include `Access-Control-Allow-Origin:*`, which is what we would need on the `component-library` urls in order to not hit errors in Firefox console
  - Worst comes to worst (in future I guess?), we could get in touch with the doc team and see if they'll open it up, or perhaps allow VSCode as an origin


# Implementing
So, moving to how we could possibly implement.

This very stripped down request gets us what looks to me to be the sidebar list

    var myResponse = await fetch("https://developer.salesforce.com/docs/component-library/aura", {
        "headers": {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
        },
        "body": "message=%7B%22actions%22%3A%5B%7B%22descriptor%22%3A%22serviceComponent%3A%2F%2Fui.lightning.docs.components.aura.components.controllers.ComponentLibraryDataProviderController%2FACTION%24getBundleDefinitionsList%22%7D%5D%7D&aura.context=%7B%22fwuid%22%3A%220lEhuHYJBRuSnxadQW0Iww%22%7D&aura.token=aura",
        "method": "POST"
    });
    myResponse.json().then(data=>console.log(data))

Then, our response looks like [getBundleDefinitionsList_fromurl.json](getBundleDefinitionsList_fromurl.json)

To get something resembling a ToC (though not structured like one), we can go:

    responseObject.actions[0].returnValue

This gives us an OBJECT, where all the items shown in the web sidebar are KEYS. E.g. (just a few examples)

    "lightning:verticalNavigationOverflow": {
        "descriptorName": "lightning:verticalNavigationOverflow",
        "namespace": "lightning",
        "name": "verticalNavigationOverflow",
        "defType": "component",
        "owner": "Salesforce"
    },
    "lightningsnapin-base-chat-header": {
        "descriptorName": "lightningsnapin-base-chat-header",
        "namespace": "lightningsnapin",
        "name": "base-chat-header",
        "defType": "module",
        "owner": "Salesforce"
    },
    "flexipage:availableForAllPageTypes": {
        "descriptorName": "flexipage:availableForAllPageTypes",
        "namespace": "flexipage",
        "name": "availableForAllPageTypes",
        "defType": "interface",
        "owner": "Salesforce"
    },

The object corresponding to these keys (see above) tells us how the sidebar is constructed.

The four top level headers come from `defType`. Unique values are:

    "defType": "component",
    "defType": "event",
    "defType": "module",
    "defType": "interface",

The next level down comes from `namespace`. These are too numerous to bother listing, but to give a worked example so far - "flexipage:availableForAllPageTypes" above appears in the sidebar as (noting that for whatever reason, interfaces get a special "View by namespace" option, which appears to be a bit pointless for us, as the others are already implicitly grouped by namespace, and don't show this "View by namespace"):

    interface
        > flexipage

The next sidebar level comes from `name`. So following our last worked example:

    interface
        > flexipage
            > availableForAllPageTypes

This allows us to build our breadcrumb for VSCode quick pick.

Update: interestingly, the defTypes map in a slightly less obvious way in the UI, so implementation has a special mapping for how we display the defTypes, to match the UI ToC sidebar

    component = 'Aura'
    event = 'Events'
    module = 'Lightning'
    interface = 'Interfaces'

In terms of URL building, we have the same base url as in [SalesforceReference.ts](SalesforceReference.ts)

    https://developer.salesforce.com/docs

Interestingly, the response actually includes info on the relevant initial path

    responseObject.context.contextPath == "/docs/component-library"

However, there's no mention of the next part: `/bundle`. So for our implementation, it's probably sufficient to just say that our base path is as follows - as that doesn't vary

    const componentBasePath = SalesforceReference.SF_DOC_ROOT_URL + '/component-library/bundle`

So now, to build our url, we just need to append a slash and the `descriptorName` e.g.

    (componentBasePath + '/' + 'flexipage:availableForAllPageTypes') == 'https://developer.salesforce.com/docs/component-library/bundle/flexipage:availableForAllPageTypes'

So what do we do when the user wants to view documentation. Given our raw URL above, we can't just hit that and get something useful. Loading it in a web browser generally redirects you to the `/documentation` page. So we'll do that

    (componentBasePath + '/' + 'flexipage:availableForAllPageTypes' + '/documentation') == 'https://developer.salesforce.com/docs/component-library/bundle/flexipage:availableForAllPageTypes/documentation'

Update: - not actually doing this. Some pages don't have a /documentation tab. However, the human-readable pages always show an appropriate tab, so we just don't add the /documentation to path

And to display in the experimental webview? Can we pull the web page directly? No, the url itself just pulls in more javascript - the body itself is useless. Under the hood, when you go to load the documentation for something, it does an xhr request that, when copied from dev tools as fetch, should look pretty familiar when compared to the one we use to get the "ToC". The URL is the same, the URL params are irrelevent - it's really just the body>message that dictates what's happening

    await fetch("https://developer.salesforce.com/docs/component-library/aura", {
        "credentials": "include",
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.5",
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
        },
        "referrer": "https://developer.salesforce.com/docs/component-library/bundle/flexipage:availableForAllPageTypes/documentation",
        "body": "message=%7B%22actions%22%3A%5B%7B%22id%22%3A%2279%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22LightningTree%22%2C%22name%22%3A%22collapseBranch%22%7D%7D%2C%7B%22id%22%3A%2280%3Ba%22%2C%22descriptor%22%3A%22aura%3A%2F%2FLabelController%2FACTION%24getLabel%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22section%22%3A%22LightningTree%22%2C%22name%22%3A%22expandBranch%22%7D%7D%2C%7B%22id%22%3A%2282%3Ba%22%2C%22descriptor%22%3A%22serviceComponent%3A%2F%2Fui.lightning.docs.components.aura.components.controllers.ComponentLibraryDataProviderController%2FACTION%24getBundleDefinition%22%2C%22callingDescriptor%22%3A%22UNKNOWN%22%2C%22params%22%3A%7B%22descriptor%22%3A%22flexipage%3AavailableForAllPageTypes%22%7D%2C%22storable%22%3Atrue%7D%5D%7D&aura.context=%7B%22mode%22%3A%22PROD%22%2C%22fwuid%22%3A%220lEhuHYJBRuSnxadQW0Iww%22%2C%22app%22%3A%22componentReference%3AoffCoreSuite%22%2C%22loaded%22%3A%7B%22APPLICATION%40markup%3A%2F%2FcomponentReference%3AoffCoreSuite%22%3A%220dOFyxt2Rt-bEEK06flBpA%22%7D%2C%22dn%22%3A%5B%5D%2C%22globals%22%3A%7B%7D%2C%22uad%22%3Afalse%7D&aura.pageURI=%2Fdocs%2Fcomponent-library%2Fbundle%2Fflexipage%3AavailableForAllPageTypes%2Fdocumentation&aura.token=aura",
        "method": "POST",
        "mode": "cors"
    });

Taking what we learned about stripping down this POST above, let's strip this request bare. For the message, we only need the object in the actions array that's actually getting what we need. So quickly breaking that down. We only need the third element from the following, and almost certainly only the `descriptor` and `params` - noting that we previously stripped empty `params`, but will leave it in here as it has the actual ref to the doc we want:

    {
        "actions": [
            {
                "id": "79;a",
                "descriptor": "aura://LabelController/ACTION$getLabel",
                "callingDescriptor": "UNKNOWN",
                "params": {
                    "section": "LightningTree",
                    "name": "collapseBranch"
                }
            },
            {
                "id": "80;a",
                "descriptor": "aura://LabelController/ACTION$getLabel",
                "callingDescriptor": "UNKNOWN",
                "params": {
                    "section": "LightningTree",
                    "name": "expandBranch"
                }
            },
            {
                "id": "82;a",
                "descriptor": "serviceComponent://ui.lightning.docs.components.aura.components.controllers.ComponentLibraryDataProviderController/ACTION$getBundleDefinition",
                "callingDescriptor": "UNKNOWN",
                "params": {
                    "descriptor": "flexipage:availableForAllPageTypes"
                },
                "storable": true
            }
        ]
    }

Stripping the actions down:

    {
        "actions": [
            {
                "descriptor": "serviceComponent://ui.lightning.docs.components.aura.components.controllers.ComponentLibraryDataProviderController/ACTION$getBundleDefinition",
                "params": {
                    "descriptor": "flexipage:availableForAllPageTypes"
                }
            }
        ]
    }

So, stripping our request down:


    var myResponse = await fetch("https://developer.salesforce.com/docs/component-library/aura", {
        "headers": {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
        },
        "body": "message=%7B%22actions%22%3A%5B%7B%22descriptor%22%3A%22serviceComponent%3A%2F%2Fui.lightning.docs.components.aura.components.controllers.ComponentLibraryDataProviderController%2FACTION%24getBundleDefinition%22%2C%22params%22%3A%7B%22descriptor%22%3A%22flexipage%3AavailableForAllPageTypes%22%7D%7D%5D%7D&aura.context=%7B%22fwuid%22%3A%220lEhuHYJBRuSnxadQW0Iww%22%7D&aura.token=aura",
        "method": "POST"
    });
    myResponse.json().then(data=>console.log(data))

This gives us the contents of [getBundleDefinition_fromurl.json](getBundleDefinition_fromurl.json). Again, we can use `responseObject.actions[0].returnValue`. Specifically `responseObject.actions[0].returnValue.docDef.descriptions[0]` gives us the actual help contents we can dump

NB body of above in decoded format is:

    message={"actions":[{"descriptor":"serviceComponent://ui.lightning.docs.components.aura.components.controllers.ComponentLibraryDataProviderController/ACTION$getBundleDefinition","params":{"descriptor":"flexipage:availableForAllPageTypes"}}]}&aura.context={"fwuid":"0lEhuHYJBRuSnxadQW0Iww"}&aura.token=aura

