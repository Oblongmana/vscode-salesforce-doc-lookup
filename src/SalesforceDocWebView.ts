import got from 'got/dist/source';
import { JSDOM } from 'jsdom';
import * as vscode from 'vscode';
import { SalesforceReferenceOutputChannel } from './Logging';

//Only support a single WebView for salesforce doc viewing
let currentSFDocPanel: vscode.WebviewPanel | undefined = undefined;

export async function showDocInWebView(context: vscode.ExtensionContext, docUri: vscode.Uri, fragment?: string) {
    SalesforceReferenceOutputChannel.appendLine('hmm' + docUri.toString());
    if (currentSFDocPanel) {
        currentSFDocPanel.reveal(vscode.ViewColumn.One);
        populateWebView(docUri, fragment);
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
        populateWebView(docUri, fragment);
        currentSFDocPanel.onDidDispose(
            () => {
                currentSFDocPanel = undefined;
            },
            undefined,
            context.subscriptions
        );
    }
}


async function populateWebView(docUri: vscode.Uri, fragment?: string) {
    currentSFDocPanel!.webview.html = getLoadingWebviewContent();
    currentSFDocPanel!.webview.html = await getWebviewContent(docUri, fragment);
    //Disabling rule, so we can check for both null and undefined
    // eslint-disable-next-line eqeqeq
    if (fragment != null) {
        SalesforceReferenceOutputChannel.appendLine('attempting to nav to fragment: ' + fragment);
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

async function getWebviewContent(docUri: vscode.Urig) {
    const docContent: string = await getSFDocContent(docUri);

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
                    <script type="application/javascript">
                        window.addEventListener('message', event => {
                            //The fragment to nav to
                            const anchor = event.data;
                            window.location.href = "#"+anchor;
                        });
                    </script>
                </head>
                <body>
                    ${docContent}
                    <div style="font-style: italic">Salesforce Documentation is © Copyright 2000–${year} salesforce.com, inc. Salesforce is a registered trademark of salesforce.com, inc., as are other names and marks. Other marks appearing herein may be trademarks of their respective owners.</div>
                </body>
            </html>`;
}

function countNewlines(theString: string): number {
    //https://stackoverflow.com/questions/881085/count-the-number-of-occurrences-of-a-character-in-a-string-in-javascript
    return ((theString.match(/\n/g) || []).length);
}


async function getSFDocContent(docUri: vscode.Uri) {
    //TODO: this is extremely experimental, see Notes in SalesforceReferenceDocType.rawDocURL for future path
    //  review security constraints, poss including CSP stuff on the webview itself
    let body: any = await got(docUri.toString()).json();

    // Salesforce includes "seealso" links, which usually go to internal anchors. Rewrite them to work for us
    //  todo: this doesn't handle links that don't go to in-page anchors - such as "Namespace" pages in the doc
    //   - possibilities include using Command URIs to run an appropriate command to load the right doc? https://code.visualstudio.com/api/extension-guides/command#command-uris
    const docContentDOM = new JSDOM(body.content);
    const seeAlsoLinks: NodeListOf<Element> = docContentDOM.window.document.querySelectorAll('#sfdc\\:seealso a');
    seeAlsoLinks.forEach((seeAlsoLink: Element) => {
        //Extract the fragment from the href, and set the link to ONLY be the fragment, so it works in our webview
        seeAlsoLink.setAttribute('href', '#' + vscode.Uri.parse(seeAlsoLink.getAttribute('href')!).fragment);
    });

    return docContentDOM.window.document.body.innerHTML;
}