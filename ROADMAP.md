# ROADMAP
A fairly rough roadmap/stream of consciousness :)

- [Roadmap](#roadmap)
- [Removed from roadmap](#removed-from-roadmap)

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
- [X] Update README for Marketplace release
- [X] Publish publicly
- [X] Add Object Reference DocType (https://developer.salesforce.com/docs/atlas.en-us.object_reference.meta/object_reference)
- [X] Add REST API DocType (https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest)
- [X] Add SOAP API DocType (https://developer.salesforce.com/docs/atlas.en-us.api.meta/api)
- [X] Add SFDX CLI Command Reference DocType (https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference)
- [X] Wacky ideas: Examine the feasibility of displaying doc in VSCode. Want to avoid showing a full-blown web browser.
- [X] Implement LWC/Aura Component Reference - very different to all other docs - it's a "dogfood" aura app. See the feature branch [feature/lwc-aura-doc](https://github.com/Oblongmana/vscode-salesforce-doc-lookup/tree/feature/lwc-aura-doc) for details
- [X] Show busy when loading raw doc - using the QuickPick `busy` prop
- [X] Examine breadcrumb path searching - e.g. if I search String methods, can I see the actual methods, or just the "String Methods" page? Is there a way to enhance this? Is it desirable? Edit: not sure when this was added, or if was always there, but `matchOnDetail` does exactly this, and looks and feels great.
- [ ] Also implement LWC Dev Guide Reference - see above
- [ ] VERY Wacky Idea: There is a full JSON index of all DocTypes at GET https://developer.salesforce.com/docs/get_index/en-us/000.0/false/All%20Services/all. This seems to include the props we've been deriving from the get_document info. Will include a sample ToC in ALL_REFERENCES_INDEX.json
  - This might possibly go hand-in-hand with a potential different approach to how we build ToC, which might also dovetail with some possible changes to SF approach (e.g. where they separated Apex Ref from Apex Dev Guide) - rather than drilling down to what I subjectively think is the most important ToC node, we might be able to simply take ALL ToC Nodes. This would need preeeeetty thorough investigation. Would also necessitate a full cache clobber. Also consider usability type issues - would we want to provide EVERY doc type? The content array indicates there's 135 of them as at 2021-07-02!
- [ ] The QuickPick appears to accept a list of Promise<string> as an alternative to a list of plain strings, and shows a loading bouncer on that basis. Can we use that to remove the toast popup when dealing with uncached doc
- [ ] Improve WebView approach, especially noting it's currently locked to ver 232
- [ ] Examine possibility of alternative languages - see the notes in NOTES.md. Oriented towards a different end, but could likely be used for allowing user to switch to JP mode
- [ ] Is there an index of the Atlases? E.g. a further ToC file, maybe on a Doc home page? That could possibly simplify identifying future doc candidates and possible gaps
- [ ] Examine current state for each doc type: what's available as search options, vs what's viewable in SF. May raise questions of what non-technical doc to expose in this extension?
- [ ] Add Field Reference DocType (https://developer.salesforce.com/docs/atlas.en-us.sfFieldRef.meta/sfFieldRef)
- [ ] Implement ALL DOC searching - combine all the things together. Will be extremely reliant on caching existing, but also some backend and UX issues. Reasonable chance this is a non-starter, esp as support for other doc types grows
- [ ] Consider whether to expand into some of the non-technical documentation
- [ ] Take a pass over the code to reduce `: any` usage
- [ ] Bundle the extension to reduce size (https://code.visualstudio.com/api/working-with-extensions/bundling-extension)
- [ ] Write some tests 😱
- [ ] Wacky ideas: Also examine the feasibility of some sort of offline mode

## Removed from roadmap
- [ ] Examine feasibility of caching indices in the background on first extension load. Will look at further after release if not easy
  - The retrieve operation is not too bad, and not too time-consuming - as such, we should probably avoid introducing prolonged unexpected loading by retrieving multiple ToCs. When implementing the "ALL" command, we can just pop a courtesy warning that the first time may take a while, if necessary, after checking what's in the globalState already.