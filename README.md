# International Consortium of Jurists (ICJ) — Frontend

Next.js enterprise frontend for the International Consortium of Jurists (ICJ) public portal, citizen legal aid desk, and member dashboard.

## Tech Stack

- **Framework:** Next.js 16 (Turbopack, App Router)
- **UI & Design System:** MUI 9 + Emotion (Tailored Judicial Affidavit Theme)
- **State & Forms:** Dynamic Schema-Driven Intake Architecture
- **Language:** TypeScript 5
- **Backend:** Django 5.x REST API (JWT Authenticated, No Supabase)

---

## Official Judicial Affidavit Theme & Design Guidelines

All official intake forms (**Seek Assistance**, **Join ICJ**, **Professional Empanelment**) adhere to the unified institutional court affidavit format:

1. **Physical Legal Sheet Appearance:**
   - Double judicial border (`border: 3px double #0f2942`) with ivory/white background (`#fdfdfc`).
   - Official court corner marks `⌜` and `⌝` in dark navy (`#0f2942`).
   - Top institutional ribbon in Deep Navy (`#0f2942`) with Gold Shield icon (`#f59e0b`) and amber bottom border (`#b45309`).
   - Centered ICJ Emblem, gold guild subtitle, and single-line dashed title banner.
   - Live filing metadata line: Filing Type, Current Date, Intake Registry.

2. **Underline Baseline Inputs (Zero 4-Sided Boxes):**
   - Inputs use `variant="standard"` with clean bottom border (`borderBottom: 1.5px solid #cbd5e1`, focus `2px solid #0f2942`).
   - 4-sided rounded outlines (`MuiOutlinedInput-notchedOutline`) are completely removed (`border: none !important`).
   - Form fields align in neat 2-column (`sm: 6`) and 3-column (`sm: 4`) responsive grids with zero zig-zag misalignment.

3. **Passport Size Photograph Upload:**
   - Dedicated physical stamp frame (120px x 145px, 3.5cm x 4.5cm ratio) with camera icon and live image preview.
   - Supported across all intake forms (`profile_picture` / `photo` multipart upload).

4. **Single-Step Intake (No Wizards, No Popups):**
   - Forms render directly on their respective page in a continuous, transparent flow without multi-step wizards or popup modals.

---

## Dynamic Admin Form Configuration

All form fields are schema-driven and controllable by the Admin:

- **Seek Assistance (`/assistance`):**
  - Fetches dynamic schema from `GET /api/v1/services/form-config/`.
  - Admin can add, reorder, or toggle fields via `AdminAssistanceFormFieldListCreateAPIView` (`/admin/services/form-fields/`).
  - Seed database: `python manage.py seed_seek_assistance`.

- **Member Enrollment / Empanelment (`/join` & Dashboard):**
  - Sends user credentials and `profile_picture` to `POST /api/v1/auth/register/`.
  - Multi-pathway empanelment centered around the **3 Real-World Wings**:
    1. 🏛️ **Legal Professional Wing** (`legal_professional` — Advocate, Senior Counsel, Legal Advisor)
    2. 💼 **Other Professional Wing** (`other_professional` — CA, CS, Forensic Auditor, Mediator)
    3. 🤝 **Volunteer & Para-Legal Wing** (`volunteer` — Para-Legal Volunteer, Fellow, Student)
  - Controlled under the unified **Member & Professional Onboarding** admin panel (`/admin/professional-onboarding/categories`).
  - Seed database: `python manage.py seed_professional_onboarding`.

---

## Local Development Commands

```bash
# Install dependencies
npm install

# Start development server with Turbopack
npm run dev

# Run TypeScript typecheck
npx tsc --noEmit

# Production build
npm run build
```

---

## Master OTP & Verification (Local Dev vs Production)

For testing verification flows locally without waiting for email delivery:

- **Master OTP:** `123456`
- **Local Dev (`NODE_ENV !== "production"`):**
  - Entering `123456` will immediately verify OTP and grant access to the next step across:
    - **Track Case Status** (`/track-case`)
    - **Email Verification Fields** (`EmailVerificationField` on `/join` and dynamic onboarding forms)
  - Real OTP codes are still sent to the user's email address via EmailJS + Django SMTP.
- **Production (`NODE_ENV === "production"`):**
  - Master OTP is **strictly disabled**. Only the live code sent to the applicant's verified email is accepted.
