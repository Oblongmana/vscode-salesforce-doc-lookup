import { AtlasDocTypeID } from "../../../DocTypeID";
import { SalesforceAtlasKey } from "./SalesforceAtlasKey";

export const AtlasDocTypeIdToSalesforceAtlasKey: Record<AtlasDocTypeID, SalesforceAtlasKey> = {
    APEX                           : SalesforceAtlasKey.APEXREF,
    VISUALFORCE                    : SalesforceAtlasKey.PAGES,
    LIGHTNING_CONSOLE              : SalesforceAtlasKey.API_CONSOLE,
    CLASSIC_CONSOLE                : SalesforceAtlasKey.API_CONSOLE,
    METADATA                       : SalesforceAtlasKey.API_META,
    OBJECT_REFERENCE               : SalesforceAtlasKey.OBJECT_REFERENCE,
    REST_API                       : SalesforceAtlasKey.API_REST,
    SOAP_API                       : SalesforceAtlasKey.API,
    SFDX_CLI                       : SalesforceAtlasKey.SFDX_CLI_REFERENCE,
    APEX_DEV_GUIDE                 : SalesforceAtlasKey.APEXCODE,
    AJAX                           : SalesforceAtlasKey.AJAX,
};