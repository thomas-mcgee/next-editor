# @makeablebrand/next-editor

## 0.1.2

### Patch Changes

- Add a page-only import API and shipped JSON template for moving page content into `ne_content`.
- Document how to generate a config-specific import template and run an import script from a consuming app.
- Fix import `merge` mode to use a plain database read path instead of a request-oriented Next cache helper.
- Add collection import helpers, validation, and a shipped reference JSON template for importing custom collection entries into `ne_collection_entries`.

## 0.1.1

### Patch Changes

- Rename the package to `@makeablebrand/next-editor` and add release automation with Changesets and GitHub Actions.
