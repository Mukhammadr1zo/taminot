import { useMemo } from 'react'
import Card from '../Card'
import EChart from '../EChart'
import { useChartCtx } from '../../lib/useChartCtx'
import { gm } from '../../lib/aggregate'
import { fmtVal, fmt1, pct } from '../../lib/format'
import { tooltipBase, legendBase } from '../../lib/echartsBase'
import { colorAt } from '../../lib/palette'
import type { AggResult, Dataset } from '../../types'

export default function WagonPie({ agg, dataset }: { agg: AggResult; dataset: Dataset }) {
  const { c, t, metric, openDrill } = useChartCtx()
  const dims = dataset.meta.dims.rod_vag
  const onClick = (p: any) => { const g = p?.data?.g; if (g) openDrill(dims[g.key as number], { rod_vag: g.key as number }) }

  const option = useMemo(() => {
    const data = agg.byRodVag
      .map((g) => ({ name: dims[g.key as number], value: Math.round(gm(g, metric).done), g }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value)
      .map((d, i) => ({ name: d.name, value: d.value, itemStyle: { color: colorAt(i) }, g: d.g }))
    return {
      tooltip: {
        ...tooltipBase(c),
        formatter: (p: any) => {
          const m = gm(p.data.g, metric)
          return `<b>${p.name}</b><br/>${t('lbl.done')}: ${fmtVal(m.done, metric)} (${p.percent}%)<br/>${t('lbl.plan')}: ${fmtVal(m.plan, metric)}<br/>${t('lbl.fulfill')}: ${fmt1(pct(m.done, m.plan))}%`
        },
      },
      legend: { type: 'scroll', orient: 'vertical', right: 4, top: 'center', ...legendBase(c) },
      series: [
        {
          type: 'pie', radius: ['42%', '70%'], center: ['38%', '52%'], avoidLabelOverlap: true,
          itemStyle: { borderColor: c.tooltipBg, borderWidth: 2 },
          label: { show: true, formatter: (p: any) => `${p.name}\n${p.percent}%`, fontSize: 10, color: c.text },
          labelLine: { length: 8, length2: 8 },
          data,
        },
      ],
    }
  }, [agg, c, t, metric, dims])

  return (
    <Card title={t('chart.byWagon')} subtitle={`${metric === 'tonna' ? t('metric.tonna') : t('metric.vagon')} · ${t('src.hint')}`}>
      <EChart option={option} height={320} downloadName="vagon-turi" title={t('chart.byWagon')}
        onEvents={{ click: onClick }} onSource={() => openDrill(t('chart.byWagon'), {})} />
    </Card>
  )
}
