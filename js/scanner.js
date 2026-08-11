/**
 * scanner.js
 * Implements the full "Scan Homework" workflow:
 *   Scanner (capture/upload) -> Preview -> Analyzing (simulated) -> Analysis Results
 *
 * No image is ever uploaded anywhere — it is read and displayed
 * entirely in the browser using FileReader, and no AI/OCR service is
 * called. The "analysis" is a predefined demo record chosen by
 * simple rotation through js/data.js -> demoHomeworkSamples.
 */

const Scanner = (() => {
  let selectedImageDataUrl = null;
  let sampleIndex = 0; // rotates through demoHomeworkSamples on each scan
  let analysisTimer = null;

  function init() {
    const cameraInput = document.getElementById("scanner-camera-input");
    const galleryInput = document.getElementById("scanner-gallery-input");

    document.getElementById("btn-take-photo").addEventListener("click", () => cameraInput.click());
    document.getElementById("btn-choose-gallery").addEventListener("click", () => galleryInput.click());

    cameraInput.addEventListener("change", (e) => handleFileSelected(e.target.files[0]));
    galleryInput.addEventListener("change", (e) => handleFileSelected(e.target.files[0]));

    document.getElementById("btn-retake").addEventListener("click", retake);
    document.getElementById("btn-analyze").addEventListener("click", startAnalysis);
    document.getElementById("btn-scan-another").addEventListener("click", () => {
      retake();
      Navigation.goTo("scanner");
    });

    Navigation.onEnter("scanner", resetScannerScreen);
    Navigation.onEnter("preview", () => {
      const img = document.getElementById("preview-image");
      if (selectedImageDataUrl) img.src = selectedImageDataUrl;
    });
    Navigation.onEnter("analyzing", runAnalysisSequence);
  }

  function handleFileSelected(file) {
    if (!file) return; // user cancelled camera/picker — return gracefully

    if (!file.type || !file.type.startsWith("image/")) {
      Utils.showToast("Please select a valid image.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      selectedImageDataUrl = e.target.result;
      Navigation.goTo("preview");
    };
    reader.onerror = () => {
      Utils.showToast("Please select a valid image.", "error");
    };
    reader.readAsDataURL(file);
  }

  function retake() {
    selectedImageDataUrl = null;
    document.getElementById("scanner-camera-input").value = "";
    document.getElementById("scanner-gallery-input").value = "";
    Navigation.goTo("scanner", { replace: true });
  }

  function resetScannerScreen() {
    const dropArea = document.getElementById("scanner-drop-area");
    dropArea.classList.remove("has-error");
  }

  function startAnalysis() {
    if (!selectedImageDataUrl) {
      Utils.showToast("Please select a homework image first.", "error");
      return;
    }
    Navigation.goTo("analyzing");
  }

  /** Drives the simulated multi-step "AI analysis" loading screen. */
  function runAnalysisSequence() {
    const listEl = document.getElementById("analysis-steps-list");
    const threadEl = document.getElementById("analysis-thread");
    listEl.innerHTML = "";
    threadEl.innerHTML = "";
    clearTimeout(analysisTimer);

    analysisSteps.forEach((label, i) => {
      const li = document.createElement("li");
      li.className = "analysis-step";
      li.id = `analysis-step-${i}`;
      li.innerHTML = `
        <span class="analysis-step__dot"><i data-lucide="loader-2"></i></span>
        <span class="analysis-step__label">${Utils.escapeHTML(label)}</span>`;
      listEl.appendChild(li);

      const dot = document.createElement("span");
      dot.className = "thread-dot";
      dot.id = `thread-dot-${i}`;
      threadEl.appendChild(dot);
    });
    Utils.renderIcons();

    const stepDelay = 650;
    analysisSteps.forEach((_, i) => {
      analysisTimer = setTimeout(() => {
        // Mark previous step complete
        if (i > 0) {
          const prevLi = document.getElementById(`analysis-step-${i - 1}`);
          prevLi.classList.remove("is-active");
          prevLi.classList.add("is-done");
          prevLi.querySelector(".analysis-step__dot").innerHTML = '<i data-lucide="check"></i>';
          document.getElementById(`thread-dot-${i - 1}`).classList.add("is-lit");
        }
        const li = document.getElementById(`analysis-step-${i}`);
        li.classList.add("is-active");
        Utils.renderIcons();

        if (i === analysisSteps.length - 1) {
          const lastLi = document.getElementById(`analysis-step-${i}`);
          setTimeout(() => {
            lastLi.classList.remove("is-active");
            lastLi.classList.add("is-done");
            lastLi.querySelector(".analysis-step__dot").innerHTML = '<i data-lucide="check"></i>';
            document.getElementById(`thread-dot-${i}`).classList.add("is-lit");
            Utils.renderIcons();
            setTimeout(() => showResults(), 500);
          }, 500);
        }
      }, stepDelay * i);
    });
  }

  function showResults() {
    const sample = demoHomeworkSamples[sampleIndex % demoHomeworkSamples.length];
    sampleIndex += 1;
    renderAnalysisResults(sample);
    Navigation.goTo("analysis", { replace: true });
  }

  function renderAnalysisResults(sample) {
    const root = document.getElementById("analysis-results-root");
    const a = sample.analysis;

    root.innerHTML = `
      <div class="analysis-meta">
        <div class="analysis-meta__item">
          <span class="eyebrow">Subject</span>
          <strong>${Utils.displayValue(sample.subject)}</strong>
        </div>
        <div class="analysis-meta__item">
          <span class="eyebrow">Date</span>
          <strong>${Utils.displayValue(sample.date)}</strong>
        </div>
        <div class="analysis-meta__item">
          <span class="eyebrow">Correct answers</span>
          <strong>${Utils.displayValue(a.correctAnswers)}</strong>
        </div>
      </div>

      <div class="analysis-performance card">
        <div class="card__header">
          <h3>Overall Performance</h3>
          <span class="tag tag--proto">Prototype Analysis</span>
        </div>
        ${Utils.progressRing({ value: a.overallPerformance, size: 148, stroke: 14 })}
      </div>

      <div class="analysis-grid">
        <div class="card analysis-list-card analysis-list-card--strengths">
          <div class="card__header">
            <h3><i data-lucide="check-circle-2"></i> Strengths</h3>
          </div>
          <ul class="check-list">
            ${a.strengths.map((s) => `<li><i data-lucide="check"></i> ${Utils.displayValue(s)}</li>`).join("")}
          </ul>
        </div>

        <div class="card analysis-list-card analysis-list-card--improve">
          <div class="card__header">
            <h3><i data-lucide="target"></i> Areas to Improve</h3>
          </div>
          <ul class="dot-list">
            ${a.areasOfDifficulty.map((s) => `<li>${Utils.displayValue(s)}</li>`).join("")}
          </ul>
        </div>

        <div class="card analysis-list-card analysis-list-card--practice">
          <div class="card__header">
            <h3><i data-lucide="arrow-right-circle"></i> Recommended Practice</h3>
          </div>
          <ul class="arrow-list">
            ${a.recommendedPractice.map((s) => `<li><i data-lucide="arrow-right"></i> ${Utils.displayValue(s)}</li>`).join("")}
          </ul>
        </div>
      </div>

      <p class="prototype-note">
        <i data-lucide="info"></i>
        This result was generated from preloaded demonstration data, not real OCR or AI analysis.
        One homework assignment is never treated as evidence of a learning difficulty — see
        <button type="button" class="link-button" data-nav-target="patterns">Learning Patterns</button>
        for how the concept works across multiple assignments.
      </p>

      <div class="screen-actions">
        <button type="button" class="btn btn--secondary" data-nav-target="patterns">
          <i data-lucide="git-commit-horizontal"></i> View Learning Patterns
        </button>
        <button type="button" class="btn btn--primary" data-nav-target="dashboard">
          <i data-lucide="layout-dashboard"></i> Back to Dashboard
        </button>
      </div>
    `;
    Utils.renderIcons();
    Utils.animateProgressRings(root);
  }

  return { init };
})();
