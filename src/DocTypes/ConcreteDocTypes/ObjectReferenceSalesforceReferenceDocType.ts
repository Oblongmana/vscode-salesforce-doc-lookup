import { SalesforceReferenceAtlasDocType } from "../AbstractDocTypes/SalesforceReferenceAtlasDocType";
import { DocTypeName } from "../DocTypeNames";

export class ObjectReferenceSalesforceReferenceDocType extends SalesforceReferenceAtlasDocType {
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
    protected async getRootDocumentationNode(): Promise<SalesforceAtlasTOC.DocumentationNode> {
        const objReferenceDocToc: any = await this.getDocTOC();
        return objReferenceDocToc.toc.find((node: SalesforceAtlasTOC.DocumentationNode) => node.hasOwnProperty('text') && node.text === 'Reference');
    }
}