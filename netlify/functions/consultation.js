const MAX_PHOTO_BYTES = 4 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  },
  body: JSON.stringify(body),
});

const clean = (value) => String(value || "").replace(/\s+/g, " ").trim();

const escapeHtml = (value) =>
  clean(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(value));

const requiredFields = [
  ["service", "Service"],
  ["clientType", "Client type"],
  ["name", "Name"],
  ["email", "Email"],
  ["phone", "Phone"],
  ["preferredContact", "Preferred contact method"],
  ["datePreference", "Preferred appointment date or range"],
  ["timePreference", "Preferred time of day"],
  ["hairHistory", "Hair history"],
  ["currentColor", "Current hair color"],
  ["hairGoal", "Desired hair goal"],
];

const renderList = (payload) => {
  const factors = Array.isArray(payload.hairFactors) ? payload.hairFactors.join(", ") : "None selected";

  return `
    <h2>New Devine Hair Studio Consultation Request</h2>
    <table cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;font-family:Arial,sans-serif;">
      <tr><td><strong>Service</strong></td><td>${escapeHtml(payload.service)}</td></tr>
      <tr><td><strong>Client Type</strong></td><td>${escapeHtml(payload.clientType)}</td></tr>
      <tr><td><strong>Name</strong></td><td>${escapeHtml(payload.name)}</td></tr>
      <tr><td><strong>Email</strong></td><td>${escapeHtml(payload.email)}</td></tr>
      <tr><td><strong>Phone</strong></td><td>${escapeHtml(payload.phone)}</td></tr>
      <tr><td><strong>Preferred Contact</strong></td><td>${escapeHtml(payload.preferredContact)}</td></tr>
      <tr><td><strong>Date Preference</strong></td><td>${escapeHtml(payload.datePreference)}</td></tr>
      <tr><td><strong>Time Preference</strong></td><td>${escapeHtml(payload.timePreference)}</td></tr>
      <tr><td><strong>Current Color</strong></td><td>${escapeHtml(payload.currentColor)}</td></tr>
      <tr><td><strong>Hair Factors</strong></td><td>${escapeHtml(factors)}</td></tr>
      <tr><td><strong>Hair History</strong></td><td>${escapeHtml(payload.hairHistory)}</td></tr>
      <tr><td><strong>Hair Goal</strong></td><td>${escapeHtml(payload.hairGoal)}</td></tr>
      <tr><td><strong>Inspiration Link</strong></td><td>${escapeHtml(payload.inspirationLink)}</td></tr>
      <tr><td><strong>Message</strong></td><td>${escapeHtml(payload.message)}</td></tr>
    </table>
    <p style="font-family:Arial,sans-serif;color:#555;">Appointment is not confirmed until Jennifer follows up directly.</p>
  `;
};

const validatePhotos = (photos = []) => {
  if (!Array.isArray(photos)) {
    return [];
  }

  return photos.slice(0, 3).map((photo) => {
    const name = clean(photo.name);
    const type = clean(photo.type);
    const size = Number(photo.size || 0);
    const content = String(photo.content || "");

    if (!name || !type || !content) {
      throw new Error("Photo upload data is incomplete.");
    }

    if (!ALLOWED_PHOTO_TYPES.has(type)) {
      throw new Error("Only JPEG, PNG, or WebP inspiration photos are allowed.");
    }

    if (size > MAX_PHOTO_BYTES) {
      throw new Error("Each inspiration photo must be 4MB or smaller.");
    }

    return {
      filename: name,
      content,
    };
  });
};

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, message: "Method not allowed." });
  }

  let payload;

  try {
    payload = JSON.parse(event.body || "{}");
  } catch (_error) {
    return json(400, { ok: false, message: "Invalid request body." });
  }

  if (clean(payload.website)) {
    return json(200, { ok: true, message: "Request received." });
  }

  const errors = {};

  requiredFields.forEach(([key, label]) => {
    if (!clean(payload[key])) {
      errors[key] = `${label} is required.`;
    }
  });

  if (payload.email && !isValidEmail(payload.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!payload.acknowledgement) {
    errors.acknowledgement = "Please acknowledge that the appointment is not confirmed until Jennifer follows up.";
  }

  const elapsed = Date.now() - Number(payload.formStartedAt || 0);
  if (Number.isFinite(elapsed) && elapsed > 0 && elapsed < 2500) {
    errors.form = "Please review your request before submitting.";
  }

  let attachments = [];

  try {
    attachments = validatePhotos(payload.photos);
  } catch (error) {
    errors.photos = error.message;
  }

  if (Object.keys(errors).length) {
    return json(422, { ok: false, message: "Please correct the highlighted fields.", errors });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_FORM_TO_EMAIL;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "Devine Hair Studio <onboarding@resend.dev>";

  if (!apiKey || !toEmail) {
    return json(503, {
      ok: false,
      code: "EMAIL_NOT_CONFIGURED",
      message: "Consultation email delivery is not configured yet. Please use the email fallback.",
    });
  }

  const html = renderList(payload);
  const subject = `Consultation request: ${clean(payload.service)} - ${clean(payload.name)}`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      reply_to: clean(payload.email),
      subject,
      html,
      attachments,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("Resend delivery failed", detail);
    return json(502, {
      ok: false,
      message: "Your request could not be sent right now. Please try again or use the email fallback.",
    });
  }

  if (process.env.SEND_CLIENT_CONFIRMATION !== "false" && isValidEmail(payload.email)) {
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [clean(payload.email)],
        subject: "Devine Hair Studio received your consultation request",
        html: `
          <p>Hi ${escapeHtml(payload.name)},</p>
          <p>Thank you for reaching out to Devine Hair Studio. Jennifer received your consultation request and will follow up to discuss timing, service fit, and next steps.</p>
          <p>Your appointment is not confirmed until you receive a direct confirmation.</p>
        `,
      }),
    }).catch((error) => console.error("Client confirmation failed", error));
  }

  return json(200, {
    ok: true,
    message: "Your consultation request was sent. Jennifer will follow up to confirm availability and next steps.",
  });
};
