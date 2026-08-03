"use strict";

const root = document.documentElement;
const themeButton = document.querySelector("#theme-toggle");
const menuButton = document.querySelector("#menu-toggle");
const menu = document.querySelector("#menu-principal");
const accessibilityWidget = document.querySelector("#accessibility-widget");
const accessibilityButton = document.querySelector("#accessibility-toggle");
const accessibilityPanel = document.querySelector("#accessibility-panel");
const accessibilityClose = document.querySelector("#accessibility-close");
const fontDecrease = document.querySelector("#font-decrease");
const fontIncrease = document.querySelector("#font-increase");
const fontStatus = document.querySelector("#font-size-status");
const contrastButton = document.querySelector("#contrast-toggle");
const linksButton = document.querySelector("#links-toggle");
const motionButton = document.querySelector("#motion-toggle");
const accessibilityReset = document.querySelector("#accessibility-reset");

const ACCESSIBILITY_STORAGE_KEY = "prism-accessibility";
const ACCESSIBILITY_DEFAULTS = Object.freeze({
  fontScale: 100,
  highContrast: false,
  highlightLinks: false,
  reduceMotion: false,
});

function loadAccessibilityState() {
  try {
    const saved = JSON.parse(localStorage.getItem(ACCESSIBILITY_STORAGE_KEY) || "null");
    if (!saved || typeof saved !== "object") return { ...ACCESSIBILITY_DEFAULTS };

    return {
      fontScale: [100, 110, 120].includes(saved.fontScale) ? saved.fontScale : 100,
      highContrast: saved.highContrast === true,
      highlightLinks: saved.highlightLinks === true,
      reduceMotion: saved.reduceMotion === true,
    };
  } catch (error) {
    return { ...ACCESSIBILITY_DEFAULTS };
  }
}

let accessibilityState = loadAccessibilityState();

function currentTheme() {
  return root.dataset.theme === "light" ? "light" : "dark";
}

function updateThemeButton() {
  if (!themeButton) return;

  const isDark = currentTheme() === "dark";
  themeButton.setAttribute("aria-label", isDark ? "Ativar tema claro" : "Ativar tema escuro");
  themeButton.setAttribute("title", isDark ? "Tema claro" : "Tema escuro");

  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) themeColor.setAttribute("content", isDark ? "#03050d" : "#f5f7fb");
}

function toggleTheme() {
  const nextTheme = currentTheme() === "dark" ? "light" : "dark";
  root.dataset.theme = nextTheme;

  try {
    localStorage.setItem("prism-theme", nextTheme);
  } catch (error) {
    // O tema continua funcionando mesmo quando o armazenamento está bloqueado.
  }

  updateThemeButton();
}

function setMenu(open) {
  if (!menu || !menuButton) return;

  menu.classList.toggle("nav-menu-open", open);
  menuButton.classList.toggle("menu-toggle-open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
}

function saveAccessibilityState() {
  try {
    localStorage.setItem(ACCESSIBILITY_STORAGE_KEY, JSON.stringify(accessibilityState));
  } catch (error) {
    // Os recursos continuam funcionando mesmo quando o armazenamento está bloqueado.
  }
}

function updatePressedState(button, active) {
  if (!button) return;
  button.setAttribute("aria-pressed", String(active));
  button.classList.toggle("is-active", active);
}

function applyAccessibilityState() {
  root.style.fontSize = `${accessibilityState.fontScale}%`;
  root.classList.toggle("accessibility-high-contrast", accessibilityState.highContrast);
  root.classList.toggle("accessibility-highlight-links", accessibilityState.highlightLinks);
  root.classList.toggle("accessibility-reduce-motion", accessibilityState.reduceMotion);

  if (fontStatus) fontStatus.textContent = `${accessibilityState.fontScale}%`;
  if (fontDecrease) fontDecrease.disabled = accessibilityState.fontScale <= 100;
  if (fontIncrease) fontIncrease.disabled = accessibilityState.fontScale >= 120;

  updatePressedState(contrastButton, accessibilityState.highContrast);
  updatePressedState(linksButton, accessibilityState.highlightLinks);
  updatePressedState(motionButton, accessibilityState.reduceMotion);
}

function setAccessibilityPanel(open, options = {}) {
  if (!accessibilityPanel || !accessibilityButton) return;

  accessibilityPanel.hidden = !open;
  accessibilityButton.setAttribute("aria-expanded", String(open));
  accessibilityButton.setAttribute(
    "aria-label",
    open ? "Fechar recursos de acessibilidade" : "Abrir recursos de acessibilidade",
  );

  if (open) {
    window.requestAnimationFrame(() => accessibilityClose?.focus());
  } else if (options.returnFocus) {
    accessibilityButton.focus();
  }
}

function changeFontScale(amount) {
  accessibilityState.fontScale = Math.min(120, Math.max(100, accessibilityState.fontScale + amount));
  applyAccessibilityState();
  saveAccessibilityState();
}

function toggleAccessibilityPreference(preference) {
  accessibilityState[preference] = !accessibilityState[preference];
  applyAccessibilityState();
  saveAccessibilityState();
}

themeButton?.addEventListener("click", toggleTheme);
menuButton?.addEventListener("click", () => setMenu(!menu?.classList.contains("nav-menu-open")));

menu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMenu(false);
    const panelWasOpen = accessibilityPanel ? !accessibilityPanel.hidden : false;
    setAccessibilityPanel(false, { returnFocus: panelWasOpen });
  }
});

document.addEventListener("click", (event) => {
  if (!(event.target instanceof Node)) return;

  if (menu && menuButton && !menu.contains(event.target) && !menuButton.contains(event.target)) {
    setMenu(false);
  }

  if (accessibilityWidget && !accessibilityWidget.contains(event.target)) {
    setAccessibilityPanel(false);
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 820) setMenu(false);
});

accessibilityButton?.addEventListener("click", () => {
  setAccessibilityPanel(accessibilityPanel?.hidden ?? true);
});

accessibilityClose?.addEventListener("click", () => {
  setAccessibilityPanel(false, { returnFocus: true });
});

fontDecrease?.addEventListener("click", () => changeFontScale(-10));
fontIncrease?.addEventListener("click", () => changeFontScale(10));
contrastButton?.addEventListener("click", () => toggleAccessibilityPreference("highContrast"));
linksButton?.addEventListener("click", () => toggleAccessibilityPreference("highlightLinks"));
motionButton?.addEventListener("click", () => toggleAccessibilityPreference("reduceMotion"));

accessibilityReset?.addEventListener("click", () => {
  accessibilityState = { ...ACCESSIBILITY_DEFAULTS };
  applyAccessibilityState();
  saveAccessibilityState();
});

const revealElements = document.querySelectorAll("[data-reveal]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (reduceMotion || !("IntersectionObserver" in window)) {
  revealElements.forEach((element) => element.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.14 },
  );

  revealElements.forEach((element) => observer.observe(element));
}

applyAccessibilityState();
updateThemeButton();
