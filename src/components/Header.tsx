import { useStore } from '../store/useStore'
import { makeT } from '../i18n/strings'
import { SegToggle } from './Card'
import { fmtInt } from '../lib/format'

export default function Header({ totalRecords }: { totalRecords: number }) {
  const locale = useStore((s) => s.locale)
  const theme = useStore((s) => s.theme)
  const metric = useStore((s) => s.metric)
  const setMetric = useStore((s) => s.setMetric)
  const toggleLocale = useStore((s) => s.toggleLocale)
  const toggleTheme = useStore((s) => s.toggleTheme)
  const t = makeT(locale)

  return (
    <header className="panel flex flex-wrap items-center justify-between gap-3 p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-xl text-white shadow-lg">🚆</div>
        <div>
          <h1 className="text-base font-bold leading-tight">{t('app.title')}</h1>
          <p className="text-[11px] muted">{t('app.subtitle')} · {fmtInt(totalRecords)} {t('app.records')}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] muted">{t('metric.label')}:</span>
          <SegToggle
            value={metric}
            onChange={(v) => setMetric(v as 'tonna' | 'vagon')}
            options={[{ value: 'tonna', label: t('metric.tonna') }, { value: 'vagon', label: t('metric.vagon') }]}
          />
        </div>
        <div className="inline-flex overflow-hidden rounded-lg border border-[var(--border)] text-[11px]">
          <button onClick={() => locale !== 'uz' && toggleLocale()} className={`px-2 py-1 ${locale === 'uz' ? 'bg-brand-600 text-white' : 'muted'}`}>UZ</button>
          <button onClick={() => locale !== 'ru' && toggleLocale()} className={`px-2 py-1 ${locale === 'ru' ? 'bg-brand-600 text-white' : 'muted'}`}>RU</button>
        </div>
        <button onClick={toggleTheme} title="Theme" className="rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-sm hover:border-brand-400">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  )
}
