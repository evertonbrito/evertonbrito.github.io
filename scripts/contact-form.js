/* Contact form: shadcn-style comboboxes + submit (SPA-safe via #swap observer) */
(function () {
  "use strict";

  const COMBO_CLOSE_MS = 620;
  const CLICK_SRC = "/audio/click.mp3";
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let clickAudio = null;

  function playClickSound() {
    if (prefersReduced) return;
    try {
      if (!clickAudio) {
        clickAudio = new Audio(CLICK_SRC);
        clickAudio.preload = "auto";
      }
      const sound = clickAudio.cloneNode();
      sound.volume = 1;
      void sound.play().catch(() => {});
    } catch (_) {}
  }

  function closeCombobox(combobox, immediate) {
    if (!combobox.classList.contains("is-open") && !combobox.classList.contains("is-closing")) return;

    const trigger = combobox.querySelector(".contact-combobox__trigger");
    const menu = combobox.querySelector(".contact-combobox__menu");
    trigger?.setAttribute("aria-expanded", "false");
    menu?.querySelectorAll(".contact-combobox__option").forEach((el) => {
      el.classList.remove("is-highlighted");
    });

    menu?.style.removeProperty("--combo-menu-cap");

    if (immediate || prefersReduced) {
      combobox.classList.remove("is-open", "is-closing");
      return;
    }

    combobox.classList.add("is-closing");
    combobox.classList.remove("is-open");
    window.setTimeout(() => combobox.classList.remove("is-closing"), COMBO_CLOSE_MS);
  }

  function closeAllComboboxes(except) {
    document.querySelectorAll(".contact-combobox.is-open, .contact-combobox.is-closing").forEach((box) => {
      if (box !== except) closeCombobox(box);
    });
  }

  function rebuildMenuOptions(select, menu, onPick) {
    const enabledOpts = Array.from(select.options).filter((o) => !o.disabled);
    const existing = menu.querySelectorAll(".contact-combobox__option");
    if (existing.length === enabledOpts.length) return;

    menu.textContent = "";
    enabledOpts.forEach((opt) => {
      const li = document.createElement("li");
      li.className = "contact-combobox__option";
      li.setAttribute("role", "option");
      li.dataset.value = opt.value;
      li.textContent = opt.textContent;
      if (opt.value === select.value) li.classList.add("is-selected");
      li.addEventListener("click", () => onPick(opt.value));
      menu.appendChild(li);
    });
  }

  function measureMenuCap(trigger, menu) {
    const spaceBelow = window.innerHeight - trigger.getBoundingClientRect().bottom - 12;
    const viewportCap = Math.min(280, Math.max(160, spaceBelow));
    const items = menu.querySelectorAll(".contact-combobox__option");
    const estimated = items.length * 46 + 16;
    const contentHeight = Math.max(menu.scrollHeight, estimated) + 2;
    return Math.min(contentHeight, viewportCap);
  }

  function setMenuCap(trigger, menu) {
    menu.style.setProperty("--combo-menu-cap", `${measureMenuCap(trigger, menu)}px`);
  }

  function enhanceSelect(wrap) {
    const select = wrap.querySelector("select");
    if (
      !select ||
      select.multiple ||
      wrap.hasAttribute("data-multiselect") ||
      wrap.querySelector(".mission-multiselect")
    ) {
      return;
    }
    if (wrap.querySelector(".contact-combobox")) return;
    if (wrap.dataset.comboEnhancing === "1") return;
    wrap.dataset.comboEnhancing = "1";

    const combobox = document.createElement("div");
    combobox.className = "contact-combobox";

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "contact-combobox__trigger contact-field__input";
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");

    const valueEl = document.createElement("span");
    valueEl.className = "contact-combobox__value";

    const chevron = document.createElement("span");
    chevron.className = "contact-combobox__chevron";
    chevron.setAttribute("aria-hidden", "true");

    trigger.append(valueEl, chevron);

    const menu = document.createElement("ul");
    menu.className = "contact-combobox__menu";
    menu.setAttribute("role", "listbox");
    menu.setAttribute("data-lenis-prevent", "");
    menu.addEventListener("wheel", (e) => e.stopPropagation(), { passive: true });

    let highlight = -1;

    function syncDisplay() {
      const empty = !select.value;
      const placeholderOpt = select.querySelector("option[disabled]") || select.options[0];
      const selectedOpt = select.selectedOptions[0];
      valueEl.textContent = empty
        ? placeholderOpt.textContent
        : selectedOpt.textContent;
      valueEl.classList.toggle("is-placeholder", empty);
      menu.querySelectorAll(".contact-combobox__option").forEach((el) => {
        el.classList.toggle("is-selected", el.dataset.value === select.value);
        el.setAttribute("aria-selected", el.dataset.value === select.value ? "true" : "false");
      });
    }

    function pickOption(value) {
      playClickSound();
      select.value = value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      syncDisplay();
      closeCombobox(combobox);
    }

    Array.from(select.options).forEach((opt) => {
      if (opt.disabled) return;
      const li = document.createElement("li");
      li.className = "contact-combobox__option";
      li.setAttribute("role", "option");
      li.dataset.value = opt.value;
      li.textContent = opt.textContent;
      if (opt.value === select.value) li.classList.add("is-selected");
      li.addEventListener("click", () => pickOption(opt.value));
      menu.appendChild(li);
    });

    function openMenu() {
      closeAllComboboxes(combobox);
      combobox.classList.remove("is-closing");
      rebuildMenuOptions(select, menu, pickOption);
      menu.scrollTop = 0;
      combobox.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
      setMenuCap(trigger, menu);
      requestAnimationFrame(() => {
        setMenuCap(trigger, menu);
        menu.scrollTop = 0;
      });

      const selectedIdx = Array.from(menu.children).findIndex((el) =>
        el.classList.contains("is-selected")
      );
      highlight = selectedIdx;
      menu.querySelectorAll(".contact-combobox__option").forEach((el) => {
        el.classList.remove("is-highlighted");
      });
    }

    function updateHighlight(scrollItem) {
      const items = menu.querySelectorAll(".contact-combobox__option");
      items.forEach((el, i) => el.classList.toggle("is-highlighted", highlight >= 0 && i === highlight));
      if (scrollItem && highlight >= 0 && items[highlight]) {
        items[highlight].scrollIntoView({ block: "nearest" });
      }
    }

    trigger.addEventListener("click", () => {
      if (combobox.classList.contains("is-open")) closeCombobox(combobox);
      else openMenu();
    });

    trigger.addEventListener("keydown", (e) => {
      const items = menu.querySelectorAll(".contact-combobox__option");
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!combobox.classList.contains("is-open")) openMenu();
        else {
          highlight = highlight < 0 ? 0 : Math.min(highlight + 1, items.length - 1);
          updateHighlight(true);
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (!combobox.classList.contains("is-open")) openMenu();
        else {
          highlight = highlight < 0 ? items.length - 1 : Math.max(highlight - 1, 0);
          updateHighlight(true);
        }
      } else if (e.key === "Enter" || e.key === " ") {
        if (!combobox.classList.contains("is-open")) {
          e.preventDefault();
          openMenu();
        } else if (highlight >= 0 && items[highlight]) {
          e.preventDefault();
          items[highlight].click();
        }
      } else if (e.key === "Escape") {
        closeCombobox(combobox);
      }
    });

    select.hidden = true;
    select.tabIndex = -1;
    wrap.textContent = "";
    combobox.append(trigger, menu, select);
    wrap.appendChild(combobox);
    syncDisplay();
    delete wrap.dataset.comboEnhancing;
  }

  const FORMSUBMIT_URL = "https://formsubmit.co/ajax/contact@astreia.space";

  let checkAudioCtx = null;

  function playCheckSound(ctx) {
    if (prefersReduced) return;
    try {
      if (!ctx) {
        checkAudioCtx = checkAudioCtx || new (window.AudioContext || window.webkitAudioContext)();
        ctx = checkAudioCtx;
      }
      const playTone = (freq, start, duration, gain) => {
        const osc = ctx.createOscillator();
        const vol = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        vol.gain.setValueAtTime(gain, ctx.currentTime + start);
        vol.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        osc.connect(vol);
        vol.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };
      playTone(880, 0, 0.12, 0.15);
      playTone(1320, 0.1, 0.18, 0.12);
    } catch (_) {}
  }

  window.playContactCheckSound = playCheckSound;

  function scrollToPageTop() {
    if (window.lenis) {
      window.lenis.scrollTo(0, { duration: prefersReduced ? 0 : 1.1 });
      return;
    }
    window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
  }

  function showFormSuccess(form, payload) {
    const data = {
      name: payload.name || "",
      email: payload.email || "",
      inquiry: payload.inquiry || "",
      domain: payload.domain || "",
      organization: payload.organization || "",
      region: payload.region || "",
      timeline: payload.timeline || "",
      message: payload.message || "",
      submittedAt: new Date().toISOString(),
    };

    if (window.saveContactThankYou) window.saveContactThankYou(data);

    const activated =
      typeof window.showContactThankYou === "function" && window.showContactThankYou(data);

    if (!activated) {
      window.location.assign("/contact/thank-you");
      return;
    }

    history.pushState({ contactThankYou: true }, "", "/contact/thank-you");
    playCheckSound();
    scrollToPageTop();
  }

  function showFormError(form, message) {
    const error = form.querySelector(".contact-form__error");
    if (!error) return;
    if (message) error.textContent = message;
    error.hidden = false;
  }

  function clearFormError(form) {
    const error = form.querySelector(".contact-form__error");
    if (error) error.hidden = true;
  }

  function showLoiInlineSuccess(form) {
    form.classList.add("is-sent");
    const wrap = form.closest(".mgm-loi__form-wrap, .dfs-mission__form-wrap");
    const success = wrap?.querySelector(".contact-form__success");
    if (success) {
      success.hidden = false;
      requestAnimationFrame(() => success.classList.add("is-visible"));
    }
    playCheckSound();
  }

  function isLoiForm(form) {
    return form.id === "loiForm";
  }

  function isMissionForm(form) {
    return form.id === "missionForm";
  }

  function getValidityTarget(field) {
    return field.querySelector("select.contact-field__input, input.contact-field__input:not([type=hidden]), textarea.contact-field__input");
  }

  function getVisibleControl(field) {
    return (
      field.querySelector(".mission-multiselect__trigger") ||
      field.querySelector(".contact-combobox__trigger") ||
      field.querySelector("textarea.contact-field__input") ||
      field.querySelector("input.contact-field__input:not([type=hidden])") ||
      field.querySelector("select.contact-field__input")
    );
  }

  function clearFieldInvalid(field) {
    field.classList.remove("is-invalid");
    getVisibleControl(field)?.classList.remove("is-invalid");
  }

  function setFieldInvalid(field) {
    field.classList.add("is-invalid");
    getVisibleControl(field)?.classList.add("is-invalid");
  }

  function clearFormValidation(form) {
    form.querySelectorAll(".contact-field.is-invalid").forEach(clearFieldInvalid);
  }

  function validateForm(form) {
    clearFormValidation(form);
    let firstInvalid = null;

    form.querySelectorAll(".contact-field").forEach((field) => {
      if (field.hidden || field.closest("[hidden]")) return;

      const target = getValidityTarget(field);
      if (!target || !target.willValidate) return;

      if (!target.checkValidity()) {
        setFieldInvalid(field);
        if (!firstInvalid) firstInvalid = getVisibleControl(field) || target;
      }
    });

    if (firstInvalid) {
      firstInvalid.focus({ preventScroll: true });
      firstInvalid.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "center" });
      return false;
    }

    return true;
  }

  function bindValidationClear(form) {
    const maybeClear = (e) => {
      const field = e.target.closest(".contact-field");
      if (!field) return;
      const target = getValidityTarget(field);
      if (target?.checkValidity()) clearFieldInvalid(field);
    };

    form.addEventListener("input", maybeClear);
    form.addEventListener("change", maybeClear);
  }

  function bindContactForm(form) {
    if (!form || form.hasAttribute("data-contact-bound")) return;

    form.querySelectorAll(".contact-field__select-wrap").forEach(enhanceSelect);

    form.querySelectorAll(".contact-field__input:not(select):not(.contact-combobox__trigger)").forEach((input) => {
      input.addEventListener("focus", () => input.classList.add("is-focused"));
      input.addEventListener("blur", () => input.classList.remove("is-focused"));
    });

    bindValidationClear(form);

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!validateForm(form)) return;

      playClickSound();
      clearFormError(form);

      const submitBtn = form.querySelector(".contact-form__submit");
      const submitLabel = submitBtn?.textContent || (isLoiForm(form) ? "Sign LOI" : isMissionForm(form) ? "Submit Mission" : "Send");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = isLoiForm(form) ? "Submitting…" : isMissionForm(form) ? "Submitting…" : "Sending…";
      }

      const fd = new FormData(form);
      const payload = Object.fromEntries(fd.entries());
      if (isLoiForm(form)) {
        payload._subject = "Manufacturing in Space LOI";
      } else if (isMissionForm(form)) {
        payload._subject = "Drop from Space: Mission Request";
      } else {
        payload._subject = `Astreia Inquiry: ${payload.inquiry || "General"}`;
      }

      try {
        const res = await fetch(FORMSUBMIT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        const failed = !res.ok || data.success === false || data.success === "false";
        if (failed) throw new Error(data.message || "Submission failed");
        if (isLoiForm(form) || isMissionForm(form)) {
          showLoiInlineSuccess(form);
        } else {
          showFormSuccess(form, payload);
        }
      } catch (err) {
        showFormError(form);
      } finally {
        if (submitBtn && !form.classList.contains("is-sent")) {
          submitBtn.disabled = false;
          submitBtn.textContent = submitLabel;
        }
      }
    });

    form.setAttribute("data-contact-bound", "");
    if (window.initMissionForm) window.initMissionForm();
  }

  function initContactForm() {
    document.querySelectorAll(".contact-form:not([data-contact-bound])").forEach(bindContactForm);
  }

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".contact-combobox")) closeAllComboboxes(null);
  });

  window.initContactForm = initContactForm;
  initContactForm();

  /* Observe body so SPA swap.replaceWith(#swap) still triggers init */
  new MutationObserver(() => {
    requestAnimationFrame(initContactForm);
  }).observe(document.body, { childList: true, subtree: true });

  window.addEventListener("pageshow", initContactForm);
})();
