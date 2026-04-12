# Nothing Design — Componentes

> Patrones de CSS Modules para el proyecto Plutus. Todos los valores referencian tokens de `src/app/globals.css`.

---

## Cards / Superficies

```css
.card {
  background: var(--color-surface-1);
  border: var(--space-px) solid var(--color-border);
  border-radius: var(--radius-lg);    /* 0.5rem */
  padding: var(--space-5);
}

/* Hover */
.card:hover {
  border-color: var(--color-border-strong);
}

/* Elevación secundaria (modal, dropdown) */
.card-raised {
  background: var(--color-surface-2);
  border: var(--space-px) solid var(--color-border-strong);
  border-radius: var(--radius-xl);    /* 0.75rem */
}
```

**Reglas:** Sin sombras. Sin gradientes. La elevación se comunica solo con el color de superficie.

---

## Botones

```css
/* Primario */
.btn-primary {
  background: var(--color-accent);
  color: var(--color-text-inverse);
  border: none;
  border-radius: var(--radius-full);   /* pill */
  padding: var(--space-2-5) var(--space-6);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  min-height: 2.75rem;
  cursor: pointer;
  transition: var(--transition-opacity);
}
.btn-primary:hover { opacity: 0.85; }

/* Secundario */
.btn-secondary {
  background: none;
  color: var(--color-text-primary);
  border: var(--space-px) solid var(--color-border-strong);
  border-radius: var(--radius-full);
  padding: var(--space-2-5) var(--space-6);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  min-height: 2.75rem;
  cursor: pointer;
  transition: var(--transition-colors);
}
.btn-secondary:hover {
  background: var(--color-surface-2);
  border-color: var(--color-border-strong);
}

/* Ghost */
.btn-ghost {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  cursor: pointer;
  transition: var(--transition-colors);
}
.btn-ghost:hover { color: var(--color-text-primary); }

/* Destructivo */
.btn-danger {
  background: none;
  color: var(--color-danger);
  border: var(--space-px) solid rgba(248, 113, 113, 0.3);
  border-radius: var(--radius-full);
  padding: var(--space-2-5) var(--space-6);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  cursor: pointer;
  transition: var(--transition-colors);
}
.btn-danger:hover { background: var(--color-danger-dim); }
```

---

## Inputs

```css
.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1-5);
}

.field label {
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  font-weight: var(--weight-semibold);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--color-text-tertiary);
}

.field input,
.field select,
.field textarea {
  background: var(--color-surface-3);
  border: var(--space-px) solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-2-5) var(--space-3);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  outline: none;
  transition: var(--transition-colors);
}

.field input:focus,
.field select:focus {
  border-color: var(--color-border-strong);
  background: var(--color-surface-2);
}

/* Input numérico / datos — monospace */
.field input[type="number"] {
  font-family: var(--font-mono);
}

.field .error-msg {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-danger);
}
```

---

## Tablas / Data grids

```css
.tableWrapper {
  border: var(--space-px) solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);
}

.th {
  padding: var(--space-3) var(--space-4);
  text-align: left;
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  font-weight: var(--weight-semibold);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--color-text-tertiary);
  background: var(--color-surface-1);
  border-bottom: var(--space-px) solid var(--color-border);
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}

.td {
  padding: var(--space-3) var(--space-4);
  border-bottom: var(--space-px) solid var(--color-border-subtle);
  color: var(--color-text-primary);
  background: var(--color-surface-1);
  vertical-align: middle;
  transition: var(--transition-colors);
}

/* Valores numéricos en tablas */
.td-number {
  font-family: var(--font-mono);
  text-align: right;
}

.tr:hover .td { background: var(--color-surface-2); }
.tr:last-child .td { border-bottom: none; }
```

---

## Barra de progreso segmentada

Característica signature de Nothing OS — bloques discretos, no barra continua.

```css
.segmentedBar {
  display: flex;
  gap: 2px;
  height: 0.25rem;
}

.segment {
  flex: 1;
  border-radius: var(--radius-xs);
  background: var(--color-surface-3);
  transition: background var(--duration-slow) var(--ease-default);
}

.segment.filled-success { background: var(--color-success); }
.segment.filled-warning { background: var(--color-warning); }
.segment.filled-danger  { background: var(--color-danger); }
.segment.filled-accent  { background: var(--color-accent); }
```

---

## Navegación — sidebar section label

```css
.sectionLabel {
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  font-weight: var(--weight-semibold);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--color-text-tertiary);
  padding: 0 var(--space-2-5) var(--space-2);
  display: block;
}
```

---

## Tags / Chips

```css
.tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2-5);
  border: var(--space-px) solid var(--color-border-strong);
  border-radius: var(--radius-full);
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  font-weight: var(--weight-semibold);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.tag.success { color: var(--color-success); border-color: rgba(74,222,128,0.3); }
.tag.danger  { color: var(--color-danger);  border-color: rgba(248,113,113,0.3); }
.tag.warning { color: var(--color-warning); border-color: rgba(251,191,36,0.3); }
```

---

## Estados vacíos

```css
.emptyState {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-16) var(--space-8);
  text-align: center;
}

.emptyState .dot-grid {
  /* fondo de puntos sutil como decoración */
  background-image: radial-gradient(circle, var(--color-border) 0.5px, transparent 0.5px);
  background-size: 0.75rem 0.75rem;
}

.emptyTitle {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
}
```

---

## Overlay / Modal

```css
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: var(--z-overlay);
  display: flex;
  align-items: flex-end; /* bottom sheet */
  justify-content: center;
}

.modal {
  background: var(--color-surface-1);
  border: var(--space-px) solid var(--color-border);
  border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
  padding: var(--space-8);
  width: 100%;
  max-width: 40rem;
}
```

**Sin toasts.** Usar mensajes de error/estado inline dentro del formulario o componente.
