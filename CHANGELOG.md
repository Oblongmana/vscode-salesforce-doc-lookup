# Salesforce Reference Extension - Change Log

Notable changes to the Salesforce Reference Extension.

## Table of Contents
- [1.3.3](#133)
- [1.3.1](#131)
- [1.3.0](#130)
- [1.2.0](#120)
- [1.1.0](#110)
- [Unpublished](#unpublished)
- [1.0.0 - Initial Release](#100---initial-release)
- [0.4.0 - Beta](#040---beta)
- [0.3.0 - Beta](#030---beta)
- [0.2.0 - Beta](#020---beta)
- [0.1.1 - Beta](#011---beta)

## 1.3.3
Date: 2022-07-01 (NZ)
### Changed
 - The "Framework Unique ID" (`fwuid`) for Salesforce's Aura/LWC Component Library site has recently changed. As such, this extension update invalidates (only) the "LWC and Aura Component Library" doc cache for re-fetching, and updates the request we send for documentation to reflect the `fwuid` change.

## 1.3.1
Date: 2021-07-08 (NZ)
### Changed
 - Improve legibility of html tables in experimental WebView - uses current theme to provide a contrasting border, gives elements 5px of padding, and collapses cell borders together

## 1.3.0
Date: 2021-07-04 (NZ)
### Added
 - New command: `Salesforce Reference: LWC and Aura Component Library (EXPERIMENTAL)`
  - Note that this is very experimental - the LWC/Aura Component Library is built on an Aura app, quite different to the Angular App and ToC JSON underpinning other documentation. Report any bugs on github if you see them!
 - Enable searching of the Breadcrumb - this will allow even better support for fuzzy matching (e.g. a search for "String Methods" will give a much more full set of results now,  including the methods themselves, not just the containing page)
 - Show a loading indicator when retrieving documentation for the experimental in-VSCode-WebView (also: a reminder that there is now a new experimental setting to enable this - `vscode-salesforce-doc-lookup.EXPERIMENTAL.useWebview`)
### Changed
 - Due to the changes that allow proper Breadcrumb searching, all existing documentation Table of Contents caches will be invalidated automatically on upgrade. These will automatically be retrieved as needed

## 1.2.0
Date: 2021-06-28 (NZ)
### Changed
 - \[RE-ENABLED\] Load documentation directly in VSCode. Enable the "Use WebView" option in your Settings to use this. Please note this is in active development, and is not fully supported. If you encounter bugs, please post an issue on github.
## 1.1.0
Date: 2021-06-28 (NZ)
### Added
 - New command: `Salesforce Reference: Object Reference`
 - New command: `Salesforce Reference: SOAP API`
 - New command: `Salesforce Reference: REST API`
 - New command: `Salesforce Reference: SFDX CLI`
 - EXPERIMENTAL: [DISABLED in patch due to issues with libraries] Load documentation directly in VSCode. Enable the "Use WebView" option in your Settings to use this. Please note this is in active development, and is not fully supported. If you encounter bugs, please post an issue on github.
### Changed
 - Upgrading to or past 1.1.0 will force a refresh of the Apex and Lightning Console cached links - Salesforce has updated the url and structure of these
 - Added version change detection
## Unpublished
 - All up-to-date
## 1.0.0 - Initial Release
### Added
 - New command: `Salesforce Reference: Apex`
 - New command: `Salesforce Reference: Visualforce`
 - New command: `Salesforce Reference: Lightning Console`
 - New command: `Salesforce Reference: Classic Console`
 - New command: `Salesforce Reference: Metadata API`
 - New command: `Salesforce Reference: Search for current word or selection`
 - New command: `Salesforce Reference: Invalidate Cache`
 - Tables of Contents for each Documentation type are cached after first use. This cache can be wiped by running the `Salesforce Reference: Invalidate Cache` command

## 0.4.0 - Beta
### Added
- Add an extension icon
- Show error if trying to retrieve reference Tables of Contents while offline, and another message if unexpected errors occur

## 0.3.0 - Beta
### Added
- Add a command for searching for the current word, or selected text
- Add caching for documentation so repeated lookups won't require retrieving the index from Salesforce every time
- Add a cache invalidation command
### Changed
- Better gif for Apex lookup, and one for the new current word/selection command
### Fixed
- Fix names for doc types that could appear in a few places, and tweak some command naming
- Backend fixes - better code reuse and structure

## 0.2.0 - Beta
### Added
- Basic implementation of Visualforce Doc Lookup
- Basic implementation of Salesforce Lightning Console Lookup
- Basic implementation of Salesforce Classic Console Lookup
- Basic implementation of Salesforce Metadata Lookup

## 0.1.1 - Beta
### Added
- Basic implementation of Apex Doc Lookup
