"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react"
import { ExamShell } from "@/components/mock-exam/exam-shell"
import { writingTasks, SECTION_TIMERS_SECONDS } from "@/lib/mock-exam/mock-exam-data"
import { loadExam, saveExam } from "@/lib/mock-exam/exam-store"
import { wordCount } from "@/lib/mock-exam/exam-utils"

export default function WritingPage() {
  const router = useRouter()
  const [taskIdx, setTaskIdx] = useState<0 | 1>(0)
  const [task1, setTask1] = useState("")
  const [task2, setTask2] = useState("")
  const candidate = useCandidate()

  useEffect(() => {
    const e = loadExam()
    setTask1(e.writingTask1)
    setTask2(e.writingTask2)
  }, [])

  useEffect(() => {
    saveExam({ writingTask1: task1, writingTask2: task2 })
  }, [task1, task2])

  const task = writingTasks[taskIdx]
  const dynamicTask = loadExam()?.dynamicContent?.writing?.[`task${taskIdx + 1}`]

  const currentTask = dynamicTask ? {
    ...task,
    title: dynamicTask.title || task.title,
    prompt: dynamicTask.prompt || task.prompt,
    visualDescription: dynamicTask.visualDescription || task.visualDescription
  } : task

  const value = taskIdx === 0 ? task1 : task2
  const setValue = taskIdx === 0 ? setTask1 : setTask2
  const wc = wordCount(value)
  const meetsMin = wc >= currentTask.minWords

  function next() {
    if (taskIdx === 0) {
      setTaskIdx(1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else {
      router.push("/dashboard/learning-path/mock-exam/speaking")
    }
  }

  function prev() {
    if (taskIdx === 1) {
      setTaskIdx(0)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  return (
    <ExamShell
      section="Writing"
      subSection={`${currentTask.title} · recommended ${currentTask.recommendedMinutes} min`}
      totalSeconds={SECTION_TIMERS_SECONDS.writing}
      onTimeUp={() => router.push("/dashboard/learning-path/mock-exam/speaking")}
      candidateName={candidate.name}
      candidateId={candidate.id}
      footer={
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={prev}
            disabled={taskIdx === 0}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="size-4" />
            Task 1
          </button>
          <div className="text-center">
            <p
              className={`text-sm font-mono tabular-nums ${
                meetsMin ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {wc} / {currentTask.minWords} words
            </p>
            <p className="text-[11px] text-muted-foreground">
              {meetsMin ? "Minimum reached" : "Below minimum — marks will be deducted"}
            </p>
          </div>
          <button
            onClick={next}
            className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-colors"
          >
            {taskIdx === 0 ? "Task 2" : "Finish Writing"}
            <ChevronRight className="size-4" />
          </button>
        </div>
      }
    >
      <article className="rounded-2xl border border-border bg-card p-5 mb-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="inline-flex rounded-full bg-primary/15 text-primary px-3 py-1 text-[11px] font-semibold tracking-wider uppercase">
              {currentTask.title}
            </span>
            <h2 className="mt-3 text-xl font-semibold leading-tight text-balance">
              You should write at least {currentTask.minWords} words.
            </h2>
          </div>
          <div className="text-right text-xs text-muted-foreground shrink-0">
            <p>Recommended</p>
            <p className="text-foreground font-semibold">{currentTask.recommendedMinutes} min</p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-pretty">{currentTask.prompt}</p>

        {currentTask.visualDescription && (
          <div className="mt-4 rounded-xl border border-border bg-muted/40 p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ImageIcon className="size-3.5" />
              Chart description (read carefully)
            </p>
            <p className="mt-2 text-sm leading-relaxed text-pretty">{currentTask.visualDescription}</p>
          </div>
        )}
      </article>

      <label htmlFor="answer" className="sr-only">
        Your answer
      </label>
      <textarea
        id="answer"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Begin writing here…"
        className="w-full min-h-[50vh] rounded-xl border border-border bg-card px-4 py-3 text-base leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-y transition-colors"
      />
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
