/**
 * dashboard.js
 * Renders every screen that reads from the static data set:
 * Home, Dashboard, Progress, Learning Patterns, Recommendations,
 * Profile and About. Each render function is idempotent — safe to
 * call every time the screen is entered.
 */

const Dashboard = (() => {
  let overallChart = null;
  let subjectChart = null;

  function init() {
    Navigation.onEnter("home", renderHome);
    Navigation.onEnter("dashboard", renderDashboard);
    Navigation.onEnter("progress", renderProgress);
    Navigation.onEnter("patterns", renderPatterns);
    Navigation.onEnter("recommendations", renderRecommendations);
    Navigation.onEnter("profile", renderProfile);
    Navigation.onEnter("about", renderAbout);

    document.querySelectorAll("[data-child-name-slot]").forEach((el) => {
      el.innerHTML = Utils.displayValue(childData.name);
    });
  }

  /* ---------------------------------------------------------- HOME */
  function renderHome() {
    const root = document.getElementById("home-root");
    root.innerHTML = `
      <div class="profile-card card">
        <div class="profile-card__avatar" aria-hidden="true">${childData.avatarInitials}</div>
        <div class="profile-card__info">
          <h2>${Utils.displayValue(childData.name)}</h2>
          <div class="profile-card__meta">
            <span><i data-lucide="cake"></i> Age: ${Utils.displayValue(childData.age)}</span>
            <span><i data-lucide="graduation-cap"></i> Grade: ${Utils.displayValue(childData.grade)}</span>
          </div>
        </div>
        <div class="profile-card__progress">
          ${Utils.progressRing({ value: childData.overallProgress, size: 84, stroke: 8 })}
          <span class="progress-caption">Overall progress</span>
        </div>
      </div>

      <div class="quick-actions">
        <button type="button" class="quick-action" data-nav-target="scanner">
          <i data-lucide="scan-line"></i>
          <span>Scan Homework</span>
        </button>
        <button type="button" class="quick-action" data-nav-target="dashboard">
          <i data-lucide="layout-dashboard"></i>
          <span>View Dashboard</span>
        </button>
        <button type="button" class="quick-action" data-nav-target="progress">
          <i data-lucide="line-chart"></i>
          <span>View Progress</span>
        </button>
        <button type="button" class="quick-action" data-nav-target="recommendations">
          <i data-lucide="sparkles"></i>
          <span>Learning Activities</span>
        </button>
      </div>
    `;
    Utils.renderIcons();
    Utils.animateProgressRings(root);
  }

  /* ------------------------------------------------------ DASHBOARD */
  function renderDashboard() {
    const overallRoot = document.getElementById("dashboard-overall-root");
    overallRoot.innerHTML = `
      <div class="overall-progress-card card">
        <div>
          <span class="eyebrow">Overall Learning Progress</span>
          <h2>${Utils.displayValue(childData.name)}</h2>
          <p class="muted-text">${Utils.displayValue(childData.assignmentsAnalyzed)} assignments analyzed</p>
        </div>
        ${Utils.progressRing({ value: childData.overallProgress, size: 120, stroke: 12 })}
      </div>
    `;

    const subjectsRoot = document.getElementById("dashboard-subjects-root");
    subjectsRoot.innerHTML = subjectsData.map((s) => `
      <div class="subject-card card">
        <div class="subject-card__icon"><i data-lucide="${s.icon}"></i></div>
        <div class="subject-card__body">
          <h3>${s.name}</h3>
          <div class="mini-progress">
            <div class="mini-progress__track">
              <div class="mini-progress__fill" data-target-width="${s.progress ?? 0}" style="width:0%"></div>
            </div>
            <span class="mini-progress__value">${s.progress === null ? "—" : s.progress + "%"}</span>
          </div>
          <p class="subject-card__status">${Utils.displayValue(s.status)}</p>
        </div>
      </div>
    `).join("");
    animateMiniBars(subjectsRoot);

    const homeworkRoot = document.getElementById("dashboard-homework-root");
    homeworkRoot.innerHTML = recentHomeworkData.map((hw) => `
      <div class="homework-row">
        <div class="homework-row__icon"><i data-lucide="file-text"></i></div>
        <div class="homework-row__info">
          <strong>${hw.subject}</strong>
          <span class="muted-text">${Utils.displayValue(hw.date)}</span>
        </div>
        <div class="homework-row__score">
          <span class="badge badge--muted">${Utils.displayValue(hw.score)}</span>
        </div>
        <button type="button" class="btn btn--ghost btn--small" data-view-homework="${hw.id}">
          View Analysis
        </button>
      </div>
    `).join("");

    homeworkRoot.querySelectorAll("[data-view-homework]").forEach((btn) => {
      btn.addEventListener("click", () => openHomeworkPreviewModal(btn.dataset.viewHomework));
    });

    const insightsRoot = document.getElementById("dashboard-insights-root");
    insightsRoot.innerHTML = insightsData.map((insight) => `
      <div class="insight-card insight-card--${insight.type}">
        <div class="insight-card__icon"><i data-lucide="${insight.icon}"></i></div>
        <div>
          <span class="insight-card__label">${insight.label}</span>
          <p>${Utils.displayValue(insight.text)}</p>
        </div>
      </div>
    `).join("");

    Utils.renderIcons();
    Utils.animateProgressRings(overallRoot);
  }

  function openHomeworkPreviewModal(id) {
    const hw = recentHomeworkData.find((h) => String(h.id) === String(id));
    if (!hw) return;
    Utils.openModal(`
      <span class="eyebrow">${hw.subject}</span>
      <h3>Homework Record</h3>
      <div class="modal-meta-grid">
        <div><span class="eyebrow">Date</span><strong>${Utils.displayValue(hw.date)}</strong></div>
        <div><span class="eyebrow">Score</span><strong>${Utils.displayValue(hw.score)}</strong></div>
        <div><span class="eyebrow">Status</span><strong>${Utils.displayValue(hw.status)}</strong></div>
      </div>
      <p class="prototype-note prototype-note--inline">
        <i data-lucide="info"></i>
        This is a demo history entry. Use "Scan Homework" to walk through a full simulated
        analysis with preloaded demonstration results.
      </p>
      <div class="modal-actions">
        <button type="button" class="btn btn--primary" data-nav-target="scanner" data-modal-close>
          <i data-lucide="scan-line"></i> Scan Homework
        </button>
      </div>
    `);
  }

  /* -------------------------------------------------------- PROGRESS */
  function renderProgress() {
    renderOverallChart();
    renderSubjectChart();

    const strengthsRoot = document.getElementById("progress-strengths-root");
    strengthsRoot.innerHTML = progressHighlights.strengths.map((t) => `
      <div class="mini-card mini-card--growth">
        <i data-lucide="star"></i>
        <span>${Utils.displayValue(t)}</span>
      </div>
    `).join("");

    const improveRoot = document.getElementById("progress-improve-root");
    improveRoot.innerHTML = progressHighlights.improvements.map((t) => `
      <div class="mini-card mini-card--attention">
        <i data-lucide="target"></i>
        <span>${Utils.displayValue(t)}</span>
      </div>
    `).join("");

    Utils.renderIcons();
  }

  /** True once the Chart.js CDN script has loaded successfully. */
  function chartLibReady(canvasId) {
    if (typeof Chart !== "undefined") return true;
    const ctx = document.getElementById(canvasId);
    if (ctx) {
      const wrap = ctx.closest(".chart-wrap");
      if (wrap) {
        wrap.innerHTML = `
          <div class="chart-fallback">
            <i data-lucide="bar-chart"></i>
            <span>Chart library could not be loaded. Check your internet connection and reload.</span>
          </div>`;
        Utils.renderIcons();
      }
    }
    return false;
  }

  function renderOverallChart() {
    const ctx = document.getElementById("chart-overall");
    if (!ctx || !chartLibReady("chart-overall")) return;
    if (overallChart) overallChart.destroy();
    overallChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: progressChartData.overallOverTime.labels,
        datasets: [{
          label: "Overall progress",
          data: progressChartData.overallOverTime.values,
          borderColor: "#8f9cff",
          backgroundColor: "rgba(124,140,255,0.14)",
          borderWidth: 2.5,
          tension: 0.35,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: "#11151d",
          pointBorderColor: "#8f9cff",
          pointBorderWidth: 2,
          spanGaps: false
        }]
      },
      options: chartOptions("Score")
    });
  }

  function renderSubjectChart() {
    const ctx = document.getElementById("chart-subjects");
    if (!ctx || !chartLibReady("chart-subjects")) return;
    if (subjectChart) subjectChart.destroy();
    subjectChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: progressChartData.subjectPerformance.labels,
        datasets: [{
          label: "Subject performance",
          data: progressChartData.subjectPerformance.values,
          backgroundColor: ["#8f9cff", "#48d597", "#f2b85b", "#a4acba"],
          borderRadius: 8,
          borderSkipped: false,
          maxBarThickness: 46,
          categoryPercentage: 0.62,
          barPercentage: 0.9
        }]
      },
      options: chartOptions("Score")
    });
  }

  function chartOptions(yLabel) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 750, easing: "easeOutQuart" },
      interaction: { mode: "nearest", intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#1a202b",
          borderColor: "rgba(124,140,255,.25)",
          borderWidth: 1,
          titleFont: { family: "Montserrat", weight: "600", size: 12 },
          bodyFont: { family: "Montserrat", size: 12 },
          titleColor: "#f3f5f8",
          bodyColor: "#a4acba",
          padding: 10,
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            label: (item) => (item.raw === null ? "DATA WILL BE ENTERED LATER" : item.raw)
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          title: { display: true, text: yLabel, font: { family: "Montserrat", size: 11, weight: "500" }, color: "#a4acba" },
          ticks: { font: { family: "Montserrat", size: 11 }, color: "#697384" },
          grid: { color: "rgba(255,255,255,.06)" },
          border: { display: false }
        },
        x: {
          ticks: { font: { family: "Montserrat", size: 11 }, color: "#a4acba" },
          grid: { display: false },
          border: { display: false }
        }
      }
    };
  }

  /* -------------------------------------------------------- PATTERNS */
  function renderPatterns() {
    const timelineRoot = document.getElementById("patterns-timeline-root");
    timelineRoot.innerHTML = `
      <div class="pattern-thread">
        ${patternTimeline.map((step, i) => `
          <div class="pattern-thread__step pattern-thread__step--${step.state}">
            <span class="pattern-thread__dot"><i data-lucide="${dotIcon(step.state)}"></i></span>
            <span class="pattern-thread__label">${step.label}</span>
            <span class="pattern-thread__note">${step.note}</span>
          </div>
          ${i < patternTimeline.length - 1 ? '<span class="pattern-thread__line"></span>' : ""}
        `).join("")}
      </div>
      <p class="muted-text pattern-thread__meta">
        <i data-lucide="layers"></i>
        ${Utils.displayValue(patternTimelineMeta.assignmentsAnalyzed)} assignments analyzed to observe this pattern.
      </p>
    `;

    const recurringRoot = document.getElementById("patterns-recurring-root");
    recurringRoot.innerHTML = recurringPatternsData.map((p) => `
      <div class="card pattern-card">
        <div class="pattern-card__header">
          <h3>${Utils.displayValue(p.pattern)}</h3>
          ${Utils.statusBadge(p.status)}
        </div>
        <div class="pattern-card__meta">
          <div><span class="eyebrow">Frequency</span><strong>${Utils.displayValue(p.frequency)}</strong></div>
          <div><span class="eyebrow">Trend</span><strong>${Utils.displayValue(p.trend)}</strong></div>
        </div>
      </div>
    `).join("");

    const guidanceRoot = document.getElementById("patterns-guidance-root");
    guidanceRoot.innerHTML = professionalGuidance.show ? `
      <div class="guidance-banner">
        <div class="guidance-banner__icon"><i data-lucide="shield-alert"></i></div>
        <div>
          <h3>${professionalGuidance.heading}</h3>
          <p>${professionalGuidance.body}</p>
          <p class="guidance-banner__action">${professionalGuidance.action}</p>
          <p class="guidance-banner__disclaimer">${professionalGuidance.disclaimer}</p>
        </div>
      </div>
    ` : "";

    Utils.renderIcons();
  }

  function dotIcon(state) {
    if (state === "improving") return "trending-up";
    if (state === "repeated") return "repeat";
    return "eye";
  }

  /* -------------------------------------------------- RECOMMENDATIONS */
  function renderRecommendations() {
    const root = document.getElementById("recommendations-root");
    root.innerHTML = recommendationsData.map((r) => `
      <div class="card recommendation-card">
        <div class="recommendation-card__icon"><i data-lucide="${r.icon}"></i></div>
        <div class="recommendation-card__body">
          <h3>${r.title}</h3>
          <p class="muted-text">${Utils.displayValue(r.reason)}</p>
          <div class="recommendation-card__meta">
            <span><i data-lucide="clock"></i> ${Utils.displayValue(r.duration)}</span>
            <span><i data-lucide="gauge"></i> ${Utils.displayValue(r.difficulty)}</span>
          </div>
        </div>
        <button type="button" class="btn btn--primary btn--small" data-start-activity="${r.id}">
          Start <i data-lucide="arrow-right"></i>
        </button>
      </div>
    `).join("");

    root.querySelectorAll("[data-start-activity]").forEach((btn) => {
      btn.addEventListener("click", () => openActivityModal(btn.dataset.startActivity));
    });

    Utils.renderIcons();
  }

  function openActivityModal(id) {
    const activity = recommendationsData.find((r) => r.id === id);
    if (!activity) return;
    Utils.openModal(`
      <div class="modal-icon"><i data-lucide="${activity.icon}"></i></div>
      <h3>${activity.title}</h3>
      <p class="muted-text">${Utils.displayValue(activity.description)}</p>
      <div class="modal-meta-grid">
        <div><span class="eyebrow">Reason</span><strong>${Utils.displayValue(activity.reason)}</strong></div>
        <div><span class="eyebrow">Duration</span><strong>${Utils.displayValue(activity.duration)}</strong></div>
        <div><span class="eyebrow">Difficulty</span><strong>${Utils.displayValue(activity.difficulty)}</strong></div>
      </div>
      <p class="prototype-note prototype-note--inline">
        <i data-lucide="info"></i>
        This prototype does not include a playable activity — the production
        version would launch an interactive exercise here.
      </p>
      <div class="modal-actions">
        <button type="button" class="btn btn--primary" data-modal-close>Got it</button>
      </div>
    `);
  }

  /* ------------------------------------------------------- PROFILE */
  function renderProfile() {
    const root = document.getElementById("profile-root");
    root.innerHTML = `
      <div class="profile-hero card">
        <div class="profile-card__avatar profile-card__avatar--large">${childData.avatarInitials}</div>
        <h2>${Utils.displayValue(childData.name)}</h2>
        <div class="profile-card__meta">
          <span><i data-lucide="cake"></i> Age: ${Utils.displayValue(childData.age)}</span>
          <span><i data-lucide="graduation-cap"></i> Grade: ${Utils.displayValue(childData.grade)}</span>
          <span><i data-lucide="calendar"></i> Member since: ${Utils.displayValue(childData.memberSince)}</span>
        </div>
      </div>

      <div class="profile-stats">
        <div class="card profile-stat">
          <span class="eyebrow">Total assignments analyzed</span>
          <strong>${Utils.displayValue(childData.assignmentsAnalyzed)}</strong>
        </div>
        <div class="card profile-stat">
          <span class="eyebrow">Current overall progress</span>
          ${Utils.progressRing({ value: childData.overallProgress, size: 88, stroke: 8 })}
        </div>
      </div>

      <div class="card">
        <h3>Learning Journey</h3>
        <p class="muted-text">${Utils.displayValue(childData.learningJourneyNote)}</p>
      </div>

      <div class="card settings-card">
        <h3><i data-lucide="settings"></i> Parent Settings</h3>
        <button type="button" class="settings-row" data-nav-target="about">
          <span><i data-lucide="info"></i> About this prototype</span>
          <i data-lucide="chevron-right"></i>
        </button>
        <button type="button" class="settings-row" data-nav-target="about">
          <span><i data-lucide="lock"></i> Privacy &amp; data</span>
          <i data-lucide="chevron-right"></i>
        </button>
      </div>
    `;
    Utils.renderIcons();
    Utils.animateProgressRings(root);
  }

  /* --------------------------------------------------------- ABOUT */
  function renderAbout() {
    const root = document.getElementById("about-root");
    root.innerHTML = `
      <div class="card">
        <span class="tag tag--proto">Prototype • Demonstration Version</span>
        <h3>${aboutData.prototypeStatement}</h3>
        <p class="muted-text">${aboutData.currentState}</p>
      </div>

      <div class="card">
        <h3>Future Production Architecture</h3>
        <div class="architecture-flow">
          ${futureArchitecture.map((step, i) => `
            <span class="architecture-flow__step">${step}</span>
            ${i < futureArchitecture.length - 1 ? '<i data-lucide="arrow-down" class="architecture-flow__arrow"></i>' : ""}
          `).join("")}
        </div>
      </div>

      <div class="card">
        <h3>Planned technology</h3>
        <ul class="check-list">
          ${aboutData.futureTech.map((t) => `<li><i data-lucide="check"></i> ${t}</li>`).join("")}
        </ul>
      </div>

      <div class="card">
        <h3><i data-lucide="lock"></i> Privacy</h3>
        <p class="muted-text">${aboutData.privacyStatement}</p>
        <p class="muted-text">${Utils.displayValue(aboutData.privacyPolicyText)}</p>
      </div>
    `;
    Utils.renderIcons();
  }

  /** Animate subject mini progress bars from 0 to their target width. */
  function animateMiniBars(root) {
    root.querySelectorAll(".mini-progress__fill[data-target-width]").forEach((el) => {
      const target = el.dataset.targetWidth;
      requestAnimationFrame(() => {
        el.style.width = target + "%";
      });
    });
  }

  return { init };
})();