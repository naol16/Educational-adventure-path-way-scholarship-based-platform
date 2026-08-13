/**
 * Convert a raw correct-answer count to an approximate IELTS band score.
 * Based on publicly published IELTS Academic Listening / Reading conversion tables.
 */
export function rawToBand(correct: number, total = 40): number {
  const scaled = Math.round((correct / total) * 40)

  if (scaled >= 39) return 9.0
  if (scaled >= 37) return 8.5
  if (scaled >= 35) return 8.0
  if (scaled >= 33) return 7.5
  if (scaled >= 30) return 7.0
  if (scaled >= 27) return 6.5
  if (scaled >= 23) return 6.0
  if (scaled >= 19) return 5.5
  if (scaled >= 15) return 5.0
  if (scaled >= 13) return 4.5
  if (scaled >= 10) return 4.0
  if (scaled >= 8) return 3.5
  if (scaled >= 6) return 3.0
  if (scaled >= 4) return 2.5
  return 2.0
}

/** IELTS overall band = mean of the four module bands, rounded to nearest .5 */
export function overallBand(bands: number[]): number {
  const mean = bands.reduce((a, b) => a + b, 0) / bands.length
  return Math.round(mean * 2) / 2
}

/** Format seconds → "MM:SS" */
export function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const mm = Math.floor(s / 60)
    .toString()
    .padStart(2, "0")
  const ss = (s % 60).toString().padStart(2, "0")
  return `${mm}:${ss}`
}

/** Word count for the writing tasks */
export function wordCount(text: string): number {
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}

/** Compare a user answer to the correct answer for grading */
export function isCorrect(
  userAnswer: string | string[] | undefined,
  correct: string | string[],
): boolean {
  if (userAnswer === undefined) return false

  if (Array.isArray(correct)) {
    if (!Array.isArray(userAnswer)) return false
    if (userAnswer.length !== correct.length) return false
    const a = [...userAnswer].map((x) => x.toLowerCase().trim()).sort()
    const b = [...correct].map((x) => x.toLowerCase().trim()).sort()
    return a.every((v, i) => v === b[i])
  }

  if (Array.isArray(userAnswer)) return false
  return userAnswer.toLowerCase().trim() === correct.toLowerCase().trim()
}
