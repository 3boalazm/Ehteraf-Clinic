# Ehteraf Clinic — M1 Core Clinic Experience

Bilingual (Arabic RTL / English LTR) front-end prototype for a multi-branch physical therapy management platform. M0 establishes the deployable application shell and executive dashboard; M1 adds the patient and scheduling workflows. Everything is mock-driven, and no real patient data or backend integrations are used.

## Included

- Next.js App Router, TypeScript, Tailwind CSS, Lucide icons, Recharts, Zod, and React Hook Form.
- Self-hosted Inter and IBM Plex Sans Arabic font files; no runtime font CDN dependency.
- Arabic-first routes under `/ar` and English routes under `/en`; `/` redirects to `/ar/dashboard`.
- Responsive, collapsible navigation shell, demo role switcher, role-scoped navigation, and access-denied states.
- Three provisional branches: Al Ghadeer, Al Dar Al Baida, and Al Quwayiyah (confirm names against operating data).
- Executive dashboard with branch, date-range, and service filters; revenue, collections, appointments, patients, operational metrics, and recent activity.
- Patient directory with search, filters, CSV export, pagination, profile creation/editing, and a Patient 360 profile with overview, medical, episode, appointment, package, financial, and document tabs.
- Appointment directory with attendance/session status actions, cancellation, rescheduling, and a booking workflow that checks therapist/slot conflicts.
- Day, week, and month calendar views. New patients and appointments are saved to browser local storage and appear in the other clinic pages.
- Mock repository adapter with 100 synthetic patients and 200 synthetic appointments. Branch, role, theme, sidebar, and clinic demo data are kept in browser storage; owner demo can restore the seed data.
- Future feature routes show a clear “coming soon” state instead of a broken page.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Useful checks:

```bash
npm run typecheck
npm run lint
npm run build
npm audit --audit-level=moderate
```

## Deploy to Vercel

Import this repository into Vercel and use the default Next.js settings. No environment variables or external services are required. The `build` script is `next build`; Vercel will install dependencies and run it automatically.

## Prototype boundaries

Roles and access restrictions are UX simulations, not security controls. Patient, appointment, clinical, and financial content is illustrative demo data. The three branch names and actual employee/role assignments remain provisional. Demo branch-manager, receptionist, and therapist roles are temporarily scoped to Al Ghadeer. Do not enter real or sensitive medical information.
