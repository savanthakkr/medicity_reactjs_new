# Module Template

Use this as the default pattern for new CRUD-style modules.

## Files

Typical module files:

- `src/data/apis/services/<module>.js`
- `src/pages/.../<Module>List.jsx`
- `src/pages/.../Add<Module>.jsx`

## Service File

Service file should export:

```js
export const moduleListApi = (...) => ...
export const moduleDetailsApi = (id) => ...
export const createModuleApi = (payload) => ...
export const updateModuleApi = (id, payload) => ...
export const deleteModuleApi = (id) => ...
export const updateModuleStatusApi = (id, value) => ...
```

## List Page Checklist

- local `page`
- local `pageSize`
- local `search`
- local `sortConfig`
- local `activeFilter` if needed
- `useAutoRevalidate(...)`
- `usePaginationResetOnEmptyPage(...)` if needed
- inline delete handler
- inline status handler
- `TableLayout`
- `CommonTable`

## Add/Edit Page Checklist

- local form state
- `isEdit`
- edit-mode data load
- inline submit handler
- `getErrorMessage(...)`
- `getApiMessage(...)`
- `FormLayout`

## Keep It Simple

If you can understand the page in one screen without opening five helper files, the structure is probably correct.
