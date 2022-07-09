import * as vscode from 'vscode';
import { getDocCommandQuickPickItems } from './Introspection';
import { Logging } from './Logging';
import { showDocInWebView } from './DocWebView';
import { getConfig } from './GlobalConfig';
import { DocType, DocTypeFactory } from './DocTypes';
import { ReferenceItem } from './ReferenceItems/ReferenceItem';
import { ERROR_MESSAGES } from './GlobalConstants';

export async function openDocQuickPick(context: vscode.ExtensionContext, docType: DocType, prefillValue?: string) {
    try {
        let referenceItems: ReferenceItem[] = await DocTypeFactory[docType]().getReferenceItems(context);

        const docTypeQuickPick: vscode.QuickPick<ReferenceItem> = vscode.window.createQuickPick();;
        docTypeQuickPick.items = referenceItems;
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
                    const htmlDoc = await selectedReferenceItem.asHTML();
                    const fragment = selectedReferenceItem.webViewNavFragment();
                    showDocInWebView(context, htmlDoc, fragment);
                } else {
                    vscode.env.openExternal(vscode.Uri.parse(selectedReferenceItem.humanDocURL()));
                }
                docTypeQuickPick.hide();
                docTypeQuickPick.dispose();
            }
        });

        docTypeQuickPick.show();
    } catch (error: unknown) {
        //Minor design note - everything that can throw exceptions will generally be expected not to handle them unless it can recover.
        // Otherwise error handling is left to these top-level commands, which should give the user appropriate feedback
        if (error instanceof Error) {
            //TODO, err handling is mostly duplicated with the curr word command below
            if (error.message.includes(ERROR_MESSAGES.EXCEPTION_OFFLINE_ERROR)) {
                Logging.appendLine('Offline Error: ' + error + error.stack);
                vscode.window.showErrorMessage(ERROR_MESSAGES.HUMAN_MESSAGE_OFFLINE_ERROR, 'OK');
            } else if (error.message.includes(ERROR_MESSAGES.TABLE_OF_CONTENTS_PREFACE)) {
                Logging.appendLine('ToC Error: ' + error + error.stack);
                vscode.window.showErrorMessage(error.message + ERROR_MESSAGES.HUMAN_MESSAGE_TABLE_OF_CONTENTS_SUFFIX, 'OK');
            } else {
                Logging.appendLine('Unexpected Error: ' + error + error.stack);
                vscode.window.showErrorMessage(ERROR_MESSAGES.HUMAN_MESSAGE_UNEXPECTED_ERROR,'OK');
            }
        } else {
            Logging.appendLine('Unexpected Error: Caught error was not of type Error: ' + error);
            vscode.window.showErrorMessage(ERROR_MESSAGES.HUMAN_MESSAGE_UNEXPECTED_ERROR,'OK');
        }
    }
}

export function invalidateEntireExtensionCache(context: vscode.ExtensionContext) {
    vscode.window.showWarningMessage("This will throw away the cached documentation index for each documentation type, " +
        "so your next documentation lookup for each documentation type will need to re-retrieve the index from Salesforce. " +
        "Do you want to proceed?",{modal: true},'OK').then((selectedButton: string | undefined)=>{
            if (selectedButton === 'OK') {
                Object.values(DocType).forEach((currDocTypeString: string) => {
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
                vscode.commands.executeCommand(selectedDocCommandJSON!.command, /*prefillValue=*/ currentWord);
            });
        } else {
            vscode.window.showErrorMessage('No word selected or under cursor');
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            if (error.message.includes(ERROR_MESSAGES.EXCEPTION_OFFLINE_ERROR)) {
                Logging.appendLine('Offline Error: ' + error + error.stack);
                vscode.window.showErrorMessage(ERROR_MESSAGES.HUMAN_MESSAGE_OFFLINE_ERROR,'OK');
            } else if (error.message.includes(ERROR_MESSAGES.TABLE_OF_CONTENTS_PREFACE)) {
                Logging.appendLine('ToC Error: ' + error + error.stack);
                vscode.window.showErrorMessage(error.message + ERROR_MESSAGES.HUMAN_MESSAGE_TABLE_OF_CONTENTS_SUFFIX, 'OK');
            } else {
                Logging.appendLine('Unexpected Error: ' + error + error.stack);
                vscode.window.showErrorMessage(ERROR_MESSAGES.HUMAN_MESSAGE_UNEXPECTED_ERROR,'OK');
            }
        } else {
            Logging.appendLine('Unexpected Error: Caught error was not of type Error: ' + error);
            vscode.window.showErrorMessage(ERROR_MESSAGES.HUMAN_MESSAGE_UNEXPECTED_ERROR,'OK');
        }
    }
}