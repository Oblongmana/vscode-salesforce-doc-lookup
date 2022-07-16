import * as vscode from 'vscode';

import got from 'got/dist/source';

import { AuraDocTypeID, docTypeIDTitleCaseName } from "../DocTypeID";
import { IDocumentationType } from "../IDocumentationType";
import { SF_DOC_ROOT_URL } from '../../GlobalConstants';
import { AuraAction, buildAuraActionBody, SF_AURA_PATH } from '../../Utilities/AuraUtilities';
import { AuraReferenceItem, ReferenceItem, ReferenceItemMemento } from '../../ReferenceItems';
import { getStorageSubKey } from '../DocTypeConfig';

/**
 * EXPERIMENTAL
 */
export abstract class AuraDocType implements IDocumentationType {
    //#region Implemented Fields
    /**
     * @inheritdoc
     */
    public readonly docType: AuraDocTypeID;
    //#endregion Implemented Fields

    /**
     *
     * @param docType the DocType instance for this Documentation type - e.g. DocType.LWC_AND_AURA_COMPONENT_LIBRARY
     */
    constructor(auraDocType: AuraDocTypeID) {
        this.docType = auraDocType;
    }

    /**
     * Get the ReferenceItem instances for this reference doc type
     *
     * @param context the extension context, used for accessing/populating the cache
     */
    public async getReferenceItems(context: vscode.ExtensionContext): Promise<ReferenceItem[]> {
        //Try to use existing cached values, and populate the cache if not available
        let referenceItems: ReferenceItem[] = [];
        let versionCodeOverride: string | undefined = undefined; //TODO: Aura doc with versions/locales.
        let langCodeOverride: string | undefined = undefined; //TODO: Aura doc with versions/locales.
        let cacheSubKey: string = getStorageSubKey(versionCodeOverride, langCodeOverride);
        let cachedDocType: any | undefined = context.globalState.get(this.docType);
        let cachedMementos: any[] | undefined = cachedDocType?.[cacheSubKey];
        if (cachedMementos === undefined) {
            // Get fresh reference entries, build in-memory ReferenceItems, and cache their ReferenceItemMementos
            let subKeyInfoForMessage = cacheSubKey !== "" ? `(${[versionCodeOverride, langCodeOverride].filter(x => x).join(", ")}) ` : "";
            console.log(`Cache miss for ${this.docType} ${subKeyInfoForMessage}Salesforce Reference entries. Retrieving from web`);
            vscode.window.showInformationMessage(`Retrieving Salesforce ${docTypeIDTitleCaseName(this.docType)} ${subKeyInfoForMessage}Reference Index...`, 'OK');

            const body = buildAuraActionBody(AuraAction.GET_TOC_MESSAGE);

            var tocResponse: object = await got.post(`${SF_DOC_ROOT_URL}${SF_AURA_PATH}`, {
                "headers": {
                    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
                },
                "body": `${body}`
            }).json();

            // //Useful debugs
            // Logging.appendLine((await myRequest).request.options.body as string);
            // Logging.appendLine(JSON.stringify(tocResponse));

            var parsedTocResponse: AuraTOC.GetBundleDefinitionsListResponse = tocResponse as AuraTOC.GetBundleDefinitionsListResponse;

            // Logging.appendLine(JSON.stringify(parsedTocResponse.actions[0].returnValue));

            var bundleDefinitionList: AuraTOC.BundleDefinitionList = parsedTocResponse.actions[0].returnValue;
            referenceItems = Object.entries(bundleDefinitionList).sort().map(([, currDocNode]) => {
                // Logging.appendLine('currDocNode: ' + currDocNode);
                return new AuraReferenceItem(currDocNode);
            });

            cachedDocType = cachedDocType || {};
            cachedDocType[cacheSubKey] = referenceItems.map(item => item.saveToMemento());
            context.globalState.update(this.docType, cachedDocType);
        } else {
            // Create new in-memory ReferenceItems by rehydrating from the cached mementos
            referenceItems = cachedMementos.map(cachedMemento => new AuraReferenceItem(new ReferenceItemMemento(cachedMemento)));
        }
        return referenceItems;
    }

}