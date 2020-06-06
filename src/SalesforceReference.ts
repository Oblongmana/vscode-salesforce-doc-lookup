import * as vscode from 'vscode';
import got from 'got';

const SF_DOC_ROOT_URL = 'https://developer.salesforce.com/docs';
const SF_TOC_PATH = '/get_document';
const SF_RAW_DOC_PATH = '/get_document_content';

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

abstract class SalesforceReferenceDocType {

    /**
     * The portion of the URL path giving the location of human readable doc for this doc type.
     *
     * e.g. in the URL "https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_dml_section.htm#apex_dml_undelete"
     *      this is "/atlas.en-us.apexcode.meta/apexcode"
     */
    private readonly humanReadableDocPath: string;

    /**
     * The portion of the URL path giving the location of the Table of Contents used by tools to get document structure
     *
     * e.g. in the URL "https://developer.salesforce.com/docs/get_document/atlas.en-us.apexcode.meta"
     *      this is "/atlas.en-us.apexcode.meta"
     */
    private readonly docTocPath: string;

    /**
     * The full URL to get the Table of Contents used by tools to get document structure
     */
    private readonly docTOCUrl: string;

    /**
     *
     * @param docTocPath The portion of the URL path giving the location of human readable doc for this doc type.
     *                      e.g. in the URL "https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_dml_section.htm#apex_dml_undelete"
     *                           this is "/atlas.en-us.apexcode.meta/apexcode"
     * @param humanReadableDocPath The portion of the URL path giving the location of human readable doc for this doc type.
     *                                e.g. in the URL "https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_dml_section.htm#apex_dml_undelete"
     *                                      this is "/atlas.en-us.apexcode.meta/apexcode"
     */
    constructor(docTocPath: string, humanReadableDocPath: string) {
        this.docTocPath = docTocPath;
        this.humanReadableDocPath = humanReadableDocPath;
        this.docTOCUrl = SF_DOC_ROOT_URL + SF_TOC_PATH + this.docTocPath;
    }

    /**
     * Get the SalesforceReferenceItem instances for this reference doc type
     */
    public async getSalesforceReferenceItems(): Promise<SalesforceReferenceItem[]> {
        //TODO: handle any errors
        const rootDocumentationNode: any = await this.getRootDocumentationNode();
        return this.convertDocNodeToSalesforceReferenceItems(rootDocumentationNode, '$(home)');
    }

    /**
     * Get a URL for a human-readable page that can be loaded into the browser, for a given SalesforceReferenceItem
     * @param selectedReferenceItem A SalesforceReferenceItem to be loaded in the browser
     */
    public humanDocURL(selectedReferenceItem: SalesforceReferenceItem): string {
        return `${SF_DOC_ROOT_URL}${this.humanReadableDocPath}/${selectedReferenceItem.href}`;
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
        //Convert this node into a SalesforceReferenceItem, after run-time checking it has appropriate properties
        if (documentationNode.hasOwnProperty('a_attr')) {
            referenceItems.push(new SalesforceReferenceItem(documentationNode, breadcrumbString));
        }
        //Recursively convert children into SalesforceReferenceItems and add them to our list
        if (documentationNode.hasOwnProperty('children') && documentationNode.children !== undefined) {
            const breadcrumbStringForChildren = `${breadcrumbString} $(breadcrumb-separator) ${documentationNode.text}`;
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
     */
    protected abstract async getRootDocumentationNode(): Promise<SalesforceTOC.DocumentationNode>;

    /**
     * Get the Table of Contents used by tools to get document structure for this documentation type
     */
    protected async getDocTOC(): Promise<any> {
        //TODO: Similar to the SalesforceTOC.DocumentationNode - the root node should be loaded into something with a defined interface
        const body: any = await got(this.docTOCUrl).json();
        return body;
    }

    /**
     * UNIMPLEMENTED: Get a URL for a machine-readable page containing doc, given the supplied parameters
     */
    private rawDocURL(folder: string, id: string, locale: string, version: string): string {
        // The required params can be obtained from the following things on the root Node.
        //  See the NOTES.md file for further detail on possible future plans

        // const vfFolder: string = sfJSONDoc.deliverable;
        // const vfLocale: string = sfJSONDoc.language.locale;
        // const vfDocVersion: string = sfJSONDoc.version.doc_version;

        // return `${SF_DOC_ROOT_URL}${SF_RAW_DOC_PATH}/${folder}/${id}/${locale}/${version}`;
        throw new Error('This method is not yet implemented');
    }
}

class ApexSalesforceReferenceDocType extends SalesforceReferenceDocType {
    constructor() {
        super(
            '/atlas.en-us.apexcode.meta',
            '/atlas.en-us.apexcode.meta/apexcode'
        );
    }
    protected async getRootDocumentationNode(): Promise<SalesforceTOC.DocumentationNode> {
        //TODO: handle any errors
        const apexDocToc: any = await this.getDocTOC();
        return apexDocToc.toc[0].children.find((node: SalesforceTOC.DocumentationNode) => node.hasOwnProperty('id') && node.id === 'apex_reference');
    }
}

class VisualforceSalesforceReferenceDocType extends SalesforceReferenceDocType {
    constructor() {
        super(
            '/atlas.en-us.pages.meta',
            '/atlas.en-us.pages.meta/pages'
        );
    }
    protected async getRootDocumentationNode(): Promise<SalesforceTOC.DocumentationNode> {
        //TODO: handle any errors
        const vfDocToc: any = await this.getDocTOC();
        return vfDocToc.toc.find((node: SalesforceTOC.DocumentationNode) => node.hasOwnProperty('id') && node.id === 'pages_compref');
    }
}

class LightningConsoleSalesforceReferenceDocType extends SalesforceReferenceDocType {
    constructor() {
        super(
            '/atlas.en-us.api_console.meta',
            '/atlas.en-us.api_console.meta/api_console'
        );
    }
    protected async getRootDocumentationNode(): Promise<SalesforceTOC.DocumentationNode> {
        //TODO: handle any errors
        const lightningConsoleDocToc: any = await this.getDocTOC();
        const lightningconsoleTopLevelToc: any = lightningConsoleDocToc.toc.find((node: SalesforceTOC.DocumentationNode) => node.hasOwnProperty('id') && node.id === 'sforce_api_console_js_getting_started');
        return lightningconsoleTopLevelToc.children.find((node: SalesforceTOC.DocumentationNode) => node.hasOwnProperty('id') && node.id === 'sforce_api_console_methods_lightning');
    }
}

class ClassicConsoleSalesforceReferenceDocType extends SalesforceReferenceDocType {
    constructor() {
        super(
            '/atlas.en-us.api_console.meta',
            '/atlas.en-us.api_console.meta/api_console'
        );
    }
    protected async getRootDocumentationNode(): Promise<SalesforceTOC.DocumentationNode> {
        //TODO: handle any errors
        const classicConsoleDocToc: any = await this.getDocTOC();
        const classicconsoleTopLevelToc: any = classicConsoleDocToc.toc.find((node: SalesforceTOC.DocumentationNode) => node.hasOwnProperty('id') && node.id === 'sforce_api_console_intro');
        return classicconsoleTopLevelToc.children.find((node: SalesforceTOC.DocumentationNode) => node.hasOwnProperty('id') && node.id === 'sforce_api_console_methods_classic');
    }
}

class MetadataSalesforceReferenceDocType extends SalesforceReferenceDocType {
    constructor() {
        super(
            '/atlas.en-us.api_meta.meta',
            '/atlas.en-us.api_meta.meta/api_meta'
        );
    }
    protected async getRootDocumentationNode(): Promise<SalesforceTOC.DocumentationNode> {
        //TODO: handle any errors
        const metadataDocToc: any = await this.getDocTOC();
        return metadataDocToc.toc.find((node: SalesforceTOC.DocumentationNode) => node.hasOwnProperty('text') && node.text === 'Reference');
    }
}

type DocTypeName = 'APEX' | 'VISUALFORCE' | 'LIGHTNING_CONSOLE' | 'CLASSIC_CONSOLE' | 'METADATA';

export const SalesforceReferenceDocTypes: Record<DocTypeName, SalesforceReferenceDocType> = {
    APEX: new ApexSalesforceReferenceDocType(),
    VISUALFORCE: new VisualforceSalesforceReferenceDocType(),
    LIGHTNING_CONSOLE: new LightningConsoleSalesforceReferenceDocType(),
    CLASSIC_CONSOLE: new ClassicConsoleSalesforceReferenceDocType(),
    METADATA: new MetadataSalesforceReferenceDocType(),
};
