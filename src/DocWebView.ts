import * as vscode from 'vscode';
import { Logging } from './Logging';

//Only support a single WebView for salesforce doc viewing
let currentSFDocPanel: vscode.WebviewPanel | undefined = undefined;

export function showDocInWebView(context: vscode.ExtensionContext, htmlDoc: string, fragment?: string) {
    // Logging.appendLine('showDocInWebView uri: ' + htmlDoc.toString());
    if (currentSFDocPanel) {
        currentSFDocPanel.reveal(vscode.ViewColumn.One);
    } else {
        currentSFDocPanel = vscode.window.createWebviewPanel(
            'sfDocWebview',
            'Salesforce Doc View',
            vscode.ViewColumn.One,
            {
                enableFindWidget: true, //disable for debugging with regular developer tools, otherwise use webview developer tools
                enableScripts: true
            }

        );
        currentSFDocPanel.onDidDispose(
            () => {
                currentSFDocPanel = undefined;
            },
            undefined,
            context.subscriptions
        );
    }
    populateWebView(htmlDoc, fragment);
}


function populateWebView(htmlDoc: string, fragment?: string) {
    //TODO: review this - suspect the loading part might be a holdover from older async/await style? Whereas now we have the "loading" bar?
    currentSFDocPanel!.webview.html = getLoadingWebviewContent();
    currentSFDocPanel!.webview.html = getWebviewContent(htmlDoc);
    //Disabling rule, so we can check for both null and undefined
    // eslint-disable-next-line eqeqeq
    if (fragment != null) {
        // Logging.appendLine('attempting to nav to fragment: ' + fragment);
        currentSFDocPanel!.webview.postMessage(fragment);
    }
}

function getLoadingWebviewContent() {
    //https://stackoverflow.com/questions/59556833/is-there-a-loading-spinner-indicator-for-webview-content-in-vsc
    return `<!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Salesforce Doc View</title>
                    <style type="text/css">
                        .loading {
                            height: 100vh;
                            background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' version='1.1' width='575' height='6px'%3E %3Cstyle%3E circle { animation: ball 2.5s cubic-bezier(0.000, 1.000, 1.000, 0.000) infinite; fill: %23bbb; } %23balls { animation: balls 2.5s linear infinite; } %23circle2 { animation-delay: 0.1s; } %23circle3 { animation-delay: 0.2s; } %23circle4 { animation-delay: 0.3s; } %23circle5 { animation-delay: 0.4s; } @keyframes ball { from { transform: none; } 20% { transform: none; } 80% { transform: translateX(864px); } to { transform: translateX(864px); } } @keyframes balls { from { transform: translateX(-40px); } to { transform: translateX(30px); } } %3C/style%3E %3Cg id='balls'%3E %3Ccircle class='circle' id='circle1' cx='-115' cy='3' r='3'/%3E %3Ccircle class='circle' id='circle2' cx='-130' cy='3' r='3' /%3E %3Ccircle class='circle' id='circle3' cx='-145' cy='3' r='3' /%3E %3Ccircle class='circle' id='circle4' cx='-160' cy='3' r='3' /%3E %3Ccircle class='circle' id='circle5' cx='-175' cy='3' r='3' /%3E %3C/g%3E %3C/svg%3E") 50% no-repeat;
                        }
                    </style>
                </head>
                <body>
                    <div class="loading"></div>
                </body>
            </html>`;
}

function getWebviewContent(htmlDoc: string) {

    //Get a year for the Copyright notice
    let year: number = new Date().getUTCFullYear();
    if (year < 2021) {
        //in case the user has their date set to something silly
        year = 2021;
    }

    return `<!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Salesforce Doc View</title>
                    <style>
                        table, th, td {
                            border: 1px solid var(--vscode-tree-indentGuidesStroke);
                            border-collapse: collapse;
                            vertical-align: top;
                            padding: 5px;
                        }
                    </style>
                    <script type="application/javascript">
                        window.addEventListener('message', event => {
                            //The fragment to nav to
                            const anchor = event.data;
                            window.location.href = "#"+anchor;
                        });
                    </script>
                </head>
                <body>
                    ${htmlDoc}
                    <div style="font-style: italic">Salesforce Documentation is © Copyright 2000–${year} salesforce.com, inc. Salesforce is a registered trademark of salesforce.com, inc., as are other names and marks. Other marks appearing herein may be trademarks of their respective owners.</div>
                </body>
            </html>`;
}
