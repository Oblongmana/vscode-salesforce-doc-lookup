import { AtlasDocType } from "../../AbstractDocTypes/AtlasDocType";
import { DocType } from "../../DocType";

export class LightningConsoleAtlasDocType extends AtlasDocType {
    constructor() {
        super(
            DocType.LIGHTNING_CONSOLE,
            'api_console'
        );
    }
    /**
     * Get the root documentation node for this Documentation Type - its children
     * will be the actual documentation we want to obtain
     *
     * @throws An error with `message` containing "getaddrinfo ENOTFOUND developer.salesforce.com" if it fails due to a connection issue
     */
    protected async getRootDocumentationNode(): Promise<AtlasTOC.DocumentationNode> {
        const lightningConsoleDocToc: any = await this.getDocTOC();
        const lightningconsoleTopLevelToc: any = lightningConsoleDocToc.toc.find((node: AtlasTOC.DocumentationNode) => node.hasOwnProperty('id') && node.id === 'sforce_api_console_lex_getting_started');
        const lightningconsoleJSAPILevelToc: any = lightningconsoleTopLevelToc.children.find((node: AtlasTOC.DocumentationNode) => node.hasOwnProperty('id') && node.id === 'sforce_api_console_js_getting_started');
        return lightningconsoleJSAPILevelToc.children.find((node: AtlasTOC.DocumentationNode) => node.hasOwnProperty('id') && node.id === 'sforce_api_console_methods_lightning');
    }
}