import * as vscode from 'vscode';
import { SalesforceReferenceItem, SalesforceReferenceDocTypes, invalidateSalesforceReferenceCache } from './SalesforceReference';

export async function activate(context: vscode.ExtensionContext) {

    let apexReferenceDisposable: vscode.Disposable = vscode.commands.registerCommand('vscode-salesforce-doc-lookup.salesforce-reference-apex', async () => {
        //todo: handle errs with try catch fin, maybe show something dynamic in the message, like the bounce in the old ST3 plugin
        let salesforceReferenceItems: SalesforceReferenceItem[] = await SalesforceReferenceDocTypes.APEX.getSalesforceReferenceItems(context);

        //TODO handle errors
        vscode.window.showQuickPick(salesforceReferenceItems, {matchOnDetail: true}).then((selectedReferenceItem) => {
            if (selectedReferenceItem !== undefined) {
                vscode.env.openExternal(vscode.Uri.parse(SalesforceReferenceDocTypes.APEX.humanDocURL(selectedReferenceItem!)));
            }
        });
    });

    let vfReferenceDisposable: vscode.Disposable = vscode.commands.registerCommand('vscode-salesforce-doc-lookup.salesforce-reference-visualforce', async () => {
        //todo: handle errs with try catch fin, maybe show something dynamic in the message, like the bounce in the old ST3 plugin
        let salesforceReferenceItems: SalesforceReferenceItem[] = await SalesforceReferenceDocTypes.VISUALFORCE.getSalesforceReferenceItems(context);

        //TODO handle errors
        vscode.window.showQuickPick(salesforceReferenceItems, {matchOnDetail: true}).then((selectedReferenceItem) => {
            if (selectedReferenceItem !== undefined) {
                vscode.env.openExternal(vscode.Uri.parse(SalesforceReferenceDocTypes.VISUALFORCE.humanDocURL(selectedReferenceItem!)));
            }
        });
    });

    let lightningconsoleReferenceDisposable: vscode.Disposable = vscode.commands.registerCommand('vscode-salesforce-doc-lookup.salesforce-reference-lightning-console', async () => {
        //todo: handle errs with try catch fin, maybe show something dynamic in the message, like the bounce in the old ST3 plugin
        let salesforceReferenceItems: SalesforceReferenceItem[] = await SalesforceReferenceDocTypes.LIGHTNING_CONSOLE.getSalesforceReferenceItems(context);

        //TODO handle errors
        vscode.window.showQuickPick(salesforceReferenceItems, {matchOnDetail: true}).then((selectedReferenceItem) => {
            if (selectedReferenceItem !== undefined) {
                vscode.env.openExternal(vscode.Uri.parse(SalesforceReferenceDocTypes.LIGHTNING_CONSOLE.humanDocURL(selectedReferenceItem!)));
            }
        });
    });

    let classicconsoleReferenceDisposable: vscode.Disposable = vscode.commands.registerCommand('vscode-salesforce-doc-lookup.salesforce-reference-classic-console', async () => {
        //todo: handle errs with try catch fin, maybe show something dynamic in the message, like the bounce in the old ST3 plugin
        let salesforceReferenceItems: SalesforceReferenceItem[] = await SalesforceReferenceDocTypes.CLASSIC_CONSOLE.getSalesforceReferenceItems(context);

        //TODO handle errors
        vscode.window.showQuickPick(salesforceReferenceItems, {matchOnDetail: true}).then((selectedReferenceItem) => {
            if (selectedReferenceItem !== undefined) {
                vscode.env.openExternal(vscode.Uri.parse(SalesforceReferenceDocTypes.CLASSIC_CONSOLE.humanDocURL(selectedReferenceItem!)));
            }
        });
    });

    let metadataReferenceDisposable: vscode.Disposable = vscode.commands.registerCommand('vscode-salesforce-doc-lookup.salesforce-reference-metadata', async () => {
        //todo: handle errs with try catch fin, maybe show something dynamic in the message, like the bounce in the old ST3 plugin
        let salesforceReferenceItems: SalesforceReferenceItem[] = await SalesforceReferenceDocTypes.METADATA.getSalesforceReferenceItems(context);

        //TODO handle errors
        vscode.window.showQuickPick(salesforceReferenceItems, {matchOnDetail: true}).then((selectedReferenceItem) => {
            if (selectedReferenceItem !== undefined) {
                vscode.env.openExternal(vscode.Uri.parse(SalesforceReferenceDocTypes.METADATA.humanDocURL(selectedReferenceItem!)));
            }
        });
    });

    let invalidateCacheDisposable: vscode.Disposable = vscode.commands.registerCommand('vscode-salesforce-doc-lookup.salesforce-reference-invalidate-cache', async () => {
        invalidateSalesforceReferenceCache(context);
    });

    context.subscriptions.push(apexReferenceDisposable, vfReferenceDisposable, classicconsoleReferenceDisposable, lightningconsoleReferenceDisposable, metadataReferenceDisposable, invalidateCacheDisposable);
}

export function deactivate() {}
