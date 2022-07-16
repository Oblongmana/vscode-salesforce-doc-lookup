import { AtlasDocTypeID } from "../../../DocTypeID";
import { SalesforceAtlasKey } from "./SalesforceAtlasKey";

export const AtlasDocTypeIdToSalesforceAtlasKey: Record<AtlasDocTypeID, SalesforceAtlasKey> = {
    APEX                : SalesforceAtlasKey.APEXREF,
    VISUALFORCE         : SalesforceAtlasKey.PAGES,
    LIGHTNING_CONSOLE   : SalesforceAtlasKey.API_CONSOLE,
    CLASSIC_CONSOLE     : SalesforceAtlasKey.API_CONSOLE,
    METADATA            : SalesforceAtlasKey.API_META,
    OBJECT_REFERENCE    : SalesforceAtlasKey.OBJECT_REFERENCE,
    REST_API            : SalesforceAtlasKey.API_REST,
    SOAP_API            : SalesforceAtlasKey.API,
    SFDX_CLI            : SalesforceAtlasKey.SFDX_CLI_REFERENCE,
    APEX_DEV_GUIDE      : SalesforceAtlasKey.APEXCODE,
    AJAX                : SalesforceAtlasKey.AJAX,
    ANT_MIGRATION_TOOL  : SalesforceAtlasKey.ANT_MIGRATION_TOOL,
    BIG_OBJECTS         : SalesforceAtlasKey.BIG_OBJECTS,
    BULK_API            : SalesforceAtlasKey.BULK_API,
    DATA_LOADER         : SalesforceAtlasKey.DATA_LOADER,
    TOOLING_API         : SalesforceAtlasKey.TOOLING_API,
    SFDX_CLI_PLUGINS    : SalesforceAtlasKey.SFDX_CLI_PLUGINS,
};