import { AtlasDocType } from "../../AbstractDocTypes/AtlasDocType";
import { DocTypeID } from "../../DocTypeID";

export class LightningConsoleAtlasDocType extends AtlasDocType {
    constructor() {
        super(
            DocTypeID.LIGHTNING_CONSOLE
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
        const topLevelToc: any = docToc.toc.find((node: AtlasTOC.DocumentationNode) => node.hasOwnProperty('id') && node.id === 'sforce_api_console_lex_getting_started');
        const jsAPILevelToc: any = topLevelToc.children.find((node: AtlasTOC.DocumentationNode) => node.hasOwnProperty('id') && node.id === 'sforce_api_console_js_getting_started');
        return jsAPILevelToc.children.find((node: AtlasTOC.DocumentationNode) => node.hasOwnProperty('id') && node.id === 'sforce_api_console_methods_lightning');
    }
}