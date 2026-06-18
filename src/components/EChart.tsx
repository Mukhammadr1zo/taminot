import { useRef, useCallback } from 'react'
import ReactECharts from 'echarts-for-react'

interface Props {
  // Dinamik quriladigan ECharts option — qat'iy literal tiplardan voz kechamiz
  option: any
  height?: number
  onEvents?: Record<string, (params: any) => void>
  downloadName?: string
}

/** ECharts wrapper: PNG yuklab olish tugmasi bilan. */
export default function EChart({ option, height = 320, onEvents, downloadName = 'chart' }: Props) {
  const ref = useRef<ReactECharts>(null)

  const download = useCallback(() => {
    const inst = ref.current?.getEchartsInstance()
    if (!inst) return
    const url = inst.getDataURL({ type: 'png', pixelRatio: 2, backgroundColor: 'transparent' })
    const a = document.createElement('a')
    a.href = url
    a.download = downloadName + '.png'
    a.click()
  }, [downloadName])

  return (
    <div className="relative" style={{ height }}>
      <button
        onClick={download}
        title="PNG"
        className="absolute right-1 top-1 z-10 rounded-md border border-[var(--border)] bg-[var(--panel-2)] px-1.5 py-0.5 text-[10px] muted opacity-60 hover:opacity-100"
      >
        ⤓ PNG
      </button>
      <ReactECharts
        ref={ref}
        option={option}
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'canvas' }}
        notMerge={true}
        lazyUpdate={true}
        onEvents={onEvents}
      />
    </div>
  )
}
