/**
 * app.js
 * Bootstraps the prototype: initializes navigation, the scanner
 * workflow, and dashboard-family renderers, then shows the welcome
 * screen.
 */

document.addEventListener("DOMContentLoaded", () => {
  Navigation.init();
  Scanner.init();
  Dashboard.init();

  // Mobile sidebar (desktop nav collapses into a drawer on small screens)
  const menuToggle = document.getElementById("btn-menu-toggle");
  const sidebar = document.getElementById("app-sidebar");
  const scrim = document.getElementById("sidebar-scrim");
  if (menuToggle && sidebar && scrim) {
    const closeSidebar = () => {
      sidebar.classList.remove("is-open");
      scrim.classList.remove("is-visible");
    };
    menuToggle.addEventListener("click", () => {
      sidebar.classList.add("is-open");
      scrim.classList.add("is-visible");
    });
    scrim.addEventListener("click", closeSidebar);
    sidebar.addEventListener("click", (e) => {
      if (e.target.closest("[data-nav-target]")) closeSidebar();
    });
  }

  Utils.renderIcons();
  Navigation.goTo("welcome");
});
