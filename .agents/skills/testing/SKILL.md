---
name: testing
description: Use when adding, restructuring, or reviewing tests in Mix Master, especially music-theory utilities, Spotify data mapping, auth, URL/history behaviour, React components, and test data.
---

# Mix Master Testing

Optimise for useful confidence and local clarity. Start with the simplest test that proves the behaviour, and add shared infrastructure only when real repetition justifies it.

## Read top-to-bottom

Optimise for reading each test top-to-bottom, with blank lines separating arrange, action and assertions. Parameterise only identical setup, action and assertions with varying data; do not branch on scenario or state labels. Prefer some duplication over a scenario harness.

Extract helpers only for repeated mechanical setup, not domain decisions. Briefly document non-obvious external substitutes and helper modules' ownership, defaults and import-time cleanup or other side effects.

## Name the behaviour

Name tests in plain English as observable behaviour requirements, making deliberate product decisions clear—for example, “changing key notation preserves unfinished recommendation edits”. Names should help readers understand app behaviour, not just identify code being exercised.

This is a readability goal, not a coverage mandate: improve useful tests rather than adding, duplicating, or splitting tests solely to document decisions.

## Test data

Use a factory when tests repeatedly need to construct the same typed entity or external response shape. A factory supplies predictable defaults, accepts explicit overrides, and returns fresh data. It must not infer relationships or hide the scenario being tested.

Keep values responsible for the assertion visible at the test call site. Use distinctive values where neighbouring fields could be crossed accidentally.

Keep one-off representative data local to its test. Do not create factories for simple values or extract shared scenarios before repetition demonstrates a need.

## Choose the lowest useful level

Test pure calculations and transformations directly. Use rendered components or broader integration only when those boundaries are part of the behaviour being proved.

Resource hook suites live in `src/__tests__/queries/`: use real hooks and TanStack QueryClients with external Spotify HTTP substitution, asserting hook output rather than DOM. Keep page, lifecycle, session and pure suites outside that folder.

Higher-level tests should verify wiring and user-visible outcomes rather than duplicate lower-level coverage. Avoid incidental presentation assertions unrelated to the behaviour under test.

## Prefer observable behaviour

Assert returned values, state changes, rendered output, and user interactions rather than implementation details or calls between application modules.

Mock external boundaries when necessary. Avoid mocking internal collaborators when public behaviour can prove the result.

## Keep tests independent

Give each test fresh mutable data, fresh memory history and a fresh QueryClient when needed. Rendering helpers must not start auth. Tests must not depend on execution order or shared mutable application state.

Author expected values independently from the production implementation.

## Validation

Run the narrowest relevant test command first, then run `pnpm check` and `pnpm test`. Use only `pnpm` and the test runner configured in `package.json`.
