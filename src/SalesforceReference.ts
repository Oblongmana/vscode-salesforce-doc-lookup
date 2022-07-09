import { ApexSalesforceReferenceDocType } from "./DocTypes/ConcreteDocTypes/ApexSalesforceReferenceDocType";
import { AuraLWCComponentLibrarySalesforceReferenceDocType } from "./DocTypes/ConcreteDocTypes/AuraLWCComponentLibrarySalesforceReferenceDocType";
import { ClassicConsoleSalesforceReferenceDocType } from "./DocTypes/ConcreteDocTypes/ClassicConsoleSalesforceReferenceDocType";
import { LightningConsoleSalesforceReferenceDocType } from "./DocTypes/ConcreteDocTypes/LightningConsoleSalesforceReferenceDocType";
import { MetadataSalesforceReferenceDocType } from "./DocTypes/ConcreteDocTypes/MetadataSalesforceReferenceDocType";
import { ObjectReferenceSalesforceReferenceDocType } from "./DocTypes/ConcreteDocTypes/ObjectReferenceSalesforceReferenceDocType";
import { RestAPISalesforceReferenceDocType } from "./DocTypes/ConcreteDocTypes/RestAPISalesforceReferenceDocType";
import { SFDXCLISalesforceReferenceDocType } from "./DocTypes/ConcreteDocTypes/SFDXCLISalesforceReferenceDocType";
import { SOAPAPISalesforceReferenceDocType } from "./DocTypes/ConcreteDocTypes/SOAPAPISalesforceReferenceDocType";
import { VisualforceSalesforceReferenceDocType } from "./DocTypes/ConcreteDocTypes/VisualforceSalesforceReferenceDocType";
import { DocTypeName } from "./DocTypes/DocTypeNames";
import { DocumentationType } from "./DocTypes/DocumentationType";

//TODO: class/exports may need renaming here, purpose has shifted a bit over time

export const SalesforceReferenceDocTypes: Record<DocTypeName, () => DocumentationType> = {
    APEX:                             () => new ApexSalesforceReferenceDocType(),
    VISUALFORCE:                      () => new VisualforceSalesforceReferenceDocType(),
    LIGHTNING_CONSOLE:                () => new LightningConsoleSalesforceReferenceDocType(),
    CLASSIC_CONSOLE:                  () => new ClassicConsoleSalesforceReferenceDocType(),
    METADATA:                         () => new MetadataSalesforceReferenceDocType(),
    OBJECT_REFERENCE:                 () => new ObjectReferenceSalesforceReferenceDocType(),
    REST_API:                         () => new RestAPISalesforceReferenceDocType(),
    SOAP_API:                         () => new SOAPAPISalesforceReferenceDocType(),
    SFDX_CLI:                         () => new SFDXCLISalesforceReferenceDocType(),
    LWC_AND_AURA_COMPONENT_LIBRARY:   () => new AuraLWCComponentLibrarySalesforceReferenceDocType(),
};
