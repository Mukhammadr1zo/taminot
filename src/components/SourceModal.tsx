import { useMemo } from 'react'
import Modal from './Modal'
import SourceGrid from './SourceGrid'
import { useStore, type DrillKey } from '../store/useStore'
import { makeT } from '../i18n/strings'
import { filterIndices } from '../lib/aggregate'
import { fmtInt } from '../lib/format'
import type { Dataset } from '../types'

/** Bosilgan grafik bo'lagiga tegishli xom manba yozuvlari modali. */
export default function SourceModal({ dataset }: { dataset: Dataset }) {
  const locale = useStore((s) => s.locale)
  const metric = useStore((s) => s.metric)
  const filters = useStore((s) => s.filters)
  const drill = useStore((s) => s.drill)
  const closeDrill = useStore((s) => s.closeDrill)
  const applyDrillAsFilter = useStore((s) => s.applyDrillAsFilter)
  const t = makeT(locale)

  const colArr = useMemo<Record<DrillKey, ArrayLike<number>>>(() => ({
    year: dataset.year, month: dataset.month, day: dataset.day, plan: dataset.plan,
    nomenk: dataset.nomenk, rju: dataset.rju, rod_vag: dataset.rod_vag,
    parkCat: dataset.parkCat, park: dataset.park, go: dataset.go,
    st_from: dataset.st_from, st_to: dataset.st_to, status: dataset.status,
  }), [dataset])

  const indices = useMemo(() => {
    if (!drill) return []
    const base = filterIndices(dataset, filters, metric)
    const entries = Object.entries(drill.criteria) as [DrillKey, number][]
    if (!entries.length) return base
    return base.filter((i) => entries.every(([k, v]) => colArr[k][i] === v))
  }, [dataset, filters, metric, drill, colArr])

  if (!drill) return null

  return (
    <Modal open={!!drill} onClose={closeDrill} title={`${t('src.title')} · ${drill.title}`}>
      <div className="flex h-full flex-col gap-2">
        <div>
          <button
            onClick={() => applyDrillAsFilter(drill.criteria)}
            className="rounded-md border border-brand-500 bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700"
          >
            {t('src.filterBy')}
          </button>
          <span className="ml-2 text-[11px] muted">{fmtInt(indices.length)} {t('app.records')}</span>
        </div>
        <div className="min-h-0 flex-1">
          <SourceGrid dataset={dataset} indices={indices} height="100%" fileName="manba" />
        </div>
      </div>
    </Modal>
  )
}
