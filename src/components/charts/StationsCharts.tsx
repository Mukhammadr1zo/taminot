import { useMemo } from 'react'
import Card from '../Card'
import EChart from '../EChart'
import { useChartCtx } from '../../lib/useChartCtx'
import { gm } from '../../lib/aggregate'
import { fmtShort, fmtVal, shortLabel, truncate } from '../../lib/format'
import { MONTHS_RU, MONTHS_UZ } from '../../lib/format'
import { tooltipBase, axisLabel, gridBase } from '../../lib/echartsBase'
import type { AggResult, Dataset, Group } from '../../types'
import type { DrillKey } from '../../store/useStore'

function StationBar({ groups, dim, title, color, fileName, critKey }: { groups: Group[]; dim: string[]; title: string; color: string; fileName: string; critKey: DrillKey }) {
  const { c, t, metric, openDrill } = useChartCtx()
  const rows = useMemo(() => [...groups].sort((a, b) => gm(b, metric).done - gm(a, metric).done).slice(0, 15).reverse(), [groups, metric])
  const onClick = (p: any) => { const g = rows[p.dataIndex]; if (g) openDrill(shortLabel(dim[g.key as number]), { [critKey]: g.key as number }) }
  const option = useMemo(() => {
    return {
      tooltip: { trigger: 'axis', ...tooltipBase(c), axisPointer: { type: 'shadow' }, formatter: (ps: any[]) => { const g = rows[ps[0].dataIndex]; return `<b>${shortLabel(dim[g.key as number])}</b><br/>${t('lbl.done')}: ${fmtVal(gm(g, metric).done, metric)}<br/>${t('lbl.count')}: ${g.count}` } },
      grid: gridBase({ left: 4, right: 52 }),
      xAxis: { type: 'value', axisLabel: axisLabel(c, { formatter: (v: number) => fmtShort(v) }), splitLine: { lineStyle: { color: c.split } } },
      yAxis: { type: 'category', data: rows.map((g) => truncate(shortLabel(dim[g.key as number]), 22)), axisLabel: axisLabel(c, { fontSize: 10 }), axisLine: { lineStyle: { color: c.axis } } },
      series: [{ type: 'bar', data: rows.map((g) => Math.round(gm(g, metric).done)), itemStyle: { color, borderRadius: 3 }, barMaxWidth: 13, label: { show: true, position: 'right', color: c.text, fontSize: 9, formatter: (p: any) => fmtVal(p.value, metric) } }],
    }
  }, [rows, dim, c, t, metric, color])
  return (
    <Card title={title} subtitle={`${t('lbl.top')} 15 · ${t('src.hint')}`}>
      <EChart option={option} height={340} downloadName={fileName} title={title}
        onEvents={{ click: onClick }} onSource={() => openDrill(title, {})} />
    </Card>
  )
}

export function StFromBar({ agg, dataset }: { agg: AggResult; dataset: Dataset }) {
  const { t } = useChartCtx()
  return <StationBar groups={agg.byStFrom} dim={dataset.meta.dims.st_from} title={t('chart.stFrom')} color="#3478f6" fileName="jonatish-stansiyalari" critKey="st_from" />
}
export function StToBar({ agg, dataset }: { agg: AggResult; dataset: Dataset }) {
  const { t } = useChartCtx()
  return <StationBar groups={agg.byStTo} dim={dataset.meta.dims.st_to} title={t('chart.stTo')} color="#22c1a4" fileName="manzil-stansiyalari" critKey="st_to" />
}

export function NomenkMonthHeatmap({ agg, dataset }: { agg: AggResult; dataset: Dataset }) {
  const { c, t, locale, metric, openDrill } = useChartCtx()
  const nomDim = dataset.meta.dims.nomenk
  const months = locale === 'ru' ? MONTHS_RU : MONTHS_UZ
  const onClick = (p: any) => {
    const d = p?.data
    if (d?.nomenk != null && d?.month != null) openDrill(`${nomDim[d.nomenk]} · ${months[d.month - 1]}`, { nomenk: d.nomenk, month: d.month })
  }
  const option = useMemo(() => {
    const monthsPresent = Array.from(new Set(agg.byNomenkMonth.map((d) => d.month))).sort((a, b) => a - b)
    const totals = new Map<number, number>()
    agg.byNomenkMonth.forEach((d) => { const v = metric === 'tonna' ? d.t : d.v; totals.set(d.nomenk, (totals.get(d.nomenk) || 0) + v) })
    const topNom = Array.from(totals.entries()).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, 18).map(([k]) => k)
    const nomIndex = new Map(topNom.map((k, i) => [k, i]))
    const monIndex = new Map(monthsPresent.map((m, i) => [m, i]))
    let maxV = 1
    const data: any[] = []
    agg.byNomenkMonth.forEach((d) => {
      if (!nomIndex.has(d.nomenk) || !monIndex.has(d.month)) return
      const v = Math.round(metric === 'tonna' ? d.t : d.v)
      if (v > maxV) maxV = v
      data.push({ value: [monIndex.get(d.month)!, nomIndex.get(d.nomenk)!, v], nomenk: d.nomenk, month: d.month })
    })
    return {
      tooltip: { ...tooltipBase(c), formatter: (p: any) => `${nomDim[topNom[p.value[1]]]}<br/>${months[monthsPresent[p.value[0]] - 1]}: <b>${fmtVal(p.value[2], metric)}</b>` },
      grid: { left: 4, right: 12, top: 8, bottom: 50, containLabel: true },
      xAxis: { type: 'category', data: monthsPresent.map((m) => months[m - 1]), axisLabel: axisLabel(c), splitArea: { show: true }, axisLine: { lineStyle: { color: c.axis } } },
      yAxis: { type: 'category', data: topNom.map((k) => truncate(nomDim[k], 22)), axisLabel: axisLabel(c, { fontSize: 9 }), splitArea: { show: true }, axisLine: { lineStyle: { color: c.axis } } },
      visualMap: { min: 0, max: maxV, calculable: true, orient: 'horizontal', left: 'center', bottom: 4, itemWidth: 12, itemHeight: 90, textStyle: { color: c.textMuted, fontSize: 10 }, inRange: { color: ['#0c1733', '#1947b8', '#3478f6', '#22c1a4', '#a0d911', '#f5a524'] } },
      series: [{ type: 'heatmap', data, label: { show: false }, emphasis: { itemStyle: { borderColor: c.text, borderWidth: 1 } } }],
    }
  }, [agg, c, locale, metric, nomDim, months])

  return (
    <Card title={t('chart.heatmap')} subtitle={`${metric === 'tonna' ? t('metric.tonna') : t('metric.vagon')} · ${t('src.hint')}`} className="col-span-full">
      <EChart option={option} height={460} downloadName="heatmap" title={t('chart.heatmap')}
        onEvents={{ click: onClick }} onSource={() => openDrill(t('chart.heatmap'), {})} />
    </Card>
  )
}
