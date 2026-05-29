# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Vue 3 admin dashboard built with **TDesign Vue Next**, **Vite**, **Pinia**, **TypeScript**, and **Vue Router**. It uses a backend-driven dynamic routing system where menus and permissions are fetched from a Spring Boot backend (port 8079). Mock data is available for non-auth APIs via `vite-plugin-mock`.

## Development Commands

```bash
# Start dev server (proxies to backend on port 8079 for auth, port 3000 for other APIs)
npm run dev

# Dev with mock data instead of real backend
npm run dev:mock

# Production build (includes type check)
npm run build

# Test build
npm run build:test

# Static site build
npm run build:site

# Type check only
npm run type-check

# Lint (ESLint + Stylelint + Prettier)
npm run lint
npm run lint:fix
npm run stylelint
npm run stylelint:fix
npm run format

# Pre-commit hooks (format + lint + stylelint)
npm run pre-commit
```

**Node version:** >= 18.18.0. Uses `yarn` (`.yarnrc.yml` present).

## High-Level Architecture

### Auth & Routing Flow

1. **Entry point:** `src/main.ts` → mounts app, imports `src/permission.ts` (route guard)
2. **Route guard (`src/permission.ts`):**
   - White-listed paths (`/login`, `/register`, `/bookmark/zch`, `/error`) bypass auth
   - Authenticated users: fetch user info via `useUserStore().getUserInfo()`, then build dynamic routes via `usePermissionStore().buildAsyncRoutes()`
   - Unauthenticated users: redirect to `/login` with `?redirect=`
   - Backend unavailable: redirects to `/error/service-unavailable`
3. **Static routes** (`src/router/index.ts`): login, homepage modules, fixed modules, **public routes** (bookmark pages), and error routes
4. **Dynamic routes:** fetched from backend at `/api/sys/menu/list-i18n`, transformed by `src/utils/route/index.ts::transformObjectToRoute()`, then added via `router.addRoute()`

### API & Request Layer

- **`src/api/auth.ts`** — Authentication APIs (login, logout, get user, get menus). All auth endpoints are under `/api/auth/` and `/api/sys/`.
- **`src/utils/request/index.ts`** — Axios wrapper (`VAxios`) with:
  - JWT Bearer token injection from `useUserStore().token`
  - Auto-retry (3 attempts, 1s delay)
  - Request/response logging in dev (color-coded: blue=request, green=response, red=error)
  - 401 handling → auto-logout + redirect to login
  - Dev proxy routes: `/api/auth`, `/api/sys`, `/api/bookmark` → `VITE_AUTH_API_TARGET` (port 8079); other `/api/*` → `VITE_API_TARGET` (port 3000)

### State Management (Pinia)

All stores are in `src/store/modules/` and exported from `src/store/index.ts`. Pinia uses `pinia-plugin-persistedstate`.

| Store | Purpose |
|-------|---------|
| `user` | Token, refreshToken, userInfo, roles, permissions. Getter `isAdmin` checks `ROLE_ADMIN`. Getter `isVip` checks `vipExpireTime`. |
| `permission` | White list, dynamic/async routes, backend availability flag. `buildAsyncRoutes()` fetches from backend. `restoreRoutes()` clears on logout. |
| `setting` | Theme (dark/light), layout (side/top), sidebar visibility, colors |
| `tabs-router` | Tab navigation history |
| `notification` | Notification items |

**Note:** `src/store/modules/permission-fe.ts` is an alternative frontend-only role-based permission store (not used by default).

### Permission System

- **Route-level:** Backend returns menu tree; hidden routes set `meta.hidden = true`
- **Button-level:** Custom directives in `src/directives/permission.ts`:
  - `v-permission="'sys:user:add'"` — single permission
  - `v-permission="['sys:user:add', 'sys:user:edit']"` — any of listed permissions
  - `v-permission-all="['sys:user:add', 'sys:user:edit']"` — all required
  - `v-role="'ROLE_ADMIN'"` — single role
  - `v-role="['ROLE_ADMIN', 'ROLE_VIP']"` — any of listed roles
  - `v-role-all="['ROLE_ADMIN', 'ROLE_VIP']"` — all required
- Admin users bypass permission checks (treated as having all permissions)

### Internationalization

- `vue-i18n` with `src/locales/index.ts`
- Languages loaded via `import.meta.glob('./lang/*/index.ts', { eager: true })`
- Supported: `zh_CN`, `en_US`
- Locale key stored in localStorage: `tdesign-starter-locale`
- TDesign component locale synchronized via `t-config-provider` in `App.vue`

### Component & Page Conventions

- **TDesign components** — Use `t-` prefix (e.g., `<t-button>`, `<t-layout>`)
- **Vue SFC block order:** `template`, `script`, `style` (enforced by ESLint)
- **Script lang:** TypeScript required (`lang="ts"`)
- **Style lang:** Less (`lang="less"`)
- **Scoped styles preferred** — `vue-scoped-css/enforce-style-type` enforces `scoped`
- **Component names in template:** kebab-case (`<my-component>`)
- **Custom events:** kebab-case

### Environment Variables

| Variable | Dev default | Purpose |
|----------|-------------|---------|
| `VITE_BASE_URL` | `/` | Base URL for router |
| `VITE_API_URL_PREFIX` | `/api` | API prefix |
| `VITE_AUTH_API_TARGET` | `http://127.0.0.1:8079` | Auth backend proxy target |
| `VITE_API_TARGET` | `http://127.0.0.1:3000` | Other API proxy target |

`.env.development` — local dev. `.env` — production defaults. `.env.release.example` — template for release envs.

### Mock Data

`mock/index.ts` provides mock responses for non-auth endpoints (`/api/get-list`, `/api/get-card-list`, etc.). The menu list mock is **commented out** — menus are always fetched from the real backend.

### Code Style & Tooling

- **ESLint:** `@antfu/eslint-config` with Vue, TypeScript. Custom rules: `no-console: off`, `ts/no-explicit-any: off`, `simple-import-sort/imports: error`, component template casing: kebab-case
- **Prettier:** 120 char width, 2-space indent, single quotes, trailing commas
- **Stylelint:** Standard config with `stylelint-order`
- **Commit:** Conventional commits via `commitizen` + `cz-conventional-changelog`
- **Husky:** Pre-commit runs prettier + eslint + stylelint via `lint-staged`

### Key Directories

- `src/pages/` — Page components (dashboard, form, list, detail, login, user, tools, bookmark, result)
- `src/router/modules/` — Static route modules per feature area
- `src/layouts/` — Layout shell with side/top nav variants, header, content area
- `src/components/` — Shared components (charts, tables, results, etc.)
- `src/hooks/` — Composables (`useChart` for ECharts, `useCounter` for countdown)
- `src/utils/route/` — Dynamic route transformation logic
- `src/utils/request/` — Axios wrapper and cancel token logic
