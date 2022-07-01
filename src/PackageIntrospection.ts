import * as vscode from 'vscode';
import { DocTypeName } from './DocTypes/DocTypeNames';

export const EXTENSION_NAME = 'vscode-salesforce-doc-lookup';
export const PUBLISHER = 'Oblongmana';

//General Command Types
export const DocCommands: Record<DocTypeName, string> = {
    APEX                            : 'salesforce-reference-apex',
    VISUALFORCE                     : 'salesforce-reference-visualforce',
    LIGHTNING_CONSOLE               : 'salesforce-reference-lightning-console',
    CLASSIC_CONSOLE                 : 'salesforce-reference-classic-console',
    METADATA                        : 'salesforce-reference-metadata',
    OBJECT_REFERENCE                : 'salesforce-reference-object-reference',
    REST_API                        : 'salesforce-reference-rest-api',
    SOAP_API                        : 'salesforce-reference-soap-api',
    SFDX_CLI                        : 'salesforce-reference-sfdx-cli',
    LWC_AND_AURA_COMPONENT_LIBRARY  : 'salesforce-reference-lwc-aura-component-library',
};
const DocCommandsValues: string[] = Object.values(DocCommands);

export enum UtilityCommands {
    INVALIDATE_CACHE     = 'salesforce-reference-invalidate-cache',
    CURRENT_WORD_SEARCH  = 'salesforce-reference-current-word-search',
}
const UtilityCommandsValues: string[] = Object.values(UtilityCommands);


//Introspected Package Values

export const PackageJSON: any = vscode.extensions.getExtension(`${PUBLISHER}.${EXTENSION_NAME}`)?.packageJSON;

interface PackageJSONCommand {
    command: string;
    title: string;
}

const DocCommandsPackageJSON: PackageJSONCommand[] = (PackageJSON.contributes.commands as PackageJSONCommand[]).filter((command: PackageJSONCommand) => {
    return DocCommandsValues.some((currCommand: string) => command.command.includes(currCommand));
});

const UtilityCommandsPackageJSON: PackageJSONCommand[] = (PackageJSON.contributes.commands as PackageJSONCommand[]).filter((command: PackageJSONCommand) => {
    return UtilityCommandsValues.some((currCommand: string) => command.command.includes(currCommand));
});


export class PackageJSONCommandQuickPickItem implements vscode.QuickPickItem {
    label: string;
    description?: string | undefined;
    detail?: string | undefined;
    picked?: boolean | undefined;
    alwaysShow?: boolean | undefined;
    command: string;

    constructor(packageCommand :PackageJSONCommand) {
        this.label = packageCommand.title;
        this.command = packageCommand.command;
    }
}

export function getDocCommandQuickPickItems(): PackageJSONCommandQuickPickItem[] {
    return DocCommandsPackageJSON.map((commandJSON) => {
        return new PackageJSONCommandQuickPickItem(commandJSON);
    });
}

export function getUtilityCommandQuickPickItems(): PackageJSONCommandQuickPickItem[] {
    return UtilityCommandsPackageJSON.map((commandJSON) => {
        return new PackageJSONCommandQuickPickItem(commandJSON);
    });
}