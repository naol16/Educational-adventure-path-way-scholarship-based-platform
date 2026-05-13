/**
 * Canonical IELTS / TOEFL diagnostic & mock exam shape used across
 * assessment storage, learning-path generation, and API responses.
 */

export const EXAM_SKILL_ORDER = [
  "reading",
  "listening",
  "writing",
  "speaking",
] as const;

export type ExamSkillId = (typeof EXAM_SKILL_ORDER)[number];
export type StandardExamType = "IELTS" | "TOEFL";

export function normalizeExamType(raw: string | undefined | null): StandardExamType {
  return raw && String(raw).toUpperCase() === "TOEFL" ? "TOEFL" : "IELTS";
}

/** Map arbitrary keys (Reading, READING) to canonical skill ids. */
export function canonicalSkillKey(key: string): ExamSkillId | null {
  const k = String(key).toLowerCase().trim();
  if ((EXAM_SKILL_ORDER as readonly string[]).includes(k)) return k as ExamSkillId;
  return null;
}

export function normalizeSkillNumberMap(
  raw: Record<string, unknown> | undefined | null,
): Record<ExamSkillId, number> {
  const out: Record<ExamSkillId, number> = {
    reading: 0,
    listening: 0,
    writing: 0,
    speaking: 0,
  };
  if (!raw || typeof raw !== "object") return out;
  for (const [key, val] of Object.entries(raw)) {
    const skill = canonicalSkillKey(key);
    if (!skill) continue;
    const n = typeof val === "number" ? val : parseFloat(String(val));
    if (!Number.isFinite(n)) continue;
    out[skill] = n;
  }
  return out;
}

export function normalizeSkillStringMap(
  raw: Record<string, unknown> | undefined | null,
  fallback: string,
): Record<ExamSkillId, string> {
  const out: Record<ExamSkillId, string> = {
    reading: fallback,
    listening: fallback,
    writing: fallback,
    speaking: fallback,
  };
  if (!raw || typeof raw !== "object") return out;
  for (const [key, val] of Object.entries(raw)) {
    const skill = canonicalSkillKey(key);
    if (!skill) continue;
    if (val !== undefined && val !== null) out[skill] = String(val);
  }
  return out;
}

/** IELTS: mean of four bands, rounded to nearest 0.5. TOEFL: sum of four section scores (0–120). */
export function computeOverallScore(
  breakdown: Record<ExamSkillId, number>,
  examType: StandardExamType,
): number {
  const vals = EXAM_SKILL_ORDER.map((s) => breakdown[s]);
  if (examType === "TOEFL") {
    const sum = vals.reduce((a, b) => a + b, 0);
    return Math.min(120, Math.round(sum));
  }
  const mean = vals.reduce((a, b) => a + b, 0) / 4;
  return Math.round(mean * 2) / 2;
}

export function buildExamReport(examType: StandardExamType) {
  if (examType === "TOEFL") {
    return {
      exam_type: "TOEFL" as const,
      skills: [...EXAM_SKILL_ORDER],
      section_score_range: { min: 0, max: 30 },
      overall_score_range: { min: 0, max: 120 },
      overall_rule:
        "Sum of Reading, Listening, Writing, and Speaking (each scored 0–30).",
    };
  }
  return {
    exam_type: "IELTS" as const,
    skills: [...EXAM_SKILL_ORDER],
    section_score_range: { min: 0, max: 9 },
    overall_score_range: { min: 0, max: 9 },
    overall_rule:
      "Mean of four section bands, rounded to the nearest half band (official-style).",
  };
}

export function inferExamTypeFromBreakdown(
  raw: Record<string, unknown> | undefined | null,
): StandardExamType {
  const b = normalizeSkillNumberMap(raw);
  const vals = EXAM_SKILL_ORDER.map((s) => b[s]);
  if (vals.some((v) => v > 9)) return "TOEFL";
  return "IELTS";
}

/**
 * Ensures evaluation uses canonical skill keys, correct overall, and a stable exam_report.
 * Mutates and returns the same object for convenience.
 */
export function applyStandardEvaluationShape(
  evaluation: Record<string, unknown>,
  examTypeHint?: StandardExamType | null,
): Record<string, unknown> {
  const breakdownRaw = evaluation.score_breakdown as
    | Record<string, unknown>
    | undefined;
  const notesRaw = evaluation.section_notes as
    | Record<string, unknown>
    | undefined;

  const score_breakdown = normalizeSkillNumberMap(breakdownRaw);
  const section_notes = normalizeSkillStringMap(
    notesRaw,
    "No feedback recorded for this section.",
  );

  evaluation.score_breakdown = score_breakdown;
  evaluation.section_notes = section_notes;
  const examT =
    examTypeHint ??
    inferExamTypeFromBreakdown(score_breakdown as unknown as Record<string, unknown>);
  evaluation.overall_band = computeOverallScore(score_breakdown, examT);
  evaluation.exam_report = buildExamReport(examT);

  return evaluation;
}
