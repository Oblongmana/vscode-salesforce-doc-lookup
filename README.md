# Salesforce Reference Extension for VSCode

Search Salesforce Documentation entries in VSCode, and open them in your browser.

_Beta Extension - Not yet released to Marketplace_

This is a re-implementation of my old ST3 extension in VSCode: (https://github.com/Oblongmana/sublime-salesforce-reference). See the Roadmap below
for details on aims. Notes can be found in NOTES.md. Contributions welcome, though I suggest opening an issue ticket on github to discuss before hand.

_**Please Note**: this is a community-made plugin, and is not affiliated with Salesforce. If the extension breaks,
please open a github issue to let me know, there's a chance Salesforce may change it's doc approach, necessitating
an update to the plugin_

Repository Home: (https://github.com/Oblongmana/vscode-salesforce-doc-lookup)

<!-- omit in toc -->
## Table of Contents
- [Installing](#installing)
- [Current Features](#current-features)
  - [Choose a documentation type, and type in your search](#choose-a-documentation-type-and-type-in-your-search)
  - [Search dev documentation for a word or selection in your editor](#search-dev-documentation-for-a-word-or-selection-in-your-editor)
- [Known Issues](#known-issues)
  - [Adblockers and loading links - NOFIX:](#adblockers-and-loading-links---nofix)
- [Notable Differences to the original ST3 version](#notable-differences-to-the-original-st3-version)
  - [No "All Doc" search that covers all documentation types](#no-all-doc-search-that-covers-all-documentation-types)
  - [Notable Change - More search results!](#notable-change---more-search-results)
  - [Notable Change - Potential to include EVEN MORE search results](#notable-change---potential-to-include-even-more-search-results)
- [Roadmap](#roadmap)
  - [Removed from roadmap](#removed-from-roadmap)
- [Design Notes](#design-notes)
- [Release Notes](#release-notes)
  - [Unpublished](#unpublished)
  - [0.3.0 - Beta](#030---beta)
  - [0.2.0 - Beta](#020---beta)
  - [0.1.1 - Beta](#011---beta)
- [License](#license)
- [Credits](#credits)

## Installing

Currently this is in pre-release, and is not published to the VSCode Marketplace. You can still install it however! Note that you will not automatically receive updates. Keep an eye on the release page for updates (or the Trineo Slack, if
you work there). This will eventually be released to the Marketplace - see the [Roadmap](#roadmap).

Go to https://github.com/Oblongmana/vscode-salesforce-doc-lookup/releases and download your desired version as a vsix file.

Using the Install from VSIX command in the Extensions view command drop-down, or the Extensions: Install from VSIX command in the Command Palette, point to the .vsix file.

Alternatively, install it using the following command, and **RESTART VSCode AFTERWARDS**.

    code --install-extension [path to the downloaded vsix]

Alternatively, you can build it yourself, but instructions for that are outside the scope of this README.

## Current Features

### Choose a documentation type, and type in your search

![Using the command - "Salesforce Reference: Apex"](images/ApexDocLookup2.gif)

The following new commands allow you to search Salesforce Dev documentation in VSCode, and be taken directly to the corresponding entries in your browser:
 - Salesforce Reference: Apex
 - Salesforce Reference: Visualforce
 - Salesforce Reference: Lightning Console
 - Salesforce Reference: Classic Console
 - Salesforce Reference: Metadata API

The first time you call any of these commands, the Extension will call out to Salesforce to get an index of that documentation type. This will be cached, and future uses of the command will be instant.

If you need to invalidate the cache for any reason, there is a command for doing so:
 - Salesforce Reference: Invalidate Cache

### Search dev documentation for a word or selection in your editor

![Using the command - "Salesforce Reference: Search for current word or selection"](images/CursorWordLookup.gif)

With your cursor over a word in your editor, or with something in your editor selected, you can choose a documentation type and search for that string, using the new command:
 - Salesforce Reference: Search for current word or selection


## Known Issues

### Adblockers and loading links - NOFIX:
Because Salesforce's Doc website is an Angular app that dynamically loads content into the page after the page itself has loaded, anchor links
appear to be managed in such a way that the Angular app (rather than the browser) handles the scrolling to the requested item.
e.g. https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_methods_system_string.htm#apex_System_String_substring - the
section after the `#` is the anchor link, trying to take you directly to substring. This Salesforce Angular App functionality may play a little
poorly with some adblockers such as "uBlock Origin". If you find commands are not scrolling you to the item you request, this may be fixed
by disabling your adblocker on the Salesforce doc site, if you are comfortable with doing so.

## Notable Differences to the original ST3 version

### No "All Doc" search that covers all documentation types
The All Doc Types search is gone - caching has been added, so the performance on this won't be horrific. However, this will need some examination
of internal structure, and examination of how the breadcrumb is presented, and is currently a lower priority feature in the [Roadmap](#roadmap).

### Notable Change - More search results!
The original plugin gave a list of certain nodes at a relatively low level of detail, due to technical limitations in Sublime -
e.g. searching for "String" in the Apex Doc would give you "String Methods". As in VSCode we can now show a breadcrumb in the picker, the same search will now
produce "String Class", "String Methods", and all of the actual methods under these headers!

### Notable Change - Potential to include EVEN MORE search results
Now that the VSCode version of the extension has opened up what you can access (see above bullet point), there's the question of whether other
documentation should be opened up - rather than just limiting ourselves to the technical component/method/etc kind of reference. If you feel
passionately about this, feel free to open an issue - including your ideas on how this might be implemented without swamping our technical results.
Or maybe, providing evidence that it won't swamp our results - I haven't tested that!


## Roadmap
In rough priority order
- [X] Implement Basic Visualforce Reference
- [X] Implement Basic Lightning Console Reference
- [X] Implement Basic Classic Console Reference
- [X] Implement Basic Metadata Reference
- [X] DRYing pass at the code - lots of pasta in there at the moment
- [X] Restructure the code - it's a big hacky pile, because it was from a hack session
- [X] Implement some kind of on-load caching, as the old ST3 plugin had
- [X] Implement selection-based searching - where you can search for the thing that you've selected in an editor
- [X] Look into cursor-word-based searching - where you can search for the word that's under your cursor, e.g. using https://code.visualstudio.com/api/references/vscode-api#TextDocument.getWordRangeAtPosition with https://code.visualstudio.com/api/references/vscode-api#TextEditor
- [X] Fix loading popup not converting the doctype name properly for console doctypes - due to underscore in name
- [X] Add an Icon (cf. https://code.visualstudio.com/api/references/extension-manifest)
- [X] Review Icon usage within the plugin - mostly in the breadcrumb
- [X] Examine our responsibilities around elegantly handling offline state, bearing in mind caching, but also limited connectivity detection capability (https://github.com/microsoft/vscode/issues/73094) (fixed by JIT showing decent errors)
- [ ] Update README for Marketplace release
- [ ] Publish publicly
- [ ] Implement ALL DOC searching - combine all the things together. Will be extremely reliant on caching existing, but also some backend and UX issues
- [ ] Examine possibility of alternative languages - see the notes in NOTES.md. Oriented towards a different end, but could likely be used for allowing user to switch to JP mode
- [ ] Consider whether to expand into some of the non-technical documentation
- [ ] Take a pass over the code to reduce `: any` usage
- [ ] Bundle the extension to reduce size (https://code.visualstudio.com/api/working-with-extensions/bundling-extension)
- [ ] Write some tests 😱
- [ ] Examine the feasibility of displaying doc in VSCode. Want to avoid showing a full-blown web browser ofc.

### Removed from roadmap
- [ ] Examine feasibility of caching indices in the background on first extension load. Will look at further after release if not easy
  - The retrieve operation is not too bad, and not too time-consuming - as such, we should probably avoid introducing prolonged unexpected loading by retrieving multiple ToCs. When implementing the "ALL" command, we can just pop a courtesy warning that the first time may take a while, if necessary, after checking what's in the globalState already.

## Design Notes
Notes on design, future aims etc available in NOTES.MD

## Release Notes

### Unpublished
- Add an extension icon
- Show error if trying to retrieve reference Tables of Contents while offline, and another message if unexpected errors occur

### 0.3.0 - Beta
- Add a command for searching for the current word, or selected text
- Add caching for documentation so repeated lookups won't require retrieving the index from Salesforce every time
- Add a cache invalidation command
- Better gif for Apex lookup, and one for the new current word/selection command
- Fix names for doc types that could appear in a few places, and tweak some command naming
- Backend fixes - better code reuse and structure

### 0.2.0 - Beta
- Basic implementation of Visualforce Doc Lookup
- Basic implementation of Salesforce Lightning Console Lookup
- Basic implementation of Salesforce Classic Console Lookup
- Basic implementation of Salesforce Metadata Lookup

### 0.1.1 - Beta
- Basic implementation of Apex Doc Lookup

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