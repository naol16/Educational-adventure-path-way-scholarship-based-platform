"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Mic, Square, Hourglass } from "lucide-react"
import { ExamShell } from "@/components/mock-exam/exam-shell"
import { speakingParts } from "@/lib/mock-exam/mock-exam-data"
import { formatTime } from "@/lib/mock-exam/exam-utils"
import { loadExam, saveExam } from "@/lib/mock-exam/exam-store"

type PartState = {
  phase: "idle" | "prep" | "recording" | "done"
  remaining: number
}

export default function SpeakingPage() {
  const router = useRouter()
  const [partIdx, setPartIdx] = useState(0)
  const candidate = useCandidate()
  const part = speakingParts[partIdx]

  const dynamicSpeaking = loadExam()?.dynamicContent?.speaking
  
  const currentPart = dynamicSpeaking ? {
    ...part,
    prompts: part.id === "part-1" ? dynamicSpeaking.part1 
      : part.id === "part-2" ? [dynamicSpeaking.part2.cueCard, ...dynamicSpeaking.part2.bulletPoints]
      : dynamicSpeaking.part3
  } : part

  const [state, setState] = useState<PartState>({ phase: "idle", remaining: currentPart.durationSeconds })
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [loading, setLoading] = useState(false)

  // Reset state when changing part
  useEffect(() => {
    setState({ phase: "idle", remaining: currentPart.durationSeconds })
    if (timerRef.current) clearInterval(timerRef.current)
  }, [partIdx, currentPart.durationSeconds])

  // Tick
  useEffect(() => {
    if (state.phase !== "prep" && state.phase !== "recording") return
    timerRef.current = setInterval(() => {
      setState((s) => {
        if (s.remaining <= 1) {
          if (s.phase === "prep") {
            return { phase: "recording", remaining: currentPart.durationSeconds }
          }
          return { phase: "done", remaining: 0 }
        }
        return { ...s, remaining: s.remaining - 1 }
      })
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [state.phase, currentPart.durationSeconds])

  function start() {
    if (currentPart.id === "part-2" && currentPart.prepSeconds) {
      setState({ phase: "prep", remaining: currentPart.prepSeconds })
    } else {
      setState({ phase: "recording", remaining: currentPart.durationSeconds })
    }
  }
  function stop() {
    setState({ phase: "done", remaining: 0 })
    // Simulate transcribing (in a real app, you'd send audio to Whisper API)
    const store = loadExam()
    saveExam({
      speakingTranscripts: {
        ...store.speakingTranscripts,
        [currentPart.id]: "This is a simulated transcript of the candidate's spoken response."
      }
    })
  }

  async function next() {
    if (partIdx < speakingParts.length - 1) {
      setPartIdx(partIdx + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else {
      // Evaluate!
      setLoading(true)
      try {
        const store = loadExam()
        const token = localStorage.getItem("accessToken")
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/mock-exam/evaluate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ 
            examId: store.examId,
            answers: {
              writing: {
                task1: store.writingTask1,
                task2: store.writingTask2,
              },
              speaking: store.speakingTranscripts
            }
          }),
        })

        if (!res.ok) throw new Error("Failed to evaluate")
        
        router.push("/dashboard/learning-path/mock-exam/results")
      } catch (err) {
        console.error(err)
        alert("Evaluation failed. Please try again.")
        setLoading(false)
      }
    }
  }
  function prev() {
    if (partIdx > 0) {
      setPartIdx(partIdx - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  return (
    <ExamShell
      section="Speaking"
      subSection={currentPart.title}
      totalSeconds={0}
      disableTimer
      candidateName={candidate.name}
      candidateId={candidate.id}
      footer={
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={prev}
            disabled={partIdx === 0}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="size-4" />
            Previous
          </button>
          <p className="text-xs text-muted-foreground">
            Part {partIdx + 1} of {speakingParts.length}
          </p>
          <button
            onClick={next}
            disabled={loading || (state.phase !== "done" && state.phase !== "idle")}
            className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Evaluating..." : partIdx === speakingParts.length - 1 ? "Finish & See Results" : "Next Part"}
            {!loading && <ChevronRight className="size-4" />}
          </button>
        </div>
      }
    >
      <article className="rounded-2xl border border-border bg-card p-5">
        <span className="inline-flex rounded-full bg-primary/15 text-primary px-3 py-1 text-[11px] font-semibold tracking-wider uppercase">
          {currentPart.title}
        </span>
        <p className="mt-3 text-sm text-muted-foreground text-pretty">{currentPart.description}</p>

        <div
          className={`mt-5 rounded-xl border p-4 text-sm ${
            currentPart.id === "part-2"
              ? "border-primary/40 bg-primary/5"
              : "border-border bg-muted/40"
          }`}
        >
          {currentPart.id === "part-2" ? (
            <>
              <p className="text-xs uppercase tracking-wider text-primary mb-2">Cue Card</p>
              <ul className="space-y-1.5 leading-relaxed">
                {currentPart.prompts.map((p: string, i: number) => (
                  <li key={i} className={i === 0 ? "font-semibold text-foreground" : ""}>
                    {p}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <ul className="space-y-2.5">
              {currentPart.prompts.map((p: string, i: number) => (
                <li key={i} className="flex gap-2.5">
                  <span className="text-primary font-semibold">{i + 1}.</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </article>

      {/* Recording panel */}
      <div className="mt-5 rounded-2xl border border-border bg-card p-6 flex flex-col items-center text-center">
        {state.phase === "idle" && (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              {currentPart.id === "part-2"
                ? "You will have 1 minute to prepare, then up to 2 minutes to speak."
                : "Tap the microphone to begin your response."}
            </p>
            <button
              onClick={start}
              className="flex items-center gap-2 h-14 px-8 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition-colors"
            >
              <Mic className="size-5" />
              Start
            </button>
          </>
        )}

        {state.phase === "prep" && (
          <>
            <Hourglass className="size-8 text-primary animate-pulse" />
            <p className="mt-3 text-sm text-muted-foreground">Preparation time</p>
            <p className="font-mono text-4xl font-bold tabular-nums mt-1 text-foreground">
              {formatTime(state.remaining)}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Make brief notes. Recording starts automatically.
            </p>
          </>
        )}

        {state.phase === "recording" && (
          <>
            <div className="size-16 rounded-full bg-red-500/20 grid place-items-center animate-pulse">
              <div className="size-8 rounded-full bg-red-500" />
            </div>
            <p className="mt-3 text-sm text-red-500 font-medium">Recording…</p>
            <p className="font-mono text-4xl font-bold tabular-nums mt-1 text-foreground">
              {formatTime(state.remaining)}
            </p>
            <button
              onClick={stop}
              className="mt-4 flex items-center gap-2 px-6 py-2 rounded-full bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
            >
              <Square className="size-4" />
              Stop
            </button>
          </>
        )}

        {state.phase === "done" && (
          <>
            <div className="size-12 rounded-full bg-primary/15 text-primary grid place-items-center">
              <Mic className="size-5" />
            </div>
            <p className="mt-3 font-medium text-foreground">Response saved</p>
            <p className="text-xs text-muted-foreground mt-1">
              Your answer for {currentPart.title} has been recorded for self-review.
            </p>
            <button
              onClick={start}
              className="mt-4 px-6 py-2 rounded-full border border-border text-foreground font-medium hover:bg-muted transition-colors"
            >
              Re-record
            </button>
          </>
        )}
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
