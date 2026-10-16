/* Contact thank-you: manifesto card, calendar, tape dividers (SPA + /contact/thank-you) */
(function () {
  "use strict";

  const STORAGE_KEY = "astreiaContactThankYou";
  const THANKYOU_DESC =
    'Your inquiry has been received. Our team responds within two business days. ' +
    'For urgent matters, reach us at <a href="mailto:contact@astreia.space">contact@astreia.space</a>.';

  const ARROW_SVG =
    '<svg class="contact-success__nav-arrow" viewBox="0 0 640 640" aria-hidden="true">' +
    '<path d="M488 128C501.3 128 512 138.7 512 152L512 392C512 405.3 501.3 416 488 416C474.7 416 464 405.3 464 392L464 209.9L169 504.9C159.6 514.3 144.4 514.3 135.1 504.9C125.8 495.5 125.7 480.4 135 471L430 176L247.9 176C234.6 176 223.9 165.3 223.9 152C223.9 138.7 234.6 128 247.9 128L487.9 128z"/></svg>';

  const MARKER_OVALS = [
    "M24 7 C13 6 5 14 6 25 C7 37 16 44 27 43 C39 42 46 31 45 19 C44 8 35 4 24 7 Z",
    "M23 6 C11 5 4 13 5 24 C6 36 15 43 26 42 C38 41 45 30 44 18 C43 7 34 3 23 6 Z",
    "M24 8 C14 7 6 15 7 26 C8 38 17 45 28 44 C40 43 47 32 46 20 C45 9 36 5 24 8 Z",
  ];

  /* 8 glitch-QR pixel grids (1 = orange cell) */
  const QR_PATTERNS = [
    [
      "1110011100111",
      "1000000000001",
      "1011101111101",
      "1010000010101",
      "1010111010101",
      "1010000010101",
      "1011101111101",
      "1000000000001",
      "1110011100111",
      "0010100110100",
      "1101011001011",
      "0101101001101",
      "1010010110010",
    ],
    [
      "1111111000000",
      "1000001000000",
      "1001101001100",
      "1000001000000",
      "1111111000000",
      "0000000111111",
      "0000000100001",
      "0011000101101",
      "0000000100001",
      "0000000111111",
      "1010101010101",
      "0101010101010",
      "1010101010101",
    ],
    [
      "1110011011011",
      "1001000000001",
      "1011001111001",
      "1001000000001",
      "1110011011011",
      "0000000000000",
      "1110011011011",
      "1001000000001",
      "1011001111001",
      "1001000000001",
      "1110011011011",
      "0101010101010",
      "1010101010101",
    ],
    [
      "1000000000001",
      "1011111111101",
      "1000000000001",
      "1011111111101",
      "1000000000001",
      "1011111111101",
      "1000000000001",
      "1011111111101",
      "1000000000001",
      "1011111111101",
      "1000000000001",
      "1101101101101",
      "0010010010010",
    ],
    [
      "1111111111111",
      "1000000000001",
      "1010101010101",
      "1000000000001",
      "1011111111101",
      "1000000000001",
      "1010101010101",
      "1000000000001",
      "1011111111101",
      "1000000000001",
      "1010101010101",
      "1000000000001",
      "1111111111111",
    ],
    [
      "1100110011001",
      "1100110011001",
      "0000000000000",
      "1100110011001",
      "1100110011001",
      "0000000000000",
      "1100110011001",
      "1100110011001",
      "0000000000000",
      "1100110011001",
      "1100110011001",
      "1010101010101",
      "0101010101010",
    ],
    [
      "1110001110001",
      "1000001000001",
      "1000001000001",
      "1110001110001",
      "0000000000000",
      "1110001110001",
      "1000001000001",
      "1000001000001",
      "1110001110001",
      "0101010101010",
      "1010101010101",
      "0101010101010",
      "1010101010101",
    ],
    [
      "1010101010101",
      "0101010101010",
      "1010101010101",
      "0101010101010",
      "1010101010101",
      "0101010101010",
      "1010101010101",
      "0101010101010",
      "1010101010101",
      "0101010101010",
      "1010101010101",
      "1110011011011",
      "1001000000001",
    ],
  ];

  let qrTimer = null;
  window.stopContactThankYou = function () {
    clearInterval(qrTimer);
    qrTimer = null;
  };

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function patternToSvg(rows) {
    const h = rows.length;
    const w = rows[0].length;
    let rects = "";
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (rows[y][x] === "1") rects += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
      }
    }
    return (
      `<svg class="contact-manifesto__qr-svg" viewBox="0 0 ${w} ${h}" aria-hidden="true">` +
      `<rect width="${w}" height="${h}" fill="#fff"/>` +
      `<g fill="#ff6a00">${rects}</g></svg>`
    );
  }

  const QR_SVGS = QR_PATTERNS.map(patternToSvg);

  function startQrCycle(el) {
    if (!el) return;
    if (qrTimer) clearInterval(qrTimer);
    let idx = 0;
    el.innerHTML = QR_SVGS[0];
    el.classList.add("is-live");
    qrTimer = setInterval(() => {
      idx = (idx + 1) % QR_SVGS.length;
      el.innerHTML = QR_SVGS[idx];
    }, 3000);
  }

  function saveThankYouData(data) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function loadThankYouData() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function getNextBusinessDaysInMonth(fromDate, count) {
    const month = fromDate.getMonth();
    const days = [];
    const cursor = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
    cursor.setDate(cursor.getDate() + 1);

    while (days.length < count && cursor.getMonth() === month) {
      const dow = cursor.getDay();
      if (dow >= 1 && dow <= 5) days.push(cursor.getDate());
      cursor.setDate(cursor.getDate() + 1);
    }
    return days;
  }

  function markerSvg(seed) {
    const path = MARKER_OVALS[seed % MARKER_OVALS.length];
    const tilt = (seed % 5) - 2;
    return (
      '<svg class="contact-calendar__marker" viewBox="0 0 48 48" aria-hidden="true">' +
      `<path class="contact-calendar__marker-stroke contact-calendar__marker-stroke--1" d="${path}" transform="rotate(${tilt} 24 24)"/>` +
      `<path class="contact-calendar__marker-stroke contact-calendar__marker-stroke--2" d="${path}" transform="rotate(${tilt + 2} 24.5 23.5) scale(1.03)"/>` +
      `<path class="contact-calendar__marker-stroke contact-calendar__marker-stroke--3" d="${path}" transform="rotate(${tilt - 1.5} 23.5 24.5) scale(0.96)"/>` +
      "</svg>"
    );
  }

  function tapeHtml(label) {
    const text = escapeHtml(label || "Thank-you");
    const repeated = Array(12).fill(`${text} /`).join(" ");
    return (
      `<div class="contact-tape" aria-hidden="true">` +
      `<div class="contact-tape__label">${repeated}</div>` +
      `<div class="contact-tape__barcode"></div></div>`
    );
  }

  function splitNameStack(name) {
    const words = String(name || "Guest")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 4)
      .map((w) => w.toUpperCase());
    while (words.length < 4) words.push("");
    return words;
  }

  function refSerial(ref) {
    return ref.replace(/\D/g, "").padStart(10, "0").slice(0, 10);
  }

  function inquiryDisplayLabel(inquiry) {
    return String(inquiry || "general inquiry")
      .replace(/\s*&\s*/g, " and ")
      .toLowerCase();
  }

  function buildManifestoHtml(data) {
    const ref = `AST-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    const refShort = ref.replace("AST-", "");
    const submitted = new Date(data.submittedAt || Date.now()).toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const nameStack = splitNameStack(data.name);

    const fields = [
      ["Name", data.name],
      ["Email", data.email],
      ["Inquiry", data.inquiry],
      ["Domain", data.domain],
      ["Organization", data.organization],
      ["Region", data.region],
      ["Timeline", data.timeline],
    ];

    const fieldRows = fields
      .map(
        ([label, value]) =>
          `<div class="contact-manifesto__cell contact-manifesto__field">` +
          `<span class="contact-manifesto__field-label">${label}</span>` +
          `<span class="contact-manifesto__field-value">${escapeHtml(value)}</span></div>`
      )
      .join("");

    const nameStackHtml = nameStack
      .map((word) => `<span class="contact-manifesto__stack-word">${word ? escapeHtml(word) : "&nbsp;"}</span>`)
      .join("");
    const inquiryLabel = escapeHtml(inquiryDisplayLabel(data.inquiry));

    return (
      `<article class="contact-manifesto">` +
      `<div class="contact-manifesto__frame">` +
      `<div class="contact-manifesto__band contact-manifesto__band--top">` +
      `<div class="contact-manifesto__brand-row">` +
      `<div class="contact-manifesto__logo">` +
      `<img src="/brand/v3_icon_letter_black.svg" alt="Astreia" width="723" height="243" />` +
      `</div></div>` +
      `<p class="contact-manifesto__fineprint">Transmission record · the reference code assigned to your inquiry upon receipt.</p>` +
      `<span class="contact-manifesto__barcode-word">${inquiryLabel}</span>` +
      `</div>` +
      `<div class="contact-manifesto__band contact-manifesto__band--identity">` +
      `<div class="contact-manifesto__identity-main">` +
      `<span class="contact-manifesto__spec-left">Status · In Queue</span>` +
      `<span class="contact-manifesto__id-code">${ref} // 0011</span>` +
      `<div class="contact-manifesto__name-stack">${nameStackHtml}</div>` +
      `</div></div>` +
      `<div class="contact-manifesto__ribbon"><span>In Queue · Thank You</span></div>` +
      `<div class="contact-manifesto__fields">${fieldRows}</div>` +
      `<div class="contact-manifesto__message contact-manifesto__cell">` +
      `<span class="contact-manifesto__field-label">Message</span>` +
      `<p class="contact-manifesto__message-body">${escapeHtml(data.message)}</p>` +
      `</div>` +
      `<div class="contact-manifesto__band contact-manifesto__band--lower">` +
      `<div class="contact-manifesto__qr" data-qr-cycle aria-hidden="true"></div>` +
      `<div class="contact-manifesto__lower-mid">` +
      `<span class="contact-manifesto__lower-id">${refSerial(ref)}/${refShort}</span>` +
      `<p class="contact-manifesto__lower-title">${escapeHtml(data.domain || "General")} · ${escapeHtml(data.organization || "")}</p>` +
      `<div class="contact-manifesto__lower-bar" aria-hidden="true"></div>` +
      `<div class="contact-manifesto__ref">` +
      `<div><span class="contact-manifesto__meta-label">Reference</span>` +
      `<span class="contact-manifesto__ref-value">${ref}</span></div>` +
      `<div><span class="contact-manifesto__meta-label">Submitted</span>` +
      `<span class="contact-manifesto__ref-value">${escapeHtml(submitted)}</span></div>` +
      `<div><span class="contact-manifesto__meta-label">Channel</span>` +
      `<span class="contact-manifesto__ref-value">contact@astreia.space</span></div>` +
      `<span class="contact-manifesto__coords">${escapeHtml(data.region || "Global")}</span>` +
      `<span class="contact-manifesto__serial">${refSerial(ref)}</span>` +
      `</div></div></div></div></article>`
    );
  }

  function buildCalendarHtml(fromDate) {
    const year = fromDate.getFullYear();
    const month = fromDate.getMonth();
    const markedDays = getNextBusinessDaysInMonth(fromDate, 2);
    const monthLabel = fromDate.toLocaleString("en-US", { month: "long", year: "numeric" }).toUpperCase();
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const firstDow = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    let daysHtml = "";
    for (let i = 0; i < firstDow; i++) {
      daysHtml += '<span class="contact-calendar__day contact-calendar__day--empty" aria-hidden="true"></span>';
    }
    for (let d = 1; d <= totalDays; d++) {
      const markIdx = markedDays.indexOf(d);
      const marked = markIdx >= 0;
      const label = d < 10 ? `0${d}` : String(d);
      daysHtml +=
        `<span class="contact-calendar__day${marked ? " is-marked" : ""}" role="gridcell"` +
        `${marked ? ' aria-label="Expected response window"' : ""}>` +
        `${label}${marked ? markerSvg(d + markIdx) : ""}</span>`;
    }

    return (
      `<div class="contact-calendar">` +
      `<div class="contact-calendar__head"><span class="contact-calendar__month">${monthLabel}</span>` +
      `<span class="contact-calendar__hint">Next 2 business days</span></div>` +
      `<div class="contact-calendar__grid" role="grid">` +
      `<div class="contact-calendar__weekdays">${weekdays.map((d) => `<span class="contact-calendar__wd">${d}</span>`).join("")}</div>` +
      `<div class="contact-calendar__days">${daysHtml}</div></div></div>`
    );
  }

  function buildNavHtml() {
    const links = [
      ["/", "Home"],
      ["/tessera-1", "Tessera-1"],
      ["/thor-xr-1", "Thor XR-1"],
    ];
    return (
      `<nav class="contact-success__nav" aria-label="Continue exploring">` +
      links
        .map(
          ([href, label]) =>
            `<a href="${href}" class="contact-success__nav-link">` +
            `<span>${label}</span>${ARROW_SVG}</a>`
        )
        .join("") +
      `</nav>`
    );
  }

  function buildThankYouHtml(data) {
    const submittedAt = new Date(data.submittedAt || Date.now());
    return (
      buildManifestoHtml(data) +
      `<div class="contact-thank-you__block">` +
      tapeHtml("Response Window") +
      buildCalendarHtml(submittedAt) +
      `</div>` +
      `<div class="contact-thank-you__block contact-thank-you__block--pre-nav">` +
      tapeHtml("Explore more") +
      `</div>` +
      buildNavHtml()
    );
  }

  function renderThankYou(root, data) {
    if (!root || !data) return;
    root.innerHTML = buildThankYouHtml(data);
    startQrCycle(root.querySelector("[data-qr-cycle]"));
  }

  function activateThankYouPage(contactPage, data) {
    const form = contactPage?.querySelector(".contact-form");
    const success = contactPage?.querySelector(".contact-form__success");
    const root = success?.querySelector("[data-thank-you-root]");
    const title = contactPage?.querySelector("[data-contact-title]");
    const desc = contactPage?.querySelector(".contact-page__desc");

    if (!contactPage || !success || !root) return false;

    if (desc) desc.innerHTML = THANKYOU_DESC;

    renderThankYou(root, data);
    if (title) title.textContent = "Thank you";
    document.title = "Thank you - Astreia space";
    form?.classList.add("is-sent");
    contactPage.classList.add("is-success");
    success.hidden = false;
    requestAnimationFrame(() => success.classList.add("is-visible"));
    if (window.syncHeroLightTheme) requestAnimationFrame(window.syncHeroLightTheme);
    return true;
  }

  function isThankYouPath() {
    return /\/contact\/thank-you\/?$/.test(window.location.pathname);
  }

  window.saveContactThankYou = saveThankYouData;
  window.showContactThankYou = function (data) {
    const contactPage = document.querySelector(".contact-page");
    return activateThankYouPage(contactPage, data);
  };

  window.initContactThankYouRoute = function () {
    if (!isThankYouPath()) return;
    if (document.querySelector(".contact-page.is-success")) return;
    const data = loadThankYouData();
    if (!data) {
      window.location.replace("/contact");
      return;
    }
    window.showContactThankYou(data);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", window.initContactThankYouRoute);
  } else {
    window.initContactThankYouRoute();
  }

  /* Re-run after SPA swap injects .contact-page (e.g. direct /contact/thank-you on shell page) */
  new MutationObserver(() => {
    if (!isThankYouPath()) return;
    requestAnimationFrame(window.initContactThankYouRoute);
  }).observe(document.body, { childList: true, subtree: true });
})();
