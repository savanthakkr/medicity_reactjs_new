import { createStore } from 'jotai';

// A single shared Jotai store so non-React code (e.g. the axios layer)
// can read/write atoms. The same instance is passed to <Provider> in main.jsx.
export const store = createStore();
