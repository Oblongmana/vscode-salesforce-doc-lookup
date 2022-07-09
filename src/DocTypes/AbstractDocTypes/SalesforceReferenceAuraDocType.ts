import * as vscode from 'vscode';

import got from 'got/dist/source';

import { DocTypeName, docTypeNameTitleCase } from "../DocTypeNames";
import { DocumentationType } from "../DocumentationType";
import { SF_DOC_ROOT_URL } from '../../Constants';
import { SalesforceAuraReferenceItem } from '../../ReferenceItems/SalesforceAuraReferenceItem';
import { AuraAction, buildAuraActionBody, SF_AURA_PATH } from '../../Utilities/AuraUtilities';
import { ReferenceItem } from '../../ReferenceItems/ReferenceItem';
import { ReferenceItemMemento } from '../../ReferenceItems/ReferenceItemMemento';
import { getStorageSubKey } from '../../Utilities/DocTypeConfig';

/**
 * EXPERIMENTAL
 */
export abstract class SalesforceReferenceAuraDocType implements DocumentationType {

    /**
     * @inheritdoc
     */
     public readonly docTypeName: DocTypeName;

    /**
     *
     * @param docTypeName the DocTypeName instance for this Documentation type - e.g. DocTypeName.LWC_AND_AURA_COMPONENT_LIBRARY
     */
    constructor(docTypeName: DocTypeName) {
        this.docTypeName = docTypeName;
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
        let cachedDocType: any | undefined = context.globalState.get(this.docTypeName);
        let cachedMementos: any[] | undefined = cachedDocType?.[cacheSubKey];
        if (cachedMementos === undefined) {
            // Get fresh reference entries, build in-memory ReferenceItems, and cache their ReferenceItemMementos
            let subKeyInfoForMessage = cacheSubKey !== "" ? `(${[versionCodeOverride, langCodeOverride].filter(x => x).join(", ")}) ` : "";
            console.log(`Cache miss for ${this.docTypeName} ${subKeyInfoForMessage}Salesforce Reference entries. Retrieving from web`);
            vscode.window.showInformationMessage(`Retrieving Salesforce ${docTypeNameTitleCase(this.docTypeName)} ${subKeyInfoForMessage}Reference Index...`, 'OK');

            const body = buildAuraActionBody(AuraAction.GET_TOC_MESSAGE);

            var tocResponse: object = await got.post(`${SF_DOC_ROOT_URL}${SF_AURA_PATH}`, {
                "headers": {
                    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
                },
                "body": `${body}`
            }).json();

            // //Useful debugs
            // SalesforceReferenceOutputChannel.appendLine((await myRequest).request.options.body as string);
            // SalesforceReferenceOutputChannel.appendLine(JSON.stringify(tocResponse));

            var parsedTocResponse: SalesforceAuraTOC.GetBundleDefinitionsListResponse = tocResponse as SalesforceAuraTOC.GetBundleDefinitionsListResponse;

            // SalesforceReferenceOutputChannel.appendLine(JSON.stringify(parsedTocResponse.actions[0].returnValue));

            var bundleDefinitionList: SalesforceAuraTOC.BundleDefinitionList = parsedTocResponse.actions[0].returnValue;
            referenceItems = Object.entries(bundleDefinitionList).sort().map(([, currDocNode]) => {
                // SalesforceReferenceOutputChannel.appendLine('currDocNode: ' + currDocNode);
                return new SalesforceAuraReferenceItem(currDocNode);
            });

            cachedDocType = cachedDocType || {};
            cachedDocType[cacheSubKey] = referenceItems.map(item => item.saveToMemento());
            context.globalState.update(this.docTypeName, cachedDocType);
        } else {
            // Create new in-memory ReferenceItems by rehydrating from the cached mementos
            referenceItems = cachedMementos.map(cachedMemento => new SalesforceAuraReferenceItem(new ReferenceItemMemento(cachedMemento)));
        }
        return referenceItems;
    }

}