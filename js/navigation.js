/**
 * navigation.js
 * Handles switching between the app's "screens" (each a <section
 * data-screen="..."> in index.html), keeps the sidebar / bottom nav
 * highlighted state in sync, and lets other modules hook into a
 * screen becoming visible (onEnter) to (re)render their content.
 */

const Navigation = (() => {
  const screens = {};
  const onEnterCallbacks = {};
  let currentScreen = null;
  const history = [];

  // Screens that show the app chrome (sidebar / bottom nav / header).
  // The welcome screen is full-bleed and hides the chrome.
  const CHROME_HIDDEN_SCREENS = new Set(["welcome"]);

  // Fine-grained group: used by the desktop sidebar, which has one
  // item per top-level screen (sub-steps of the scan flow all fold
  // into the "scanner" item).
  const FINE_GROUP = {
    home: "home",
    dashboard: "dashboard",
    scanner: "scanner",
    preview: "scanner",
    analyzing: "scanner",
    analysis: "scanner",
    patterns: "patterns",
    progress: "progress",
    recommendations: "recommendations",
    profile: "profile",
    about: "about"
  };

  // Broad tab: used by the mobile bottom nav, which only has 4 slots
  // (Home / Scan / Progress / Profile) covering related screens.
  const BROAD_TAB = {
    home: "home",
    dashboard: "home",
    scanner: "scan",
    preview: "scan",
    analyzing: "scan",
    analysis: "scan",
    patterns: "progress",
    progress: "progress",
    recommendations: "progress",
    profile: "profile",
    about: "profile"
  };

  const SCREEN_TITLES = {
    home: "Home",
    dashboard: "Dashboard",
    scanner: "Scan Homework",
    preview: "Review Homework",
    analyzing: "Analyzing",
    analysis: "Homework Analysis",
    patterns: "Learning Patterns",
    progress: "Progress",
    recommendations: "Recommendations",
    profile: "Child Profile",
    about: "About This Prototype"
  };

  function init() {
    document.querySelectorAll("[data-screen]").forEach((el) => {
      screens[el.dataset.screen] = el;
    });

    // Event delegation: works for buttons present at load AND for any
    // button added later by dashboard.js / scanner.js when they render
    // dynamic content (cards, modals, list items, etc.).
    document.body.addEventListener("click", (e) => {
      const navBtn = e.target.closest("[data-nav-target]");
      if (navBtn) {
        goTo(navBtn.dataset.navTarget);
        return;
      }
      const backBtn = e.target.closest("[data-go-back]");
      if (backBtn) {
        goBack();
      }
    });
  }

  function onEnter(screenName, callback) {
    if (!onEnterCallbacks[screenName]) onEnterCallbacks[screenName] = [];
    onEnterCallbacks[screenName].push(callback);
  }

  function goTo(screenName, { replace = false, payload = null } = {}) {
    if (!screens[screenName]) {
      console.warn(`Navigation: unknown screen "${screenName}"`);
      return;
    }
    if (currentScreen && currentScreen !== screenName && !replace) {
      history.push(currentScreen);
    }

    Object.values(screens).forEach((el) => el.classList.remove("is-active"));
    const target = screens[screenName];
    target.classList.add("is-active");
    target.scrollTop = 0;

    const contentEl = document.getElementById("app-content");
    if (contentEl) contentEl.scrollTop = 0;

    currentScreen = screenName;
    document.body.dataset.currentScreen = screenName;
    document.body.classList.toggle("chrome-hidden", CHROME_HIDDEN_SCREENS.has(screenName));

    syncNavHighlight(screenName);
    syncHeaderTitle(screenName);

    (onEnterCallbacks[screenName] || []).forEach((cb) => {
      try { cb(payload); } catch (err) { console.error(err); }
    });

    Utils.renderIcons();
  }

  function goBack() {
    const previous = history.pop();
    if (previous) {
      goTo(previous, { replace: true });
    } else {
      goTo("dashboard");
    }
  }

  function syncNavHighlight(screenName) {
    const fine = FINE_GROUP[screenName] || screenName;
    const broad = BROAD_TAB[screenName] || screenName;
    document.querySelectorAll("[data-nav-group]").forEach((el) => {
      el.classList.toggle("is-active", el.dataset.navGroup === fine);
    });
    document.querySelectorAll("[data-nav-tab]").forEach((el) => {
      el.classList.toggle("is-active", el.dataset.navTab === broad);
    });
  }

  function syncHeaderTitle(screenName) {
    const titleEl = document.getElementById("app-header-title");
    if (titleEl) titleEl.textContent = SCREEN_TITLES[screenName] || "";
  }

  function current() {
    return currentScreen;
  }

  return { init, onEnter, goTo, goBack, current };
})();
