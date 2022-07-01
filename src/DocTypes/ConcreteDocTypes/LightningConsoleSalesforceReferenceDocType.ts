import { SalesforceReferenceAtlasDocType } from "../AbstractDocTypes/SalesforceReferenceAtlasDocType";
import { DocTypeName } from "../DocTypeNames";

export class LightningConsoleSalesforceReferenceDocType extends SalesforceReferenceAtlasDocType {
    constructor() {
        super(
            DocTypeName.LIGHTNING_CONSOLE,
            '/atlas.en-us.api_console.meta',
            '/api_console'
        );
    }
    /**
     * Get the root documentation node for this Documentation Type - its children
     * will be the actual documentation we want to obtain
     *
     * @throws An error with `message` containing "getaddrinfo ENOTFOUND developer.salesforce.com" if it fails due to a connection issue
     */
    protected async getRootDocumentationNode(): Promise<SalesforceAtlasTOC.DocumentationNode> {
        const lightningConsoleDocToc: any = await this.getDocTOC();
        const lightningconsoleTopLevelToc: any = lightningConsoleDocToc.toc.find((node: SalesforceAtlasTOC.DocumentationNode) => node.hasOwnProperty('id') && node.id === 'sforce_api_console_lex_getting_started');
        const lightningconsoleJSAPILevelToc: any = lightningconsoleTopLevelToc.children.find((node: SalesforceAtlasTOC.DocumentationNode) => node.hasOwnProperty('id') && node.id === 'sforce_api_console_js_getting_started');
        return lightningconsoleJSAPILevelToc.children.find((node: SalesforceAtlasTOC.DocumentationNode) => node.hasOwnProperty('id') && node.id === 'sforce_api_console_methods_lightning');
    }
}