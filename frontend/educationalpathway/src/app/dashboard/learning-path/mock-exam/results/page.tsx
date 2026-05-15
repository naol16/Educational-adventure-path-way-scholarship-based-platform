"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import {
  Headphones,
  BookOpen,
  PenLine,
  Mic,
  Trophy,
  RotateCcw,
  Home,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import {
  ALL_LISTENING_QUESTIONS,
  ALL_READING_QUESTIONS,
  listeningSections,
  readingPassages,
} from "@/lib/mock-exam/mock-exam-data"
import { loadExam, resetExam } from "@/lib/mock-exam/exam-store"
import { isCorrect, overallBand, rawToBand, wordCount } from "@/lib/mock-exam/exam-utils"

export default function ResultsPage() {
  const [progress, setProgress] = useState<ReturnType<typeof loadExam> | null>(null)
  const [aiResult, setAiResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const p = loadExam()
    setProgress(p)

    async function fetchAiResult() {
      if (!p?.examId) {
        setLoading(false)
        return
      }
      try {
        const token = localStorage.getItem("accessToken")
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/mock-exam/result/${p.examId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        })
        const json = await res.json()
        if (res.ok) setAiResult(json.data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }

    fetchAiResult()
  }, [])

  const summary = useMemo(() => {
    if (!progress) return null

    const listeningCorrect = ALL_LISTENING_QUESTIONS.filter((q) =>
      isCorrect(progress.listeningAnswers[q.id], q.answer),
    ).length
    const readingCorrect = ALL_READING_QUESTIONS.filter((q) =>
      isCorrect(progress.readingAnswers[q.id], q.answer),
    ).length

    const listeningBand = rawToBand(listeningCorrect, ALL_LISTENING_QUESTIONS.length)
    const readingBand = rawToBand(readingCorrect, ALL_READING_QUESTIONS.length)

    const t1Words = wordCount(progress.writingTask1)
    const t2Words = wordCount(progress.writingTask2)

    let writingBand = 5.0
    let speakingBand = 5.0
    
    if (aiResult?.evaluation) {
      writingBand = aiResult.evaluation.writing.overallWritingBand || 5.0
      speakingBand = aiResult.evaluation.speaking.overallSpeakingBand || 5.0
    } else {
      writingBand = estimateWritingBand(t1Words, t2Words)
      speakingBand = 6.5
    }

    const overall = overallBand([listeningBand, readingBand, writingBand, speakingBand])

    return {
      listeningCorrect,
      readingCorrect,
      listeningBand,
      readingBand,
      writingBand,
      speakingBand,
      overall,
      t1Words,
      t2Words,
    }
  }, [progress, aiResult])

  if (loading || !progress || !summary) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center">
        <svg className="animate-spin size-8 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <p className="text-muted-foreground font-medium">Fetching Official AI Evaluation…</p>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-background pb-12">
      {/* Hero */}
      <header className="px-5 pt-10 pb-8 text-center bg-gradient-to-b from-primary/15 to-transparent border-b border-border">
        <div className="mx-auto size-16 rounded-2xl bg-primary/20 text-primary grid place-items-center mb-3">
          <Trophy className="size-8" />
        </div>
        <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">Mock Exam Complete</p>
        <h1 className="mt-2 text-3xl font-bold">Overall Band Score</h1>
        <p className="mt-4 font-mono text-7xl font-bold tabular-nums text-primary leading-none">
          {summary.overall.toFixed(1)}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Average of your four module band scores, rounded to the nearest 0.5.
        </p>
      </header>

      <main className="mx-auto max-w-3xl px-5 mt-6 space-y-6">
        {/* Module bands */}
        <section className="grid sm:grid-cols-2 gap-3">
          <ModuleScore
            icon={Headphones}
            label="Listening"
            band={summary.listeningBand}
            detail={`${summary.listeningCorrect} / ${ALL_LISTENING_QUESTIONS.length} correct`}
          />
          <ModuleScore
            icon={BookOpen}
            label="Reading"
            band={summary.readingBand}
            detail={`${summary.readingCorrect} / ${ALL_READING_QUESTIONS.length} correct`}
          />
          <ModuleScore
            icon={PenLine}
            label="Writing"
            band={summary.writingBand}
            detail={`Task 1: ${summary.t1Words}w · Task 2: ${summary.t2Words}w`}
            note={aiResult ? "Official AI Evaluation" : "Estimated · final mark needs human review"}
          />
          <ModuleScore
            icon={Mic}
            label="Speaking"
            band={summary.speakingBand}
            detail={aiResult?.evaluation?.speaking?.feedback || "Recordings saved for self-review"}
            note={aiResult ? "Official AI Evaluation" : "Awaiting examiner feedback"}
          />
        </section>

        {/* Question-by-question review */}
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-lg font-semibold">Listening — Answer review</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Tap a question to see the correct answer.
          </p>
          <div className="mt-4 space-y-4">
            {listeningSections.map((s) => (
              <ReviewBlock
                key={s.id}
                title={s.title}
                questions={s.questions}
                answers={progress.listeningAnswers}
              />
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-lg font-semibold">Reading — Answer review</h2>
          <div className="mt-4 space-y-4">
            {readingPassages.map((p) => (
              <ReviewBlock
                key={p.id}
                title={p.title}
                questions={p.questions}
                answers={progress.readingAnswers}
              />
            ))}
          </div>
        </section>

        {aiResult?.evaluation?.writing && (
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <PenLine className="size-5 text-primary" />
              Writing — Examiner Feedback
            </h2>
            <div className="mt-4 space-y-4">
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-sm">Task 1 Feedback</h3>
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded font-mono font-bold">Band {aiResult.evaluation.writing.task1?.band}</span>
                </div>
                <p className="text-sm text-muted-foreground">{aiResult.evaluation.writing.task1?.feedback}</p>
              </div>
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-sm">Task 2 Feedback</h3>
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded font-mono font-bold">Band {aiResult.evaluation.writing.task2?.band}</span>
                </div>
                <p className="text-sm text-muted-foreground">{aiResult.evaluation.writing.task2?.feedback}</p>
              </div>
            </div>
          </section>
        )}

        {aiResult?.evaluation?.speaking && (
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Mic className="size-5 text-primary" />
              Speaking — Examiner Feedback
            </h2>
            <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
               <p className="text-sm text-muted-foreground leading-relaxed">{aiResult.evaluation.speaking.feedback}</p>
            </div>
          </section>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/dashboard/learning-path"
            className="flex items-center justify-center gap-2 h-14 rounded-2xl border border-border text-foreground hover:bg-muted font-medium transition-colors"
          >
            <Home className="size-4" />
            Back to Learn
          </Link>
          <button
            onClick={() => {
              resetExam()
              window.location.href = "/dashboard/learning-path/mock-exam"
            }}
            className="flex items-center justify-center gap-2 h-14 rounded-2xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
          >
            <RotateCcw className="size-4" />
            Retake Mock
          </button>
        </div>
      </main>
    </div>
  )
}

function estimateWritingBand(t1: number, t2: number) {
  // Very rough: rewards meeting word count, otherwise floor at 5.0
  let band = 5.0
  if (t1 >= 150) band += 0.5
  if (t1 >= 200) band += 0.5
  if (t2 >= 250) band += 0.5
  if (t2 >= 320) band += 0.5
  return Math.min(band, 7.0)
}

function ModuleScore({
  icon: Icon,
  label,
  band,
  detail,
  note,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  band: number
  detail: string
  note?: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 flex items-start gap-4">
      <div className="size-11 rounded-xl bg-primary/15 text-primary grid place-items-center shrink-0">
        <Icon className="size-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold">{label}</p>
        <p className="font-mono text-3xl font-bold text-primary tabular-nums leading-none mt-1">
          {band.toFixed(1)}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">{detail}</p>
        {note && <p className="mt-1 text-[11px] italic text-muted-foreground">{note}</p>}
      </div>
    </div>
  )
}

function ReviewBlock({
  title,
  questions,
  answers,
}: {
  title: string
  questions: import("@/lib/mock-exam/mock-exam-data").Question[]
  answers: Record<string, string | string[]>
}) {
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <ul className="mt-2 grid gap-1.5">
        {questions.map((q) => {
          const ua = answers[q.id]
          const ok = isCorrect(ua, q.answer)
          return (
            <li
              key={q.id}
              className={`flex items-start gap-3 rounded-lg border px-3 py-2 text-sm ${
                ok
                  ? "border-green-500/30 bg-green-500/5"
                  : "border-red-500/30 bg-red-500/5"
              }`}
            >
              {ok ? (
               <CheckCircle2 className="size-4 text-green-500 mt-0.5 shrink-0" />
              ) : (
                <XCircle className="size-4 text-red-500 mt-0.5 shrink-0" />
              )}
              <span className="font-mono text-xs w-6 shrink-0 text-muted-foreground">
                {q.number}.
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-foreground line-clamp-2">{q.prompt}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Your answer:{" "}
                  <span className="text-foreground">
                    {ua === undefined || ua === ""
                      ? "—"
                      : Array.isArray(ua)
                        ? ua.join(", ")
                        : ua}
                  </span>
                  {!ok && (
                    <>
                      {" · "}Correct:{" "}
                      <span className="text-primary font-medium">
                        {Array.isArray(q.answer) ? q.answer.join(", ") : q.answer}
                      </span>
                    </>
                  )}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
