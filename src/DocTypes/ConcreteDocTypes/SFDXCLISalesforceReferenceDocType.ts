import { SalesforceReferenceAtlasDocType } from "../AbstractDocTypes/SalesforceReferenceAtlasDocType";
import { DocTypeName } from "../DocTypeNames";

export class SFDXCLISalesforceReferenceDocType extends SalesforceReferenceAtlasDocType {
    constructor() {
        super(
            DocTypeName.SFDX_CLI,
            '/atlas.en-us.sfdx_cli_reference.meta',
            '/sfdx_cli_reference'
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
        return docToc.toc.find((node: SalesforceAtlasTOC.DocumentationNode) => node.hasOwnProperty('id') && node.id === 'cli_reference');
    }
}