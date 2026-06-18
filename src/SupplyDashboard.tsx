import { useEffect, useState } from 'react'
import { useStore } from './store/useStore'
import { loadDataset } from './lib/data'
import { makeT } from './i18n/strings'
import Dashboard from './components/Dashboard'
import type { Dataset, Locale, Theme } from './types'

export interface SupplyDashboardProps {
  /** data.json / meta.json joylashgan bazaviy URL (oxirida '/'). d-railway.uz API uchun almashtiriladi. */
  dataUrl?: string
  /** Boshlang'ich til */
  defaultLocale?: Locale
  /** Boshlang'ich mavzu */
  defaultTheme?: Theme
  /** Embed rejimi — <html> ga 'dark' klassi qo'shilmaydi (faqat ichki wrapper) */
  embedded?: boolean
}

/** d-railway.uz ga import qilinadigan asosiy komponent. */
export default function SupplyDashboard({ dataUrl, defaultLocale, defaultTheme, embedded }: SupplyDashboardProps) {
  const theme = useStore((s) => s.theme)
  const locale = useStore((s) => s.locale)
  const setLocale = useStore((s) => s.setLocale)
  const setTheme = useStore((s) => s.setTheme)
  const [ds, setDs] = useState<Dataset | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const t = makeT(locale)

  useEffect(() => {
    if (defaultLocale) setLocale(defaultLocale)
    if (defaultTheme) setTheme(defaultTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    loadDataset(dataUrl).then(setDs).catch((e) => setErr(String(e?.message || e)))
  }, [dataUrl])

  useEffect(() => {
    if (embedded) return
    const el = document.documentElement
    if (theme === 'dark') el.classList.add('dark')
    else el.classList.remove('dark')
  }, [theme, embedded])

  return (
    <div className={theme === 'dark' ? 'dark' : ''} style={{ minHeight: '100%', background: 'var(--bg)', color: 'var(--text)' }}>
      {!ds && !err && (
        <div className="flex h-screen items-center justify-center gap-2 muted">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          {t('app.loading')}
        </div>
      )}
      {err && <div className="flex h-screen items-center justify-center text-rose-500">⚠ {t('app.error')}: {err}</div>}
      {ds && <Dashboard dataset={ds} />}
    </div>
  )
}
