"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft, Headphones, BookOpen, PenLine, Mic, ShieldCheck } from "lucide-react"
import { resetExam, startExam, saveExam } from "@/lib/mock-exam/exam-store"

const modules = [
  { icon: Headphones, label: "Listening", minutes: 30, desc: "4 sections · 40 questions", color: "text-amber-400" },
  { icon: BookOpen, label: "Reading", minutes: 60, desc: "3 passages · 40 questions", color: "text-emerald-400" },
  { icon: PenLine, label: "Writing", minutes: 60, desc: "Task 1 · 150w + Task 2 · 250w", color: "text-blue-400" },
  { icon: Mic, label: "Speaking", minutes: 14, desc: "3 parts · interview + cue card", color: "text-purple-400" },
]

export default function MockExamIntroPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [id, setId] = useState("")
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)

  const canStart = name.trim().length > 1 && id.trim().length > 1 && agreed && !loading

  async function startNow() {
    if (!canStart) return
    setLoading(true)

    try {
      const token = localStorage.getItem("accessToken")
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/mock-exam/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ examType: "IELTS" }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to generate exam")

      resetExam()
      startExam()
      saveExam({ 
        writingTask1: "", 
        writingTask2: "",
        examId: json.data.examId,
        dynamicContent: json.data.dynamicContent
      })
      sessionStorage.setItem(
        "ielts-candidate",
        JSON.stringify({ name: name.trim(), id: id.trim() }),
      )
      router.push("/dashboard/learning-path/mock-exam/listening")
    } catch (err) {
      console.error(err)
      alert("Failed to start the exam. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center gap-3">
          <Link
            href="/dashboard/learning-path"
            className="size-9 rounded-lg border border-border grid place-items-center hover:bg-muted transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="size-5 text-muted-foreground" />
          </Link>
          <div>
            <p className="text-xs text-muted-foreground leading-none">Full Mastery</p>
            <h1 className="font-semibold leading-tight">IELTS Academic Mock Exam</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        {/* Test overview */}
        <section
          aria-labelledby="overview"
          className="rounded-2xl border border-primary/30 bg-gradient-to-b from-primary/10 to-card p-5"
        >
          <h2 id="overview" className="text-lg font-semibold">
            Test overview
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            The full IELTS Academic test takes about 2 hours 45 minutes. Once you start a section,
            its timer cannot be paused — just like the real exam.
          </p>
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            {modules.map((m) => (
              <div
                key={m.label}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
              >
                <div className="size-10 rounded-lg bg-primary/15 text-primary grid place-items-center">
                  <m.icon className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium leading-tight">
                    {m.label}{" "}
                    <span className="text-muted-foreground text-sm font-normal">
                      · {m.minutes} min
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Candidate Details */}
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-lg font-semibold">Candidate details</h2>
          <p className="text-sm text-muted-foreground mt-1">
            These will appear on the exam header and your final report.
          </p>
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="name" className="text-sm font-medium text-foreground block mb-1.5">
                Full name (as on passport)
              </label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Maria Patterson"
                className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label htmlFor="id" className="text-sm font-medium text-foreground block mb-1.5">
                Candidate ID
              </label>
              <input
                id="id"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="e.g. 0234-9912"
                className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              />
            </div>
          </div>
        </section>

        {/* Rules */}
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            Test rules
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-disc list-inside">
            <li>You may not pause once a section begins.</li>
            <li>The Listening audio plays once only.</li>
            <li>Writing answers below the word limit lose marks.</li>
            <li>Speaking responses are recorded for self-review.</li>
            <li>Closing the tab will not stop the timer.</li>
          </ul>

          <label
            htmlFor="agree"
            className="mt-5 flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-3 cursor-pointer"
          >
            <div className={`mt-0.5 size-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
              agreed ? "bg-primary border-primary" : "border-muted-foreground/40"
            }`}>
              {agreed && (
                <svg className="size-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <input
              id="agree"
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="sr-only"
            />
            <span className="text-sm">
              I confirm I am ready to take the full mock exam under real conditions.
            </span>
          </label>
        </section>

        <button
          onClick={startNow}
          disabled={!canStart || loading}
          className={`w-full h-14 rounded-2xl text-base font-bold tracking-wide transition-all duration-300 ${
            (canStart && !loading)
              ? "bg-primary text-primary-foreground hover:opacity-90 shadow-lg"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin size-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Generating Exam...
            </span>
          ) : "Begin Listening Section"}
        </button>
      </main>
    </div>
  )
}
