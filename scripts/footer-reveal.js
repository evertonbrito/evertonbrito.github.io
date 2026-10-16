/* Reveal the footer beneath the last section, in either scroll direction.
   The footer keeps its normal layout space, including on tall mobile layouts. */
(function () {
  "use strict";

  const footer = document.querySelector(".footer");
  if (!footer) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let main = null;
  let geometry = null;
  let frame = 0;
  let needsMeasure = true;
  let resizeObserver = null;

  function resolveInset(value) {
    const amount = parseFloat(value);
    if (!Number.isFinite(amount)) return NaN;
    if (value.trim().endsWith("vw")) return window.innerWidth * amount / 100;
    if (value.trim().endsWith("vh")) return window.innerHeight * amount / 100;
    if (value.trim().endsWith("rem")) {
      return parseFloat(getComputedStyle(document.documentElement).fontSize) * amount;
    }
    return amount;
  }

  function measure() {
    const nextMain = document.getElementById("swap") || document.querySelector(".motion-main");
    if (nextMain !== main) {
      if (main && resizeObserver) resizeObserver.unobserve(main);
      main = nextMain;
      if (main && resizeObserver) resizeObserver.observe(main);
    }
    const authoredInset = resolveInset(
      getComputedStyle(document.body).getPropertyValue("--footer-frame-inset")
    );
    // The exposed frame is the same surface as the footer, including route
    // themes and responsive overrides. Read only when geometry is invalidated.
    document.body.style.setProperty(
      "--footer-reveal-background", getComputedStyle(footer).backgroundColor
    );
    geometry = {
      top: footer.offsetTop,
      height: footer.offsetHeight,
      viewport: window.innerHeight,
      inset: Number.isFinite(authoredInset)
        ? authoredInset
        : Math.min(32, window.innerWidth * 0.02),
    };
    needsMeasure = false;
  }

  function render() {
    frame = 0;
    if (needsMeasure) measure();

    if (!main || reducedMotion.matches) {
      document.body.classList.remove("is-footer-revealing");
      footer.style.removeProperty("--footer-reveal-offset");
      return;
    }

    const { top, height, viewport, inset } = geometry;
    const footerTop = top - window.scrollY;
    // Finish revealing a tall footer when its top reaches the viewport top,
    // so the wordmark and first links remain reachable on narrow screens.
    const remaining = Math.max(0, footerTop - Math.max(0, viewport - height));
    const progress = Math.max(0, Math.min(1,
      (viewport - footerTop) / (Math.min(height, viewport) * 0.65)
    ));
    // Ease the section's corners and inset without a time-based animation;
    // reversing the scroll retraces exactly the same visual state.
    const eased = progress * progress * (3 - 2 * progress);
    const offset = -Math.min(Math.min(height, viewport) * 0.4, remaining * 0.4);

    document.body.classList.toggle("is-footer-revealing", progress > 0);
    main.style.setProperty("--footer-reveal-inset", `${(inset * eased).toFixed(2)}px`);
    main.style.setProperty("--footer-reveal-radius", `${(40 * eased).toFixed(2)}px`);
    footer.style.setProperty("--footer-reveal-offset", `${offset.toFixed(2)}px`);
    footer.setAttribute("data-reveal-ready", "");
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(render);
  }

  function invalidate() {
    needsMeasure = true;
    schedule();
  }

  if (typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver(invalidate);
    resizeObserver.observe(footer);
  }

  // The homepage mounts its main dynamically; institutional navigation swaps #swap.
  new MutationObserver((records) => {
    if (records.some((record) => [...record.addedNodes].some(
      (node) => node.nodeType === 1 && (
        node.id === "swap" ||
        node.matches(".motion-main") ||
        node.querySelector("#swap, .motion-main")
      )
    ))) invalidate();
  }).observe(document.body, { childList: true, subtree: true });

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", invalidate);
  window.addEventListener("load", invalidate);
  window.addEventListener("pageshow", invalidate);
  reducedMotion.addEventListener("change", invalidate);
  if (document.fonts) document.fonts.ready.then(invalidate);
  invalidate();
})();
