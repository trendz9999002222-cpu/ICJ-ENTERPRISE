/** Scroll to the first invalid field so users see inline errors (not only the top alert). */
export function scrollToFirstFieldError(errors: Record<string, string>): void {
  const firstKey = Object.keys(errors)[0];
  if (!firstKey) return;

  const selectors = [
    `[name="${firstKey}"]`,
    `#email-${firstKey}`,
    `#phone-${firstKey}`,
    `#date-${firstKey}`,
    `#checkbox-group-${firstKey}`,
    `#select-${firstKey}`,
  ];

  requestAnimationFrame(() => {
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        if (el instanceof HTMLElement && typeof el.focus === "function") {
          el.focus({ preventScroll: true });
        }
        return;
      }
    }
  });
}
