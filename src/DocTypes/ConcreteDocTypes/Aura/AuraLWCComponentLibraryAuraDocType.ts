import { AuraDocType } from "../../AbstractDocTypes/AuraDocType";
import { DocTypeID } from "../../DocTypeID";

export class AuraLWCComponentLibraryAuraDocType extends AuraDocType {
    constructor() {
        super(
            DocTypeID.LWC_AND_AURA_COMPONENT_LIBRARY
        );
    }
}