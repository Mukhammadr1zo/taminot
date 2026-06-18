import { create } from 'zustand'
import type { Filters, Locale, Metric, Preset, Theme } from '../types'

export type DrillKey =
  | 'year' | 'month' | 'day' | 'plan' | 'nomenk' | 'rju' | 'rod_vag'
  | 'parkCat' | 'park' | 'go' | 'st_from' | 'st_to' | 'status'
export type DrillCriteria = Partial<Record<DrillKey, number>>
export interface Drill { title: string; criteria: DrillCriteria }

const DRILL_TO_FILTER: Record<DrillKey, keyof Filters> = {
  year: 'years', month: 'months', day: 'days', plan: 'plan', nomenk: 'nomenk',
  rju: 'rju', rod_vag: 'rod_vag', parkCat: 'parkCat', park: 'park', go: 'go',
  st_from: 'st_from', st_to: 'st_to', status: 'status',
}

export const EMPTY_FILTERS: Filters = {
  years: [], months: [], days: [], plan: [], nomenk: [], rju: [], rod_vag: [],
  parkCat: [], park: [], go: [], st_from: [], st_to: [], status: [],
  preset: 'none', search: '',
}

type FilterKey = keyof Omit<Filters, 'preset' | 'search'>

interface State {
  locale: Locale
  theme: Theme
  metric: Metric
  filters: Filters
  drill: Drill | null
  openDrill: (title: string, criteria: DrillCriteria) => void
  closeDrill: () => void
  applyDrillAsFilter: (criteria: DrillCriteria) => void
  setLocale: (l: Locale) => void
  toggleLocale: () => void
  setTheme: (t: Theme) => void
  toggleTheme: () => void
  setMetric: (m: Metric) => void
  setFilterValues: (key: FilterKey, values: number[]) => void
  toggleFilterValue: (key: FilterKey, value: number) => void
  setPreset: (p: Preset) => void
  setSearch: (s: string) => void
  resetFilters: () => void
}

function detectTheme(): Theme {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

export const useStore = create<State>((set) => ({
  locale: 'uz',
  theme: detectTheme(),
  metric: 'tonna',
  filters: EMPTY_FILTERS,
  drill: null,
  openDrill: (title, criteria) => set({ drill: { title, criteria } }),
  closeDrill: () => set({ drill: null }),
  applyDrillAsFilter: (criteria) =>
    set((s) => {
      const f: Filters = { ...s.filters }
      for (const k of Object.keys(criteria) as DrillKey[]) {
        const v = criteria[k]
        if (v != null) (f[DRILL_TO_FILTER[k]] as number[]) = [v]
      }
      return { filters: f, drill: null }
    }),
  setLocale: (locale) => set({ locale }),
  toggleLocale: () => set((s) => ({ locale: s.locale === 'uz' ? 'ru' : 'uz' })),
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
  setMetric: (metric) => set({ metric }),
  setFilterValues: (key, values) =>
    set((s) => ({ filters: { ...s.filters, [key]: values } })),
  toggleFilterValue: (key, value) =>
    set((s) => {
      const cur = s.filters[key] as number[]
      const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value]
      return { filters: { ...s.filters, [key]: next } }
    }),
  setPreset: (preset) => set((s) => ({ filters: { ...s.filters, preset } })),
  setSearch: (search) => set((s) => ({ filters: { ...s.filters, search } })),
  resetFilters: () => set({ filters: EMPTY_FILTERS }),
}))
