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

  // Animate only when an item enters view. Content is never hidden in the
  // stylesheet, so it remains readable without JS, during search, and on print.
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reducedMotion.matches || window.location.hash ||
      !("IntersectionObserver" in window) || !("animate" in Element.prototype)) return;

  const activeAnimations = new Map();
  let motionStopped = false;
  const reveal = (element) => {
    if (motionStopped || element.contains(document.activeElement)) return;
    const style = getComputedStyle(document.documentElement);
    const distance = style.getPropertyValue("--reveal-distance").trim() || "16px";
    const duration = parseFloat(style.getPropertyValue("--reveal-duration")) || 500;
    const animation = element.animate([
      { opacity: 0, transform: `translateY(${distance})` },
      { opacity: 1, transform: "translateY(0)" }
    ], { duration, easing: "ease", fill: "backwards" });
    activeAnimations.set(element, animation);
    const release = () => activeAnimations.delete(element);
    animation.addEventListener("finish", release, { once: true });
    animation.addEventListener("cancel", release, { once: true });
  };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      reveal(entry.target);
    });
  }, { rootMargin: "0px 0px -32px 0px", threshold: 0 });

  // Navigation, page titles, and the photograph stay visible from the start.
  // Introduce the home text, then reveal individual content entries once.
  const targets = document.querySelectorAll([
    ".hero-copy",
    ".content-section > h2", ".paper", ".dated-row", ".interests",
    ".contact-row", ".contact-map"
  ].join(","));
  targets.forEach((element) => {
    const bounds = element.getBoundingClientRect();
    if (bounds.bottom <= 0) return;
    if (bounds.top < window.innerHeight - 32) {
      reveal(element);
    } else {
      observer.observe(element);
    }
  });
  const stopMotion = () => {
    motionStopped = true;
    observer.disconnect();
    activeAnimations.forEach((animation) => animation.cancel());
    activeAnimations.clear();
  };
  reducedMotion.addEventListener("change", (event) => {
    if (event.matches) stopMotion();
  });
  window.addEventListener("beforeprint", stopMotion);
  window.addEventListener("hashchange", stopMotion);
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) stopMotion();
  });
  document.addEventListener("focusin", (event) => {
    targets.forEach((element) => {
      if (!element.contains(event.target)) return;
      observer.unobserve(element);
      activeAnimations.get(element)?.cancel();
    });
  });
})();
