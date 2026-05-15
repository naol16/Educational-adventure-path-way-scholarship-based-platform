"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Highlighter, FileText } from "lucide-react"
import { ExamShell } from "@/components/mock-exam/exam-shell"
import { QuestionRenderer } from "@/components/mock-exam/question-renderer"
import { QuestionGrid } from "@/components/mock-exam/question-grid"
import { readingPassages, SECTION_TIMERS_SECONDS } from "@/lib/mock-exam/mock-exam-data"
import { loadExam, saveExam } from "@/lib/mock-exam/exam-store"

export default function ReadingPage() {
  const router = useRouter()
  const [passageIdx, setPassageIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [view, setView] = useState<"split" | "passage" | "questions">("split")

  const passage = readingPassages[passageIdx]
  const allQuestions = useMemo(() => readingPassages.flatMap((p) => p.questions), [])
  const numbers = allQuestions.map((q) => q.number)
  const numberToId = useMemo(
    () => Object.fromEntries(allQuestions.map((q) => [q.number, q.id])),
    [allQuestions],
  )
  const currentNumber = passage.questions[0]?.number

  useEffect(() => {
    setAnswers(loadExam().readingAnswers)
  }, [])

  useEffect(() => {
    saveExam({ readingAnswers: answers })
  }, [answers])

  function handleAnswer(id: string, value: string | string[]) {
    setAnswers((a) => ({ ...a, [id]: value }))
  }

  function next() {
    if (passageIdx < readingPassages.length - 1) {
      setPassageIdx((i) => i + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else {
      router.push("/dashboard/learning-path/mock-exam/writing")
    }
  }

  function prev() {
    if (passageIdx > 0) {
      setPassageIdx((i) => i - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  function jump(n: number) {
    const idx = readingPassages.findIndex((p) => p.questions.some((q) => q.number === n))
    if (idx >= 0) {
      setPassageIdx(idx)
      setView("questions")
      setTimeout(() => {
        document.getElementById(`q-${n}`)?.scrollIntoView({ behavior: "smooth", block: "center" })
      }, 50)
    }
  }

  const candidate = useCandidate()

  return (
    <ExamShell
      section="Reading"
      subSection={`Passage ${passageIdx + 1} of ${readingPassages.length}`}
      totalSeconds={SECTION_TIMERS_SECONDS.reading}
      onTimeUp={() => router.push("/dashboard/learning-path/mock-exam/writing")}
      candidateName={candidate.name}
      candidateId={candidate.id}
      footer={
        <div className="space-y-3">
          <QuestionGrid
            numbers={numbers}
            answers={answers}
            numberToId={numberToId}
            current={currentNumber}
            onJump={jump}
          />
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={prev}
              disabled={passageIdx === 0}
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
              {passageIdx === readingPassages.length - 1 ? "Finish Reading" : "Next Passage"}
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      }
    >
      {/* Mobile view switcher */}
      <div className="md:hidden mb-4 grid grid-cols-2 rounded-full bg-card p-1 border border-border">
        <button
          type="button"
          onClick={() => setView("passage")}
          className={`rounded-full text-sm font-semibold py-2 ${
            view === "passage" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
          }`}
        >
          <FileText className="size-4 inline mr-1.5" />
          Passage
        </button>
        <button
          type="button"
          onClick={() => setView("questions")}
          className={`rounded-full text-sm font-semibold py-2 ${
            view === "questions" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
          }`}
        >
          Questions
        </button>
      </div>

      <div className="grid md:grid-cols-2 md:gap-6">
        {/* Passage */}
        <article
          className={`rounded-2xl border border-border bg-card p-5 md:max-h-[70vh] md:overflow-y-auto ${
            view === "questions" ? "hidden md:block" : ""
          }`}
        >
          <div className="flex items-center justify-between mb-3 sticky top-0 bg-card pb-2 -mt-1">
            <h2 className="text-lg font-bold text-balance">{passage.title}</h2>
            <span
              className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground border border-border"
              title="Tip: select text to mentally highlight key info"
            >
              <Highlighter className="size-3" />
              Skim & scan
            </span>
          </div>

          <div className="space-y-4 text-sm leading-relaxed selection:bg-primary/30 selection:text-foreground">
            {passage.paragraphs.map((p) => (
              <p key={p.label} className="text-pretty">
                <span className="inline-flex size-6 items-center justify-center rounded-md bg-primary/15 text-primary text-xs font-bold mr-2 align-middle">
                  {p.label}
                </span>
                {p.text}
              </p>
            ))}
          </div>
        </article>

        {/* Questions */}
        <section
          className={`space-y-3 ${view === "passage" ? "hidden md:block" : ""}`}
          aria-label="Questions"
        >
          <h2 className="text-lg font-semibold">
            Questions {passage.questions[0].number}–
            {passage.questions[passage.questions.length - 1].number}
          </h2>
          {passage.questions.map((q) => (
            <QuestionRenderer key={q.id} question={q} answers={answers} onChange={handleAnswer} />
          ))}
        </section>
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
