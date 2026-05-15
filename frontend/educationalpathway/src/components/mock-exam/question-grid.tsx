"use client"

type Props = {
  numbers: number[]
  answers: Record<string, string | string[]>
  /** Map question number → question id */
  numberToId: Record<number, string>
  current?: number
  onJump: (n: number) => void
}

export function QuestionGrid({ numbers, answers, numberToId, current, onJump }: Props) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-1 -mx-1 px-1 scrollbar-thin">
      {numbers.map((n) => {
        const id = numberToId[n]
        const ans = id ? answers[id] : undefined
        const answered =
          ans !== undefined &&
          ans !== "" &&
          (!Array.isArray(ans) || ans.some((x) => x !== ""))
        const isCurrent = current === n

        return (
          <button
            key={n}
            type="button"
            onClick={() => onJump(n)}
            aria-label={`Jump to question ${n}${answered ? " (answered)" : ""}`}
            className={`size-8 shrink-0 rounded-md text-xs font-mono font-medium grid place-items-center border transition-colors ${
              isCurrent
                ? "bg-primary text-primary-foreground border-primary"
                : answered
                  ? "bg-primary/15 text-primary border-primary/40"
                  : "bg-muted text-muted-foreground border-border hover:border-primary/40"
            }`}
          >
            {n}
          </button>
        )
      })}
    </div>
  )
}
