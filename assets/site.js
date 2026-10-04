/* Progressive enhancement only. Every page's content and navigation work without JS. */
(() => {
  "use strict";
  // Without JavaScript the full navigation stays visible on every page.
  const header = document.querySelector(".header-inner");
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.getElementById("site-nav");
  if (header && toggle && nav) {
    const mobile = window.matchMedia("(max-width: 760px)");
    const setOpen = (open) => {
      header.dataset.navOpen = String(open);
      toggle.setAttribute("aria-expanded", String(open));
    };
    const resetNavigation = () => setOpen(!mobile.matches);
    resetNavigation();
    header.classList.add("nav-ready");
    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    header.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && mobile.matches && header.dataset.navOpen === "true") {
        setOpen(false);
        toggle.focus();
      }
    });
    mobile.addEventListener("change", resetNavigation);
  }
  const config = window.SITE_CONFIG || {};
  const safeUrl = (value) => {
    if (typeof value !== "string" || !value.trim()) return null;
    try {
      const url = new URL(value, document.baseURI);
      return ["https:", "http:"].includes(url.protocol) ||
        (url.protocol === "file:" && !/^[a-z][a-z\d+.-]*:/i.test(value)) ? value : null;
    } catch { return null; }
  };
  const activate = (element, value) => {
    const url = safeUrl(value);
    if (!url) return;
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.textContent = element.textContent;
    anchor.className = element.className;
    anchor.classList.remove("unavailable");
    element.replaceWith(anchor);
  };
  document.querySelectorAll("[data-profile]").forEach((element) => {
    activate(element, config.profiles?.[element.dataset.profile]);
  });
  document.querySelectorAll("[data-cv-pdf]").forEach((element) => {
    activate(element, config.cvPdf);
  });
  document.querySelectorAll("[data-paper-links]").forEach((container) => {
    const entries = config.papers?.[container.dataset.paperLinks];
    if (!Array.isArray(entries)) return;
    entries.forEach((entry) => {
      const url = safeUrl(entry.url);
      if (!url || typeof entry.label !== "string" || !entry.label.trim()) return;
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.textContent = entry.label;
      container.append(anchor);
    });
  });
})();
