# Nothing Design — Platform Mapping

Este proyecto usa **CSS Modules** + **Next.js App Router**. Este archivo documenta cómo aplicar el sistema Nothing en este contexto específico.

---

## CSS Modules (este proyecto)

### Fuentes
Ya cargadas en `src/app/layout.tsx` via `next/font/google`:
- `--font-geist-sans` → rol de Space Grotesk (body/UI)
- `--font-geist-mono` → rol de Space Mono (datos/labels)

Para Doto (dot-matrix display) si se necesita en el futuro:
```css
/* En globals.css o en el componente que lo use */
@import url('https://fonts.googleapis.com/css2?family=Doto:wght@100..900&display=swap');
```

### Variables CSS
Todos los tokens viven en `src/app/globals.css` dentro de `:root`.
Usar siempre `var(--token-name)` — nunca valores hardcodeados.

```css
/* ✅ Correcto */
background: var(--color-surface-1);
font-size: var(--text-sm);
padding: var(--space-4);

/* ❌ Incorrecto */
background: #161616;
font-size: 14px;
padding: 16px;
```

### Dark mode
La app es **siempre dark**. No hay `prefers-color-scheme`. El `color-scheme: dark` está declarado en `html` dentro de `globals.css`.

### Estructura de un CSS Module nada-style

```css
/* ComponentName.module.css */

/* Contenedor principal */
.container {
  background: var(--color-base);
  padding: var(--space-8);
}

/* Card */
.card {
  background: var(--color-surface-1);
  border: var(--space-px) solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  transition: var(--transition-colors);
}
.card:hover { border-color: var(--color-border-strong); }

/* Label de sección — monospace ALL CAPS */
.label {
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  font-weight: var(--weight-semibold);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--color-text-tertiary);
}

/* Valor principal — monospace si es número */
.value {
  font-family: var(--font-mono);
  font-size: var(--text-2xl);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-tight);
  color: var(--color-text-primary);
}

/* Valor secundario */
.meta {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  font-family: var(--font-mono);
}
```

### Checklist antes de entregar un componente

- [ ] ¿Todos los colores son tokens? (ningún hex hardcodeado)
- [ ] ¿Todos los tamaños son rem via tokens? (ningún px excepto borders de 1px → `var(--space-px)`)
- [ ] ¿Los labels/headers usan `font-mono` + uppercase + tracking-widest?
- [ ] ¿Los números/montos usan `font-mono`?
- [ ] ¿No hay sombras (`box-shadow`) ni gradientes?
- [ ] ¿Hay `transition: var(--transition-colors)` en elementos interactivos?
- [ ] ¿El hover solo ilumina border/text, sin scaling?
- [ ] ¿El acento (`--color-accent`) aparece máximo una vez en la pantalla?
