const railButtons = [...document.querySelectorAll(".rail-btn[data-panel]")];
const mobileButtons = [...document.querySelectorAll(".mobile-nav-btn[data-panel]")];
const panels = [...document.querySelectorAll(".panel")];
const moreButton = document.getElementById("moreButton");
const morePopover = document.getElementById("morePopover");
const mainMenu = document.getElementById("mainMenu");
const themeMenu = document.getElementById("themeMenu");
const themeMenuButton = document.getElementById("themeMenuButton");
const themeBackButton = document.getElementById("themeBackButton");
const themeToggle = document.getElementById("themeToggle");
const logoutButton = document.getElementById("logoutButton");

const THEME_KEY = "ig_admin_theme_mode";
const PANEL_KEY = "ig_admin_active_panel";
let popoverClosing = false;

function setActivePanel(panelName) {
  railButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.panel === panelName);
  });
  mobileButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.panel === panelName);
  });
  panels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === `panel-${panelName}`);
  });
  localStorage.setItem(PANEL_KEY, panelName);
}

function switchTab(panelName) {
    setActivePanel(panelName);
}

// Map the old switchTab of admin.html (which was generic) to setActivePanel
window.switchTab = switchTab;

function activateMenuScreen(activeScreen, inactiveScreen) {
  inactiveScreen.classList.add("hidden");
  inactiveScreen.classList.remove("is-active");
  activeScreen.classList.remove("hidden");
  requestAnimationFrame(() => {
    activeScreen.classList.add("is-active");
  });
}

function resetToMainMenu() {
  if (themeMenu && mainMenu) {
      themeMenu.classList.add("hidden");
      themeMenu.classList.remove("is-active");
      mainMenu.classList.remove("hidden");
      mainMenu.classList.add("is-active");
  }
}

function openPopover() {
  if (morePopover && moreButton) {
      morePopover.classList.remove("hidden");
      moreButton.setAttribute("aria-expanded", "true");
      moreButton.classList.add("is-open");
      requestAnimationFrame(() => {
        morePopover.classList.add("is-open");
      });
  }
}

function showMainMenu() {
  if (mainMenu && themeMenu) activateMenuScreen(mainMenu, themeMenu);
  openPopover();
}

function showThemeMenu() {
  if (themeMenu && mainMenu) activateMenuScreen(themeMenu, mainMenu);
  openPopover();
}

function closeMenus() {
  if (!morePopover || morePopover.classList.contains("hidden") || popoverClosing) return;
  popoverClosing = true;
  morePopover.classList.remove("is-open");
  window.setTimeout(() => {
    morePopover.classList.add("hidden");
    if(moreButton) {
        moreButton.setAttribute("aria-expanded", "false");
        moreButton.classList.remove("is-open");
    }
    popoverClosing = false;
    resetToMainMenu();
  }, 240);
}

function applyTheme(mode) {
  const isDark = mode === "dark";
  document.body.classList.toggle("dark", isDark);
  if (themeToggle) themeToggle.checked = isDark;
  localStorage.setItem(THEME_KEY, mode);
}

railButtons.forEach((button) => {
  button.addEventListener("click", () => setActivePanel(button.dataset.panel));
});

mobileButtons.forEach((button) => {
  button.addEventListener("click", () => setActivePanel(button.dataset.panel));
});

if (moreButton) {
    moreButton.addEventListener("click", (event) => {
      event.stopPropagation();
      if (morePopover.classList.contains("hidden")) {
        showMainMenu();
      } else {
        closeMenus();
      }
    });
}

if (themeMenuButton) themeMenuButton.addEventListener("click", showThemeMenu);
if (themeBackButton) themeBackButton.addEventListener("click", showMainMenu);
if (themeToggle) {
    themeToggle.addEventListener("change", () => {
      applyTheme(themeToggle.checked ? "dark" : "light");
    });
}
if (logoutButton) {
    logoutButton.addEventListener("click", () => {
        if(typeof window.logout === 'function') window.logout();
    });
}

document.addEventListener("click", (event) => {
  if (morePopover && moreButton && !morePopover.contains(event.target) && !moreButton.contains(event.target)) {
    closeMenus();
  }
});

resetToMainMenu();
if (moreButton) {
    moreButton.setAttribute("aria-expanded", "false");
    moreButton.classList.remove("is-open");
}
applyTheme(localStorage.getItem(THEME_KEY) || "light");
// Delay panel initialization to avoid collision if DOM isn't fully ready
document.addEventListener("DOMContentLoaded", () => {
    setActivePanel(localStorage.getItem(PANEL_KEY) || "overview");
});

