import { ReferenceItem } from "./ReferenceItem";

//TODO: doc
export class SalesforceAtlasReferenceItem implements ReferenceItem {
    label: string;
    description?: string | undefined;
    detail?: string | undefined;
    picked?: boolean | undefined;
    alwaysShow?: boolean | undefined;
    resource: string;

    /**
     * Construct an instance of SalesforceAtlasReferenceItem from a SalesforceAtlasTOC.DocumentationNode
     * TODO: review copied doc
     *
     * @param docNode A documentationNode from an Atlas-based ToC, which must have both label and a_attr.href populated
     * @param breadcrumb A human-readable breadcrumb string, indicating to the user where in the ToC this node sits (e.g. "$(home) $(breadcrumb-separator) Apex Language Reference")
     */
    constructor(docNode: SalesforceAtlasTOC.DocumentationNode, breadcrumb: string) {
        if (!docNode.hasOwnProperty('text') || docNode.text === undefined) {
            throw new Error('Supplied DocumentationNode had a missing or undefined `text`. This CANNOT be used to build a SalesforceAtlasReferenceItem - these are used to build Quick Pick items and must have this populated');
        }
        if (!docNode.hasOwnProperty('a_attr') || docNode.a_attr === undefined) {
            throw new Error('Supplied DocumentationNode had a missing or undefined `a_attr`. This CANNOT be used to build a SalesforceAtlasReferenceItem - these are used to build links and must have this populated');
        }
        if (!docNode.a_attr.hasOwnProperty('href') || docNode.a_attr.href === undefined) {
            throw new Error('Supplied DocumentationNode had a missing or undefined `a_attr.href`. This CANNOT be used to build a SalesforceAtlasReferenceItem - these are used to build links and must have this populated');
        }
        this.label = docNode.text;
        this.resource = docNode.a_attr.href;
        this.detail = breadcrumb;
    }
}