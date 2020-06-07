import * as vscode from 'vscode';
import { DocTypeName } from './SalesforceReference';
import { EXTENSION_NAME, DocCommands, UtilityCommands } from './PackageIntrospection';
import { openSalesforceDocQuickPick, invalidateSalesforceReferenceCache, openCurrentWordSearchQuickPick } from './SalesforceReferenceCommands';

export async function activate(context: vscode.ExtensionContext) {

    let apexReferenceDisposable: vscode.Disposable = vscode.commands.registerCommand(`${EXTENSION_NAME}.${DocCommands.APEX}`, async (prefillValue?: string) => {
        openSalesforceDocQuickPick(context, DocTypeName.APEX, prefillValue);
    });

    let vfReferenceDisposable: vscode.Disposable = vscode.commands.registerCommand(`${EXTENSION_NAME}.${DocCommands.VISUALFORCE}`, async (prefillValue?: string) => {
        openSalesforceDocQuickPick(context, DocTypeName.VISUALFORCE, prefillValue);
    });

    let lightningconsoleReferenceDisposable: vscode.Disposable = vscode.commands.registerCommand(`${EXTENSION_NAME}.${DocCommands.LIGHTNING_CONSOLE}`, async (prefillValue?: string) => {
        openSalesforceDocQuickPick(context, DocTypeName.LIGHTNING_CONSOLE, prefillValue);
    });

    let classicconsoleReferenceDisposable: vscode.Disposable = vscode.commands.registerCommand(`${EXTENSION_NAME}.${DocCommands.CLASSIC_CONSOLE}`, async (prefillValue?: string) => {
        openSalesforceDocQuickPick(context, DocTypeName.CLASSIC_CONSOLE, prefillValue);
    });

    let metadataReferenceDisposable: vscode.Disposable = vscode.commands.registerCommand(`${EXTENSION_NAME}.${DocCommands.METADATA}`, async (prefillValue?: string) => {
        openSalesforceDocQuickPick(context, DocTypeName.METADATA, prefillValue);
    });

    let invalidateCacheDisposable: vscode.Disposable = vscode.commands.registerCommand(`${EXTENSION_NAME}.${UtilityCommands.INVALIDATE_CACHE}`, async () => {
        invalidateSalesforceReferenceCache(context);
    });

    let currentWordSearchDisposable: vscode.Disposable = vscode.commands.registerTextEditorCommand(`${EXTENSION_NAME}.${UtilityCommands.CURRENT_WORD_SEARCH}`, async (textEditor: vscode.TextEditor) => {
        openCurrentWordSearchQuickPick(context, textEditor);
    });

    context.subscriptions.push(
        apexReferenceDisposable,
        vfReferenceDisposable,
        classicconsoleReferenceDisposable,
        lightningconsoleReferenceDisposable,
        metadataReferenceDisposable,
        invalidateCacheDisposable,
        currentWordSearchDisposable
    );
}

export function deactivate() {}
