const body = document.body;
const header = document.querySelector("[data-header]");
const scrollProgress = document.querySelector("[data-scroll-progress]");
const navToggle = document.querySelector(".nav-toggle, [data-menu-toggle]");
const navLinks = Array.from(document.querySelectorAll("[data-nav-link]"));
const tabButtons = Array.from(document.querySelectorAll("[data-tab]"));
const tabPanels = Array.from(document.querySelectorAll("[data-tab-panel]"));
const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
const portfolioCards = Array.from(document.querySelectorAll(".portfolio-card"));
const compareBlocks = Array.from(document.querySelectorAll("[data-compare]"));
const contactForm = document.querySelector("[data-contact-form]");
const formStatus = document.querySelector("[data-form-status]");
const consultationForm = document.querySelector("[data-consultation-form]");
const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));
const parallaxItems = Array.from(document.querySelectorAll("[data-parallax]"));
const lightboxButtons = Array.from(document.querySelectorAll("[data-lightbox]"));
const lightbox = document.querySelector("[data-lightbox-modal]");
const lightboxImage = document.querySelector("[data-lightbox-image]");
const lightboxCaption = document.querySelector("[data-lightbox-caption]");
const lightboxClose = document.querySelector("[data-lightbox-close]");
const lightboxPrev = document.querySelector("[data-lightbox-prev]");
const lightboxNext = document.querySelector("[data-lightbox-next]");
const journeySlides = Array.from(document.querySelectorAll("[data-journey-slide]"));
const journeyNext = document.querySelector("[data-journey-next]");
const journeyNextLabel = document.querySelector("[data-journey-next-label]");
const journeyProgress = document.querySelector("[data-journey-progress]");
const journeySection = document.querySelector("#journey");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const siteConfig = window.DevineHairStudioConfig || {};

let activeLightboxIndex = 0;
let currentJourneySlide = journeySlides.findIndex((slide) => slide.classList.contains("is-active"));
let journeyIsAnimating = false;
let scrollFrame = null;

if (currentJourneySlide < 0) {
  currentJourneySlide = 0;
}

const closeNavigation = () => {
  body.classList.remove("nav-open", "menu-open");
  navToggle?.setAttribute("aria-expanded", "false");
};

const scrollToTarget = (target) => {
  if (!target) {
    return;
  }

  const headerOffset = (header?.offsetHeight || 0) + 14;
  const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;

  window.scrollTo({
    top: Math.max(top, 0),
    behavior: "smooth",
  });
};

navToggle?.addEventListener("click", () => {
  const isOpen = !body.classList.contains("nav-open") && !body.classList.contains("menu-open");
  body.classList.toggle("nav-open", isOpen);
  body.classList.toggle("menu-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", closeNavigation);
});

navLinks.forEach((link) => {
  const href = link.getAttribute("href");

  if (!href || href.startsWith("#")) {
    return;
  }

  const linkUrl = new URL(href, window.location.href);
  const currentFile = window.location.pathname.split("/").pop() || "index.html";
  const linkFile = linkUrl.pathname.split("/").pop() || "index.html";

  if (currentFile === linkFile) {
    link.classList.add("is-active");
  }
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const targetId = anchor.getAttribute("href");

    if (!targetId || targetId === "#") {
      return;
    }

    const target = document.querySelector(targetId);

    if (!target) {
      return;
    }

    event.preventDefault();
    closeNavigation();
    scrollToTarget(target);
  });
});

const updateHeaderState = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 28);
};

const updateScrollProgress = () => {
  if (!scrollProgress) {
    return;
  }

  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  scrollProgress.style.setProperty("--scroll-progress", progress.toFixed(4));
};

const updateParallax = () => {
  if (prefersReducedMotion || window.innerWidth < 900) {
    parallaxItems.forEach((item) => {
      item.style.transform = "";
    });
    return;
  }

  const offset = Math.min(window.scrollY * 0.04, 42);
  parallaxItems.forEach((item) => {
    item.style.transform = `translateY(${offset}px) scale(1.04)`;
  });
};

updateHeaderState();
updateScrollProgress();
updateParallax();

const updateOnScroll = () => {
  updateHeaderState();
  updateScrollProgress();
  updateParallax();
  scrollFrame = null;
};

window.addEventListener("scroll", () => {
  if (scrollFrame) {
    return;
  }

  scrollFrame = window.requestAnimationFrame(updateOnScroll);
}, { passive: true });

window.addEventListener("resize", () => {
  updateParallax();
}, { passive: true });

const sections = navLinks
  .map((link) => link.getAttribute("href"))
  .filter((href) => href?.startsWith("#"))
  .map((href) => document.querySelector(href))
  .filter(Boolean);

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    {
      rootMargin: "-44% 0px -50% 0px",
      threshold: 0,
    },
  );

  sections.forEach((section) => sectionObserver.observe(section));

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const journeyLabels = ["Overview", "Beginning", "Early Career", "Specialty", "Today", "Portfolio"];
const journeyButtonLabels = ["Begin Journey", "Next Chapter", "Next Chapter", "Next Chapter", "See Portfolio", "Back to Overview"];

const updateJourneyControls = () => {
  if (!journeySlides.length) {
    return;
  }

  journeySlides.forEach((slide, index) => {
    slide.setAttribute("aria-hidden", String(index !== currentJourneySlide));
  });

  if (journeyProgress) {
    journeyProgress.textContent = `${journeyLabels[currentJourneySlide]} ${currentJourneySlide + 1} / ${journeySlides.length}`;
  }

  if (journeyNextLabel) {
    journeyNextLabel.textContent = journeyButtonLabels[currentJourneySlide];
  }
};

const showJourneySlide = (nextIndex) => {
  if (!journeySlides.length || journeyIsAnimating || nextIndex === currentJourneySlide) {
    return;
  }

  const currentSlide = journeySlides[currentJourneySlide];
  const nextSlide = journeySlides[nextIndex];

  journeyIsAnimating = true;
  currentSlide.classList.add("is-exiting");
  nextSlide.classList.add("is-active");

  window.setTimeout(() => {
    currentSlide.classList.remove("is-active", "is-exiting");
    currentJourneySlide = nextIndex;
    updateJourneyControls();
    journeyIsAnimating = false;
  }, 440);
};

journeyNext?.addEventListener("click", () => {
  const nextIndex = (currentJourneySlide + 1) % journeySlides.length;
  showJourneySlide(nextIndex);
  scrollToTarget(journeySection);
});

updateJourneyControls();

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const tabName = button.dataset.tab;

    tabButtons.forEach((currentButton) => {
      const isActive = currentButton === button;
      currentButton.classList.toggle("is-active", isActive);
      currentButton.setAttribute("aria-selected", String(isActive));
    });

    tabPanels.forEach((panel) => {
      panel.classList.toggle("is-hidden", panel.dataset.tabPanel !== tabName);
    });
  });
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((currentButton) => {
      const isActive = currentButton === button;
      currentButton.classList.toggle("is-active", isActive);
      currentButton.setAttribute("aria-selected", String(isActive));
    });

    portfolioCards.forEach((card) => {
      const shouldShow = filter === "all" || card.dataset.category === filter;
      card.classList.toggle("is-hidden", !shouldShow);
    });
  });
});

compareBlocks.forEach((block) => {
  const range = block.querySelector("[data-compare-range]");

  if (!range) {
    return;
  }

  const updateSplit = () => {
    block.style.setProperty("--split", `${range.value}%`);
  };

  range.addEventListener("input", updateSplit);
  updateSplit();
});

const openLightbox = (index) => {
  const button = lightboxButtons[index];

  if (!button || !lightbox || !lightboxImage || !lightboxCaption) {
    return;
  }

  activeLightboxIndex = index;
  lightboxImage.src = button.dataset.lightbox;
  lightboxImage.alt = button.querySelector("img")?.alt || "";
  lightboxCaption.textContent = button.dataset.title || "";
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  body.classList.add("lightbox-open");
  lightboxClose?.focus();
};

const closeLightbox = () => {
  lightbox?.classList.remove("is-open");
  lightbox?.setAttribute("aria-hidden", "true");
  body.classList.remove("lightbox-open");
  lightboxButtons[activeLightboxIndex]?.focus();
};

const moveLightbox = (direction) => {
  if (!lightboxButtons.length) {
    return;
  }

  const nextIndex = (activeLightboxIndex + direction + lightboxButtons.length) % lightboxButtons.length;
  openLightbox(nextIndex);
};

lightboxButtons.forEach((button, index) => {
  button.addEventListener("click", () => openLightbox(index));
});

lightboxClose?.addEventListener("click", closeLightbox);
lightboxPrev?.addEventListener("click", () => moveLightbox(-1));
lightboxNext?.addEventListener("click", () => moveLightbox(1));

lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeNavigation();
    if (body.classList.contains("lightbox-open")) {
      closeLightbox();
    }
  }

  if (!body.classList.contains("lightbox-open")) {
    return;
  }

  if (event.key === "ArrowLeft") {
    moveLightbox(-1);
  }

  if (event.key === "ArrowRight") {
    moveLightbox(1);
  }
});

const cleanFormValue = (value) => String(value || "").trim();

const selectedValues = (formData, name) =>
  formData.getAll(name)
    .map(cleanFormValue)
    .filter(Boolean);

const getConsultationComposedValues = (formData) => {
  const hairFactors = selectedValues(formData, "hairFactors");
  const desiredResultOptions = selectedValues(formData, "desiredResultOptions");
  const hairHistoryDetails = cleanFormValue(formData.get("hairHistoryDetails") || formData.get("hairHistory"));
  const hairGoalDetails = cleanFormValue(formData.get("hairGoalDetails") || formData.get("hairGoal"));
  const hairHistory = [
    hairFactors.length ? `Selected hair history: ${hairFactors.join(", ")}` : "",
    hairHistoryDetails,
  ].filter(Boolean).join("\n");
  const hairGoal = [
    desiredResultOptions.length ? `Desired result choices: ${desiredResultOptions.join(", ")}` : "",
    hairGoalDetails,
  ].filter(Boolean).join("\n");

  return {
    hairFactors,
    desiredResultOptions,
    hairHistory,
    hairGoal,
  };
};

const getConsultationFormData = (form) => {
  const formData = new FormData(form);
  const composed = getConsultationComposedValues(formData);

  formData.set("hairHistory", composed.hairHistory);
  formData.set("hairGoal", composed.hairGoal);

  return { formData, composed };
};

const formatSelection = (values, fallback = "None selected") => values.length ? values.join(", ") : fallback;

const buildConsultationDetails = (formData, photoNames = []) => {
  const composed = getConsultationComposedValues(formData);
  const details = [
    `Service: ${formData.get("service") || ""}`,
    `Client Type: ${formData.get("clientType") || ""}`,
    `Name: ${formData.get("name") || ""}`,
    `Email: ${formData.get("email") || ""}`,
    `Phone: ${formData.get("phone") || formData.get("contact") || ""}`,
    `Preferred Contact: ${formData.get("preferredContact") || ""}`,
    `Date Preference: ${formData.get("datePreference") || ""}`,
    `Time Preference: ${formData.get("timePreference") || ""}`,
    `Availability Flexibility: ${formData.get("availabilityFlexibility") || ""}`,
    `Current Color: ${formData.get("currentColor") || ""}`,
    `Hair Length: ${formData.get("hairLength") || ""}`,
    `Hair Factors: ${formatSelection(composed.hairFactors)}`,
    `Desired Result Choices: ${formatSelection(composed.desiredResultOptions)}`,
    `Budget Range: ${formData.get("budgetRange") || "Not provided"}`,
    `Inspiration Link: ${formData.get("inspirationLink") || ""}`,
    photoNames.length ? `Inspiration Photos: ${photoNames.join(", ")}` : "",
    "",
    "Hair history:",
    composed.hairHistory || "",
    "",
    "Desired hair goal:",
    composed.hairGoal || formData.get("message") || "",
    "",
    "Message/details:",
    formData.get("message") || "",
  ].filter(Boolean);

  return details;
};

const buildMailtoHref = (formData, photoNames = []) => {
  const subject = encodeURIComponent("Devine Hair Studio consultation request");
  const bodyText = encodeURIComponent(buildConsultationDetails(formData, photoNames).join("\n"));
  const email = siteConfig.email || "jendevine318@yahoo.com";

  return `mailto:${email}?subject=${subject}&body=${bodyText}`;
};

const fileToPayload = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener("load", () => {
      const result = String(reader.result || "");
      resolve({
        name: file.name,
        type: file.type,
        size: file.size,
        content: result.split(",")[1] || "",
      });
    });

    reader.addEventListener("error", () => reject(new Error("Could not read inspiration photo.")));
    reader.readAsDataURL(file);
  });

const setStatus = (statusElement, message, type = "") => {
  if (!statusElement) {
    return;
  }

  statusElement.classList.remove("is-success", "is-error");
  if (type) {
    statusElement.classList.add(type);
  }
  statusElement.innerHTML = message;
};

const todayDateValue = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
};

const getFieldGroup = (form, name) => form.querySelector(`[data-field-group="${name}"]`);

const getFirstFieldControl = (form, name) =>
  getFieldGroup(form, name)?.querySelector("input, select, textarea, button") ||
  form.querySelector(`[name="${name}"]`);

const clearFieldError = (form, name) => {
  const group = getFieldGroup(form, name);
  const errorElement = form.querySelector(`[data-error-for="${name}"]`);

  group?.classList.remove("has-error");
  errorElement?.removeAttribute("role");

  if (errorElement) {
    errorElement.textContent = "";
  }

  form.querySelectorAll(`[name="${name}"]`).forEach((control) => {
    control.removeAttribute("aria-invalid");
  });
};

const setFieldError = (form, name, message) => {
  const group = getFieldGroup(form, name);
  const errorElement = form.querySelector(`[data-error-for="${name}"]`);

  group?.classList.add("has-error");

  if (errorElement) {
    errorElement.textContent = message;
    errorElement.setAttribute("role", "alert");
  }

  form.querySelectorAll(`[name="${name}"]`).forEach((control) => {
    control.setAttribute("aria-invalid", "true");
  });
};

const clearConsultationErrors = (form) => {
  form.querySelectorAll("[data-error-for]").forEach((errorElement) => {
    clearFieldError(form, errorElement.dataset.errorFor);
  });
};

const isValidPhoneNumber = (value) => {
  const digits = cleanFormValue(value).replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
};

const isValidEmailAddress = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanFormValue(value));

const isPastDate = (value) => value && value < todayDateValue();

const isValidUrl = (value) => {
  const cleaned = cleanFormValue(value);

  if (!cleaned) {
    return true;
  }

  try {
    const parsed = new URL(cleaned);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch (_error) {
    return false;
  }
};

const getConsultationValidationErrors = (formData, composed) => {
  const errors = {};
  const requiredSelections = [
    ["service", "Choose a desired service."],
    ["clientType", "Choose whether you are a new or returning client."],
    ["name", "Enter your full name."],
    ["email", "Enter your email address."],
    ["phone", "Enter a phone number where Jennifer can reach you."],
    ["preferredContact", "Choose how you prefer to be contacted."],
    ["datePreference", "Choose a preferred appointment date."],
    ["timePreference", "Choose a preferred time of day."],
    ["availabilityFlexibility", "Choose how flexible your availability is."],
    ["currentColor", "Enter your current hair color."],
    ["hairLength", "Choose your current hair length."],
    ["acknowledgement", "Please acknowledge that this is a request, not a confirmed appointment."],
  ];

  requiredSelections.forEach(([name, message]) => {
    if (!cleanFormValue(formData.get(name))) {
      errors[name] = message;
    }
  });

  if (formData.get("email") && !isValidEmailAddress(formData.get("email"))) {
    errors.email = "Enter a valid email address.";
  }

  if (formData.get("phone") && !isValidPhoneNumber(formData.get("phone"))) {
    errors.phone = "Enter a valid phone number with at least 10 digits.";
  }

  if (isPastDate(formData.get("datePreference"))) {
    errors.datePreference = "Choose today or a future date.";
  }

  if (!composed.hairHistory) {
    errors.hairHistory = "Select at least one hair history option or add a short note.";
  }

  if (!composed.hairGoal) {
    errors.hairGoal = "Choose at least one desired result or add a short description.";
  }

  if (!isValidUrl(formData.get("inspirationLink"))) {
    errors.inspirationLink = "Enter a valid http or https link.";
  }

  return errors;
};

const applyConsultationErrors = (form, errors) => {
  clearConsultationErrors(form);

  Object.entries(errors).forEach(([name, message]) => {
    setFieldError(form, name, message);
  });

  const firstErrorName = Object.keys(errors)[0];
  const firstControl = firstErrorName ? getFirstFieldControl(form, firstErrorName) : null;

  firstControl?.focus({ preventScroll: true });
  getFieldGroup(form, firstErrorName)?.scrollIntoView({ behavior: "smooth", block: "center" });
};

const submitConsultation = async (form) => {
  const statusElement = form.querySelector("[data-form-status]");
  const submitButton = form.querySelector("button[type='submit']");
  const { formData, composed } = getConsultationFormData(form);
  const photosInput = form.querySelector("input[type='file'][name='photos']");
  const files = Array.from(photosInput?.files || []).slice(0, 3);

  if (form.dataset.submitting === "true") {
    return;
  }

  const validationErrors = getConsultationValidationErrors(formData, composed);
  if (Object.keys(validationErrors).length) {
    applyConsultationErrors(form, validationErrors);
    setStatus(statusElement, "Please review the highlighted fields before submitting.", "is-error");
    return;
  }

  const invalidFile = files.find((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 4 * 1024 * 1024);
  if (invalidFile) {
    setFieldError(form, "photos", "Inspiration photos must be JPEG, PNG, or WebP and 4MB or smaller.");
    setStatus(statusElement, "Inspiration photos must be JPEG, PNG, or WebP and 4MB or smaller.", "is-error");
    return;
  }

  clearConsultationErrors(form);
  form.dataset.submitting = "true";
  submitButton.disabled = true;
  submitButton.setAttribute("aria-busy", "true");
  submitButton.textContent = "Sending Request...";
  setStatus(statusElement, "Sending your consultation request...", "");

  try {
    const photos = await Promise.all(files.map(fileToPayload));
    const payload = {
      service: formData.get("service"),
      clientType: formData.get("clientType"),
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      preferredContact: formData.get("preferredContact"),
      datePreference: formData.get("datePreference"),
      timePreference: formData.get("timePreference"),
      availabilityFlexibility: formData.get("availabilityFlexibility"),
      hairLength: formData.get("hairLength"),
      hairHistory: composed.hairHistory,
      currentColor: formData.get("currentColor"),
      hairGoal: composed.hairGoal,
      hairFactors: composed.hairFactors,
      desiredResultOptions: composed.desiredResultOptions,
      budgetRange: formData.get("budgetRange"),
      inspirationLink: formData.get("inspirationLink"),
      message: formData.get("message"),
      acknowledgement: formData.get("acknowledgement") === "on",
      website: formData.get("website"),
      formStartedAt: formData.get("formStartedAt"),
      photos,
    };

    const response = await fetch(siteConfig.consultationEndpoint || "/api/consultation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (result.errors && typeof result.errors === "object") {
        applyConsultationErrors(form, result.errors);
      }

      const fallbackHref = buildMailtoHref(formData, files.map((file) => file.name));
      const message = result.code === "EMAIL_NOT_CONFIGURED"
        ? `Online email delivery is not configured yet. <a class="text-link dark-link" href="${fallbackHref}">Open email fallback</a>.`
        : `${result.message || "Your request could not be sent right now."} <a class="text-link dark-link" href="${fallbackHref}">Open email fallback</a>.`;

      setStatus(statusElement, message, "is-error");
      return;
    }

    form.reset();
    form.querySelector("[data-form-started-at]")?.setAttribute("value", String(Date.now()));
    setStatus(statusElement, result.message || "Your consultation request was sent. Jennifer will follow up soon.", "is-success");
    statusElement?.focus?.({ preventScroll: true });
  } catch (_error) {
    const fallbackHref = buildMailtoHref(formData, files.map((file) => file.name));
    setStatus(statusElement, `The online request could not be sent. <a class="text-link dark-link" href="${fallbackHref}">Open email fallback</a>.`, "is-error");
  } finally {
    form.dataset.submitting = "false";
    submitButton.disabled = false;
    submitButton.removeAttribute("aria-busy");
    submitButton.textContent = submitButton.dataset.submitLabel || "Submit Consultation Request";
  }
};

document.querySelectorAll("[data-form-started-at]").forEach((input) => {
  input.setAttribute("value", String(Date.now()));
});

document.querySelectorAll("input[type='date'][name='datePreference']").forEach((input) => {
  input.min = input.min || todayDateValue();
});

consultationForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  submitConsultation(consultationForm);
});

consultationForm?.addEventListener("input", (event) => {
  const name = event.target?.name;
  const relatedFields = {
    hairFactors: ["hairHistory"],
    hairHistoryDetails: ["hairHistory"],
    desiredResultOptions: ["hairGoal"],
    hairGoalDetails: ["hairGoal"],
  };

  if (name) {
    clearFieldError(consultationForm, name);
  }

  relatedFields[name]?.forEach((fieldName) => clearFieldError(consultationForm, fieldName));
});

consultationForm?.addEventListener("change", (event) => {
  const name = event.target?.name;
  const relatedFields = {
    hairFactors: ["hairHistory"],
    hairHistoryDetails: ["hairHistory"],
    desiredResultOptions: ["hairGoal"],
    hairGoalDetails: ["hairGoal"],
  };

  if (name) {
    clearFieldError(consultationForm, name);
  }

  relatedFields[name]?.forEach((fieldName) => clearFieldError(consultationForm, fieldName));
});

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(contactForm);
  const fallbackHref = buildMailtoHref(formData);
  window.location.href = fallbackHref;

  if (formStatus) {
    formStatus.textContent = "Opening your email app with the request details prepared.";
  }
});
const body = document.body;
const header = document.querySelector("[data-header]");
const scrollProgress = document.querySelector("[data-scroll-progress]");
const navToggle = document.querySelector(".nav-toggle, [data-menu-toggle]");
const navLinks = Array.from(document.querySelectorAll("[data-nav-link]"));
const tabButtons = Array.from(document.querySelectorAll("[data-tab]"));
const tabPanels = Array.from(document.querySelectorAll("[data-tab-panel]"));
const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
const portfolioCards = Array.from(document.querySelectorAll(".portfolio-card"));
const compareBlocks = Array.from(document.querySelectorAll("[data-compare]"));
const contactForm = document.querySelector("[data-contact-form]");
const formStatus = document.querySelector("[data-form-status]");
const consultationForm = document.querySelector("[data-consultation-form]");
const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));
const parallaxItems = Array.from(document.querySelectorAll("[data-parallax]"));
const lightboxButtons = Array.from(document.querySelectorAll("[data-lightbox]"));
const lightbox = document.querySelector("[data-lightbox-modal]");
const lightboxImage = document.querySelector("[data-lightbox-image]");
const lightboxCaption = document.querySelector("[data-lightbox-caption]");
const lightboxClose = document.querySelector("[data-lightbox-close]");
const lightboxPrev = document.querySelector("[data-lightbox-prev]");
const lightboxNext = document.querySelector("[data-lightbox-next]");
const journeySlides = Array.from(document.querySelectorAll("[data-journey-slide]"));
const journeyNext = document.querySelector("[data-journey-next]");
const journeyNextLabel = document.querySelector("[data-journey-next-label]");
const journeyProgress = document.querySelector("[data-journey-progress]");
const journeySection = document.querySelector("#journey");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const siteConfig = window.DevineHairStudioConfig || {};

let activeLightboxIndex = 0;
let currentJourneySlide = journeySlides.findIndex((slide) => slide.classList.contains("is-active"));
let journeyIsAnimating = false;
let scrollFrame = null;

if (currentJourneySlide < 0) {
  currentJourneySlide = 0;
}

const closeNavigation = () => {
  body.classList.remove("nav-open", "menu-open");
  navToggle?.setAttribute("aria-expanded", "false");
};

const scrollToTarget = (target) => {
  if (!target) {
    return;
  }

  const headerOffset = (header?.offsetHeight || 0) + 14;
  const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;

  window.scrollTo({
    top: Math.max(top, 0),
    behavior: "smooth",
  });
};

navToggle?.addEventListener("click", () => {
  const isOpen = !body.classList.contains("nav-open") && !body.classList.contains("menu-open");
  body.classList.toggle("nav-open", isOpen);
  body.classList.toggle("menu-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", closeNavigation);
});

navLinks.forEach((link) => {
  const href = link.getAttribute("href");

  if (!href || href.startsWith("#")) {
    return;
  }

  const linkUrl = new URL(href, window.location.href);
  const currentFile = window.location.pathname.split("/").pop() || "index.html";
  const linkFile = linkUrl.pathname.split("/").pop() || "index.html";

  if (currentFile === linkFile) {
    link.classList.add("is-active");
  }
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const targetId = anchor.getAttribute("href");

    if (!targetId || targetId === "#") {
      return;
    }

    const target = document.querySelector(targetId);

    if (!target) {
      return;
    }

    event.preventDefault();
    closeNavigation();
    scrollToTarget(target);
  });
});

const updateHeaderState = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 28);
};

const updateScrollProgress = () => {
  if (!scrollProgress) {
    return;
  }

  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  scrollProgress.style.setProperty("--scroll-progress", progress.toFixed(4));
};

const updateParallax = () => {
  if (prefersReducedMotion || window.innerWidth < 900) {
    parallaxItems.forEach((item) => {
      item.style.transform = "";
    });
    return;
  }

  const offset = Math.min(window.scrollY * 0.04, 42);
  parallaxItems.forEach((item) => {
    item.style.transform = `translateY(${offset}px) scale(1.04)`;
  });
};

updateHeaderState();
updateScrollProgress();
updateParallax();

const updateOnScroll = () => {
  updateHeaderState();
  updateScrollProgress();
  updateParallax();
  scrollFrame = null;
};

window.addEventListener("scroll", () => {
  if (scrollFrame) {
    return;
  }

  scrollFrame = window.requestAnimationFrame(updateOnScroll);
}, { passive: true });

window.addEventListener("resize", () => {
  updateParallax();
}, { passive: true });

const sections = navLinks
  .map((link) => link.getAttribute("href"))
  .filter((href) => href?.startsWith("#"))
  .map((href) => document.querySelector(href))
  .filter(Boolean);

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    {
      rootMargin: "-44% 0px -50% 0px",
      threshold: 0,
    },
  );

  sections.forEach((section) => sectionObserver.observe(section));

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const journeyLabels = ["Overview", "Beginning", "Early Career", "Specialty", "Today", "Portfolio"];
const journeyButtonLabels = ["Begin Journey", "Next Chapter", "Next Chapter", "Next Chapter", "See Portfolio", "Back to Overview"];

const updateJourneyControls = () => {
  if (!journeySlides.length) {
    return;
  }

  journeySlides.forEach((slide, index) => {
    slide.setAttribute("aria-hidden", String(index !== currentJourneySlide));
  });

  if (journeyProgress) {
    journeyProgress.textContent = `${journeyLabels[currentJourneySlide]} ${currentJourneySlide + 1} / ${journeySlides.length}`;
  }

  if (journeyNextLabel) {
    journeyNextLabel.textContent = journeyButtonLabels[currentJourneySlide];
  }
};

const showJourneySlide = (nextIndex) => {
  if (!journeySlides.length || journeyIsAnimating || nextIndex === currentJourneySlide) {
    return;
  }

  const currentSlide = journeySlides[currentJourneySlide];
  const nextSlide = journeySlides[nextIndex];

  journeyIsAnimating = true;
  currentSlide.classList.add("is-exiting");
  nextSlide.classList.add("is-active");

  window.setTimeout(() => {
    currentSlide.classList.remove("is-active", "is-exiting");
    currentJourneySlide = nextIndex;
    updateJourneyControls();
    journeyIsAnimating = false;
  }, 440);
};

journeyNext?.addEventListener("click", () => {
  const nextIndex = (currentJourneySlide + 1) % journeySlides.length;
  showJourneySlide(nextIndex);
  scrollToTarget(journeySection);
});

updateJourneyControls();

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const tabName = button.dataset.tab;

    tabButtons.forEach((currentButton) => {
      const isActive = currentButton === button;
      currentButton.classList.toggle("is-active", isActive);
      currentButton.setAttribute("aria-selected", String(isActive));
    });

    tabPanels.forEach((panel) => {
      panel.classList.toggle("is-hidden", panel.dataset.tabPanel !== tabName);
    });
  });
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((currentButton) => {
      const isActive = currentButton === button;
      currentButton.classList.toggle("is-active", isActive);
      currentButton.setAttribute("aria-selected", String(isActive));
    });

    portfolioCards.forEach((card) => {
      const shouldShow = filter === "all" || card.dataset.category === filter;
      card.classList.toggle("is-hidden", !shouldShow);
    });
  });
});

compareBlocks.forEach((block) => {
  const range = block.querySelector("[data-compare-range]");

  if (!range) {
    return;
  }

  const updateSplit = () => {
    block.style.setProperty("--split", `${range.value}%`);
  };

  range.addEventListener("input", updateSplit);
  updateSplit();
});

const openLightbox = (index) => {
  const button = lightboxButtons[index];

  if (!button || !lightbox || !lightboxImage || !lightboxCaption) {
    return;
  }

  activeLightboxIndex = index;
  lightboxImage.src = button.dataset.lightbox;
  lightboxImage.alt = button.querySelector("img")?.alt || "";
  lightboxCaption.textContent = button.dataset.title || "";
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  body.classList.add("lightbox-open");
  lightboxClose?.focus();
};

const closeLightbox = () => {
  lightbox?.classList.remove("is-open");
  lightbox?.setAttribute("aria-hidden", "true");
  body.classList.remove("lightbox-open");
  lightboxButtons[activeLightboxIndex]?.focus();
};

const moveLightbox = (direction) => {
  if (!lightboxButtons.length) {
    return;
  }

  const nextIndex = (activeLightboxIndex + direction + lightboxButtons.length) % lightboxButtons.length;
  openLightbox(nextIndex);
};

lightboxButtons.forEach((button, index) => {
  button.addEventListener("click", () => openLightbox(index));
});

lightboxClose?.addEventListener("click", closeLightbox);
lightboxPrev?.addEventListener("click", () => moveLightbox(-1));
lightboxNext?.addEventListener("click", () => moveLightbox(1));

lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeNavigation();
    if (body.classList.contains("lightbox-open")) {
      closeLightbox();
    }
  }

  if (!body.classList.contains("lightbox-open")) {
    return;
  }

  if (event.key === "ArrowLeft") {
    moveLightbox(-1);
  }

  if (event.key === "ArrowRight") {
    moveLightbox(1);
  }
});

const cleanFormValue = (value) => String(value || "").trim();

const selectedValues = (formData, name) =>
  formData.getAll(name)
    .map(cleanFormValue)
    .filter(Boolean);

const getConsultationComposedValues = (formData) => {
  const hairFactors = selectedValues(formData, "hairFactors");
  const desiredResultOptions = selectedValues(formData, "desiredResultOptions");
  const hairHistoryDetails = cleanFormValue(formData.get("hairHistoryDetails") || formData.get("hairHistory"));
  const hairGoalDetails = cleanFormValue(formData.get("hairGoalDetails") || formData.get("hairGoal"));
  const hairHistory = [
    hairFactors.length ? `Selected hair history: ${hairFactors.join(", ")}` : "",
    hairHistoryDetails,
  ].filter(Boolean).join("\n");
  const hairGoal = [
    desiredResultOptions.length ? `Desired result choices: ${desiredResultOptions.join(", ")}` : "",
    hairGoalDetails,
  ].filter(Boolean).join("\n");

  return {
    hairFactors,
    desiredResultOptions,
    hairHistory,
    hairGoal,
  };
};

const getConsultationFormData = (form) => {
  const formData = new FormData(form);
  const composed = getConsultationComposedValues(formData);

  formData.set("hairHistory", composed.hairHistory);
  formData.set("hairGoal", composed.hairGoal);

  return { formData, composed };
};

const formatSelection = (values, fallback = "None selected") => values.length ? values.join(", ") : fallback;

const buildConsultationDetails = (formData, photoNames = []) => {
  const composed = getConsultationComposedValues(formData);
  const details = [
    `Service: ${formData.get("service") || ""}`,
    `Client Type: ${formData.get("clientType") || ""}`,
    `Name: ${formData.get("name") || ""}`,
    `Email: ${formData.get("email") || ""}`,
    `Phone: ${formData.get("phone") || formData.get("contact") || ""}`,
    `Preferred Contact: ${formData.get("preferredContact") || ""}`,
    `Date Preference: ${formData.get("datePreference") || ""}`,
    `Time Preference: ${formData.get("timePreference") || ""}`,
    `Availability Flexibility: ${formData.get("availabilityFlexibility") || ""}`,
    `Current Color: ${formData.get("currentColor") || ""}`,
    `Hair Length: ${formData.get("hairLength") || ""}`,
    `Hair Factors: ${formatSelection(composed.hairFactors)}`,
    `Desired Result Choices: ${formatSelection(composed.desiredResultOptions)}`,
    `Budget Range: ${formData.get("budgetRange") || "Not provided"}`,
    `Inspiration Link: ${formData.get("inspirationLink") || ""}`,
    photoNames.length ? `Inspiration Photos: ${photoNames.join(", ")}` : "",
    "",
    "Hair history:",
    composed.hairHistory || "",
    "",
    "Desired hair goal:",
    composed.hairGoal || formData.get("message") || "",
    "",
    "Message/details:",
    formData.get("message") || "",
  ].filter(Boolean);

  return details;
};

const buildMailtoHref = (formData, photoNames = []) => {
  const subject = encodeURIComponent("Devine Hair Studio consultation request");
  const bodyText = encodeURIComponent(buildConsultationDetails(formData, photoNames).join("\n"));
  const email = siteConfig.email || "jendevine318@yahoo.com";

  return `mailto:${email}?subject=${subject}&body=${bodyText}`;
};

const fileToPayload = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener("load", () => {
      const result = String(reader.result || "");
      resolve({
        name: file.name,
        type: file.type,
        size: file.size,
        content: result.split(",")[1] || "",
      });
    });

    reader.addEventListener("error", () => reject(new Error("Could not read inspiration photo.")));
    reader.readAsDataURL(file);
  });

const setStatus = (statusElement, message, type = "") => {
  if (!statusElement) {
    return;
  }

  statusElement.classList.remove("is-success", "is-error");
  if (type) {
    statusElement.classList.add(type);
  }
  statusElement.innerHTML = message;
};

const todayDateValue = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
};

const getFieldGroup = (form, name) => form.querySelector(`[data-field-group="${name}"]`);

const getFirstFieldControl = (form, name) =>
  getFieldGroup(form, name)?.querySelector("input, select, textarea, button") ||
  form.querySelector(`[name="${name}"]`);

const clearFieldError = (form, name) => {
  const group = getFieldGroup(form, name);
  const errorElement = form.querySelector(`[data-error-for="${name}"]`);

  group?.classList.remove("has-error");
  errorElement?.removeAttribute("role");

  if (errorElement) {
    errorElement.textContent = "";
  }

  form.querySelectorAll(`[name="${name}"]`).forEach((control) => {
    control.removeAttribute("aria-invalid");
  });
};

const setFieldError = (form, name, message) => {
  const group = getFieldGroup(form, name);
  const errorElement = form.querySelector(`[data-error-for="${name}"]`);

  group?.classList.add("has-error");

  if (errorElement) {
    errorElement.textContent = message;
    errorElement.setAttribute("role", "alert");
  }

  form.querySelectorAll(`[name="${name}"]`).forEach((control) => {
    control.setAttribute("aria-invalid", "true");
  });
};

const clearConsultationErrors = (form) => {
  form.querySelectorAll("[data-error-for]").forEach((errorElement) => {
    clearFieldError(form, errorElement.dataset.errorFor);
  });
};

const isValidPhoneNumber = (value) => {
  const digits = cleanFormValue(value).replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
};

const isValidEmailAddress = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanFormValue(value));

const isPastDate = (value) => value && value < todayDateValue();

const isValidUrl = (value) => {
  const cleaned = cleanFormValue(value);

  if (!cleaned) {
    return true;
  }

  try {
    const parsed = new URL(cleaned);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch (_error) {
    return false;
  }
};

const getConsultationValidationErrors = (formData, composed) => {
  const errors = {};
  const requiredSelections = [
    ["service", "Choose a desired service."],
    ["clientType", "Choose whether you are a new or returning client."],
    ["name", "Enter your full name."],
    ["email", "Enter your email address."],
    ["phone", "Enter a phone number where Jennifer can reach you."],
    ["preferredContact", "Choose how you prefer to be contacted."],
    ["datePreference", "Choose a preferred appointment date."],
    ["timePreference", "Choose a preferred time of day."],
    ["availabilityFlexibility", "Choose how flexible your availability is."],
    ["currentColor", "Enter your current hair color."],
    ["hairLength", "Choose your current hair length."],
    ["acknowledgement", "Please acknowledge that this is a request, not a confirmed appointment."],
  ];

  requiredSelections.forEach(([name, message]) => {
    if (!cleanFormValue(formData.get(name))) {
      errors[name] = message;
    }
  });

  if (formData.get("email") && !isValidEmailAddress(formData.get("email"))) {
    errors.email = "Enter a valid email address.";
  }

  if (formData.get("phone") && !isValidPhoneNumber(formData.get("phone"))) {
    errors.phone = "Enter a valid phone number with at least 10 digits.";
  }

  if (isPastDate(formData.get("datePreference"))) {
    errors.datePreference = "Choose today or a future date.";
  }

  if (!composed.hairHistory) {
    errors.hairHistory = "Select at least one hair history option or add a short note.";
  }

  if (!composed.hairGoal) {
    errors.hairGoal = "Choose at least one desired result or add a short description.";
  }

  if (!isValidUrl(formData.get("inspirationLink"))) {
    errors.inspirationLink = "Enter a valid http or https link.";
  }

  return errors;
};

const applyConsultationErrors = (form, errors) => {
  clearConsultationErrors(form);

  Object.entries(errors).forEach(([name, message]) => {
    setFieldError(form, name, message);
  });

  const firstErrorName = Object.keys(errors)[0];
  const firstControl = firstErrorName ? getFirstFieldControl(form, firstErrorName) : null;

  firstControl?.focus({ preventScroll: true });
  getFieldGroup(form, firstErrorName)?.scrollIntoView({ behavior: "smooth", block: "center" });
};

const submitConsultation = async (form) => {
  const statusElement = form.querySelector("[data-form-status]");
  const submitButton = form.querySelector("button[type='submit']");
  const { formData, composed } = getConsultationFormData(form);
  const photosInput = form.querySelector("input[type='file'][name='photos']");
  const files = Array.from(photosInput?.files || []).slice(0, 3);

  if (form.dataset.submitting === "true") {
    return;
  }

  const validationErrors = getConsultationValidationErrors(formData, composed);
  if (Object.keys(validationErrors).length) {
    applyConsultationErrors(form, validationErrors);
    setStatus(statusElement, "Please review the highlighted fields before submitting.", "is-error");
    return;
  }

  const invalidFile = files.find((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 4 * 1024 * 1024);
  if (invalidFile) {
    setFieldError(form, "photos", "Inspiration photos must be JPEG, PNG, or WebP and 4MB or smaller.");
    setStatus(statusElement, "Inspiration photos must be JPEG, PNG, or WebP and 4MB or smaller.", "is-error");
    return;
  }

  clearConsultationErrors(form);
  form.dataset.submitting = "true";
  submitButton.disabled = true;
  submitButton.setAttribute("aria-busy", "true");
  submitButton.textContent = "Sending Request...";
  setStatus(statusElement, "Sending your consultation request...", "");

  try {
    const photos = await Promise.all(files.map(fileToPayload));
    const payload = {
      service: formData.get("service"),
      clientType: formData.get("clientType"),
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      preferredContact: formData.get("preferredContact"),
      datePreference: formData.get("datePreference"),
      timePreference: formData.get("timePreference"),
      availabilityFlexibility: formData.get("availabilityFlexibility"),
      hairLength: formData.get("hairLength"),
      hairHistory: composed.hairHistory,
      currentColor: formData.get("currentColor"),
      hairGoal: composed.hairGoal,
      hairFactors: composed.hairFactors,
      desiredResultOptions: composed.desiredResultOptions,
      budgetRange: formData.get("budgetRange"),
      inspirationLink: formData.get("inspirationLink"),
      message: formData.get("message"),
      acknowledgement: formData.get("acknowledgement") === "on",
      website: formData.get("website"),
      formStartedAt: formData.get("formStartedAt"),
      photos,
    };

    const response = await fetch(siteConfig.consultationEndpoint || "/api/consultation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (result.errors && typeof result.errors === "object") {
        applyConsultationErrors(form, result.errors);
      }

      const fallbackHref = buildMailtoHref(formData, files.map((file) => file.name));
      const message = result.code === "EMAIL_NOT_CONFIGURED"
        ? `Online email delivery is not configured yet. <a class="text-link dark-link" href="${fallbackHref}">Open email fallback</a>.`
        : `${result.message || "Your request could not be sent right now."} <a class="text-link dark-link" href="${fallbackHref}">Open email fallback</a>.`;

      setStatus(statusElement, message, "is-error");
      return;
    }

    form.reset();
    form.querySelector("[data-form-started-at]")?.setAttribute("value", String(Date.now()));
    setStatus(statusElement, result.message || "Your consultation request was sent. Jennifer will follow up soon.", "is-success");
    statusElement?.focus?.({ preventScroll: true });
  } catch (_error) {
    const fallbackHref = buildMailtoHref(formData, files.map((file) => file.name));
    setStatus(statusElement, `The online request could not be sent. <a class="text-link dark-link" href="${fallbackHref}">Open email fallback</a>.`, "is-error");
  } finally {
    form.dataset.submitting = "false";
    submitButton.disabled = false;
    submitButton.removeAttribute("aria-busy");
    submitButton.textContent = submitButton.dataset.submitLabel || "Submit Consultation Request";
  }
};

document.querySelectorAll("[data-form-started-at]").forEach((input) => {
  input.setAttribute("value", String(Date.now()));
});

document.querySelectorAll("input[type='date'][name='datePreference']").forEach((input) => {
  input.min = input.min || todayDateValue();
});

consultationForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  submitConsultation(consultationForm);
});

consultationForm?.addEventListener("input", (event) => {
  const name = event.target?.name;
  const relatedFields = {
    hairFactors: ["hairHistory"],
    hairHistoryDetails: ["hairHistory"],
    desiredResultOptions: ["hairGoal"],
    hairGoalDetails: ["hairGoal"],
  };

  if (name) {
    clearFieldError(consultationForm, name);
  }

  relatedFields[name]?.forEach((fieldName) => clearFieldError(consultationForm, fieldName));
});

consultationForm?.addEventListener("change", (event) => {
  const name = event.target?.name;
  const relatedFields = {
    hairFactors: ["hairHistory"],
    hairHistoryDetails: ["hairHistory"],
    desiredResultOptions: ["hairGoal"],
    hairGoalDetails: ["hairGoal"],
  };

  if (name) {
    clearFieldError(consultationForm, name);
  }

  relatedFields[name]?.forEach((fieldName) => clearFieldError(consultationForm, fieldName));
});

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(contactForm);
  const fallbackHref = buildMailtoHref(formData);
  window.location.href = fallbackHref;

  if (formStatus) {
    formStatus.textContent = "Opening your email app with the request details prepared.";
  }
});
