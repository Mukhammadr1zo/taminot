import { useMemo, useState } from 'react'
import Card, { SegToggle } from '../Card'
import EChart from '../EChart'
import { useChartCtx } from '../../lib/useChartCtx'
import { gm } from '../../lib/aggregate'
import { fmtShort, fmtVal, fmt1, truncate, pct } from '../../lib/format'
import { tooltipBase, axisLabel, gridBase, legendBase } from '../../lib/echartsBase'
import { PLAN_COLOR, DONE_COLOR, fulfillColor } from '../../lib/palette'
import type { AggResult, Dataset } from '../../types'

export function NomenkBar({ agg, dataset }: { agg: AggResult; dataset: Dataset }) {
  const { c, t, metric, isTonna, openDrill } = useChartCtx()
  const [mode, setMode] = useState('top')
  const dims = dataset.meta.dims.nomenk

  const sorted = useMemo(
    () => [...agg.byNomenk].sort((a, b) => gm(b, metric).done - gm(a, metric).done),
    [agg, metric],
  )
  const rows = mode === 'top' ? sorted.slice(0, 15) : sorted
  const r = useMemo(() => [...rows].reverse(), [rows])
  const height = Math.max(300, rows.length * 26 + 40)
  const onClick = (p: any) => { const g = r[p.dataIndex]; if (g) openDrill(dims[g.key as number], { nomenk: g.key as number }) }

  const option = useMemo(() => {
    const names = r.map((g) => truncate(dims[g.key as number], 26))
    const plan = r.map((g) => Math.round(gm(g, metric).plan))
    const done = r.map((g) => Math.round(gm(g, metric).done))
    return {
      tooltip: {
        trigger: 'axis', ...tooltipBase(c), axisPointer: { type: 'shadow' },
        formatter: (ps: any[]) => {
          const i = ps[0].dataIndex
          const g = r[i]; const m = gm(g, metric)
          return `<b>${dims[g.key as number]}</b><br/>${t('lbl.plan')}: ${fmtVal(m.plan, metric)}<br/>${t('lbl.done')}: ${fmtVal(m.done, metric)}<br/>${t('lbl.fulfill')}: ${fmt1(pct(m.done, m.plan))}%<br/>${t('lbl.count')}: ${g.count}`
        },
      },
      legend: { data: [t('lbl.plan'), t('lbl.done')], top: 0, ...legendBase(c) },
      grid: gridBase({ top: 30, left: 4, right: 50 }),
      xAxis: { type: 'value', axisLabel: axisLabel(c, { formatter: (v: number) => fmtShort(v) }), splitLine: { lineStyle: { color: c.split } } },
      yAxis: { type: 'category', data: names, axisLabel: axisLabel(c), axisLine: { lineStyle: { color: c.axis } } },
      series: [
        { name: t('lbl.plan'), type: 'bar', data: plan, itemStyle: { color: PLAN_COLOR, borderRadius: 3 }, barMaxWidth: 9 },
        {
          name: t('lbl.done'), type: 'bar', data: done, itemStyle: { color: DONE_COLOR, borderRadius: 3 }, barMaxWidth: 9,
          label: { show: true, position: 'right', color: c.text, fontSize: 9, formatter: (p: any) => fmtVal(p.value, metric) },
        },
      ],
    }
  }, [r, c, t, metric, dims])

  return (
    <Card
      title={t('chart.byNomenk')}
      subtitle={`${rows.length} ${t('app.of')} ${sorted.length} · ${t('src.hint')}`}
      right={<SegToggle value={mode} onChange={setMode} options={[{ value: 'top', label: t('lbl.top') + ' 15' }, { value: 'all', label: t('flt.all') }]} />}
    >
      <EChart option={option} height={Math.min(height, mode === 'all' ? height : 420)} downloadName="yuk-guruhi" title={t('chart.byNomenk')}
        onEvents={{ click: onClick }} onSource={() => openDrill(t('chart.byNomenk'), {})} />
    </Card>
  )
}

export function NomenkTreemap({ agg, dataset }: { agg: AggResult; dataset: Dataset }) {
  const { c, t, metric, openDrill } = useChartCtx()
  const dims = dataset.meta.dims.nomenk
  const onClick = (p: any) => { if (p?.data?.gkey != null) openDrill(p.data.name, { nomenk: p.data.gkey }) }

  const option = useMemo(() => {
    const data = agg.byNomenk
      .map((g) => {
        const m = gm(g, metric)
        return { name: dims[g.key as number], value: Math.round(m.done), pctv: pct(m.done, m.plan), gkey: g.key as number }
      })
      .filter((d) => d.value > 0)
      .map((d) => ({ ...d, itemStyle: { color: fulfillColor(d.pctv) } }))
    return {
      tooltip: {
        ...tooltipBase(c),
        formatter: (p: any) => `<b>${p.name}</b><br/>${t('lbl.done')}: ${fmtVal(p.value, metric)}<br/>${t('lbl.fulfill')}: ${fmt1(p.data.pctv)}%`,
      },
      series: [
        {
          type: 'treemap', roam: false, nodeClick: false, breadcrumb: { show: false },
          width: '100%', height: '100%', top: 4, left: 0, right: 0, bottom: 0,
          itemStyle: { borderColor: c.tooltipBg, borderWidth: 2, gapWidth: 2 },
          label: { show: true, formatter: (p: any) => `${truncate(p.name, 18)}\n${fmtVal(p.value, metric)}`, fontSize: 10, color: '#fff' },
          data,
        },
      ],
    }
  }, [agg, c, t, metric, dims])

  return (
    <Card title={t('chart.nomenkTree')} subtitle={t('lbl.share') + ' · ' + t('src.hint')}>
      <EChart option={option} height={360} downloadName="yuk-treemap" title={t('chart.nomenkTree')}
        onEvents={{ click: onClick }} onSource={() => openDrill(t('chart.nomenkTree'), {})} />
    </Card>
  )
}
