import got from 'got/dist/source';
import * as cheerio from 'cheerio';
import * as vscode from 'vscode';
import { SF_DOC_ROOT_URL } from "../../Constants";
import { ReferenceItem } from '../../ReferenceItems/ReferenceItem';
import { SalesforceAtlasReferenceItem } from '../../ReferenceItems/SalesforceAtlasReferenceItem';
import { DocTypeName, docTypeNameTitleCase } from "../DocTypeNames";
import { SalesforceReferenceDocType } from "../SalesforceReferenceDocType";


//Constants related to Atlas-based documentation
export const SF_ATLAS_TOC_PATH = '/get_document';
export const SF_ATLAS_RAW_DOC_PATH = '/get_document_content';


export abstract class SalesforceReferenceAtlasDocType implements SalesforceReferenceDocType {

    /**
     * The portion of the URL path giving the location of the "atlas" for this doc type
     *
     * e.g. in the URL "https://developer.salesforce.com/docs/get_document/atlas.en-us.apexcode.meta"
     *      this is "/atlas.en-us.apexcode.meta"
     */
    private readonly atlasPath: string;

    /**
     * The portion of the URL path giving the location of doc for this doc type.
     *
     * e.g. in the URL "https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_dml_section.htm#apex_dml_undelete"
     *      this is "/apexcode"
     */
    private readonly docPath: string;

    /**
     * The full URL to get the Table of Contents used by tools to get document structure
     */
    private readonly docTOCUrl: string;

    /**
     * The DocTypeName this DocType is for
     */
    private readonly docTypeName: DocTypeName;

    /**
     * todo: finish this documentation
     *
     * @param atlasPath The portion of the URL path giving the location of the "atlas" for this doc type.
     *                      e.g. in the URL "https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_dml_section.htm#apex_dml_undelete"
     *                           this is "/atlas.en-us.apexcode.meta"
     * @param docPath The portion of the URL path giving the location of doc for this doc type.
     *                                e.g. in the URL "https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_dml_section.htm#apex_dml_undelete"
     *                                      this is "/apexcode"
     */
    constructor(docTypeName: DocTypeName, atlasPath: string, docPath: string) {
        this.docTypeName = docTypeName;
        this.atlasPath = atlasPath;
        this.docPath = docPath;
        this.docTOCUrl = SF_DOC_ROOT_URL + SF_ATLAS_TOC_PATH + this.atlasPath;
    }

    /**
     * Get the ReferenceItem instances for this reference doc type
     *
     * @param context the extension context, used for accessing/populating the cache
     * @throws An error with `message` containing "getaddrinfo ENOTFOUND developer.salesforce.com" if it fails
     */
    public async getSalesforceReferenceItems(context: vscode.ExtensionContext): Promise<ReferenceItem[]> {
        //Try to use existing cached values, and populate the cache if not available
        let referenceItems: ReferenceItem[] | undefined = context.globalState.get(this.docTypeName);
        if (referenceItems === undefined) {
            console.log(`Cache miss for ${this.docTypeName} Salesforce Reference entries. Retrieving from web`);
            vscode.window.showInformationMessage(`Retrieving Salesforce ${docTypeNameTitleCase(this.docTypeName)} Reference Index...`,'OK');
            const rootDocumentationNode: any = await this.getRootDocumentationNode();
            // SalesforceReferenceOutputChannel.appendLine('rootDocumentationNode: ' + rootDocumentationNode);
            referenceItems = this.convertDocNodeToSalesforceReferenceItems(rootDocumentationNode, '$(home)');
            context.globalState.update(this.docTypeName, referenceItems);
        }
        return referenceItems;
    }

    /**
     * Get a URL for a human-readable page that can be loaded into the browser, for a given ReferenceItem
     * @param selectedReferenceItem A ReferenceItem to be loaded in the browser
     */
    public humanDocURL(selectedReferenceItem: ReferenceItem): string {
        return `${SF_DOC_ROOT_URL}${this.atlasPath}${this.docPath}/${selectedReferenceItem.resource}`;
    }

    /**
     * A recursive method that converts a SalesforceTOC.DocumentationNode into 0 to N ReferenceItem instances,
     * by converting the node itself (if possible), and converting all of its children (if possible), putting them
     * into an array and returning that
     *
     * @param documentationNode The node from the ToC to convert to Salesforce Reference Items
     * @param breadcrumbString A human-readable breadcrumb string, indicating to the user where in the ToC this node sits (e.g. "$(home) $(breadcrumb-separator) Apex Language Reference")
     */
    private convertDocNodeToSalesforceReferenceItems(documentationNode: SalesforceAtlasTOC.DocumentationNode, breadcrumbString: string): ReferenceItem[] {
        const referenceItems: ReferenceItem[] = [];
        // SalesforceReferenceOutputChannel.appendLine('documentationNode: ' + documentationNode);
        //Convert this node into a ReferenceItem, after run-time checking it has appropriate properties
        if (documentationNode.hasOwnProperty('a_attr')) {
            referenceItems.push(new SalesforceAtlasReferenceItem(documentationNode, breadcrumbString));
        }
        //Recursively convert children into SalesforceReferenceItems and add them to our list
        if (documentationNode.hasOwnProperty('children') && documentationNode.children !== undefined) {
            const breadcrumbStringForChildren = `${breadcrumbString} $(breadcrumb-separator) ${documentationNode.text}`;
            documentationNode.children.forEach((childDocumentationNode: SalesforceAtlasTOC.DocumentationNode) => {
                referenceItems.push(...this.convertDocNodeToSalesforceReferenceItems(childDocumentationNode, breadcrumbStringForChildren));
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

    /**
     * EXPERIMENTAL: Get the raw doc as HTML that can be displayed in a webview
     *
     * @param selectedReferenceItem the ReferenceItem to get the raw doc for
     * @returns a promise that will resolve to a string of html that can be merged into a WebView
     */
    public async asHTML(selectedReferenceItem: ReferenceItem): Promise<string> {
        //todo: original notes, will be useful when removing hardcoding of locale and version
        // private rawDocURL(folder: string, id: string, locale: string, version: string): string {
        // The required params can be obtained from the following things on the root Node.
        //  See the NOTES.md file for further detail on possible future plans

        // const vfFolder: string = sfJSONDoc.deliverable;
        // const vfLocale: string = sfJSONDoc.language.locale;
        // const vfDocVersion: string = sfJSONDoc.version.doc_version;

        // return `${SF_DOC_ROOT_URL}${SF_RAW_DOC_PATH}/${folder}/${id}/${locale}/${version}`;

        const docHrefWithoutFragment = vscode.Uri.parse(selectedReferenceItem.resource).path;
        const docUri = `${SF_DOC_ROOT_URL}${SF_ATLAS_RAW_DOC_PATH}${this.docPath}${docHrefWithoutFragment}/en-us/232.0`;

        //TODO: this is extremely experimental, see Notes in SalesforceReferenceDocType.rawDocURL for future path
        //  review security constraints, poss including CSP stuff on the webview itself
        let body: any = await got(docUri).json();

        // Salesforce includes "seealso" links, which usually go to internal anchors. Rewrite them to work for us
        //  todo: this doesn't handle links that don't go to in-page anchors - such as "Namespace" pages in the doc
        //   - possibilities include using Command URIs to run an appropriate command to load the right doc? https://code.visualstudio.com/api/extension-guides/command#command-uris
        const docContentDOM: cheerio.CheerioAPI = cheerio.load(body.content);
        const seeAlsoLinks: cheerio.Cheerio<cheerio.Element> = docContentDOM('#sfdc\\:seealso a');
        seeAlsoLinks.each((index, element) => {
            //Extract the fragment from the href, and set the link to ONLY be the fragment, so it works in our webview
            docContentDOM(element).attr('href', '#' + vscode.Uri.parse(docContentDOM(element).attr('href')!).fragment);
        });

        return docContentDOM.xml();
    }

    /**
     * Extract the fragment from a ReferenceItem
     * TODO why is this in here?
     *
     * e.g. in https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_dml_section.htm#apex_dml_undelete,
     *      this is "apex_dml_undelete"
     *
     * @param selectedReferenceItem the ReferenceItem to extract the fragment from
     * @returns the fragment, if there is one
     */
    public getFragment(selectedReferenceItem: ReferenceItem): string {
        //Extract the fragment ONLY from the href - some hrefs may include fragments, which are not used for raw doc (they're only used for jumping to anchors in human doc)
        // SalesforceReferenceOutputChannel.appendLine(vscode.Uri.parse(selectedReferenceItem.resource).fragment);
        return vscode.Uri.parse(selectedReferenceItem.resource).fragment;
    }
}