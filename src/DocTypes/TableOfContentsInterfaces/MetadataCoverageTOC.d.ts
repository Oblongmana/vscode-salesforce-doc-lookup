/**
 * Interfaces for the JSON nodes in the Salesforce Metadata Coverage Report Tables of Contents
 *
 * todo: experimental - needs full doc
 */
declare module MetadataCoverageTOC {

    //! NB: abbreviated example at EOF

    export interface MetadataCoverageRoot {
        // e.g.
        // {
        //      "types": {
        //          ...
        //      }
        // }
        types: MetadataCoverageTypesList
    }

    export interface MetadataCoverageTypesList {
        // {
        //     "WorkforceEngagementSettings": { ... },
        //     "WorkflowTask": { ... },
        //     ...etc...
        // }
        [typeName: string]: MetadataCoverageType;
    }

    export interface MetadataCoverageType {
        details: Array<MetadataCoverageDetailItem>,
        scratchDefinitions?: MetadataCoverageScratchDefinitions,
        knownIssues?: Array<MetadataCoverageKnownIssue>,
        channels: MetadataCoverageChannel
    }

    export interface MetadataCoverageDetailItem {
        url?: string,
        detailText?: string,
        detailRichText?: string,
        name: string
    }

    export interface MetadataCoverageScratchDefinitions {
        professional?: string,
        group?: string,
        enterprise?: string,
        developer?: string
    }

    export interface MetadataCoverageKnownIssue {
        url: string,
        lastUpdated: string,
        affectedUsers: number,
        tags?: string,
        status: string,
        summary: string,
        title: string
    }

    export interface MetadataCoverageChannel {
        unlockedPackagingWithoutNamespace: boolean,
        unlockedPackagingWithNamespace: boolean,
        toolingApi: boolean,
        sourceTracking: boolean,
        metadataApi: boolean,
        managedPackaging: boolean,
        classicUnmanagedPackaging: boolean,
        classicManagedPackaging: boolean,
        changeSets: boolean,
        apexMetadataApi: boolean
    }
}

// Example (abridged real data):
// {
//     "versions": {
//         "selected": 55,
//         "max": 55,
//         "min": 43
//     },
//     types: {
//         ...,
//         "BotSettings": {
//             "details": [
//                 {
//                     "url": "https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_botsettings.htm",
//                     "name": "Metadata API Documentation"
//                 },
//                 {
//                     "url": null,
//                     "detailText": null,
//                     "detailRichText": "<p><span style=\"color: rgb(62, 62, 60);\">To use this Metadata Type in a scratch org (starting in Summer &#39;19) you must enable Einstein Bots and accept the associated Terms of Service agreement </span><b style=\"color: rgb(62, 62, 60);\">in the Dev Hub</b><span style=\"color: rgb(62, 62, 60);\">.  Once this is done, use the scratch org features and settings as shown in the Sample Scratch Definition tab when you create a new scratch org.</span></p>",
//                     "name": "Dev Hub requirement when using scratch orgs"
//                 }
//             ],
//             ...
//         }
//         "QuickAction": {
//             "details": [
//                 {
//                     "url": "https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_quickaction.htm",
//                     "name": "Metadata API Documentation"
//                 }
//             ],
//             "scratchDefinitions": {
//                 "professional": "{\"orgName\":\"Sample Org\",\"edition\":\"professional\"}",
//                 "group": "{\"orgName\":\"Sample Org\",\"edition\":\"group\"}",
//                 "enterprise": "{\"orgName\":\"Sample Org\",\"edition\":\"enterprise\"}",
//                 "developer": "{\"orgName\":\"Sample Org\",\"edition\":\"developer\"}"
//             },
//             "knownIssues": [
//                 {
//                     "url": "https://success.salesforce.com/issues_view?id=a1p3A000000JWhGQAW",
//                     "lastUpdated": "2019-02-09",
//                     "affectedUsers": 5,
//                     "tags": "Salesforce DX",
//                     "status": "Fixed",
//                     "summary": "Whatever changes made to Quick Action Layout in scratch org not getting synced to repository while running pull command : sfdx force:source:pull",
//                     "title": "Changes to Quick Action Layout not getting synced while running sfdx force:source:pull"
//                 },
//                 {
//                     "url": "https://success.salesforce.com/issues_view?id=a1p3A000000JWYOQA4",
//                     "lastUpdated": "2020-07-21",
//                     "affectedUsers": 4,
//                     "tags": "Metadata",
//                     "status": "In Review",
//                     "summary": "Some customers may have observed the following error concerning the translation of global quick action fields.\r\n\r\nquickActions>\r\n       <label>My translated success message</label>\r\n        <name>MyAction1</name>\r\n    </quickActions>\r\n    <quickActions>\r\n        <label>My translated field label</label>\r\n        <name>MyAction1</name>\r\n    </quickActions>\r\n\r\n\" Duplicate translation specified for QuickAction:MyAction1\"\r\n\r\nThe quickActions field on the Translation metadata type (https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_translations.htm) does not support full definition of the data that is allowed to be customized by a user in the Setup UI.  Specifically, when translating a Global Action, the user can specify a translation for both a Field Label and Informational Message (selected as \"Aspects\" in the Setup UI), but the metadata XML that is generated for this when the Metadata is retrieved is structured as follows, with the same \"name\" for each of these fields:",
//                     "title": "Translations for Quick Action \"Informational Message\" and \"Field Label\" not supported properly in Translations Metadata API type"
//                 }
//             ],
//             "channels": {
//                 "unlockedPackagingWithoutNamespace": true,
//                 "unlockedPackagingWithNamespace": true,
//                 "toolingApi": false,
//                 "sourceTracking": true,
//                 "metadataApi": true,
//                 "managedPackaging": true,
//                 "classicUnmanagedPackaging": true,
//                 "classicManagedPackaging": true,
//                 "changeSets": true,
//                 "apexMetadataApi": false
//             }
//         }
//     }
// }