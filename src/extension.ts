import * as vscode from 'vscode';
import got from 'got';
import './SalesforceReference';
import { SalesforceReferenceItem, convertDocNodeToSalesforceReferenceItem } from './SalesforceReference';

export async function activate(context: vscode.ExtensionContext) {

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

    function buildApexHumanDocURL(selectedReferenceItem: SalesforceReferenceItem) {
        return `${SF_DOC_ROOT_URL}${APEX_HUMAN_DOC_PATH}/${selectedReferenceItem.href}`;
    }

    function buildVisualforceHumanDocURL(selectedReferenceItem: SalesforceReferenceItem) {
        return `${SF_DOC_ROOT_URL}${VF_HUMAN_DOC_PATH}/${selectedReferenceItem.href}`;
    }

    function buildConsoleHumanDocURL(selectedReferenceItem: SalesforceReferenceItem) {
        return `${SF_DOC_ROOT_URL}${SFCONSOLE_HUMAN_DOC_PATH}/${selectedReferenceItem.href}`;
    }

    function buildMetadataHumanDocURL(selectedReferenceItem: SalesforceReferenceItem) {
        return `${SF_DOC_ROOT_URL}${METADATA_HUMAN_DOC_PATH}/${selectedReferenceItem.href}`;
    }

    function buildApexRawDocURL(folder: string, id: string, locale: string, version: string): string {
        return `${SF_DOC_ROOT_URL}${SF_RAW_DOC_PATH}/${folder}/${id}/${locale}/${version}`;
    }

    let apexReferenceDisposable: vscode.Disposable = vscode.commands.registerCommand('vscode-salesforce-doc-lookup.salesforce-reference-apex', async () => {
        // var foo: SalesforceReferenceItem = new SalesforceReferenceItem({text: 'foo'},'bar');

        //TODO: review icon usage in this command https://code.visualstudio.com/api/references/icons-in-labels
        //TODO: caching

        //todo: handle errs with try catch fin, maybe show something dynamic in the message, like the bounce in the old ST3 plugin
        vscode.window.showInformationMessage('Retrieving Salesforce Apex Reference Index...','OK');
        const sfJSONDoc: any = await getApexDocToc();
        const apexFolder: string = sfJSONDoc.deliverable;
        const apexLocale: string = sfJSONDoc.language.locale;
        const apexDocVersion: string = sfJSONDoc.version.doc_version;
        const apexReferenceToc: SalesforceTOC.DocumentationNode = sfJSONDoc.toc[0].children.find((node: any) => node.hasOwnProperty('id') && node.id === 'apex_reference');

        const apexReferenceTocQuickPickItems = convertDocNodeToSalesforceReferenceItem(apexReferenceToc ,'$(home)');

        var myNeatItems: SalesforceReferenceItem[] = apexReferenceTocQuickPickItems;

        //TODO handle errors
        vscode.window.showQuickPick(myNeatItems, {matchOnDetail: true}).then((selectedReferenceItem) => {
            if (selectedReferenceItem !== undefined) {
                vscode.env.openExternal(vscode.Uri.parse(buildApexHumanDocURL(selectedReferenceItem!)));
            }
        });
    });

    let vfReferenceDisposable: vscode.Disposable = vscode.commands.registerCommand('vscode-salesforce-doc-lookup.salesforce-reference-visualforce', async () => {
        //TODO: review icon usage in this command https://code.visualstudio.com/api/references/icons-in-labels
        //TODO: caching

        //todo: handle errs with try catch fin, maybe show something dynamic in the message, like the bounce in the old ST3 plugin
        vscode.window.showInformationMessage('Retrieving Salesforce Visualforce Reference Index...','OK');
        const sfJSONDoc: any = await getVisualforceDocToc();
        const vfFolder: string = sfJSONDoc.deliverable;
        const vfLocale: string = sfJSONDoc.language.locale;
        const vfDocVersion: string = sfJSONDoc.version.doc_version;
        const vfReferenceToc: SalesforceTOC.DocumentationNode = sfJSONDoc.toc.find((node: any) => node.hasOwnProperty('id') && node.id === 'pages_compref');

        const vfReferenceTocQuickPickItems = convertDocNodeToSalesforceReferenceItem(vfReferenceToc ,'$(home)');

        var myNeatItems: SalesforceReferenceItem[] = vfReferenceTocQuickPickItems;

        //TODO handle errors
        vscode.window.showQuickPick(myNeatItems, {matchOnDetail: true}).then((selectedReferenceItem) => {
            if (selectedReferenceItem !== undefined) {
                vscode.env.openExternal(vscode.Uri.parse(buildVisualforceHumanDocURL(selectedReferenceItem!)));
            }
        });
    });

    let lightningconsoleReferenceDisposable: vscode.Disposable = vscode.commands.registerCommand('vscode-salesforce-doc-lookup.salesforce-reference-lightning-console', async () => {
        //TODO: review icon usage in this command https://code.visualstudio.com/api/references/icons-in-labels
        //TODO: caching

        //todo: handle errs with try catch fin, maybe show something dynamic in the message, like the bounce in the old ST3 plugin
        vscode.window.showInformationMessage('Retrieving Salesforce Lightning Console Reference Index...','OK');
        const sfJSONDoc: any = await getServiceConsoleDocToc();
        const lightningconsoleFolder: string = sfJSONDoc.deliverable;
        const lightningconsoleLocale: string = sfJSONDoc.language.locale;
        const lightningconsoleDocVersion: string = sfJSONDoc.version.doc_version;
        const lightningconsoleTopLevelToc: any = sfJSONDoc.toc.find((node: any) => node.hasOwnProperty('id') && node.id === 'sforce_api_console_js_getting_started');
        const lightningconsoleReferenceToc: SalesforceTOC.DocumentationNode = lightningconsoleTopLevelToc.children.find((node: any) => node.hasOwnProperty('id') && node.id === 'sforce_api_console_methods_lightning');

        const referenceTocQuickPickItems = convertDocNodeToSalesforceReferenceItem(lightningconsoleReferenceToc ,'$(home)');

        //TODO handle errors
        vscode.window.showQuickPick(referenceTocQuickPickItems, {matchOnDetail: true}).then((selectedReferenceItem) => {
            if (selectedReferenceItem !== undefined) {
                vscode.env.openExternal(vscode.Uri.parse(buildConsoleHumanDocURL(selectedReferenceItem!)));
            }
        });
    });

    let classicconsoleReferenceDisposable: vscode.Disposable = vscode.commands.registerCommand('vscode-salesforce-doc-lookup.salesforce-reference-classic-console', async () => {
        //TODO: review icon usage in this command https://code.visualstudio.com/api/references/icons-in-labels
        //TODO: caching

        //todo: handle errs with try catch fin, maybe show something dynamic in the message, like the bounce in the old ST3 plugin
        vscode.window.showInformationMessage('Retrieving Salesforce Classic Console Reference Index...','OK');
        const sfJSONDoc: any = await getServiceConsoleDocToc();
        const classicconsoleFolder: string = sfJSONDoc.deliverable;
        const classicconsoleLocale: string = sfJSONDoc.language.locale;
        const classicconsoleDocVersion: string = sfJSONDoc.version.doc_version;
        const classicconsoleTopLevelToc: any = sfJSONDoc.toc.find((node: any) => node.hasOwnProperty('id') && node.id === 'sforce_api_console_intro');
        const classicconsoleReferenceToc: SalesforceTOC.DocumentationNode = classicconsoleTopLevelToc.children.find((node: any) => node.hasOwnProperty('id') && node.id === 'sforce_api_console_methods_classic');

        const referenceTocQuickPickItems = convertDocNodeToSalesforceReferenceItem(classicconsoleReferenceToc ,'$(home)');

        //TODO handle errors
        vscode.window.showQuickPick(referenceTocQuickPickItems, {matchOnDetail: true}).then((selectedReferenceItem) => {
            if (selectedReferenceItem !== undefined) {
                vscode.env.openExternal(vscode.Uri.parse(buildConsoleHumanDocURL(selectedReferenceItem!)));
            }
        });
    });

    let metadataReferenceDisposable: vscode.Disposable = vscode.commands.registerCommand('vscode-salesforce-doc-lookup.salesforce-reference-metadata', async () => {
        //TODO: review icon usage in this command https://code.visualstudio.com/api/references/icons-in-labels
        //TODO: caching

        //todo: handle errs with try catch fin, maybe show something dynamic in the message, like the bounce in the old ST3 plugin
        vscode.window.showInformationMessage('Retrieving Salesforce Metadata Reference Index...','OK');
        const sfJSONDoc: any = await getMetadataDocToc();
        console.dir(sfJSONDoc);
        const metadataFolder: string = sfJSONDoc.deliverable;
        const metadataLocale: string = sfJSONDoc.language.locale;
        const metadataDocVersion: string = sfJSONDoc.version.doc_version;
        const metadataReferenceToc: SalesforceTOC.DocumentationNode = sfJSONDoc.toc.find((node: any) => node.hasOwnProperty('text') && node.text === 'Reference');
        console.dir(metadataReferenceToc);

        const referenceTocQuickPickItems = convertDocNodeToSalesforceReferenceItem(metadataReferenceToc,'$(home)');

        //TODO handle errors
        vscode.window.showQuickPick(referenceTocQuickPickItems, {matchOnDetail: true}).then((selectedReferenceItem) => {
            if (selectedReferenceItem !== undefined) {
                vscode.env.openExternal(vscode.Uri.parse(buildMetadataHumanDocURL(selectedReferenceItem!)));
            }
        });
    });

    context.subscriptions.push(apexReferenceDisposable, vfReferenceDisposable, classicconsoleReferenceDisposable, lightningconsoleReferenceDisposable, metadataReferenceDisposable);
}

export function deactivate() {}
