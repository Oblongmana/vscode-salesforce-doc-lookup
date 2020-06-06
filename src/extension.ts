import * as vscode from 'vscode';
import './SalesforceReference';
import { SalesforceReferenceItem, convertDocNodeToSalesforceReferenceItem, SalesforceReferenceDocTypes } from './SalesforceReference';

export async function activate(context: vscode.ExtensionContext) {

    let apexReferenceDisposable: vscode.Disposable = vscode.commands.registerCommand('vscode-salesforce-doc-lookup.salesforce-reference-apex', async () => {
        //TODO: caching

        //todo: handle errs with try catch fin, maybe show something dynamic in the message, like the bounce in the old ST3 plugin
        vscode.window.showInformationMessage('Retrieving Salesforce Apex Reference Index...','OK');

        var salesforceReferenceItems: SalesforceReferenceItem[] = SalesforceReferenceDocTypes.APEX.getSalesforceReferenceItems();

        //TODO handle errors
        vscode.window.showQuickPick(salesforceReferenceItems, {matchOnDetail: true}).then((selectedReferenceItem) => {
            if (selectedReferenceItem !== undefined) {
                vscode.env.openExternal(vscode.Uri.parse(SalesforceReferenceDocTypes.APEX.humanDocURL(selectedReferenceItem!)));
            }
        });
    });

    let vfReferenceDisposable: vscode.Disposable = vscode.commands.registerCommand('vscode-salesforce-doc-lookup.salesforce-reference-visualforce', async () => {
        //TODO: caching

        //todo: handle errs with try catch fin, maybe show something dynamic in the message, like the bounce in the old ST3 plugin
        vscode.window.showInformationMessage('Retrieving Salesforce Visualforce Reference Index...','OK');

        var salesforceReferenceItems: SalesforceReferenceItem[] = SalesforceReferenceDocTypes.VISUALFORCE.getSalesforceReferenceItems();

        //TODO handle errors
        vscode.window.showQuickPick(salesforceReferenceItems, {matchOnDetail: true}).then((selectedReferenceItem) => {
            if (selectedReferenceItem !== undefined) {
                vscode.env.openExternal(vscode.Uri.parse(SalesforceReferenceDocTypes.VISUALFORCE.humanDocURL(selectedReferenceItem!)));
            }
        });
    });

    let lightningconsoleReferenceDisposable: vscode.Disposable = vscode.commands.registerCommand('vscode-salesforce-doc-lookup.salesforce-reference-lightning-console', async () => {
        //TODO: caching

        //todo: handle errs with try catch fin, maybe show something dynamic in the message, like the bounce in the old ST3 plugin
        vscode.window.showInformationMessage('Retrieving Salesforce Lightning Console Reference Index...','OK');

        var salesforceReferenceItems: SalesforceReferenceItem[] = SalesforceReferenceDocTypes.LIGHTNING_CONSOLE.getSalesforceReferenceItems();

        //TODO handle errors
        vscode.window.showQuickPick(salesforceReferenceItems, {matchOnDetail: true}).then((selectedReferenceItem) => {
            if (selectedReferenceItem !== undefined) {
                vscode.env.openExternal(vscode.Uri.parse(SalesforceReferenceDocTypes.LIGHTNING_CONSOLE.humanDocURL(selectedReferenceItem!)));
            }
        });
    });

    let classicconsoleReferenceDisposable: vscode.Disposable = vscode.commands.registerCommand('vscode-salesforce-doc-lookup.salesforce-reference-classic-console', async () => {
        //TODO: caching

        //todo: handle errs with try catch fin, maybe show something dynamic in the message, like the bounce in the old ST3 plugin
        vscode.window.showInformationMessage('Retrieving Salesforce Classic Console Reference Index...','OK');

        var salesforceReferenceItems: SalesforceReferenceItem[] = SalesforceReferenceDocTypes.CLASSIC_CONSOLE.getSalesforceReferenceItems();

        //TODO handle errors
        vscode.window.showQuickPick(salesforceReferenceItems, {matchOnDetail: true}).then((selectedReferenceItem) => {
            if (selectedReferenceItem !== undefined) {
                vscode.env.openExternal(vscode.Uri.parse(SalesforceReferenceDocTypes.CLASSIC_CONSOLE.humanDocURL(selectedReferenceItem!)));
            }
        });
    });

    let metadataReferenceDisposable: vscode.Disposable = vscode.commands.registerCommand('vscode-salesforce-doc-lookup.salesforce-reference-metadata', async () => {
        //TODO: caching

        //todo: handle errs with try catch fin, maybe show something dynamic in the message, like the bounce in the old ST3 plugin
        vscode.window.showInformationMessage('Retrieving Salesforce Metadata Reference Index...','OK');

        var salesforceReferenceItems: SalesforceReferenceItem[] = SalesforceReferenceDocTypes.METADATA.getSalesforceReferenceItems();

        //TODO handle errors
        vscode.window.showQuickPick(salesforceReferenceItems, {matchOnDetail: true}).then((selectedReferenceItem) => {
            if (selectedReferenceItem !== undefined) {
                vscode.env.openExternal(vscode.Uri.parse(SalesforceReferenceDocTypes.METADATA.humanDocURL(selectedReferenceItem!)));
            }
        });
    });

    context.subscriptions.push(apexReferenceDisposable, vfReferenceDisposable, classicconsoleReferenceDisposable, lightningconsoleReferenceDisposable, metadataReferenceDisposable);
}

export function deactivate() {}
