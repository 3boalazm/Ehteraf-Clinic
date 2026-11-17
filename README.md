# Ehteraf Clinic — M0 Foundation

Bilingual (Arabic RTL / English LTR) front-end prototype for a multi-branch physical therapy management platform. The first milestone establishes the deployable Next.js foundation and an interactive executive dashboard; it is intentionally mock-driven and contains no real patient data or backend integrations.

## Included

- Next.js App Router, TypeScript, Tailwind CSS, Lucide icons, and Recharts.
- Self-hosted Inter and IBM Plex Sans Arabic font files; no runtime font CDN dependency.
- Arabic-first dashboard at `/ar/dashboard`; English at `/en/dashboard`; `/` redirects to Arabic.
- Responsive, collapsible navigation shell with mobile drawer.
- Demo role switcher with role-scoped navigation and access-denied states.
- Three provisional branches: Al Ghadeer, Al Dar Al Baida, and Al Quwayiyah (names should be confirmed against operating data).
- Light/dark theme, branch selector, dashboard date/service filters, search across demo appointments, and notification popover.
- Mock dashboard repository separated from UI components. Branch, role, theme, and sidebar preferences persist in browser local storage.
- Future feature routes display a clear “coming soon” placeholder rather than a broken page.

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
```

## Deploy to Vercel

Import this repository into Vercel and use the default Next.js settings. No environment variables or external services are required for this prototype. The `build` script is `next build`; Vercel will install dependencies and run it automatically.

## Prototype boundaries

Roles and access restrictions are UX simulations, not security controls. Dashboard values and appointments are illustrative demo data. The three branch names and actual employee/role assignments remain provisional. The demo branch-manager, receptionist, and therapist roles are temporarily scoped to Al Ghadeer. Do not enter real or sensitive medical information.
