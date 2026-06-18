import { useMemo, useRef, useState } from 'react'
import Card from '../Card'
import EChart from '../EChart'
import { useChartCtx } from '../../lib/useChartCtx'
import { gm } from '../../lib/aggregate'
import { fmtShort, fmtVal, fmt1, truncate, pct } from '../../lib/format'
import { tooltipBase, axisLabel, gridBase, legendBase } from '../../lib/echartsBase'
import { PLAN_COLOR, DONE_COLOR, colorAt } from '../../lib/palette'
import type { AggResult, Dataset } from '../../types'

function rjuName(k: number): string {
  return k === 0 ? '0 / —' : 'РЖУ ' + k
}

export function RjuBar({ agg }: { agg: AggResult }) {
  const { c, t, metric, isTonna, openDrill } = useChartCtx()
  const rows = useMemo(() => [...agg.byRju].sort((a, b) => (a.key as number) - (b.key as number)), [agg])
  const onClick = (p: any) => { const g = rows[p.dataIndex]; if (g) openDrill(rjuName(g.key as number), { rju: g.key as number }) }
  const option = useMemo(() => {
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
        { name: t('lbl.done'), type: 'bar', data: done, itemStyle: { color: DONE_COLOR, borderRadius: [3, 3, 0, 0] }, barMaxWidth: 28, label: { show: true, position: 'top', color: c.text, fontSize: 9, formatter: (p: any) => fmtVal(p.value, metric) } },
        { name: t('lbl.fulfill'), type: 'line', yAxisIndex: 1, data: fp, smooth: true, symbolSize: 6, lineStyle: { color: '#f5a524', width: 2.5 }, itemStyle: { color: '#f5a524' }, label: { show: true, fontSize: 9, color: '#f5a524', formatter: '{c}%' } },
      ],
    }
  }, [rows, c, t, metric, isTonna])

  return (
    <Card title={t('chart.byRju')} subtitle={`${isTonna ? t('metric.tonna') : t('metric.vagon')} · ${t('src.hint')}`}>
      <EChart option={option} height={320} downloadName="rju" title={t('chart.byRju')}
        onEvents={{ click: onClick }} onSource={() => openDrill(t('chart.byRju'), {})} />
    </Card>
  )
}

export function RjuSunburst({ agg, dataset }: { agg: AggResult; dataset: Dataset }) {
  const { c, t, metric, openDrill } = useChartCtx()
  const nomDim = dataset.meta.dims.nomenk
  const rodDim = dataset.meta.dims.rod_vag
  const instRef = useRef<any>(null)
  const [rk, setRk] = useState(0)
  // chap tugma -> manba ma'lumotlari
  const onClick = (p: any) => { const cr = p?.data?.crit; if (cr) openDrill(p.data.lbl || p.name, cr) }
  // o'ng tugma -> aynan shu bo'lakni kattalashtirish (zoom)
  const onCtx = (p: any) => {
    p?.event?.event?.preventDefault?.()
    const id = p?.data?.id
    if (id && instRef.current) instRef.current.dispatchAction({ type: 'sunburstRootToNode', seriesIndex: 0, targetNodeId: id })
  }

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
        const noms = Array.from(nm.entries())
          .map(([nom, rm]) => ({ nom, total: Array.from(rm.values()).reduce((s, v) => s + v, 0), rm }))
          .sort((a, b) => b.total - a.total)
        // tartibsizlikni kamaytirish: top-6 nomenk + "boshqalar"
        const top = noms.slice(0, 6)
        const rest = noms.slice(6)
        const children: any[] = top.map((n) => ({
          id: `r${rju}n${n.nom}`,
          name: truncate(nomDim[n.nom], 16),
          lbl: `${rjuName(rju)} → ${nomDim[n.nom]}`,
          value: Math.round(n.total),
          crit: { rju, nomenk: n.nom },
          children: Array.from(n.rm.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([rod, v]) => ({
              id: `r${rju}n${n.nom}v${rod}`,
              name: rodDim[rod],
              lbl: `${rjuName(rju)} → ${nomDim[n.nom]} → ${rodDim[rod]}`,
              value: Math.round(v),
              crit: { rju, nomenk: n.nom, rod_vag: rod },
            })),
        }))
        if (rest.length) {
          children.push({ id: `r${rju}other`, name: t('lbl.others'), lbl: `${rjuName(rju)} — ${t('lbl.others')}`, value: Math.round(rest.reduce((s, n) => s + n.total, 0)), crit: { rju }, itemStyle: { color: '#9aa6bd' } })
        }
        return { id: `r${rju}`, name: rjuName(rju), lbl: rjuName(rju), crit: { rju }, itemStyle: { color: colorAt(i) }, children }
      })

    return {
      tooltip: { ...tooltipBase(c), formatter: (p: any) => `<b>${p.data?.lbl || p.name}</b><br/>${fmtVal(p.value, metric)}` },
      series: [{
        type: 'sunburst', radius: ['12%', '92%'], center: ['50%', '50%'],
        data, nodeClick: false,
        itemStyle: { borderColor: c.tooltipBg, borderWidth: 2 },
        label: { color: '#fff', fontSize: 10, overflow: 'truncate', minAngle: 6 },
        levels: [
          {},
          { r0: '12%', r: '44%', label: { rotate: 'tangential', fontSize: 11, minAngle: 5 } },
          { r0: '44%', r: '72%', label: { align: 'right', minAngle: 10, overflow: 'truncate', width: 64 } },
          { r0: '72%', r: '92%', label: { rotate: 'radial', fontSize: 8, minAngle: 5, overflow: 'truncate' }, itemStyle: { opacity: 0.85 } },
        ],
      }],
    }
  }, [agg, c, t, metric, nomDim, rodDim])

  return (
    <Card
      title={t('chart.sunburst')}
      subtitle={`${metric === 'tonna' ? t('metric.tonna') : t('metric.vagon')} · ${t('src.sunburstHint')}`}
      right={<button onClick={() => setRk((k) => k + 1)} title={t('src.reset')} className="rounded-md border border-[var(--border)] px-2 py-1 text-[11px] muted hover:border-brand-400 hover:text-brand-500">↺</button>}
    >
      <EChart key={rk} option={option} height={400} downloadName="rju-sunburst" title={t('chart.sunburst')}
        onEvents={{ click: onClick, contextmenu: onCtx }} onSource={() => openDrill(t('chart.sunburst'), {})}
        onInit={(inst) => {
          instRef.current = inst
          // canvas ustida brauzerning standart o'ng-tugma menyusini bloklash
          try { inst.getZr().on('contextmenu', (e: any) => { e?.event?.preventDefault?.() }) } catch { /* noop */ }
        }} />
    </Card>
  )
}
