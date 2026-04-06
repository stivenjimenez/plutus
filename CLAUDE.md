# Plutus — Personal Finance Manager

## Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: CSS Modules (no Tailwind)
- **Data fetching**: SWR
- **Forms**: React Hook Form
- **Tables**: TanStack Table v8

## Conventions

### Styling
- Use CSS Modules exclusively. Every component has its own `Component.module.css` file.
- No inline styles, no global utility classes.

### Data fetching
- Use SWR for all client-side data fetching.
- API routes live under `src/app/api/`.

### Forms
- Use React Hook Form for all forms. No uncontrolled inputs outside of it.

### Tables
- Use TanStack Table for any data table. Define columns outside the component.

### File structure
```
src/
  app/
    (auth)/     # Login y registro (sin app shell)
    (app)/      # Páginas protegidas con sidebar
    api/        # Route handlers Next.js
  components/
    ui/         # Componentes de UI reutilizables
    layout/     # App shell, Sidebar
    features/   # Componentes por dominio (categories, budget, etc.)
  hooks/        # Hooks SWR: useCategories, useBudget, useTransactions, etc.
  lib/
    supabase/   # client.ts (browser) y server.ts (route handlers)
    currency.ts # formatCOP(amount) → "$ 1.200.000"
    dates.ts    # getCurrentYearMonth(), getMonthLabel(), etc.
    constants.ts # Labels para enums (billing_cycle, debt_type, etc.)
    fetcher.ts  # Fetcher compartido para SWR
  types/        # index.ts re-exporta todos los tipos de dominio
```

## Setup inicial (una vez)

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Copia las credenciales en `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
3. Ejecuta las migraciones SQL del plan en el SQL Editor de Supabase Studio (tablas en orden: categories → budgets → budget_categories → transactions → subscriptions → debts)
4. `npm run dev`

## Moneda
- COP (Peso colombiano). Siempre usar `formatCOP(amount)` de `@/lib/currency`.
- Los montos se almacenan como números enteros en COP (sin decimales).

## Auth
- Supabase Auth (email/password).
- El middleware en `src/middleware.ts` protege todas las rutas no-auth.
- El layout `(app)/layout.tsx` verifica la sesión en el servidor.

## Deudas — campos clave
- `annual_interest_rate`: TEA (Tasa Efectiva Anual) en %
- `monthly_interest_rate`: TEM (Tasa Efectiva Mensual) en %
- `cut_off_day` / `payment_due_day`: días del mes para tarjetas de crédito
- `is_paid_off`: soft delete — marcar como pagada en vez de borrar
- `utilization_pct`: calculado en cliente (`current_balance / credit_limit * 100`), no almacenado
