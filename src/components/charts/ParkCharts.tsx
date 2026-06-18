import { useMemo, useState } from 'react'
import Card from '../Card'
import EChart from '../EChart'
import { useChartCtx } from '../../lib/useChartCtx'
import { gm } from '../../lib/aggregate'
import { fmtShort, fmt1, truncate, pct } from '../../lib/format'
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
  const { c, t, locale, metric } = useChartCtx()
  const labels = dataset.meta.parkCatLabels
  const parkDim = dataset.meta.dims.park
  const [cat, setCat] = useState<number | null>(null)

  const pieOption = useMemo(() => {
    const data = agg.byParkCat
      .map((g) => ({ name: labels[String(g.key)]?.[locale] || String(g.key), value: Math.round(gm(g, metric).done), cat: g.key as number, g }))
      .filter((d) => d.value > 0)
      .map((d) => ({ ...d, itemStyle: { color: CAT_COLOR[d.cat] || '#888', opacity: cat == null || cat === d.cat ? 1 : 0.35 } }))
    return {
      tooltip: {
        ...tooltipBase(c),
        formatter: (p: any) => { const m = gm(p.data.g, metric); return `<b>${p.name}</b><br/>${t('lbl.done')}: ${fmtShort(m.done)} (${p.percent}%)<br/>${t('lbl.fulfill')}: ${fmt1(pct(m.done, m.plan))}%<br/>${t('lbl.count')}: ${p.data.g.count}` },
      },
      legend: { bottom: 0, ...legendBase(c) },
      series: [{
        type: 'pie', radius: ['45%', '72%'], center: ['50%', '46%'],
        itemStyle: { borderColor: c.tooltipBg, borderWidth: 2 },
        label: { show: true, formatter: (p: any) => `${p.percent}%`, fontSize: 11, fontWeight: 'bold', color: c.text },
        data,
      }],
    }
  }, [agg, c, t, locale, metric, labels, cat])

  const barOption = useMemo(() => {
    const ops = agg.byPark
      .map((g) => ({ g, cat: +(parkDim[g.key as number]?.[0] || 0), v: Math.round(gm(g, metric).done) }))
      .filter((o) => o.v > 0 && (cat == null || o.cat === cat))
      .sort((a, b) => b.v - a.v)
      .slice(0, 12)
      .reverse()
    return {
      tooltip: { trigger: 'axis', ...tooltipBase(c), axisPointer: { type: 'shadow' },
        formatter: (ps: any[]) => { const o = ops[ps[0].dataIndex]; const m = gm(o.g, metric); return `<b>${parkShort(parkDim[o.g.key as number])}</b><br/>${t('lbl.done')}: ${fmtShort(m.done)}<br/>${t('lbl.fulfill')}: ${fmt1(pct(m.done, m.plan))}%` } },
      grid: gridBase({ left: 4, right: 56 }),
      xAxis: { type: 'value', axisLabel: axisLabel(c, { formatter: (v: number) => fmtShort(v) }), splitLine: { lineStyle: { color: c.split } } },
      yAxis: { type: 'category', data: ops.map((o) => truncate(parkShort(parkDim[o.g.key as number]), 24)), axisLabel: axisLabel(c, { fontSize: 10 }), axisLine: { lineStyle: { color: c.axis } } },
      series: [{ type: 'bar', data: ops.map((o) => o.v), itemStyle: { color: DONE_COLOR, borderRadius: 3 }, barMaxWidth: 14, label: { show: true, position: 'right', color: c.text, fontSize: 9, formatter: (p: any) => fmtShort(p.value) } }],
    }
  }, [agg, c, t, metric, parkDim, cat])

  return (
    <>
      <Card title={t('chart.byPark')} subtitle={t('lbl.share')} right={cat != null && <button onClick={() => setCat(null)} className="text-[10px] text-brand-500">✕ {t('flt.all')}</button>}>
        <EChart option={pieOption} height={300} downloadName="park-mulkchiligi" onEvents={{ click: (p: any) => { const cc = p?.data?.cat; if (cc != null) setCat((prev) => (prev === cc ? null : cc)) } }} />
      </Card>
      <Card title={t('chart.parkOper')} subtitle={cat != null ? (labels[String(cat)]?.[locale] || '') : t('flt.all')}>
        <EChart option={barOption} height={300} downloadName="operatorlar" />
      </Card>
    </>
  )
}
