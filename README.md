# VSCode Salesforce Doc Lookup

_Pre-release Extension_

Repository Home: (https://github.com/Oblongmana/vscode-salesforce-doc-lookup)

This is a re-implementation of my old ST3 extension in VSCode: (https://github.com/Oblongmana/sublime-salesforce-reference). See the Roadmap below
for details on aims. Notes can be found in NOTES.md. Contributions welcome, though I suggest opening an issue ticket on github to discuss before hand.

_**Please Note**: this is a community-made plugin, and is not affiliated with Salesforce. If the extension breaks,
please open a github issue here to let me know, there's a chance Salesforce may change it's doc approach, necessitating
an update to the plugin_

<!-- omit in toc -->
## Table of Contents
- [Current Features](#current-features)
  - [Lookup Apex Reference Documentation](#lookup-apex-reference-documentation)
- [Limitations, Known Issues, and Notable Differences to the original ST3 version](#limitations-known-issues-and-notable-differences-to-the-original-st3-version)
- [Roadmap](#roadmap)
- [Design Notes](#design-notes)
- [Release Notes](#release-notes)
  - [[Unreleased]](#unreleased)
- [License](#license)
- [Credits](#credits)

## Current Features
### Lookup Apex Reference Documentation

Adds a new command: "Salesforce Reference: Apex"

![Using the command - "Salesforce Reference: Apex"](images/ApexDocLookup.gif)

## Limitations, Known Issues, and Notable Differences to the original ST3 version
1. Because Salesforce's Doc website is Angular app that dynamically loads content into the page after the page itself has loaded, anchor links
    appear to be managed in such a way that the Angular app (rather than the browser) handles the scrolling to the requested item.
    e.g. https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_methods_system_string.htm#apex_System_String_substring - the
    section after the `#` is the anchor link, trying to take you directly to substring. This Salesforce Angular App functionality may play a little
    poorly with some adblockers such as "uBlock Origin". If you find commands are not scrolling you to the item you request, this may be fixed
    by disabling your adblocker on the Salesforce doc site, if you are comfortable with doing so.
2. There's no caching yet - every time you run a command, it retrieves the relevant doc table of contents from scratch. Adding caching is on the [Roadmap](#roadmap)
3. The original plugin gave a list of certain nodes at a relatively low level of detail, due to technical limitations in Sublime -
    e.g. searching for "String" in the Apex Doc would give you "String Methods". As in VSCode can now show a breadcrumb in the picker, the same search will now
    produce "String Class", "String Methods", and all of the actual methods under these headers!
4. The All Doc Types search is gone - this won't be reimplemented until caching is added - performance would be horrifying, in addition to needing a more
    sophisticated breadcrumb strategy.


## Roadmap
- [ ] Implement Basic Visualforce Reference
- [ ] Implement Basic Service Console Reference
- [ ] Implement Basic Metadata Reference
- [ ] Implement some kind of on-load caching, as the old ST3 plugin had
- [ ] Implement context-based searching - where you can search for the thing that's under your cursor in your editor
- [ ] Write some tests 😱
- [ ] Implement ALL DOC searching - combine all the things together. Will be extremely reliant on caching existing
- [ ] Examine the feasibility of displaying doc in VSCode. Want to avoid showing a full-blown web browser ofc.

## Design Notes
Notes on design, future aims etc available in NOTES.MD

## Release Notes

### [Unreleased]
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