export type Locale = 'uz' | 'ru'
export type Theme = 'light' | 'dark'
export type Metric = 'tonna' | 'vagon'
export type Preset = 'none' | 'undone' | 'over' | 'zeroplan'

/** data.json ko'rinishi (xom) */
export interface RawData {
  n: number
  cols: {
    gu12: string[]
    year: number[]
    month: number[]
    plan: number[]
    go: number[]
    nomenk: number[]
    rju: number[]
    st_from: number[]
    st_to: number[]
    rod_vag: number[]
    parkCat: number[]
    park: number[]
    status: number[]
    appDate: string[]
    tPlan: number[]
    tDone: number[]
    vPlan: number[]
    vDone: number[]
  }
}

export interface YearSummary {
  rows: number
  tPlan: number
  tDone: number
  vPlan: number
  vDone: number
  over_tonna_rows: number
  zero_plan_rows: number
}

export interface Meta {
  rowCount: number
  skipped: number
  years: number[]
  parkCatLabels: Record<string, { uz: string; ru: string }>
  dims: {
    plan: string[]
    go: string[]
    nomenk: string[]
    st_from: string[]
    st_to: string[]
    rod_vag: string[]
    park: string[]
    status: string[]
  }
  summary: Record<string, YearSummary>
}

/** Brauzerda tezkor ishlash uchun typed-array ko'rinish */
export interface Dataset {
  n: number
  gu12: string[]
  appDate: string[]
  year: Int16Array
  month: Int8Array
  plan: Int16Array
  go: Int32Array
  nomenk: Int16Array
  rju: Int8Array
  st_from: Int32Array
  st_to: Int32Array
  rod_vag: Int16Array
  parkCat: Int8Array
  park: Int32Array
  status: Int16Array
  tPlan: Float64Array
  tDone: Float64Array
  vPlan: Float64Array
  vDone: Float64Array
  // qidiruv uchun oldindan kichik harfli yorliqlar
  goLower: string[]
  stFromLower: string[]
  stToLower: string[]
  meta: Meta
}

export interface Filters {
  years: number[]
  months: number[]
  plan: number[]
  nomenk: number[]
  rju: number[]
  rod_vag: number[]
  parkCat: number[]
  park: number[]
  go: number[]
  st_from: number[]
  st_to: number[]
  status: number[]
  preset: Preset
  search: string
}

export interface Measures {
  plan: number
  done: number
  count: number
}

/** Bir guruh uchun ikkala metrik */
export interface Group {
  key: number | string
  tPlan: number
  tDone: number
  vPlan: number
  vDone: number
  count: number
}

export interface AggResult {
  count: number
  tPlan: number
  tDone: number
  vPlan: number
  vDone: number
  overRows: number
  zeroPlanRows: number
  byMonth: Group[] // key = year*100+month
  byNomenk: Group[]
  byRodVag: Group[]
  byParkCat: Group[]
  byPark: Group[]
  byRju: Group[]
  byShipper: Group[]
  byStFrom: Group[]
  byStTo: Group[]
  byYear: Group[]
  sankey: { from: number; to: number; t: number; v: number }[]
  byNomenkMonth: { nomenk: number; month: number; t: number; v: number }[]
  sunburst: Map<string, Group> // key = `${rju}${nomenk}${rodVag}`
  histT: number[] // fulfillment bins (tonna)
  histV: number[] // fulfillment bins (vagon)
  scatter: { tp: number; td: number; vp: number; vd: number }[] // namuna
  scatterTotal: number
}
