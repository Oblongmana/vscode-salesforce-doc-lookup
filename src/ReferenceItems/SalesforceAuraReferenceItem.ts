import got from "got/dist/source";
import * as cheerio from 'cheerio';

import { SF_DOC_ROOT_URL } from "../Constants";
import { ReferenceItem } from "./ReferenceItem";
import { ReferenceItemMemento } from "./ReferenceItemMemento";
import { AuraAction, buildAuraActionBody, SF_AURA_BUNDLE_PATH, SF_AURA_PATH } from "../Utilities/AuraUtilities";


export class SalesforceAuraReferenceItem extends ReferenceItem {
    // Implemented base properties
    label!: string;
    data!: Record<string, string>;

    /**
     * Build a new ReferenceItem instance from a Salesforce Atlas-based doc node
     */
    constructor(memento: ReferenceItemMemento)
    constructor(docNode: SalesforceAuraTOC.DocumentationNode)
    constructor(mementoOrDocNode: ReferenceItemMemento | SalesforceAuraTOC.DocumentationNode) {
        super();
        if (mementoOrDocNode instanceof ReferenceItemMemento) {
            this.restoreFromMemento(mementoOrDocNode);
        } else {
            let docNode = mementoOrDocNode as SalesforceAuraTOC.DocumentationNode;
            if (!docNode.hasOwnProperty('descriptorName') || docNode.descriptorName === undefined) {
                throw new Error('Supplied DocumentationNode had a missing or undefined `descriptorName`. This CANNOT be used to build a SalesforceReferenceItem - these are used to build Quick Pick items and must have this populated');
            }
            if (!docNode.hasOwnProperty('namespace') || docNode.namespace === undefined) {
                throw new Error('Supplied DocumentationNode had a missing or undefined `namespace`. This CANNOT be used to build a SalesforceReferenceItem - these are used to build Quick Pick items and must have this populated');
            }
            if (!docNode.hasOwnProperty('name') || docNode.name === undefined) {
                throw new Error('Supplied DocumentationNode had a missing or undefined `name`. This CANNOT be used to build a SalesforceReferenceItem - these are used to build Quick Pick items and must have this populated');
            }
            if (!docNode.hasOwnProperty('defType') || docNode.defType === undefined) {
                throw new Error('Supplied DocumentationNode had a missing or undefined `defType`. This CANNOT be used to build a SalesforceReferenceItem - these are used to build Quick Pick items and must have this populated');
            }

            //DefTypes map a little differently in the interface, from their underlying strings to their display values. This transform reflects the display values
            var processedDefType = docNode.defType;
            switch (processedDefType) {
                case 'component':
                    processedDefType = 'Aura';
                    break;
                case 'event':
                    processedDefType = 'Events';
                    break;
                case 'module':
                    processedDefType = 'Lightning';
                    break;
                case 'interface':
                    processedDefType = 'Interfaces';
                    break;
                default:
                    //Just leave it as the supplied defType. Shouldn't happen, but ok enough if it does
                    break;
            }

            this.label = docNode.descriptorName;
            this.detail = `$(home) $(breadcrumb-separator) ${processedDefType} $(breadcrumb-separator) ${docNode.namespace} $(breadcrumb-separator) ${docNode.name}`;
            this.data = { "resource": `${docNode.descriptorName}` };
        }
    }

    /**
     * Get a URL for a human-readable page that can be loaded into the browser
     *
     * @returns string A URL that can be loaded into the browser
     */
    public humanDocURL(): string {
        return `${SF_DOC_ROOT_URL}${SF_AURA_BUNDLE_PATH}/${this.data.resource}`;
    }

    /**
     * DOUBLY-EXPERIMENTAL: Get the raw doc as HTML that can be displayed in a webview
     *
     * DOUBLY-EXPERIMENTAL as it relates to two experimental features - WebView, and Aura-app based doc
     *
     * @returns a promise that will resolve to a string of html that can be merged into a WebView
     */
    public async asHTML(): Promise<string> {
        //todo: when doing other locale/version things for Atlas, see if there are any locale/version options here. At the moment, at least for the Component Reference, there doesn't appear to be
        //      There is the Dev Guide, but that's not yet included in this plugin

        const body = buildAuraActionBody(AuraAction.GET_RAW_DOC_MESSAGE, { "descriptor": this.label } );

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
     * @inheritdoc
     */
    public webViewNavFragment(): undefined {
        // there is no fragment included in Aura Tables of Contents/Bundle Descriptors, so no way to nav direct to a specific header from a ToC type menu
        return undefined;
    }
}