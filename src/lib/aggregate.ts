import type { AggResult, Dataset, Filters, Group, Metric } from '../types'

const SCATTER_CAP = 6000

function setOrNull(a: number[]): Set<number> | null {
  return a && a.length ? new Set(a) : null
}

function newGroup(key: number | string): Group {
  return { key, tPlan: 0, tDone: 0, vPlan: 0, vDone: 0, count: 0 }
}

function addArr(arr: Group[], key: number, tp: number, td: number, vp: number, vd: number) {
  let g = arr[key]
  if (!g) { g = arr[key] = newGroup(key) }
  g.tPlan += tp; g.tDone += td; g.vPlan += vp; g.vDone += vd; g.count++
}

function addMap(m: Map<number, Group>, key: number, tp: number, td: number, vp: number, vd: number) {
  let g = m.get(key)
  if (!g) { g = newGroup(key); m.set(key, g) }
  g.tPlan += tp; g.tDone += td; g.vPlan += vp; g.vDone += vd; g.count++
}

/** Bajarilish foizi -> histogramma bin indeksi (0..6) */
function fulfillBin(plan: number, done: number): number {
  if (plan === 0) return 0 // Reja=0
  const r = (done / plan) * 100
  if (done === 0) return 1 // 0%
  if (r <= 50) return 2
  if (r <= 75) return 3
  if (r < 99.5) return 4
  if (r <= 100.5) return 5 // 100%
  return 6 // >100% ortiq
}

/** Filtrlash predikati — aggregate va jadval (filterIndices) uchun umumiy. */
export function makePredicate(d: Dataset, f: Filters, metric: Metric): (i: number) => boolean {
  const fYear = setOrNull(f.years)
  const fMonth = setOrNull(f.months)
  const fPlan = setOrNull(f.plan)
  const fNomenk = setOrNull(f.nomenk)
  const fRju = setOrNull(f.rju)
  const fRod = setOrNull(f.rod_vag)
  const fParkCat = setOrNull(f.parkCat)
  const fPark = setOrNull(f.park)
  const fGo = setOrNull(f.go)
  const fSf = setOrNull(f.st_from)
  const fSt = setOrNull(f.st_to)
  const fStatus = setOrNull(f.status)
  const preset = f.preset
  const term = f.search.trim().toLowerCase()
  const isTonna = metric === 'tonna'

  return (i: number): boolean => {
    if (fYear && !fYear.has(d.year[i])) return false
    if (fMonth && !fMonth.has(d.month[i])) return false
    if (fPlan && !fPlan.has(d.plan[i])) return false
    if (fNomenk && !fNomenk.has(d.nomenk[i])) return false
    if (fRju && !fRju.has(d.rju[i])) return false
    if (fRod && !fRod.has(d.rod_vag[i])) return false
    if (fParkCat && !fParkCat.has(d.parkCat[i])) return false
    if (fPark && !fPark.has(d.park[i])) return false
    if (fGo && !fGo.has(d.go[i])) return false
    if (fSf && !fSf.has(d.st_from[i])) return false
    if (fSt && !fSt.has(d.st_to[i])) return false
    if (fStatus && !fStatus.has(d.status[i])) return false
    if (preset !== 'none') {
      const p = isTonna ? d.tPlan[i] : d.vPlan[i]
      const dn = isTonna ? d.tDone[i] : d.vDone[i]
      if (preset === 'undone' && !(p - dn > 0)) return false
      if (preset === 'over' && !(p - dn < 0)) return false
      if (preset === 'zeroplan' && !(p === 0)) return false
    }
    if (term) {
      const hit =
        d.goLower[d.go[i]].includes(term) ||
        d.stFromLower[d.st_from[i]].includes(term) ||
        d.stToLower[d.st_to[i]].includes(term)
      if (!hit) return false
    }
    return true
  }
}

/** Filtrlangan qator indekslari (jadval uchun). */
export function filterIndices(d: Dataset, f: Filters, metric: Metric): number[] {
  const pred = makePredicate(d, f, metric)
  const out: number[] = []
  for (let i = 0; i < d.n; i++) if (pred(i)) out.push(i)
  return out
}

/** Asosiy crossfilter agregatsiyasi — bir o'tishda barcha guruhlar. */
export function aggregate(d: Dataset, f: Filters, metric: Metric): AggResult {
  const pred = makePredicate(d, f, metric)

  const byNomenk: Group[] = []
  const byRodVag: Group[] = []
  const byParkCat: Group[] = []
  const byRju: Group[] = []
  const byMonth = new Map<number, Group>()
  const byYear = new Map<number, Group>()
  const byPark = new Map<number, Group>()
  const byShipper = new Map<number, Group>()
  const byStFrom = new Map<number, Group>()
  const byStTo = new Map<number, Group>()
  const sankeyMap = new Map<string, { from: number; to: number; t: number; v: number }>()
  const nomMonth = new Map<number, { nomenk: number; month: number; t: number; v: number }>()
  const sunburst = new Map<string, Group>()
  const histT = [0, 0, 0, 0, 0, 0, 0]
  const histV = [0, 0, 0, 0, 0, 0, 0]
  const scatter: { tp: number; td: number; vp: number; vd: number }[] = []

  let count = 0, tPlan = 0, tDone = 0, vPlan = 0, vDone = 0, overRows = 0, zeroPlanRows = 0
  let scatterTotal = 0

  const n = d.n
  for (let i = 0; i < n; i++) {
    if (!pred(i)) continue

    const tp = d.tPlan[i], td = d.tDone[i], vp = d.vPlan[i], vd = d.vDone[i]

    // umumiy
    count++
    tPlan += tp; tDone += td; vPlan += vp; vDone += vd
    if (tp - td < 0) overRows++
    if (tp === 0) zeroPlanRows++

    // guruhlar
    addArr(byNomenk, d.nomenk[i], tp, td, vp, vd)
    addArr(byRodVag, d.rod_vag[i], tp, td, vp, vd)
    addArr(byParkCat, d.parkCat[i], tp, td, vp, vd)
    addArr(byRju, d.rju[i], tp, td, vp, vd)
    addMap(byMonth, d.year[i] * 100 + d.month[i], tp, td, vp, vd)
    addMap(byYear, d.year[i], tp, td, vp, vd)
    addMap(byPark, d.park[i], tp, td, vp, vd)
    addMap(byShipper, d.go[i], tp, td, vp, vd)
    addMap(byStFrom, d.st_from[i], tp, td, vp, vd)
    addMap(byStTo, d.st_to[i], tp, td, vp, vd)

    // sankey (stansiya -> stansiya)
    const sk = d.st_from[i] + '>' + d.st_to[i]
    let s = sankeyMap.get(sk)
    if (!s) { s = { from: d.st_from[i], to: d.st_to[i], t: 0, v: 0 }; sankeyMap.set(sk, s) }
    s.t += td; s.v += vd

    // heatmap (yuk x oy, yillar birlashtirilgan)
    const nmk = d.nomenk[i] * 100 + d.month[i]
    let nm = nomMonth.get(nmk)
    if (!nm) { nm = { nomenk: d.nomenk[i], month: d.month[i], t: 0, v: 0 }; nomMonth.set(nmk, nm) }
    nm.t += td; nm.v += vd

    // sunburst (РЖУ -> nomenk -> rod_vag)
    const sbk = d.rju[i] + '|' + d.nomenk[i] + '|' + d.rod_vag[i]
    let sb = sunburst.get(sbk)
    if (!sb) { sb = newGroup(sbk); sunburst.set(sbk, sb) }
    sb.tPlan += tp; sb.tDone += td; sb.vPlan += vp; sb.vDone += vd; sb.count++

    // histogramma
    histT[fulfillBin(tp, td)]++
    histV[fulfillBin(vp, vd)]++

    // scatter namunasi
    scatterTotal++
    if (scatter.length < SCATTER_CAP) scatter.push({ tp, td, vp, vd })
  }

  const compact = (arr: Group[]) => arr.filter(Boolean)
  const fromMap = (m: Map<number, Group>) => Array.from(m.values())

  const byMonthArr = fromMap(byMonth).sort((a, b) => (a.key as number) - (b.key as number))
  const byYearArr = fromMap(byYear).sort((a, b) => (a.key as number) - (b.key as number))

  return {
    count, tPlan, tDone, vPlan, vDone, overRows, zeroPlanRows,
    byMonth: byMonthArr,
    byNomenk: compact(byNomenk),
    byRodVag: compact(byRodVag),
    byParkCat: compact(byParkCat),
    byRju: compact(byRju),
    byPark: fromMap(byPark),
    byShipper: fromMap(byShipper),
    byStFrom: fromMap(byStFrom),
    byStTo: fromMap(byStTo),
    byYear: byYearArr,
    sankey: Array.from(sankeyMap.values()),
    byNomenkMonth: Array.from(nomMonth.values()),
    sunburst,
    histT,
    histV,
    scatter,
    scatterTotal,
  }
}

/** Guruhdan tanlangan metrik bo'yicha {plan, done} olish */
export function gm(g: Group, metric: Metric): { plan: number; done: number } {
  return metric === 'tonna'
    ? { plan: g.tPlan, done: g.tDone }
    : { plan: g.vPlan, done: g.vDone }
}

export function topN(groups: Group[], metric: Metric, n: number): Group[] {
  const key = metric === 'tonna' ? 'tDone' : 'vDone'
  return [...groups].sort((a, b) => (b[key] as number) - (a[key] as number)).slice(0, n)
}
