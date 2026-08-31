---
name: testing
description: Use when adding, restructuring, or reviewing tests in Mix Master, especially music-theory utilities, Spotify data mapping, auth, Redux behaviour, React components, and test data.
---

# Mix Master Testing

Optimise for useful confidence and local clarity. Start with the simplest test that proves the behaviour, and add shared infrastructure only when real repetition justifies it.

## Test data

Use a factory when tests repeatedly need to construct the same typed entity or external response shape. A factory supplies predictable defaults, accepts explicit overrides, and returns fresh data. It must not infer relationships or hide the scenario being tested.

Keep values responsible for the assertion visible at the test call site. Use distinctive values where neighbouring fields could be crossed accidentally.

Keep one-off representative data local to its test. Do not create factories for simple values or extract shared scenarios before repetition demonstrates a need.

## Choose the lowest useful level

Test pure calculations and transformations directly. Use Redux, rendered components, or broader integration only when those boundaries are part of the behaviour being proved.

Higher-level tests should verify wiring and user-visible outcomes rather than repeat every lower-level case.

## Prefer observable behaviour

Assert returned values, state changes, rendered output, and user interactions rather than implementation details or calls between application modules.

Mock external boundaries when necessary. Avoid mocking internal collaborators when public behaviour can prove the result.

## Keep tests independent

Give each test fresh mutable data and a fresh Redux store when one is needed. Tests must not depend on execution order or shared mutable application state.

Author expected values independently from the production implementation.

## Validation

Run the narrowest relevant test command first, then run `pnpm check`. Use only `pnpm` and the test runner configured in `package.json`.
