import * as vscode from 'vscode';
import { SalesforceReferenceItem, SalesforceReferenceDocTypes, invalidateSalesforceReferenceCache, DocTypeName } from './SalesforceReference';

export async function activate(context: vscode.ExtensionContext) {

    async function openSalesforceDocQuickPick(docType: DocTypeName, prefillValue?: string) {
        //todo: handle errs with try catch fin, maybe show something dynamic in the message, like the bounce in the old ST3 plugin
        let salesforceReferenceItems: SalesforceReferenceItem[] = await SalesforceReferenceDocTypes[docType].getSalesforceReferenceItems(context);

        //TODO handle errors
        vscode.window.showQuickPick(salesforceReferenceItems, {matchOnDetail: true}).then((selectedReferenceItem) => {
            if (selectedReferenceItem !== undefined) {
                vscode.env.openExternal(vscode.Uri.parse(SalesforceReferenceDocTypes[docType].humanDocURL(selectedReferenceItem!)));
            }
        });
    }

    let apexReferenceDisposable: vscode.Disposable = vscode.commands.registerCommand('vscode-salesforce-doc-lookup.salesforce-reference-apex', async () => {
        openSalesforceDocQuickPick(DocTypeName.APEX);
    });

    let vfReferenceDisposable: vscode.Disposable = vscode.commands.registerCommand('vscode-salesforce-doc-lookup.salesforce-reference-visualforce', async () => {
        openSalesforceDocQuickPick(DocTypeName.VISUALFORCE);
    });

    let lightningconsoleReferenceDisposable: vscode.Disposable = vscode.commands.registerCommand('vscode-salesforce-doc-lookup.salesforce-reference-lightning-console', async () => {
        openSalesforceDocQuickPick(DocTypeName.LIGHTNING_CONSOLE);
    });

    let classicconsoleReferenceDisposable: vscode.Disposable = vscode.commands.registerCommand('vscode-salesforce-doc-lookup.salesforce-reference-classic-console', async () => {
        openSalesforceDocQuickPick(DocTypeName.CLASSIC_CONSOLE);
    });

    let metadataReferenceDisposable: vscode.Disposable = vscode.commands.registerCommand('vscode-salesforce-doc-lookup.salesforce-reference-metadata', async () => {
        openSalesforceDocQuickPick(DocTypeName.METADATA);
    });

    let invalidateCacheDisposable: vscode.Disposable = vscode.commands.registerCommand('vscode-salesforce-doc-lookup.salesforce-reference-invalidate-cache', async () => {
        invalidateSalesforceReferenceCache(context);
    });

    context.subscriptions.push(
        apexReferenceDisposable,
        vfReferenceDisposable,
        classicconsoleReferenceDisposable,
        lightningconsoleReferenceDisposable,
        metadataReferenceDisposable,
        invalidateCacheDisposable
    );
}

export function deactivate() {}
