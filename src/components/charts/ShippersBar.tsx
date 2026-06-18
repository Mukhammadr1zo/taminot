import { useMemo, useState } from 'react'
import Card, { SegToggle } from '../Card'
import EChart from '../EChart'
import { useChartCtx } from '../../lib/useChartCtx'
import { gm } from '../../lib/aggregate'
import { fmtShort, fmt1, shortLabel, truncate, pct } from '../../lib/format'
import { tooltipBase, axisLabel, gridBase, legendBase } from '../../lib/echartsBase'
import { PLAN_COLOR, DONE_COLOR } from '../../lib/palette'
import type { AggResult, Dataset } from '../../types'

export default function ShippersBar({ agg, dataset }: { agg: AggResult; dataset: Dataset }) {
  const { c, t, metric } = useChartCtx()
  const dim = dataset.meta.dims.go
  const [mode, setMode] = useState('15')

  const sorted = useMemo(
    () => [...agg.byShipper].sort((a, b) => gm(b, metric).done - gm(a, metric).done),
    [agg, metric],
  )
  const n = mode === 'all' ? Math.min(sorted.length, 80) : parseInt(mode, 10)
  const rows = sorted.slice(0, n)
  const height = Math.max(320, rows.length * 22 + 40)

  const option = useMemo(() => {
    const r = [...rows].reverse()
    const names = r.map((g) => truncate(shortLabel(dim[g.key as number]), 30))
    const plan = r.map((g) => Math.round(gm(g, metric).plan))
    const done = r.map((g) => Math.round(gm(g, metric).done))
    return {
      tooltip: {
        trigger: 'axis', ...tooltipBase(c), axisPointer: { type: 'shadow' },
        formatter: (ps: any[]) => { const g = r[ps[0].dataIndex]; const m = gm(g, metric); return `<b>${shortLabel(dim[g.key as number])}</b><br/>${t('lbl.plan')}: ${fmtShort(m.plan)}<br/>${t('lbl.done')}: ${fmtShort(m.done)}<br/>${t('lbl.fulfill')}: ${fmt1(pct(m.done, m.plan))}%<br/>${t('lbl.count')}: ${g.count}` },
      },
      legend: { data: [t('lbl.plan'), t('lbl.done')], top: 0, ...legendBase(c) },
      grid: gridBase({ top: 30, left: 4, right: 56 }),
      xAxis: { type: 'value', axisLabel: axisLabel(c, { formatter: (v: number) => fmtShort(v) }), splitLine: { lineStyle: { color: c.split } } },
      yAxis: { type: 'category', data: names, axisLabel: axisLabel(c, { fontSize: 10 }), axisLine: { lineStyle: { color: c.axis } } },
      series: [
        { name: t('lbl.plan'), type: 'bar', data: plan, itemStyle: { color: PLAN_COLOR, borderRadius: 2 }, barMaxWidth: 7 },
        { name: t('lbl.done'), type: 'bar', data: done, itemStyle: { color: DONE_COLOR, borderRadius: 2 }, barMaxWidth: 7, label: { show: true, position: 'right', color: c.text, fontSize: 9, formatter: (p: any) => fmtShort(p.value) } },
      ],
    }
  }, [rows, c, t, metric, dim])

  return (
    <Card
      title={t('chart.shippers')}
      subtitle={`${rows.length} ${t('app.of')} ${sorted.length}`}
      className="col-span-full"
      right={<SegToggle value={mode} onChange={setMode} options={[{ value: '15', label: t('lbl.top') + ' 15' }, { value: '30', label: '30' }, { value: 'all', label: t('lbl.top') + ' 80' }]} />}
    >
      <EChart option={option} height={height} downloadName="yuboruvchilar" />
    </Card>
  )
}
