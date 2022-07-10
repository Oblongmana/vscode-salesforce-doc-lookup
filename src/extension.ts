import * as vscode from 'vscode';
import { EXTENSION_NAME, DocCommands, UtilityCommands } from './Introspection';
import { openDocQuickPick, invalidateEntireExtensionCache, openCurrentWordSearchQuickPick } from './Commands';
import { Logging } from './Logging';
import { versionGlobalStateKey } from './GlobalConfig';
import { PackageJSON } from './Introspection';
import * as semver from "semver";
import { DocTypeID } from './DocTypes';
import { enumKeys } from './Utilities/EnumUtilities';


export async function activate(context: vscode.ExtensionContext) {
    // Logging.appendLine('Activate function running');

    // Handle any upgrade-specific things that need to be done
    handleVersionChanges(context);

    //Build all of our User-facing commands and add to extension subscriptions
    let docPickerDisposables: vscode.Disposable[] = [];
    for (const docTypeKey of enumKeys(DocTypeID)) {
        vscode.commands.registerCommand(`${EXTENSION_NAME}.${DocCommands[docTypeKey]}`, async (prefillValue?: string) => {
            openDocQuickPick(context, DocTypeID[docTypeKey], prefillValue);
        });
    }

    let invalidateCacheDisposable: vscode.Disposable = vscode.commands.registerCommand(`${EXTENSION_NAME}.${UtilityCommands.INVALIDATE_CACHE}`, async () => {
        invalidateEntireExtensionCache(context);
    });

    let currentWordSearchDisposable: vscode.Disposable = vscode.commands.registerTextEditorCommand(`${EXTENSION_NAME}.${UtilityCommands.CURRENT_WORD_SEARCH}`, async (textEditor: vscode.TextEditor) => {
        openCurrentWordSearchQuickPick(context, textEditor);
    });

    context.subscriptions.push(
        ...docPickerDisposables,
        invalidateCacheDisposable,
        currentWordSearchDisposable,
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
            context.globalState.update(DocTypeID.APEX, undefined);
            context.globalState.update(DocTypeID.LIGHTNING_CONSOLE, undefined);
        }

        //In 1.3.0, we updated the Breadcrumb to allow proper searching of it.
        //   Upgrading from anything lower than the 1.3.0 release means all cached DocTypes will be invalidated to support this
        if (semver.lte(normalisedExistingVersionNumber, '1.3.0')) {
            Logging.appendLine(`Extension version changed: prior was <=1.3.0. Invalidating all caches to support update that allows Breadcrumb searching.`);
            context.globalState.update(DocTypeID.APEX, undefined);
            context.globalState.update(DocTypeID.VISUALFORCE, undefined);
            context.globalState.update(DocTypeID.LIGHTNING_CONSOLE, undefined);
            context.globalState.update(DocTypeID.CLASSIC_CONSOLE, undefined);
            context.globalState.update(DocTypeID.METADATA, undefined);
            context.globalState.update(DocTypeID.OBJECT_REFERENCE, undefined);
            context.globalState.update(DocTypeID.REST_API, undefined);
            context.globalState.update(DocTypeID.SOAP_API, undefined);
            context.globalState.update(DocTypeID.SFDX_CLI, undefined);
        }

        //In 1.3.3, the FWUID used for Aura/LWC was updated to reflect Salesforce updating this on the Aura/LWC component site.
        //   Invalidating cache to ensure everything is up to date.
        if (semver.lte(normalisedExistingVersionNumber, '1.3.2')) {
            Logging.appendLine(`Extension version changed: prior was <=1.3.2. Invalidating Aura/LWC cache - Salesforce's FWUID for this doc changed, so re-fetching to ensure we're all up to date.`);
            context.globalState.update(DocTypeID.LWC_AND_AURA_COMPONENT_LIBRARY, undefined);
        }

        //In 2.0.0, the plugin was updated to support language/version overrides for Atlas-based docTypes, including caching
        //  of entries for different lang/version combos. Due to the structural change of the cache, everthing must be invalidated.
        if (semver.lt(normalisedExistingVersionNumber, '2.0.0')) {
            Logging.appendLine(`Extension version changed: prior was <2.0.0. Invalidating all caches - cache format has been updated`);
            Object.values(DocTypeID).forEach(docTypeKey => context.globalState.update(docTypeKey, undefined));
        }
    }
}

export function deactivate() {}
