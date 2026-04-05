# @makeablebrand/next-editor

## 0.1.7

### Patch Changes

- Add incoming collection support for public form submissions, restore grouped admin navigation with admin-only Material Symbols icons, and document the new package APIs and setup requirements.

## 0.1.6

### Patch Changes

- Republish the prepared release changes at the next available patch version.

## 0.1.5

### Patch Changes

- Add configurable admin dashboard links, improve the live-site rich text sidebar editor with a stripped-down Lexxy toolbar, and update transitive dependency overrides to address audit vulnerabilities.

## 0.1.4

### Patch Changes

- Improve admin UX with linked collection/page titles, add Brevo-powered password resets and Turnstile login protection, and fix first-load admin theme rendering after sign-in.

## 0.1.3

### Patch Changes

- Add JSON import support for custom collections, including config-shaped templates, strict field validation, and import helpers for `ne_collection_entries`.

## 0.1.2

### Patch Changes

- Add a page-only import API and shipped JSON template for moving page content into `ne_content`.
- Document how to generate a config-specific import template and run an import script from a consuming app.
- Fix import `merge` mode to use a plain database read path instead of a request-oriented Next cache helper.
- Add collection import helpers, validation, and a shipped reference JSON template for importing custom collection entries into `ne_collection_entries`.

## 0.1.1

### Patch Changes

- Rename the package to `@makeablebrand/next-editor` and add release automation with Changesets and GitHub Actions.
