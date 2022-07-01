import * as vscode from 'vscode';

/**
 * A Salesforce Reference Entry represents a Salesforce ToC entry that:
 * - we can open in a web browser;
 * - has a human-readable breadcrumb string indicating how we got to this node;
 * - can be displayed in a VSCode QuickPick
 *
 * todo: update doc to describe more generically
 */
export interface ReferenceItem extends vscode.QuickPickItem {
    //QuickPick Interface fields
    label: string;
    description?: string | undefined;
    detail?: string | undefined;
    picked?: boolean | undefined;
    alwaysShow?: boolean | undefined;

    /**
     * The final part of the URL for a given reference item - from a technical perspective,
     * this is the path, query, and fragment (cf. https://url.spec.whatwg.org/#example-url-components)
     *
     * E.g. in https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_dml_section.htm#apex_dml_undelete
     *          this is `apex_dml_section.htm#apex_dml_undelete`
     * E.g. in https://developer.salesforce.com/docs/component-library/bundle/lightning:carousel
     *          this is `lightning:carousel`
     */
    resource: string;
}