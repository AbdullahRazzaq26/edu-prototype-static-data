/**
 * data.js
 * ------------------------------------------------------------------
 * Single source of truth for ALL demo/prototype data.
 *
 * This is a PROTOTYPE. There is no OCR, no AI model, and no database
 * behind this file. Every value below describes ONE fictional child
 * — Ayaan Malik — so the whole app tells one coherent, internally
 * consistent learning story (dashboard, scan results, patterns,
 * charts, recommendations, and profile all agree with each other).
 *
 * "Ayaan Malik" and every score, date, and note below is entirely
 * fictional demonstration content, invented for this prototype. It
 * is not a real child, a real assessment, or a real diagnosis.
 *
 * The PLACEHOLDER constant is kept for architectural consistency and
 * for any field that should genuinely stay unspecified until a real
 * production data source exists.
 * ------------------------------------------------------------------
 */

const PLACEHOLDER = "DATA WILL BE ENTERED LATER";

/* ------------------------------------------------------------------
 * Child profile
 * ------------------------------------------------------------------ */
const childData = {
  name: "Ayaan Malik",
  age: "10",
  grade: "5",
  avatarInitials: "AM",
  overallProgress: 78, // 0–100
  assignmentsAnalyzed: "12",
  memberSince: "September 2025",
  learningJourneyNote: "Ayaan is showing steady progress across core subjects. His strongest areas are reading comprehension and written expression, while multi-step mathematics problems and fraction concepts continue to need focused practice."
};

/* ------------------------------------------------------------------
 * Subject cards (Mathematics is the area needing the most attention;
 * Reading is the strongest area — this thread runs through every
 * other screen in the app).
 * ------------------------------------------------------------------ */
const subjectsData = [
  { id: "math",    name: "Mathematics", icon: "calculator",  progress: 68, trend: "Improving", status: "Needs attention" },
  { id: "english", name: "English",     icon: "book-open",   progress: 82, trend: "Improving", status: "Strong performance" },
  { id: "reading", name: "Reading",     icon: "book-marked", progress: 88, trend: "Improving", status: "Strong area" },
  { id: "writing", name: "Writing",     icon: "pencil-line", progress: 76, trend: "Stable",    status: "Developing steadily" }
];

/* ------------------------------------------------------------------
 * Recently analyzed homework (dashboard list, most recent first).
 * Mathematics trending 64% → 68% agrees with subjectsData's
 * "Improving" trend despite still needing attention.
 * ------------------------------------------------------------------ */
const recentHomeworkData = [
  { id: 1, subject: "Mathematics", date: "09 Feb 2026", score: "68%", status: "Needs attention" },
  { id: 2, subject: "English",     date: "06 Feb 2026", score: "84%", status: "Improving" },
  { id: 3, subject: "Reading",     date: "03 Feb 2026", score: "91%", status: "Strong" },
  { id: 4, subject: "Mathematics", date: "30 Jan 2026", score: "64%", status: "Needs attention" },
  { id: 5, subject: "Writing",     date: "27 Jan 2026", score: "78%", status: "Stable" }
];

/* ------------------------------------------------------------------
 * Key insight cards (dashboard). "type" drives icon + accent colour.
 * ------------------------------------------------------------------ */
const insightsData = [
  { type: "improving", icon: "trending-up", label: "Improving in",               text: "Reading comprehension and identifying key ideas in longer passages" },
  { type: "practice",  icon: "target",      label: "Needs more practice in",     text: "Multi-step fraction problems in Mathematics" },
  { type: "pattern",   icon: "link-2",      label: "Recurring pattern detected", text: "Repeated difficulty keeping accuracy across multi-step fraction questions" },
  { type: "strength",  icon: "star",        label: "Strong area",                text: "Reading comprehension and written expression" }
];

/* ------------------------------------------------------------------
 * Predefined "scanned homework" samples.
 * In production, OCR + AI would decide which analysis applies to a
 * given photo. Here, selection is simulated by simple rotation
 * (see scanner.js) so the demo can show more than one possible
 * result without doing any real image recognition. Each sample's
 * story matches the same subject performance used everywhere else.
 * ------------------------------------------------------------------ */
const demoHomeworkSamples = [
  {
    id: 1,
    subject: "Mathematics",
    date: "09 Feb 2026",
    analysis: {
      overallPerformance: 68,
      correctAnswers: "17 / 25",
      strengths: [
        "Basic multiplication and division",
        "Identifying simple fraction representations"
      ],
      areasOfDifficulty: [
        "Adding fractions with unlike denominators",
        "Maintaining accuracy across multi-step problems"
      ],
      recommendedPractice: [
        "Practice equivalent fractions using visual models",
        "Complete short multi-step fraction exercises"
      ]
    }
  },
  {
    id: 2,
    subject: "English",
    date: "06 Feb 2026",
    analysis: {
      overallPerformance: 84,
      correctAnswers: "21 / 25",
      strengths: [
        "Vocabulary recognition",
        "Understanding sentence meaning"
      ],
      areasOfDifficulty: [
        "Subject-verb agreement in longer sentences",
        "Punctuation in compound sentences"
      ],
      recommendedPractice: [
        "Practice subject-verb agreement with varied sentence lengths",
        "Complete short punctuation exercises"
      ]
    }
  },
  {
    id: 3,
    subject: "Reading",
    date: "03 Feb 2026",
    analysis: {
      overallPerformance: 91,
      correctAnswers: "23 / 25",
      strengths: [
        "Identifying the main idea",
        "Understanding details and context"
      ],
      areasOfDifficulty: [
        "Inferring meaning from unfamiliar phrases",
        "Supporting answers with evidence from the passage"
      ],
      recommendedPractice: [
        "Practice short inference questions",
        "Highlight evidence from the passage when answering"
      ]
    }
  }
];

/* ------------------------------------------------------------------
 * Pattern timeline — this is the core conceptual feature of the
 * product: no single assignment is treated as evidence of anything.
 * Structure preserved exactly as designed (4 assignments, states
 * observed → repeated → repeated → improving).
 * ------------------------------------------------------------------ */
const patternTimeline = [
  { assignment: 1, label: "Assignment 1", state: "observed",  note: "Pattern observed" },
  { assignment: 2, label: "Assignment 2", state: "repeated",  note: "Pattern repeated" },
  { assignment: 3, label: "Assignment 3", state: "repeated",  note: "Pattern repeated" },
  { assignment: 4, label: "Assignment 4", state: "improving", note: "Pattern improving" }
];

const patternTimelineMeta = {
  assignmentsAnalyzed: "12",
  summary: "A recurring difficulty with multi-step fraction problems appeared across several mathematics assignments, with accuracy showing early signs of improvement after targeted practice."
};

/* ------------------------------------------------------------------
 * Recurring learning patterns (dedicated section) — all three tie
 * back to the same subjects already established above.
 * ------------------------------------------------------------------ */
const recurringPatternsData = [
  { pattern: "Multi-step fraction problems",        frequency: "4 of 6 mathematics assignments", trend: "Improving",        status: "improving" },
  { pattern: "Punctuation in compound sentences",    frequency: "3 of 5 English assignments",     trend: "Stable",           status: "stable" },
  { pattern: "Difficulty extracting evidence from text", frequency: "3 of 4 reading assignments", trend: "Needs monitoring", status: "attention" }
];

/* Professional-guidance banner shown only when a pattern has persisted.
 * Copy is fixed product language (not a diagnosis) and must never be
 * replaced with diagnostic language. */
const professionalGuidance = {
  show: true,
  heading: "Persistent Pattern Observed",
  body: "Some learning patterns have appeared repeatedly across multiple assignments. Continued monitoring may be helpful.",
  action: "Consider discussing persistent concerns with a qualified teacher or educational professional.",
  disclaimer: "This is not a medical diagnosis. Prototype Analysis is based on demonstration data only."
};

/* ------------------------------------------------------------------
 * Progress charts (Chart.js). Values now reflect the same fictional
 * child's story: overall score climbing 62 → 78 across 5 tracked
 * assignments, and subject performance matching subjectsData above.
 * ------------------------------------------------------------------ */
const progressChartData = {
  overallOverTime: {
    labels: ["Assignment 1", "Assignment 2", "Assignment 3", "Assignment 4", "Assignment 5"],
    values: [62, 66, 69, 73, 78]
  },
  subjectPerformance: {
    labels: ["Mathematics", "English", "Reading", "Writing"],
    values: [68, 82, 88, 76]
  }
};

/* Strengths / Areas-to-improve mini-cards on the Progress screen —
 * read by dashboard.js instead of being hardcoded there, so this
 * stays in sync with the rest of the child's story in one place. */
const progressHighlights = {
  strengths: [
    "Reading comprehension and identifying key ideas",
    "Vocabulary recognition and written expression"
  ],
  improvements: [
    "Multi-step fraction problems in Mathematics",
    "Maintaining accuracy across longer written responses"
  ]
};

/* ------------------------------------------------------------------
 * Personalized recommended activities — each responds directly to
 * an observed strength or difficulty above.
 * ------------------------------------------------------------------ */
const recommendationsData = [
  {
    id: "reading-practice",
    icon: "book-open",
    title: "Reading practice",
    reason: "Reading comprehension is a strong area, and inference practice can help extend this skill further.",
    duration: "15 minutes",
    difficulty: "Moderate",
    description: "Read a short passage and answer questions that require identifying clues and making simple inferences."
  },
  {
    id: "math-exercises",
    icon: "calculator",
    title: "Math exercises",
    reason: "Recent assignments show that multi-step fraction problems need additional practice.",
    duration: "20 minutes",
    difficulty: "Moderate",
    description: "Practice equivalent fractions, common denominators, and short multi-step fraction problems."
  },
  {
    id: "spelling-practice",
    icon: "spell-check",
    title: "Spelling practice",
    reason: "Regular spelling practice can reinforce accuracy during written work.",
    duration: "10 minutes",
    difficulty: "Easy",
    description: "Complete a short set of age-appropriate spelling and word-pattern exercises."
  },
  {
    id: "writing-exercise",
    icon: "pencil-line",
    title: "Writing exercise",
    reason: "Written responses are developing steadily and can benefit from structured practice.",
    duration: "15 minutes",
    difficulty: "Moderate",
    description: "Write a short paragraph using correct punctuation, sentence structure, and supporting details."
  }
];

/* ------------------------------------------------------------------
 * Loading / analysis-simulation steps — purely a visual simulation,
 * no AI model or OCR engine is called.
 * ------------------------------------------------------------------ */
const analysisSteps = [
  "Reading homework...",
  "Checking responses...",
  "Analyzing learning patterns...",
  "Preparing personalized insights...",
  "Analysis complete"
];

/* ------------------------------------------------------------------
 * About / prototype & privacy copy
 * ------------------------------------------------------------------ */
const aboutData = {
  prototypeStatement: "This prototype demonstrates the intended workflow of an AI-assisted learning platform.",
  futureTech: [
    "OCR (optical character recognition)",
    "AI-based learning pattern analysis",
    "Longitudinal learning analytics",
    "Personalized recommendations",
    "Secure cloud storage"
  ],
  currentState: "The current version uses demonstration data only. No AI model, OCR engine, or backend server is connected in this prototype.",
  privacyStatement: "Your child's learning information is treated as private educational data.",
  privacyPolicyText: "This prototype uses fictional demonstration data only. In a production system, educational records would require appropriate access controls, secure storage, and clear parental consent."
};

const futureArchitecture = [
  "Homework Image",
  "OCR",
  "AI Analysis",
  "Learning Pattern Detection",
  "Database",
  "Personalized Dashboard",
  "Recommendations"
];
