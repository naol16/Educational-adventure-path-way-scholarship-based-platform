"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Play, Pause, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { ExamShell } from "@/components/mock-exam/exam-shell"
import { QuestionRenderer } from "@/components/mock-exam/question-renderer"
import { QuestionGrid } from "@/components/mock-exam/question-grid"
import { listeningSections as staticListeningSections, SECTION_TIMERS_SECONDS } from "@/lib/mock-exam/mock-exam-data"
import { loadExam, saveExam } from "@/lib/mock-exam/exam-store"
import type { ListeningSection, Question } from "@/lib/mock-exam/mock-exam-data"

export default function ListeningPage() {
  const router = useRouter()
  const [sectionIdx, setSectionIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [sections, setSections] = useState<ListeningSection[]>(staticListeningSections)
  const [loaded, setLoaded] = useState(false)
  const candidate = useCandidate()

  // On mount, load dynamic content from exam store
  useEffect(() => {
    const exam = loadExam()
    setAnswers(exam.listeningAnswers)

    // Check if we have AI-generated listening content
    const dynamicListening = exam.dynamicContent?.listening
    if (dynamicListening?.sections && Array.isArray(dynamicListening.sections) && dynamicListening.sections.length > 0) {
      // Map the dynamic sections to match the expected ListeningSection type
      const mapped: ListeningSection[] = dynamicListening.sections.map((s: any) => ({
        id: s.id || "L1",
        title: s.title || "Section",
        context: s.context || "",
        transcript: s.transcript || "",
        questions: (s.questions || []).map((q: any) => ({
          id: q.id || `Q${q.number}`,
          number: q.number,
          type: q.type || "fill-blank",
          prompt: q.prompt || "",
          options: q.options,
          matchTargets: q.matchTargets,
          answer: q.answer || "",
          wordLimit: q.wordLimit,
        })),
      }))
      setSections(mapped)
      console.log(`[ListeningPage] Loaded ${mapped.length} AI-generated sections with ${mapped.reduce((a, s) => a + s.questions.length, 0)} questions.`)
    } else {
      console.log("[ListeningPage] No dynamic listening content found, using static fallback.")
    }

    setLoaded(true)
  }, [])

  const section = sections[sectionIdx]
  const allQuestions = useMemo(() => sections.flatMap((s) => s.questions), [sections])
  const numbers = allQuestions.map((q) => q.number)
  const numberToId = useMemo(
    () => Object.fromEntries(allQuestions.map((q) => [q.number, q.id])),
    [allQuestions],
  )
  const currentQuestion = section?.questions[0]?.number ?? 1

  // persist on change
  useEffect(() => {
    if (loaded) {
      saveExam({ listeningAnswers: answers })
    }
  }, [answers, loaded])

  // simulated audio progression
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  useEffect(() => {
    if (!playing) {
      if (tickRef.current) clearInterval(tickRef.current)
      return
    }
    tickRef.current = setInterval(() => {
      setProgress((p) => {
        const next = p + 0.6
        if (next >= 100) {
          setPlaying(false)
          return 100
        }
        return next
      })
    }, 1000)
    return () => {
      if (tickRef.current) clearInterval(tickRef.current)
    }
  }, [playing])

  function handleAnswer(id: string, value: string | string[]) {
    setAnswers((a) => ({ ...a, [id]: value }))
  }

  function next() {
    if (sectionIdx < sections.length - 1) {
      setSectionIdx((i) => i + 1)
      setProgress(0)
      setPlaying(false)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else {
      router.push("/dashboard/learning-path/mock-exam/reading")
    }
  }

  function prev() {
    if (sectionIdx > 0) {
      setSectionIdx((i) => i - 1)
      setProgress(0)
      setPlaying(false)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  function jump(n: number) {
    const idx = sections.findIndex((s) => s.questions.some((q) => q.number === n))
    if (idx >= 0) {
      setSectionIdx(idx)
      setTimeout(() => {
        document.getElementById(`q-${n}`)?.scrollIntoView({ behavior: "smooth", block: "center" })
      }, 50)
    }
  }

  if (!loaded || !section) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading Listening Section...</p>
        </div>
      </div>
    )
  }

  return (
    <ExamShell
      section="Listening"
      subSection={`Section ${sectionIdx + 1} of ${sections.length}`}
      totalSeconds={SECTION_TIMERS_SECONDS.listening}
      onTimeUp={() => router.push("/dashboard/learning-path/mock-exam/reading")}
      candidateName={candidate.name}
      candidateId={candidate.id}
      footer={
        <div className="space-y-3">
          <QuestionGrid
            numbers={numbers}
            answers={answers}
            numberToId={numberToId}
            current={currentQuestion}
            onJump={jump}
          />
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={prev}
              disabled={sectionIdx === 0}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="size-4" />
              Previous
            </button>
            <p className="text-xs text-muted-foreground">
              {Object.keys(answers).length} of {allQuestions.length} answered
            </p>
            <button
              onClick={next}
              className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-colors"
            >
              {sectionIdx === sections.length - 1 ? "Next Section" : "Next Section"}
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      }
    >
      {/* Audio player */}
      <div className="rounded-2xl border border-border bg-card p-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className="size-12 rounded-full bg-primary text-primary-foreground grid place-items-center hover:opacity-90 transition-opacity shrink-0"
            aria-label={playing ? "Pause audio" : "Play audio"}
          >
            {playing ? <Pause className="size-5" /> : <Play className="size-5 ml-0.5" />}
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{section.title}</p>
            <p className="text-xs text-muted-foreground truncate">{section.context}</p>
            <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              The audio plays once only. You may take notes while listening.
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-3">
        Questions {section.questions[0]?.number}–
        {section.questions[section.questions.length - 1]?.number}
      </h2>

      <div className="grid gap-3">
        {section.questions.map((q) => (
          <QuestionRenderer key={q.id} question={q} answers={answers} onChange={handleAnswer} />
        ))}
      </div>
    </ExamShell>
  )
}

function useCandidate() {
  const [c, setC] = useState({ name: "Candidate", id: "0000-1234" })
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("ielts-candidate")
      if (raw) setC(JSON.parse(raw))
    } catch {
      // ignore
    }
  }, [])
  return c
}
