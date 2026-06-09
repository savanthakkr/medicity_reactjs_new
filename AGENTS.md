# AGENTS.md

This file defines the default working rules for AI agents in this frontend repo.

## Scope

These instructions apply to the entire `medicity_reactjs` project unless a deeper `AGENTS.md` overrides them.

## Primary Goal

Keep the codebase fast to change for a small team shipping many modules quickly.

Optimize for:

- readability
- copyable patterns
- simple debugging
- small utilities
- low review overhead

Do not optimize for:

- deep abstraction
- generic framework-style hooks
- clever indirection
- over-engineering

## Architecture Rules

### Keep page logic readable

Pages should remain easy to understand in one pass.

Preferred page shape:

1. imports
2. local state
3. data loading
4. event handlers
5. table columns or form fields
6. JSX return

### Services own API calls

Raw endpoint usage should live in `src/data/apis/services/`.

Pages should prefer:

- `zoneListApi`
- `zoneDetailsApi`
- `createZoneApi`
- `updateZoneApi`
- `deleteZoneApi`
- `updateZoneStatusApi`

Avoid spreading raw `API.*` mutation calls across many pages when a service file exists.

### Reads vs writes

Use `useAutoRevalidate` for read/list/detail loading when it keeps the page simple.

Keep writes inline with normal `try/catch` when the flow is page-specific.

Do not introduce generic CRUD hooks unless the same exact flow is repeated enough times to clearly reduce complexity.

## Utilities

Prefer these small helpers when useful:

- `getErrorMessage`
- `getApiMessage`
- `unwrapApiData`
- `unwrapApiList`
- `toOptions`
- `usePaginationResetOnEmptyPage`

Do not add large utility layers that hide simple business logic.

## Hooks

Allowed:

- small hooks with one obvious responsibility
- hooks that reduce repeated mechanical boilerplate

Avoid:

- multi-purpose generic workflow hooks
- hooks that make simple pages harder to follow

If a hook makes a file less beginner-friendly, do not use it.

## Preferred Module Pattern

### List page

- local `page`, `pageSize`, `search`, `sortConfig`, `activeFilter`
- `useAutoRevalidate(...)` for read data
- service functions for delete/status mutations
- inline handlers
- `usePaginationResetOnEmptyPage(...)` when needed

### Add/Edit page

- local form state
- edit-mode read via `useAutoRevalidate(...)` or a simple `useEffect`
- inline submit handler with `try/catch/finally`
- service functions for create/update/load

## Extraction Rule

Extract code only when all are true:

1. it appears in 3 or more places
2. the behavior is effectively identical
3. the abstraction is smaller than the duplicated code
4. the result is easier for a junior developer to read

If not, keep it inline.

## Error Handling

Prefer:

- `getErrorMessage(error, fallback)`
- `getApiMessage(response, fallback)`

Do not repeat long optional chains in every file when a small shared helper already exists.

## Review Standard

Changes should:

- match an existing module pattern
- avoid unnecessary new abstractions
- keep diffs focused
- preserve readability for junior developers

When in doubt, choose the simpler file over the more abstract design.
