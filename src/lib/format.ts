const nf0 = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })
const nf1 = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 })
const nf2 = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 })

export function fmtInt(v: number): string {
  return nf0.format(Math.round(v || 0))
}
export function fmt1(v: number): string {
  return nf1.format(v || 0)
}
export function fmt2(v: number): string {
  return nf2.format(v || 0)
}

/** Katta sonni qisqartirish: 1 234 567 -> 1.23M */
export function fmtShort(v: number): string {
  const a = Math.abs(v || 0)
  if (a >= 1e9) return nf2.format(v / 1e9) + ' mlrd'
  if (a >= 1e6) return nf2.format(v / 1e6) + ' mln'
  if (a >= 1e3) return nf1.format(v / 1e3) + ' ming'
  return nf0.format(v || 0)
}

/** To'liq, aniq son (mingliklar ajratkichi bilan, yaxlitlamasdan) */
export function fmtFull(v: number): string {
  return nf2.format(v || 0)
}

/**
 * Metrikaga qarab qiymat: vagon -> ANIQ butun son (yaxlitlamasdan/qisqartirmasdan),
 * tonna -> qisqartirilgan (mln/ming).
 */
export function fmtVal(v: number, metric: 'tonna' | 'vagon'): string {
  return metric === 'vagon' ? fmtInt(v) : fmtShort(v)
}

export function fmtPct(done: number, plan: number): string {
  if (!plan) return '—'
  return nf1.format((done / plan) * 100) + '%'
}

export function pct(done: number, plan: number): number {
  if (!plan) return 0
  return (done / plan) * 100
}

/** "2209 (8828868) - NOMI" -> "NOMI" (chart yorlig'i uchun) */
export function shortLabel(s: string): string {
  if (!s) return ''
  const idx = s.indexOf(' - ')
  let r = idx >= 0 ? s.slice(idx + 3) : s
  r = r.replace(/^["'`«]+|["'`»]+$/g, '').trim()
  return r || s
}

export function truncate(s: string, n = 28): string {
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}

export function monthKey(ym: number): string {
  const y = Math.floor(ym / 100)
  const m = ym % 100
  return `${String(m).padStart(2, '0')}.${y}`
}

export const MONTHS_UZ = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek']
export const MONTHS_RU = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
