"use client"

import { useEffect, useState, type ReactNode } from "react"
import { Clock, AlertTriangle } from "lucide-react"
import { formatTime } from "@/lib/mock-exam/exam-utils"

type ExamShellProps = {
  /** "Listening" | "Reading" | "Writing" | "Speaking" */
  section: string
  /** e.g. "Section 1 of 4" */
  subSection?: string
  totalSeconds: number
  onTimeUp?: () => void
  candidateName?: string
  candidateId?: string
  children: ReactNode
  /** Bottom navigation slot */
  footer?: ReactNode
  /** Disable timer (for speaking sections that are part-by-part) */
  disableTimer?: boolean
}

export function ExamShell({
  section,
  subSection,
  totalSeconds,
  onTimeUp,
  candidateName = "Candidate",
  candidateId = "0000-1234",
  children,
  footer,
  disableTimer,
}: ExamShellProps) {
  const [remaining, setRemaining] = useState(totalSeconds)

  useEffect(() => {
    if (disableTimer) return
    if (remaining <= 0) {
      onTimeUp?.()
      return
    }
    const t = setInterval(() => setRemaining((r) => r - 1), 1000)
    return () => clearInterval(t)
  }, [remaining, onTimeUp, disableTimer])

  const lowTime = !disableTimer && remaining <= 5 * 60

  return (
    <div className="min-h-dvh flex flex-col bg-background">
      {/* Top exam bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-9 rounded-lg bg-primary/15 text-primary grid place-items-center font-bold text-sm">
              IE
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground leading-none">IELTS Academic — Mock Exam</p>
              <p className="font-semibold leading-tight truncate">
                {section}
                {subSection ? (
                  <span className="text-muted-foreground font-normal"> · {subSection}</span>
                ) : null}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-[11px] text-muted-foreground leading-none">Candidate</p>
              <p className="text-sm font-medium leading-tight">
                {candidateName}{" "}
                <span className="text-muted-foreground">· {candidateId}</span>
              </p>
            </div>

            {!disableTimer && (
              <div
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 border tabular-nums font-mono text-sm ${
                  lowTime
                    ? "bg-red-500/15 text-red-500 border-red-500/40 animate-pulse"
                    : "bg-muted text-foreground border-border"
                }`}
                aria-live="polite"
              >
                {lowTime ? <AlertTriangle className="size-4" /> : <Clock className="size-4" />}
                {formatTime(remaining)}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-6">{children}</main>

      {/* Footer / nav */}
      {footer && (
        <footer className="sticky bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur">
          <div className="mx-auto max-w-5xl px-4 py-3">{footer}</div>
        </footer>
      )}
    </div>
  )
}
