import * as vscode from 'vscode';
import { DocTypeName } from './SalesforceReference';
import { EXTENSION_NAME, DocCommands, UtilityCommands } from './PackageIntrospection';
import { openSalesforceDocQuickPick, invalidateSalesforceReferenceCache, openCurrentWordSearchQuickPick } from './SalesforceReferenceCommands';
import { SalesforceReferenceOutputChannel } from './Logging';
import { versionGlobalStateKey } from './Config';
import { PackageJSON } from './PackageIntrospection';
import * as semver from "semver";


export async function activate(context: vscode.ExtensionContext) {
    // SalesforceReferenceOutputChannel.appendLine('Activate function running');

    // Handle any upgrade-specific things that need to be done
    handleVersionChanges(context);

    //Build all of our User-facing commands
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

    let objectReferenceReferenceDisposable: vscode.Disposable = vscode.commands.registerCommand(`${EXTENSION_NAME}.${DocCommands.OBJECT_REFERENCE}`, async (prefillValue?: string) => {
        openSalesforceDocQuickPick(context, DocTypeName.OBJECT_REFERENCE, prefillValue);
    });

    let restApiReferenceDisposable: vscode.Disposable = vscode.commands.registerCommand(`${EXTENSION_NAME}.${DocCommands.REST_API}`, async (prefillValue?: string) => {
        openSalesforceDocQuickPick(context, DocTypeName.REST_API, prefillValue);
    });

    let soapApiReferenceDisposable: vscode.Disposable = vscode.commands.registerCommand(`${EXTENSION_NAME}.${DocCommands.SOAP_API}`, async (prefillValue?: string) => {
        openSalesforceDocQuickPick(context, DocTypeName.SOAP_API, prefillValue);
    });

    let sfdxCliReferenceDisposable: vscode.Disposable = vscode.commands.registerCommand(`${EXTENSION_NAME}.${DocCommands.SFDX_CLI}`, async (prefillValue?: string) => {
        openSalesforceDocQuickPick(context, DocTypeName.SFDX_CLI, prefillValue);
    });

    let lwcAuraComponentLibReferenceDisposable: vscode.Disposable = vscode.commands.registerCommand(`${EXTENSION_NAME}.${DocCommands.LWC_AND_AURA_COMPONENT_LIBRARY}`, async (prefillValue?: string) => {
        openSalesforceDocQuickPick(context, DocTypeName.LWC_AND_AURA_COMPONENT_LIBRARY, prefillValue);
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
        objectReferenceReferenceDisposable,
        invalidateCacheDisposable,
        currentWordSearchDisposable,
        restApiReferenceDisposable,
        soapApiReferenceDisposable,
        sfdxCliReferenceDisposable,
        lwcAuraComponentLibReferenceDisposable,
    );
}

function handleVersionChanges(context: vscode.ExtensionContext) {
    let existingVersionNumber: string | undefined = context.globalState.get(versionGlobalStateKey);
    let currentVersionNumber: string = PackageJSON.version;
    let isVersionChanging: boolean = false;
    if (existingVersionNumber === undefined) {
        SalesforceReferenceOutputChannel.appendLine(`No existing extension version, current version is ${currentVersionNumber}`);
        //Store the current version in our global state
        context.globalState.update(versionGlobalStateKey, currentVersionNumber);
        isVersionChanging = true;
    } else if (existingVersionNumber !== currentVersionNumber) {
        SalesforceReferenceOutputChannel.appendLine(`Version changing from ${existingVersionNumber} to ${currentVersionNumber}`);
        //check if we're upgrading, and update the stored version.
        //  Technically could also be a downgrade. Distinction doesn't matter at the moment,
        //  but we're putting this here just to be explicit (instead of combinined with the `undefined` case)
        context.globalState.update(versionGlobalStateKey, currentVersionNumber);
        isVersionChanging = true;
    }


    if (isVersionChanging) {
        //Any specific actions we need to take - e.g. clearing cache due to breaking changes to the SF doc, or breaking changes to our extension
        let normalisedExistingVersionNumber = existingVersionNumber || "0.0.0";
        if (semver.gt(currentVersionNumber, normalisedExistingVersionNumber)) {
            //Upgrading
        } if (semver.lt(currentVersionNumber, normalisedExistingVersionNumber)) {
            //Downgrading
        }

        //SF changed a few things between the 1.0.1 and 1.1.0 releases of this plugin
        //   Upgrading from anything lower than the 1.1.0 release needs the apex ref cache invalidated as address changed
        //   Upgrading from anything lower than the 1.1.0 release needs the Lightning console ref cache invalidated as toc was restructured
        if (semver.lte(normalisedExistingVersionNumber, '1.1.0')) {
            SalesforceReferenceOutputChannel.appendLine(`Extension version changed. Detected Apex Cache out of date after Salesforce relocated Reference doc. Force-clearing Apex Reference cache.`);
            context.globalState.update(DocTypeName.APEX, undefined);
            context.globalState.update(DocTypeName.LIGHTNING_CONSOLE, undefined);
        }

        //In 1.3.0, we updated the Breadcrumb to allow proper searching of it.
        //   Upgrading from anything lower than the 1.3.0 release means all cached DocTypes will be invalidated to support this
        if (semver.lte(normalisedExistingVersionNumber, '1.3.0')) {
            SalesforceReferenceOutputChannel.appendLine(`Extension version changed: prior was <=1.3.0. Invalidating all caches to support update that allows Breadcrumb searching.`);
            context.globalState.update(DocTypeName.APEX, undefined);
            context.globalState.update(DocTypeName.VISUALFORCE, undefined);
            context.globalState.update(DocTypeName.LIGHTNING_CONSOLE, undefined);
            context.globalState.update(DocTypeName.CLASSIC_CONSOLE, undefined);
            context.globalState.update(DocTypeName.METADATA, undefined);
            context.globalState.update(DocTypeName.OBJECT_REFERENCE, undefined);
            context.globalState.update(DocTypeName.REST_API, undefined);
            context.globalState.update(DocTypeName.SOAP_API, undefined);
            context.globalState.update(DocTypeName.SFDX_CLI, undefined);
        }
    }
}

export function deactivate() {}
