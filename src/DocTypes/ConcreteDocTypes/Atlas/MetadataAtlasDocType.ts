import { AtlasDocType } from "../../AbstractDocTypes/AtlasDocType";
import { DocType } from "../../DocType";

export class MetadataAtlasDocType extends AtlasDocType {
    constructor() {
        super(
            DocType.METADATA,
            'api_meta'
        );
    }
    /**
     * Get the root documentation node for this Documentation Type - its children
     * will be the actual documentation we want to obtain
     *
     * @throws An error with `message` containing "getaddrinfo ENOTFOUND developer.salesforce.com" if it fails due to a connection issue
     */
    protected async getRootDocumentationNode(): Promise<AtlasTOC.DocumentationNode> {
        const metadataDocToc: any = await this.getDocTOC();
        return metadataDocToc.toc.find((node: AtlasTOC.DocumentationNode) => node.hasOwnProperty('text') && node.text === 'Reference');
    }
}