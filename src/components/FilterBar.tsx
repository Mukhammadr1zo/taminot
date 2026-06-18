import { useMemo } from 'react'
import { useStore } from '../store/useStore'
import { makeT } from '../i18n/strings'
import { buildOptions } from '../lib/options'
import MultiSelect from './MultiSelect'
import type { FilterOptions } from '../lib/options'
import type { Dataset, Filters, Preset } from '../types'

type FKey = keyof Omit<Filters, 'preset' | 'search'>
type OKey = keyof FilterOptions

const FILTER_KEYS: { key: FKey; opt: OKey; labelKey: string; searchable?: boolean }[] = [
  { key: 'years', opt: 'year', labelKey: 'flt.year', searchable: false },
  { key: 'months', opt: 'month', labelKey: 'flt.month', searchable: false },
  { key: 'days', opt: 'day', labelKey: 'flt.day', searchable: false },
  { key: 'plan', opt: 'plan', labelKey: 'flt.plan', searchable: false },
  { key: 'nomenk', opt: 'nomenk', labelKey: 'flt.nomenk' },
  { key: 'rju', opt: 'rju', labelKey: 'flt.rju', searchable: false },
  { key: 'rod_vag', opt: 'rod_vag', labelKey: 'flt.rodVag', searchable: false },
  { key: 'parkCat', opt: 'parkCat', labelKey: 'flt.parkCat', searchable: false },
  { key: 'park', opt: 'park', labelKey: 'flt.park' },
  { key: 'go', opt: 'go', labelKey: 'flt.shipper' },
  { key: 'st_from', opt: 'st_from', labelKey: 'flt.stFrom' },
  { key: 'st_to', opt: 'st_to', labelKey: 'flt.stTo' },
  { key: 'status', opt: 'status', labelKey: 'flt.status', searchable: false },
]

const PRESETS: Preset[] = ['undone', 'over', 'zeroplan']

export default function FilterBar({ dataset }: { dataset: Dataset }) {
  const locale = useStore((s) => s.locale)
  const filters = useStore((s) => s.filters)
  const setFilterValues = useStore((s) => s.setFilterValues)
  const setPreset = useStore((s) => s.setPreset)
  const setSearch = useStore((s) => s.setSearch)
  const resetFilters = useStore((s) => s.resetFilters)
  const t = makeT(locale)

  const opts = useMemo(() => buildOptions(dataset, locale), [dataset, locale])

  const activeCount =
    FILTER_KEYS.reduce((acc, fk) => acc + (filters[fk.key] as number[]).length, 0) +
    (filters.preset !== 'none' ? 1 : 0) +
    (filters.search ? 1 : 0)

  return (
    <div className="panel p-3">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold">🔎 {t('flt.title')}</span>
        <input
          value={filters.search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('flt.search')}
          className="min-w-[200px] flex-1 rounded-lg border border-[var(--border)] bg-[var(--panel-2)] px-3 py-1.5 text-xs outline-none focus:border-brand-400"
        />
        <div className="flex items-center gap-1">
          <span className="text-[10px] muted">{t('flt.presets')}:</span>
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => setPreset(filters.preset === p ? 'none' : p)}
              className={`rounded-md border px-2 py-1 text-[11px] transition ${
                filters.preset === p
                  ? 'border-brand-500 bg-brand-600 text-white'
                  : 'border-[var(--border)] muted hover:border-brand-400'
              }`}
            >
              {t('preset.' + p)}
            </button>
          ))}
        </div>
        {activeCount > 0 && (
          <button
            onClick={resetFilters}
            className="rounded-md border border-rose-400/40 bg-rose-500/10 px-2 py-1 text-[11px] text-rose-500 hover:bg-rose-500/20"
          >
            ✕ {t('flt.reset')} ({activeCount})
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {FILTER_KEYS.map((fk) => (
          <MultiSelect
            key={fk.key}
            label={t(fk.labelKey)}
            options={opts[fk.opt]}
            selected={filters[fk.key] as number[]}
            onChange={(v) => setFilterValues(fk.key, v)}
            t={t}
            searchable={fk.searchable !== false}
          />
        ))}
      </div>
    </div>
  )
}
