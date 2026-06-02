# Devine Hair Studio Website

Premium static website for Devine Hair Studio, a Denver-based appointment-only salon led by Jennifer Devine.

## Tech Stack

- Static HTML pages
- Shared CSS in `styles.css`
- Shared browser JavaScript in `script.js`
- Public business config in `config.js`
- Netlify Functions for consultation form email delivery

## Pages

- `index.html` - cinematic homepage
- `assets/about.html` - Jennifer's story and journey
- `assets/services.html` - services and appointment process
- `assets/portfolio.html` - gallery, filters, before/after slider, lightbox
- `assets/consultation.html` - professional consultation request form

## Local Development

Run a static preview:

```bash
python -m http.server 8123 --bind 127.0.0.1
```

Open:

```text
http://127.0.0.1:8123/index.html
```

Run the validation check:

```bash
node scripts/validate-site.js
```

If Node/npm are available, this also works:

```bash
npm run check
npm run build
```

## Booking and Consultation Flow

All major booking CTAs route to `assets/consultation.html`.

The consultation form collects:

- Desired service
- New or returning client
- Name, email, and phone
- Preferred contact method
- Preferred date/range and time of day
- Hair history
- Current color
- Desired goal
- Box dye, previous color, extensions, corrective work, smoothing treatment, or damage notes
- Optional inspiration link
- Optional inspiration photos
- Confirmation that appointment availability is not guaranteed until Jennifer follows up

The form submits to:

```text
/api/consultation
```

On Netlify this is redirected to:

```text
/.netlify/functions/consultation
```

If email delivery is not configured, the form does not pretend to succeed. It shows a clear error and provides an email fallback.

## Required Environment Variables

Copy `.env.example` into your Netlify environment variables and update values:

```env
CONTACT_FORM_TO_EMAIL=jendevine318@yahoo.com
RESEND_API_KEY=re_your_resend_api_key_here
RESEND_FROM_EMAIL=Devine Hair Studio <hello@yourdomain.com>
SEND_CLIENT_CONFIRMATION=true
NEXT_PUBLIC_SITE_URL=https://devinehairstudio.com
NEXT_PUBLIC_BOOKING_URL=
```

`RESEND_API_KEY` and `RESEND_FROM_EMAIL` are required for production email delivery through the Netlify Function.

## Deployment

Recommended host: Netlify.

1. Push this project to GitHub.
2. Create a new Netlify site from the repo.
3. Use these settings:
   - Build command: `npm run build`
   - Publish directory: `.`
   - Functions directory: `netlify/functions`
4. Add the environment variables from `.env.example`.
5. Deploy.

Netlify clean routes are configured:

- `/about`
- `/services`
- `/portfolio`
- `/consultation`
- `/api/consultation`

## Business Information Still Needed

- Real external booking URL if Jennifer chooses Square, GlossGenius, Vagaro, Acuity, Calendly, or another platform
- Confirm final public phone number
- Confirm final public email address
- Confirm whether a street address should be public or private appointment-only
- Final logo/favicon files if available
- More client-approved portfolio images
- Resend account/API key and verified sending domain for production form delivery

## Notes

- No secrets are stored in the repository.
- Optional inspiration photos are limited to 3 files, 4MB each, JPEG/PNG/WebP.
- The consultation request is not an appointment confirmation.
- A $50 cancellation or no-show fee is referenced in the website copy.
