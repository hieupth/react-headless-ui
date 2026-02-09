# Quality Laws (Authoritative)

These laws are non-negotiable. If a request conflicts with any law, refuse and cite the law ID.

## LAW-ARCH-001: Composition Only
Inheritance for UI components is forbidden. Use composition and behavior mixins only.

## LAW-ARCH-002: Immutable Theme Extensions
Theme extensions must be immutable. Use copy/clone patterns and never mutate theme objects in place.

## LAW-A11Y-001: Semantic-First by Default
Every interactive element must provide semantic roles and accessible names. No component should render without a valid accessible name or semantics.

## LAW-EXAMPLE-001: Shadcn-Style Example App
The example app must follow the shadcn UI layout and UX pattern:
- Left navigation sidebar with categories
- Top-level search and command palette
- Component pages showing usage, variants, and code snippets
- Clean, documentation-first layout

## LAW-TEST-001: Strict Test Coverage
Every component must have a complete set of strict tests as defined in `TESTING.md`. No component may be released without full coverage.

## LAW-TEST-002: Tests Must Be Deterministic
No flaky sleeps without justification. Prefer explicit waits and deterministic assertions.

## LAW-TEST-003: Zero Console Errors
Any console error or JavaScript exception is a test failure.

## LAW-DOCS-001: Documentation is Required
All public components must be documented in the example app and in package-level docs.
