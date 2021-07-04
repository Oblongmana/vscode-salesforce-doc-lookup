import * as vscode from 'vscode';
import { DocTypeName, SalesforceReferenceItem, SalesforceReferenceDocTypes } from './SalesforceReference';
import { getDocCommandQuickPickItems } from './PackageIntrospection';
import { SalesforceReferenceOutputChannel } from './Logging';
import { showDocInWebView } from './SalesforceDocWebView';
import { getConfig } from './Config';

//Minor design note - everything that can throw exceptions will generally be expected not to handle them unless it can recover.
// Otherwise error handling is left to these top-level commands, which should give the user appropriate feedback
const EXCEPTION_OFFLINE_ERROR = 'getaddrinfo ENOTFOUND developer.salesforce.com';
const HUMAN_MESSAGE_OFFLINE_ERROR = 'You appear to be offline or unable to reach developer.salesforce.com. Please check your connection and try again.';
const HUMAN_MESSAGE_UNEXPECTED_ERROR = 'Unexpected error while trying to access Salesforce doc. Please log an issue and repro steps at https://github.com/Oblongmana/vscode-salesforce-doc-lookup/issues';

export async function openSalesforceDocQuickPick(context: vscode.ExtensionContext, docType: DocTypeName, prefillValue?: string) {
    try {
        let salesforceReferenceItems: SalesforceReferenceItem[] = await SalesforceReferenceDocTypes[docType].getSalesforceReferenceItems(context);

        const docTypeQuickPick: vscode.QuickPick<SalesforceReferenceItem> = vscode.window.createQuickPick();;
        docTypeQuickPick.items = salesforceReferenceItems;
        docTypeQuickPick.matchOnDetail = true;
        if (prefillValue !== undefined) {
            docTypeQuickPick.value = prefillValue;
        }
        docTypeQuickPick.onDidAccept(async () => {
            //Do nothing if the user didn't pick anything - e.g. if they typed random characters that didn't match anything
            if (docTypeQuickPick.activeItems.length > 0) {
                //Make it clear we're loading by removing all items and showing the busy indicator
                docTypeQuickPick.enabled = false;
                docTypeQuickPick.placeholder = 'Retrieving Documentation...';
                docTypeQuickPick.items = [];
                docTypeQuickPick.busy = true;

                const selectedReferenceItem = docTypeQuickPick.activeItems[0];
                if (getConfig()?.EXPERIMENTAL?.useWebview) {
                    const rawDocURL = SalesforceReferenceDocTypes[docType].rawDocURL(selectedReferenceItem!);
                    const fragment = SalesforceReferenceDocTypes[docType].getFragment(selectedReferenceItem!);
                    showDocInWebView(context, vscode.Uri.parse(rawDocURL), fragment);
                } else {
                    vscode.env.openExternal(vscode.Uri.parse(SalesforceReferenceDocTypes[docType].humanDocURL(selectedReferenceItem!)));
                }
                docTypeQuickPick.hide();
                docTypeQuickPick.dispose();
            }
        });

        docTypeQuickPick.show();
    } catch (error) {
        if (error.message.includes(EXCEPTION_OFFLINE_ERROR)) {
            SalesforceReferenceOutputChannel.appendLine('Offline Error: ' + error + error.stack);
            vscode.window.showErrorMessage(HUMAN_MESSAGE_OFFLINE_ERROR,'OK');
        } else {
            SalesforceReferenceOutputChannel.appendLine('Unexpected Error: ' + error + error.stack);
            vscode.window.showErrorMessage(HUMAN_MESSAGE_UNEXPECTED_ERROR,'OK');
        }
    }
}

export function invalidateSalesforceReferenceCache(context: vscode.ExtensionContext) {
    vscode.window.showWarningMessage("This will throw away the cached documentation index for each documentation type, " +
        "so your next documentation lookup for each documentation type will need to re-retrieve the index from Salesforce. " +
        "Do you want to proceed?",{modal: true},'OK').then((selectedButton: string | undefined)=>{
            if (selectedButton === 'OK') {
                Object.values(DocTypeName).forEach((currDocTypeString: string) => {
                    context.globalState.update(currDocTypeString, undefined);
                });
            }
        });
}

export function openCurrentWordSearchQuickPick(context: vscode.ExtensionContext, textEditor: vscode.TextEditor) {
    try {
        const { selection, document } = textEditor;
        const range = selection && document ? document.getWordRangeAtPosition(selection.active) : undefined;
        const currentWord = range ? document.getText(selection) || document.getText(range) : selection && document.getText(selection) || undefined;
        if (currentWord !== undefined) {
            vscode.window.showQuickPick(getDocCommandQuickPickItems(), {placeHolder: 'Which documentation would you like to search?'}).then((selectedDocCommandJSON) => {
                vscode.commands.executeCommand(selectedDocCommandJSON!.command,currentWord);
            });
        } else {
            vscode.window.showErrorMessage('No word selected or under cursor');
        }
    } catch (error) {
        if (error.message.includes(EXCEPTION_OFFLINE_ERROR)) {
            SalesforceReferenceOutputChannel.appendLine('Offline Error: ' + error + error.stack);
            vscode.window.showErrorMessage(HUMAN_MESSAGE_OFFLINE_ERROR,'OK');
        } else {
            SalesforceReferenceOutputChannel.appendLine('Unexpected Error: ' + error + error.stack);
            vscode.window.showErrorMessage(HUMAN_MESSAGE_UNEXPECTED_ERROR,'OK');
        }
    }
}