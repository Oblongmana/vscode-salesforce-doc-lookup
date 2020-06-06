import * as vscode from 'vscode';
import { multiStepInput } from './multiStepInput';
import got from 'got';

export async function activate(context: vscode.ExtensionContext) {

    interface DocReferenceQuickPickItem extends vscode.QuickPickItem {
        /**
         * The path supplied by the SF ToC for a given node, in a_attr.href
         */
        href: string;
        /**
         * The "id" needed for the raw doc endpoint (see SF_RAW_DOC_PATH in src code)
         * At time of writing, this is a_attr.href on a given reference node, not
         * the 'id' property, like you might expect, but is only everything before the `#`
         *
         * TODO: it'll need splitting if we want to get something we can use for the raw doc endpoint,
         *        and that's not useful until we work out a display-in-vscode-strategy - the feasibility
         *        of which needs further consideration. See notes in this project.
         *        If we do that, consider switching this to a class and building this from
         *        `href` instead, rather than leaving consumers to parse (assuming it doesn't differ
         *        between doc types)
         */
        rawDocId?: string;
    }

    const SF_DOC_ROOT_URL = 'https://developer.salesforce.com/docs';
    const SF_TOC_PATH = '/get_document';
    const SF_RAW_DOC_PATH = '/get_document_content';

    const APEX_HUMAN_DOC_PATH = '/atlas.en-us.apexcode.meta/apexcode';
    const APEX_DOC_TOC_URL = SF_DOC_ROOT_URL + SF_TOC_PATH + '/atlas.en-us.apexcode.meta';

    const VF_HUMAN_DOC_PATH = '/atlas.en-us.pages.meta/pages';
    const VF_DOC_TOC_URL = SF_DOC_ROOT_URL + SF_TOC_PATH + '/atlas.en-us.pages.meta';

    const SFCONSOLE_HUMAN_DOC_PATH = '/atlas.en-us.api_console.meta/api_console';
    const SFCONSOLE_DOC_TOC_URL = SF_DOC_ROOT_URL + SF_TOC_PATH + '/atlas.en-us.api_console.meta';

    const METADATA_HUMAN_DOC_PATH = '/atlas.en-us.api_meta.meta/api_meta';
    const METADATA_DOC_TOC_URL = SF_DOC_ROOT_URL + SF_TOC_PATH + '/atlas.en-us.api_meta.meta';


    async function getApexDocToc(): Promise<any> {
        const body: any = await got(APEX_DOC_TOC_URL).json();
        return body;
    }

    async function getVisualforceDocToc(): Promise<any> {
        const body: any = await got(VF_DOC_TOC_URL).json();
        return body;
    }

    async function getServiceConsoleDocToc(): Promise<any> {
        const body: any = await got(SFCONSOLE_DOC_TOC_URL).json();
        return body;
    }

    async function getMetadataDocToc(): Promise<any> {
        const body: any = await got(METADATA_DOC_TOC_URL).json();
        return body;
    }

    function buildApexHumanDocURL(selectedReferenceItem: DocReferenceQuickPickItem) {
        return `${SF_DOC_ROOT_URL}${APEX_HUMAN_DOC_PATH}/${selectedReferenceItem.href}`;
    }

    function buildVisualforceHumanDocURL(selectedReferenceItem: DocReferenceQuickPickItem) {
        return `${SF_DOC_ROOT_URL}${VF_HUMAN_DOC_PATH}/${selectedReferenceItem.href}`;
    }

    function buildConsoleHumanDocURL(selectedReferenceItem: DocReferenceQuickPickItem) {
        return `${SF_DOC_ROOT_URL}${SFCONSOLE_HUMAN_DOC_PATH}/${selectedReferenceItem.href}`;
    }

    function buildMetadataHumanDocURL(selectedReferenceItem: DocReferenceQuickPickItem) {
        return `${SF_DOC_ROOT_URL}${METADATA_HUMAN_DOC_PATH}/${selectedReferenceItem.href}`;
    }

    function buildApexRawDocURL(folder: string, id: string, locale: string, version: string): string {
        return `${SF_DOC_ROOT_URL}${SF_RAW_DOC_PATH}/${folder}/${id}/${locale}/${version}`;
    }

    let apexReferenceDisposable: vscode.Disposable = vscode.commands.registerCommand('vscode-salesforce-doc-lookup.salesforce-reference-apex', async () => {
        //TODO: review icon usage in this command https://code.visualstudio.com/api/references/icons-in-labels
        //TODO: caching

        //todo: handle errs with try catch fin, maybe show something dynamic in the message, like the bounce in the old ST3 plugin
        // const statusBarMsg = vscode.window.setStatusBarMessage('Retrieving Salesforce Apex Reference Index...Message');
        vscode.window.showInformationMessage('Retrieving Salesforce Apex Reference Index...','OK');
        const sfJSONDoc: any = await getApexDocToc();
        // console.dir(sfJSONDoc);
        // console.log(sfJSONDoc.content_document_id);
        const apexFolder: string = sfJSONDoc.deliverable;
        // console.log(apexFolder);
        const apexLocale: string = sfJSONDoc.language.locale;
        // console.log(apexLocale);
        const apexDocVersion: string = sfJSONDoc.version.doc_version;
        // console.log(apexDocVersion);
        const apexReferenceToc: any = sfJSONDoc.toc[0].children.find((node: any) => node.hasOwnProperty('id') && node.id === 'apex_reference');
        // console.log(apexReferenceToc.a_attr);

        function convertApexReferenceToQuickPickItem(apexReferenceNode: any, breadcrumbString: string): DocReferenceQuickPickItem[] {
            const itemNodes: DocReferenceQuickPickItem[] = [];
            itemNodes.push({
                label: apexReferenceNode.text,
                detail: breadcrumbString,
                href: apexReferenceNode.a_attr.href
            });
            if (apexReferenceNode.hasOwnProperty('children')) {
                const breadcrumbStringForChildren = `${breadcrumbString} $(breadcrumb-separator) ${apexReferenceNode.text}`;
                apexReferenceNode.children.forEach((childReferenceNode: any) => {
                    itemNodes.push(...convertApexReferenceToQuickPickItem(childReferenceNode,breadcrumbStringForChildren));
                });
            }
            return itemNodes;
        }

        const apexReferenceTocQuickPickItems = convertApexReferenceToQuickPickItem(apexReferenceToc ,'$(home)');

        var myNeatItems: DocReferenceQuickPickItem[] = apexReferenceTocQuickPickItems;

        // statusBarMsg.dispose();

        //TODO handle cancellation/errors
        vscode.window.showQuickPick(myNeatItems, {matchOnDetail: true}).then((selectedReferenceItem) => {
            // console.log(selectedReferenceItem);
            vscode.env.openExternal(vscode.Uri.parse(buildApexHumanDocURL(selectedReferenceItem!)));
        });
    });

    let vfReferenceDisposable: vscode.Disposable = vscode.commands.registerCommand('vscode-salesforce-doc-lookup.salesforce-reference-visualforce', async () => {
        //TODO: review icon usage in this command https://code.visualstudio.com/api/references/icons-in-labels
        //TODO: caching

        //todo: handle errs with try catch fin, maybe show something dynamic in the message, like the bounce in the old ST3 plugin
        // const statusBarMsg = vscode.window.setStatusBarMessage('Retrieving Salesforce Apex Reference Index...Message');
        vscode.window.showInformationMessage('Retrieving Salesforce Visualforce Reference Index...','OK');
        const sfJSONDoc: any = await getVisualforceDocToc();
        // console.dir(sfJSONDoc);
        // console.log(sfJSONDoc.content_document_id);
        const vfFolder: string = sfJSONDoc.deliverable;
        // console.log(vfFolder);
        const vfLocale: string = sfJSONDoc.language.locale;
        // console.log(vfLocale);
        const vfDocVersion: string = sfJSONDoc.version.doc_version;
        // console.log(vfDocVersion);
        const vfReferenceToc: any = sfJSONDoc.toc.find((node: any) => node.hasOwnProperty('id') && node.id === 'pages_compref');
        // console.dir(vfReferenceToc);

        function convertVFReferenceToQuickPickItem(vfReferenceNode: any, breadcrumbString: string): DocReferenceQuickPickItem[] {
            const itemNodes: DocReferenceQuickPickItem[] = [];
            itemNodes.push({
                label: vfReferenceNode.text,
                detail: breadcrumbString,
                href: vfReferenceNode.a_attr.href
            });
            if (vfReferenceNode.hasOwnProperty('children')) {
                const breadcrumbStringForChildren = `${breadcrumbString} $(breadcrumb-separator) ${vfReferenceNode.text}`;
                vfReferenceNode.children.forEach((childReferenceNode: any) => {
                    itemNodes.push(...convertVFReferenceToQuickPickItem(childReferenceNode,breadcrumbStringForChildren));
                });
            }
            return itemNodes;
        }

        const vfReferenceTocQuickPickItems = convertVFReferenceToQuickPickItem(vfReferenceToc ,'$(home)');

        var myNeatItems: DocReferenceQuickPickItem[] = vfReferenceTocQuickPickItems;

        // statusBarMsg.dispose();

        //TODO handle cancellation/errors
        vscode.window.showQuickPick(myNeatItems, {matchOnDetail: true}).then((selectedReferenceItem) => {
            // console.log(selectedReferenceItem);
            vscode.env.openExternal(vscode.Uri.parse(buildVisualforceHumanDocURL(selectedReferenceItem!)));
        });
    });

    let lightningconsoleReferenceDisposable: vscode.Disposable = vscode.commands.registerCommand('vscode-salesforce-doc-lookup.salesforce-reference-lightning-console', async () => {
        //TODO: review icon usage in this command https://code.visualstudio.com/api/references/icons-in-labels
        //TODO: caching

        //todo: handle errs with try catch fin, maybe show something dynamic in the message, like the bounce in the old ST3 plugin
        // const statusBarMsg = vscode.window.setStatusBarMessage('Retrieving Salesforce Apex Reference Index...Message');
        vscode.window.showInformationMessage('Retrieving Salesforce Lightning Console Reference Index...','OK');
        const sfJSONDoc: any = await getServiceConsoleDocToc();
        // console.dir(sfJSONDoc);
        // console.log(sfJSONDoc.content_document_id);
        const lightningconsoleFolder: string = sfJSONDoc.deliverable;
        // console.log(lightningconsoleFolder);
        const lightningconsoleLocale: string = sfJSONDoc.language.locale;
        // console.log(lightningconsoleLocale);
        const lightningconsoleDocVersion: string = sfJSONDoc.version.doc_version;
        // console.log(lightningconsoleDocVersion);
        const lightningconsoleTopLevelToc: any = sfJSONDoc.toc.find((node: any) => node.hasOwnProperty('id') && node.id === 'sforce_api_console_js_getting_started');
        // console.dir(lightningconsoleTopLevelToc);
        const lightningconsoleReferenceToc: any = lightningconsoleTopLevelToc.children.find((node: any) => node.hasOwnProperty('id') && node.id === 'sforce_api_console_methods_lightning');
        // console.dir(lightningconsoleReferenceToc);

        function convertLightningConsoleReferenceToQuickPickItem(referenceNode: any, breadcrumbString: string): DocReferenceQuickPickItem[] {
            const itemNodes: DocReferenceQuickPickItem[] = [];
            itemNodes.push({
                label: referenceNode.text,
                detail: breadcrumbString,
                href: referenceNode.a_attr.href
            });
            if (referenceNode.hasOwnProperty('children')) {
                const breadcrumbStringForChildren = `${breadcrumbString} $(breadcrumb-separator) ${referenceNode.text}`;
                referenceNode.children.forEach((childReferenceNode: any) => {
                    itemNodes.push(...convertLightningConsoleReferenceToQuickPickItem(childReferenceNode,breadcrumbStringForChildren));
                });
            }
            return itemNodes;
        }

        const referenceTocQuickPickItems = convertLightningConsoleReferenceToQuickPickItem(lightningconsoleReferenceToc ,'$(home)');

        // statusBarMsg.dispose();

        //TODO handle cancellation/errors
        vscode.window.showQuickPick(referenceTocQuickPickItems, {matchOnDetail: true}).then((selectedReferenceItem) => {
            // console.log(selectedReferenceItem);
            vscode.env.openExternal(vscode.Uri.parse(buildConsoleHumanDocURL(selectedReferenceItem!)));
        });
    });

    let classicconsoleReferenceDisposable: vscode.Disposable = vscode.commands.registerCommand('vscode-salesforce-doc-lookup.salesforce-reference-classic-console', async () => {
        //TODO: review icon usage in this command https://code.visualstudio.com/api/references/icons-in-labels
        //TODO: caching

        //todo: handle errs with try catch fin, maybe show something dynamic in the message, like the bounce in the old ST3 plugin
        // const statusBarMsg = vscode.window.setStatusBarMessage('Retrieving Salesforce Apex Reference Index...Message');
        vscode.window.showInformationMessage('Retrieving Salesforce Classic Console Reference Index...','OK');
        const sfJSONDoc: any = await getServiceConsoleDocToc();
        // console.dir(sfJSONDoc);
        // console.log(sfJSONDoc.content_document_id);
        const classicconsoleFolder: string = sfJSONDoc.deliverable;
        // console.log(classicconsoleFolder);
        const classicconsoleLocale: string = sfJSONDoc.language.locale;
        // console.log(classicconsoleLocale);
        const classicconsoleDocVersion: string = sfJSONDoc.version.doc_version;
        // console.log(classicconsoleDocVersion);
        const classicconsoleTopLevelToc: any = sfJSONDoc.toc.find((node: any) => node.hasOwnProperty('id') && node.id === 'sforce_api_console_intro');
        // console.dir(classicconsoleTopLevelToc);
        const classicconsoleReferenceToc: any = classicconsoleTopLevelToc.children.find((node: any) => node.hasOwnProperty('id') && node.id === 'sforce_api_console_methods_classic');
        // console.dir(classicconsoleReferenceToc);

        function convertClassicConsoleReferenceToQuickPickItem(referenceNode: any, breadcrumbString: string): DocReferenceQuickPickItem[] {
            const itemNodes: DocReferenceQuickPickItem[] = [];
            itemNodes.push({
                label: referenceNode.text,
                detail: breadcrumbString,
                href: referenceNode.a_attr.href
            });
            if (referenceNode.hasOwnProperty('children')) {
                const breadcrumbStringForChildren = `${breadcrumbString} $(breadcrumb-separator) ${referenceNode.text}`;
                referenceNode.children.forEach((childReferenceNode: any) => {
                    itemNodes.push(...convertClassicConsoleReferenceToQuickPickItem(childReferenceNode,breadcrumbStringForChildren));
                });
            }
            return itemNodes;
        }

        const referenceTocQuickPickItems = convertClassicConsoleReferenceToQuickPickItem(classicconsoleReferenceToc ,'$(home)');

        // statusBarMsg.dispose();

        //TODO handle cancellation/errors
        vscode.window.showQuickPick(referenceTocQuickPickItems, {matchOnDetail: true}).then((selectedReferenceItem) => {
            // console.log(selectedReferenceItem);
            vscode.env.openExternal(vscode.Uri.parse(buildConsoleHumanDocURL(selectedReferenceItem!)));
        });
    });

    let metadataReferenceDisposable: vscode.Disposable = vscode.commands.registerCommand('vscode-salesforce-doc-lookup.salesforce-reference-metadata', async () => {
        //TODO: review icon usage in this command https://code.visualstudio.com/api/references/icons-in-labels
        //TODO: caching

        //todo: handle errs with try catch fin, maybe show something dynamic in the message, like the bounce in the old ST3 plugin
        // const statusBarMsg = vscode.window.setStatusBarMessage('Retrieving Salesforce Metadata Reference Index...Message');
        vscode.window.showInformationMessage('Retrieving Salesforce Metadata Reference Index...','OK');
        const sfJSONDoc: any = await getMetadataDocToc();
        console.dir(sfJSONDoc);
        // console.log(sfJSONDoc.content_document_id);
        const metadataFolder: string = sfJSONDoc.deliverable;
        // console.log(metadataFolder);
        const metadataLocale: string = sfJSONDoc.language.locale;
        // console.log(metadataLocale);
        const metadataDocVersion: string = sfJSONDoc.version.doc_version;
        // console.log(metadataDocVersion);
        const metadataReferenceToc: any = sfJSONDoc.toc.find((node: any) => node.hasOwnProperty('text') && node.text === 'Reference');
        console.dir(metadataReferenceToc);

        function convertMetadataReferenceToQuickPickItem(referenceNode: any, breadcrumbString: string): DocReferenceQuickPickItem[] {
            const itemNodes: DocReferenceQuickPickItem[] = [];
            console.log('node: ', referenceNode);
            if (referenceNode.hasOwnProperty('a_attr')) {
                itemNodes.push({
                    label: referenceNode.text,
                    detail: breadcrumbString,
                    href: referenceNode.a_attr.href
                });
            }
            if (referenceNode.hasOwnProperty('children')) {
                const breadcrumbStringForChildren = `${breadcrumbString} $(breadcrumb-separator) ${referenceNode.text}`;
                referenceNode.children.forEach((childReferenceNode: any) => {
                    itemNodes.push(...convertMetadataReferenceToQuickPickItem(childReferenceNode,breadcrumbStringForChildren));
                });
            }
            return itemNodes;
        }

        const referenceTocQuickPickItems = convertMetadataReferenceToQuickPickItem(metadataReferenceToc,'$(home)');

        // statusBarMsg.dispose();

        //TODO handle cancellation/errors
        vscode.window.showQuickPick(referenceTocQuickPickItems, {matchOnDetail: true}).then((selectedReferenceItem) => {
            // console.log(selectedReferenceItem);
            vscode.env.openExternal(vscode.Uri.parse(buildMetadataHumanDocURL(selectedReferenceItem!)));
        });
    });

    context.subscriptions.push(apexReferenceDisposable, vfReferenceDisposable, classicconsoleReferenceDisposable, lightningconsoleReferenceDisposable, metadataReferenceDisposable);
}

export function deactivate() {}
