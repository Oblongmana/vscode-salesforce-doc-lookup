# "Metadata Coverage Report" Notes

## Contents
- ["Metadata Coverage Report" Notes](#metadata-coverage-report-notes)
  - [Contents](#contents)
  - [Initial Notes](#initial-notes)
  - [Limitations/Scope Exclusions](#limitationsscope-exclusions)
    - [Org-Specific: possibly in future](#org-specific-possibly-in-future)
  - [Human URL](#human-url)
    - [Base](#base)
  - [ToC URL](#toc-url)
    - [Useful Sample](#useful-sample)


## Initial Notes
Requested in https://github.com/Oblongmana/vscode-salesforce-doc-lookup/issues/13

Example URL: https://developer.salesforce.com/docs/metadata-coverage/55

An interesting one, couple prelim notes:
- autocomplete etc is obv out of scope
- we can get a reliable full ToC from https://mdcoverage.secure.force.com/services/apexrest/report?version=55
  - See notes below for breakdown
  - !! The ToC seems to contain ALL content needed to generate the page
  - Doesn't contain HTML however, we'd need to wrap it in our own
- Human linking is sensible
  - Page is an SPA built from the ToC
  - in-page popups for any given item
  - !! popups aren't just JS state, can construct direct links

So overall looks pretty good from both a Human and Webview perspective

Will have to make some opinionated decisions on WebView display for VSCode limitations and initial level of effort.


## Limitations/Scope Exclusions

### Org-Specific: possibly in future
Apparently this can be viewed per-org, potentially with org-specific info? https://blog.lkatney.com/2018/07/04/metadata-coverage-report-an-easy-way-to-track-your-schema/

As I'm not actively working with Salesforce at the moment, checking this isn't something I can immediately do off-hand (very lazy of me!), but still - excluding for other reasons.

- Level of effort
- Lack of underlying support for org-specific doc

This may be desireable in future however, especially given similar potential in the LWC space, where I believe the component reference can display components from your specific org.

This will likely need further per-workspace setting support, something we don't presently have!


## Human URL

### Base

https://developer.salesforce.com/docs/metadata-coverage/55
Underlying seems to be a force.com site:

https://mdcoverage.secure.force.com/docs/metadata-coverage/55

!!!! Note you can discard the version to get latest, following is perfectly valid, it will just redirect to latest
https://mdcoverage.secure.force.com/docs/metadata-coverage

Clicking an element gives an in-page pop-up with one of 3 tabs with corresponding URLs:
- "Details":
  - https://developer.salesforce.com/docs/metadata-coverage/55/WorkforceEngagementSettings/details
- "Sample Scratch Definition":
  - https://developer.salesforce.com/docs/metadata-coverage/55/WorkforceEngagementSettings/scratch-def/......
  - 4 different options: Developer, Profession, Group, Enterprise
  - Landing option is Developer
  - URLs:
    - https://developer.salesforce.com/docs/metadata-coverage/55/WorkforceEngagementSettings/scratch-def/developer
    - https://developer.salesforce.com/docs/metadata-coverage/55/WorkforceEngagementSettings/scratch-def/professional
    - https://developer.salesforce.com/docs/metadata-coverage/55/WorkforceEngagementSettings/scratch-def/group
    - https://developer.salesforce.com/docs/metadata-coverage/55/WorkforceEngagementSettings/scratch-def/enterprise
- "Known Issues"
  - https://developer.salesforce.com/docs/metadata-coverage/55/Workflow/issues
  - Lists and links out in new tab to known issues. No further sub-urls on page
  - Distinguishes between fixed/open
  - Can ALSO be opened from the table

!!! Has version support, but NO alt language support


## ToC URL

Examining Network at
https://developer.salesforce.com/docs/metadata-coverage/55

We can see the full ToC URL (see above for prelim notes)
https://mdcoverage.secure.force.com/services/apexrest/report?version=55&_=1657427660577

!!! NOTE this goes to the force.com url, can't be  accessed through the https://developer.salesforce.com url

!!! Has version support, but NO alt language support

`_` param appears to be discardable without issue safely

`version` ALSO appears to be discardable - hitting https://mdcoverage.secure.force.com/services/apexrest/report just gives you latest, WITHOUT redirecting at all

As the schema contains EVERYTHING including content, slightly more "full" than other types of doc, but looks pretty well assembled, should be straightforward to deconstruct into ts interface

The sample below includes QuickAction, a "complete" entry, as well as other misc supporting partial entries

An entry is composed of:
  - `details`
    - non-null
    - array of objects
      - pseudo-schema for those objects:
        - `url` : string
          - may be null
          - always present
        - `detailText` : string
          - may be null
          - may be omitted
        - `detailRichText` : string (ESCAPED HTML!)
          - may be null
          - may be omitted
        - `name` : string
          - non-null
          - used as title for section
  - `scratchDefinitions`
    - MAY BE NULL
    - object mapping string to string
      - pseudo-schema for those KV pairs:
        - KEYS one of "professional" | "group" | "enterprise" | "developer", any or all of which may be omitted
        - OBJECTS = string containing escaped JSON
          - this JSON can be dumped straight into a code block, we don't need to know about the contents, this is a sample for the user
  - `knownIssues`
    - array of objects
    - used to put a little extra info in the main table - count of known fixed/open issues
    - pseudo-schema for those objects:
      - ! ALL OF THESE FIELDS ARE ALWAYS PRESENT
      - "url"
        - string
        - non-null
      - "lastUpdated"
        - string
        - non-null
        - yyyy-mm-dd
      - "affectedUsers"
        - number
        - non-null
      - "tags"
        - may be null
        - string
        - comma-separated list of tags. No need to process further
      - "status"
        - string
        - non-null
      - "summary"
        - string
        - non-null
      - "title"
        - string
        - non-null
  - `channels`
    - object
    - non-null
    - KV Pairs of string,bool
    - ALL named pairs ALWAYS present and populated
    - Used to populate the various checkboxes in the table
    - ! FOOTNOTE: IFF `unlockedPackagingWithoutNamespace`=true and `unlockedPackagingWithNamespace`= false, adds a (1) superscript to the "Unlocked Packaging" column stating in a footnote: "(1) This component can only be included in a package without a namespace."
    - ! FOOTNOTE: there is a more obscure footnote that may only apply to "ConnectedApp" (not trawling past doc to see if that's actually the case! We can handle it as a general case). IFF `classicManagedPackaging`=true but `classicUnmanagedPackaging`=false, you get a superscript (2) in the "1GP Managed Packaging" column indicating: "(2) Applies to first-generation managed packages only.".
      - the keys and their corresponding human-readable columns/checkboxes are:
        - "unlockedPackagingWithoutNamespace": "Unlocked Packaging" (see footnote note above)
        - "unlockedPackagingWithNamespace": "Unlocked Packaging" (see footnote note above)
        - "toolingApi": UNUSED - which is a bit odd. We can probably still cache it in case it's visually exposed in future?
        - "sourceTracking": "Source Tracking"
        - "metadataApi": "Metadata API"
        - "managedPackaging": "2GP Managed Packaging"
        - "classicUnmanagedPackaging": "1GP Managed Packaging" (see footnote note above)
        - "classicManagedPackaging": "1GP Managed Packaging" (see footnote note above)
        - "changeSets": "Change Sets"
        - "apexMetadataApi": "Apex Metadata API""

### Useful Sample
See METADATA_COVERAGE_SAMPLE.json for full dump

    {
        "versions": {
            "selected": 55,
            "max": 55,
            "min": 43
        },
        types: {
            ...,
            "BotSettings": {
                "details": [
                    {
                        "url": "https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_botsettings.htm",
                        "name": "Metadata API Documentation"
                    },
                    {
                        "url": null,
                        "detailText": null,
                        "detailRichText": "<p><span style=\"color: rgb(62, 62, 60);\">To use this Metadata Type in a scratch org (starting in Summer &#39;19) you must enable Einstein Bots and accept the associated Terms of Service agreement </span><b style=\"color: rgb(62, 62, 60);\">in the Dev Hub</b><span style=\"color: rgb(62, 62, 60);\">.  Once this is done, use the scratch org features and settings as shown in the Sample Scratch Definition tab when you create a new scratch org.</span></p>",
                        "name": "Dev Hub requirement when using scratch orgs"
                    }
                ],
                ...
            }
            "QuickAction": {
                "details": [
                    {
                        "url": "https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_quickaction.htm",
                        "name": "Metadata API Documentation"
                    }
                ],
                "scratchDefinitions": {
                    "professional": "{\"orgName\":\"Sample Org\",\"edition\":\"professional\"}",
                    "group": "{\"orgName\":\"Sample Org\",\"edition\":\"group\"}",
                    "enterprise": "{\"orgName\":\"Sample Org\",\"edition\":\"enterprise\"}",
                    "developer": "{\"orgName\":\"Sample Org\",\"edition\":\"developer\"}"
                },
                "knownIssues": [
                    {
                        "url": "https://success.salesforce.com/issues_view?id=a1p3A000000JWhGQAW",
                        "lastUpdated": "2019-02-09",
                        "affectedUsers": 5,
                        "tags": "Salesforce DX",
                        "status": "Fixed",
                        "summary": "Whatever changes made to Quick Action Layout in scratch org not getting synced to repository while running pull command : sfdx force:source:pull",
                        "title": "Changes to Quick Action Layout not getting synced while running sfdx force:source:pull"
                    },
                    {
                        "url": "https://success.salesforce.com/issues_view?id=a1p3A000000JWYOQA4",
                        "lastUpdated": "2020-07-21",
                        "affectedUsers": 4,
                        "tags": "Metadata",
                        "status": "In Review",
                        "summary": "Some customers may have observed the following error concerning the translation of global quick action fields.\r\n\r\nquickActions>\r\n       <label>My translated success message</label>\r\n        <name>MyAction1</name>\r\n    </quickActions>\r\n    <quickActions>\r\n        <label>My translated field label</label>\r\n        <name>MyAction1</name>\r\n    </quickActions>\r\n\r\n\" Duplicate translation specified for QuickAction:MyAction1\"\r\n\r\nThe quickActions field on the Translation metadata type (https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_translations.htm) does not support full definition of the data that is allowed to be customized by a user in the Setup UI.  Specifically, when translating a Global Action, the user can specify a translation for both a Field Label and Informational Message (selected as \"Aspects\" in the Setup UI), but the metadata XML that is generated for this when the Metadata is retrieved is structured as follows, with the same \"name\" for each of these fields:",
                        "title": "Translations for Quick Action \"Informational Message\" and \"Field Label\" not supported properly in Translations Metadata API type"
                    }
                ],
                "channels": {
                    "unlockedPackagingWithoutNamespace": true,
                    "unlockedPackagingWithNamespace": true,
                    "toolingApi": false,
                    "sourceTracking": true,
                    "metadataApi": true,
                    "managedPackaging": true,
                    "classicUnmanagedPackaging": true,
                    "classicManagedPackaging": true,
                    "changeSets": true,
                    "apexMetadataApi": false
                }
            }
        }
    }