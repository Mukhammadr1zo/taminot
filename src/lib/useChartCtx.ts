import { useStore } from '../store/useStore'
import { makeT } from '../i18n/strings'
import { themeColors } from './echartsBase'

export function useChartCtx() {
  const locale = useStore((s) => s.locale)
  const theme = useStore((s) => s.theme)
  const metric = useStore((s) => s.metric)
  return {
    locale,
    theme,
    metric,
    isTonna: metric === 'tonna',
    t: makeT(locale),
    c: themeColors(theme),
  }
}
