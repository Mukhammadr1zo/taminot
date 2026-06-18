import { useRef, useCallback, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import Modal from './Modal'

interface Props {
  // Dinamik quriladigan ECharts option — qat'iy literal tiplardan voz kechamiz
  option: any
  height?: number
  onEvents?: Record<string, (params: any) => void>
  downloadName?: string
  title?: string
  /** ▦ tugmasi: butun grafik manba ma'lumotlarini ochish */
  onSource?: () => void
  /** ECharts instansiyasi tayyor bo'lganda */
  onInit?: (inst: any) => void
  /** O'ng tugma -> sunburst bo'lagini kattalashtirish (inline + fullscreen) */
  contextZoom?: boolean
}

export default function EChart({ option, height = 320, onEvents, downloadName = 'chart', title = '', onSource, onInit, contextZoom }: Props) {
  const ref = useRef<ReactECharts>(null)
  const [fs, setFs] = useState(false)
  const hasCtx = !!onEvents?.contextmenu || !!contextZoom

  // Har bir instansiya (inline va fullscreen) uchun: brauzer menyusini bloklash + o'ng tugma zoom
  const setup = useCallback((inst: any) => {
    onInit?.(inst)
    if (!contextZoom) return
    try {
      inst.getZr().on('contextmenu', (e: any) => e?.event?.preventDefault?.())
      inst.on('contextmenu', (p: any) => {
        const id = p?.data?.id
        if (id) inst.dispatchAction({ type: 'sunburstRootToNode', seriesIndex: 0, targetNodeId: id })
      })
    } catch { /* noop */ }
  }, [onInit, contextZoom])

  const download = useCallback(() => {
    const inst = ref.current?.getEchartsInstance()
    if (!inst) return
    const url = inst.getDataURL({ type: 'png', pixelRatio: 2, backgroundColor: 'transparent' })
    const a = document.createElement('a')
    a.href = url
    a.download = downloadName + '.png'
    a.click()
  }, [downloadName])

  const btn = 'rounded-md border border-[var(--border)] bg-[var(--panel-2)] px-1.5 py-0.5 text-[10px] muted opacity-55 hover:opacity-100 hover:text-brand-500'

  return (
    <div className="relative" style={{ height }} onContextMenu={hasCtx ? (e) => e.preventDefault() : undefined}>
      <div className="absolute right-1 top-1 z-10 flex gap-1">
        {onSource && <button onClick={onSource} title="Manba ma'lumotlari / Исходные данные" className={btn}>▦</button>}
        <button onClick={() => setFs(true)} title="Fullscreen" className={btn}>⤢</button>
        <button onClick={download} title="PNG" className={btn}>⤓</button>
      </div>
      <ReactECharts
        ref={ref}
        option={option}
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'canvas' }}
        notMerge={true}
        lazyUpdate={true}
        onEvents={onEvents}
        onChartReady={setup}
      />

      <Modal open={fs} onClose={() => setFs(false)} title={title || downloadName}>
        <div className="h-full w-full">
          <ReactECharts
            option={option}
            style={{ height: '100%', width: '100%', minHeight: '70vh' }}
            opts={{ renderer: 'canvas' }}
            notMerge={true}
            onEvents={onEvents}
            onChartReady={setup}
          />
        </div>
      </Modal>
    </div>
  )
}
