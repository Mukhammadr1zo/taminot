import type { Theme } from '../types'

export interface ThemeColors {
  text: string
  textMuted: string
  axis: string
  split: string
  tooltipBg: string
  tooltipBorder: string
  tooltipText: string
}

export function themeColors(theme: Theme): ThemeColors {
  return theme === 'dark'
    ? {
        text: '#e6ebf5', textMuted: '#93a0b8', axis: '#3a4763', split: '#222c3e',
        tooltipBg: 'rgba(20,26,38,0.96)', tooltipBorder: '#2c3a52', tooltipText: '#e6ebf5',
      }
    : {
        text: '#1a2233', textMuted: '#66718a', axis: '#c7cfde', split: '#eef1f7',
        tooltipBg: 'rgba(255,255,255,0.98)', tooltipBorder: '#dde3ee', tooltipText: '#1a2233',
      }
}

export function tooltipBase(c: ThemeColors) {
  return {
    backgroundColor: c.tooltipBg,
    borderColor: c.tooltipBorder,
    borderWidth: 1,
    textStyle: { color: c.tooltipText, fontSize: 12 },
    extraCssText: 'box-shadow:0 6px 24px rgba(0,0,0,.18);border-radius:10px;',
  }
}

export function axisLabel(c: ThemeColors, extra: Record<string, unknown> = {}) {
  return { color: c.textMuted, fontSize: 11, ...extra }
}

export function gridBase(extra: Record<string, unknown> = {}) {
  return { left: 8, right: 16, top: 28, bottom: 8, containLabel: true, ...extra }
}

export function legendBase(c: ThemeColors, extra: Record<string, unknown> = {}) {
  return { textStyle: { color: c.textMuted, fontSize: 11 }, icon: 'roundRect', itemWidth: 12, itemHeight: 8, ...extra }
}

export const labelOnBar = (c: ThemeColors) => ({
  show: true,
  color: c.text,
  fontSize: 10,
})
