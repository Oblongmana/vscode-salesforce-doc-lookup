import { ReferenceItem } from "../ReferenceItem";
import { SF_DOC_ROOT_URL } from '../../GlobalConstants';
import { MetadataCoverageReferenceItem, METADATA_COVERAGE_PATH } from './MetadataCoverageReferenceItem';
import { generateHtmlTable } from './MetadataCoverageTableGenerator';

/**
 * Special node for the Metadata Coverage Report that mimics the "main table"
 * one lands on at https://developer.salesforce.com/docs/metadata-coverage.
 * At this stage, should not be mementoised/restored, but instead built on the fly
 * as needed (as it is just a run-time container for the data (i.e. `childReferenceItems`)
 * that ARE mementoised/restored)
 */
export class MetadataCoverageRootReferenceItem extends ReferenceItem {
    //#region Implemented base properties
    label!: string;
    data!: Record<string, any>;
    //#endregion

    //#region Metadata coverage specific state fields
    /**
     * The child reference items for this root node, whose `channels` fields can be used
     * to construct a facsimile of the landing-page table at https://developer.salesforce.com/docs/metadata-coverage
     * when the asHTML() method is invoked.
     */
    private readonly childReferenceItems: Array<MetadataCoverageReferenceItem>;

    /**
     * A SF release version code (e.g. 55) to use - default is NO version code, which gives the latest doc
     *
     * e.g. in the URL "https://developer.salesforce.com/docs/metadata-coverage/55/"
     *    this is "55"
     */
    private readonly versionCodeOverride: string | undefined;
    //#endregion

    constructor(childReferenceItems: Array<MetadataCoverageReferenceItem>, name: string, breadcrumb: string, versionCodeOverride?: string) { //NB: at time of writing (2022-07), no lang codes present on SF side in any JSON etc
        super();
        this.label = name,
        this.detail = breadcrumb;
        this.childReferenceItems = childReferenceItems;
        this.versionCodeOverride = versionCodeOverride;
    }

    /**
     * @inheritdoc
     */
    public humanDocURL(): string {
        let versionOverrideForMerge: string = (this.versionCodeOverride !== null && this.versionCodeOverride !== undefined) ? `/${this.versionCodeOverride}/` : '';
        return `${SF_DOC_ROOT_URL}${METADATA_COVERAGE_PATH}${versionOverrideForMerge}`;
        // e.g. override{}              https://developer.salesforce.com/docs/metadata-coverage
        // e.g. override{VER}           https://developer.salesforce.com/docs/metadata-coverage/55/
    }

    /**
     * @inheritdoc
     */
    public async asHTML(): Promise<string> {
        return generateHtmlTable(this.childReferenceItems);
    }

    /**
     * @inheritdoc
     */
    public webViewNavFragment(): undefined {
        return undefined;
    }
}