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
- [ ] Implement ALL DOC searching - combine all the things together. Will be extremely reliant on caching existing, but also some backend and UX issues
- [ ] Examine possibility of alternative languages - see the notes in NOTES.md. Oriented towards a different end, but could likely be used for allowing user to switch to JP mode
- [ ] Consider whether to expand into some of the non-technical documentation
- [ ] Take a pass over the code to reduce `: any` usage
- [ ] Bundle the extension to reduce size (https://code.visualstudio.com/api/working-with-extensions/bundling-extension)
- [ ] Write some tests 😱
- [ ] Wacky ideas: Examine the feasibility of displaying doc in VSCode. Want to avoid showing a full-blown web browser. Also examine the feasibility of some sort of offline mode

## Removed from roadmap
- [ ] Examine feasibility of caching indices in the background on first extension load. Will look at further after release if not easy
  - The retrieve operation is not too bad, and not too time-consuming - as such, we should probably avoid introducing prolonged unexpected loading by retrieving multiple ToCs. When implementing the "ALL" command, we can just pop a courtesy warning that the first time may take a while, if necessary, after checking what's in the globalState already.