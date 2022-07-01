import { SalesforceReferenceAuraDocType } from "../AbstractDocTypes/SalesforceReferenceAuraDocType";
import { DocTypeName } from "../DocTypeNames";

export class AuraLWCComponentLibrarySalesforceReferenceDocType extends SalesforceReferenceAuraDocType {
    constructor() {
        super(
            DocTypeName.LWC_AND_AURA_COMPONENT_LIBRARY
        );
    }
}