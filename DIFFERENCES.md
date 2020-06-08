# Notable Differences to the original Sublime Text 3 version

- [No "All Doc" search that covers all documentation types](#no-all-doc-search-that-covers-all-documentation-types)
- [Notable Change - More search results!](#notable-change---more-search-results)
- [Notable Change - Potential to include EVEN MORE search results](#notable-change---potential-to-include-even-more-search-results)

## No "All Doc" search that covers all documentation types
The All Doc Types search is gone - caching has been added, so the performance on this won't be horrific. However, this will need some examination
of internal structure, and examination of how the breadcrumb is presented, and is currently a lower priority feature in the [Roadmap](#roadmap).

## Notable Change - More search results!
The original plugin gave a list of certain nodes at a relatively low level of detail, due to technical limitations in Sublime -
e.g. searching for "String" in the Apex Doc would give you "String Methods". As in VSCode we can now show a breadcrumb in the picker, the same search will now
produce "String Class", "String Methods", and all of the actual methods under these headers!

## Notable Change - Potential to include EVEN MORE search results
Now that the VSCode version of the extension has opened up what you can access (see above bullet point), there's the question of whether other
documentation should be opened up - rather than just limiting ourselves to the technical component/method/etc kind of reference. If you feel
passionately about this, feel free to open an issue - including your ideas on how this might be implemented without swamping our technical results.
Or maybe, providing evidence that it won't swamp our results - I haven't tested that!
