import { useMemo } from 'react'
import Card from '../Card'
import EChart from '../EChart'
import { useChartCtx } from '../../lib/useChartCtx'
import { gm } from '../../lib/aggregate'
import { fmtShort, fmt1, truncate, pct } from '../../lib/format'
import { tooltipBase, axisLabel, gridBase, legendBase } from '../../lib/echartsBase'
import { PLAN_COLOR, DONE_COLOR, colorAt } from '../../lib/palette'
import type { AggResult, Dataset } from '../../types'

function rjuName(k: number): string {
  return k === 0 ? '0 / —' : 'РЖУ ' + k
}

export function RjuBar({ agg }: { agg: AggResult }) {
  const { c, t, metric, isTonna } = useChartCtx()
  const option = useMemo(() => {
    const rows = [...agg.byRju].sort((a, b) => (a.key as number) - (b.key as number))
    const cats = rows.map((g) => rjuName(g.key as number))
    const plan = rows.map((g) => Math.round(gm(g, metric).plan))
    const done = rows.map((g) => Math.round(gm(g, metric).done))
    const fp = rows.map((g) => { const m = gm(g, metric); return +fmt1(pct(m.done, m.plan)).replace(',', '.') })
    return {
      tooltip: { trigger: 'axis', ...tooltipBase(c), axisPointer: { type: 'shadow' } },
      legend: { data: [t('lbl.plan'), t('lbl.done'), t('lbl.fulfill')], top: 0, ...legendBase(c) },
      grid: gridBase({ top: 30, right: 46 }),
      xAxis: { type: 'category', data: cats, axisLabel: axisLabel(c), axisLine: { lineStyle: { color: c.axis } } },
      yAxis: [
        { type: 'value', axisLabel: axisLabel(c, { formatter: (v: number) => fmtShort(v) }), splitLine: { lineStyle: { color: c.split } } },
        { type: 'value', max: 120, axisLabel: axisLabel(c, { formatter: '{value}%' }), splitLine: { show: false } },
      ],
      series: [
        { name: t('lbl.plan'), type: 'bar', data: plan, itemStyle: { color: PLAN_COLOR, borderRadius: [3, 3, 0, 0] }, barMaxWidth: 28 },
        { name: t('lbl.done'), type: 'bar', data: done, itemStyle: { color: DONE_COLOR, borderRadius: [3, 3, 0, 0] }, barMaxWidth: 28, label: { show: true, position: 'top', color: c.text, fontSize: 9, formatter: (p: any) => fmtShort(p.value) } },
        { name: t('lbl.fulfill'), type: 'line', yAxisIndex: 1, data: fp, smooth: true, symbolSize: 6, lineStyle: { color: '#f5a524', width: 2.5 }, itemStyle: { color: '#f5a524' }, label: { show: true, fontSize: 9, color: '#f5a524', formatter: '{c}%' } },
      ],
    }
  }, [agg, c, t, metric, isTonna])

  return (
    <Card title={t('chart.byRju')} subtitle={isTonna ? t('metric.tonna') : t('metric.vagon')}>
      <EChart option={option} height={320} downloadName="rju" />
    </Card>
  )
}

export function RjuSunburst({ agg, dataset }: { agg: AggResult; dataset: Dataset }) {
  const { c, t, metric } = useChartCtx()
  const nomDim = dataset.meta.dims.nomenk
  const rodDim = dataset.meta.dims.rod_vag

  const option = useMemo(() => {
    // rju -> nomenk -> rodVag daraxti
    const rjuMap = new Map<number, Map<number, Map<number, number>>>()
    agg.sunburst.forEach((g, key) => {
      const [rju, nom, rod] = key.split('|').map(Number)
      const val = metric === 'tonna' ? g.tDone : g.vDone
      if (val <= 0) return
      if (!rjuMap.has(rju)) rjuMap.set(rju, new Map())
      const nm = rjuMap.get(rju)!
      if (!nm.has(nom)) nm.set(nom, new Map())
      const rm = nm.get(nom)!
      rm.set(rod, (rm.get(rod) || 0) + val)
    })
    const data = Array.from(rjuMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([rju, nm], i) => {
        const topNom = Array.from(nm.entries())
          .map(([nom, rm]) => ({ nom, total: Array.from(rm.values()).reduce((s, v) => s + v, 0), rm }))
          .sort((a, b) => b.total - a.total)
        return {
          name: rjuName(rju),
          itemStyle: { color: colorAt(i) },
          children: topNom.slice(0, 8).map((n) => ({
            name: truncate(nomDim[n.nom], 18),
            children: Array.from(n.rm.entries()).map(([rod, v]) => ({ name: rodDim[rod], value: Math.round(v) })),
          })),
        }
      })
    return {
      tooltip: { ...tooltipBase(c), formatter: (p: any) => `<b>${p.name}</b><br/>${fmtShort(p.value)}` },
      series: [{
        type: 'sunburst', radius: ['12%', '95%'], center: ['50%', '50%'],
        data,
        label: { show: true, color: '#fff', fontSize: 9, minAngle: 8 },
        itemStyle: { borderColor: c.tooltipBg, borderWidth: 1.5 },
        levels: [{}, { r0: '12%', r: '45%', label: { rotate: 'tangential' } }, { r0: '45%', r: '74%' }, { r0: '74%', r: '95%', label: { rotate: 'radial', fontSize: 8 } }],
      }],
    }
  }, [agg, c, metric, nomDim, rodDim])

  return (
    <Card title={t('chart.sunburst')} subtitle={t('lbl.done')}>
      <EChart option={option} height={400} downloadName="rju-sunburst" />
    </Card>
  )
}
