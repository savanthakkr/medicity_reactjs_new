# Frontend Team Guide

This guide defines the default implementation style for building new modules quickly and consistently.

## Goal

The team should be able to build many modules fast without creating a codebase that becomes hard to review or hard to change later.

## What Stays Inline

Keep these directly inside page components:

- local form state
- local table state such as `page`, `pageSize`, `search`, `sortConfig`
- submit handlers with plain `try/catch/finally`
- page-specific success and error toasts
- page-specific validation
- page-specific business rules

Use inline code when abstraction would make the page harder to read.

## What Goes to `services/`

Put API calls in `src/data/apis/services/`.

Service files should own:

- endpoint paths
- request methods
- payload shape
- API naming

Each module should ideally expose:

- `moduleListApi`
- `moduleDetailsApi`
- `createModuleApi`
- `updateModuleApi`
- `deleteModuleApi`
- `updateModuleStatusApi`

## Which Utilities To Use

Use small shared helpers only when they reduce obvious repetition.

Preferred utilities:

- `getErrorMessage(error, fallback)`
- `getApiMessage(response, fallback)`
- `unwrapApiData(response)`
- `unwrapApiList(response)`
- `toOptions(list, config)`

Use small hooks only when they stay obvious:

- `useAutoRevalidate`
- `usePaginationResetOnEmptyPage`

## When To Use `useAutoRevalidate`

Use it for:

- list pages
- edit/detail reads
- lookup/dropdown data
- server data that may need refresh via `mutate()`

Do not force it for every async operation.

Do not use it for:

- create actions
- update actions
- delete actions
- one-off mutation workflows

Those should remain inline with normal `try/catch/finally`.

## Recommended Page Pattern

### List page

1. local state for pagination/search/sort/filter
2. `useAutoRevalidate(...)` for list data
3. small inline handlers for delete/status/search/filter
4. `CommonTable`
5. `TableLayout`

### Add/Edit page

1. local form state
2. edit-mode read with `useAutoRevalidate(...)` or simple `useEffect`
3. inline submit handler
4. `FormLayout`

## What To Avoid

- generic CRUD hooks for single-page flows
- generic mutation wrappers when they increase code size
- moving too much page logic into utilities
- mixing many async styles in one file
- direct endpoint calls in many pages when a service file exists

## Extraction Rule

Extract only when:

- the same code exists in 3 or more places
- the behavior is the same
- the shared version is easier to understand than the duplicated version

If not, duplicate the small code and keep the page simple.
