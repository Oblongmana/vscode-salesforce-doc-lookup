import * as vscode from 'vscode';
import { DocTypeID } from './DocTypes';

export const EXTENSION_NAME = 'vscode-salesforce-doc-lookup';
export const PUBLISHER = 'Oblongmana';

//General Command Types
export const DocCommands: Record<DocTypeID, string> = {
    //Atlas doc commands
    APEX                            : 'salesforce-reference-apex',
    VISUALFORCE                     : 'salesforce-reference-visualforce',
    LIGHTNING_CONSOLE               : 'salesforce-reference-lightning-console',
    CLASSIC_CONSOLE                 : 'salesforce-reference-classic-console',
    METADATA                        : 'salesforce-reference-metadata',
    OBJECT_REFERENCE                : 'salesforce-reference-object-reference',
    REST_API                        : 'salesforce-reference-rest-api',
    SOAP_API                        : 'salesforce-reference-soap-api',
    SFDX_CLI                        : 'salesforce-reference-sfdx-cli',
    APEX_DEV_GUIDE                  : 'salesforce-reference-apex-dev-guide',
    AJAX                            : 'salesforce-reference-ajax-dev-guide',
    ANT_MIGRATION_TOOL              : 'salesforce-reference-ant-tool-guide',
    BIG_OBJECTS                     : 'salesforce-reference-big-objects',
    BULK_API                        : 'salesforce-reference-bulk-api',
    DATA_LOADER                     : 'salesforce-reference-data-loader',
    TOOLING_API                     : 'salesforce-reference-tooling-api',
    SFDX_CLI_PLUGINS                : 'salesforce-reference-sfdx-cli-plugins',
    MOBILE_SDK                      : 'salesforce-reference-mobile-sdk',
    API_ACTION                      : 'salesforce-reference-actions-api',
    SFDX_DEV                        : 'salesforce-reference-sfdx-dev-guide',
    SOQL_SOSL                       : 'salesforce-reference-soql-sosl-reference',
    //Aura doc commands
    LWC_AND_AURA_COMPONENT_LIBRARY  : 'salesforce-reference-lwc-aura-component-library',
    //Metadata Coverage Report doc commands
    METADATA_COVERAGE_REPORT        : 'salesforce-reference-metadata-coverage-report',
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