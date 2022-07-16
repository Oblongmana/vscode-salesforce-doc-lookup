# Salesforce Reference Extension for VSCode

**Search Salesforce Developer Documentation entries in VSCode, and open them in your browser (or with experimental features: in VSCode itself!).**

_**Please Note**: this is a community-made plugin, and is not affiliated with Salesforce. If the extension breaks,
please open a github issue to let me know, there's a chance Salesforce may change its doc approach, necessitating
an update to the plugin_

Repository Home: https://github.com/Oblongmana/vscode-salesforce-doc-lookup

VSCode Marketplace Install: https://marketplace.visualstudio.com/items?itemName=Oblongmana.vscode-salesforce-doc-lookup

## Table of Contents
- [Salesforce Reference Extension for VSCode](#salesforce-reference-extension-for-vscode)
  - [Current Features](#current-features)
    - [Choose a documentation type, and type in your search](#choose-a-documentation-type-and-type-in-your-search)
      - [Available Documentation Types](#available-documentation-types)
    - [Search dev documentation for a word or selection in your editor](#search-dev-documentation-for-a-word-or-selection-in-your-editor)
  - [Invalidating the cache](#invalidating-the-cache)
  - [Experimental Features](#experimental-features)
    - [EXPERIMENTAL: Load Documentation in a VSCode Tab](#experimental-load-documentation-in-a-vscode-tab)
    - [EXPERIMENTAL: New Command: "Salesforce Reference: LWC and Aura Component Library (EXPERIMENTAL)"](#experimental-new-command-salesforce-reference-lwc-and-aura-component-library-experimental)
    - [EXPERIMENTAL, ADVANCED: Override Language and Version Settings](#experimental-advanced-override-language-and-version-settings)
  - [Installing](#installing)
    - [In VSCode or the Extension Marketplace](#in-vscode-or-the-extension-marketplace)
    - [Manually](#manually)
  - [Known Issues](#known-issues)
    - [Adblockers and loading links in Browser - NOFIX:](#adblockers-and-loading-links-in-browser---nofix)
  - [Notable Differences to the original Sublime Text 3 version](#notable-differences-to-the-original-sublime-text-3-version)
  - [Release Notes](#release-notes)
  - [Roadmap](#roadmap)
  - [Contributing](#contributing)
  - [Design Notes](#design-notes)
  - [License](#license)
  - [Credits](#credits)
  - [History](#history)

## Current Features

### Choose a documentation type, and type in your search
The extensions adds commands for different types of documentation that allow you to search them in VSCode, and be taken directly to the corresponding entries in your browser (or with the experimental setting enabled, view it in a WebView in VSCode itself):

![Using the command - "Salesforce Reference: Apex"](images/ApexDocLookup2.gif)

The first time you call any of these commands, the Extension will call out to Salesforce to get an index of that documentation type. This will be cached, and future uses of the command will be instant.

#### Available Documentation Types

 - Salesforce Reference: Actions API Developer Guide
 - Salesforce Reference: Ajax Toolkit Developer Guide
 - Salesforce Reference: Ant Migration Tool Guide
 - Salesforce Reference: Apex Developer Guide
 - Salesforce Reference: Apex Reference
 - Salesforce Reference: Aura Components Developer Guide
 - Salesforce Reference: Big Objects Implementation Guide
 - Salesforce Reference: Bulk API 2.0 and Bulk API Developer Guide
 - Salesforce Reference: Classic Console
 - Salesforce Reference: Connect/Chatter REST API Guide
 - Salesforce Reference: Data Loader Guide
 - Salesforce Reference: Field Reference Guide
 - Salesforce Reference: Lightning Console
 - Salesforce Reference: LWC and Aura Component Library (EXPERIMENTAL)
 - Salesforce Reference: Metadata API
 - Salesforce Reference: Metadata Coverage Report
 - Salesforce Reference: Mobile SDK Development Guide
 - Salesforce Reference: Object Reference Guide
 - Salesforce Reference: REST API
 - Salesforce Reference: Secure Coding Guide
 - Salesforce Reference: SFDX CLI Command Reference
 - Salesforce Reference: SFDX CLI Plugin Developer Guide
 - Salesforce Reference: SFDX Developer Guide
 - Salesforce Reference: SOAP API
 - Salesforce Reference: SOQL & SOSL Reference
 - Salesforce Reference: Tooling API
 - Salesforce Reference: Visualforce

### Search dev documentation for a word or selection in your editor
With your cursor over a word in your editor, or with something in your editor selected, you can choose a documentation type and search for that string, using the new command:
 - Salesforce Reference: Search for current word or selection

![Using the command - "Salesforce Reference: Search for current word or selection"](images/CursorWordLookup.gif)

## Invalidating the cache
If you need to invalidate the cache for any reason (e.g. your local documentation index contains outdated entries), there is a command for doing so:
 - Salesforce Reference: Invalidate Cache

## Experimental Features

### EXPERIMENTAL: Load Documentation in a VSCode Tab
Load documentation directly in VSCode. Enable the "Use WebView" option in your Settings to use this. Please note this is in active development, and is not fully supported. If you encounter bugs, please post an issue on github.

![Using the command "Salesforce Reference: SFDX CLI" to access documentation in a VSCode Webview](images/WebviewDoc.gif)

### EXPERIMENTAL: New Command: "Salesforce Reference: LWC and Aura Component Library (EXPERIMENTAL)"
This is a very experimental reference type - the LWC/Aura Component Library is built on an Aura app, quite different to the Angular App and ToC JSON underpinning other documentation. Report any bugs on github if you see them!

### EXPERIMENTAL, ADVANCED: Override Language and Version Settings

There are now experimental, advanced settings for overriding the documentation version and language the commands use.

Examples are listed below.

Generally, you will likely want to avoid using `languageAndVersionPreferences.atlasVersionCode`, or `languageAndVersionPreferences.atlasLanguageCode`,
as this may fail if a particular Salesforce documentation type doesn't exist for that version or language code - in particular for language code, it
appears that Salesforce can take quite a while to release `ja-jp` translations of their docs. When left unspecified, the latest version will be retrieved,
using `en-us`

Instead, favour using `languageAndVersionPreferences.perAtlasBasedDocType` if you require overrides.

At some point in future, this functionality will likely be updated to "pre-check" whether versions/languages specified are available, but for now, be aware
you can break it fairly easily. You can always erase any broken settings though, to go back to the default behaviour of retrieving the latest English content.

Cached values are cached per language/version combination.

```json
{
  "vscode-salesforce-doc-lookup.EXPERIMENTAL.ADVANCED.languageAndVersionPreferences.atlasVersionCode": "220.0",
  "vscode-salesforce-doc-lookup.EXPERIMENTAL.ADVANCED.languageAndVersionPreferences.atlasLanguageCode": "en-us",
  "vscode-salesforce-doc-lookup.EXPERIMENTAL.ADVANCED.languageAndVersionPreferences.metadataCoverageReportVersionCode": "46",
  "vscode-salesforce-doc-lookup.EXPERIMENTAL.ADVANCED.languageAndVersionPreferences.perAtlasBasedDocType": {
      "APEX_DEV_GUIDE": {
          "languageCode": "ja-jp"
      },
      "TOOLING_API": {
          "versionCode": "230.0"
      },
      "SFDX_CLI_PLUGINS": {
          "versionCode": "220.0"
      },
      "MOBILE_SDK": {
          "versionCode": "220.0",
          "languageCode": "ja-jp"
      },
      "API_ACTION": {
          "versionCode": "230.0"
      },
      "SFDX_DEV": {
          "versionCode": "220.0",
          "languageCode": "ja-jp"
      },
      "SOQL_SOSL": {
          "versionCode": "220.0",
          "languageCode": "ja-jp"
      },
      "CONNECT_CHATTER_API": {
          "versionCode": "220.0",
          "languageCode": "ja-jp"
      },
      "FIELD_REFERENCE": {
          "versionCode": "220.0"
      },
      "SECURE_CODING_GUIDE": {
          "versionCode": "220.0"
      }
  }
}
```

## Installing

### In VSCode or the Extension Marketplace
Search for "Salesforce Reference" in the Extensions view (Ctrl + Shift + X) in VSCode, or install at [our VSCode Extension Marketplace page](https://marketplace.visualstudio.com/items?itemName=oblongmana.vscode-salesforce-doc-lookup)

### Manually
VSIX files are available in the Version History tab of the [Marketplace listing](https://marketplace.visualstudio.com/items?itemName=Oblongmana.vscode-salesforce-doc-lookup)

## Known Issues

### Adblockers and loading links in Browser - NOFIX:
Because Salesforce's Doc website is an Angular app that dynamically loads content into the page after the page itself has loaded, anchor links
appear to be managed in such a way that the Angular app (rather than the browser) handles the scrolling to the requested item.
e.g. https://developer.salesforce.com/docs/atlas.en-us.apexref.meta/apexref/apex_methods_system_string.htm#apex_System_String_substring - the
section after the `#` is the anchor link, trying to take you directly to substring. This Salesforce Angular App functionality may play a little
poorly with some adblockers such as "uBlock Origin". If you find commands are not scrolling you to the item you request, this may be fixed
by disabling your adblocker on the Salesforce doc site, if you are comfortable with doing so.


## Notable Differences to the original Sublime Text 3 version

See [DIFFERENCES.md](DIFFERENCES.md) for information on the differences between this and the original plugin. Also note the [Current Features](#current-features) list above.


## Release Notes
See [CHANGELOG.md](CHANGELOG.md)


## Roadmap
A rough roadmap is available at [ROADMAP.md](ROADMAP.md)


## Contributing

See the Roadmap in [ROADMAP.md](ROADMAP.md) for details on existing aims. Some not-particularly-tidy notes can be found in NOTES.md. Contributions welcome, though I suggest
opening an issue ticket on github to discuss before hand.


## Design Notes
Notes on design, future aims etc available in [NOTES.md](NOTES.md)


## License

Salesforce Reference VSCode Extension

Copyright (c) 2014-2020 James Hill me@jameshill.io

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see http://www.gnu.org/licenses/.


## Credits

All Salesforce Documentation is © Copyright 2000–2020 salesforce.com, inc.

Thanks to [Marco Zeuli](https://github.com/maaaaarco) for his contributions in the [original repo](https://github.com/Oblongmana/sublime-salesforce-reference) to making extra types of documentation available in the plugin

Credit to [Luke McFarlane](https://github.com/lukemcfarlane) for the inspiration!

## History

A port of my original [plugin for Sublime Text](https://github.com/Oblongmana/sublime-salesforce-reference)
