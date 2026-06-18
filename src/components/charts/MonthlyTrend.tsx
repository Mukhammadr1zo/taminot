import { useMemo } from 'react'
import Card from '../Card'
import EChart from '../EChart'
import { useChartCtx } from '../../lib/useChartCtx'
import { gm } from '../../lib/aggregate'
import { fmtShort, fmtVal, fmt1, monthKey, pct } from '../../lib/format'
import { tooltipBase, axisLabel, gridBase, legendBase } from '../../lib/echartsBase'
import { PLAN_COLOR, DONE_COLOR } from '../../lib/palette'
import type { AggResult } from '../../types'

export default function MonthlyTrend({ agg }: { agg: AggResult }) {
  const { c, t, metric, isTonna, openDrill } = useChartCtx()
  const onClick = (p: any) => {
    const g = agg.byMonth[p.dataIndex]
    if (!g) return
    const k = g.key as number
    openDrill(monthKey(k), { year: Math.floor(k / 100), month: k % 100 })
  }

  const option = useMemo(() => {
    const rows = agg.byMonth
    const cats = rows.map((g) => monthKey(g.key as number))
    const plan = rows.map((g) => Math.round(gm(g, metric).plan))
    const done = rows.map((g) => Math.round(gm(g, metric).done))
    const fp = rows.map((g) => { const m = gm(g, metric); return +fmt1(pct(m.done, m.plan)).replace(',', '.') })

    return {
      tooltip: { trigger: 'axis', ...tooltipBase(c), axisPointer: { type: 'shadow' } },
      legend: { data: [t('lbl.plan'), t('lbl.done'), t('lbl.fulfill')], top: 0, ...legendBase(c) },
      grid: gridBase({ top: 34, right: 48 }),
      xAxis: { type: 'category', data: cats, axisLabel: axisLabel(c, { rotate: cats.length > 8 ? 35 : 0 }), axisLine: { lineStyle: { color: c.axis } } },
      yAxis: [
        { type: 'value', name: isTonna ? t('unit.tonna') : t('unit.vagon'), nameTextStyle: { color: c.textMuted }, axisLabel: axisLabel(c, { formatter: (v: number) => fmtShort(v) }), splitLine: { lineStyle: { color: c.split } } },
        { type: 'value', name: '%', max: 120, axisLabel: axisLabel(c, { formatter: '{value}%' }), splitLine: { show: false } },
      ],
      series: [
        { name: t('lbl.plan'), type: 'bar', data: plan, itemStyle: { color: PLAN_COLOR, borderRadius: [3, 3, 0, 0] }, barMaxWidth: 26 },
        {
          name: t('lbl.done'), type: 'bar', data: done, itemStyle: { color: DONE_COLOR, borderRadius: [3, 3, 0, 0] }, barMaxWidth: 26,
          label: { show: true, position: 'top', color: c.text, fontSize: 9, formatter: (p: any) => fmtVal(p.value, metric) },
        },
        {
          name: t('lbl.fulfill'), type: 'line', yAxisIndex: 1, data: fp, smooth: true, symbol: 'circle', symbolSize: 6,
          lineStyle: { width: 2.5, color: '#f5a524' }, itemStyle: { color: '#f5a524' },
          label: { show: true, color: '#f5a524', fontSize: 9, formatter: '{c}%' },
        },
      ],
    }
  }, [agg, c, t, metric, isTonna])

  return (
    <Card title={t('chart.monthly')} subtitle={`${isTonna ? t('metric.tonna') : t('metric.vagon')} · ${t('lbl.fulfill')} · ${t('src.hint')}`} className="col-span-full">
      <EChart option={option} height={320} downloadName="oylik-dinamika" title={t('chart.monthly')}
        onEvents={{ click: onClick }} onSource={() => openDrill(t('chart.monthly'), {})} />
    </Card>
  )
}
