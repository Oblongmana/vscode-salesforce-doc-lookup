import { AtlasDocType } from "../../AbstractDocTypes/AtlasDocType";
import { DocTypeID } from "../../DocTypeID";

export class RestAPIAtlasDocType extends AtlasDocType {
    constructor() {
        super(
            DocTypeID.REST_API
        );
    }
    /**
     * Get the root documentation node for this Documentation Type - its children
     * will be the actual documentation we want to obtain
     *
     * @throws An error with `message` containing "getaddrinfo ENOTFOUND developer.salesforce.com" if it fails due to a connection issue
     */
    protected async getRootDocumentationNode(): Promise<AtlasTOC.DocumentationNode> {
        const docToc: any = await this.getDocTOC();
        return docToc.toc.find((node: AtlasTOC.DocumentationNode) => node.hasOwnProperty('id') && node.id === 'resources_list');
    }
}