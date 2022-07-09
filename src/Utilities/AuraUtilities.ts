const AURA_TOKEN = 'aura';

//Appears to be the current version of the Aura framework itself.
//  FWUID = "Framework Unique ID"
//  Will likely need updating over time. Has changed once ~2022-06-27.
//  See notes / aura_lwc_component_docs.md.
//  cf.https://developer.salesforce.com/docs/atlas.en-us.192.0.lightning.meta/lightning/debug_network_traffic.htm
//   - "The framework unique id is a hash that is used as a fingerprint to detect if the framework has changed."
const SF_AURA_FWUID = 'Pr-qKsHgD-DywRc_bfPDDw';
const AURA_CONTEXT = encodeURIComponent(JSON.stringify({ "fwuid": `${SF_AURA_FWUID}` }));

const SF_AURA_ACTION_DESCRIPTOR_URI = 'serviceComponent://ui.lightning.docs.components.aura.components.controllers.ComponentLibraryDataProviderController/ACTION$';
const SF_AURA_TOC_ACTION = 'getBundleDefinitionsList';
const SF_AURA_RAW_DOC_ACTION = 'getBundleDefinition';
const SF_AURA_LWC_DEV_GUIDE_TOC_ACTION = 'getExternalDocumentationDocumentWithDefaultContent'; //TODO: for future ref, this may get the general dev guide TOC (https://developer.salesforce.com/docs/component-library/documentation/en/lwc)


export enum AuraAction {
    GET_TOC_MESSAGE,
    GET_RAW_DOC_MESSAGE,
}

//Constants related to Aura app based documentation
export const SF_AURA_PATH = '/component-library/aura';
export const SF_AURA_BUNDLE_PATH = '/component-library/bundle';

export function buildAuraActionBody(auraAction: AuraAction, params?: Record<string,string>): string {
    var actionString: string;
    switch (auraAction) {
        case AuraAction.GET_TOC_MESSAGE:
            actionString = SF_AURA_TOC_ACTION;
            break;
        case AuraAction.GET_RAW_DOC_MESSAGE:
            actionString = SF_AURA_RAW_DOC_ACTION;
            break;
        default:
            throw new Error('Unexpected Aura Action');
    }
    var message: any = {
        "actions": [
            {
                "descriptor": `${SF_AURA_ACTION_DESCRIPTOR_URI}${actionString}`
            }
        ]
    };
    if (params !== undefined) {
        message.actions[0].params = {};
        Object.entries(params).forEach(([key, value]) => {
            message.actions[0].params[key] = value;
        });
        // Logging.appendLine(''+message);
    }
    const finalBody: string = `message=${encodeURIComponent(JSON.stringify(message))}&aura.context=${AURA_CONTEXT}&aura.token=${AURA_TOKEN}`;
    // Logging.appendLine('buildAuraActionBody: ' + finalBody);
    return finalBody;
}