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

  /* -------------------------------------------------------- PROGRESS CHARTS
   * These charts are intentionally rendered with inline SVG instead of an
   * external Chart.js CDN dependency. The prototype is expected to work
   * when opened locally/offline, so the visual chart layer must not depend
   * on an internet connection or a third-party script loading correctly.
   */

  function renderOverallChart() {
    const root = document.getElementById("chart-overall");
    if (!root) return;

    const labels = progressChartData.overallOverTime.labels;
    const values = progressChartData.overallOverTime.values;
    root.outerHTML = buildLineChartSVG(labels, values, "Overall progress");
  }

  function renderSubjectChart() {
    const root = document.getElementById("chart-subjects");
    if (!root) return;

    const labels = progressChartData.subjectPerformance.labels;
    const values = progressChartData.subjectPerformance.values;
    root.outerHTML = buildBarChartSVG(labels, values);
  }

  function buildLineChartSVG(labels, values, ariaLabel) {
    const width = 900;
    const height = 280;
    const pad = { top: 28, right: 28, bottom: 48, left: 48 };
    const innerW = width - pad.left - pad.right;
    const innerH = height - pad.top - pad.bottom;
    const max = 100;
    const min = 0;
    const xStep = labels.length > 1 ? innerW / (labels.length - 1) : innerW;

    const points = values.map((value, i) => {
      const safe = value == null ? 0 : Math.max(min, Math.min(max, Number(value)));
      return {
        x: pad.left + i * xStep,
        y: pad.top + innerH - ((safe - min) / (max - min)) * innerH,
        value: value == null ? null : safe
      };
    });

    const line = points.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
    const area = `${line} L ${points[points.length - 1].x.toFixed(1)} ${(pad.top + innerH).toFixed(1)} L ${points[0].x.toFixed(1)} ${(pad.top + innerH).toFixed(1)} Z`;
    const grid = [0, 25, 50, 75, 100].map(v => {
      const y = pad.top + innerH - (v / 100) * innerH;
      return `<line class="svg-chart__grid" x1="${pad.left}" y1="${y}" x2="${width-pad.right}" y2="${y}" />
              <text class="svg-chart__y-label" x="${pad.left-12}" y="${y+4}" text-anchor="end">${v}</text>`;
    }).join("");
    const xLabels = labels.map((label, i) => {
      const x = pad.left + i * xStep;
      return `<text class="svg-chart__x-label" x="${x}" y="${height-14}" text-anchor="middle">${Utils.escapeHTML(label)}</text>`;
    }).join("");
    const dots = points.map((p, i) => {
      const label = values[i] == null ? "DATA WILL BE ENTERED LATER" : `${values[i]}%`;
      return `<g class="svg-chart__point-group">
        <circle class="svg-chart__point-glow" cx="${p.x}" cy="${p.y}" r="9" />
        <circle class="svg-chart__point" cx="${p.x}" cy="${p.y}" r="5" />
        <title>${Utils.escapeHTML(labels[i])}: ${Utils.escapeHTML(label)}</title>
      </g>`;
    }).join("");

    return `<svg id="chart-overall" class="svg-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="${Utils.escapeHTML(ariaLabel)}" preserveAspectRatio="none">
      <defs>
        <linearGradient id="overallAreaGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#8f9cff" stop-opacity="0.24" />
          <stop offset="100%" stop-color="#8f9cff" stop-opacity="0" />
        </linearGradient>
        <filter id="chartGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="blur" />
        </filter>
      </defs>
      ${grid}
      <path class="svg-chart__area" d="${area}" />
      <path class="svg-chart__line" d="${line}" />
      ${dots}
      ${xLabels}
    </svg>`;
  }

  function buildBarChartSVG(labels, values) {
    const width = 900;
    const height = 280;
    const pad = { top: 28, right: 28, bottom: 58, left: 48 };
    const innerW = width - pad.left - pad.right;
    const innerH = height - pad.top - pad.bottom;
    const slot = innerW / labels.length;
    const barW = Math.min(70, slot * 0.52);
    const barColors = ["#8f9cff", "#48d597", "#f2b85b", "#a4acba"];

    const grid = [0, 25, 50, 75, 100].map(v => {
      const y = pad.top + innerH - (v / 100) * innerH;
      return `<line class="svg-chart__grid" x1="${pad.left}" y1="${y}" x2="${width-pad.right}" y2="${y}" />
              <text class="svg-chart__y-label" x="${pad.left-12}" y="${y+4}" text-anchor="end">${v}</text>`;
    }).join("");

    const bars = labels.map((label, i) => {
      const value = values[i] == null ? 0 : Math.max(0, Math.min(100, Number(values[i])));
      const h = (value / 100) * innerH;
      const x = pad.left + slot * i + (slot - barW) / 2;
      const y = pad.top + innerH - h;
      const color = barColors[i % barColors.length];
      return `<g class="svg-chart__bar-group">
        <rect class="svg-chart__bar-shadow" x="${x+3}" y="${y+5}" width="${barW}" height="${h}" rx="10" />
        <rect class="svg-chart__bar" x="${x}" y="${y}" width="${barW}" height="${h}" rx="10" fill="${color}" />
        <text class="svg-chart__value" x="${x + barW/2}" y="${Math.max(18, y-9)}" text-anchor="middle">${values[i] == null ? "—" : value}</text>
        <text class="svg-chart__x-label" x="${x + barW/2}" y="${height-18}" text-anchor="middle">${Utils.escapeHTML(label)}</text>
        <title>${Utils.escapeHTML(label)}: ${values[i] == null ? "DATA WILL BE ENTERED LATER" : value + "%"}</title>
      </g>`;
    }).join("");

    return `<svg id="chart-subjects" class="svg-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Subject performance bar chart" preserveAspectRatio="none">
      <defs>
        <filter id="barShadow" x="-50%" y="-20%" width="200%" height="160%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      ${grid}
      ${bars}
    </svg>`;
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