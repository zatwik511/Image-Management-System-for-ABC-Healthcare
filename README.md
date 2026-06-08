# MediSync HMS

**A full-stack Hospital Management System built for real-world clinical workflows**

[![CI](https://github.com/satwikgupta/medisync-hms/actions/workflows/ci.yml/badge.svg)](https://github.com/satwikgupta/medisync-hms/actions/workflows/ci.yml)
[![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow)](LICENSE)

MediSync is a production-grade Hospital Management System that covers the complete clinical and administrative lifecycle — from patient registration and appointment scheduling through medical imaging (including DICOM), prescriptions, vitals, billing, and a full audit trail. A separate patient-facing portal lets patients register, book appointments, and access their own records without any staff involvement.

---

## Live Demo

**[https://medisync-hms.onrender.com](https://medisync-hms.onrender.com)**

> Hosted on Render free tier — the first request after inactivity may take ~30 seconds while the service wakes. Subsequent requests are instant.

### Try it now

| Portal | Login | Credentials |
|--------|-------|-------------|
| **Patient Portal** | Email + PIN | `alex.morgan.demo@gmail.com` / `123456` |
| **Staff Portal (Doctor)** | Staff Code + PIN | `DOC-005` / `123456` |
| **Staff Portal (Admin)** | — | *Available on request — video walkthrough below* |

The demo accounts have pre-loaded records, images, appointments, and prescriptions so you can explore every feature immediately.

---

## Features

### Staff Portal

**Patient Management**
- Register patients with full demographic and medical history details
- Search, filter, and paginate across the patient roster
- Soft-delete with full data retention for audit compliance
- Track NHS/insurance identifiers, GP referrals, and emergency contacts

**Medical Imaging**
- Upload MRI, CT, X-ray, and DICOM files (up to 10 MB)
- In-browser DICOM viewer powered by Cornerstone.js — scroll slices, adjust window/level, zoom and pan without any plugin
- Image lightbox for standard formats (PNG / JPEG)
- Per-image disease-type classification and notes
- Images stored on AWS S3 and proxied through the API — the bucket is never exposed directly

**Appointments**
- Calendar-style scheduling with doctor availability management
- Conflict detection prevents double-booking
- Automated reminder emails sent 24 hours before each appointment via a node-cron job
- Receptionists and doctors each have a dedicated dashboard view of their own schedule

**Prescriptions & Vitals**
- Doctors add structured prescriptions (medication, dosage, frequency, duration)
- Vitals recording (blood pressure, heart rate, temperature, oxygen saturation, weight)
- Both are timestamped and linked to the patient record and the attending doctor

**Financial Records**
- Billing entries tied to individual patients
- Cost summary view with running totals per patient

**Diagnostic Reports**
- Structured report creation linked to images and appointments
- Radiologist and doctor roles each have appropriate read/write access

**Audit Log**
- Every create, update, and delete operation writes an immutable entry to the audit log
- Filterable by staff member, action type, entity, and date range
- Admin-only access

**Staff Administration** *(admin only)*
- Create, update, and deactivate staff accounts with role assignment
- Roles: `admin`, `doctor`, `radiologist`, `receptionist`
- Each role has a different set of permitted routes, enforced at the API layer

**Notifications**
- In-app notification feed per staff member
- Automated triggers on appointment status changes and system events

### Patient Portal

A fully separate portal with its own authentication, isolated from the staff system.

- **Self-registration** — patients create their own account with email and a self-chosen PIN
- **Book appointments** — select doctor, specialty, date and time; see real-time availability
- **My Records** — view test results, diagnostic reports, and uploaded images
- **My Prescriptions** — see active and past prescriptions
- **My Appointments** — upcoming and historical appointment list

---

## Architecture

### Monorepo Structure

```
medisync-hms/
├── backend/          # Express.js REST API (TypeScript, Node.js ≥ 20)
├── frontend/         # React 19 SPA (TypeScript, Vite 7)
├── shared/           # Shared TypeScript types and Zod validation schemas
├── .github/
│   └── workflows/
│       └── ci.yml    # GitHub Actions: type-check, lint, test on push/PR
├── render.yaml       # Render deployment configuration
└── package.json      # npm workspaces root with build and dev scripts
```

The build pipeline compiles the React app into `frontend/dist/`, and the Express server serves those static files directly — a single Render service hosts both frontend and backend with no CORS complexity in production.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite 7, Tailwind CSS 3, React Router 7 |
| **State / Data** | TanStack Query v5, React Hook Form 7, Zod 4 |
| **HTTP Client** | Axios (staff client + separate patient client) |
| **DICOM Viewer** | Cornerstone.js, cornerstone-wado-image-loader, dicom-parser |
| **Backend** | Node.js ≥ 20, Express 4, TypeScript 5, tsx (dev), tsc (prod) |
| **Database** | PostgreSQL on [Neon](https://neon.tech) (serverless, connection-pool mode) |
| **File Storage** | AWS S3 (eu-west-2), multer memoryStorage → direct SDK upload |
| **Auth** | JWT in httpOnly cookies (staff), localStorage token (patient) |
| **Logging** | Pino + pino-pretty |
| **Scheduler** | node-cron (appointment reminders) |
| **Email** | Nodemailer |
| **Hosting** | Render (single web service) |
| **Uptime** | UptimeRobot pinging `/health` every 5 minutes |
| **CI** | GitHub Actions |

### Authentication & Authorisation

Two completely separate authentication flows share the same Express server:

**Staff** — `POST /api/auth/login` with `staffCode` + `PIN`. Returns a JWT stored in an httpOnly, Secure, SameSite=Strict cookie. The `authMiddleware` verifies the JWT on every protected route and attaches `req.user` with `staffId` and `role`.

**Patient** — `POST /api/patient-auth/login` with `email` + `PIN`. Returns a short-lived JWT stored in localStorage. The `patientAuthMiddleware` reads the `x-patient-id` header and validates the token.

**RBAC** — route-level role guards (e.g., admin-only for `/api/staff`, `/api/audit`; read-only for `receptionist` on image routes) are enforced in Express middleware, not just in the UI.

**Lockout & Rate Limiting** — both login endpoints are wrapped with `express-rate-limit` (5 attempts per 15 minutes). Failed attempts are counted per account and trigger a lockout stored in the database.

### Database Design

Neon PostgreSQL with 15 incremental migration scripts (`npm run migrate`). Key tables:

| Table | Purpose |
|-------|---------|
| `patients` | Demographics, medical history, soft-delete flag |
| `staff` | Accounts, roles, hashed PINs, lockout state |
| `medical_images` | S3 key, image type, disease classification, notes |
| `appointments` | Schedule, status, doctor/patient links |
| `doctor_availability` | Per-doctor weekly availability windows |
| `prescriptions` | Medications linked to patient + doctor |
| `vitals` | Timestamped vitals per patient |
| `financial_records` | Billing entries per patient |
| `audit_logs` | Immutable action log (who did what to which record) |
| `notifications` | Per-staff notification feed |

All foreign keys use `ON DELETE CASCADE` where appropriate; soft deletes on patients preserve the audit trail.

### Image Pipeline

```
Browser → multipart/form-data → Express (multer memoryStorage)
  → AWS S3 SDK PutObjectCommand (private bucket)
  → DB row saved with S3 key as /uploads/<key>

Browser → GET /uploads/<key>
  → Express proxy → S3 GetObjectCommand → streams body to browser
```

The S3 bucket has no public access. All reads are proxied through the Express API so existing auth and rate-limit middleware applies.

In local development, images are saved to `backend/uploads/` and served as static files — no AWS credentials required.

### Single-Service Deployment

```
npm run build   →   frontend/dist/  +  backend/dist/
npm start       →   node backend/dist/app.js
                      ├── serves /api/* (REST)
                      ├── serves /uploads/* (S3 proxy)
                      ├── serves /health (UptimeRobot target)
                      └── serves frontend/dist/* → index.html (SPA fallback)
```

---

## Getting Started (Local Development)

### Prerequisites

- Node.js ≥ 20
- A PostgreSQL database (local or [Neon free tier](https://neon.tech))
- (Optional) AWS S3 bucket for image storage — local disk is used if not configured

### 1. Clone and install

```bash
git clone https://github.com/satwikgupta/medisync-hms.git
cd medisync-hms
npm install
```

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and fill in the required values (see table below).

### 3. Run migrations and seed

```bash
npm run migrate --prefix backend
npm run seed --prefix backend
```

### 4. Start the dev server

```bash
npm run dev
```

This starts the backend on `http://localhost:3000` and the Vite dev server on `http://localhost:5173` concurrently, with hot-reload on both.

---

## Environment Variables

Create `backend/.env` (never commit this file):

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (e.g., Neon `postgres://...`) |
| `JWT_SECRET` | Yes | Random string ≥ 64 chars used to sign JWTs |
| `PORT` | No | HTTP port (default `3000`; Render sets this automatically) |
| `AWS_ACCESS_KEY_ID` | S3 only | IAM access key with S3 read/write on your bucket |
| `AWS_SECRET_ACCESS_KEY` | S3 only | Corresponding IAM secret |
| `AWS_REGION` | S3 only | e.g., `eu-west-2` |
| `AWS_S3_BUCKET` | S3 only | Bucket name. Omit to use local disk storage in dev |
| `ALLOWED_ORIGINS` | No | Comma-separated extra CORS origins (Render URL is auto-added) |
| `SMTP_HOST` | Email only | SMTP server for appointment reminders |
| `SMTP_USER` | Email only | SMTP username |
| `SMTP_PASS` | Email only | SMTP password |

---

## Scripts

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start backend + frontend in watch mode (concurrently) |
| `npm run build` | Build frontend then backend for production |
| `npm start` | Start the production server (`node backend/dist/app.js`) |
| `npm run migrate --prefix backend` | Apply all pending database migrations |
| `npm run seed --prefix backend` | Seed demo patients, staff, and sample data |
| `npm test --prefix backend` | Run backend test suite (Jest + Supertest) |
| `npm test --prefix frontend` | Run frontend test suite (Vitest) |

---

## Project Structure

```
backend/src/
├── app.ts                  # Express setup, middleware, route wiring
├── routes/                 # One file per resource (15 route files)
├── services/               # Business logic layer
│   ├── s3Service.ts        # AWS S3 upload / download / delete
│   ├── ImageService.ts
│   ├── PatientService.ts
│   └── ...
├── middleware/
│   ├── authMiddleware.ts   # JWT verification for staff
│   ├── patientAuthMiddleware.ts
│   └── errorHandler.ts
├── database/
│   ├── db.ts               # pg Pool initialisation
│   ├── migrate.ts          # Migration runner
│   └── run*Migration.ts    # 15 incremental migration scripts
├── jobs/
│   └── reminderJob.ts      # node-cron appointment reminder emails
└── scripts/
    └── seed.ts             # Demo data seeding

frontend/src/
├── pages/                  # Top-level route components
│   ├── patient/            # Patient portal pages
│   └── dashboard/          # Role-specific dashboard views
├── components/             # Reusable UI components
│   ├── DicomViewerModal.tsx # Cornerstone.js DICOM viewer
│   └── ImageLightbox.tsx
├── api/
│   ├── client.ts           # Axios instance for staff API
│   └── patientClient.ts    # Axios instance for patient API
└── App.tsx                 # React Router layout and route definitions

shared/
└── src/
    └── types/              # Shared TypeScript interfaces used by both packages
```

---

## Security Highlights

- Passwords (PINs) are hashed with **bcrypt** (salt rounds = 12) — never stored in plaintext
- JWTs are stored in **httpOnly cookies** for staff (immune to XSS token theft)
- All database queries use **parameterised statements** via the `pg` driver — no raw string interpolation
- **Rate limiting** on auth endpoints: 5 requests per 15 minutes per IP
- **Account lockout** after repeated failures, tracked in the database
- **File upload validation**: MIME type and extension checks on every upload; 10 MB size limit
- **CORS whitelist**: only `localhost` in dev and the Render service URL in production
- **Role-based route guards** enforced server-side — role restrictions are not just a UI concern
- S3 bucket has **no public access** — all image reads go through the authenticated API proxy

---

## Deployment (Render)

The repository includes a `render.yaml` that configures a single Web Service:

- **Build command:** `npm install && npm run build`
- **Start command:** `npm start`
- **Health check path:** `/health`

Set the environment variables listed above in the Render dashboard. `RENDER_EXTERNAL_URL` is injected automatically by Render and used by the CORS configuration.

To keep the free-tier service warm, point a monitoring service (e.g., UptimeRobot) to `https://<your-service>.onrender.com/health` with a 5-minute check interval.

---

## License

ISC
