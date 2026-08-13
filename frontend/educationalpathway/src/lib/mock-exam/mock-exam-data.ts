/**
 * Sample IELTS Academic mock exam content.
 * Structure mirrors the real exam: Listening (4 sections, 40 Q),
 * Reading (3 passages, 40 Q), Writing (Task 1 + Task 2), Speaking (3 parts).
 *
 * Question types covered:
 *  - multiple-choice (single)
 *  - multiple-choice (multi)
 *  - true-false-ng
 *  - yes-no-ng
 *  - fill-blank (sentence/note/summary completion)
 *  - matching-headings
 *  - matching-features
 *  - short-answer
 *  - essay (writing)
 *  - speaking-prompt
 */

export type QuestionType =
  | "mcq-single"
  | "mcq-multi"
  | "true-false-ng"
  | "yes-no-ng"
  | "fill-blank"
  | "matching-headings"
  | "matching-features"
  | "short-answer"

export type Question = {
  id: string
  number: number
  type: QuestionType
  prompt: string
  /** For MCQ / matching */
  options?: { key: string; label: string }[]
  /** For matching: list of items to match against (e.g. paragraph A–F) */
  matchTargets?: { key: string; label: string }[]
  /** Correct answer(s) — string for fill/short, key for mcq, array for multi/matching */
  answer: string | string[]
  /** Word limit hint for completion questions */
  wordLimit?: string
}

export type ListeningSection = {
  id: string
  title: string
  context: string
  /** Audio script shown after exam (and used as audio in real test) */
  transcript: string
  questions: Question[]
}

export type ReadingPassage = {
  id: string
  title: string
  /** Paragraphs labelled A, B, C... for matching */
  paragraphs: { label: string; text: string }[]
  questions: Question[]
}

export type WritingTask = {
  id: "task-1" | "task-2"
  title: string
  prompt: string
  /** Optional visual data description (chart/diagram) for Task 1 */
  visualDescription?: string
  minWords: number
  recommendedMinutes: number
}

export type SpeakingPart = {
  id: "part-1" | "part-2" | "part-3"
  title: string
  description: string
  /** Part 1/3: question list. Part 2: cue card bullets. */
  prompts: string[]
  /** Seconds allowed for this part */
  durationSeconds: number
  /** Part 2 only: prep time before speaking */
  prepSeconds?: number
}

// ---------- LISTENING ----------

export const listeningSections: ListeningSection[] = [
  {
    id: "L1",
    title: "Section 1 — Booking a holiday cottage",
    context:
      "A conversation between a customer and a holiday-rentals agent about booking a cottage in Cornwall.",
    transcript:
      "Agent: Good morning, Cornwall Cottages, how can I help? Customer: Hi, I'd like to book the Seabreeze cottage for the last week of July...",
    questions: [
      {
        id: "L1Q1",
        number: 1,
        type: "fill-blank",
        prompt: "Customer's name: Mr ______",
        answer: "Patterson",
        wordLimit: "ONE WORD",
      },
      {
        id: "L1Q2",
        number: 2,
        type: "fill-blank",
        prompt: "Number of guests: ______",
        answer: "5",
        wordLimit: "ONE NUMBER",
      },
      {
        id: "L1Q3",
        number: 3,
        type: "fill-blank",
        prompt: "Arrival date: ______ July",
        answer: "24",
        wordLimit: "ONE NUMBER",
      },
      {
        id: "L1Q4",
        number: 4,
        type: "mcq-single",
        prompt: "Which extra service does the customer choose?",
        options: [
          { key: "A", label: "Daily cleaning" },
          { key: "B", label: "Welcome hamper" },
          { key: "C", label: "Airport transfer" },
        ],
        answer: "B",
      },
      {
        id: "L1Q5",
        number: 5,
        type: "fill-blank",
        prompt: "Total deposit required: £______",
        answer: "150",
        wordLimit: "ONE NUMBER",
      },
    ],
  },
  {
    id: "L2",
    title: "Section 2 — City library tour",
    context: "A monologue: a librarian welcomes new members and explains library facilities.",
    transcript:
      "Welcome to Eastfield Central Library. Today I'll quickly show you our four main floors...",
    questions: [
      {
        id: "L2Q6",
        number: 6,
        type: "mcq-single",
        prompt: "The children's section is on the ____ floor.",
        options: [
          { key: "A", label: "ground" },
          { key: "B", label: "first" },
          { key: "C", label: "second" },
        ],
        answer: "A",
      },
      {
        id: "L2Q7",
        number: 7,
        type: "mcq-multi",
        prompt: "Which TWO services are FREE for members?",
        options: [
          { key: "A", label: "Printing" },
          { key: "B", label: "Wi-Fi" },
          { key: "C", label: "Meeting room hire" },
          { key: "D", label: "Audiobook downloads" },
          { key: "E", label: "3D printing" },
        ],
        answer: ["B", "D"],
      },
      {
        id: "L2Q8",
        number: 8,
        type: "fill-blank",
        prompt: "Maximum loan period for a book: ______ weeks",
        answer: "3",
        wordLimit: "ONE NUMBER",
      },
      {
        id: "L2Q9",
        number: 9,
        type: "fill-blank",
        prompt: "Late return fee per day: ______ pence",
        answer: "20",
        wordLimit: "ONE NUMBER",
      },
      {
        id: "L2Q10",
        number: 10,
        type: "fill-blank",
        prompt: "Name of the weekly reading club: The ______ Club",
        answer: "Thursday",
        wordLimit: "ONE WORD",
      },
    ],
  },
  {
    id: "L3",
    title: "Section 3 — Tutorial on a research project",
    context: "Two students discuss a sociology project with their tutor.",
    transcript:
      "Tutor: So Maya, Alex — talk me through where you've got to with the urban-mobility project...",
    questions: [
      {
        id: "L3Q11",
        number: 11,
        type: "mcq-single",
        prompt: "What is the main focus of the students' project?",
        options: [
          { key: "A", label: "cycling infrastructure" },
          { key: "B", label: "elderly bus passengers" },
          { key: "C", label: "ride-share apps" },
        ],
        answer: "B",
      },
      {
        id: "L3Q12",
        number: 12,
        type: "mcq-single",
        prompt: "What does the tutor advise them to change first?",
        options: [
          { key: "A", label: "the survey questions" },
          { key: "B", label: "the sample size" },
          { key: "C", label: "the interview locations" },
        ],
        answer: "C",
      },
      {
        id: "L3Q13",
        number: 13,
        type: "matching-features",
        prompt: "Match each task to the student responsible.",
        options: [
          { key: "13a", label: "Designing the questionnaire" },
          { key: "13b", label: "Booking interview rooms" },
          { key: "13c", label: "Writing the literature review" },
        ],
        matchTargets: [
          { key: "M", label: "Maya" },
          { key: "A", label: "Alex" },
          { key: "B", label: "Both" },
        ],
        answer: ["M", "A", "B"],
      },
    ],
  },
  {
    id: "L4",
    title: "Section 4 — Lecture: the history of marine cartography",
    context: "An academic lecture on how sea charts evolved from the 15th century onward.",
    transcript:
      "Today's lecture covers four turning points in marine cartography, beginning with the Portolan charts of the Mediterranean...",
    questions: [
      {
        id: "L4Q14",
        number: 14,
        type: "fill-blank",
        prompt: "Portolan charts were drawn on ______.",
        answer: "vellum",
        wordLimit: "ONE WORD",
      },
      {
        id: "L4Q15",
        number: 15,
        type: "fill-blank",
        prompt: "The first printed sea atlas was published in ______.",
        answer: "1584",
        wordLimit: "ONE NUMBER",
      },
      {
        id: "L4Q16",
        number: 16,
        type: "fill-blank",
        prompt: "Harrison's chronometer solved the problem of measuring ______ at sea.",
        answer: "longitude",
        wordLimit: "ONE WORD",
      },
      {
        id: "L4Q17",
        number: 17,
        type: "fill-blank",
        prompt: "Modern charts are updated using ______ data from satellites.",
        answer: "bathymetric",
        wordLimit: "ONE WORD",
      },
    ],
  },
]

// ---------- READING ----------

export const readingPassages: ReadingPassage[] = [
  {
    id: "R1",
    title: "Passage 1 — The return of the wolf",
    paragraphs: [
      {
        label: "A",
        text: "After more than seventy years of absence, grey wolves have begun to recolonise large areas of central Europe. Conservationists describe the comeback as one of the most striking ecological recoveries of the past century.",
      },
      {
        label: "B",
        text: "The recovery has been driven less by deliberate reintroduction and more by changing land use. Rural depopulation has allowed forests to expand, and prey species such as deer and wild boar have multiplied dramatically.",
      },
      {
        label: "C",
        text: "Not everyone welcomes the wolves' return. Sheep farmers in Germany, France and Switzerland report rising livestock losses, and several national parliaments have debated whether to relax protection laws.",
      },
      {
        label: "D",
        text: "Researchers stress that wolves rarely target livestock when wild prey is abundant and where electric fencing and guard dogs are used. Studies in Saxony found livestock attacks fell by 70% on protected farms.",
      },
      {
        label: "E",
        text: "Wolves also influence whole ecosystems. By keeping deer numbers down, they allow young trees to regenerate, which in turn supports songbirds and small mammals — an effect ecologists call a 'trophic cascade'.",
      },
    ],
    questions: [
      {
        id: "R1Q1",
        number: 1,
        type: "matching-headings",
        prompt: "Choose the most suitable heading for each paragraph A–E.",
        options: [
          { key: "A", label: "Paragraph A" },
          { key: "B", label: "Paragraph B" },
          { key: "C", label: "Paragraph C" },
          { key: "D", label: "Paragraph D" },
          { key: "E", label: "Paragraph E" },
        ],
        matchTargets: [
          { key: "i", label: "i. A surprising natural recovery" },
          { key: "ii", label: "ii. Why the wolves came back on their own" },
          { key: "iii", label: "iii. Conflict with farmers" },
          { key: "iv", label: "iv. Effective ways to protect livestock" },
          { key: "v", label: "v. Wolves as ecosystem engineers" },
          { key: "vi", label: "vi. The economics of trophy hunting" },
        ],
        answer: ["i", "ii", "iii", "iv", "v"],
      },
      {
        id: "R1Q6",
        number: 6,
        type: "true-false-ng",
        prompt: "Wolves were deliberately reintroduced into central Europe by governments.",
        answer: "FALSE",
      },
      {
        id: "R1Q7",
        number: 7,
        type: "true-false-ng",
        prompt: "Livestock losses have risen in some European countries.",
        answer: "TRUE",
      },
      {
        id: "R1Q8",
        number: 8,
        type: "true-false-ng",
        prompt: "Most European wolves now live in protected reserves.",
        answer: "NOT GIVEN",
      },
      {
        id: "R1Q9",
        number: 9,
        type: "fill-blank",
        prompt:
          "On farms using electric fencing and guard dogs in Saxony, livestock attacks fell by ______%.",
        answer: "70",
        wordLimit: "ONE NUMBER",
      },
      {
        id: "R1Q10",
        number: 10,
        type: "fill-blank",
        prompt:
          "Ecologists describe wolves' indirect impact on songbirds and small mammals as a ______.",
        answer: "trophic cascade",
        wordLimit: "TWO WORDS",
      },
    ],
  },
  {
    id: "R2",
    title: "Passage 2 — Why we sleep less than our ancestors",
    paragraphs: [
      {
        label: "A",
        text: "Modern adults sleep, on average, about an hour less per night than people did a century ago. Researchers point to artificial light, screen use and longer working hours as the primary culprits.",
      },
      {
        label: "B",
        text: "However, anthropologists studying contemporary hunter-gatherer societies in Tanzania and Bolivia have made a surprising discovery: these groups also sleep only six to seven hours a night, despite living without electric light.",
      },
      {
        label: "C",
        text: "The findings challenge the popular idea of a 'natural' eight-hour sleep. They suggest that human sleep duration is shaped more by temperature and daylight cycles than by access to technology.",
      },
      {
        label: "D",
        text: "Even so, sleep specialists warn that quality, not just quantity, matters. Frequent waking, late bedtimes and irregular schedules are linked to a wide range of health problems, from heart disease to depression.",
      },
    ],
    questions: [
      {
        id: "R2Q11",
        number: 11,
        type: "yes-no-ng",
        prompt: "The writer believes screens are the single most important cause of poor sleep.",
        answer: "NO",
      },
      {
        id: "R2Q12",
        number: 12,
        type: "yes-no-ng",
        prompt: "Hunter-gatherer societies sleep more than people in industrialised cities.",
        answer: "NO",
      },
      {
        id: "R2Q13",
        number: 13,
        type: "yes-no-ng",
        prompt: "Sleep specialists agree that eight hours is the ideal length for everyone.",
        answer: "NOT GIVEN",
      },
      {
        id: "R2Q14",
        number: 14,
        type: "mcq-single",
        prompt: "According to the passage, sleep duration depends mainly on:",
        options: [
          { key: "A", label: "screen exposure and stress" },
          { key: "B", label: "temperature and daylight" },
          { key: "C", label: "diet and exercise" },
        ],
        answer: "B",
      },
      {
        id: "R2Q15",
        number: 15,
        type: "short-answer",
        prompt:
          "What TWO health problems are linked to poor sleep quality? (Use words from the passage.)",
        answer: "heart disease, depression",
        wordLimit: "NO MORE THAN THREE WORDS",
      },
    ],
  },
  {
    id: "R3",
    title: "Passage 3 — Designing cities for children",
    paragraphs: [
      {
        label: "A",
        text: "Urban planners are increasingly arguing that a city which works for an eight-year-old works for everyone. Child-friendly streets tend to be slower, greener and better connected.",
      },
      {
        label: "B",
        text: "Pioneering projects in Rotterdam and Tirana have widened pavements, lowered car speed limits and turned car parks into pocket parks. Independent travel by children rose by up to 40% in pilot districts.",
      },
      {
        label: "C",
        text: "Critics argue that such schemes cater to a small minority and inconvenience commuters. Supporters reply that the same streets become safer for elderly residents and disabled people too.",
      },
    ],
    questions: [
      {
        id: "R3Q16",
        number: 16,
        type: "mcq-single",
        prompt: "The main argument in Paragraph A is that:",
        options: [
          { key: "A", label: "children should be consulted in planning decisions" },
          { key: "B", label: "good design for children benefits all residents" },
          { key: "C", label: "modern cities are unsafe for children" },
        ],
        answer: "B",
      },
      {
        id: "R3Q17",
        number: 17,
        type: "fill-blank",
        prompt: "Independent travel by children rose by up to ______% in pilot districts.",
        answer: "40",
        wordLimit: "ONE NUMBER",
      },
      {
        id: "R3Q18",
        number: 18,
        type: "true-false-ng",
        prompt: "Critics believe child-friendly schemes mainly help disabled people.",
        answer: "FALSE",
      },
    ],
  },
]

// ---------- WRITING ----------

export const writingTasks: WritingTask[] = [
  {
    id: "task-1",
    title: "Writing Task 1",
    prompt:
      "The chart below shows the number of international tourists visiting four South-East Asian countries between 2010 and 2022. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    visualDescription:
      "Line chart: Thailand rises from 16M (2010) → 39M (2019), drops to 6M (2020), recovers to 22M (2022). Vietnam rises steadily from 5M to 18M then falls and partially recovers. Malaysia is highest in 2010 (24M) but is overtaken by Thailand by 2015. Indonesia grows slowly throughout.",
    minWords: 150,
    recommendedMinutes: 20,
  },
  {
    id: "task-2",
    title: "Writing Task 2",
    prompt:
      "Some people believe that universities should focus on providing skills for the workplace, while others think their main role is to support academic research. Discuss both views and give your own opinion.",
    minWords: 250,
    recommendedMinutes: 40,
  },
]

// ---------- SPEAKING ----------

export const speakingParts: SpeakingPart[] = [
  {
    id: "part-1",
    title: "Part 1 — Introduction & Interview",
    description:
      "The examiner asks you general questions about yourself and a range of familiar topics.",
    prompts: [
      "Can you tell me your full name?",
      "Where are you from?",
      "Do you work or are you a student?",
      "Let's talk about hobbies. What do you like to do in your free time?",
      "How often do you spend time outdoors?",
      "Did you enjoy studying when you were a child? Why / why not?",
    ],
    durationSeconds: 4 * 60 + 30,
  },
  {
    id: "part-2",
    title: "Part 2 — Long Turn (Cue Card)",
    description:
      "You will have 1 minute to prepare and then up to 2 minutes to speak on the topic on the card.",
    prompts: [
      "Describe a place you visited that left a strong impression on you.",
      "You should say:",
      "• where the place is",
      "• when you went there",
      "• what you did there",
      "• and explain why it left such a strong impression on you.",
    ],
    durationSeconds: 2 * 60,
    prepSeconds: 60,
  },
  {
    id: "part-3",
    title: "Part 3 — Discussion",
    description: "The examiner asks more abstract questions related to the topic in Part 2.",
    prompts: [
      "Why do people enjoy travelling to new places?",
      "Do you think tourism has more benefits or drawbacks for local communities?",
      "How has international travel changed in the last twenty years?",
      "Should governments restrict travel to environmentally sensitive areas?",
    ],
    durationSeconds: 4 * 60 + 30,
  },
]

// ---------- TIMINGS ----------

export const SECTION_TIMERS_SECONDS = {
  listening: 30 * 60,
  reading: 60 * 60,
  writing: 60 * 60,
  speaking: 14 * 60,
} as const

export const ALL_LISTENING_QUESTIONS = listeningSections.flatMap((s) => s.questions)
export const ALL_READING_QUESTIONS = readingPassages.flatMap((p) => p.questions)
