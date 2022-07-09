import { AtlasDocType } from "../../AbstractDocTypes/AtlasDocType";
import { DocType } from "../../DocType";

export class ObjectReferenceAtlasDocType extends AtlasDocType {
    constructor() {
        super(
            DocType.OBJECT_REFERENCE,
            'object_reference'
        );
    }
    /**
     * Get the root documentation node for this Documentation Type - its children
     * will be the actual documentation we want to obtain
     *
     * @throws An error with `message` containing "getaddrinfo ENOTFOUND developer.salesforce.com" if it fails due to a connection issue
     */
    protected async getRootDocumentationNode(): Promise<AtlasTOC.DocumentationNode> {
        const objReferenceDocToc: any = await this.getDocTOC();
        return objReferenceDocToc.toc.find((node: AtlasTOC.DocumentationNode) => node.hasOwnProperty('text') && node.text === 'Reference');
    }
}