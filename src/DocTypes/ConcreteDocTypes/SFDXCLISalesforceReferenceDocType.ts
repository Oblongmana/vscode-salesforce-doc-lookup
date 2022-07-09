import { getAtlasVersionCodeOverride } from "../../Utilities/DocTypeConfig";
import { SalesforceReferenceAtlasDocType } from "../AbstractDocTypes/SalesforceReferenceAtlasDocType";
import { DocTypeName } from "../DocTypeNames";

export class SFDXCLISalesforceReferenceDocType extends SalesforceReferenceAtlasDocType {
    constructor() {
        super(
            DocTypeName.SFDX_CLI,
            'sfdx_cli_reference'
        );
    }
    /**
     * Get the root documentation node for this Documentation Type - its children
     * will be the actual documentation we want to obtain
     *
     * @throws An error with `message` containing "getaddrinfo ENOTFOUND developer.salesforce.com" if it fails due to a connection issue
     */
    protected async getRootDocumentationNode(): Promise<SalesforceAtlasTOC.DocumentationNode> {
        const docToc: any = await this.getDocTOC();
        const versionCode: number = parseFloat(getAtlasVersionCodeOverride(this.docTypeName));
        let rootNodeId: string = 'cli_reference_top';
        if (!isNaN(versionCode) && versionCode < 234.0) {
            //Salesforce add `sf` doc in Version 234/Winter 22/v53, so both `sf` and `sfdx` are included.
            //  To do so, another root node layer was added above the the previous one: cli_reference_top
            rootNodeId = 'cli_reference';
        }
        return docToc.toc.find((node: SalesforceAtlasTOC.DocumentationNode) => node.hasOwnProperty('id') && node.id === rootNodeId);
    }
}