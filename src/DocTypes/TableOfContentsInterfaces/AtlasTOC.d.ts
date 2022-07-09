/**
 * Interfaces for the JSON nodes in the Salesforce Atlas-based Tables of Contents
 */
declare module AtlasTOC {
    /**
     * An interface representing an object in one of the Salesforce
     * Atlas-based Table of Contents Documentation pages.
     */
    export interface DocumentationNode {
        /**
         * The `text` field contains a human-readable name for a node.
         * Compulsory, as it appears on all SF nodes
         */
        text: string;
        /**
         * `a_attr` object found on many DocumentationNodes,
         * generally serving as a shell for holding the `href` value,
         * which gives the final part of the path to the documentation
         * this node is for. Usually present, its absence is unusual,
         * and only occurs in a few places - note it may still have
         * children that have `a_attr` though.
         */
        a_attr?: AAttr;
        /**
         * Child DocumentationNodes indicating related information
         * contained under this node. Not always  present
         */
        children?: DocumentationNode[];
        /**
         * An ID for this node, not always present
         */
        id?: string;
    }

    /**
     * The `a_attr` object found on many DocumentationNodes,
     * generally serving as a shell for holding the `href` value,
     * which gives the final part of the path to the documentation
     * this node is for.
     */
    export interface AAttr {
        href: string;
    }
}