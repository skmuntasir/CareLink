# CareLink – Client

React + Vite + Tailwind frontend for CareLink.

```bash
npm install
cp .env.example .env     # set VITE_API_URL / VITE_SOCKET_URL
npm run dev              # http://localhost:5173
npm run build            # production build into dist/
npm run lint
```

## UI architecture

| Path | Purpose |
| --- | --- |
| `src/index.css` | Theme tokens (CSS variables) for light & dark, global styles |
| `tailwind.config.js` | Maps tokens to semantic colours: `bg-surface`, `text-fg`, `text-muted`, `border-line`, `brand-*` |
| `src/components/ui/` | Primitives: Button, Card, Badge, Input/Select/Textarea, Modal, Alert, Tabs, Avatar, StatCard, Pagination, Loaders… |
| `src/components/layout/` | `AppShell` (sidebar + topbar), `AuthLayout`, role navigation in `nav.js` |
| `src/context/UIContext.jsx` | `useUI()` → `toast`, `confirm()`, `prompt()` (replaces `alert/confirm/prompt`) |
| `src/pages/dashboard/` | Role-based dashboards (patient / doctor / admin) |
| `src/utils/format.js`, `status.js` | Date/time/money formatting and status → badge mappings |

Use semantic tokens instead of hard-coded colours so both themes keep working, e.g. `bg-surface text-fg border-line`.
