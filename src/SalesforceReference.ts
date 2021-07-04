import * as vscode from 'vscode';
import * as cheerio from 'cheerio';
import got from 'got/dist/source';
import { SalesforceReferenceOutputChannel } from './Logging';

const SF_DOC_ROOT_URL = 'https://developer.salesforce.com/docs';
const SF_TOC_PATH = '/get_document';
const SF_RAW_DOC_PATH = '/get_document_content';

export enum DocTypeName {
    APEX                = 'APEX',
    VISUALFORCE         = 'VISUALFORCE',
    LIGHTNING_CONSOLE   = 'LIGHTNING_CONSOLE',
    CLASSIC_CONSOLE     = 'CLASSIC_CONSOLE',
    METADATA            = 'METADATA',
    OBJECT_REFERENCE    = 'OBJECT_REFERENCE',
    REST_API            = 'REST_API',
    SOAP_API            = 'SOAP_API',
    SFDX_CLI            = 'SFDX_CLI',
}

export function docTypeNameTitleCase(docTypeName: DocTypeName) {
    //I hate regex :)
    const recasedAndSpaced: string = docTypeName.replace(
        /([-_]*[a-zA-Z]*)/g,
        (group) => {
            const stripped: string = group.replace('-', '').replace('_', '');
            return (stripped.charAt(0).toUpperCase() + stripped.substr(1).toLowerCase() + ' ');
        }
    );
    return recasedAndSpaced.trim();
}

/**
 * A Salesforce Reference Entry represents a Salesforce ToC entry that:
 * - we can open in a web browser;
 * - has a human-readable breadcrumb string indicating how we got to this node;
 * - can be displayed in a VSCode QuickPick
 */
export class SalesforceReferenceItem implements vscode.QuickPickItem {
    label: string;
    description?: string | undefined;
    detail?: string | undefined;
    picked?: boolean | undefined;
    alwaysShow?: boolean | undefined;

    /**
     * The path supplied by the SF ToC for a given node, in a_attr.href
     */
    href: string;
    /**
     * The "id" needed for the raw doc endpoint (see SF_RAW_DOC_PATH in src code)
     * At time of writing, this is a_attr.href on a given reference node, not
     * the 'id' property, like you might expect, but is only everything before the `#`
     *
     * TODO: it'll need splitting if we want to get something we can use for the raw doc endpoint,
     *        and that's not useful until we work out a display-in-vscode-strategy - the feasibility
     *        of which needs further consideration. See notes in NOTES.md.
     *        If we do that, consider switching this to a class and building this from
     *        `href` instead, rather than leaving consumers to parse (assuming it doesn't differ
     *        between doc types)
     */
    rawDocId?: string;

    /**
     * Construct an instance of SalesforceReferenceItem
     * @param docNode A documentationNode from a Salesforce ToC, which must have both label and a_attr.href populated
     * @param breadcrumb A human-readable breadcrumb string, indicating to the user where in the ToC this node sits (e.g. "$(home) $(breadcrumb-separator) Apex Language Reference")
     */
    constructor(docNode: SalesforceTOC.DocumentationNode, breadcrumb: string) {
        this.label = docNode.text;
        if (!docNode.hasOwnProperty('a_attr') || docNode.a_attr === undefined) {
            throw new Error('Supplied DocumentationNode had a missing or undefined `a_attr`. This CANNOT be used to build a SalesforceReferenceItem - these are used to build links and must have this populated');
        }
        if (!docNode.a_attr.hasOwnProperty('href') || docNode.a_attr.href === undefined) {
            throw new Error('Supplied DocumentationNode had a missing or undefined `a_attr.href`. This CANNOT be used to build a SalesforceReferenceItem - these are used to build links and must have this populated');
        }
        this.href = docNode.a_attr.href;
        this.detail = breadcrumb;
    }

}

interface SalesforceReferenceDocType {
    /**
     * Get the SalesforceReferenceItem instances for this reference doc type.
     *
     * Implementers should make use of the cache.
     *
     * @param context the extension context, provided so you can access/populate the cache.
     */
    getSalesforceReferenceItems(context: vscode.ExtensionContext): Promise<SalesforceReferenceItem[]>;

    /**
     * Get a URL for a human-readable page that can be loaded into the browser, for a given SalesforceReferenceItem
     *
     * @param selectedReferenceItem A SalesforceReferenceItem to be loaded in the browser
     */
    humanDocURL(selectedReferenceItem: SalesforceReferenceItem): string;

    /**
     * EXPERIMENTAL: Get the raw doc as HTML that can be displayed in a webview
     *
     * @param selectedReferenceItem the SalesforceReferenceItem to get the raw doc for
     * @returns a promise that will resolve to a string of html that can be merged into a WebView
     */
    rawDoc(selectedReferenceItem: SalesforceReferenceItem): Promise<string>;

    /**
     * Extract the fragment from a Salesforce Reference Item
     *
     * e.g. in https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_dml_section.htm#apex_dml_undelete,
     *      this is "apex_dml_undelete"
     *
     * @param selectedReferenceItem the SalesforceReferenceItem to extract the fragment from
     * @returns the fragment, if there is one
     */
    getFragment(selectedReferenceItem: SalesforceReferenceItem): string
}

abstract class SalesforceReferenceAtlasBasedDocType implements SalesforceReferenceDocType {

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
        this.docTOCUrl = SF_DOC_ROOT_URL + SF_TOC_PATH + this.atlasPath;
    }

    /**
     * Get the SalesforceReferenceItem instances for this reference doc type
     *
     * @param context the extension context, used for accessing/populating the cache
     * @throws An error with `message` containing "getaddrinfo ENOTFOUND developer.salesforce.com" if it fails
     */
    public async getSalesforceReferenceItems(context: vscode.ExtensionContext): Promise<SalesforceReferenceItem[]> {
        //Try to use existing cached values, and populate the cache if not available
        let referenceItems: SalesforceReferenceItem[] | undefined = context.globalState.get(this.docTypeName);
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
     * Get a URL for a human-readable page that can be loaded into the browser, for a given SalesforceReferenceItem
     * @param selectedReferenceItem A SalesforceReferenceItem to be loaded in the browser
     */
    public humanDocURL(selectedReferenceItem: SalesforceReferenceItem): string {
        return `${SF_DOC_ROOT_URL}${this.atlasPath}${this.docPath}/${selectedReferenceItem.href}`;
    }

    /**
     * A recursive method that converts a SalesforceTOC.DocumentationNode into 0 to N SalesforceReferenceItem instances,
     * by converting the node itself (if possible), and converting all of its children (if possible), putting them
     * into an array and returning that
     *
     * @param documentationNode The node from the ToC to convert to Salesforce Reference Items
     * @param breadcrumbString A human-readable breadcrumb string, indicating to the user where in the ToC this node sits (e.g. "$(home) $(breadcrumb-separator) Apex Language Reference")
     */
    private convertDocNodeToSalesforceReferenceItems(documentationNode: SalesforceTOC.DocumentationNode, breadcrumbString: string): SalesforceReferenceItem[] {
        const referenceItems: SalesforceReferenceItem[] = [];
        // SalesforceReferenceOutputChannel.appendLine('documentationNode: ' + documentationNode);
        //Convert this node into a SalesforceReferenceItem, after run-time checking it has appropriate properties
        if (documentationNode.hasOwnProperty('a_attr')) {
            referenceItems.push(new SalesforceReferenceItem(documentationNode, breadcrumbString));
        }
        //Recursively convert children into SalesforceReferenceItems and add them to our list
        if (documentationNode.hasOwnProperty('children') && documentationNode.children !== undefined) {
            const breadcrumbStringForChildren = `${breadcrumbString}$(breadcrumb-separator)${documentationNode.text}`;
            documentationNode.children.forEach((childDocumentationNode: SalesforceTOC.DocumentationNode) => {
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
    protected abstract getRootDocumentationNode(): Promise<SalesforceTOC.DocumentationNode>;

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
     * @param selectedReferenceItem the SalesforceReferenceItem to get the raw doc for
     * @returns a promise that will resolve to a string of html that can be merged into a WebView
     */
    public async rawDoc(selectedReferenceItem: SalesforceReferenceItem): Promise<string> {
        //todo: original notes, will be useful when removing hardcoding of locale and version
        // private rawDocURL(folder: string, id: string, locale: string, version: string): string {
        // The required params can be obtained from the following things on the root Node.
        //  See the NOTES.md file for further detail on possible future plans

        // const vfFolder: string = sfJSONDoc.deliverable;
        // const vfLocale: string = sfJSONDoc.language.locale;
        // const vfDocVersion: string = sfJSONDoc.version.doc_version;

        // return `${SF_DOC_ROOT_URL}${SF_RAW_DOC_PATH}/${folder}/${id}/${locale}/${version}`;
        //todo improve on hardcoding
        //Extract the path ONLY from the href - as some hrefs may include fragments, which are not used for raw doc urls (they're only used for jumping to anchors in human doc)
        // SalesforceReferenceOutputChannel.appendLine(`${SF_DOC_ROOT_URL}${SF_RAW_DOC_PATH}${this.docPath}${docHrefWithoutFragment}/en-us/232.0`);

        // const rawDocURL = SalesforceReferenceDocTypes[docType].rawDocURL(selectedReferenceItem!);
        // const fragment = SalesforceReferenceDocTypes[docType].getFragment(selectedReferenceItem!);
        // showDocInWebView(context, vscode.Uri.parse(rawDocURL), fragment);

        const docHrefWithoutFragment = vscode.Uri.parse(selectedReferenceItem.href).path;
        const docUri = `${SF_DOC_ROOT_URL}${SF_RAW_DOC_PATH}${this.docPath}${docHrefWithoutFragment}/en-us/232.0`;

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
     * Extract the fragment from a Salesforce Reference Item
     *
     * e.g. in https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_dml_section.htm#apex_dml_undelete,
     *      this is "apex_dml_undelete"
     *
     * @param selectedReferenceItem the SalesforceReferenceItem to extract the fragment from
     * @returns the fragment, if there is one
     */
    public getFragment(selectedReferenceItem: SalesforceReferenceItem): string {
        //Extract the fragment ONLY from the href - some hrefs may include fragments, which are not used for raw doc (they're only used for jumping to anchors in human doc)
        // SalesforceReferenceOutputChannel.appendLine(vscode.Uri.parse(selectedReferenceItem.href).fragment);
        return vscode.Uri.parse(selectedReferenceItem.href).fragment;
    }
}

class ApexSalesforceReferenceDocType extends SalesforceReferenceAtlasBasedDocType {
    constructor() {
        super(
            DocTypeName.APEX,
            '/atlas.en-us.apexref.meta',
            '/apexref'
        );
    }
    /**
     * Get the root documentation node for this Documentation Type - its children
     * will be the actual documentation we want to obtain
     *
     * @throws An error with `message` containing "getaddrinfo ENOTFOUND developer.salesforce.com" if it fails due to a connection issue
     */
    protected async getRootDocumentationNode(): Promise<SalesforceTOC.DocumentationNode> {
        const apexDocToc: any = await this.getDocTOC();
        return apexDocToc.toc.find((node: SalesforceTOC.DocumentationNode) => node.hasOwnProperty('id') && node.id === 'apex_ref_guide');
    }
}

class VisualforceSalesforceReferenceDocType extends SalesforceReferenceAtlasBasedDocType {
    constructor() {
        super(
            DocTypeName.VISUALFORCE,
            '/atlas.en-us.pages.meta',
            '/pages'
        );
    }
    /**
     * Get the root documentation node for this Documentation Type - its children
     * will be the actual documentation we want to obtain
     *
     * @throws An error with `message` containing "getaddrinfo ENOTFOUND developer.salesforce.com" if it fails due to a connection issue
     */
    protected async getRootDocumentationNode(): Promise<SalesforceTOC.DocumentationNode> {
        const vfDocToc: any = await this.getDocTOC();
        return vfDocToc.toc.find((node: SalesforceTOC.DocumentationNode) => node.hasOwnProperty('id') && node.id === 'pages_compref');
    }
}

class LightningConsoleSalesforceReferenceDocType extends SalesforceReferenceAtlasBasedDocType {
    constructor() {
        super(
            DocTypeName.LIGHTNING_CONSOLE,
            '/atlas.en-us.api_console.meta',
            '/api_console'
        );
    }
    /**
     * Get the root documentation node for this Documentation Type - its children
     * will be the actual documentation we want to obtain
     *
     * @throws An error with `message` containing "getaddrinfo ENOTFOUND developer.salesforce.com" if it fails due to a connection issue
     */
    protected async getRootDocumentationNode(): Promise<SalesforceTOC.DocumentationNode> {
        const lightningConsoleDocToc: any = await this.getDocTOC();
        const lightningconsoleTopLevelToc: any = lightningConsoleDocToc.toc.find((node: SalesforceTOC.DocumentationNode) => node.hasOwnProperty('id') && node.id === 'sforce_api_console_lex_getting_started');
        const lightningconsoleJSAPILevelToc: any = lightningconsoleTopLevelToc.children.find((node: SalesforceTOC.DocumentationNode) => node.hasOwnProperty('id') && node.id === 'sforce_api_console_js_getting_started');
        return lightningconsoleJSAPILevelToc.children.find((node: SalesforceTOC.DocumentationNode) => node.hasOwnProperty('id') && node.id === 'sforce_api_console_methods_lightning');
    }
}

class ClassicConsoleSalesforceReferenceDocType extends SalesforceReferenceAtlasBasedDocType {
    constructor() {
        super(
            DocTypeName.CLASSIC_CONSOLE,
            '/atlas.en-us.api_console.meta',
            '/api_console'
        );
    }
    /**
     * Get the root documentation node for this Documentation Type - its children
     * will be the actual documentation we want to obtain
     *
     * @throws An error with `message` containing "getaddrinfo ENOTFOUND developer.salesforce.com" if it fails due to a connection issue
     */
    protected async getRootDocumentationNode(): Promise<SalesforceTOC.DocumentationNode> {
        const classicConsoleDocToc: any = await this.getDocTOC();
        const classicconsoleTopLevelToc: any = classicConsoleDocToc.toc.find((node: SalesforceTOC.DocumentationNode) => node.hasOwnProperty('id') && node.id === 'sforce_api_console_intro');
        return classicconsoleTopLevelToc.children.find((node: SalesforceTOC.DocumentationNode) => node.hasOwnProperty('id') && node.id === 'sforce_api_console_methods_classic');
    }
}

class MetadataSalesforceReferenceDocType extends SalesforceReferenceAtlasBasedDocType {
    constructor() {
        super(
            DocTypeName.METADATA,
            '/atlas.en-us.api_meta.meta',
            '/api_meta'
        );
    }
    /**
     * Get the root documentation node for this Documentation Type - its children
     * will be the actual documentation we want to obtain
     *
     * @throws An error with `message` containing "getaddrinfo ENOTFOUND developer.salesforce.com" if it fails due to a connection issue
     */
    protected async getRootDocumentationNode(): Promise<SalesforceTOC.DocumentationNode> {
        const metadataDocToc: any = await this.getDocTOC();
        return metadataDocToc.toc.find((node: SalesforceTOC.DocumentationNode) => node.hasOwnProperty('text') && node.text === 'Reference');
    }
}

class ObjectReferenceSalesforceReferenceDocType extends SalesforceReferenceAtlasBasedDocType {
    constructor() {
        super(
            DocTypeName.OBJECT_REFERENCE,
            '/atlas.en-us.object_reference.meta',
            '/object_reference'
        );
    }
    /**
     * Get the root documentation node for this Documentation Type - its children
     * will be the actual documentation we want to obtain
     *
     * @throws An error with `message` containing "getaddrinfo ENOTFOUND developer.salesforce.com" if it fails due to a connection issue
     */
    protected async getRootDocumentationNode(): Promise<SalesforceTOC.DocumentationNode> {
        const objReferenceDocToc: any = await this.getDocTOC();
        return objReferenceDocToc.toc.find((node: SalesforceTOC.DocumentationNode) => node.hasOwnProperty('text') && node.text === 'Reference');
    }
}

class RestAPISalesforceReferenceDocType extends SalesforceReferenceAtlasBasedDocType {
    constructor() {
        super(
            DocTypeName.REST_API,
            '/atlas.en-us.api_rest.meta',
            '/api_rest'
        );
    }
    /**
     * Get the root documentation node for this Documentation Type - its children
     * will be the actual documentation we want to obtain
     *
     * @throws An error with `message` containing "getaddrinfo ENOTFOUND developer.salesforce.com" if it fails due to a connection issue
     */
    protected async getRootDocumentationNode(): Promise<SalesforceTOC.DocumentationNode> {
        const docToc: any = await this.getDocTOC();
        return docToc.toc.find((node: SalesforceTOC.DocumentationNode) => node.hasOwnProperty('id') && node.id === 'resources_list');
    }
}

class SOAPAPISalesforceReferenceDocType extends SalesforceReferenceAtlasBasedDocType {
    constructor() {
        super(
            DocTypeName.SOAP_API,
            '/atlas.en-us.api.meta',
            '/api'
        );
    }
    /**
     * Get the root documentation node for this Documentation Type - its children
     * will be the actual documentation we want to obtain
     *
     * @throws An error with `message` containing "getaddrinfo ENOTFOUND developer.salesforce.com" if it fails due to a connection issue
     */
    protected async getRootDocumentationNode(): Promise<SalesforceTOC.DocumentationNode> {
        const docToc: any = await this.getDocTOC();
        return docToc.toc.find((node: SalesforceTOC.DocumentationNode) => node.hasOwnProperty('text') && node.text === 'Reference');
    }
}

class SFDXCLISalesforceReferenceDocType extends SalesforceReferenceAtlasBasedDocType {
    constructor() {
        super(
            DocTypeName.SFDX_CLI,
            '/atlas.en-us.sfdx_cli_reference.meta',
            '/sfdx_cli_reference'
        );
    }
    /**
     * Get the root documentation node for this Documentation Type - its children
     * will be the actual documentation we want to obtain
     *
     * @throws An error with `message` containing "getaddrinfo ENOTFOUND developer.salesforce.com" if it fails due to a connection issue
     */
    protected async getRootDocumentationNode(): Promise<SalesforceTOC.DocumentationNode> {
        const docToc: any = await this.getDocTOC();
        return docToc.toc.find((node: SalesforceTOC.DocumentationNode) => node.hasOwnProperty('id') && node.id === 'cli_reference');
    }
}

export const SalesforceReferenceDocTypes: Record<DocTypeName, SalesforceReferenceDocType> = {
    APEX:               new ApexSalesforceReferenceDocType(),
    VISUALFORCE:        new VisualforceSalesforceReferenceDocType(),
    LIGHTNING_CONSOLE:  new LightningConsoleSalesforceReferenceDocType(),
    CLASSIC_CONSOLE:    new ClassicConsoleSalesforceReferenceDocType(),
    METADATA:           new MetadataSalesforceReferenceDocType(),
    OBJECT_REFERENCE:   new ObjectReferenceSalesforceReferenceDocType(),
    REST_API:           new RestAPISalesforceReferenceDocType(),
    SOAP_API:           new SOAPAPISalesforceReferenceDocType(),
    SFDX_CLI:           new SFDXCLISalesforceReferenceDocType(),
};
