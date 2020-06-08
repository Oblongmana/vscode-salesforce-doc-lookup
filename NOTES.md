# Notes

_Note that anything in here may be well and truly outdated - this is a scratchpad of ideas, some of which may be related to roadmap items, past or future_

<!-- omit in toc -->
## Table of Contents
- [Aims](#aims)
- [How to open docs in a browser](#how-to-open-docs-in-a-browser)
- [How to get the actual Apex Documentation, not just open in browser (could also possibly be an offline caching approach)](#how-to-get-the-actual-apex-documentation-not-just-open-in-browser-could-also-possibly-be-an-offline-caching-approach)
  - [How to render within VSCode](#how-to-render-within-vscode)
  - [URL Format](#url-format)
  - [Example URL:](#example-url)
  - [Getting `:folder`](#getting-folder)
  - [Getting `:id`](#getting-id)
  - [Getting `:locale`](#getting-locale)
  - [Getting `:version`](#getting-version)
- [How to get the actual non-Apex Documentation, like the original plugin](#how-to-get-the-actual-non-apex-documentation-like-the-original-plugin)
- [Other wacky ideas](#other-wacky-ideas)
  - [Grouping](#grouping)
  - [Opening PDF Documentation? An offline mode of some sort?](#opening-pdf-documentation-an-offline-mode-of-some-sort)

## Aims
If I ever find enough time, I'd like to accomplish the following:
1) Port my old ST3 extension to VSCode: (https://github.com/Oblongmana/sublime-salesforce-reference). The ToCs have remained stable for 3+ years, so probably safe to use! Unlike the old days,
   where it changed often. Not sure about the dynamic angular app approach to serving documentation, but at least it's stable :D
2) Try and open Doc in a browser
3) Add the Metadata reference as a new option

## How to open docs in a browser

See the old plugin

## How to get the actual Apex Documentation, not just open in browser (could also possibly be an offline caching approach)

Note that this is driven by parsing the JSON ToC at https://developer.salesforce.com/docs/get_document/atlas.en-us.apexcode.meta - just like the old ST3 plugin. Difference is, we might actually
be able to render content within VSCode

### How to render within VSCode

While there do seem to be some slightly gross but also cool things out there like creating a headless Chrome instance to render inside VSCode, the sensible thing seems to follow an approach like
https://github.com/dend/rapid/blob/master/src/extension.ts, which makes one of these providers https://code.visualstudio.com/api/extension-guides/virtual-documents for rendering pages in VSCode.

Using the JSON ToC above, we can hit a different endpoint `get_document_content` to get the actual content, and see if we can render that in VSCode.

### URL Format

    FORMAT: https://developer.salesforce.com/docs/get_document_content/:folder/:id/:locale/:version

### Example URL:

    EXAMPLE:
        https://developer.salesforce.com/docs/get_document_content/apexcode/apex_methods_system_database.htm/en-us/224.0/


### Getting `:folder`

Not exactly clear where this value comes from. The actual value is `apexcode`

The most promising candidate is the top-level value `deliverable`

    {
        "deliverable": "apexcode"
    }

There's a similar value when viewing the Service Console ToC:

    {
        "deliverable": "api_console"
    }

### Getting `:id`

Parents of leaf nodes?? (not entirely clear) Seem to contain an href element under `[index].a_attr.href` e.g.

    {
        "children":[
            ...
        ],
        "text":"Database Class",
        "a_attr":{
            "href":"apex_methods_system_database.htm#apex_methods_system_database"
        },
        "id":"apex_methods_system_database-apex_methods_system_database"
    }

One might think the `id` property was a better candidate for `:id` from the ToC, but no - it's the first half of the `href` above that it's expecting for `:id`:

    apex_methods_system_database.htm

It MIGHT theoretically be that it uses everything before the `-` in the `id` property and then appends `.htm`, but this is hard to determine from examining their minified angular app.

And no, you can't just use the whole href. The following gives you nothing if used as an ID. Note that this may different for different documentation types though (e.g. service console)

    apex_methods_system_database.htm#apex_methods_system_database

Unfortunately this means that the `get_document_content` endpoints is actually not that fine grained. The leftmost part of an href (e.g. the `apex_methods_system_database.htm` in `apex_methods_system_database.htm#apex_methods_system_database`)
can be 2 levels up from the leaf node - maybe more sometimes(!), and sometimes less I think.

In terms of creating an in-vscode-viewer, that makes things a bit more of a pain, would need to scroll to it, or otherwise highlight it in the viewer.

For that matter, we'd also need to handle internal and external links somehow. An easy solution would be that any links should pop out into an actual web browser - gives the convenience
of specific things appearing in VSCode, while saving us from actually having a web browser in VSCode, which is a bit nasty.

### Getting `:locale`

Probably hard-code this to `en-us` initially. Note though that in the ToC there are a few interesting objects on the root

These describe the current state:

    {
        language: {
            label: "ENGLISH",
            code: "EN",
            locale: "en-us",
            url: "atlas.en-us.224.0.apexcode.meta"
        },
        locale: "en-us"
    }

While this describes the available languages, and could be used to provide selection. Note that the below is currently exhaustive - only English and Japanese available

    {
        available_languages: [
            {
                label: "ENGLISH"
                code: "EN"
                locale: "en-us"
                url: "atlas.en-us.224.0.apexcode.meta"
            },
            {
                label: "JAPANESE"
                code: "JA"
                locale: "ja-jp"
                url: "atlas.ja-jp.224.0.apexcode.meta"
            }
        }
    }

### Getting `:version`

In the JSON ToC, there is a top-level `version` object with the following info, of which we need the `doc_version` to populate the `:version`. This represents the default web view version

    "version": {
        "version_text":    "Spring '20 (API version 48.0)",
        "release_version": "48.0",
        "doc_version":     "224.0",
        "version_url":     "atlas.en-us.apexcode.meta"
    }

In the JSON ToC, there is a ALSO a top-level `available_versions` array, indexed from 0 being the most recent SF API Version (e.g. v49.0), to `n` being the oldest API Version. 0 is not
necessarily the _current_ version - just the most recent - which may be a preview - e.g.

    "available_versions": [
        {
            "version_text":    "Summer '20 preview (API version 49.0)",
            "release_version": "49.0",
            "doc_version":     "226.0",
            "version_url":     "atlas.en-us.226.0.apexcode.meta"
        },
        ...
    ]

## How to get the actual non-Apex Documentation, like the original plugin

Think about it later :) The rendering process suggested above may not be feasible for these if there's not a clean way to get the documentation html. There probably is though - all 3 of the
doc types in the original plugin were JSON based, with similar structures, though different parsing strategies. See also wacky ideas below

## Other wacky ideas

### Grouping

_possibly outdated notes - these predated any actual VSCode implementation of this plugin. Have tried to pare it down to only future relevant stuff though_

VSCode Quickpick fuzzy matching kind of sucks. Possibly for performance reasons, but basically, having long labels like the following
   are very difficult to get to match multiple parts.

  If this ever makes it out of "proposed" APIs (https://github.com/microsoft/vscode/pull/77297) where it's been languishing for
   a year, we could possibly use this - as it would allow us to "group things". So instead of verbose breadcrumbs, it could instead
   by say these entries

    System Namespace
      $(arrow-small-right) System Class
        $(arrow-small-right) System Methods
          $(arrow-small-right) resetPasswordWithEmailTemplate(userId, sendUserEmail, emailTemplateName

### Opening PDF Documentation? An offline mode of some sort?
Salesforce have traditionally published Developer documentation in PDFs as well. Not sure whether this is currently the case, but if it is, there's a very slim possibility we could
get some sort of offline mode going by bundling a pdf.

Would likely require the following:
 - Anchors in the files, or perhaps opening certain pages (see e.g. https://helpx.adobe.com/acrobat/kb/link-html-pdf-page-acrobat.html, https://helpx.adobe.com/acrobat/kb/link-html-pdf-page-acrobat.html. Likely requires more research)
 - Some way to open the PDF - probably not _inside_ VSCode, but perhaps in a web browser