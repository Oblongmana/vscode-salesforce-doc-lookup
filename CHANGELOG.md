# Salesforce Reference Extension - Change Log

Notable changes to the Salesforce Reference Extension.

<!-- omit in toc -->
## Table of Contents
- [1.0.0 - Initial Release](#100---initial-release)
- [Unpublished](#unpublished)
- [0.4.0 - Beta](#040---beta)
- [0.3.0 - Beta](#030---beta)
- [0.2.0 - Beta](#020---beta)
- [0.1.1 - Beta](#011---beta)

## 1.0.0 - Initial Release
 - New command: `Salesforce Reference: Apex`
 - New command: `Salesforce Reference: Visualforce`
 - New command: `Salesforce Reference: Lightning Console`
 - New command: `Salesforce Reference: Classic Console`
 - New command: `Salesforce Reference: Metadata API`
 - New command: `Salesforce Reference: Search for current word or selection`
 - New command: `Salesforce Reference: Invalidate Cache`
 - Tables of Contents for each Documentation type are cached after first use. This cache can be wiped by running the `Salesforce Reference: Invalidate Cache` command

## Unpublished
 - All up-to-date

## 0.4.0 - Beta
- Add an extension icon
- Show error if trying to retrieve reference Tables of Contents while offline, and another message if unexpected errors occur

## 0.3.0 - Beta
- Add a command for searching for the current word, or selected text
- Add caching for documentation so repeated lookups won't require retrieving the index from Salesforce every time
- Add a cache invalidation command
- Better gif for Apex lookup, and one for the new current word/selection command
- Fix names for doc types that could appear in a few places, and tweak some command naming
- Backend fixes - better code reuse and structure

## 0.2.0 - Beta
- Basic implementation of Visualforce Doc Lookup
- Basic implementation of Salesforce Lightning Console Lookup
- Basic implementation of Salesforce Classic Console Lookup
- Basic implementation of Salesforce Metadata Lookup

## 0.1.1 - Beta

- Basic implementation of Apex Doc Lookup
