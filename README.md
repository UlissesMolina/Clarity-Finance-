# Finance Dashboard

A personal finance tracking web app that visualizes income, expenses, and transaction history with interactive charts, budgets, and month-based filtering.

## Tech stack

- **React 19** + **TypeScript**
- **Vite** for build and dev server
- **GraphQL** (Apollo Client) with client-side schema and resolvers
- **Recharts** for balance, spending-by-category, and sparkline charts
- **date-fns** for date handling; **Lucide React** icons; **Radix UI** for dialogs

## Features

- **Dashboard** — Overview cards (income, expense, net, transaction count with sparklines), balance-over-time chart, transactions table, budget pace, spending insights
- **Transactions** — Full history with search, filters, category edit, export (CSV/PDF), detail modal
- **Analytics** — Spending by category (pie chart), detailed breakdown, month-over-month comparison
- **Budgets** — Category budgets, over-budget alerts, budget table and velocity card
- **Calendar** — Month view with daily income/expense, day drill-down and transaction list
- **Settings** — Account (name, email), **currency** (USD, EUR, GBP, JPY, CAD), date format, preferences, **color theme** (Default, Ocean, Sunset, Slate). Changes apply and persist only when you click **Save**.
- **Landing page** — Hero, feature sections, “Built with” tech strip, interactive analytics preview chart

Data is served via a client-side GraphQL layer (mock data); no backend required.

## Getting started

```bash
npm install
npm start
```

Runs the app at [http://localhost:5173](http://localhost:5173).

**Scripts**

| Command           | Description              |
|-------------------|--------------------------|
| `npm start`       | Start dev server (Vite)   |
| `npm run build`  | Production build → `build/` |
| `npm run preview`| Preview production build |
| `npm test`       | Run tests (Vitest)       |

## Project structure

- `src/` — React app
  - `pages/` — LandingPage, Dashboard
  - `components/` — layout, dashboard, transactions, analytics, budgets, calendar, settings, landing
  - `contexts/` — SettingsContext (currency, color theme, save)
  - `constants/` — color theme definitions
  - `graphql/` — schema, resolvers, queries, client
  - `types/`, `utils/` — types, formatters, date helpers

- `public/` — static assets and `index.html`
