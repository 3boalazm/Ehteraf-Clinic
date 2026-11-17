# Ehteraf Clinic — Multi-module Clinic Platform Prototype

Bilingual (Arabic RTL / English LTR) front-end prototype for an extensible, multi-branch physical therapy management platform. The app includes an executive dashboard, patient and scheduling workflows, and a connected set of operational module workspaces. Everything is mock-driven; there are no backend integrations or real patient records.

## Included

- Next.js App Router, TypeScript, Tailwind CSS, Lucide icons, Recharts, Zod, and React Hook Form.
- Self-hosted Inter and IBM Plex Sans Arabic font files; no runtime font CDN dependency.
- Arabic-first routes under `/ar` and English routes under `/en`; `/` redirects to `/ar/dashboard`.
- Responsive, collapsible navigation shell, demo role switcher, role-scoped navigation, and access-denied states.
- Three provisional branches: Al Ghadeer, Al Dar Al Baida, and Al Quwayiyah (confirm names against operating data).
- Executive dashboard with branch, date-range, and service filters; revenue, collections, appointments, patients, operational metrics, a selectable month overview, today’s clinician roster, and recent activity.
- Refreshed responsive visual system: dark collapsible navigation rail, premium gradient workspace headers, clinical-neutral surfaces, teal primary actions, restrained blue/lavender/lime accents, consistent data tables/cards, and RTL/LTR-aware layouts across all routes.
- Image-by-image audit of all 20 supplied references, including exact duplicate groups, visible aggregate dashboard data, reusable patterns, and privacy/scope guardrails: [Design reference analysis](docs/design-reference-analysis.md).
- Patient directory with search, filters, CSV export, pagination, profile creation/editing, and a Patient 360 profile with overview, medical, episode, appointment, package, financial, and document tabs.
- Appointment directory with attendance/session status actions, cancellation, rescheduling, and a booking workflow that checks therapist/slot conflicts.
- Day, week, and month calendar views. New patients and appointments are saved to browser local storage and appear in the other clinic pages.
- Mock repository adapter with 100 synthetic patients and 200 synthetic appointments. Branch, role, theme, sidebar, and clinic demo data are kept in browser storage; owner demo can restore the seed data.
- Activated mock-driven workspaces for branches, clinical review, treatment plans, services, packages, invoices/collections, inventory, procurement, employees, reports, marketing, notifications, and settings. Shared workspace tools include search, status filters, branch scope, local demo creation/status changes, CSV export, and responsive bilingual layouts.
- Workspace settings connect to the existing local branch, role, theme, language, and sidebar controls. Role and access behavior remains a visual simulation, not security.

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
