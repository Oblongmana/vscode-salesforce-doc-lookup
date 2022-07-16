import * as cheerio from 'cheerio';

import { MetadataCoverageReferenceItem } from "./MetadataCoverageReferenceItem";

function boolToTableOutput(boolVal: boolean): string {
    return boolVal ? '✓' : '';
}

function generateUnlockedPackagingEntry(unlockedPackagingWithoutNamespace: boolean, unlockedPackagingWithNamespace: boolean): string {
    // IFF `unlockedPackagingWithoutNamespace`=true and `unlockedPackagingWithNamespace`= false, adds a [1] superscript to the "Unlocked Packaging" column
    // stating in a footnote: "[1] This component can only be included in a package without a namespace."
    let returnStr = boolToTableOutput(unlockedPackagingWithoutNamespace || unlockedPackagingWithNamespace);
    if (unlockedPackagingWithoutNamespace && !unlockedPackagingWithNamespace) {
        returnStr += `<sup>[1]</sup>`;//TODO set up a link? Would be a nice enhancement over the SF doc site
    }
    return returnStr;
}

function generate1GPManagedPackagingEntry(classicManagedPackaging: boolean, classicUnmanagedPackaging: boolean): string {
    // May only apply to "ConnectedApp" (not trawling past doc to see if that's actually the case! We can handle it as a general case).
    // IFF `classicManagedPackaging` = true but`classicUnmanagedPackaging` = false, you get a superscript [2] in the "1GP Managed Packaging"
    // column indicating: "[2] Applies to first-generation managed packages only.".
    let returnStr = boolToTableOutput(classicManagedPackaging || classicUnmanagedPackaging);
    if (classicManagedPackaging && !classicUnmanagedPackaging) {
        returnStr += `<sup>[2]</sup>`;//TODO set up a link? Would be a nice enhancement over the SF doc site
    }
    return returnStr;
}


function generateSingleScratchDef(name: string, escapedJSON?: string): string {
    if (escapedJSON === null || escapedJSON === undefined) {
        return '';
    }

    return `
    <h4>${name}</h4>
<pre><code>
${JSON.stringify(JSON.parse(escapedJSON!), null, 2)}
</code></pre>
    <button onclick='(function(){navigator.clipboard.writeText("${JSON.stringify(JSON.parse(escapedJSON!), null, 2).replace(/[\"]/g, '\\"').replace(/[\n]/g,'\\n')}");return false;})();return false;'>Copy</button>
`;
}

function generateFullScratchDefsSection(scratchDefinitions: MetadataCoverageTOC.MetadataCoverageScratchDefinitions): string {
    if (scratchDefinitions === null || scratchDefinitions === undefined) {
        return '';
    }

    let returnVal: string = '<h3>Sample Scratch Definitions</h3>';
    returnVal += generateSingleScratchDef('Developer Edition', scratchDefinitions.developer);
    returnVal += generateSingleScratchDef('Professional Edition', scratchDefinitions.professional);
    returnVal += generateSingleScratchDef('Group Edition', scratchDefinitions.group);
    returnVal += generateSingleScratchDef('Enterprise Edition', scratchDefinitions.enterprise);

    return returnVal;
}

function generateKnownIssues(knownIssues: Array<MetadataCoverageTOC.MetadataCoverageKnownIssue>): string {
    if (knownIssues === null || knownIssues === undefined) {
        return '';
    }

    let knownIssuesHtml: cheerio.CheerioAPI = cheerio.load('<details>', null, false); // run in fragment mode so it doesn't add html/head etc

    //Summary section
    knownIssuesHtml('details').append('<summary style="color: var(--vscode-textLink-foreground); text-decoration: underline;">');
    const openCount = knownIssues.filter((issue: MetadataCoverageTOC.MetadataCoverageKnownIssue) => issue.status !== 'Fixed').length;
    const fixedCount = knownIssues.filter((issue: MetadataCoverageTOC.MetadataCoverageKnownIssue) => issue.status === 'Fixed').length;

    let summaryStr = '';
    summaryStr += openCount > 0 ? `${openCount} Open` : '';
    summaryStr += openCount > 0 && fixedCount > 0 ? ',' : '';
    summaryStr += fixedCount > 0 ? `${fixedCount} Fixed` : '';
    knownIssuesHtml('summary').append(summaryStr);

    //Issue list items
    knownIssuesHtml('details').append('<ul>');
    for (const issue of knownIssues) {
        knownIssuesHtml('ul').append(`<li><a href="${issue.url}">[${issue.status}] ${issue.title}</a></li>`);
    }

    return knownIssuesHtml.html();
}

export async function generateHtmlTable(referenceItems: Array<MetadataCoverageReferenceItem>, versionCodeOverride?: string): Promise<string>
{
    const documentationDoc: cheerio.CheerioAPI = cheerio.load('<div id="documentation"></div>', null, false); // run in fragment mode so it doesn't add html/head etc

    const versionCodeOverrideForDisplay = versionCodeOverride !== null && versionCodeOverride !== undefined ? ` (v${versionCodeOverride})` : '';

    // Header, with status info
    documentationDoc('#documentation').append(`<header id="header">`);
    documentationDoc('#header').append(`<h1 style="font-weight: bold">Metadata Coverage${versionCodeOverrideForDisplay}</h1>`);
    documentationDoc('#header').append(`<div id="reportStatus">`);
    documentationDoc('#reportStatus').append(`<p id="typeCount">${referenceItems.length} Total Types • Sorted by Metadata Type</p>`);

    //Table
    documentationDoc('#documentation').append(`<div id="tableContainer">`);
    documentationDoc('#tableContainer').append(`<table id="metadataTable">`);

    //Table Head, and Col def (to force 1st col to take up enough width to display extra content comfortably)
    documentationDoc('#metadataTable').append(`<thead id="metadataTableHead">`);
    documentationDoc('#metadataTable').append(`
        <colgroup>
            <col style="width: 40%">
        </colgroup>
    `);
    documentationDoc('#metadataTableHead').append(`
        <tr>
            <th>Metadata Type</th>
            <th>Metadata API</th>
            <th>Source Tracking</th>
            <th>Unlocked Packaging</th>
            <th>2GP Managed Packaging</th>
            <th>1GP Managed Packaging</th>
            <th>Change Sets</th>
            <th>Apex Metadata API</th>
            <th>Known Issues</th>
        </tr>
    `);

    //Table body
    //TODO pull this out into a method
    documentationDoc('#metadataTable').append(`<tbody id="metadataTableBody">`);
    for (const referenceItem of referenceItems) {
        const labelColHtml: string = `
            <details>
                <summary style="color: var(--vscode-textLink-foreground); text-decoration: underline;">
                    ${referenceItem.label}
                </summary>

                <div>
                    <h3>Details</h3>
                    ${(referenceItem.data.details as Array<MetadataCoverageTOC.MetadataCoverageDetailItem>)
                        .map((detailItem: MetadataCoverageTOC.MetadataCoverageDetailItem) => `
                            <h4>${detailItem.name}</h4>
                            ${detailItem.detailRichText !== null && detailItem.detailRichText !== undefined ? "<p>"+cheerio.load(detailItem.detailRichText).text()+"</p>" /*strip SF's html/styling out*/ : ''}
                            ${detailItem.url !== null && detailItem.url !== undefined && detailItem.url.startsWith('http') ? '<a href="'+detailItem.url+'">'+detailItem.url+'</a>' : ''}
                        `)
                        .join('')
                    }

                    ${generateFullScratchDefsSection(referenceItem.data.scratchDefinitions as MetadataCoverageTOC.MetadataCoverageScratchDefinitions)}
                <div>
            </details>
        `;

        //TODO probably pull this into a method at some point too
        const channels: MetadataCoverageTOC.MetadataCoverageChannel = referenceItem.data.channels;
        documentationDoc('#metadataTableBody').append(`
            <tr>
                <!-- "Metadata Type" Col -->         <td>${labelColHtml}</td>
                <!-- "Metadata API" Col -->          <td>${boolToTableOutput(channels.metadataApi)}</td>
                <!-- "Source Tracking" Col -->       <td>${boolToTableOutput(channels.sourceTracking)}</td>
                <!-- "Unlocked Packaging" Col -->    <td>${generateUnlockedPackagingEntry(channels.unlockedPackagingWithoutNamespace, channels.unlockedPackagingWithNamespace)}</td>
                <!-- "2GP Managed Packaging" Col --> <td>${boolToTableOutput(channels.managedPackaging)}</td>
                <!-- "1GP Managed Packaging" Col --> <td>${generate1GPManagedPackagingEntry(channels.classicManagedPackaging, channels.classicUnmanagedPackaging)}</td>
                <!-- "Change Sets" Col -->           <td>${boolToTableOutput(channels.changeSets)}</td>
                <!-- "Apex Metadata API" Col -->     <td>${boolToTableOutput(channels.apexMetadataApi)}</td>
                <!-- "Known Issues" Col -->          <td>${generateKnownIssues(referenceItem.data.knownIssues)}</td>
            </tr>
        `);
    }

    //Table caption
    documentationDoc('#metadataTable').append(`<caption id="metadataTableCaption" style="text-align: left; caption-side:bottom;">`);
    documentationDoc('#metadataTableCaption').append(`<div style="font-weight: bold">Notes</div>`);
    documentationDoc('#metadataTableCaption').append(`
        <ul>
            <li>[1] This component can only be included in a package without a namespace.</li>
            <li>[2] Applies to first-generation managed packages only.</li>
        </ul>
    `);

    return documentationDoc.html();
}