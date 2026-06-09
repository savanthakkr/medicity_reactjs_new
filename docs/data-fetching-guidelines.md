# Data Fetching Guidelines

This project should use one consistent async data pattern across the frontend.

## Goal

Reduce mixed fetching styles, make components easier to review, and keep endpoint knowledge centralized.

## Rules

### 1. Use `useAutoRevalidate` for read data

Use `useAutoRevalidate` for:

- list pages
- detail pages
- dropdown option loading
- any screen that reads server state and may need refresh or revalidation

Examples:

- table/list API calls
- edit form initial data
- lookup data such as states, zones, departments, leave types

This keeps loading, error handling, and refresh behavior consistent.

## 2. Keep raw endpoints inside service functions

Components should not know API endpoint constants directly when a service wrapper can represent the action.

Preferred:

```js
const { data, loading, mutate } = useAutoRevalidateUserList({ page, limit });
```

Avoid:

```js
useAutoRevalidate(API.USERS.LIST, { page, limit });
http.post(API.USERS.GET(id));
```

Service functions should be the only layer that knows:

- endpoint paths
- request method details
- payload normalization
- response normalization when needed

## 3. Use direct `http.*` only for mutations

Direct `http.post`, `http.put`, `http.patch`, and `http.delete` inside components should be limited to one-off mutations such as:

- create
- update
- delete
- status toggle
- submit action

If the same mutation is used in more than one place, wrap it in a service function.

## 4. Prefer `async/await` over mixed promise chaining

Use:

```js
try {
  const res = await someApi();
} catch (error) {
  ...
}
```

Avoid mixing:

- `await`
- `.then()`
- `.catch()`
- `.finally()`

inside the same feature unless there is a clear reason.

## 5. Do not duplicate response unwrapping in components

Patterns like:

```js
res?.data ?? res;
res?.data?.list || [];
```

should be normalized in the service or hook layer where possible.

Components should mostly consume already-shaped data.

## Preferred Structure

### Read flows

1. Add or reuse a service function in `src/data/apis/services/`
2. Expose a hook-friendly wrapper if needed
3. Load data with `useAutoRevalidate`
4. Use `mutate()` after successful mutations

### Mutation flows

1. Call a service mutation function or `http.*`
2. Show success or error feedback
3. Revalidate affected read data with `mutate()`

## Recommended Examples

### List page

```js
const { data, loading, mutate } = useAutoRevalidate(userListApiKey({ page, limit, search }));
```

### Detail page

```js
const { data, loading } = useAutoRevalidate(userDetailsApiKey(id), {}, 0);
```

### Mutation

```js
const handleDelete = async id => {
	await deleteUserApi(id);
	mutate();
};
```

## What To Avoid

- direct endpoint usage spread across many components
- one page using `useAutoRevalidate` and the next page using raw `http.post` for the same kind of read
- loading dropdowns via ad hoc `useEffect` calls when they are standard reads
- repeated manual loading/error state for simple reads
- silent async failures

## Refactor Priority

When cleaning up older code, do it in this order:

1. list pages
2. detail/edit initial loads
3. shared lookup dropdowns
4. repeated mutation calls

## Current Project Direction

- `useAutoRevalidate` is the standard for read/list/detail loading
- service functions are the only place that should know raw endpoints
- direct `http.*` in components is acceptable only for one-off mutations
