
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
    ApexDevGuideAtlasDocType
} from "./ConcreteDocTypes";
import { DocType } from "./DocType";
import { IDocumentationType } from "./IDocumentationType";


export const DocTypeFactory: Record<DocType, () => IDocumentationType> = {
    APEX:                             () => new ApexAtlasDocType(),
    VISUALFORCE:                      () => new VisualforceAtlasDocType(),
    LIGHTNING_CONSOLE:                () => new LightningConsoleAtlasDocType(),
    CLASSIC_CONSOLE:                  () => new ClassicConsoleAtlasDocType(),
    METADATA:                         () => new MetadataAtlasDocType(),
    OBJECT_REFERENCE:                 () => new ObjectReferenceAtlasDocType(),
    REST_API:                         () => new RestAPIAtlasDocType(),
    SOAP_API:                         () => new SOAPAPIAtlasDocType(),
    SFDX_CLI:                         () => new SFDXCLIAtlasDocType(),
    LWC_AND_AURA_COMPONENT_LIBRARY:   () => new AuraLWCComponentLibraryAuraDocType(),
    APEX_DEV_GUIDE:                   () => new ApexDevGuideAtlasDocType(),
};