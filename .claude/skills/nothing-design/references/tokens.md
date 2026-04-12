# Nothing Design — Tokens

> Los tokens del proyecto viven en `src/app/globals.css`. Este archivo documenta el sistema de diseño Nothing y cómo mapea a los tokens del proyecto.

---

## Tipografía

### Stack de fuentes

| Rol | Fuente | Fallback | Uso |
|-----|--------|----------|-----|
| **Display** | `"Doto"` | `var(--font-mono)` | Hero numbers, dot-matrix — solo 36px+ |
| **Body / UI** | `"Space Grotesk"` | `var(--font-sans)` | Todo el contenido |
| **Datos / Labels** | `"Space Mono"` | `var(--font-mono)` | Números, montos, fechas, labels ALL CAPS |

> En este proyecto: `--font-sans` (Geist Sans) cumple el rol de Space Grotesk, y `--font-mono` (Geist Mono) cumple el rol de Space Mono. Son de la misma familia de diseño (Colophon Foundry / Vercel).

### Escala tipográfica

| Token del proyecto | Tamaño | Line Height | Letter Spacing | Uso |
|-------------------|--------|-------------|----------------|-----|
| `--text-3xl` | 2.25rem (36px) | 1.1 | `--tracking-tight` | Títulos hero, números display |
| `--text-2xl` | 1.875rem (30px) | 1.1 | `--tracking-tight` | KPIs principales |
| `--text-xl` | 1.5rem (24px) | 1.2 | `--tracking-tight` | Títulos de página |
| `--text-lg` | 1.25rem (20px) | 1.3 | 0 | Valores de card |
| `--text-md` | 1.125rem (18px) | 1.3 | 0 | Subtítulos |
| `--text-base` | 1rem (16px) | 1.5 | 0 | Body text |
| `--text-sm` | 0.875rem (14px) | 1.5 | 0.01em | Secondary body, celdas |
| `--text-xs` | 0.75rem (12px) | 1.4 | `--tracking-wide` | Timestamps, footnotes |
| `--text-2xs` | 0.625rem (10px) | 1.2 | `--tracking-widest` | Labels ALL CAPS monospace |

### Reglas tipográficas

- **Doto / display:** solo para números hero 36px+, tracking negativo
- **Labels:** `font-family: var(--font-mono)`, uppercase, `letter-spacing: var(--tracking-widest)`, `--text-2xs` o `--text-xs`
- **Datos / montos:** siempre `font-family: var(--font-mono)`
- **Unidades:** tamaño `--text-xs`, ligeramente elevadas, nunca más prominentes que el valor

---

## Sistema de color

### Paleta dark (modo del proyecto)

| Token del proyecto | Hex | Rol |
|-------------------|-----|-----|
| `--color-base` | `#080808` | Fondo OLED — capa más profunda |
| `--color-surface-0` | `#0F0F0F` | Sidebar / shell |
| `--color-surface-1` | `#161616` | Cards — primera elevación |
| `--color-surface-2` | `#1E1E1E` | Hover / superficie secundaria |
| `--color-surface-3` | `#262626` | Inputs / chips |
| `--color-text-primary` | `#F0F0F0` | Body text |
| `--color-text-secondary` | `#A0A0A0` | Labels, captions, metadata |
| `--color-text-tertiary` | `#606060` | Elementos deshabilitados, decorativos |
| `--color-border` | `rgba(255,255,255,0.07)` | Divisores sutiles |
| `--color-border-strong` | `rgba(255,255,255,0.14)` | Borders intencionales, focused |
| `--color-accent` | `#E8E8E8` | Acento blanco frío — estado activo |

> **Nota:** El sistema Nothing original usa rojo `#D71921` como acento. En este proyecto el acento es blanco frío `#E8E8E8` — mantiene la filosofía de "signal light único" pero con la identidad de Plutus.

### Semánticos

| Token del proyecto | Hex | Uso |
|-------------------|-----|-----|
| `--color-success` | `#4ADE80` | Ingresos, balance positivo, confirmado |
| `--color-danger` | `#F87171` | Gastos, sobregirado, errores |
| `--color-warning` | `#FBBF24` | Deudas, precaución |
| `--color-info` | `#60A5FA` | Informativo |

**Regla:** El color se aplica al **valor numérico**, no al label ni al background. Los labels mantienen `--color-text-secondary` siempre.

---

## Espaciado

| Token | Valor | Uso |
|-------|-------|-----|
| `--space-px` | 0.0625rem (1px) | Borders hairline |
| `--space-1` | 0.25rem (4px) | Ajuste óptico, icon-to-label |
| `--space-2` | 0.5rem (8px) | Padding interno de componente |
| `--space-3` | 0.75rem (12px) | Padding compacto |
| `--space-4` | 1rem (16px) | Padding estándar, gaps |
| `--space-5` | 1.25rem (20px) | Padding generoso |
| `--space-6` | 1.5rem (24px) | Separación entre grupos |
| `--space-8` | 2rem (32px) | Márgenes de sección |
| `--space-10` | 2.5rem (40px) | Separación mayor |
| `--space-12` | 3rem (48px) | Breaks de sección mayores |
| `--space-16` | 4rem (64px) | Ritmo vertical de página |

---

## Motion e interacción

- **Duración micro:** `--duration-fast` (80ms) — feedback inmediato
- **Duración base:** `--duration-base` (150ms) — transiciones de color
- **Duración lenta:** `--duration-slow` (250ms) — entradas de componentes
- **Easing:** `--ease-default: cubic-bezier(0.16, 1, 0.3, 1)` — snappy, sin bounce
- **Estrategia:** Opacity transitions > posición. Los elementos aparecen, no se deslizan.
- **Hover:** Border o texto se ilumina. Sin scaling, sin sombras.

---

## Dot-matrix motif

```css
/* Fondo sutil de puntos */
.dot-grid {
  background-image: radial-gradient(circle, var(--color-border-strong) 1px, transparent 1px);
  background-size: 1rem 1rem;
}

/* Versión ultra sutil */
.dot-grid-subtle {
  background-image: radial-gradient(circle, var(--color-border) 0.5px, transparent 0.5px);
  background-size: 0.75rem 0.75rem;
}
```

- Diámetro del punto: 1–2px
- Espaciado: 12–16px uniforme
- Opacidad: 0.1–0.2 para fondos decorativos
- **Prohibido:** en borders de containers, en botones
