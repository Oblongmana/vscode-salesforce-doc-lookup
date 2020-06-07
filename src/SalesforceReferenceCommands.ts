import * as vscode from 'vscode';
import { DocTypeName, SalesforceReferenceItem, SalesforceReferenceDocTypes } from './SalesforceReference';
import { getDocCommandQuickPickItems } from './PackageIntrospection';

export async function openSalesforceDocQuickPick(context: vscode.ExtensionContext, docType: DocTypeName, prefillValue?: string) {
    let salesforceReferenceItems: SalesforceReferenceItem[] = await SalesforceReferenceDocTypes[docType].getSalesforceReferenceItems(context);

    const docTypeQuickPick: vscode.QuickPick<SalesforceReferenceItem> = vscode.window.createQuickPick();;
    docTypeQuickPick.items = salesforceReferenceItems;
    if (prefillValue !== undefined) {
        docTypeQuickPick.value = prefillValue;
    }
    docTypeQuickPick.onDidAccept(() => {
        const selectedReferenceItem = docTypeQuickPick.activeItems[0];
        vscode.env.openExternal(vscode.Uri.parse(SalesforceReferenceDocTypes[docType].humanDocURL(selectedReferenceItem!)));
        docTypeQuickPick.hide();
        docTypeQuickPick.dispose();
    });

    docTypeQuickPick.show();
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
}