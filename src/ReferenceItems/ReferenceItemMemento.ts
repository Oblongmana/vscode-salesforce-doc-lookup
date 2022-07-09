import * as vscode from 'vscode';

/**
 * A ReferenceItem represents a distinct piece of documentation that:
 * - can be displayed in a VSCode QuickPick
 * - we can open in a web browser;
 * - has a human-readable breadcrumb string indicating how we got to this node;
 *
 * This is intended as a DATA-ONLY object, so they can be serialized/deserialized
 * generically. Their constructor may do domain-specific work for convenience sake,
 * but it should be assumed that these will be Serialized/Deserialized as ReferenceItem
 * rather than as a concrete implementation (so additional fields will NOT be serialized)
 *
 * TODO review/rewrite class doc
 */
export /*NB: "sealed"*/ class ReferenceItemMemento implements vscode.QuickPickItem {

    /**
     * @inheritdoc
     * Used in ReferenceItemMemento for storing the breadcrumb
     */
    public readonly label!: string; //QuickPickItem field, used to store the breadcrumb
    /**
     * Domain-specific string Key-Value pairs for the ReferenceItem. Generally this will be some sort of identifier.
     *
     * As examples, for Salesforce documentation ReferenceItems, the final part of the doc URL is stored
     * (path, query, and fragment (cf. https://url.spec.whatwg.org/#example-url-components)) with key="resource"
     * - E.g. in https://developer.salesforce.com/docs/atlas.en-us.apexref.meta/apexref/apex_dml_section.htm#apex_dml_undelete
     *          this is `apex_dml_section.htm#apex_dml_undelete`
     * - E.g. in https://developer.salesforce.com/docs/component-library/bundle/lightning:carousel
     *          this is `lightning:carousel`
     */
    public readonly data!: Record<string, string>;
    public readonly description?: string | undefined;
    public readonly detail?: string | undefined;
    public readonly picked?: boolean | undefined;
    public readonly alwaysShow?: boolean | undefined;

    //TODO feels a bit weird but there's probably a case for ReferenceItemMemento and ReferenceItem sharing a custom interface that's one layer down from QuickPickItem
    //     otherwise both have a strange duplication of fields, but with `data` added
    constructor(referenceItem: Partial<ReferenceItemMemento>) {
        // This workaround essentially seals the class (in the sense of C# `sealed`)
        if (this.constructor !== ReferenceItemMemento) {
            throw new Error('Subclassing ReferenceItemMemento is forbidden, these must be stored in a uniform fashion');
        }
        Object.assign(this, referenceItem);
    }
}