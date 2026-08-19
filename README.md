# Learning Pattern Prototype

## Project
DATA WILL BE ENTERED LATER

## Description
A prototype of an AI-assisted educational platform designed to help parents
monitor their child's learning progress and identify recurring learning
patterns in homework — without diagnosing any medical or learning condition.

The core idea the prototype demonstrates: **one mistake on one assignment is
never treated as evidence of anything.** The product only surfaces a pattern
once it has been observed repeating across multiple assignments, and even
then it only ever suggests "consider discussing this with a qualified
teacher or educational professional" — it never diagnoses.

## Current Prototype
This is a **frontend-only, competition/demo prototype**. It is intentionally
simple so it can be built quickly and demonstrated live. Specifically:

- **AI is simulated.** The "Analyzing..." screen is a scripted sequence of
  `setTimeout` steps (`js/scanner.js`). No AI model or API is called.
- **OCR is simulated.** No text is actually extracted from the photographed
  homework. The camera/gallery photo is only ever read and displayed inside
  the browser via `FileReader` — it is never uploaded anywhere.
- **Data is preloaded.** Every result (scores, strengths, patterns,
  recommendations, child profile) is static demo data defined in
  `js/data.js`. Wherever a real, final value would be needed, the code uses
  the literal placeholder text `"DATA WILL BE ENTERED LATER"` (or `null` for
  numbers) instead of an invented number or name.
- **Charts are wired up but empty.** `js/dashboard.js` renders real Chart.js
  line/bar charts against `progressChartData` in `js/data.js`, but the
  values are `null` so no invented curve is drawn — only the axes/grid. Each
  chart card is labeled "Sample chart — values will be entered later."
- The prototype demonstrates the **intended UX and workflow** end-to-end:
  Welcome → Home → Scan Homework → Camera/Gallery capture → Preview →
  Simulated Analysis → Results → Learning Patterns → Progress →
  Recommendations → Profile.

## Filling in real data
All demo content lives in one file: **`js/data.js`**. Search for
`"DATA WILL BE ENTERED LATER"` and replace each occurrence with real values
(or wire the object up to a real API response) once the production backend
exists. No other file needs to change for basic content updates.

## Running the prototype
This is a static site (HTML/CSS/vanilla JS) — no build step, no npm install.

```bash
# from the project folder
python3 -m http.server 8080
# then open http://localhost:8080 in a browser
```

Or open the folder with any local dev server (VS Code "Live Server", etc.).
Opening `index.html` directly via `file://` also works, though the camera
input (`capture="environment"`) is best tested by serving over `localhost`
or HTTPS on an actual mobile device.

## Project structure
```
edu-prototype/
├── index.html            All screens (shown/hidden via JS)
├── css/
│   ├── style.css         Design tokens + component styles
│   └── responsive.css    Mobile / tablet / desktop breakpoints
├── js/
│   ├── data.js            ALL static/demo data lives here
│   ├── utils.js            Toast, modal, progress ring, badges, escaping
│   ├── navigation.js       Screen switching, sidebar / bottom-nav sync
│   ├── scanner.js          Camera/gallery capture → preview → simulated
│   │                       analysis → results rendering
│   ├── dashboard.js        Renders Home, Dashboard, Progress, Learning
│   │                       Patterns, Recommendations, Profile, About
│   └── app.js               Boots the app, wires modules together
└── README.md
```

## Future Development
The production version of this application is intended to add:

- **OCR** to read handwritten/printed homework from a photo
- **AI / LLM analysis** to identify mistakes and recurring patterns, not
  just correctness
- **A database** to store homework and results securely over time
- **Secure authentication** for parent accounts
- **Longitudinal learning analytics** — the real version of the "Learning
  Patterns" timeline in this prototype, built from real historical data
  instead of a fixed example
- **Personalized learning** activities generated from real analysis
- **Professional-referral guidance** — surfacing "talk to a teacher" advice
  based on real persistent patterns, still never as a medical diagnosis

None of the above is implemented in this repository. This prototype exists
to demonstrate the *workflow, interface, and concept* to competition judges.
