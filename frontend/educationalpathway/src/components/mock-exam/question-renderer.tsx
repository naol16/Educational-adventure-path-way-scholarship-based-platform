"use client"

import type { Question } from "@/lib/mock-exam/mock-exam-data"

type Answers = Record<string, string | string[]>

type Props = {
  question: Question
  answers: Answers
  onChange: (id: string, value: string | string[]) => void
}

export function QuestionRenderer({ question, answers, onChange }: Props) {
  const value = answers[question.id]

  return (
    <div id={`q-${question.number}`} className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="shrink-0 inline-flex size-7 items-center justify-center rounded-full bg-primary/15 text-primary text-sm font-semibold">
          {question.number}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-foreground text-pretty">{question.prompt}</p>
          {question.wordLimit && (
            <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
              Write {question.wordLimit}
            </p>
          )}

          <div className="mt-4">{renderControl(question, value, onChange)}</div>
        </div>
      </div>
    </div>
  )
}

function renderControl(
  q: Question,
  value: string | string[] | undefined,
  onChange: (id: string, v: string | string[]) => void,
) {
  switch (q.type) {
    case "mcq-single": {
      const selected = typeof value === "string" ? value : ""
      return (
        <div className="grid gap-2">
          {q.options?.map((o) => (
            <label
              key={o.key}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors ${
                selected === o.key
                  ? "border-primary bg-primary/10"
                  : "border-border bg-muted/40 hover:border-primary/50"
              }`}
            >
              <input
                type="radio"
                name={q.id}
                value={o.key}
                checked={selected === o.key}
                onChange={() => onChange(q.id, o.key)}
                className="sr-only"
              />
              <div className={`size-4 rounded-full border-2 flex items-center justify-center ${
                selected === o.key ? "border-primary" : "border-muted-foreground/40"
              }`}>
                {selected === o.key && <div className="size-2 rounded-full bg-primary" />}
              </div>
              <span className="font-medium text-primary mr-1">{o.key}.</span>
              <span className="text-sm">{o.label}</span>
            </label>
          ))}
        </div>
      )
    }

    case "mcq-multi": {
      const selected = Array.isArray(value) ? value : []
      return (
        <div className="grid gap-2">
          {q.options?.map((o) => {
            const checked = selected.includes(o.key)
            return (
              <label
                key={o.key}
                className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors ${
                  checked
                    ? "border-primary bg-primary/10"
                    : "border-border bg-muted/40 hover:border-primary/50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? [...selected, o.key]
                      : selected.filter((k) => k !== o.key)
                    onChange(q.id, next)
                  }}
                  className="sr-only"
                />
                <div className={`size-4 rounded border-2 flex items-center justify-center ${
                  checked ? "border-primary bg-primary" : "border-muted-foreground/40"
                }`}>
                  {checked && (
                    <svg className="size-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <span className="font-medium text-primary mr-1">{o.key}.</span>
                <span className="text-sm">{o.label}</span>
              </label>
            )
          })}
        </div>
      )
    }

    case "true-false-ng":
    case "yes-no-ng": {
      const opts =
        q.type === "true-false-ng"
          ? ["TRUE", "FALSE", "NOT GIVEN"]
          : ["YES", "NO", "NOT GIVEN"]
      const selected = typeof value === "string" ? value : ""
      return (
        <div className="grid grid-cols-3 gap-2">
          {opts.map((o) => (
            <label
              key={o}
              className={`flex items-center justify-center rounded-lg border px-2 py-2.5 cursor-pointer transition-colors text-xs sm:text-sm font-medium ${
                selected === o
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-muted/40 hover:border-primary/50"
              }`}
            >
              <input
                type="radio"
                name={q.id}
                value={o}
                checked={selected === o}
                onChange={() => onChange(q.id, o)}
                className="sr-only"
              />
              {o}
            </label>
          ))}
        </div>
      )
    }

    case "fill-blank":
    case "short-answer": {
      return (
        <input
          type="text"
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(q.id, e.target.value)}
          placeholder="Type your answer…"
          autoComplete="off"
          className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
        />
      )
    }

    case "matching-headings":
    case "matching-features": {
      const items = q.options ?? []
      const targets = q.matchTargets ?? []
      const current = Array.isArray(value) ? value : Array(items.length).fill("")

      return (
        <div className="grid gap-3">
          {targets.length > 0 && (
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
              <p className="font-medium mb-2 text-muted-foreground">Choose from:</p>
              <ul className="grid gap-1">
                {targets.map((t) => (
                  <li key={t.key}>
                    <span className="font-semibold text-primary mr-2">{t.key}.</span>
                    <span className="text-foreground">{t.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid gap-2">
            {items.map((item, idx) => (
              <div
                key={item.key}
                className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2"
              >
                <span className="text-sm flex-1 min-w-0">{item.label}</span>
                <select
                  value={current[idx] ?? ""}
                  onChange={(e) => {
                    const next = [...current]
                    next[idx] = e.target.value
                    onChange(q.id, next)
                  }}
                  className="w-28 shrink-0 rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">—</option>
                  {targets.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.key}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )
    }
  }
}
