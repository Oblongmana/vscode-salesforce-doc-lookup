import * as vscode from 'vscode';
import { EXTENSION_NAME, DocCommands, UtilityCommands } from './Introspection';
import { openDocQuickPick, invalidateEntireExtensionCache, openCurrentWordSearchQuickPick } from './Commands';
import { Logging } from './Logging';
import { versionGlobalStateKey } from './GlobalConfig';
import { PackageJSON } from './Introspection';
import * as semver from "semver";
import { DocType } from './DocTypes';


export async function activate(context: vscode.ExtensionContext) {
    // Logging.appendLine('Activate function running');

    // Handle any upgrade-specific things that need to be done
    handleVersionChanges(context);

    //Build all of our User-facing commands
    //TODO: can almost certainly do this with fewer LoC!
    let apexReferenceDisposable: vscode.Disposable = vscode.commands.registerCommand(`${EXTENSION_NAME}.${DocCommands.APEX}`, async (prefillValue?: string) => {
        openDocQuickPick(context, DocType.APEX, prefillValue);
    });

    let vfReferenceDisposable: vscode.Disposable = vscode.commands.registerCommand(`${EXTENSION_NAME}.${DocCommands.VISUALFORCE}`, async (prefillValue?: string) => {
        openDocQuickPick(context, DocType.VISUALFORCE, prefillValue);
    });

    let lightningconsoleReferenceDisposable: vscode.Disposable = vscode.commands.registerCommand(`${EXTENSION_NAME}.${DocCommands.LIGHTNING_CONSOLE}`, async (prefillValue?: string) => {
        openDocQuickPick(context, DocType.LIGHTNING_CONSOLE, prefillValue);
    });

    let classicconsoleReferenceDisposable: vscode.Disposable = vscode.commands.registerCommand(`${EXTENSION_NAME}.${DocCommands.CLASSIC_CONSOLE}`, async (prefillValue?: string) => {
        openDocQuickPick(context, DocType.CLASSIC_CONSOLE, prefillValue);
    });

    let metadataReferenceDisposable: vscode.Disposable = vscode.commands.registerCommand(`${EXTENSION_NAME}.${DocCommands.METADATA}`, async (prefillValue?: string) => {
        openDocQuickPick(context, DocType.METADATA, prefillValue);
    });

    let objectReferenceReferenceDisposable: vscode.Disposable = vscode.commands.registerCommand(`${EXTENSION_NAME}.${DocCommands.OBJECT_REFERENCE}`, async (prefillValue?: string) => {
        openDocQuickPick(context, DocType.OBJECT_REFERENCE, prefillValue);
    });

    let restApiReferenceDisposable: vscode.Disposable = vscode.commands.registerCommand(`${EXTENSION_NAME}.${DocCommands.REST_API}`, async (prefillValue?: string) => {
        openDocQuickPick(context, DocType.REST_API, prefillValue);
    });

    let soapApiReferenceDisposable: vscode.Disposable = vscode.commands.registerCommand(`${EXTENSION_NAME}.${DocCommands.SOAP_API}`, async (prefillValue?: string) => {
        openDocQuickPick(context, DocType.SOAP_API, prefillValue);
    });

    let sfdxCliReferenceDisposable: vscode.Disposable = vscode.commands.registerCommand(`${EXTENSION_NAME}.${DocCommands.SFDX_CLI}`, async (prefillValue?: string) => {
        openDocQuickPick(context, DocType.SFDX_CLI, prefillValue);
    });

    let apexDevGuideReferenceDisposable: vscode.Disposable = vscode.commands.registerCommand(`${EXTENSION_NAME}.${DocCommands.APEX_DEV_GUIDE}`, async (prefillValue?: string) => {
        openDocQuickPick(context, DocType.APEX_DEV_GUIDE, prefillValue);
    });

    let lwcAuraComponentLibReferenceDisposable: vscode.Disposable = vscode.commands.registerCommand(`${EXTENSION_NAME}.${DocCommands.LWC_AND_AURA_COMPONENT_LIBRARY}`, async (prefillValue?: string) => {
        openDocQuickPick(context, DocType.LWC_AND_AURA_COMPONENT_LIBRARY, prefillValue);
    });

    let invalidateCacheDisposable: vscode.Disposable = vscode.commands.registerCommand(`${EXTENSION_NAME}.${UtilityCommands.INVALIDATE_CACHE}`, async () => {
        invalidateEntireExtensionCache(context);
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
        apexDevGuideReferenceDisposable,
        lwcAuraComponentLibReferenceDisposable,
    );
}

function handleVersionChanges(context: vscode.ExtensionContext) {
    let existingVersionNumber: string | undefined = context.globalState.get(versionGlobalStateKey);
    let currentVersionNumber: string = PackageJSON.version;
    let isVersionChanging: boolean = false;
    if (existingVersionNumber === undefined) {
        Logging.appendLine(`No existing extension version, current version is ${currentVersionNumber}`);
        //Store the current version in our global state
        context.globalState.update(versionGlobalStateKey, currentVersionNumber);
        isVersionChanging = true;
    } else if (existingVersionNumber !== currentVersionNumber) {
        Logging.appendLine(`Version changing from ${existingVersionNumber} to ${currentVersionNumber}`);
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
            Logging.appendLine(`Extension version changed. Detected Apex Cache out of date after Salesforce relocated Reference doc. Force-clearing Apex Reference cache.`);
            context.globalState.update(DocType.APEX, undefined);
            context.globalState.update(DocType.LIGHTNING_CONSOLE, undefined);
        }

        //In 1.3.0, we updated the Breadcrumb to allow proper searching of it.
        //   Upgrading from anything lower than the 1.3.0 release means all cached DocTypes will be invalidated to support this
        if (semver.lte(normalisedExistingVersionNumber, '1.3.0')) {
            Logging.appendLine(`Extension version changed: prior was <=1.3.0. Invalidating all caches to support update that allows Breadcrumb searching.`);
            context.globalState.update(DocType.APEX, undefined);
            context.globalState.update(DocType.VISUALFORCE, undefined);
            context.globalState.update(DocType.LIGHTNING_CONSOLE, undefined);
            context.globalState.update(DocType.CLASSIC_CONSOLE, undefined);
            context.globalState.update(DocType.METADATA, undefined);
            context.globalState.update(DocType.OBJECT_REFERENCE, undefined);
            context.globalState.update(DocType.REST_API, undefined);
            context.globalState.update(DocType.SOAP_API, undefined);
            context.globalState.update(DocType.SFDX_CLI, undefined);
        }

        //In 1.3.3, the FWUID used for Aura/LWC was updated to reflect Salesforce updating this on the Aura/LWC component site.
        //   Invalidating cache to ensure everything is up to date.
        if (semver.lte(normalisedExistingVersionNumber, '1.3.2')) {
            Logging.appendLine(`Extension version changed: prior was <=1.3.2. Invalidating Aura/LWC cache - Salesforce's FWUID for this doc changed, so re-fetching to ensure we're all up to date.`);
            context.globalState.update(DocType.LWC_AND_AURA_COMPONENT_LIBRARY, undefined);
        }

        //In 2.0.0, the plugin was updated to support language/version overrides for Atlas-based docTypes, including caching
        //  of entries for different lang/version combos. Due to the structural change of the cache, everthing must be invalidated.
        if (semver.lt(normalisedExistingVersionNumber, '2.0.0')) {
            Logging.appendLine(`Extension version changed: prior was <2.0.0. Invalidating all caches - cache format has been updated`);
            Object.values(DocType).forEach(docTypeKey => context.globalState.update(docTypeKey, undefined));
        }
    }
}

export function deactivate() {}
