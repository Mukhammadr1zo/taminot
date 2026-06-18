import type { ReactNode } from 'react'

interface Props {
  title: string
  subtitle?: string
  right?: ReactNode
  className?: string
  children: ReactNode
}

export default function Card({ title, subtitle, right, className = '', children }: Props) {
  return (
    <div className={`panel p-4 ${className}`}>
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="card-title text-sm font-semibold">{title}</h3>
          {subtitle && <p className="mt-1 text-[11px] muted">{subtitle}</p>}
        </div>
        {right && <div className="flex shrink-0 items-center gap-1">{right}</div>}
      </div>
      {children}
    </div>
  )
}

interface ToggleProps {
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
}

export function SegToggle({ options, value, onChange }: ToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--panel-2)] p-0.5 text-[11px]">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-md px-2 py-1 transition ${
            value === o.value ? 'bg-brand-600 text-white' : 'muted hover:text-[var(--text)]'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
