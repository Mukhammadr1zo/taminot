import { useMemo } from 'react'
import Card from '../Card'
import EChart from '../EChart'
import { useChartCtx } from '../../lib/useChartCtx'
import { fmtShort, fmt1, pct } from '../../lib/format'
import { tooltipBase } from '../../lib/echartsBase'
import type { AggResult } from '../../types'

export function FulfillGauge({ agg }: { agg: AggResult }) {
  const { c, t, isTonna } = useChartCtx()
  const plan = isTonna ? agg.tPlan : agg.vPlan
  const done = isTonna ? agg.tDone : agg.vDone
  const val = pct(done, plan)
  const option = useMemo(() => ({
    series: [{
      type: 'gauge', startAngle: 210, endAngle: -30, min: 0, max: 120, radius: '92%', center: ['50%', '58%'],
      progress: { show: true, width: 16, roundCap: true },
      axisLine: { lineStyle: { width: 16, color: [[0.3 / 1.2, '#eb3b5a'], [0.5 / 1.2, '#ff7a45'], [0.75 / 1.2, '#f5a524'], [1 / 1.2, '#a0d911'], [1, '#22c1a4']] } },
      pointer: { width: 5, itemStyle: { color: c.text } },
      axisTick: { distance: -18, lineStyle: { color: c.textMuted } },
      splitLine: { distance: -20, length: 10, lineStyle: { color: c.textMuted } },
      axisLabel: { distance: -14, color: c.textMuted, fontSize: 9, formatter: (v: number) => (v % 30 === 0 ? v + '' : '') },
      detail: { valueAnimation: true, formatter: (v: number) => fmt1(v) + '%', color: c.text, fontSize: 26, offsetCenter: [0, '34%'] },
      data: [{ value: +fmt1(val).replace(',', '.') }],
    }],
  }), [val, c])
  return (
    <Card title={t('chart.gauge')} subtitle={`${isTonna ? t('metric.tonna') : t('metric.vagon')} · ${fmtShort(done)} / ${fmtShort(plan)}`}>
      <EChart option={option} height={300} downloadName="gauge" />
    </Card>
  )
}

export function PlanFunnel({ agg }: { agg: AggResult }) {
  const { c, t, isTonna } = useChartCtx()
  const plan = isTonna ? agg.tPlan : agg.vPlan
  const done = isTonna ? agg.tDone : agg.vDone
  const undone = Math.max(0, plan - done)
  const option = useMemo(() => ({
    tooltip: { ...tooltipBase(c), formatter: (p: any) => `${p.name}: <b>${fmtShort(p.value)}</b>` },
    series: [{
      type: 'funnel', left: 8, right: 8, top: 10, bottom: 10, minSize: '24%', sort: 'descending', gap: 3,
      label: { show: true, position: 'inside', color: '#fff', fontSize: 12, formatter: (p: any) => `${p.name}: ${fmtShort(p.value)}` },
      itemStyle: { borderColor: c.tooltipBg, borderWidth: 2 },
      data: [
        { value: Math.round(plan), name: t('lbl.plan'), itemStyle: { color: '#9aa6bd' } },
        { value: Math.round(done), name: t('lbl.done'), itemStyle: { color: '#3478f6' } },
        { value: Math.round(undone), name: t('lbl.undone'), itemStyle: { color: '#eb3b5a' } },
      ],
    }],
  }), [plan, done, undone, c, t])
  return (
    <Card title={t('chart.funnel')} subtitle={isTonna ? t('metric.tonna') : t('metric.vagon')}>
      <EChart option={option} height={300} downloadName="funnel" />
    </Card>
  )
}
