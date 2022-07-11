# "Metadata Coverage Report" Notes

## Contents
- ["Metadata Coverage Report" Notes](#metadata-coverage-report-notes)
  - [Contents](#contents)
  - [Initial Notes](#initial-notes)
  - [Limitations/Scope Exclusions](#limitationsscope-exclusions)
    - [Org-Specific: possibly in future](#org-specific-possibly-in-future)
  - [Human URL](#human-url)
    - [Base](#base)
  - [ToC URL and JSON content](#toc-url-and-json-content)
    - [Useful Sample](#useful-sample)
  - [Implementation Notes](#implementation-notes)
    - [Discovered Limitations](#discovered-limitations)
    - [Planned Implementation](#planned-implementation)
    - [Discarded notes](#discarded-notes)


## Initial Notes
Requested in https://github.com/Oblongmana/vscode-salesforce-doc-lookup/issues/13

Example URL: https://developer.salesforce.com/docs/metadata-coverage/55

An interesting one, couple prelim notes:
- autocomplete etc is obv out of scope
- we can get a reliable full ToC from https://mdcoverage.secure.force.com/services/apexrest/report?version=55
  - See notes below for breakdown
  - !! The ToC seems to contain ALL content needed to generate the page
  - Doesn't contain HTML however, we'd need to wrap it in our own
- Human linking is sensible-ish
  - Page is an SPA built from the ToC
  - in-page popups for any given item
  - !! popups aren't just JS state, can construct direct links
    - UPDATE: this is only partially true - only the popup itself allows direct linking, the URL path that leads to specific tabs IS only JS state

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


## ToC URL and JSON content

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

An entry (a "type" inside `types`) is composed of:
  - `details`
    - non-null
    - array of objects
      - these are links out to metadata, and to extra info on Pilot prog of DevHub reqs
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
    - may be null
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


## Implementation Notes

### Discovered Limitations

!!!! Unfortunately, the SPA does modify the URL for individual tabs, but in this app it's fakery rather than a "real" url we can use to hit
a specific tab. There doesn't appear to be any workaround sadly, the internal routing mechanism does open the popup for a specific path
(e.g. /AccessControlPolicy/), but discards any further information - further details in the path are only accessible by clicks (clicks not code lmao).

### Planned Implementation

In terms of memento-ised data, we might as well cache the full ToC given:
- the relatively constrained data - primarily machine data rather than the lengthy prose of Atlas/Aura docs
- the json being completely per se - whereas for Atlas/Aura doc the ToC is closer to a useful index over further URLs, this json contains ALL the data needed to construct the page content
- the overall reasonable size: ~486kb at time of writing. Chonky, but not toooo chonky
- the alternative would require more consideration about what is retrieved at run-time and what is memoised (vs chunking everything in)
- I'm more inclined to have (for heavy users) frequent disk access of 1/2mb than frequent web calls of 1/2mb. Overall latency will be lower, and at that scale disk feels cheaper than web data
- This is all a first cut fast implementation anyway - we can increase sophistication if needed in future

For structure and doc-searchable content, we'll keep our initial model simple:
- One special root report node
  - For link-out that's straightforward: https://mdcoverage.secure.force.com/docs/metadata-coverage/{|VERSION|e.g.55}/
  - For webView: special behaviour that builds a full (albeit simplistic i.e. no SPA functionality) replica of the web table
- Each "type" inside `types` itself
  - For link-out: https://mdcoverage.secure.force.com/docs/metadata-coverage/{|VERSION|e.g.55}/{|TYPE|e.g.AccessControlPolicy}/
    - NOTE THE TRAILING SLASH IS CRITICAL - OMITTING IT TAKES YOU TO THE FULL REPORT WITH NO POPUP
  - for webView
    - Build the content of it's children:
      - direct children become headers
      - each individual child can have its content rendered appropriately underneath. Keep it simple on first pass
        - this includes `channels` - just a cut down version of the full report - showing the individual items info
      - Probably order as: channels, details, scratchDefinitions, knownIssues
      - Make sure the scratchDefinitions are easy to copy/paste


### Discarded notes

**! Discarded Notes! See above on approach. Keeping it simpler in first cut**

> Things we probably want to be doc-searchable are - in short - anything that can be linked directly with a unique URL. This is despite the fact that (see above note), we can't go to specific popup tabs cold in > browser - because when rendering in WebView, we can actually build this info directly ourselves! And it's only a minor inconvenience (I hope) for browser users to move across a tab. Providing the full URL hopefully > means that if SF update their SPA internal routing in future, our links should "start" to work.
> So we want:
> - the root report
> - each "type" inside `types` itself
>   - Links to e.g. https://mdcoverage.secure.force.com/docs/metadata-coverage/55/AccessControlPolicy/
>   - NOTE THE TRAILING SLASH IS CRITICAL - OMITTING IT TAKES YOU TO THE FULL REPORT WITH NO POPUP
>   - In the WebView, this can instead show the corresponding `channels` data
>   - for each type:
>     - the `details` tab
>       - e.g. https://mdcoverage.secure.force.com/docs/metadata-coverage/55/ApplicationRecordTypeConfig/details
>       - NOT each item inside this - these all appear on the same page
>     - NOT the `scratchDefinitions` tab/object itself, but
>       - Each of the individual contained within: e.g. https://mdcoverage.secure.force.com/docs/metadata-coverage/55/AccessControlPolicy/scratch-def/professional
>     - the `knownIssues` tab https://mdcoverage.secure.force.com/docs/metadata-coverage/55/AccessControlPolicy/issues