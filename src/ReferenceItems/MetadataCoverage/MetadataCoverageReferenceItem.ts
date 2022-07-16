import { ReferenceItem } from "../ReferenceItem";
import { ReferenceItemMemento } from "../ReferenceItemMemento";
import { SF_DOC_ROOT_URL } from '../../GlobalConstants';
import { generateHtmlTable } from './MetadataCoverageTableGenerator';


export const METADATA_COVERAGE_PATH = "/metadata-coverage";

export class MetadataCoverageReferenceItem extends ReferenceItem {
    //#region Implemented base properties
    label!: string;
    data!: Record<string, any>;
    //#endregion

    //#region Metadata coverage specific state fields
    //TODO if simply storing everything in cached data, we probably don't need to store (details,scratchDefinitions,knownIssues,channels) here.
    //   In future, may want construction and rehydration/saving to be more strongly typed than just dumping into `data` though, which this would
    //   let us do without breaking changes. Review this
    /**
     * A SF release version code (e.g. 55) to use - default is NO version code, which gives the latest doc
     *
     * e.g. in the URL "https://developer.salesforce.com/docs/metadata-coverage/55/"
     *    this is "55"
     */
    private readonly versionCodeOverride: string | undefined;
    //#endregion

    //NB: JSDoc seems to struggle with inheriting doc for constructor overloads, so they're each fully specified below
    //TODO constructor overloading in TS is painful - reconsider approach here at some point, perhaps rehydrating from a memento could be a static factory. Worth re-examining at some point
    //   instead be a static
    /**
     * Build a new Reference Item for a Salesforce MetadatCoverageTOC type node - either from a node retrieved from Salesforce, or from a cached ReferenceItemMemento
     *
     * @param memento  a cached ReferenceItemMemento
     * @param name  IGNORED WHEN CONSTRUCTING FROM MEMENTO. The PascalCased name of the metadata type e.g. "AIReplyRecommendationsSettings". Wweirdly not contained directly on the MetadataCoverageTOC.MetadataCoverageType received from SF [as at 2022-07 at least], so must be supplied when not building from memento
     * @param breadcrumb IGNORED WHEN CONSTRUCTING FROM MEMENTO. A breadcrumb value to display in the quick pick list
     * @param versionCodeOverride a version code to use instead of the default latest version (e.g. '55')
     */
    constructor(memento: ReferenceItemMemento,                                                     name?: string, breadcrumb?: string, versionCodeOverride?: string)
    /**
     * Build a new Reference Item for a Salesforce MetadatCoverageTOC type node - either from a node retrieved from Salesforce, or from a cached ReferenceItemMemento
     *
     * @param docNode a node retrieved from Salesforce
     * @param name The PascalCased name of the metadata type e.g. "AIReplyRecommendationsSettings". Wweirdly not contained directly on the MetadataCoverageTOC.MetadataCoverageType received from SF [as at 2022-07 at least], so must be supplied
     * @param breadcrumb a breadcrumb value to display in the quick pick list
     * @param versionCodeOverride a version code to use instead of the default latest version (e.g. '55')
     */
    constructor(docNode: MetadataCoverageTOC.MetadataCoverageType,                                 name: string, breadcrumb?: string, versionCodeOverride?: string)
    constructor(mementoOrDocNode: ReferenceItemMemento | MetadataCoverageTOC.MetadataCoverageType, name?: string, breadcrumb?: string, versionCodeOverride?: string) { //NB: at time of writing (2022-07), no lang codes present on SF side in any JSON etc
        super();
        if (mementoOrDocNode instanceof ReferenceItemMemento) {
            this.restoreFromMemento(mementoOrDocNode);
        } else {
            let docNode = mementoOrDocNode as MetadataCoverageTOC.MetadataCoverageType;

            this.label = name!;
            this.detail = breadcrumb;

            this.data = docNode;
        }

        this.versionCodeOverride = versionCodeOverride;
    }

    /**
     * @inheritdoc
     */
    public humanDocURL(): string {
        return `${SF_DOC_ROOT_URL}${METADATA_COVERAGE_PATH}/${this.versionCodeOverride || ''}/${this.label}/details`;
        // e.g. override{}              https://developer.salesforce.com/docs/metadata-coverage//ApplicationRecordTypeConfig/details
        //                              NOTE CAREFULLY HERE:
        //                              - the double - slash is significant.A version WOULD go there if we wanted a specific one;
        //                                  if we don't want a specific one, the SPA's routing STILL requires the superfluous slash (as at 2022-07).
        //                              - Additionally, the trailing `/details` is required. Or rather, a slash followed by any characters is required.
        //                                  The specific chars don't matter, and the SPA will load the `/details` tab/url. Putting in a more specific
        //                                  tab does not work as at 2022-07
        // e.g. override{VER}           https://developer.salesforce.com/docs/metadata-coverage/55/ApplicationRecordTypeConfig/details
    }

    /**
     * @inheritdoc
     */
    public async asHTML(): Promise<string> {
        return generateHtmlTable([this], this.versionCodeOverride);
    }

    /**
     * @inheritdoc
     */
    public webViewNavFragment(): undefined {
        return undefined;
    }
}