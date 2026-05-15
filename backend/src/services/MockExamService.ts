import { v4 as uuidv4 } from "uuid";
import Groq from "groq-sdk";
import configs from "../config/configs.js";
import { redisConnection, isRedisAvailable } from "../config/redis.js";

const groq = new Groq({ apiKey: configs.GROQ_API_KEY as string });

/**
 * Sanitize raw LLM output into parseable JSON.
 */
function sanitizeJSON(str: string): string {
  let cleaned = str.trim();
  cleaned = cleaned.replace(/```json\s?/g, "");
  cleaned = cleaned.replace(/```\s?/g, "");

  const firstBrace = cleaned.indexOf("{");
  if (firstBrace !== -1) {
    let stack = 0, inString = false, escaped = false, lastBrace = -1;
    for (let i = firstBrace; i < cleaned.length; i++) {
      const c = cleaned[i];
      if (escaped) { escaped = false; continue; }
      if (c === "\\") { escaped = true; continue; }
      if (c === '"') { inString = !inString; continue; }
      if (!inString) {
        if (c === "{") stack++;
        if (c === "}") { stack--; if (stack === 0) { lastBrace = i; break; } }
      }
    }
    if (lastBrace !== -1) cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  cleaned = cleaned.replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F]/g, "");
  return cleaned.trim();
}

// ── Static fallback content ──
const FALLBACK_LISTENING = {
  sections: [
    {
      id: "L1",
      title: "Section 1 — Booking a holiday cottage",
      context: "A conversation between a customer and a holiday-rentals agent about booking a cottage in Cornwall.",
      transcript: "Agent: Good morning, Cornwall Cottages, how can I help? Customer: Hi, I'd like to book the Seabreeze cottage for the last week of July. My name is Patterson — P-A-T-T-E-R-S-O-N. There'll be five of us in total. We'd like to arrive on the 24th of July. Agent: Lovely. We can offer a welcome hamper for an extra £30. Customer: That sounds nice, yes please. Agent: The deposit required will be £150.",
      questions: [
        { id: "L1Q1", number: 1, type: "fill-blank", prompt: "Customer's name: Mr ______", answer: "Patterson", wordLimit: "ONE WORD" },
        { id: "L1Q2", number: 2, type: "fill-blank", prompt: "Number of guests: ______", answer: "5", wordLimit: "ONE NUMBER" },
        { id: "L1Q3", number: 3, type: "fill-blank", prompt: "Arrival date: ______ July", answer: "24", wordLimit: "ONE NUMBER" },
        { id: "L1Q4", number: 4, type: "mcq-single", prompt: "Which extra service does the customer choose?", options: [{ key: "A", label: "Daily cleaning" }, { key: "B", label: "Welcome hamper" }, { key: "C", label: "Airport transfer" }], answer: "B" },
        { id: "L1Q5", number: 5, type: "fill-blank", prompt: "Total deposit required: £______", answer: "150", wordLimit: "ONE NUMBER" },
      ],
    },
    {
      id: "L2",
      title: "Section 2 — City library tour",
      context: "A librarian welcomes new members and explains library facilities.",
      transcript: "Welcome to Eastfield Central Library. The children's section is on the ground floor. Wi-Fi and audiobook downloads are free for members. Books can be borrowed for up to 3 weeks. Late fees are 20 pence per day. Our weekly reading group is called The Thursday Club.",
      questions: [
        { id: "L2Q6", number: 6, type: "mcq-single", prompt: "The children's section is on the ____ floor.", options: [{ key: "A", label: "ground" }, { key: "B", label: "first" }, { key: "C", label: "second" }], answer: "A" },
        { id: "L2Q7", number: 7, type: "mcq-multi", prompt: "Which TWO services are FREE for members?", options: [{ key: "A", label: "Printing" }, { key: "B", label: "Wi-Fi" }, { key: "C", label: "Meeting room hire" }, { key: "D", label: "Audiobook downloads" }, { key: "E", label: "3D printing" }], answer: ["B", "D"] },
        { id: "L2Q8", number: 8, type: "fill-blank", prompt: "Maximum loan period for a book: ______ weeks", answer: "3", wordLimit: "ONE NUMBER" },
        { id: "L2Q9", number: 9, type: "fill-blank", prompt: "Late return fee per day: ______ pence", answer: "20", wordLimit: "ONE NUMBER" },
        { id: "L2Q10", number: 10, type: "fill-blank", prompt: "Name of the weekly reading club: The ______ Club", answer: "Thursday", wordLimit: "ONE WORD" },
      ],
    },
    {
      id: "L3",
      title: "Section 3 — Tutorial on a research project",
      context: "Two students discuss a sociology project with their tutor.",
      transcript: "Tutor: So Maya, Alex — the main focus of your project is elderly bus passengers. I'd advise you to change the interview locations first. Maya will be designing the questionnaire, Alex will book the interview rooms, and you'll both work on the literature review.",
      questions: [
        { id: "L3Q11", number: 11, type: "mcq-single", prompt: "What is the main focus of the students' project?", options: [{ key: "A", label: "cycling infrastructure" }, { key: "B", label: "elderly bus passengers" }, { key: "C", label: "ride-share apps" }], answer: "B" },
        { id: "L3Q12", number: 12, type: "mcq-single", prompt: "What does the tutor advise them to change first?", options: [{ key: "A", label: "the survey questions" }, { key: "B", label: "the sample size" }, { key: "C", label: "the interview locations" }], answer: "C" },
      ],
    },
    {
      id: "L4",
      title: "Section 4 — Lecture: the history of marine cartography",
      context: "An academic lecture on how sea charts evolved from the 15th century onward.",
      transcript: "Today's lecture covers four turning points in marine cartography. Portolan charts were drawn on vellum. The first printed sea atlas was published in 1584. Harrison's chronometer solved the problem of measuring longitude at sea. Modern charts are updated using bathymetric data from satellites.",
      questions: [
        { id: "L4Q14", number: 14, type: "fill-blank", prompt: "Portolan charts were drawn on ______.", answer: "vellum", wordLimit: "ONE WORD" },
        { id: "L4Q15", number: 15, type: "fill-blank", prompt: "The first printed sea atlas was published in ______.", answer: "1584", wordLimit: "ONE NUMBER" },
        { id: "L4Q16", number: 16, type: "fill-blank", prompt: "Harrison's chronometer solved the problem of measuring ______ at sea.", answer: "longitude", wordLimit: "ONE WORD" },
        { id: "L4Q17", number: 17, type: "fill-blank", prompt: "Modern charts are updated using ______ data from satellites.", answer: "bathymetric", wordLimit: "ONE WORD" },
      ],
    },
  ]
};

const FALLBACK_WRITING = {
  task1: {
    title: "Task 1",
    prompt: "Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    visualDescription: "The line graph below shows the average monthly temperatures in three cities (London, Sydney, and Cairo) from January to December. London ranges from 5°C to 23°C, peaking in July. Sydney ranges from 18°C to 26°C, with the warmest month in January. Cairo maintains temperatures between 14°C and 35°C, with the highest in August."
  },
  task2: {
    title: "Task 2",
    prompt: "Some people believe that the best way to reduce crime is to give longer prison sentences. Others, however, believe there are better alternative ways of reducing crime. Discuss both views and give your own opinion."
  }
};

const FALLBACK_SPEAKING = {
  part1: ["Where are you from?", "Do you prefer spending free time indoors or outdoors?", "What kind of music do you enjoy?"],
  part2: { cueCard: "Describe a skill you learned as a child.", bulletPoints: ["what the skill was", "who taught you", "how you learned it", "why it was important"] },
  part3: ["Do children learn skills faster than adults?", "How has the way children learn changed?"]
};


export class MockExamService {
  /**
   * Generates ALL 4 sections of the IELTS mock exam dynamically:
   *   - Listening (4 sections with scripts, questions, and correct answers)
   *   - Writing (Task 1 + Task 2 prompts)
   *   - Speaking (Part 1, 2, 3)
   *
   * Uses Groq llama-3.3-70b-versatile for quality, with static fallback.
   * Session cached in Redis for 24 hours.
   */
  static async generateExam(userId: number, examType: "IELTS" | "TOEFL" = "IELTS") {
    const examId = uuidv4();
    let dynamicContent: any = {};

    // Generate Listening + Writing + Speaking in PARALLEL for speed
    const [listeningResult, writingSpeakingResult] = await Promise.allSettled([
      this.generateListening(examType),
      this.generateWritingAndSpeaking(examType),
    ]);

    // Listening
    if (listeningResult.status === "fulfilled") {
      dynamicContent.listening = listeningResult.value;
    } else {
      console.warn("[MockExamService] Listening generation failed, using fallback:", listeningResult.reason?.message);
      dynamicContent.listening = FALLBACK_LISTENING;
    }

    // Writing + Speaking
    if (writingSpeakingResult.status === "fulfilled") {
      dynamicContent.writing = writingSpeakingResult.value.writing;
      dynamicContent.speaking = writingSpeakingResult.value.speaking;
    } else {
      console.warn("[MockExamService] Writing/Speaking generation failed, using fallback:", writingSpeakingResult.reason?.message);
      dynamicContent.writing = FALLBACK_WRITING;
      dynamicContent.speaking = FALLBACK_SPEAKING;
    }

    const sessionData = {
      examId,
      userId,
      examType,
      dynamicContent,
      createdAt: new Date().toISOString(),
    };

    if (isRedisAvailable()) {
      await redisConnection.set(`mock_exam:${examId}`, JSON.stringify(sessionData), "EX", 60 * 60 * 24);
    }

    return sessionData;
  }

  /**
   * Generate 4 Listening sections with scripts and questions using Groq 70b.
   */
  private static async generateListening(examType: string) {
    const prompt = `You are an ${examType} Listening exam creator. Generate a complete Listening test with exactly 4 sections.

IMPORTANT RULES:
- Section 1: Everyday conversation (e.g. booking, inquiry). 5 questions. Mix of fill-blank and mcq-single.
- Section 2: Monologue on a general topic (e.g. tour, orientation). 5 questions. Mix of fill-blank, mcq-single, mcq-multi.
- Section 3: Academic discussion between 2-3 people. 3 questions. mcq-single questions.
- Section 4: Academic lecture. 4 questions. All fill-blank.
- Total: 17 questions numbered 1 to 17 sequentially across all sections.
- Each section needs a realistic transcript (at least 80 words), title, and context.
- For fill-blank: answers must be single words or numbers that appear in the transcript.
- For mcq-single: provide exactly 3 options with keys A, B, C.
- For mcq-multi: provide exactly 5 options with keys A, B, C, D, E. Answer is an array of 2 correct keys.
- ALL answers must be directly findable in the transcript.

Return ONLY valid JSON in this exact structure:
{
  "sections": [
    {
      "id": "L1",
      "title": "Section 1 — [topic title]",
      "context": "[brief description of the scenario]",
      "transcript": "[full realistic conversation transcript, at least 80 words]",
      "questions": [
        {
          "id": "L1Q1",
          "number": 1,
          "type": "fill-blank",
          "prompt": "The customer's surname is ______.",
          "answer": "Smith",
          "wordLimit": "ONE WORD"
        },
        {
          "id": "L1Q4",
          "number": 4,
          "type": "mcq-single",
          "prompt": "What does the customer request?",
          "options": [{"key": "A", "label": "option 1"}, {"key": "B", "label": "option 2"}, {"key": "C", "label": "option 3"}],
          "answer": "B"
        }
      ]
    }
  ]
}

Output ONLY valid JSON. No markdown, no explanation.`;

    try {
      console.log(`[MockExamService] Generating Listening section with 70b...`);
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 8000,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error("Empty listening response");

      const parsed = JSON.parse(sanitizeJSON(content));
      console.log(`[MockExamService] Listening generation successful (${parsed.sections?.length || 0} sections).`);

      // Validate structure
      if (!parsed.sections || !Array.isArray(parsed.sections) || parsed.sections.length < 2) {
        throw new Error("Invalid listening structure: insufficient sections");
      }

      // Renumber questions sequentially to ensure consistency
      let questionNumber = 1;
      parsed.sections.forEach((section: any, sIdx: number) => {
        section.id = `L${sIdx + 1}`;
        if (section.questions) {
          section.questions.forEach((q: any, qIdx: number) => {
            q.number = questionNumber;
            q.id = `L${sIdx + 1}Q${questionNumber}`;
            questionNumber++;
          });
        }
      });

      return parsed;
    } catch (err: any) {
      console.error(`[MockExamService] Listening generation error:`, err.message);
      throw err;
    }
  }

  /**
   * Generate Writing + Speaking prompts (lighter payload, uses 8b for speed).
   */
  private static async generateWritingAndSpeaking(examType: string) {
    const prompt = `You are an ${examType} exam creator. Generate Writing and Speaking prompts.

Return ONLY valid JSON:
{
  "writing": {
    "task1": {
      "title": "Task 1",
      "prompt": "A full ${examType} Task 1 prompt asking the student to summarise information.",
      "visualDescription": "A detailed description of a chart/graph/table with realistic invented data."
    },
    "task2": {
      "title": "Task 2",
      "prompt": "A realistic ${examType} essay question (e.g. 'Some people think... Discuss both views.')"
    }
  },
  "speaking": {
    "part1": ["Question about hometown?", "Question about hobbies?", "Question about work/study?"],
    "part2": {
      "cueCard": "Describe a time when you...",
      "bulletPoints": ["what it was", "when it happened", "why it was important"]
    },
    "part3": ["Abstract question 1?", "Abstract question 2?"]
  }
}

Output ONLY valid JSON.`;

    try {
      console.log(`[MockExamService] Generating Writing/Speaking with 8b...`);
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.1-8b-instant",
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error("Empty writing/speaking response");
      const parsed = JSON.parse(sanitizeJSON(content));
      console.log(`[MockExamService] Writing/Speaking generation successful.`);
      return parsed;
    } catch (err: any) {
      console.warn(`[MockExamService] 8b failed for Writing/Speaking: ${err.message}. Trying 70b...`);
      // Fallback to 70b
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
        temperature: 0.7,
      });
      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error("Empty 70b response");
      return JSON.parse(sanitizeJSON(content));
    }
  }

  /**
   * Evaluates Writing & Speaking in parallel using Groq 70b.
   * Listening & Reading are graded locally (objective answers).
   */
  static async evaluateExam(examId: string, userId: number, answers: any) {
    let session: any;

    if (isRedisAvailable()) {
      const sessionStr = await redisConnection.get(`mock_exam:${examId}`);
      if (sessionStr) session = JSON.parse(sessionStr);
    }

    if (!session) {
      throw new Error("Exam session not found or expired. Please start a new exam.");
    }

    // Grade objective sections locally (instant)
    const listeningScore = this.gradeObjective(
      session.dynamicContent?.listening?.sections,
      answers?.listening
    );

    const readingScore = this.gradeObjective(
      session.dynamicContent?.reading?.passages,
      answers?.reading
    );

    // Grade subjective sections with AI (parallel)
    const [writingResult, speakingResult] = await Promise.allSettled([
      this.evaluateWriting(session.dynamicContent?.writing, answers?.writing),
      this.evaluateSpeaking(session.dynamicContent?.speaking, answers?.speaking),
    ]);

    const resultPayload = {
      examId,
      userId,
      evaluation: {
        listening: listeningScore,
        reading: readingScore,
        writing: writingResult.status === "fulfilled"
          ? writingResult.value
          : { overallWritingBand: 5.0, error: "Evaluation failed" },
        speaking: speakingResult.status === "fulfilled"
          ? speakingResult.value
          : { overallSpeakingBand: 5.0, error: "Evaluation failed" },
      },
      evaluatedAt: new Date().toISOString(),
    };

    if (isRedisAvailable()) {
      await redisConnection.set(
        `mock_exam_result:${examId}`,
        JSON.stringify(resultPayload),
        "EX",
        60 * 60 * 24 * 7
      );
    }

    return resultPayload;
  }

  /**
   * Grade objective sections (Listening/Reading) by comparing answers to correct answers.
   * Returns { correct, total, band, details }.
   */
  private static gradeObjective(
    sections: any[] | undefined,
    answers: Record<string, string | string[]> | undefined
  ) {
    if (!sections || !answers) {
      return { correct: 0, total: 0, band: 0, details: [] };
    }

    const allQuestions = sections.flatMap((s: any) => s.questions || []);
    let correct = 0;
    const details: any[] = [];

    for (const q of allQuestions) {
      const userAnswer = answers[q.id];
      const correctAnswer = q.answer;
      let isCorrect = false;

      if (Array.isArray(correctAnswer)) {
        // Multi-select: check if arrays match
        if (Array.isArray(userAnswer)) {
          isCorrect = correctAnswer.length === userAnswer.length &&
            correctAnswer.every((a: string) => userAnswer.includes(a));
        }
      } else {
        // Single answer: case-insensitive comparison
        isCorrect = String(userAnswer || "").trim().toLowerCase() === String(correctAnswer).trim().toLowerCase();
      }

      if (isCorrect) correct++;
      details.push({ id: q.id, number: q.number, correct: isCorrect, userAnswer, correctAnswer });
    }

    const total = allQuestions.length;
    const pct = total > 0 ? correct / total : 0;

    // IELTS band approximation from percentage
    let band = 0;
    if (pct >= 0.87) band = 9;
    else if (pct >= 0.82) band = 8.5;
    else if (pct >= 0.75) band = 8;
    else if (pct >= 0.7) band = 7.5;
    else if (pct >= 0.62) band = 7;
    else if (pct >= 0.55) band = 6.5;
    else if (pct >= 0.47) band = 6;
    else if (pct >= 0.4) band = 5.5;
    else if (pct >= 0.32) band = 5;
    else if (pct >= 0.25) band = 4.5;
    else if (pct >= 0.17) band = 4;
    else if (pct >= 0.1) band = 3.5;
    else band = 3;

    return { correct, total, band, details };
  }

  /**
   * Grade Writing with Groq 70b.
   */
  private static async evaluateWriting(prompts: any, answers: any) {
    if (!answers || (!answers.task1 && !answers.task2)) {
      return { overallWritingBand: 0, feedback: "No writing answers provided." };
    }

    const prompt = `You are an expert IELTS Writing Examiner. Evaluate the following candidate responses.

Task 1 Prompt: ${prompts?.task1?.prompt || "N/A"}
Task 1 Visual Info: ${prompts?.task1?.visualDescription || "N/A"}
Candidate Task 1 Response: "${(answers.task1 || "").slice(0, 2000)}"

Task 2 Prompt: ${prompts?.task2?.prompt || "N/A"}
Candidate Task 2 Response: "${(answers.task2 || "").slice(0, 2000)}"

Evaluate based on Task Achievement, Coherence & Cohesion, Lexical Resource, and Grammatical Range & Accuracy.

Return ONLY valid JSON:
{
  "task1": { "band": 5.0, "feedback": "Brief feedback for task 1" },
  "task2": { "band": 5.0, "feedback": "Brief feedback for task 2" },
  "overallWritingBand": 5.0
}`;

    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.1-8b-instant",
        response_format: { type: "json_object" },
        temperature: 0.1,
      });
      return JSON.parse(sanitizeJSON(completion.choices[0]?.message?.content || "{}"));
    } catch (e: any) {
      console.error("[MockExamService] Writing Eval Error:", e.message);
      return { overallWritingBand: 5.0, error: "Evaluation failed" };
    }
  }

  /**
   * Grade Speaking with Groq 70b.
   */
  private static async evaluateSpeaking(prompts: any, answers: any) {
    if (!answers || Object.keys(answers).length === 0) {
      return { overallSpeakingBand: 0, feedback: "No speaking transcripts provided." };
    }

    const transcript = Object.entries(answers)
      .map(([key, val]) => `${key}: ${(val as string || "None").slice(0, 1000)}`)
      .join("\n");

    const prompt = `You are an expert IELTS Speaking Examiner. Evaluate the candidate's transcripts.

${transcript}

Return ONLY valid JSON:
{
  "overallSpeakingBand": 5.0,
  "feedback": "Brief feedback highlighting strengths and weaknesses."
}`;

    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.1-8b-instant",
        response_format: { type: "json_object" },
        temperature: 0.1,
      });
      return JSON.parse(sanitizeJSON(completion.choices[0]?.message?.content || "{}"));
    } catch (e: any) {
      console.error("[MockExamService] Speaking Eval Error:", e.message);
      return { overallSpeakingBand: 5.0, error: "Evaluation failed" };
    }
  }
}
