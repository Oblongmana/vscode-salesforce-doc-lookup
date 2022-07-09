import * as vscode from 'vscode';

import got, { CancelableRequest, Response } from 'got/dist/source';

import { ERROR_MESSAGES, SF_DOC_ROOT_URL } from "../../Constants";
import { SalesforceAtlasReferenceItem, SF_ATLAS_DEFAULT_LANG } from '../../ReferenceItems/SalesforceAtlasReferenceItem';
import { DocTypeName, docTypeNameTitleCase } from "../DocTypeNames";
import { DocumentationType } from "../DocumentationType";
import { ReferenceItemMemento } from '../../ReferenceItems/ReferenceItemMemento';
import { ReferenceItem } from '../../ReferenceItems/ReferenceItem';
import { getLangCodeOverride, getAtlasVersionCodeOverride, getStorageSubKey } from '../../Utilities/DocTypeConfig';
import { SalesforceReferenceOutputChannel } from '../../Logging';


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

        let versionOverrideForMerge: string | null = getAtlasVersionCodeOverride(docTypeName);
        versionOverrideForMerge = (versionOverrideForMerge !== null) ? `.${versionOverrideForMerge}` : ''; //Optional in ToC url, so blank string if not present, otherwise must be prefixed with'.'
        this.docTOCUrl = `${SF_DOC_ROOT_URL}${SF_ATLAS_TOC_PATH}/atlas.${getLangCodeOverride(docTypeName) || SF_ATLAS_DEFAULT_LANG}${versionOverrideForMerge}.${this.atlasIdentifier}.meta`;//TODO some de-dup to do here with ReferenceItem approach
    }

    /**
     * Get the ReferenceItem instances for this reference doc type
     *
     * @param context the extension context, used for accessing/populating the cache
     * @throws An error with `message` containing "getaddrinfo ENOTFOUND developer.salesforce.com" if it fails
     */
    public async getReferenceItems(context: vscode.ExtensionContext): Promise<ReferenceItem[]> {
        //Try to use existing cached values, and populate the cache if not available
        let referenceItems: ReferenceItem[] = [];
        let versionCodeOverride: string = getAtlasVersionCodeOverride(this.docTypeName);
        let langCodeOverride: string = getLangCodeOverride(this.docTypeName);
        let cacheSubKey: string = getStorageSubKey(versionCodeOverride, langCodeOverride);
        let cachedDocType: any | undefined = context.globalState.get(this.docTypeName);
        let cachedMementos: any[] | undefined = cachedDocType?.[cacheSubKey];
        if (cachedMementos === undefined) {
            // Get fresh reference entries, build in-memory ReferenceItems, and cache their ReferenceItemMementos
            let subKeyInfoForMessage = cacheSubKey !== "" ? `(${[versionCodeOverride, langCodeOverride].filter(x => x).join(", ")}) ` : "";
            console.log(`Cache miss for ${this.docTypeName} ${subKeyInfoForMessage}Salesforce Reference entries. Retrieving from web`);
            vscode.window.showInformationMessage(`Retrieving Salesforce ${docTypeNameTitleCase(this.docTypeName)} ${subKeyInfoForMessage}Reference Index...`, 'OK');

            const rootDocumentationNode: any = await this.getRootDocumentationNode();
            referenceItems = this.convertDocNodeToReferenceItems(rootDocumentationNode, '$(home)');

            cachedDocType = cachedDocType || {};
            cachedDocType[cacheSubKey] = referenceItems.map(item => item.saveToMemento());
            context.globalState.update(this.docTypeName, cachedDocType);
        } else {
            // Create new in-memory ReferenceItems by rehydrating from the cached mementos
            referenceItems = cachedMementos.map(cachedMemento => new SalesforceAtlasReferenceItem(new ReferenceItemMemento(cachedMemento), this.atlasIdentifier, undefined, versionCodeOverride, langCodeOverride));
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
            referenceItems.push(new SalesforceAtlasReferenceItem(documentationNode, this.atlasIdentifier, breadcrumbString, getAtlasVersionCodeOverride(this.docTypeName), getLangCodeOverride(this.docTypeName)));
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
     *       this may need to account for multiple "root" nodes, if we find such a doc type!
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
        //TODO: Similar to the SalesforceTOC.DocumentationNode - the root node should be loaded into something with a defined interface?
        let promise: CancelableRequest<Response> = got(this.docTOCUrl);
        let response: Response = await promise;
        if (response.rawBody.length === 0) {
            // Salesforce returns 200 in all circumstances for these pages, so we have to examine body length instead
            throw new Error(`${ERROR_MESSAGES.TABLE_OF_CONTENTS_PREFACE} for ${this.docTypeName}: received body was 0 length.`);
        }
        let jsonPromise = await promise.json();
        return jsonPromise;
    }
}