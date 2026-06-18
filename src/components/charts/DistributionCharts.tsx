import { useMemo } from 'react'
import Card from '../Card'
import EChart from '../EChart'
import { useChartCtx } from '../../lib/useChartCtx'
import { fmtInt, fmtShort } from '../../lib/format'
import { tooltipBase, axisLabel, gridBase } from '../../lib/echartsBase'
import type { AggResult } from '../../types'

const BIN_COLORS = ['#9aa6bd', '#eb3b5a', '#ff7a45', '#f5a524', '#a0d911', '#52c41a', '#22c1a4']

export function FulfillHistogram({ agg }: { agg: AggResult }) {
  const { c, t, metric, isTonna } = useChartCtx()
  const option = useMemo(() => {
    const bins = isTonna ? agg.histT : agg.histV
    const labels = [t('lbl.zeroPlan'), '0%', '1–50%', '51–75%', '76–99%', '100%', t('lbl.over')]
    return {
      tooltip: { trigger: 'axis', ...tooltipBase(c), axisPointer: { type: 'shadow' }, formatter: (ps: any[]) => `${ps[0].name}<br/><b>${fmtInt(ps[0].value)}</b> ${t('app.records')}` },
      grid: gridBase({ top: 20, bottom: 4 }),
      xAxis: { type: 'category', data: labels, axisLabel: axisLabel(c, { rotate: 25 }), axisLine: { lineStyle: { color: c.axis } } },
      yAxis: { type: 'value', axisLabel: axisLabel(c), splitLine: { lineStyle: { color: c.split } } },
      series: [{
        type: 'bar', data: bins.map((v, i) => ({ value: v, itemStyle: { color: BIN_COLORS[i], borderRadius: [3, 3, 0, 0] } })),
        label: { show: true, position: 'top', color: c.text, fontSize: 10, formatter: (p: any) => fmtInt(p.value) }, barMaxWidth: 44,
      }],
    }
  }, [agg, c, t, isTonna])
  return (
    <Card title={t('chart.dist')} subtitle={`${t('lbl.fulfill')} · ${isTonna ? t('metric.tonna') : t('metric.vagon')}`}>
      <EChart option={option} height={320} downloadName="taqsimot" />
    </Card>
  )
}

export function PlanDoneScatter({ agg }: { agg: AggResult }) {
  const { c, t, isTonna } = useChartCtx()
  const option = useMemo(() => {
    let max = 1
    const pts = agg.scatter.map((s) => {
      const p = isTonna ? s.tp : s.vp
      const d = isTonna ? s.td : s.vd
      if (p > max) max = p
      if (d > max) max = d
      return [p, d]
    })
    return {
      tooltip: { ...tooltipBase(c), formatter: (p: any) => `${t('lbl.plan')}: ${fmtShort(p.value[0])}<br/>${t('lbl.done')}: ${fmtShort(p.value[1])}` },
      grid: gridBase({ top: 16, right: 20 }),
      xAxis: { type: 'value', name: t('lbl.plan'), nameTextStyle: { color: c.textMuted }, axisLabel: axisLabel(c, { formatter: (v: number) => fmtShort(v) }), splitLine: { lineStyle: { color: c.split } } },
      yAxis: { type: 'value', name: t('lbl.done'), nameTextStyle: { color: c.textMuted }, axisLabel: axisLabel(c, { formatter: (v: number) => fmtShort(v) }), splitLine: { lineStyle: { color: c.split } } },
      series: [{
        type: 'scatter', large: true, largeThreshold: 1000, symbolSize: 5, data: pts,
        itemStyle: { color: 'rgba(52,120,246,0.5)' },
        markLine: { silent: true, symbol: 'none', lineStyle: { color: '#eb3b5a', type: 'dashed' }, data: [[{ coord: [0, 0] }, { coord: [max, max] }]], label: { show: true, formatter: '100%', color: '#eb3b5a', fontSize: 10 } },
      }],
    }
  }, [agg, c, t, isTonna])
  return (
    <Card title={t('chart.scatter')} subtitle={`${agg.scatter.length} ${t('app.of')} ${fmtInt(agg.scatterTotal)} · ${isTonna ? t('metric.tonna') : t('metric.vagon')}`}>
      <EChart option={option} height={320} downloadName="scatter" />
    </Card>
  )
}
