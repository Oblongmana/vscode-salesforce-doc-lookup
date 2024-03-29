# ROADMAP
A fairly rough roadmap/stream of consciousness :)

- [ROADMAP](#roadmap)
  - [Roadmap](#roadmap-1)
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
- [X] Make tables less impossible to read due to lack of borders (at least in dark themes, not sure on light themes)
- [ ] Possibly support ApexDox? Examining the Sample App repo (https://github.com/no-stack-dub-sack/apexdox-sample-app), a poss approach could be using the `search-idx.js` to build an index: https://github.com/no-stack-dub-sack/apexdox-sample-app/blob/master/sample-docs/assets/search-idx.js, and then for content scraping the generated html - extracting the `id="content"` element to render in the WebView (e.g. https://github.com/no-stack-dub-sack/apexdox-sample-app/blob/master/sample-docs/StopWatch.html#L249).
- [ ] ApexDocs also appears to be actively maintained. https://github.com/cesarParra/apexdocs
- [ ] Pretty sure the old school ApexDoc and any Doxygen approaches (and SfApexDoc https://gitlab.com/StevenWCox/sfapexdoc, though that may still be functional? cf. https://salesforce.stackexchange.com/questions/342293/) are long since out of service with no successors, but may be worth investigating a little more!
- [ ] A strange new Doc Type appears to be emerging - see e.g. https://developer.salesforce.com/docs/marketing/marketing-cloud/overview. This appears to replace e.g. API documentation that was formerly Atlas typed (see e.g. https://developer.salesforce.com/docs/atlas.en-us.mc-apis.meta/ - which is still publically visible, but not exposed on the SF Docs site https://developer.salesforce.com/docs?filter_text=market&lang=en-us&page=1)
- [ ] Use the Progress API for things like retrieval if poss: https://code.visualstudio.com/api/references/vscode-api#Progress, https://github.com/microsoft/vscode-extension-samples/tree/main/progress-sample
- [ ] A "what's new" type tab for updates - if this feature ever ships: https://github.com/microsoft/vscode/issues/102139
- [ ] Cut down size of README
- [ ] Check formatting on CHANGELOG? Doesn't show multiple indent layers in VS Marketplace changelog page. Could just be a quirk of Marketplace though
- [ ] Style \<pre\>/\<code\> blocks in html doc nicely
  - [ ] Likely use Shiki
    - [ ] VSCode unfortunately doesn't give a way to use the user's actual current theme: https://github.com/microsoft/vscode/issues/56356
  - [ ] Dynamic detection of theme with mutators will allow us to swap out say a set of 3 shiki themes: https://stackoverflow.com/a/58695555
    - [ ] LWC doc uses e.g. `<pre><code class="language-javascript">` - can inform us on what lang highlighting to use
- [ ] Also implement LWC Dev Guide Reference - see above
- [ ] VERY Wacky Idea: There is a full JSON index of all DocTypes at GET https://developer.salesforce.com/docs/get_index/en-us/000.0/false/All%20Services/all. This seems to include the props we've been deriving from the get_document info. Will include a sample ToC in ALL_REFERENCES_INDEX.json
  - This might possibly go hand-in-hand with a potential different approach to how we build ToC, which might also dovetail with some possible changes to SF approach (e.g. where they separated Apex Ref from Apex Dev Guide) - rather than drilling down to what I subjectively think is the most important ToC node, we might be able to simply take ALL ToC Nodes. This would need preeeeetty thorough investigation. Would also necessitate a full cache clobber. Also consider usability type issues - would we want to provide EVERY doc type? The content array indicates there's 135 of them as at 2021-07-02!
  - An update to this though as at 2022-07. We could possibly use this at least as the source of our lang and version values - it does enumerate them under `available_languages` and `available_versions`
    - This doesn't mean they're all valid for all doc types, but we could use it to give users options
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
- [ ] See notes on Metadata Coverage, specifically around per-org functionality that are being excluded in first cut. Related to lwc components potential expansion too

## Removed from roadmap
- [ ] Examine feasibility of caching indices in the background on first extension load. Will look at further after release if not easy
  - The retrieve operation is not too bad, and not too time-consuming - as such, we should probably avoid introducing prolonged unexpected loading by retrieving multiple ToCs. When implementing the "ALL" command, we can just pop a courtesy warning that the first time may take a while, if necessary, after checking what's in the globalState already.