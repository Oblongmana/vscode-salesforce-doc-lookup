import * as vscode from 'vscode';

import got from 'got/dist/source';

import { SF_DOC_ROOT_URL } from "../../Constants";
import { SalesforceAtlasReferenceItem } from '../../ReferenceItems/SalesforceAtlasReferenceItem';
import { DocTypeName, docTypeNameTitleCase } from "../DocTypeNames";
import { DocumentationType } from "../DocumentationType";
import { ReferenceItemMemento } from '../../ReferenceItems/ReferenceItemMemento';
import { ReferenceItem } from '../../ReferenceItems/ReferenceItem';


const SF_ATLAS_TOC_PATH = '/get_document';

export abstract class SalesforceReferenceAtlasDocType implements DocumentationType {

    /**
     * The full URL to get the Table of Contents
     */
    private readonly docTOCUrl: string;

    /**
     * @inheritdoc
     */
    public readonly docTypeName: DocTypeName;

    /**
     * The string that identifies the "atlas" for this doc type
     *
     * e.g. in the URL "https://developer.salesforce.com/docs/atlas.en-us.apexref.meta/apexref/apex_dml_section.htm#apex_dml_undelete"
     *    this is "apexref"
     */
    private readonly atlasIdentifier: string;

    /**
     * todo: finish this documentation
     *
     * @param docTypeName DocTypeName used in this plugin to uniquely and consistently identify this doc type
     * @param atlasIdentifier The string that identifies the "atlas" for this doc type
     *                        e.g. in the URL "https://developer.salesforce.com/docs/atlas.en-us.apexref.meta/apexref/apex_dml_section.htm#apex_dml_undelete"
     *                           this is "apexref"
     */
    constructor(docTypeName: DocTypeName, atlasIdentifier: string) {
        this.docTypeName = docTypeName;
        this.atlasIdentifier = atlasIdentifier;
        this.docTOCUrl = `${SF_DOC_ROOT_URL}${SF_ATLAS_TOC_PATH}/atlas.en-us.${this.atlasIdentifier}.meta`; //TODO account for any lang/version overrides. Likely means we need to ditch or rework SalesforceReferenceDocTypes
    }

    /**
     * Get the ReferenceItem instances for this reference doc type
     *
     * @param context the extension context, used for accessing/populating the cache
     * @throws An error with `message` containing "getaddrinfo ENOTFOUND developer.salesforce.com" if it fails
     */
    public async getReferenceItems(context: vscode.ExtensionContext, langCodeOverride?: string, versionCodeOverride?: string): Promise<ReferenceItem[]> {
        //Try to use existing cached values, and populate the cache if not available
        let referenceItems: ReferenceItem[] = [];
        let cachedMementos: object[] | undefined = context.globalState.get(this.docTypeName);
        if (cachedMementos === undefined) {
            // Get fresh reference entries, build ReferenceItems, and cache their ReferenceItemMementos
            console.log(`Cache miss for ${this.docTypeName} Salesforce Reference entries. Retrieving from web`);
            vscode.window.showInformationMessage(`Retrieving Salesforce ${docTypeNameTitleCase(this.docTypeName)} Reference Index...`,'OK');
            const rootDocumentationNode: any = await this.getRootDocumentationNode();
            // SalesforceReferenceOutputChannel.appendLine('rootDocumentationNode: ' + rootDocumentationNode);
            referenceItems = this.convertDocNodeToReferenceItems(rootDocumentationNode, '$(home)');
            context.globalState.update(this.docTypeName, referenceItems.map(item => item.saveToMemento()));
        } else {
            // Create new ReferenceItems by rehydrating from the cached mementos
            referenceItems = cachedMementos.map(cachedMemento => new SalesforceAtlasReferenceItem(new ReferenceItemMemento(cachedMemento), this.atlasIdentifier)); //TODO account for version/lang overrides once we get to that point - load from settings
        }
        return referenceItems;
    }

    /**
     * A recursive method that converts a SalesforceTOC.DocumentationNode into 0 to N ReferenceItem instances,
     * by converting the node itself (if possible), and converting all of its children (if possible), putting them
     * into an array and returning that
     *
     * @param documentationNode The node from the ToC to convert to Salesforce Reference Items
     * @param breadcrumbString A human-readable breadcrumb string, indicating to the user where in the ToC this node sits (e.g. "$(home) $(breadcrumb-separator) Apex Language Reference")
     */
    private convertDocNodeToReferenceItems(documentationNode: SalesforceAtlasTOC.DocumentationNode, breadcrumbString: string): ReferenceItem[] {
        const referenceItems: ReferenceItem[] = [];
        //TODO should perhaps be iterative, given JS' lack of tail-call optimization
        // SalesforceReferenceOutputChannel.appendLine('documentationNode: ' + documentationNode);
        //Convert this node into a ReferenceItem, after run-time checking it has appropriate properties
        if (documentationNode.hasOwnProperty('a_attr')) {
            referenceItems.push(new SalesforceAtlasReferenceItem(documentationNode, this.atlasIdentifier, breadcrumbString)); //TODO account for version/lang overrides once we get to that point - load from settings
        }
        //Recursively convert children into SalesforceReferenceItems and add them to our list
        if (documentationNode.hasOwnProperty('children') && documentationNode.children !== undefined) {
            const breadcrumbStringForChildren = `${breadcrumbString} $(breadcrumb-separator) ${documentationNode.text}`;
            documentationNode.children.forEach((childDocumentationNode: SalesforceAtlasTOC.DocumentationNode) => {
                referenceItems.push(...this.convertDocNodeToReferenceItems(childDocumentationNode, breadcrumbStringForChildren));
            });
        }
        return referenceItems;
    }

    /**
     * Get the root documentation node for this Documentation Type - its children
     * will be the actual documentation we want to obtain
     *
     * TODO: In the event that we decide to expand what we pull from Docs in future,
     *       this may need to account for multiple "root" nodes
     *
     * @throws An error with `message` containing "getaddrinfo ENOTFOUND developer.salesforce.com" if it fails
     */
    protected abstract getRootDocumentationNode(): Promise<SalesforceAtlasTOC.DocumentationNode>;

    /**
     * Get the Table of Contents used by tools to get document structure for this documentation type
     *
     * @throws An error with `message` containing "getaddrinfo ENOTFOUND developer.salesforce.com" if it fails due to a connection issue
     */
    protected async getDocTOC(): Promise<any> {
        //TODO: Similar to the SalesforceTOC.DocumentationNode - the root node should be loaded into something with a defined interface
        let body: any = await got(this.docTOCUrl).json();
        return body;
    }
}