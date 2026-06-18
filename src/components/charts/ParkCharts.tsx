import { useMemo } from 'react'
import Card from '../Card'
import EChart from '../EChart'
import { useChartCtx } from '../../lib/useChartCtx'
import { gm } from '../../lib/aggregate'
import { fmtShort, fmtVal, fmt1, truncate, pct } from '../../lib/format'
import { tooltipBase, axisLabel, gridBase, legendBase } from '../../lib/echartsBase'
import { DONE_COLOR } from '../../lib/palette'
import type { AggResult, Dataset } from '../../types'

const CAT_COLOR: Record<number, string> = { 0: '#9aa6bd', 1: '#f5a524', 2: '#3478f6', 3: '#22c1a4' }

function parkShort(s: string): string {
  const m = s.match(/^\d\s*-\s*(.*)$/s)
  let r = m ? m[1] : s
  const sps = r.match(/^СПС\s*\((.*)\)$/s)
  if (sps) r = sps[1]
  return r.trim()
}

export default function ParkCharts({ agg, dataset }: { agg: AggResult; dataset: Dataset }) {
  const { c, t, locale, metric, openDrill } = useChartCtx()
  const labels = dataset.meta.parkCatLabels
  const parkDim = dataset.meta.dims.park

  const pieClick = (p: any) => { const cc = p?.data?.cat; if (cc != null) openDrill(p.data.name, { parkCat: cc }) }

  const pieOption = useMemo(() => {
    const data = agg.byParkCat
      .map((g) => ({ name: labels[String(g.key)]?.[locale] || String(g.key), value: Math.round(gm(g, metric).done), cat: g.key as number, g }))
      .filter((d) => d.value > 0)
      .map((d) => ({ ...d, itemStyle: { color: CAT_COLOR[d.cat] || '#888' } }))
    return {
      tooltip: {
        ...tooltipBase(c),
        formatter: (p: any) => { const m = gm(p.data.g, metric); return `<b>${p.name}</b><br/>${t('lbl.done')}: ${fmtVal(m.done, metric)} (${p.percent}%)<br/>${t('lbl.fulfill')}: ${fmt1(pct(m.done, m.plan))}%<br/>${t('lbl.count')}: ${p.data.g.count}` },
      },
      legend: { bottom: 0, ...legendBase(c) },
      series: [{
        type: 'pie', radius: ['45%', '72%'], center: ['50%', '46%'],
        itemStyle: { borderColor: c.tooltipBg, borderWidth: 2 },
        label: { show: true, formatter: (p: any) => `${p.percent}%`, fontSize: 11, fontWeight: 'bold', color: c.text },
        data,
      }],
    }
  }, [agg, c, t, locale, metric, labels])

  const ops = useMemo(() => agg.byPark
    .map((g) => ({ g, v: Math.round(gm(g, metric).done) }))
    .filter((o) => o.v > 0)
    .sort((a, b) => b.v - a.v)
    .slice(0, 12)
    .reverse(), [agg, metric])
  const barClick = (p: any) => { const o = ops[p.dataIndex]; if (o) openDrill(parkShort(parkDim[o.g.key as number]), { park: o.g.key as number }) }

  const barOption = useMemo(() => ({
    tooltip: { trigger: 'axis', ...tooltipBase(c), axisPointer: { type: 'shadow' },
      formatter: (ps: any[]) => { const o = ops[ps[0].dataIndex]; const m = gm(o.g, metric); return `<b>${parkShort(parkDim[o.g.key as number])}</b><br/>${t('lbl.done')}: ${fmtVal(m.done, metric)}<br/>${t('lbl.fulfill')}: ${fmt1(pct(m.done, m.plan))}%` } },
    grid: gridBase({ left: 4, right: 56 }),
    xAxis: { type: 'value', axisLabel: axisLabel(c, { formatter: (v: number) => fmtShort(v) }), splitLine: { lineStyle: { color: c.split } } },
    yAxis: { type: 'category', data: ops.map((o) => truncate(parkShort(parkDim[o.g.key as number]), 24)), axisLabel: axisLabel(c, { fontSize: 10 }), axisLine: { lineStyle: { color: c.axis } } },
    series: [{ type: 'bar', data: ops.map((o) => o.v), itemStyle: { color: DONE_COLOR, borderRadius: 3 }, barMaxWidth: 14, label: { show: true, position: 'right', color: c.text, fontSize: 9, formatter: (p: any) => fmtVal(p.value, metric) } }],
  }), [ops, c, t, metric, parkDim])

  return (
    <>
      <Card title={t('chart.byPark')} subtitle={`${t('lbl.share')} · ${t('src.hint')}`}>
        <EChart option={pieOption} height={300} downloadName="park-mulkchiligi" title={t('chart.byPark')}
          onEvents={{ click: pieClick }} onSource={() => openDrill(t('chart.byPark'), {})} />
      </Card>
      <Card title={t('chart.parkOper')} subtitle={`${t('lbl.top')} 12 · ${t('src.hint')}`}>
        <EChart option={barOption} height={300} downloadName="operatorlar" title={t('chart.parkOper')}
          onEvents={{ click: barClick }} onSource={() => openDrill(t('chart.parkOper'), {})} />
      </Card>
    </>
  )
}
