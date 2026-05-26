# To-Do Web

Next.js 16 (App Router) web client for the To-Do app — pairs with the Expo mobile client in `../todo-mobile` and the Quarkus backend in `../todo-backend`.

## Stack

- Next.js 16 + React 19 + TypeScript + Turbopack
- Tailwind CSS v4 (CSS-first theme tokens ported from mobile gluestack palette)
- TanStack Query v5 — server state
- Zustand — client state (auth, UI)
- Firebase Auth (email/password) with `browserLocalPersistence`
- axios with request/response interceptors (JWT injection, 401 redirect)
- Jest + React Testing Library, Storybook 9, Cypress 16

## Scripts

```bash
npm run dev          # next dev (Turbopack)
npm run build        # next build
npm test             # jest
npm run storybook    # storybook dev -p 6006
npm run cypress:open # cypress UI
```

## Env

Copy `.env.example` to `.env.local` and fill in your Firebase web credentials and the backend URL.

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Routes

| Path                  | Purpose                                       |
| --------------------- | --------------------------------------------- |
| `/login`, `/register` | Auth (public)                                 |
| `/home`               | All todos, pending/done counts, filter        |
| `/categories`         | Lists (create / delete)                       |
| `/categories/[id]`    | List detail + tasks in list                   |
| `/todos/new`          | Create todo (title, priority, lists)          |
| `/todos/[id]`         | Todo detail: toggle, delete, lists, comments  |
| `/search`             | Search across lists + tasks                   |
| `/about`              | Profile + logout                              |

## Architecture

- `src/services/` — `apiClient` (axios singleton + interceptors), `firebase`, `authService`, `todos`, `categories`, `comments`. UI never imports axios directly.
- `src/hooks/queries`, `src/hooks/mutations` — TanStack Query wrappers per domain.
- `src/store/` — `useAuthStore`, `useUiStore`.
- `src/components/ds/` — design-system primitives (Button, Card, Input, Pill, Chip, IconTile, Textarea, Field).
- `src/components/layout/` — `AppShell` + `BottomNav` + `PageHeader`.
- `src/app/(auth)/` — public layout that redirects authed users.
- `src/app/(app)/` — protected layout that gates on Firebase auth.
