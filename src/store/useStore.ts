import { create } from 'zustand'
import type { Filters, Locale, Metric, Preset, Theme } from '../types'

export const EMPTY_FILTERS: Filters = {
  years: [], months: [], plan: [], nomenk: [], rju: [], rod_vag: [],
  parkCat: [], park: [], go: [], st_from: [], st_to: [], status: [],
  preset: 'none', search: '',
}

type FilterKey = keyof Omit<Filters, 'preset' | 'search'>

interface State {
  locale: Locale
  theme: Theme
  metric: Metric
  filters: Filters
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
