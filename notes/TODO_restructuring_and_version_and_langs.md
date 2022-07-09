# Restructuring, adding Version config, and lang config (2022-07)
Notes to self 🕵️‍♂️

## Aims
- Hoping to restructure things to be less locked in generally
  - not only less locked in to Atlas/Aura doc types,
  - but also potentially less locked in to Salesforce itself, for easier reuse on some other side projects
- Want to make sure reference items are as portable as possible, in particular:
  - Need to be able to generically call the (names TBD) getUrl() and getHtml() methods without knowledge of subclass/impl. Gives us max flexibility if we e.g. want to combine lists in future without type checks and other nonsense
  - The cached data needs to be uniformly serializable/deserializable regardless of type, if possible, though there are necessarily some compromises/oddities. The simple and likely way to do this is to break our data out into a Memento (as in the pattern) that can be generated from/rehydrated into, that is much like our existing QuickPickItem based class - but without any extra implementation specific TOP-LEVEL data. Instead, implementation specific stuff can go into a KV store called "data" that the base memento has
    - The ReferenceItem can be as complicated as it likes, but the ReferenceItemMemento should have a uniform definition
- Add support for alternate languages where possible - Certainly for Apex Dev doc, SF have historically produce ja-jp, though they appear to be 2 releases behind at the moment!
- Add support for alternate SF API versions where possible (e.g. v54 = 236, so apex atlas is atlas.en-us.236.0.apexref.meta)

## TODO (not exhaustive, just making sure some things I don't want to forget are written down!)
- [X] Expose Version and Lang as config.
  - Making the choice not to allow this per request as this puts too too many menus between the user and the doc
  - [ ] ❓ However, I'd like to also include commands for quickly modifying this preference without needing to find it in the settings, for version switching on the fly
    - Maybe in future. The config system is fine for now
- [ ] Work out how to notify users of change sensibly for the major version upgrade. 90% sure they've added that ability since I last looked however many years ago
- [ ] Run through the other doc types and add them as options

## Nice to have at some point
- [ ] ❓ Would be good to signal to the user when the last retrieve date for a doc type was, possibly also the version it was retrieved in
  - Given that the approach taken is to cache entries per lang/version combo, this is significantly less necessary. The only thing this would help with now is if Salesforce updates actual ToC entries (not content, but actually modifying ToC entries) outside of release schedule. This is certainly possible, but significantly less likely to be a problem for users than what this was originally contemplating - which was retrieving the ToC in an old version, and having busted or missing entries when trying to access those ToC entries against a newer live version