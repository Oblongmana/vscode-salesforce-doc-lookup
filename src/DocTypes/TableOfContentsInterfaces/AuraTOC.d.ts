/**
 * Interfaces for the JSON nodes in the Salesforce Aura-based Tables of Contents
 *
 * todo: experimental - needs full doc
 */
declare module AuraTOC {



    export interface GetBundleDefinitionResponse {
        actions: Array<BundleDefinitionAuraActionObject>
    }


    export interface BundleDefinitionAuraActionObject {
        // Ignoring most props for now, but seen so far:
        //  - state
        //  - returnValue
        //  - error
        returnValue: BundleDefinition;
    }

    export interface BundleDefinition {
        // E.g.
        // {
        //     "descriptorName": "flexipage:availableForAllPageTypes",
        //     "namespace": "flexipage",
        //     "name": "availableForAllPageTypes",
        //     "defType": "interface",
        //     "access": "global",
        //     "description": "Marks a component as being able to be used inside a Lightning App Builder page",
        //     "isExtensible": false,
        //     "isAbstract": false,
        //     "support": "GA",
        //     "interfaces": [],
        //     "attributes": [],
        //     "methods": [],
        //     "slots": [],
        //     "docDef": {
        //         "descriptor": "flexipage:availableForAllPageTypes",
        //         "descriptions": [
        //             "<p>To make your component available for record pages and any other type of page, implement the <code>flexipage:availableForAllPageTypes</code> interface.</p>\n<p>If your component is designed for record pages only, use the <code>flexipage:availableForRecordHome</code> interface instead.</p>\n<p>Here's the sample code for a &quot;Hello World&quot; component.</p>\n<pre>&lt;aura:component implements=&quot;flexipage:availableForAllPageTypes&quot; access=&quot;global&quot;&gt;\n    &lt;aura:attribute name=&quot;greeting&quot; type=&quot;String&quot; default=&quot;Hello&quot; access=&quot;global&quot; /&gt;\n    &lt;aura:attribute name=&quot;subject&quot; type=&quot;String&quot; default=&quot;World&quot; access=&quot;global&quot; /&gt;\n\n    &lt;div style=&quot;box&quot;&gt;\n      &lt;span class=&quot;greeting&quot;&gt;{!v.greeting}&lt;/span&gt;, {!v.subject}!\n    &lt;/div&gt;\n&lt;/aura:component&gt;</pre>\n<p>For more information, see the <a href=\"https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/components_config_for_app_builder.htm\" rel=\"nofollow\">Lightning Components Developer Guide</a>.</p>"
        //         ],
        //         "exampleDefs": []
        //     },
        //     "hideSupportLevel": false,
        //     "owner": "Salesforce",
        //     "moduleExamples": []
        // }
        descriptorName: string;
        namespace: string;
        name: string;
        defType: string;
        access: string;
        description: string;
        isExtensible: boolean;
        isAbstract: boolean;
        support: string;
        docDef: BundleDocDef;
        attributes: Array<BundleAttribute>;
        hideSupportLevel: boolean;
        owner: string;
    }

    export interface BundleDocDef {
        //e.g.
        //     {
        //         "descriptor": "flexipage:availableForAllPageTypes",
        //         "descriptions": [
        //             "<p>To make your component available for record pages and any other type of page, implement the <code>flexipage:availableForAllPageTypes</code> interface.</p>\n<p>If your component is designed for record pages only, use the <code>flexipage:availableForRecordHome</code> interface instead.</p>\n<p>Here's the sample code for a &quot;Hello World&quot; component.</p>\n<pre>&lt;aura:component implements=&quot;flexipage:availableForAllPageTypes&quot; access=&quot;global&quot;&gt;\n    &lt;aura:attribute name=&quot;greeting&quot; type=&quot;String&quot; default=&quot;Hello&quot; access=&quot;global&quot; /&gt;\n    &lt;aura:attribute name=&quot;subject&quot; type=&quot;String&quot; default=&quot;World&quot; access=&quot;global&quot; /&gt;\n\n    &lt;div style=&quot;box&quot;&gt;\n      &lt;span class=&quot;greeting&quot;&gt;{!v.greeting}&lt;/span&gt;, {!v.subject}!\n    &lt;/div&gt;\n&lt;/aura:component&gt;</pre>\n<p>For more information, see the <a href=\"https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/components_config_for_app_builder.htm\" rel=\"nofollow\">Lightning Components Developer Guide</a>.</p>"
        //         ],
        //         "exampleDefs": []
        //     }
        descriptor: string;
        descriptions: Array<string>;
        // exampleDefs
    }

    export interface BundleAttribute {
        //E.g.
        //
        //     {
        //         "name": "hideMenuAfterSelected",
        //         "type": "boolean",
        //         "description": "Set to true to hide menu after the menu item is selected.",
        //         "access": "global",
        //         "required": false,
        //         "defaultValue": "true",
        //         "parentName": "ui:menuItem",
        //         "parentDefType": "component"
        //     }
        name: string;
        type: string;
        description: string;
        access: string;
        required: boolean;
        defaultValue?: string;
        parentName: string;
        parentDefType: string;
    }


    export interface GetBundleDefinitionsListResponse {
        actions: Array<BundleDefinitionListAuraActionObject>
    }

    export interface BundleDefinitionListAuraActionObject {
        // Ignoring most props for now, but seen so far:
        //  - state
        //  - returnValue
        //  - error
        returnValue: BundleDefinitionList;
    }

    export interface BundleDefinitionList {
        //e.g.
        // {
        //    "lightning:verticalNavigationOverflow": {...},
        //    "someOtherThing": {...}
        // }
        [index: string]: DocumentationNode;
    }


    /**
     * An interface representing an object in the returnValues of by getBundleDefinitionsList,
     * giving us a ToC item for Aura-based documentation.
     *
     * E.g.
     * "lightning:verticalNavigationOverflow": {
     *     "descriptorName": "lightning:verticalNavigationOverflow",
     *     "namespace": "lightning",
     *     "name": "verticalNavigationOverflow",
     *     "defType": "component",
     *     "owner": "Salesforce"
     * }
     */
     export interface DocumentationNode {

        /***
         * descriptorName from a getBundleDefinitionsList call
         *
         * E.g. "lightning:verticalNavigationOverflow"
         */
        descriptorName: string;
        /**
         * namespace from a getBundleDefinitionsList call
         *
         * E.g. "lightning"
         */
        namespace: string;
        /**
         * name from a getBundleDefinitionsList call
         *
         * E.g. "verticalNavigationOverflow"
         */
        name: string;
        /**
         * defType from a getBundleDefinitionsList call
         *
         * E.g. "component"
         */
        defType: string;
        /**
         * owner from a getBundleDefinitionsList call
         *
         * E.g.  "Salesforce"
         */
        owner: string;
     }

}
