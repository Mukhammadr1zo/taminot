import { useMemo, useState } from 'react'
import Card, { SegToggle } from '../Card'
import EChart from '../EChart'
import { useChartCtx } from '../../lib/useChartCtx'
import { fmtShort, shortLabel, truncate } from '../../lib/format'
import { tooltipBase } from '../../lib/echartsBase'
import { colorAt } from '../../lib/palette'
import type { AggResult, Dataset } from '../../types'

export default function Sankey({ agg, dataset }: { agg: AggResult; dataset: Dataset }) {
  const { c, t, metric } = useChartCtx()
  const sf = dataset.meta.dims.st_from
  const st = dataset.meta.dims.st_to
  const [topn, setTopn] = useState('30')

  const option = useMemo(() => {
    const n = parseInt(topn, 10)
    const flows = [...agg.sankey]
      .map((f) => ({ ...f, val: metric === 'tonna' ? f.t : f.v }))
      .filter((f) => f.val > 0)
      .sort((a, b) => b.val - a.val)
      .slice(0, n)

    const nameMap: Record<string, string> = {}
    const nodes: any[] = []
    const seen = new Set<string>()
    const addNode = (id: string, label: string, depth: number, idx: number) => {
      if (seen.has(id)) return
      seen.add(id)
      nameMap[id] = label
      nodes.push({ name: id, depth, itemStyle: { color: colorAt(idx) } })
    }
    flows.forEach((f, i) => {
      addNode('F' + f.from, truncate(shortLabel(sf[f.from]), 22), 0, i)
      addNode('T' + f.to, truncate(shortLabel(st[f.to]), 22), 1, i + 7)
    })
    const links = flows.map((f) => ({ source: 'F' + f.from, target: 'T' + f.to, value: Math.round(f.val) }))

    return {
      tooltip: {
        trigger: 'item', ...tooltipBase(c),
        formatter: (p: any) => {
          if (p.dataType === 'edge') return `${nameMap[p.data.source]} → ${nameMap[p.data.target]}<br/><b>${fmtShort(p.data.value)}</b>`
          return `<b>${nameMap[p.name] || p.name}</b><br/>${fmtShort(p.value)}`
        },
      },
      series: [{
        type: 'sankey', left: 4, right: 90, top: 10, bottom: 10,
        nodeWidth: 14, nodeGap: 7, draggable: false,
        emphasis: { focus: 'adjacency' },
        label: { color: c.text, fontSize: 10, formatter: (p: any) => nameMap[p.name] || p.name },
        lineStyle: { color: 'gradient', opacity: 0.35, curveness: 0.5 },
        data: nodes, links,
      }],
    }
  }, [agg, c, metric, sf, st, topn])

  return (
    <Card
      title={t('chart.sankey')}
      subtitle={t('flt.stFrom') + ' → ' + t('flt.stTo')}
      className="col-span-full"
      right={<SegToggle value={topn} onChange={setTopn} options={[{ value: '20', label: t('lbl.top') + ' 20' }, { value: '30', label: '30' }, { value: '50', label: '50' }]} />}
    >
      <EChart option={option} height={460} downloadName="sankey-yonalishlar" />
    </Card>
  )
}
