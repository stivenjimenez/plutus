const formatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function formatCOP(amount: number): string {
  return formatter.format(amount)
}

export function parseCOP(value: string): number {
  const cleaned = value.replace(/[^0-9,-]/g, '').replace(',', '.')
  return parseFloat(cleaned) || 0
}
