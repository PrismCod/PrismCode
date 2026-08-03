"use strict";

const root = document.documentElement;
const themeButton = document.querySelector("#theme-toggle");
const menuButton = document.querySelector("#menu-toggle");
const menu = document.querySelector("#menu-principal");

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

themeButton?.addEventListener("click", toggleTheme);
menuButton?.addEventListener("click", () => setMenu(!menu?.classList.contains("nav-menu-open")));

menu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});

document.addEventListener("click", (event) => {
  if (!menu || !menuButton || !(event.target instanceof Node)) return;
  if (!menu.contains(event.target) && !menuButton.contains(event.target)) setMenu(false);
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 820) setMenu(false);
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

updateThemeButton();
