# AGENTS

## Project Goal

This repository exists to produce an installable `@makeablebrand/next-editor` package for use
inside other projects.

## Package-First Rule

- Put reusable editor logic, runtime dependencies, styles, and server helpers in
  `packages/next-editor`.
- Treat `apps/demo` as a consumer of the package, not as the source of truth for
  package functionality.
- Do not solve package requirements by wiring features only into the demo app.
- When a feature should ship to downstream projects, implement it in the package
  and then update the demo to consume that package API.

## Integration Rule

- Favor package APIs that work in a normal installed-app flow.
- Keep app-specific concerns in the consuming app: routes, auth, persistence,
  environment values, and theme overrides.
