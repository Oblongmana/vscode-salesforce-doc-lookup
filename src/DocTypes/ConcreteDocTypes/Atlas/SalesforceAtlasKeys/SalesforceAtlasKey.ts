/**
 * The Atlas Key (known as "deliverable" in the SF JSON ToC) used
 * to get the ToC for that doc type.
 *
 * e.g. in https://developer.salesforce.com/docs/get_document/atlas.en-us.bigobjects.meta,
 *      this is "bigobjects"
 */
export enum SalesforceAtlasKey {
    APEXREF                    = 'apexref',
    APEXCODE                   = 'apexcode',
    API_CONSOLE                = 'api_console',
    API_META                   = 'api_meta',
    OBJECT_REFERENCE           = 'object_reference',
    API_REST                   = 'api_rest',
    SFDX_CLI_REFERENCE         = 'sfdx_cli_reference',
    API                        = 'api',
    PAGES                      = 'pages',
    AJAX                       = 'ajax',
    ANT_MIGRATION_TOOL         = 'daas',
    BIG_OBJECTS                = 'bigobjects',
    BULK_API                   = 'api_asynch',
    DATA_LOADER                = 'dataLoader',
    TOOLING_API                = 'api_tooling',
    SFDX_CLI_PLUGINS           = 'sfdx_cli_plugins',
    MOBILE_SDK                 = 'mobile_sdk',
    API_ACTION                 = 'api_action',
    SFDX_DEV                   = 'sfdx_dev',
    SOQL_SOSL                  = 'soql_sosl',
    AURA_COMP_DEV              = 'lightning',
    CONNECT_CHATTER_API        = 'chatterapi',
    FIELD_REFERENCE            = 'sfFieldRef',
    SECURE_CODING_GUIDE        = 'secure_coding_guide',

}