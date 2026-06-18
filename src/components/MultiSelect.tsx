import { useEffect, useMemo, useRef, useState } from 'react'

export interface Option {
  value: number
  label: string
  count?: number
}

interface Props {
  label: string
  options: Option[]
  selected: number[]
  onChange: (values: number[]) => void
  t: (k: string) => string
  searchable?: boolean
  cap?: number
}

export default function MultiSelect({ label, options, selected, onChange, t, searchable = true, cap = 400 }: Props) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    const list = term ? options.filter((o) => o.label.toLowerCase().includes(term)) : options
    return list
  }, [options, q])

  const shown = filtered.slice(0, cap)
  const selSet = useMemo(() => new Set(selected), [selected])

  const toggle = (v: number) => {
    onChange(selSet.has(v) ? selected.filter((x) => x !== v) : [...selected, v])
  }

  return (
    <div className="relative" ref={boxRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-1 rounded-lg border border-[var(--border)] bg-[var(--panel)] px-2.5 py-1.5 text-left text-xs hover:border-brand-400"
      >
        <span className="truncate">
          <span className="muted">{label}</span>
          {selected.length > 0 && (
            <span className="ml-1 rounded bg-brand-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
              {selected.length}
            </span>
          )}
        </span>
        <span className="muted">▾</span>
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-[360px] max-w-[88vw] rounded-xl border border-[var(--border)] bg-[var(--panel)] p-2 shadow-2xl">
          {searchable && (
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t('flt.searchIn')}
              className="mb-2 w-full rounded-md border border-[var(--border)] bg-[var(--panel-2)] px-2 py-1 text-xs outline-none focus:border-brand-400"
            />
          )}
          <div className="mb-1 flex items-center justify-between text-[10px] muted">
            <button className="hover:text-brand-500" onClick={() => onChange(filtered.map((o) => o.value))}>
              {t('flt.selectAll')}
            </button>
            <span>{selected.length} {t('flt.selected')}</span>
            <button className="hover:text-brand-500" onClick={() => onChange([])}>
              {t('flt.clear')}
            </button>
          </div>
          <div className="max-h-[260px] overflow-auto">
            {shown.map((o) => (
              <label
                key={o.value}
                className="flex cursor-pointer items-start gap-2 rounded-md px-1.5 py-1 text-xs hover:bg-[var(--panel-2)]"
              >
                <input type="checkbox" checked={selSet.has(o.value)} onChange={() => toggle(o.value)} className="mt-[3px] accent-brand-600" />
                <span className="flex-1 break-words leading-snug" title={o.label}>{o.label}</span>
                {o.count != null && <span className="muted mt-[2px] shrink-0 text-[10px]">{o.count}</span>}
              </label>
            ))}
            {filtered.length > cap && (
              <div className="px-1.5 py-1 text-[10px] muted">+{filtered.length - cap} {t('app.records')} — {t('flt.searchIn')}</div>
            )}
            {filtered.length === 0 && <div className="px-1.5 py-2 text-[10px] muted">—</div>}
          </div>
        </div>
      )}
    </div>
  )
}
