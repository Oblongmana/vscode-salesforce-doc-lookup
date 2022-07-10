export enum DocType {
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
    LWC_AND_AURA_COMPONENT_LIBRARY  = 'LWC_AND_AURA_COMPONENT_LIBRARY',
}

export function docTypeTitleCaseName(docType: DocType): string {
    const recasedAndSpaced: string = docType.replace(
        /([-_]*[a-zA-Z]*)/g,
        (group) => {
            const stripped: string = group.replace('-', '').replace('_', '');
            return (stripped.charAt(0).toUpperCase() + stripped.substr(1).toLowerCase() + ' ');
        }
    );
    return recasedAndSpaced.trim();
}