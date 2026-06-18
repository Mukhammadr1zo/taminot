import { useMemo } from 'react'
import Card from './Card'
import SourceGrid from './SourceGrid'
import { useStore } from '../store/useStore'
import { makeT } from '../i18n/strings'
import { filterIndices } from '../lib/aggregate'
import { fmtInt } from '../lib/format'
import type { Dataset } from '../types'

export default function DataTable({ dataset }: { dataset: Dataset }) {
  const locale = useStore((s) => s.locale)
  const metric = useStore((s) => s.metric)
  const filters = useStore((s) => s.filters)
  const t = makeT(locale)

  const indices = useMemo(() => filterIndices(dataset, filters, metric), [dataset, filters, metric])

  return (
    <Card title={t('chart.table')} subtitle={`${fmtInt(indices.length)} ${t('app.records')}`} className="col-span-full">
      <SourceGrid dataset={dataset} indices={indices} height={560} fileName="vagon-taminoti" />
    </Card>
  )
}
