import { useMemo } from 'react'
import Card from '../Card'
import EChart from '../EChart'
import { useChartCtx } from '../../lib/useChartCtx'
import { gm } from '../../lib/aggregate'
import { fmtShort, fmtVal, fmt1, pct } from '../../lib/format'
import { tooltipBase, axisLabel, gridBase, legendBase } from '../../lib/echartsBase'
import { PLAN_COLOR, DONE_COLOR } from '../../lib/palette'
import type { AggResult } from '../../types'

export default function YearCompare({ agg }: { agg: AggResult }) {
  const { c, t, metric, isTonna, openDrill } = useChartCtx()

  const option = useMemo(() => {
    const acc = { p2025: 0, d2025: 0, p2026: 0, d2026: 0, pFull25: 0, dFull25: 0 }
    agg.byMonth.forEach((g) => {
      const m = gm(g, metric)
      const key = g.key as number
      const year = Math.floor(key / 100)
      const month = key % 100
      if (year === 2025) { acc.pFull25 += m.plan; acc.dFull25 += m.done; if (month <= 5) { acc.p2025 += m.plan; acc.d2025 += m.done } }
      if (year === 2026) { if (month <= 5) { acc.p2026 += m.plan; acc.d2026 += m.done } }
    })
    const cats = ['2025 (1–5)', '2026 (1–5)', '2025 ' + t('lbl.total')]
    const plan = [acc.p2025, acc.p2026, acc.pFull25].map(Math.round)
    const done = [acc.d2025, acc.d2026, acc.dFull25].map(Math.round)
    const fulfill = [pct(acc.d2025, acc.p2025), pct(acc.d2026, acc.p2026), pct(acc.dFull25, acc.pFull25)]
    return {
      tooltip: { trigger: 'axis', ...tooltipBase(c), axisPointer: { type: 'shadow' }, formatter: (ps: any[]) => { const i = ps[0].dataIndex; return `<b>${cats[i]}</b><br/>${t('lbl.plan')}: ${fmtVal(plan[i], metric)}<br/>${t('lbl.done')}: ${fmtVal(done[i], metric)}<br/>${t('lbl.fulfill')}: ${fmt1(fulfill[i])}%` } },
      legend: { data: [t('lbl.plan'), t('lbl.done')], top: 0, ...legendBase(c) },
      grid: gridBase({ top: 30 }),
      xAxis: { type: 'category', data: cats, axisLabel: axisLabel(c), axisLine: { lineStyle: { color: c.axis } } },
      yAxis: { type: 'value', axisLabel: axisLabel(c, { formatter: (v: number) => fmtShort(v) }), splitLine: { lineStyle: { color: c.split } } },
      series: [
        { name: t('lbl.plan'), type: 'bar', data: plan, itemStyle: { color: PLAN_COLOR, borderRadius: [3, 3, 0, 0] }, barMaxWidth: 40 },
        { name: t('lbl.done'), type: 'bar', data: done, itemStyle: { color: DONE_COLOR, borderRadius: [3, 3, 0, 0] }, barMaxWidth: 40, label: { show: true, position: 'top', color: c.text, fontSize: 10, formatter: (p: any) => fmtVal(p.value, metric) } },
      ],
    }
  }, [agg, c, t, metric])

  return (
    <Card title={t('chart.compare')} subtitle={isTonna ? t('metric.tonna') : t('metric.vagon')}>
      <EChart option={option} height={320} downloadName="2025-2026" title={t('chart.compare')}
        onSource={() => openDrill(t('chart.compare'), {})} />
    </Card>
  )
}
