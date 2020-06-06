import * as vscode from 'vscode';

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
     *        of which needs further consideration. See notes in this project.
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
            // console.log('SF rec docNode', docNode);
            // console.log('ownProp?', docNode.hasOwnProperty('a_attr'));
            // console.log('undefin?', docNode.a_attr === undefined);
            throw new Error('Supplied DocumentationNode had a missing or undefined `a_attr`. This CANNOT be used to build a SalesforceReferenceItem - these are used to build links and must have this populated');
        }
        if (!docNode.a_attr.hasOwnProperty('href') || docNode.a_attr.href === undefined) {
            // console.log('SF rec docNode', docNode);
            // console.log('ownProp?', docNode.a_attr.hasOwnProperty('href'));
            // console.log('undefin?', docNode.a_attr.href === undefined);
            throw new Error('Supplied DocumentationNode had a missing or undefined `a_attr.href`. This CANNOT be used to build a SalesforceReferenceItem - these are used to build links and must have this populated');
        }
        this.href = docNode.a_attr.href;
        this.detail = breadcrumb;
    }

}

export function convertDocNodeToSalesforceReferenceItem(referenceNode: any, breadcrumbString: string): SalesforceReferenceItem[] {
    const referenceItems: SalesforceReferenceItem[] = [];
    //Convert this node into a SalesforceReferenceItem, after run-time checking it has appropriate properties
    if (referenceNode.hasOwnProperty('a_attr')) {
        referenceItems.push(new SalesforceReferenceItem(referenceNode,breadcrumbString));
    }
    //Recursively convert children into SalesforceReferenceItems and add them to our list
    if (referenceNode.hasOwnProperty('children')) {
        const breadcrumbStringForChildren = `${breadcrumbString} $(breadcrumb-separator) ${referenceNode.text}`;
        referenceNode.children.forEach((childReferenceNode: any) => {
            referenceItems.push(...convertDocNodeToSalesforceReferenceItem(childReferenceNode,breadcrumbStringForChildren));
        });
    }
    return referenceItems;
}

export interface SalesforceReferenceType {

}
