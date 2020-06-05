# VSCode Salesforce Doc Lookup

If I ever find enough time, I'd like to accomplish the following:
1) Port my old ST3 extension to VSCode: (https://github.com/Oblongmana/sublime-salesforce-reference). The ToCs have remained stable for 3+ years, so probably safe to use! Unlike the old days,
   where it changed often. Not sure about the dynamic angular app approach to serving documentation, but at least it's stable :D
2) Try and open Doc in a browser
3) Add the Metadata reference as a new option

## How to open docs in a browser

See the old plugin

## How to get the actual Apex Documentation, not just open in browser

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

apexcode

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

Rather than the old parsing where we picked specific nesting levels to display as options, there could be a search of all nodes in the Reference subtree, so e.g. instead of viewing specific
`System` methods, you could also choose to view `System`, depending on your search.


# License

Sublime Salesforce Reference

Copyright (c) 2014-2020 James Hill me@jameshill.io

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see http://www.gnu.org/licenses/.

# Credits - copied from my original ST3 plugin

All Salesforce Documentation is © Copyright 2000–2020 salesforce.com, inc.

Thanks to Marco Zeuli for his contributions to making extra types of documentation available in the plugin

Credit to Luke McFarlane for the inspiration!