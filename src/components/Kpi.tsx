import { useStore } from '../store/useStore'
import { makeT } from '../i18n/strings'
import { fmtInt, fmtShort, fmt1, pct } from '../lib/format'
import { fulfillColor } from '../lib/palette'
import type { AggResult } from '../types'

function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null
  const w = 80, h = 22
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const span = max - min || 1
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w
    const y = h - ((v - min) / span) * h
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

interface CardProps {
  label: string
  value: string
  sub?: string
  badge?: { text: string; color: string }
  spark?: number[]
  sparkColor?: string
  accent?: string
}

function KpiCard({ label, value, sub, badge, spark, sparkColor, accent = 'var(--accent)' }: CardProps) {
  return (
    <div className="panel relative overflow-hidden p-3">
      <div className="absolute left-0 top-0 h-full w-1" style={{ background: accent }} />
      <div className="flex items-start justify-between">
        <span className="text-[11px] muted">{label}</span>
        {badge && (
          <span className="rounded px-1.5 py-0.5 text-[10px] font-bold text-white" style={{ background: badge.color }}>
            {badge.text}
          </span>
        )}
      </div>
      <div className="mt-1 text-xl font-bold tabular-nums">{value}</div>
      <div className="mt-0.5 flex items-end justify-between">
        {sub ? <span className="text-[10px] muted">{sub}</span> : <span />}
        {spark && <Sparkline values={spark} color={sparkColor || accent} />}
      </div>
    </div>
  )
}

export default function Kpi({ agg }: { agg: AggResult }) {
  const locale = useStore((s) => s.locale)
  const t = makeT(locale)

  const monthDone = (key: 'tDone' | 'vDone') => agg.byMonth.map((g) => g[key])
  const tUndone = agg.tPlan - agg.tDone
  const vUndone = agg.vPlan - agg.vDone
  const tPct = pct(agg.tDone, agg.tPlan)
  const vPct = pct(agg.vDone, agg.vPlan)

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
      <KpiCard label={t('kpi.applications')} value={fmtInt(agg.count)} accent="#7c5cff" spark={agg.byMonth.map((g) => g.count)} sparkColor="#7c5cff" />
      <KpiCard label={t('kpi.planTonna')} value={fmtShort(agg.tPlan)} accent="#9aa6bd" />
      <KpiCard
        label={t('kpi.doneTonna')}
        value={fmtShort(agg.tDone)}
        badge={{ text: fmt1(tPct) + '%', color: fulfillColor(tPct) }}
        spark={monthDone('tDone')}
        sparkColor="#3478f6"
        accent="#3478f6"
      />
      <KpiCard label={t('kpi.undoneTonna')} value={fmtShort(tUndone)} accent="#eb3b5a" sub={`${t('lbl.over')}: ${fmtInt(agg.overRows)}`} />
      <KpiCard label={t('kpi.planVagon')} value={fmtInt(agg.vPlan)} accent="#9aa6bd" />
      <KpiCard
        label={t('kpi.doneVagon')}
        value={fmtInt(agg.vDone)}
        badge={{ text: fmt1(vPct) + '%', color: fulfillColor(vPct) }}
        spark={monthDone('vDone')}
        sparkColor="#22c1a4"
        accent="#22c1a4"
      />
      <KpiCard label={t('kpi.undoneVagon')} value={fmtInt(vUndone)} accent="#f5a524" />
      <KpiCard label={t('lbl.zeroPlan')} value={fmtInt(agg.zeroPlanRows)} accent="#19b3e6" sub={t('preset.zeroplan')} />
    </div>
  )
}
