import { useEffect, type ReactNode } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

/** To'liq ekran modal oynasi (fullscreen chart / data jadval uchun). */
export default function Modal({ open, onClose, title, children }: Props) {
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = '' }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-black/55 p-2 backdrop-blur-sm sm:p-4" onClick={onClose}>
      <div
        className="panel mx-auto flex h-full w-full max-w-[1800px] flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] px-4 py-2.5">
          <h3 className="text-sm font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-md border border-[var(--border)] px-3 py-1 text-sm hover:border-brand-400"
            title="Esc"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-auto p-3">{children}</div>
      </div>
    </div>
  )
}
