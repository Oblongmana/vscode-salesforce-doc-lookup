import { AtlasDocType } from "../../AbstractDocTypes/AtlasDocType";
import { DocTypeID } from "../../DocTypeID";
import { getAtlasVersionCodeOverride } from "../../DocTypeConfig";

export class SFDXCLIAtlasDocType extends AtlasDocType {
    constructor() {
        super(
            DocTypeID.SFDX_CLI
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
        const versionCode: number = parseFloat(getAtlasVersionCodeOverride(this.docType));
        let rootNodeId: string = 'cli_reference_top';
        if (!isNaN(versionCode) && versionCode < 234.0) {
            //Salesforce add `sf` doc in Version 234/Winter 22/v53, so both `sf` and `sfdx` are included.
            //  To do so, another root node layer was added above the the previous one: cli_reference_top
            rootNodeId = 'cli_reference';
        }
        return docToc.toc.find((node: AtlasTOC.DocumentationNode) => node.hasOwnProperty('id') && node.id === rootNodeId);
    }
}