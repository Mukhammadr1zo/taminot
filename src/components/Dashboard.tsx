import { useMemo } from 'react'
import { useStore } from '../store/useStore'
import { makeT } from '../i18n/strings'
import { aggregate } from '../lib/aggregate'
import type { Dataset } from '../types'

import Header from './Header'
import FilterBar from './FilterBar'
import Kpi from './Kpi'
import DataTable from './DataTable'
import SourceModal from './SourceModal'
import MonthlyTrend from './charts/MonthlyTrend'
import { NomenkBar, NomenkTreemap } from './charts/NomenkCharts'
import WagonPie from './charts/WagonPie'
import ParkCharts from './charts/ParkCharts'
import { RjuBar, RjuSunburst } from './charts/RjuCharts'
import Sankey from './charts/Sankey'
import ShippersBar from './charts/ShippersBar'
import { StFromBar, StToBar, NomenkMonthHeatmap } from './charts/StationsCharts'
import { FulfillHistogram, PlanDoneScatter } from './charts/DistributionCharts'
import { FulfillGauge, PlanFunnel } from './charts/GaugeFunnel'
import YearCompare from './charts/YearCompare'

export default function Dashboard({ dataset }: { dataset: Dataset }) {
  const locale = useStore((s) => s.locale)
  const metric = useStore((s) => s.metric)
  const filters = useStore((s) => s.filters)
  const t = makeT(locale)

  const agg = useMemo(() => aggregate(dataset, filters, metric), [dataset, filters, metric])

  return (
    <div className="mx-auto flex max-w-[1700px] flex-col gap-3 p-3">
      <Header totalRecords={dataset.n} />
      <FilterBar dataset={dataset} />

      {agg.count === 0 ? (
        <div className="panel p-16 text-center muted">{t('app.empty')}</div>
      ) : (
        <>
          <Kpi agg={agg} />

          <MonthlyTrend agg={agg} />

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <NomenkBar agg={agg} dataset={dataset} />
            <NomenkTreemap agg={agg} dataset={dataset} />
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <WagonPie agg={agg} dataset={dataset} />
            <RjuBar agg={agg} />
            <RjuSunburst agg={agg} dataset={dataset} />
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <ParkCharts agg={agg} dataset={dataset} />
          </div>

          <Sankey agg={agg} dataset={dataset} />

          <ShippersBar agg={agg} dataset={dataset} />

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <StFromBar agg={agg} dataset={dataset} />
            <StToBar agg={agg} dataset={dataset} />
          </div>

          <NomenkMonthHeatmap agg={agg} dataset={dataset} />

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-4">
            <FulfillGauge agg={agg} />
            <PlanFunnel agg={agg} />
            <FulfillHistogram agg={agg} />
            <YearCompare agg={agg} />
          </div>

          <PlanDoneScatter agg={agg} />

          <DataTable dataset={dataset} />

          <p className="panel p-3 text-[11px] muted">ℹ️ {t('note.tonnaVagon')}</p>
        </>
      )}
      <SourceModal dataset={dataset} />
    </div>
  )
}
