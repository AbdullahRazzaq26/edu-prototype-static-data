/**
 * utils.js
 * General-purpose helpers shared across the prototype.
 */

const Utils = (() => {

  /** Re-render all lucide icons currently in the DOM. */
  function renderIcons() {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  /** Escape text for safe HTML insertion. */
  function escapeHTML(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /**
   * Renders a value for display: real values pass through, `null`/
   * `undefined`/empty AND the literal "DATA WILL BE ENTERED LATER"
   * placeholder string all render as the same muted placeholder chip
   * (instead of loud plain text) so unfilled demo content reads as
   * clearly provisional rather than as a real, finished answer.
   */
  function displayValue(value, fallback = "DATA WILL BE ENTERED LATER") {
    if (value === null || value === undefined || value === "" || value === "DATA WILL BE ENTERED LATER") {
      return `<span class="placeholder-chip">${escapeHTML(fallback)}</span>`;
    }
    return escapeHTML(value);
  }

  /** Show a transient toast notification. */
  let toastTimer = null;
  function showToast(message, tone = "default") {
    const container = document.getElementById("toast-root");
    if (!container) return;
    container.innerHTML = `
      <div class="toast toast--${tone}" role="status" aria-live="polite">
        <i data-lucide="${tone === "error" ? "alert-circle" : "check-circle-2"}"></i>
        <span>${escapeHTML(message)}</span>
      </div>`;
    renderIcons();
    const el = container.querySelector(".toast");
    requestAnimationFrame(() => el.classList.add("is-visible"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.classList.remove("is-visible");
      setTimeout(() => { container.innerHTML = ""; }, 250);
    }, 3200);
  }

  /** Open the shared modal with arbitrary HTML content. */
  function openModal(html) {
    const root = document.getElementById("modal-root");
    if (!root) return;
    root.innerHTML = `
      <div class="modal-overlay" data-modal-overlay>
        <div class="modal-card" role="dialog" aria-modal="true">
          <button class="modal-close" type="button" data-modal-close aria-label="Close">
            <i data-lucide="x"></i>
          </button>
          ${html}
        </div>
      </div>`;
    renderIcons();
    root.querySelector("[data-modal-overlay]").addEventListener("click", (e) => {
      if (e.target.hasAttribute("data-modal-overlay")) closeModal();
    });
    root.querySelectorAll("[data-modal-close]").forEach((el) => {
      el.addEventListener("click", closeModal);
    });
    document.addEventListener("keydown", modalEscHandler);
    requestAnimationFrame(() => root.querySelector(".modal-overlay").classList.add("is-visible"));
  }

  function modalEscHandler(e) {
    if (e.key === "Escape") closeModal();
  }

  function closeModal() {
    const root = document.getElementById("modal-root");
    if (!root) return;
    const overlay = root.querySelector(".modal-overlay");
    if (overlay) overlay.classList.remove("is-visible");
    document.removeEventListener("keydown", modalEscHandler);
    setTimeout(() => { root.innerHTML = ""; }, 200);
  }

  /** Build an SVG progress ring. value = 0-100 or null for empty state. */
  function progressRing({ value, size = 132, stroke = 12, label = "" }) {
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const isEmpty = value === null || value === undefined;
    const pct = isEmpty ? 0 : Math.max(0, Math.min(100, value));
    const offset = circumference - (pct / 100) * circumference;
    return `
      <div class="progress-ring ${isEmpty ? "progress-ring--empty" : ""}" style="width:${size}px;height:${size}px;">
        <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
          <circle class="progress-ring__track" cx="${size / 2}" cy="${size / 2}" r="${radius}"
            fill="none" stroke-width="${stroke}" />
          ${isEmpty ? "" : `
          <circle class="progress-ring__value" cx="${size / 2}" cy="${size / 2}" r="${radius}"
            fill="none" stroke-width="${stroke}"
            stroke-dasharray="${circumference}" stroke-dashoffset="${circumference}"
            data-target-offset="${offset}" transform="rotate(-90 ${size / 2} ${size / 2})" />`}
        </svg>
        <div class="progress-ring__label">
          ${isEmpty
            ? `<span class="progress-ring__placeholder">${escapeHTML(label || "DATA WILL BE ENTERED LATER")}</span>`
            : `<span class="progress-ring__pct">${pct}%</span>`}
        </div>
      </div>`;
  }

  /** Animate all progress rings currently in the DOM into their target state. */
  function animateProgressRings(root = document) {
    root.querySelectorAll(".progress-ring__value[data-target-offset]").forEach((circle) => {
      const target = circle.getAttribute("data-target-offset");
      requestAnimationFrame(() => {
        circle.style.transition = "stroke-dashoffset 900ms cubic-bezier(.22,.68,.35,1)";
        circle.style.strokeDashoffset = target;
      });
    });
  }

  /** Small helper to build a status badge. */
  function statusBadge(status) {
    const map = {
      improving: { icon: "trending-up", cls: "badge--growth", text: "Improving" },
      stable: { icon: "minus", cls: "badge--muted", text: "Stable" },
      attention: { icon: "alert-triangle", cls: "badge--attention", text: "Needs attention" }
    };
    const cfg = map[status] || { icon: "circle", cls: "badge--muted", text: "DATA WILL BE ENTERED LATER" };
    return `<span class="badge ${cfg.cls}"><i data-lucide="${cfg.icon}"></i>${cfg.text}</span>`;
  }

  return {
    renderIcons,
    escapeHTML,
    displayValue,
    showToast,
    openModal,
    closeModal,
    progressRing,
    animateProgressRings,
    statusBadge
  };
})();
