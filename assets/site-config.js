/* Optional links. Leave unknown URLs null: no fabricated or broken links are rendered.
   All paths are relative, so both username.github.io and project Pages sites work. */
window.SITE_CONFIG = {
  // Place the real PDF in assets/, then replace null with "assets/cv.pdf".
  cvPdf: null,
  profiles: {
    googleScholar: null,
    github: null,
    linkedin: "https://www.linkedin.com/in/晴暉-土屋-0a1aa7262"
  },
  // Add real documents only when available, for example:
  // { label: "Draft", url: "assets/sherlocking.pdf" }
  papers: {
    "sherlocking": [],
    "selling-constraints": []
  }
};
