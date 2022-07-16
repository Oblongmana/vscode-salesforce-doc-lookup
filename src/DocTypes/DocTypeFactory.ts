
import {
    ApexAtlasDocType,
    VisualforceAtlasDocType,
    LightningConsoleAtlasDocType,
    ClassicConsoleAtlasDocType,
    MetadataAtlasDocType,
    ObjectReferenceAtlasDocType,
    RestAPIAtlasDocType,
    SOAPAPIAtlasDocType,
    SFDXCLIAtlasDocType,
    AuraLWCComponentLibraryAuraDocType,
    ApexDevGuideAtlasDocType,
    AjaxDevGuideAtlasDocType,
    AntGuideAtlasDocType,
    BigObjectsAtlasDocType,
    BulkAPIAtlasDocType,
    MetadataCoverageDocType,
    DataLoaderAtlasDocType,
    ToolingAPIAtlasDocType,
    SFDXCLIPluginsAtlasDocType,
    MobileSDKAtlasDocType,
    SFDXDevGuideAtlasDocType,
} from "./ConcreteDocTypes";
import { ActionsAPIAtlasDocType } from "./ConcreteDocTypes/Atlas/ActionsAPIAtlasDocType";
import { DocTypeID } from "./DocTypeID";
import { IDocumentationType } from "./IDocumentationType";


export const DocTypeFactory: Record<DocTypeID, () => IDocumentationType> = {
    //Atlas Types
    APEX:                               () => new ApexAtlasDocType(),
    VISUALFORCE:                        () => new VisualforceAtlasDocType(),
    LIGHTNING_CONSOLE:                  () => new LightningConsoleAtlasDocType(),
    CLASSIC_CONSOLE:                    () => new ClassicConsoleAtlasDocType(),
    METADATA:                           () => new MetadataAtlasDocType(),
    OBJECT_REFERENCE:                   () => new ObjectReferenceAtlasDocType(),
    REST_API:                           () => new RestAPIAtlasDocType(),
    SOAP_API:                           () => new SOAPAPIAtlasDocType(),
    SFDX_CLI:                           () => new SFDXCLIAtlasDocType(),
    APEX_DEV_GUIDE:                     () => new ApexDevGuideAtlasDocType(),
    AJAX:                               () => new AjaxDevGuideAtlasDocType(),
    ANT_MIGRATION_TOOL:                 () => new AntGuideAtlasDocType(),
    BIG_OBJECTS:                        () => new BigObjectsAtlasDocType(),
    BULK_API:                           () => new BulkAPIAtlasDocType(),
    DATA_LOADER:                        () => new DataLoaderAtlasDocType(),
    TOOLING_API:                        () => new ToolingAPIAtlasDocType(),
    SFDX_CLI_PLUGINS:                   () => new SFDXCLIPluginsAtlasDocType(),
    MOBILE_SDK:                         () => new MobileSDKAtlasDocType(),
    API_ACTION:                         () => new ActionsAPIAtlasDocType(),
    SFDX_DEV:                           () => new SFDXDevGuideAtlasDocType(),
    //Aura Types
    LWC_AND_AURA_COMPONENT_LIBRARY:     () => new AuraLWCComponentLibraryAuraDocType(),
    //Metadata Coverage Report Type
    METADATA_COVERAGE_REPORT:           () => new MetadataCoverageDocType(),
};
