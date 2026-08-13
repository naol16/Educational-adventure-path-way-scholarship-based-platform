"use client"

/**
 * Lightweight client-side store for the in-progress mock exam.
 * Persists to sessionStorage so a refresh doesn't lose answers,
 * but clears once the candidate completes the exam.
 */

const KEY = "ielts-mock-exam-v1"

export type ExamProgress = {
  startedAt: number
  examId?: string
  dynamicContent?: any
  listeningAnswers: Record<string, string | string[]>
  readingAnswers: Record<string, string | string[]>
  writingTask1: string
  writingTask2: string
  speakingNotes: Record<string, string>
  speakingTranscripts: Record<string, string>
}

const initial: ExamProgress = {
  startedAt: 0,
  listeningAnswers: {},
  readingAnswers: {},
  writingTask1: "",
  writingTask2: "",
  speakingNotes: {},
  speakingTranscripts: {},
}

export function loadExam(): ExamProgress {
  if (typeof window === "undefined") return initial
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return initial
    return { ...initial, ...JSON.parse(raw) }
  } catch {
    return initial
  }
}

export function saveExam(progress: Partial<ExamProgress>) {
  if (typeof window === "undefined") return
  const current = loadExam()
  const next = { ...current, ...progress }
  sessionStorage.setItem(KEY, JSON.stringify(next))
}

export function resetExam() {
  if (typeof window === "undefined") return
  sessionStorage.removeItem(KEY)
}

export function startExam() {
  saveExam({ startedAt: Date.now() })
}
