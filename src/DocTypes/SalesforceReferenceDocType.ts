import * as vscode from 'vscode';
import { ReferenceItem } from "../ReferenceItems/ReferenceItem";

//TODO: review - is this still "Salesforce" specific or can we ditch this from the name? See esp the method name getSalesforceReferenceItems
export interface SalesforceReferenceDocType {
    /**
     * Get the ReferenceItem instances for this reference doc type.
     *
     * Implementers should make use of the cache.
     *
     * @param context the extension context, provided so you can access/populate the cache.
     */
    getSalesforceReferenceItems(context: vscode.ExtensionContext): Promise<ReferenceItem[]>;

    /**
     * Get a URL for a human-readable page that can be loaded into the browser, for a given ReferenceItem
     *
     * @param selectedReferenceItem A ReferenceItem to be loaded in the browser
     */
    humanDocURL(selectedReferenceItem: ReferenceItem): string;

    /**
     * EXPERIMENTAL: Get the raw doc as HTML that can be displayed in a webview
     *
     * @param selectedReferenceItem the ReferenceItem to get the raw doc for
     * @returns a promise that will resolve to a string of html that can be merged into a WebView
     */
    rawDoc(selectedReferenceItem: ReferenceItem): Promise<string>;

    /**
     * Extract the fragment from a Salesforce Reference Item
     *
     * e.g. in https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_dml_section.htm#apex_dml_undelete,
     *      this is "apex_dml_undelete"
     *
     * @param selectedReferenceItem the ReferenceItem to extract the fragment from
     * @returns the fragment, if there is one
     */
    getFragment(selectedReferenceItem: ReferenceItem): string
}
