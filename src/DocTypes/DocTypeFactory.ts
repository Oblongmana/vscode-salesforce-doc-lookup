
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
} from "./ConcreteDocTypes";
import { DocTypeID } from "./DocTypeID";
import { IDocumentationType } from "./IDocumentationType";


export const DocTypeFactory: Record<DocTypeID, () => IDocumentationType> = {
    APEX:                               () => new ApexAtlasDocType(),
    VISUALFORCE:                        () => new VisualforceAtlasDocType(),
    LIGHTNING_CONSOLE:                  () => new LightningConsoleAtlasDocType(),
    CLASSIC_CONSOLE:                    () => new ClassicConsoleAtlasDocType(),
    METADATA:                           () => new MetadataAtlasDocType(),
    OBJECT_REFERENCE:                   () => new ObjectReferenceAtlasDocType(),
    REST_API:                           () => new RestAPIAtlasDocType(),
    SOAP_API:                           () => new SOAPAPIAtlasDocType(),
    SFDX_CLI:                           () => new SFDXCLIAtlasDocType(),
    LWC_AND_AURA_COMPONENT_LIBRARY:     () => new AuraLWCComponentLibraryAuraDocType(),
    APEX_DEV_GUIDE:                     () => new ApexDevGuideAtlasDocType(),
    AJAX:                               () => new AjaxDevGuideAtlasDocType(),
    ANT_MIGRATION_TOOL:                 () => new AntGuideAtlasDocType(),
    BIG_OBJECTS:                        () => new BigObjectsAtlasDocType(),
    BULK_API:                           () => new BulkAPIAtlasDocType(),
    METADATA_COVERAGE_REPORT:           () => new MetadataCoverageDocType(),
};
