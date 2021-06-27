import * as vscode from 'vscode';

export const getConfig = function () {
    return vscode.workspace.getConfiguration("vscode-salesforce-doc-lookup");
}