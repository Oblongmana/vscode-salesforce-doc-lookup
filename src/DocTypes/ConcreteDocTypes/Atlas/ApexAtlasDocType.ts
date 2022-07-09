import { AtlasDocType } from "../../AbstractDocTypes/AtlasDocType";
import { DocType } from "../../DocType";

export class ApexAtlasDocType extends AtlasDocType {
    constructor() {
        super(
            DocType.APEX,
            'apexref'
        );
    }
    /**
     * Get the root documentation node for this Documentation Type - its children
     * will be the actual documentation we want to obtain
     *
     * @throws An error with `message` containing "getaddrinfo ENOTFOUND developer.salesforce.com" if it fails due to a connection issue
     */
    protected async getRootDocumentationNode(): Promise<AtlasTOC.DocumentationNode> {
        const apexDocToc: any = await this.getDocTOC();
        return apexDocToc.toc.find((node: AtlasTOC.DocumentationNode) => node.hasOwnProperty('id') && node.id === 'apex_ref_guide');
    }
}