// Rang-ko'r xavfsiz, kontrastli palitra
export const PALETTE = [
  '#3478f6', '#22c1a4', '#f5a524', '#ef5da8', '#7c5cff',
  '#19b3e6', '#ff7a45', '#52c41a', '#eb3b5a', '#a0d911',
  '#13c2c2', '#9254de', '#fa8c16', '#2f9e44', '#e64980',
  '#4c6ef5', '#15aabf', '#f76707', '#ae3ec9', '#1098ad',
]

export const PLAN_COLOR = '#9aa6bd' // reja
export const DONE_COLOR = '#3478f6' // bajarilgan
export const OVER_COLOR = '#22c1a4' // ortig'i bilan
export const UNDONE_COLOR = '#eb3b5a' // bajarilmagan

export function colorAt(i: number): string {
  return PALETTE[i % PALETTE.length]
}

// Bajarilish % bo'yicha rang (qizil -> sariq -> yashil)
export function fulfillColor(p: number): string {
  if (p >= 100) return '#22c1a4'
  if (p >= 85) return '#52c41a'
  if (p >= 70) return '#a0d911'
  if (p >= 50) return '#f5a524'
  if (p >= 30) return '#ff7a45'
  return '#eb3b5a'
}
