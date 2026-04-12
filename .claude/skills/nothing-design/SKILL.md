---
name: nothing-design
description: Aplica el sistema de diseño Nothing Phone al proyecto Plutus. Úsalo cuando quieras diseñar o rediseñar componentes, páginas o UI siguiendo la estética Nothing — monochrome, tipográfico, industrial. CSS Modules con tokens del proyecto.
---

# Nothing-Inspired UI/UX Design System

**Scope:** CSS Modules (no Tailwind, no inline styles). Siempre usar tokens de `src/app/globals.css` como base.

---

## Design Philosophy

**Core principle:** Subtraction. Remove until what remains is essential.

- **Structure as ornament** — layout and spacing create visual interest, not decoration
- **Monochromatic first** — grayscale hierarchy; color only to signal meaning
- **Typography-driven** — type scale and weight carry the hierarchy
- **Industrial warmth** — precise and systematic, but never cold
- **Asymmetrical balance** — deliberate imbalance over centered symmetry

---

## Craft Rules

### Three-layer hierarchy
Every screen has exactly three levels:
1. **Primary** — hero content (the one thing the user came to see)
2. **Secondary** — context and supporting information
3. **Tertiary** — metadata, timestamps, labels

### Font discipline
- Maximum 2 font families per screen
- Maximum 3 type sizes
- Maximum 2 font weights
- **Display (Doto):** solo para 36px+ hero numbers y dot-matrix motifs
- **Body/UI (Space Grotesk):** todo el resto
- **Data/Labels (Space Mono):** números, montos, fechas, labels ALL CAPS

### Spacing logic
- **Tight (4–8px):** elementos dentro de un componente
- **Medium (16px):** padding estándar, gaps entre elementos
- **Wide (32–48px):** separación entre secciones
- **Vast (64–96px):** breathing room para hero sections

### Color hierarchy
- Grayscale para el 95% de la UI
- Rojo (`--accent`) solo como "signal light": estado activo crítico, destructivo, urgente — **uno por pantalla máximo, nunca decorativo**
- Success/warning para datos financieros

### Container strategy
Preferir espacio sobre bordes y sombras. Usar borders solo para estructura intencional, nunca decorativa. Cero sombras.

---

## Anti-patterns — Prohibido

- Gradientes
- Sombras (box-shadow, drop-shadow)
- Skeleton loaders
- Toast notifications (usar inline status text)
- Ilustraciones
- Iconos rellenos (filled)
- Parallax o scroll-jacking
- Spring easing o bounce
- Tablas con zebra striping
- Múltiples colores de acento simultáneos

---

## Workflow

1. **Declarar fuentes** — verificar que Geist Sans, Geist Mono están disponibles (ya están en el proyecto vía `--font-sans` y `--font-mono`)
2. **Elegir modo** — siempre dark en este proyecto
3. **Bosquejar jerarquía** — identificar Primary / Secondary / Tertiary antes de escribir CSS
4. **Componer** — spacing primero, borders después, color al final
5. **Verificar tokens** — todo valor debe referenciar un token de `src/app/globals.css`
6. **Construir componentes** — ver `references/components.md`

---

## Referencias
- `references/tokens.md` — colores, tipografía, espaciado, motion
- `references/components.md` — cards, botones, inputs, tablas, navegación
- `references/platform-mapping.md` — implementación específica para CSS Modules
