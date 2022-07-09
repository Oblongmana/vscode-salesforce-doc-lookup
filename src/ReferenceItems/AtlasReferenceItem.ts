import * as vscode from 'vscode';

import got from 'got/dist/source';
import * as cheerio from 'cheerio';

import { ReferenceItem } from "./ReferenceItem";
import { ReferenceItemMemento } from "./ReferenceItemMemento";
import { Logging } from '../Logging';
import { SF_DOC_ROOT_URL } from '../GlobalConstants';

//Constants related to Atlas-based documentation items
const SF_ATLAS_RAW_DOC_PATH = '/get_document_content';

export const SF_ATLAS_DEFAULT_LANG = 'en-us';
export const SF_ATLAS_DEFAULT_VERSION_FOR_URL = undefined;
export const SF_ATLAS_DEFAULT_VERSION_FOR_HTML_CONTENT = '238.0';  //! Will need to be updated periodically as Salesforce releases new doc versions, or a dynamic solution setup


export class AtlasReferenceItem extends ReferenceItem {
    //#region Implemented base properties
    label!: string;
    data!: Record<string, string>;
    //#endregion

    //#region Atlas specific state fields
    /**
     * The string that identifies the "atlas" for this doc type
     *
     * e.g. in the URL "https://developer.salesforce.com/docs/atlas.en-us.apexref.meta/apexref/apex_dml_section.htm#apex_dml_undelete"
     *    this is "apexref"
     */
    private readonly atlasIdentifier: string;

    /**
     * A SF version code (e.g. 236.0) to use - default for human links is NO version code, which gives the latest doc; default for
     * html doc retrieved to display inside VSCode is {@link SF_ATLAS_DEFAULT_VERSION_FOR_HTML_CONTENT}
     *
     * e.g. in the URL "https://developer.salesforce.com/docs/atlas.en-us.236.0.apexref.meta/apexref/apex_dml_section.htm#apex_dml_undelete"
     *    this is "236.0"
     */
    private readonly versionCodeOverride: string | undefined;

    /**
     * A language code override (e.g. ja-jp) to use instead of the default {@link SF_ATLAS_DEFAULT_LANG}
     *
     * e.g. in the URL "https://developer.salesforce.com/docs/atlas.en-us.236.0.apexref.meta/apexref/apex_dml_section.htm#apex_dml_undelete"
     *    this is "en-us"
     */
    private readonly langCodeOverride: string | undefined;
    //#endregion

    //TODO set up sensible way to discover what's used in the Atlas-specific `data` contents - ditto for Aura doc. Currently just hard-coded "resource" everywhere

    //NB: JSDoc seems to struggle with inheriting doc for constructor overloads, so they're each fully specified below
    /**
     * Build a new Reference Item for a Salesforce Atlas-based doc node - either from a node retrieved from Salesforce, or from a cached ReferenceItemMemento
     *
     * @param memento  a cached ReferenceItemMemento
     * @param atlasIdentifier the atlas identifier for this item (e.g. 'apexref')
     * @param breadcrumb a breadcrumb value to display in the quick pick list. IGNORED WHEN CONSTRUCTING FROM MEMENTO
     * @param versionCodeOverride a version code to use instead of the default latest version (e.g. '236.0')
     * @param langCodeOverride a lang code to use instead of the default 'en-us' (e.g. 'ja-jp')
     */
    constructor(memento: ReferenceItemMemento,                                                 atlasIdentifier: string, breadcrumb?: string, versionCodeOverride?: string, langCodeOverride?: string)
    /**
     * Build a new Reference Item for a Salesforce Atlas-based doc node - either from a node retrieved from Salesforce, or from a cached ReferenceItemMemento
     *
     * @param docNode a node retrieved from Salesforce
     * @param atlasIdentifier the atlas identifier for this item (e.g. 'apexref')
     * @param breadcrumb a breadcrumb value to display in the quick pick list
     * @param versionCodeOverride a version code to use instead of the default latest version (e.g. '236.0')
     * @param langCodeOverride a lang code to use instead of the default 'en-us' (e.g. 'ja-jp')
     */
    constructor(docNode: AtlasTOC.DocumentationNode,                                 atlasIdentifier: string, breadcrumb?: string, versionCodeOverride?: string, langCodeOverride?: string)
    constructor(mementoOrDocNode: ReferenceItemMemento | AtlasTOC.DocumentationNode, atlasIdentifier: string, breadcrumb?: string, versionCodeOverride?: string, langCodeOverride?: string) {
        super();
        if (mementoOrDocNode instanceof ReferenceItemMemento) {
            this.restoreFromMemento(mementoOrDocNode);
        } else {
            let docNode = mementoOrDocNode as AtlasTOC.DocumentationNode;
            if (!docNode.hasOwnProperty('text') || docNode.text === undefined) {
                throw new Error('Supplied DocumentationNode had a missing or undefined `text`. This CANNOT be used to build a SalesforceAtlasReferenceItem - these are used to build Quick Pick items and must have this populated');
            }
            if (!docNode.hasOwnProperty('a_attr') || docNode.a_attr === undefined) {
                throw new Error('Supplied DocumentationNode had a missing or undefined `a_attr`. This CANNOT be used to build a SalesforceAtlasReferenceItem - these are used to build links and must have this populated');
            }
            if (!docNode.a_attr.hasOwnProperty('href') || docNode.a_attr.href === undefined) {
                throw new Error('Supplied DocumentationNode had a missing or undefined `a_attr.href`. This CANNOT be used to build a SalesforceAtlasReferenceItem - these are used to build links and must have this populated');
            }

            this.label = docNode.text;
            this.detail = breadcrumb;
            this.data = { "resource": docNode.a_attr.href };
        }

        this.atlasIdentifier = atlasIdentifier;
        this.versionCodeOverride = versionCodeOverride;
        this.langCodeOverride = langCodeOverride;
    }

    /**
     * @inheritdoc
     */
    public humanDocURL(): string {
        let versionOverrideForMerge: string | undefined = this.versionCodeOverride || SF_ATLAS_DEFAULT_VERSION_FOR_URL;
        versionOverrideForMerge = (versionOverrideForMerge !== null && versionOverrideForMerge !== undefined)  ? `.${this.versionCodeOverride}` : '';
        return `${SF_DOC_ROOT_URL}/atlas.${this.langCodeOverride || SF_ATLAS_DEFAULT_LANG}${versionOverrideForMerge}.${this.atlasIdentifier}.meta/${this.atlasIdentifier}/${this.data.resource}`;
        // e.g. override{}              https://developer.salesforce.com/docs/atlas.en-us.apexref.meta/apexref/apex_dml_section.htm#apex_dml_undelete
        // e.g. override{VER}           https://developer.salesforce.com/docs/atlas.en-us.236.0.apexref.meta/apexref/apex_dml_section.htm#apex_dml_undelete
        // e.g. override{LANG}          https://developer.salesforce.com/docs/atlas.ja-jp.apexref.meta/apexref/apex_dml_section.htm#apex_dml_undelete
        // e.g. override{VER,LANG}      https://developer.salesforce.com/docs/atlas.ja-jp.236.0.apexref.meta/apexref/apex_dml_section.htm#apex_dml_undelete
    }

    /**
     * @inheritdoc
     */
    public async asHTML(): Promise<string> {
        const resourceHrefWithoutFragment = vscode.Uri.parse(this.data.resource).path;

        // Unfortunately retrieving actual doc content requires a version code - it can't be left unspecified to get latest. This can be updated by user in config,
        //  and we'll need to periodically update the extension as new doc releases, setting a new SF_ATLAS_DEFAULT_VERSION_FOR_CONTENT
        const docUri = `${SF_DOC_ROOT_URL}${SF_ATLAS_RAW_DOC_PATH}/${this.atlasIdentifier}/${resourceHrefWithoutFragment}/${this.langCodeOverride || SF_ATLAS_DEFAULT_LANG}/${this.versionCodeOverride || SF_ATLAS_DEFAULT_VERSION_FOR_HTML_CONTENT}`;
        // e.g. override{}              https://developer.salesforce.com/docs/get_document_content/apexref/apex_class_Approval_LockResult.htm/en-us/238.0
        // e.g. override{VER}           https://developer.salesforce.com/docs/get_document_content/apexref/apex_class_Approval_LockResult.htm/en-us/232.0
        // e.g. override{LANG}          https://developer.salesforce.com/docs/get_document_content/apexref/apex_class_Approval_LockResult.htm/ja-jp/238.0
        // e.g. override{VER,LANG}      https://developer.salesforce.com/docs/get_document_content/apexref/apex_class_Approval_LockResult.htm/ja-jp/232.0


        //TODO: this is extremely experimental
        //  review security constraints, poss including CSP stuff on the webview itself
        let body: any = await got(docUri).json();

        // Salesforce includes "seealso" links, which usually go to internal anchors. Rewrite them to work for us
        //  todo: this doesn't handle links that don't go to in-page anchors - such as "Namespace" pages in the doc
        //   - possibilities include using Command URIs to run an appropriate command to load the right doc? https://code.visualstudio.com/api/extension-guides/command#command-uris
        const docContentDOM: cheerio.CheerioAPI = cheerio.load(body.content);
        const seeAlsoLinks: cheerio.Cheerio<cheerio.Element> = docContentDOM('#sfdc\\:seealso a');
        seeAlsoLinks.each((index, element) => {
            //Extract the fragment from the href, and set the link to ONLY be the fragment, so it works in our webview
            docContentDOM(element).attr('href', '#' + vscode.Uri.parse(docContentDOM(element).attr('href')!).fragment);
        });

        return docContentDOM.xml();
    }

    /**
     * @inheritdoc
     */
    public webViewNavFragment(): string {
        // e.g. in https://developer.salesforce.com/docs/atlas.en-us.apexref.meta/apexref/apex_dml_section.htm#apex_dml_undelete,
        //      this is "apex_dml_undelete"
        return vscode.Uri.parse(this.data.resource).fragment;
    }
}