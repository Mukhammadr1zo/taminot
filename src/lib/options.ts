import type { Dataset, Locale } from '../types'
import type { Option } from '../components/MultiSelect'
import { MONTHS_RU, MONTHS_UZ } from './format'

export interface FilterOptions {
  plan: Option[]
  nomenk: Option[]
  rod_vag: Option[]
  status: Option[]
  park: Option[]
  go: Option[]
  st_from: Option[]
  st_to: Option[]
  year: Option[]
  month: Option[]
  rju: Option[]
  parkCat: Option[]
}

function planLabel(s: string): string {
  if (s.startsWith('ДП')) return 'ДП (' + s.replace('ДП', '') + ')'
  return s
}

/** Dataset bo'yicha bir o'tishda barcha filtr variantlari + umumiy sonlar. */
export function buildOptions(d: Dataset, locale: Locale): FilterOptions {
  const dims = d.meta.dims
  const cPlan = new Array(dims.plan.length).fill(0)
  const cNom = new Array(dims.nomenk.length).fill(0)
  const cRod = new Array(dims.rod_vag.length).fill(0)
  const cStatus = new Array(dims.status.length).fill(0)
  const cPark = new Map<number, number>()
  const cGo = new Map<number, number>()
  const cSf = new Map<number, number>()
  const cSt = new Map<number, number>()
  const cYear = new Map<number, number>()
  const cMonth = new Array(13).fill(0)
  const cRju = new Array(8).fill(0)
  const cParkCat = new Array(4).fill(0)

  for (let i = 0; i < d.n; i++) {
    cPlan[d.plan[i]]++
    cNom[d.nomenk[i]]++
    cRod[d.rod_vag[i]]++
    cStatus[d.status[i]]++
    cPark.set(d.park[i], (cPark.get(d.park[i]) || 0) + 1)
    cGo.set(d.go[i], (cGo.get(d.go[i]) || 0) + 1)
    cSf.set(d.st_from[i], (cSf.get(d.st_from[i]) || 0) + 1)
    cSt.set(d.st_to[i], (cSt.get(d.st_to[i]) || 0) + 1)
    cYear.set(d.year[i], (cYear.get(d.year[i]) || 0) + 1)
    cMonth[d.month[i]]++
    cRju[d.rju[i]]++
    cParkCat[d.parkCat[i]]++
  }

  const idxOpts = (labels: string[], counts: number[], map?: (s: string) => string): Option[] =>
    labels
      .map((label, value) => ({ value, label: map ? map(label) : label, count: counts[value] }))
      .filter((o) => o.count > 0)
      .sort((a, b) => (b.count || 0) - (a.count || 0))

  const mapOpts = (labels: string[], counts: Map<number, number>): Option[] =>
    Array.from(counts.entries())
      .map(([value, count]) => ({ value, label: labels[value], count }))
      .sort((a, b) => b.count - a.count)

  const months = locale === 'ru' ? MONTHS_RU : MONTHS_UZ
  const monthOpts: Option[] = []
  for (let m = 1; m <= 12; m++) if (cMonth[m] > 0) monthOpts.push({ value: m, label: months[m - 1], count: cMonth[m] })

  const yearOpts: Option[] = Array.from(cYear.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([value, count]) => ({ value, label: String(value), count }))

  const rjuOpts: Option[] = []
  for (let r = 0; r <= 7; r++) if (cRju[r] > 0) rjuOpts.push({ value: r, label: r === 0 ? '0 / —' : 'РЖУ ' + r, count: cRju[r] })

  const parkCatLabels = d.meta.parkCatLabels
  const parkCatOpts: Option[] = []
  for (let c = 0; c <= 3; c++)
    if (cParkCat[c] > 0) parkCatOpts.push({ value: c, label: parkCatLabels[String(c)]?.[locale] || String(c), count: cParkCat[c] })

  return {
    plan: idxOpts(dims.plan, cPlan, planLabel),
    nomenk: idxOpts(dims.nomenk, cNom),
    rod_vag: idxOpts(dims.rod_vag, cRod),
    status: idxOpts(dims.status, cStatus),
    park: mapOpts(dims.park, cPark),
    go: mapOpts(dims.go, cGo),
    st_from: mapOpts(dims.st_from, cSf),
    st_to: mapOpts(dims.st_to, cSt),
    year: yearOpts,
    month: monthOpts,
    rju: rjuOpts,
    parkCat: parkCatOpts,
  }
}
