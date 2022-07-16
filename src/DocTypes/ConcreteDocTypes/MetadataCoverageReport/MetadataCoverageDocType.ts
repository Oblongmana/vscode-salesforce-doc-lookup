import * as vscode from 'vscode';

import got, { CancelableRequest, Response } from 'got/dist/source';

import { DocTypeID, docTypeIDTitleCaseName, MetadataCoverageDocTypeID } from "../../DocTypeID";
import { IDocumentationType } from "../../IDocumentationType";
import { getMetadataCoverageReportVersionCode, getStorageSubKey } from '../../DocTypeConfig';
import {
    MetadataCoverageReferenceItem,
    MetadataCoverageRootReferenceItem,
    ReferenceItem,
    ReferenceItemMemento
} from '../../../ReferenceItems';

const METADATA_COVERAGE_REPORT_TOC_URL_BASE = `https://mdcoverage.secure.force.com/services/apexrest/report`;
const METADATA_COVERAGE_REPORT_NAME = "Metadata Coverage Report";
const METADATA_COVERAGE_REPORT_BREADCRUMB = `$(home) $(breadcrumb-separator) ${METADATA_COVERAGE_REPORT_NAME}`;

/**
 * EXPERIMENTAL
 */
export class MetadataCoverageDocType implements IDocumentationType {
    //#region Implemented Fields
    /**
     * @inheritdoc
     */
    public readonly docType: MetadataCoverageDocTypeID;
    //#endregion Implemented Fields

    constructor() {
        this.docType = DocTypeID.METADATA_COVERAGE_REPORT;
    }

    //TODO: as for the other docTypes, need to do something sensible in terms of discoverability for the doc-specific cached content.
    //      For this one, the `data` object contains an entire MetadataCoverageTOC.MetadataCoverageType unceremoniously crammed in there!

    /**
     * Get the ReferenceItem instances for this reference doc type
     *
     * @param context the extension context, used for accessing/populating the cache
     */
    public async getReferenceItems(context: vscode.ExtensionContext): Promise<ReferenceItem[]> {
        //Try to use existing cached values, and populate the cache if not available
        let referenceItems: ReferenceItem[] = [];
        let versionCodeOverride: string | undefined = getMetadataCoverageReportVersionCode();
        let langCodeOverride = undefined; //! NOTE As at 2022-07, SF has no langs except English, with no obvious config points for future use.
        let cacheSubKey: string = getStorageSubKey(versionCodeOverride, langCodeOverride);
        let cachedDocType: any | undefined = context.globalState.get(this.docType);
        let cachedMementos: any[] | undefined = cachedDocType?.[cacheSubKey];

        if (cachedMementos === undefined) {
            // Get fresh reference entries, build in-memory ReferenceItems, and cache their ReferenceItemMementos
            let subKeyInfoForMessage = cacheSubKey !== "" ? `(${[versionCodeOverride, langCodeOverride].filter(x => x).join(", ")}) ` : "";
            console.log(`Cache miss for ${this.docType} ${subKeyInfoForMessage}Salesforce Reference entries. Retrieving from web`);
            vscode.window.showInformationMessage(`Retrieving Salesforce ${docTypeIDTitleCaseName(this.docType)} ${subKeyInfoForMessage}Reference Index...`, 'OK');

            let versionCodeForTOCRetrieve = versionCodeOverride !== null && versionCodeOverride !== undefined ? `?version=${versionCodeOverride}` : '';
            let promise: CancelableRequest<Response> = got(`${METADATA_COVERAGE_REPORT_TOC_URL_BASE}${versionCodeForTOCRetrieve}`);
            let tocRoot: MetadataCoverageTOC.MetadataCoverageRoot = await promise.json();

            // Build the nodes for each metadata type and add them to referenceItems
            referenceItems = Object.entries(tocRoot.types).sort().map(([ name, type ]) => {
                return new MetadataCoverageReferenceItem(type, name, `${METADATA_COVERAGE_REPORT_BREADCRUMB} $(breadcrumb-separator) ${name}`, versionCodeOverride);
            });

            //Cache retrieved docs
            cachedDocType = cachedDocType || {};
            cachedDocType[cacheSubKey] = referenceItems.map(item => item.saveToMemento());
            context.globalState.update(this.docType, cachedDocType);
        } else {
            // Create new in-memory ReferenceItems by rehydrating from the cached mementos
            referenceItems = cachedMementos.map(cachedMemento => new MetadataCoverageReferenceItem(new ReferenceItemMemento(cachedMemento), undefined, undefined, versionCodeOverride));
        }

        // Build an in-memory only root node with all the types as children. This is not mementoised, as it's really only a container for already mementoised data,
        //   with some slightly different functionality around how it links out/displays in webview
        const rootItem = new MetadataCoverageRootReferenceItem(referenceItems as MetadataCoverageReferenceItem[], METADATA_COVERAGE_REPORT_NAME, METADATA_COVERAGE_REPORT_BREADCRUMB, versionCodeOverride);
        // Prepend the root item to the reference array
        referenceItems = [rootItem, ...referenceItems];

        return referenceItems;
    }

}