export enum DocTypeID {
    //Atlas Types
    APEX                            = 'APEX',
    VISUALFORCE                     = 'VISUALFORCE',
    LIGHTNING_CONSOLE               = 'LIGHTNING_CONSOLE',
    CLASSIC_CONSOLE                 = 'CLASSIC_CONSOLE',
    METADATA                        = 'METADATA',
    OBJECT_REFERENCE                = 'OBJECT_REFERENCE',
    REST_API                        = 'REST_API',
    SOAP_API                        = 'SOAP_API',
    SFDX_CLI                        = 'SFDX_CLI',
    APEX_DEV_GUIDE                  = 'APEX_DEV_GUIDE',
    AJAX                            = 'AJAX',
    ANT_MIGRATION_TOOL              = 'ANT_MIGRATION_TOOL',
    BIG_OBJECTS                     = 'BIG_OBJECTS',
    BULK_API                        = 'BULK_API',
    DATA_LOADER                     = 'DATA_LOADER',
    TOOLING_API                     = 'TOOLING_API',
    SFDX_CLI_PLUGINS                = 'SFDX_CLI_PLUGINS',
    //Aura Types
    LWC_AND_AURA_COMPONENT_LIBRARY  = 'LWC_AND_AURA_COMPONENT_LIBRARY',
    //Metadata Coverage Report Types
    METADATA_COVERAGE_REPORT        = 'METADATA_COVERAGE_REPORT',
}

export type AtlasDocTypeID = Exclude<DocTypeID, DocTypeID.LWC_AND_AURA_COMPONENT_LIBRARY | DocTypeID.METADATA_COVERAGE_REPORT>;

export type AuraDocTypeID = DocTypeID.LWC_AND_AURA_COMPONENT_LIBRARY;

export type MetadataCoverageDocTypeID = DocTypeID.METADATA_COVERAGE_REPORT;

export function docTypeIDTitleCaseName(docType: DocTypeID): string {
    const recasedAndSpaced: string = docType.replace(
        /([-_]*[a-zA-Z]*)/g,
        (group) => {
            const stripped: string = group.replace('-', '').replace('_', '');
            return (stripped.charAt(0).toUpperCase() + stripped.substr(1).toLowerCase() + ' ');
        }
    );
    return recasedAndSpaced.trim();
}