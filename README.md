# Medicity Frontend

React + Vite frontend for Medicity.

## Engineering Guides

- Data fetching guidelines: `docs/data-fetching-guidelines.md`
- Frontend team guide: `docs/frontend-team-guide.md`
- Module template: `docs/module-template.md`
- AI agent instructions: `AGENTS.md`

## Requirements

- `Node.js` 18+
- `npm`

## Installation

```bash
npm install
```

## Environment Files

Vite loads env files based on the command mode.

- `.env.development`: used for local development
- `.env.staging`: used for staging builds
- `.env.production`: used for production builds

## Scripts

### Development

```bash
npm run dev
```

Starts the Vite dev server in `development` mode and loads `.env.development`.

### Production Build

```bash
npm run build
```

Creates a production build using `production` mode and loads `.env.production`.

### Staging Build

```bash
npm run build:stage
```

Creates a staging build using `staging` mode and loads `.env.staging`.

### Staging Preview

```bash
npm run stage
```

Builds the app with `.env.staging` and serves the built output locally with Vite preview on port `5000`.

### Production Preview

```bash
npm run prod
```

Builds the app with `.env.production` and serves the built output locally with Vite preview on port `5000`.

### Generic Preview

```bash
npm run preview
```

Previews the latest existing `dist` build with Vite preview.

### Code Quality

```bash
npm run lint
npm run check:errors
npm run format
npm run format:check
```

## Typical Workflow

### Local development

1. Update values in `.env.development` if needed.
2. Run `npm run dev`.
3. Develop and test locally.

### Validate staging build

1. Update values in `.env.staging`.
2. Run `npm run build:stage` to create the staging build.
3. Run `npm run stage` if you want to preview the staging build locally.

### Validate production build

1. Update values in `.env.production`.
2. Run `npm run build`.
3. Run `npm run prod` if you want to preview the production build locally.

## Deployment Notes

- All code is merged into the `dev` branch.
- Dev frontend: `https://dev.medicity.app.redoq.host/login` - pointed with dev branch
- Dev Backend: `https://prasun.api.medicity.redoq.host/` - pointed with dev branch
- Production frontend: `https://medicity.app.redoq.host/` - pointed with main branch
- Production Backend API: `https://staging.api.medicity.redoq.host` - pointed with main branch

## Notes

- `npm run build` and `npm run prod` both use `.env.production`.
- `npm run build:stage` and `npm run stage` both use `.env.staging`.
- `npm run dev` uses `.env.development`.
