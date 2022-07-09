import * as vscode from 'vscode';

export const getConfig = function () {
    return vscode.workspace.getConfiguration("vscode-salesforce-doc-lookup");
};

export const versionGlobalStateKey: string = 'SF_REF_VERSION_CODE';