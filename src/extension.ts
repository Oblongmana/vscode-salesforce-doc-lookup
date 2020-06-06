import * as vscode from 'vscode';
import { multiStepInput } from './multiStepInput';
import got from 'got';

export async function activate(context: vscode.ExtensionContext) {

    interface ApexReferenceQuickPickItem extends vscode.QuickPickItem {
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
    const SF_HUMAN_DOC_PATH = '/atlas.en-us.apexcode.meta/apexcode';
    const SF_RAW_DOC_PATH = '/get_document_content';
    const APEX_DOC_TOC_URL = SF_DOC_ROOT_URL + SF_TOC_PATH + '/atlas.en-us.apexcode.meta';

    async function getApexDocToc(): Promise<any> {
        const body: any = await got(APEX_DOC_TOC_URL).json();
        return body;
    }

    function buildApexHumanDocURL(selectedReferenceItem: ApexReferenceQuickPickItem) {
        return `${SF_DOC_ROOT_URL}${SF_HUMAN_DOC_PATH}/${selectedReferenceItem.href}`;
    }

    function buildApexRawDocURL(folder: string, id: string, locale: string, version: string): string {
        return `${SF_DOC_ROOT_URL}${SF_RAW_DOC_PATH}/${folder}/${id}/${locale}/${version}`;
    }

    let disposable = vscode.commands.registerCommand('vscode-salesforce-doc-lookup.salesforce-reference-apex', async () => {
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

        function convertApexReferenceToQuickPickItem(apexReferenceNode: any, breadcrumbString: string): ApexReferenceQuickPickItem[] {
            const itemNodes: ApexReferenceQuickPickItem[] = [];
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

        var myNeatItems: ApexReferenceQuickPickItem[] = apexReferenceTocQuickPickItems;

        // statusBarMsg.dispose();

        //TODO handle cancellation/errors
        vscode.window.showQuickPick(myNeatItems, {matchOnDetail: true}).then((selectedReferenceItem) => {
            // console.log(selectedReferenceItem);
            vscode.env.openExternal(vscode.Uri.parse(buildApexHumanDocURL(selectedReferenceItem!)));
        });
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
