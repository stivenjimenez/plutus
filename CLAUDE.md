# Plutus — Plataforma de gestión de vida

## Stack

- **Framework**: Next.js (App Router, Turbopack)
- **Lenguaje**: TypeScript
- **Estilos**: CSS Modules — sin Tailwind, sin estilos inline, sin clases globales
- **Datos**: SWR (hooks en `src/hooks/`)
- **Formularios**: React Hook Form — sin inputs no controlados
- **Tablas**: TanStack Table v8 — columnas siempre definidas fuera del componente

## Arquitectura modular

La app soporta múltiples módulos de vida. Cada módulo vive bajo su propio prefijo de ruta.

```
src/app/(app)/
  finance/        # Módulo de finanzas (dashboard, budget, transactions, etc.)
  <modulo>/       # Futuros módulos siguen el mismo patrón
```

Para agregar un módulo nuevo:
1. Crear `src/app/(app)/<modulo>/` con sus páginas
2. Agregar una entrada al array `MODULES` en `src/components/layout/Sidebar/Sidebar.tsx`

## Estructura de archivos

```
src/
  app/
    (auth)/           # Login y registro (sin app shell)
    (app)/            # Páginas protegidas con sidebar
      finance/        # Módulo finanzas
    api/              # Route handlers
  components/
    layout/Sidebar/   # Sidebar modular
    features/         # Componentes por dominio
  hooks/              # useCategories, useBudget, useTransactions, etc.
  lib/
    supabase/         # client.ts (browser), server.ts (route handlers)
    currency.ts       # formatCOP(amount) → "$ 1.200.000"
    dates.ts          # getCurrentYearMonth(), getMonthLabel(), etc.
    constants.ts      # Labels para enums
    fetcher.ts        # Fetcher compartido para SWR
  types/              # index.ts re-exporta todos los tipos de dominio
```

## Sistema de diseño — Nothing Phone

**La app es siempre dark. No existe light mode.**

Antes de escribir cualquier CSS, leer `src/app/globals.css` — ahí están todos los tokens de color, tipografía, espaciado, radios y transiciones.

Reglas no negociables:
- **Solo tokens CSS** — cero valores hardcodeados (`#fff`, `16px`, `6px`, etc.)
- **Todo en `rem`** a través de los tokens `--space-*` y `--text-*`
- **Cero inline styles** — si necesitas color semántico, agrega una clase CSS
- **Cero sombras, cero gradientes, cero skeleton loaders**
- **Botones siempre** `border-radius: var(--radius-full)` + `font-family: var(--font-mono)` + `text-transform: uppercase` + `letter-spacing: var(--tracking-widest)`
- **Labels de formulario** siempre `font-family: var(--font-mono)` + `font-size: var(--text-2xs)` + `text-transform: uppercase` + `letter-spacing: var(--tracking-widest)` + `color: var(--color-text-tertiary)`
- **Datos numéricos** (montos, fechas, porcentajes) siempre `font-family: var(--font-mono)`

### Skill `/nothing-design` — cuándo invocarlo

Usa `/nothing-design` **siempre que vayas a**:

| Tarea | Por qué el skill |
|-------|-----------------|
| Crear una página nueva | Establece jerarquía Primary/Secondary/Tertiary antes de escribir CSS |
| Crear un componente nuevo (card, formulario, tabla, modal) | El skill tiene los patrones CSS exactos listos para copiar |
| Rediseñar una página existente | Audita violaciones del sistema y propone la corrección correcta |
| Revisar si un componente cumple el estándar | Incluye checklist de calidad Nothing |
| No estar seguro de qué token usar | El skill tiene `references/tokens.md` con todos los valores |

El skill vive en `.claude/skills/nothing-design/` e incluye:
- `SKILL.md` — filosofía y workflow
- `references/tokens.md` — colores, tipografía, espaciado, motion
- `references/components.md` — cards, botones, inputs, tablas, navegación (CSS listo para usar)
- `references/platform-mapping.md` — cómo traducir los patrones a CSS Modules

### Referencias del lenguaje visual Nothing

- [Nothing OS 4 — Figma community](https://www.figma.com/community/file/1522241292456514986/nothing-os-4) — UI kit comunitario, el más completo y actualizado
- [Nothing Design Guidelines for Developers](https://nothing.community/d/15469-nothing-design-guidelinesmanual-for-developers) — hilo oficial de la comunidad Nothing con guías para devs
- [Glyph Interface & Nothing OS — Medium](https://medium.com/design-bootcamp/nothings-new-glyph-interface-and-nothing-os-is-a-breath-of-fresh-air-7effcf10a60a) — análisis detallado del lenguaje visual
- [nothing-design-skill — GitHub](https://github.com/dominikmartn/nothing-design-skill) — skill de Claude Code para generar UI en Nothing design language

## Moneda y dominio

- COP (Peso colombiano). Siempre usar `formatCOP(amount)` de `@/lib/currency`.
- Montos almacenados como enteros en COP (sin decimales).
- Deudas: `is_paid_off` es soft delete. `utilization_pct` se calcula en cliente, no se almacena.

## Auth

- Supabase Auth (correo/contraseña).
- `src/middleware.ts` protege todas las rutas no-auth.
- `(app)/layout.tsx` verifica sesión en servidor.

## Setup (una vez)

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Llenar `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
3. Ejecutar SQL de las 6 tablas en Supabase Studio (orden: categories → budgets → budget_categories → transactions → subscriptions → debts)
4. `npm run dev`
