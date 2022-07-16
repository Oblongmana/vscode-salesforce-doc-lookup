import { AtlasDocType } from "../../AbstractDocTypes/AtlasDocType";
import { DocTypeID } from "../../DocTypeID";

export class MobileSDKAtlasDocType extends AtlasDocType {
    constructor() {
        super(
            DocTypeID.MOBILE_SDK
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
        // The Mobile SDK doc has (at time of writing 2022-07), multiple root nodes. So we simply create
        //  our own root node with no href, just text, and assign our "real" root nodes as children
        const fakeRootNode: AtlasTOC.DocumentationNode = {
            text: "Mobile SDK",
            children: apexDocToc.toc
        };
        return fakeRootNode;
    }
}