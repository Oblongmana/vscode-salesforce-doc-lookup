import { AuraDocType } from "../../AbstractDocTypes/AuraDocType";
import { DocType } from "../../DocType";

export class AuraLWCComponentLibraryAuraDocType extends AuraDocType {
    constructor() {
        super(
            DocType.LWC_AND_AURA_COMPONENT_LIBRARY
        );
    }
}