import got from 'got/dist/source';
import * as cheerio from 'cheerio';
import * as vscode from 'vscode';
import { DocTypeName, docTypeNameTitleCase } from "../DocTypeNames";
import { SalesforceReferenceDocType } from "../SalesforceReferenceDocType";
import { ReferenceItem } from '../../ReferenceItems/ReferenceItem';
import { SF_DOC_ROOT_URL } from '../../Constants';
import { SalesforceAuraReferenceItem } from '../../ReferenceItems/SalesforceAuraReferenceItem';

//TODO: examine poss redundancy b/n this enum and the action consts below it - identified during restructure
enum AuraAction {
    GET_TOC_MESSAGE,
    GET_RAW_DOC_MESSAGE,
}

const SF_AURA_TOC_ACTION = 'getBundleDefinitionsList';
const SF_AURA_RAW_DOC_ACTION = 'getBundleDefinition';

//Constants related to Aura app based documentation
export const SF_AURA_PATH = '/component-library/aura';
export const SF_AURA_BUNDLE_PATH = '/component-library/bundle';
//Appears to be the current version of the Aura framework itself.
//  FWUID = "Framework Unique ID"
//  Will likely need updating over time. Has changed once ~2022-06-27.
//  See notes / aura_lwc_component_docs.md.
//  cf.https://developer.salesforce.com/docs/atlas.en-us.192.0.lightning.meta/lightning/debug_network_traffic.htm
//   - "The framework unique id is a hash that is used as a fingerprint to detect if the framework has changed."
const SF_AURA_FWUID = 'Pr-qKsHgD-DywRc_bfPDDw';
const SF_AURA_ACTION_DESCRIPTOR_URI = 'serviceComponent://ui.lightning.docs.components.aura.components.controllers.ComponentLibraryDataProviderController/ACTION$';

/**
 * EXPERIMENTAL
 */
export abstract class SalesforceReferenceAuraDocType implements SalesforceReferenceDocType {
    private readonly AURA_CONTEXT = encodeURIComponent(JSON.stringify({ "fwuid": `${SF_AURA_FWUID}` }));
    private readonly AURA_TOKEN = 'aura';

    /**
     * The DocTypeName this DocType is for
     */
    private readonly docTypeName: DocTypeName;

    /**
     *
     * @param docTypeName the DocTypeName instance for this Documentation type - e.g. DocTypeName.LWC_AND_AURA_COMPONENT_LIBRARY
     */
    constructor(docTypeName: DocTypeName) {
        this.docTypeName = docTypeName;
    }

    private buildAuraActionBody(auraAction: AuraAction, params?: Record<string,string>): string {
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
            // SalesforceReferenceOutputChannel.appendLine(''+message);
        }
        const finalBody: string = `message=${encodeURIComponent(JSON.stringify(message))}&aura.context=${this.AURA_CONTEXT}&aura.token=${this.AURA_TOKEN}`;
        // SalesforceReferenceOutputChannel.appendLine('buildAuraActionBody: ' + finalBody);
        return finalBody;
    }

    /**
     * Get the ReferenceItem instances for this reference doc type
     *
     * @param context the extension context, used for accessing/populating the cache
     */
    public async getSalesforceReferenceItems(context: vscode.ExtensionContext): Promise<ReferenceItem[]> {
        //Try to use existing cached values, and populate the cache if not available
        let referenceItems: ReferenceItem[] | undefined = context.globalState.get(this.docTypeName);
        if (referenceItems === undefined) {
            console.log(`Cache miss for ${this.docTypeName} Salesforce Reference entries. Retrieving from web`);
            vscode.window.showInformationMessage(`Retrieving Salesforce ${docTypeNameTitleCase(this.docTypeName)} Reference Index...`, 'OK');

            const body = this.buildAuraActionBody(AuraAction.GET_TOC_MESSAGE);

            var tocResponse: object = await got.post(`${SF_DOC_ROOT_URL}${SF_AURA_PATH}`, {
                "headers": {
                    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
                },
                "body": `${body}`
            }).json();

            // //Useful debugs
            // SalesforceReferenceOutputChannel.appendLine((await myRequest).request.options.body as string);
            // SalesforceReferenceOutputChannel.appendLine(JSON.stringify(tocResponse));

            var parsedTocResponse: SalesforceAuraTOC.GetBundleDefinitionsListResponse = tocResponse as SalesforceAuraTOC.GetBundleDefinitionsListResponse;

            // SalesforceReferenceOutputChannel.appendLine(JSON.stringify(parsedTocResponse.actions[0].returnValue));

            var bundleDefinitionList: SalesforceAuraTOC.BundleDefinitionList = parsedTocResponse.actions[0].returnValue;
            referenceItems = Object.entries(bundleDefinitionList).sort().map(([, currDocNode]) => {
                // SalesforceReferenceOutputChannel.appendLine('currDocNode: ' + currDocNode);
                return new SalesforceAuraReferenceItem(currDocNode);
            });

            context.globalState.update(this.docTypeName, referenceItems);
        }
        return referenceItems;
    }

    /**
     * Get a URL for a human-readable page that can be loaded into the browser, for a given ReferenceItem
     * @param selectedReferenceItem A ReferenceItem to be loaded in the browser
     */
    public humanDocURL(selectedReferenceItem: ReferenceItem): string {
        return `${SF_DOC_ROOT_URL}${SF_AURA_BUNDLE_PATH}/${selectedReferenceItem.resource}`;
    }

    /**
     * DOUBLY-EXPERIMENTAL: Get the raw doc as HTML that can be displayed in a webview
     *
     * DOUBLY-EXPERIMENTAL as it relates to two experimental features - WebView, and Aura-app based doc
     *
     * @param selectedReferenceItem the ReferenceItem to get the raw doc for
     * @returns a promise that will resolve to a string of html that can be merged into a WebView
     */
    public async rawDoc(selectedReferenceItem: ReferenceItem): Promise<string> {
        //todo: when doing other locale/version things for Atlas, see if there are any locale/version options here

        const body = this.buildAuraActionBody(AuraAction.GET_RAW_DOC_MESSAGE, { "descriptor": selectedReferenceItem.label } );

        var tocResponse: object = await got.post(`${SF_DOC_ROOT_URL}${SF_AURA_PATH}`, {
            "headers": {
                "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
            },
            "body": `${body}`
        }).json();

        // //Useful debug
        // SalesforceReferenceOutputChannel.appendLine((await myRequest).request.options.body as string);

        var parsedBundleResponse: SalesforceAuraTOC.GetBundleDefinitionResponse = tocResponse as SalesforceAuraTOC.GetBundleDefinitionResponse;
        // SalesforceReferenceOutputChannel.appendLine(JSON.stringify(parsedBundleResponse));
        var bundleDefinition: SalesforceAuraTOC.BundleDefinition = parsedBundleResponse.actions[0].returnValue;

        //docDef can be empty - docDef is specifically the documentation tab, which some things don't have (e.g.aura:componentEvent, which only has Specification)
        var documentationDoc = cheerio.load('', null, false); //start empty
        // SalesforceReferenceOutputChannel.appendLine('bundleDefinition.docDef: ' + JSON.stringify(bundleDefinition.docDef));
        if (bundleDefinition.docDef !== undefined) {
            documentationDoc = cheerio.load('<div id="documentation"></div>', null, false); // run in fragment mode so it doesn't add html/head etc
            documentationDoc('#documentation').append(`<h1 style="font-weight: bold">Documentation</h1>`);// Add a Documentation Header to represent the tab
            bundleDefinition.docDef.descriptions.forEach(descriptionHtml => {
                //These are already html
                documentationDoc('#documentation').append(descriptionHtml);
            });
        }

        //Description is always populated, and goes onto the header, and into the Specification tab
        // We're going to reconstruct something similar to the html for the Specification tab - as that's not too heinous, and is built in page from the response
        var specificationDoc = cheerio.load('<div id="specification"></div>', null, false); // run in fragment mode so it doesn't add html/head etc
        specificationDoc('#specification').append(`<h1 style="font-weight: bold">Specification</h1>`);// Add a Specification Header to represent the tab
        specificationDoc('#specification').append(`<h3>${bundleDefinition.descriptorName} (${bundleDefinition.defType})</h3>`);
        specificationDoc('#specification').append(`<p>${bundleDefinition.description}</p>`);
        specificationDoc('#specification').append(`<table id="keyInfoTable"><tbody id="keyInfoTableBody"></tbody></table>`);
        specificationDoc('#keyInfoTableBody').append(`<tr><td>Support:   </td>     <td>${bundleDefinition.support}     </td></tr>`);
        specificationDoc('#keyInfoTableBody').append(`<tr><td>Access:    </td>     <td>${bundleDefinition.access}      </td></tr>`);
        specificationDoc('#keyInfoTableBody').append(`<tr><td>Abstract:  </td>     <td>${bundleDefinition.isAbstract}  </td></tr>`);
        specificationDoc('#keyInfoTableBody').append(`<tr><td>Extensible:</td>     <td>${bundleDefinition.isExtensible}</td></tr>`);
        if (bundleDefinition.attributes.length > 0) {
            specificationDoc('#specification').append(`<h4>Attributes</h4>`);
            specificationDoc('#specification').append(`<table id="attributesTable"></table>`);
            specificationDoc('#attributesTable').append(`<thead><tr style="text-transform:uppercase"><th>Name</th><th>Type</th><th>Access</th><th>Required</th><th>Default</th><th>Description</th></tr></thead>`);
            specificationDoc('#attributesTable').append(`<tbody id="attributesTableBody"></tbody>`);
            bundleDefinition.attributes.forEach((attributeDefinition: SalesforceAuraTOC.BundleAttribute) => {
                specificationDoc('#attributesTableBody').append(`
                    <tr>
                        <td>${attributeDefinition.name}</td>
                        <td>${attributeDefinition.type}</td>
                        <td>${attributeDefinition.access}</td>
                        <td>${attributeDefinition.required}</td>
                        <td>${attributeDefinition.defaultValue !== undefined ? attributeDefinition.defaultValue : ''}</td>
                        <td>${attributeDefinition.description}</td>
                    </tr>
                `);
                //todo: doesn't include the `inherited from` badge. Need to dig further into how that's built. It's less crucial however.
            });
        }

        var finalDoc = cheerio.load('<div id="fullDoc"></div>');
        finalDoc('#fullDoc').append(documentationDoc.html());
        finalDoc('#fullDoc').append(specificationDoc.html());

        // SalesforceReferenceOutputChannel.appendLine('finalDoc: ' + finalDoc.html());

        return finalDoc.html();
    }

    /**
     * At present, always returns an empty string, as there is no fragment included in Aura Tables of Contents/Bundle Descriptors,
     * so no way to nav direct to a specific header from a ToC type menu
     * TODO: why is this in here? See equiv in other class. This method is poss poorly named?
     *
     * @param selectedReferenceItem the reference item to get the fragment from
     * @returns empty string
     */
    getFragment(selectedReferenceItem: ReferenceItem): string {
        return '';
    }
}