import { ReferenceItem } from "./ReferenceItem";

//TODO: doc
export class SalesforceAuraReferenceItem implements ReferenceItem {
    label: string;
    description?: string | undefined;
    detail?: string | undefined;
    picked?: boolean | undefined;
    alwaysShow?: boolean | undefined;
    resource: string;

    /**
     * Construct an instance of SalesforceReferenceItem from a  SalesforceAuraTOC.DocumentationNode
     * TODO: review copied doc
     *
     * @param docNode A documentationNode from an Aura-based ToC, which must have descriptorName, namespace, name, defType populated
     */
    constructor(docNode: SalesforceAuraTOC.DocumentationNode) {
        if (!docNode.hasOwnProperty('descriptorName') || docNode.descriptorName === undefined) {
            throw new Error('Supplied DocumentationNode had a missing or undefined `descriptorName`. This CANNOT be used to build a SalesforceReferenceItem - these are used to build Quick Pick items and must have this populated');
        }
        if (!docNode.hasOwnProperty('namespace') || docNode.namespace === undefined) {
            throw new Error('Supplied DocumentationNode had a missing or undefined `namespace`. This CANNOT be used to build a SalesforceReferenceItem - these are used to build Quick Pick items and must have this populated');
        }
        if (!docNode.hasOwnProperty('name') || docNode.name === undefined) {
            throw new Error('Supplied DocumentationNode had a missing or undefined `name`. This CANNOT be used to build a SalesforceReferenceItem - these are used to build Quick Pick items and must have this populated');
        }
        if (!docNode.hasOwnProperty('defType') || docNode.defType === undefined) {
            throw new Error('Supplied DocumentationNode had a missing or undefined `defType`. This CANNOT be used to build a SalesforceReferenceItem - these are used to build Quick Pick items and must have this populated');
        }
        this.label = docNode.descriptorName;
        this.resource = `${docNode.descriptorName}`;
        //DefTypes map a little differently in the interface, from their underlying strings to their display values. This transform reflects the display values
        var processedDefType = docNode.defType;
        switch (processedDefType) {
            case 'component':
                processedDefType = 'Aura';
                break;
            case 'event':
                processedDefType = 'Events';
                break;
            case 'module':
                processedDefType = 'Lightning';
                break;
            case 'interface':
                processedDefType = 'Interfaces';
                break;
            default:
                //Just leave it as the supplied defType. Shouldn't happen, but ok enough if it does
                break;
        }
        this.detail = `$(home) $(breadcrumb-separator) ${processedDefType} $(breadcrumb-separator) ${docNode.namespace} $(breadcrumb-separator) ${docNode.name}`;
    }
}