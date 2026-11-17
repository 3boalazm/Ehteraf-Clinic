# Ehteraf Clinic — visual reference analysis

**Reviewed:** 17 November 2026
**Scope:** all 20 image attachments supplied for the clinic UI redesign.
**Purpose:** record the visible layouts, labels, sample metrics, reusable patterns, and privacy guardrails before applying a unified Ehteraf design system.

> **Reading note:** the screenshots vary in resolution and some text is too small to read with confidence. Approximate or unreadable content is marked accordingly. Five filename groups are exact file duplicates. Similar-looking screenshots are called out separately. Names, faces, patient histories, diagnoses, medication names, and other person-linked health details are deliberately not transcribed or copied into the application; the previous product requirement is to keep this prototype free of real patient data. All figures and labels below are reference-only, not Ehteraf operational data.

## Attachment map

| Attachment(s) | Resolution | Relationship | Reference |
|---|---:|---|---|
| `image-1.png`, `image-2.png`, `image-3.png` | 736×920 | Exact pixel duplicates | Medix dashboard poster/tablet |
| `image-4.png`, `image-5.png` | 1200×900 | Exact pixel duplicates | Dr+ patient overview and care timeline |
| `image-6.png` | 1024×768 | Unique | Ehr. clinical record timeline |
| `image-7.png` | 1200×900 | Unique | Med.+ clinical workspace |
| `image-8.png` | 736×552 | Unique | CityCare hospital operations dashboard |
| `image-9.png` | 1200×900 | Unique | Dynamics 365-style business dashboard |
| `image-10.png` | 1200×900 | Unique | Health Karma score dashboard |
| `image-11.png` | 1024×768 | Unique | Salesforce-style invoice workspace |
| `image-12.png`, `image-13.png` | 736×736 | Exact pixel duplicates | Wellness / home-workout dashboard |
| `image-14.png` | 1200×900 | Unique | Green fitness and attendance dashboard |
| `image-15.png`, `image-16.png` | 735×552 | Exact pixel duplicates | N-branded analytics dashboard |
| `image-17.png` | 1200×900 | Unique | Wallet, transfers, and cash-flow dashboard |
| `image-18.png`, `image-19.png` | 1235×918 | Exact pixel duplicates; visually related to 15/16, but not pixel-identical | Enlarged N-branded analytics reference with image-search overlay |
| `image-20.png` | 736×566 | Unique | MediCare+ hospital dashboard |

There are **14 unique screenshot compositions** across the 20 filenames. The two N-branded sets (15/16 and 18/19) share a visual language, but are recorded as separate variants because their files differ.

---

## Image-by-image notes

### Image 1 — `image-1.png`: Medix dashboard poster

- **Frame and style:** tall lavender-to-pink gradient canvas with narrow vertical light bands; white pill-shaped captions at the top (“Dashboard Mockup”, “Data Dashboard”, “Design by Saddam”) and a “Save for Inspiration” control at the bottom. A wide black-framed tablet contains the product UI.
- **App shell:** “MEDIX” wordmark; narrow black icon rail; greeting (“Good Morning, Dr, Liza”); small profile, settings, and notification controls. The left navigation is icon-first, while the dashboard content is light, densely card-based, and rounded.
- **KPI cards:** “Total Appointment” **56**, “Total Report” **27**, “Health Progress” **87.86%**, and “New Patients” **35**.
- **Analytics:** “Your patients today” chart with new-patient and insurance-patient summary blocks (visible values include **56** and **23**); two plotted series across weekdays; compact category chips.
- **Calendar:** “Appointment”, **April 2026**, a small month grid with the 04 date highlighted, and previous/next controls.
- **Lower cards:** “Events” list with toggle/status controls and a “Your patients today” appointment list showing time, patient, and diagnosis fields. Person-linked values are redacted in this dossier.
- **Right feature card:** “Upcoming Doctor”, a clinician profile/picture, speciality chip, short bio, date/time and duration, and a full-width “Appointment” action.
- **Reusable patterns:** a compact high-level metric row; calendar plus day counts; a readable next-appointment list; a focused clinician card; dark icon rail against soft white surfaces.

### Image 2 — `image-2.png`

- Exact duplicate of image 1. All layout, copy, and visible data are documented under image 1; this file adds no new UI elements.

### Image 3 — `image-3.png`

- Exact duplicate of image 1. All layout, copy, and visible data are documented under image 1; this file adds no new UI elements.

### Image 4 — `image-4.png`: Dr+ patient overview / longitudinal care timeline

- **Frame and style:** wide rounded dark frame around a warm grey/ivory workspace, with highly rounded cards and a vivid lime highlight.
- **Top navigation:** “Dr+”, “Search Patient”, and capsule tabs for “Overview”, “Visits”, “Labs”, “Imagings”, “Vital Signs”, and “Communication”.
- **Patient summary:** profile photo and demographic/contact-style fields, social-history and care-plan mini-cards, plus a small add/open action. Personal identifiers and history values are not copied here.
- **Condition distribution:** “Cardiology” **48%**, “Nervous” **32%**, “Respiratory” **22%**, “Integumentary” **16%**, and “Muscular” **8%**; the unusually large lime card represents the selected category.
- **Record filters:** a tune/filter control followed by “Office Visits”, “Medications”, “Labs”, “Procedures”, “Hospitalizations”, and “Imaging”.
- **Timeline:** horizontal care-history line through **May–September** with visit/document, pill, lab, and imaging markers; small count bubbles; a large add button; zoom controls and a multi-year scrubber labeled **2020**, **2021**, **2022**.
- **Lower modules:** “Vital Signs History”, “Records”, and “Labs”; the visible example includes a heart-rate chart and a **120 bpm** callout. Person-linked medical values are intentionally not transcribed.
- **Reusable patterns:** an expandable patient 360; records organized by visit type; a chronological timeline; icon-coded events; category-level health summary; persistent time zoom/scrubber.

### Image 5 — `image-5.png`

- Exact duplicate of image 4. All layout and labels are documented under image 4; this file adds no new elements.

### Image 6 — `image-6.png`: Ehr. clinical record graph

- **Frame and style:** white/very-light canvas, rounded black frame, blue connectors, and strong blue selected cards.
- **Top navigation:** “Ehr.”, search, and filters “All”, “Docs”, “Labs”, “Imaging”, “Medications”, “Visits”, “Emergency”, “Procedures”, and “App Use”. A year/month rail is on the far right.
- **Left context rail:** a dark selected-condition card with an add/close control; specialist/profile entries with counts; a selected blue “Doctor’s Notes” card with vitals/document shortcuts.
- **Main content:** a connected chronological graph of visits, referrals, labs, imaging, and medicines. Visible categories include Cardiology, MRI, Ultrasound, Hemoglobin, CT scan, and medication events. Individual diagnoses, patient identity, measurements, and medication details are not transcribed.
- **Bottom controls:** a map/timeline minimap and round calendar, crop/zoom, and filter controls.
- **Reusable patterns:** a graph view for longitudinal care, filters by record kind, a focused left-side record context, and clear color coding for event types.

### Image 7 — `image-7.png`: Med.+ clinical workspace

- **Frame and style:** tablet-like light workspace with a bold saturated-blue upper-left patient strip and black lower navigation rail; rounded cards sit on a pale neutral background.
- **Left side:** “Med.+”, **9 patients**, add/search controls, a selected-person summary card, and quick vitals tiles. The patient identity and health readings are not copied.
- **Navigation:** “Overview”, “Notes”, “Documents”, “Labs”, and “Imagings”.
- **Top filters:** “Visits”, “Hospitalizations”, “Procedures”, “Labs”, “Medication”, plus search, a therapist avatar/name, and a menu control.
- **Clinical overview:** category cards such as Respiratory, Circulatory, Neurology, and Cardiology with percentage progress bars; additional diagnosis/symptom cards and small add/document actions.
- **Timeline/workspace:** connected visit, referral, lab, and imaging cards with clinician initials, dates, symptom chips, and scan thumbnails; a bottom year-range selector and zoom controls.
- **Lower panels:** “Medications” and “Diagnosis”. Person-specific diagnoses, blood group, measurements, names, and scans are omitted from the notes.
- **Reusable patterns:** patient selection alongside clinical context, persistent record-type tabs, progress cards, event connections, and a stable clinician identity/control area.

### Image 8 — `image-8.png`: CityCare operations dashboard

- **Frame and style:** photographed, wide white clinical operations dashboard with a subtle green/orange glow and a deep-charcoal lower band.
- **Navigation:** “Dashboard”, “Patients”, “Appointments”, “Doctors”, “Analytics”; profile and notification controls at the top right.
- **Top KPIs:** **Total Patients 1,223**, **Available Beds 128**, **Duty Doctor 74**, **Appointments 612**.
- **Performance cards:** “Patient Recovery” **86%**, “Bed Utilization” **86%**, and a central “Care Efficiency” **92%** gauge; tiny sublabels compare recent/initial care status.
- **Analytics:** “Patient Admission Trend” line/area chart with Day/Week/Month selectors and weekday labels.
- **Lower dark zone:** “Patients Symptoms” chips/control; “Dept. Performance” cards for Neurology **97%**, Pediatrics **91%**, and Cardiology **95%** with small patient/time counters; “Critical Alerts” list with severity/time rows.
- **Reusable patterns:** an overview that balances operational KPIs, a trend graph, service-line performance, and a concise alert queue. Hospital-only beds/admission metrics are not assumed to exist in Ehteraf.

### Image 9 — `image-9.png`: Dynamics 365-style business dashboard

- **Frame and style:** angled monitor on a charcoal backdrop; product surface uses a dark lower layer, orange/amber gradient feature panels, and white/light-neutral data cards.
- **Top navigation:** “Dynamics365 | Business Central”; Customers, Vendors, Items, Charts, Finance, Cash management, Sales, Purchasing, and additional module menus.
- **Summary content:** “Sales This Month” with a visible **23,876** value; overdue invoice and insight cards with visible amounts around **93,420** and growth copy. The screenshot is perspective-distorted, so currency/some digits are uncertain.
- **Insights:** large cards titled “Insights” and “Alerts”, with narrative sales changes; lower tabs for activity/business assistance and a row of order/invoice/purchase counts.
- **Reusable patterns:** finance-oriented module navigation; cross-period financial summaries; narrative insights; searchable transactions; compact counts. Use the layout idea, not the product logo, gradients, sales-specific language, or sample financial figures.

### Image 10 — `image-10.png`: Health Karma score dashboard

- **Frame and style:** real-world monitor photograph with a light scorecard area, a dark lower history panel, and a warm blurred gradient behind the main metric.
- **Header/brand:** “creditkarma”, tabs “Karma”, “Credits”, “Money”, a user profile, and a small notice/control cluster.
- **Main score:** “Health Karma” heading and a large score **832** with a “Fair”/score-status dial. This is a credit product, not a clinic product.
- **Metric cards:** Credit Card Use **9%**, Payment History **100%**, Derogatory Marks **0**, Credit Age **4 years**, Total Accounts **12**, Hard Inquiries **0**; lower cards show Net Worth and Total Debt-style values.
- **Lower area:** credit-history range controls and “Credit Offers” cards.
- **Reusable patterns:** one prominent score with a dial; label-first metric cards; history and offers separated below. Do not copy credit terminology/data into Ehteraf.

### Image 11 — `image-11.png`: invoice list and detail workspace

- **Frame and style:** neutral light-gray canvas with pill-shaped filters, a fluorescent-lime selected state, a black invoice-list surface, and a slate-blue invoice-detail panel.
- **Navigation:** estimates, invoices (selected), payments, recurring invoices, checkouts; create-invoice action and profile/settings icons.
- **Top summary:** “Overdue” **$31,211.00**, “Due within next month” **$172,560.00**, “Average time to get paid” **12 days**, and “Available for Instant Payout” **$214,390.00**.
- **Controls:** month/payment timeline, active-filter count, customer/status/date/search fields, tabs for All Invoices, Draft, and Unpaid, with small count badges.
- **Main work area:** unpaid-invoice queue with avatar/ID/status/amount rows; selected invoice expands to a detail view with organization/customer context, line items, subtotal/total/balance, and pay-now action. Names and invoice identifiers are reference-only and omitted here.
- **Reusable patterns:** KPI summary above filters; list/detail split view; status pills; totals and line items; contextual payment action. Use this as a future finance-module visual reference, not as a request to implement finance in this refactor.

### Image 12 — `image-12.png`: wellness / home-workout dashboard

- **Frame and style:** square light dashboard on a neutral gray canvas; rounded cards, pale-blue surfaces, cyan highlights, and large lifestyle imagery.
- **Header:** “Hi, Andreas!”, daily-activity subtitle, “Search for healthy metrics”, and “Upgrade”. A slim vertical icon rail remains visible.
- **Hero card:** “Your Home Workout Starts Here!”, “Explore Now”, member/community count, workout photo, and start-trial action.
- **Hydration:** “Hydration Status”, bottle grid, “Well Done”, day/week/month switch, and **2.15 L/Day**.
- **Health cards:** calories (**2,040 kcal**), a food/macronutrient breakdown, “Weight” card with **82 kg**, and a pale blue line chart. Some small units/labels are not reliably legible.
- **Lower card:** sleep/rest feature with navigation; additional trend and habit information.
- **Reusable patterns:** short friendly greeting; one prominent hero; daily target visualization; metric plus small trend; warm rounded card grid. Fitness copy and lifestyle media are out of scope for a clinic-management product.

### Image 13 — `image-13.png`

- Exact duplicate of image 12. All layout and visible content are documented under image 12; this file adds no new elements.

### Image 14 — `image-14.png`: lime-accent fitness dashboard

- **Frame and style:** wide black left navigation rail, pale gray main surface, sharply contrasted black controls, and bright lime-green highlights; a profile/activity column is on the right.
- **Header:** “Good Morning, Tracy”, weekly selector, search, notifications, avatar/profile.
- **KPI row:** Water **1.2 L**, Calories **2.54** (unit appears as Kilo Calories), Heart Rate **124 bpm**, and Sleep **13 hours**.
- **Charts/cards:** “Workout Activity” line/area chart across weekdays, a “57 kg” selected point, “Progress” with distance totals and hours; an attendance mini-calendar for June 2021; “Video Activity” at **78%**; “Most Trending” thumbnails.
- **Lower cards:** subscription plan/payment actions and offline-exercise videos.
- **Reusable patterns:** icon rail with active state, one horizontal KPI row, a chart plus concise progress panel, profile/attendance context. Fitness readings/profile details remain reference-only and are not added to Ehteraf data.

### Image 15 — `image-15.png`: N-branded analytics dashboard

- **Frame and style:** light card-based analytics dashboard with a compact blue brand mark, bright blue hero KPI, lime accents, and a pale slate canvas.
- **Navigation:** Dashboard, Activity, Overview, Manage, Program; search/profile/action area.
- **Analytics cards:** a left circular “Profit” indicator with **24%**; central rate card around **0.75%** with a six-month chart; right growth KPI around **+72.9%**; compact totals for packed, delivered, shipped, and invoiced.
- **Lower area:** “Sales Ratings” with **34%** and a bar chart; “Stock Product” tile heatmap; an adjacent promotional card.
- **Reusable patterns:** mix one broad analytics chart with compact KPI tiles; use a heatmap for category-level status; maintain consistent module navigation. Product-specific sales labels and growth values are not operational clinic data.

### Image 16 — `image-16.png`

- Exact duplicate of image 15. All layout and visible content are documented under image 15; this file adds no new elements.

### Image 17 — `image-17.png`: wallet and cash-flow dashboard

- **Frame and style:** airy white/very-light dashboard with a pale violet-green accent palette, floating rounded cards, and vertical icon navigation.
- **Header:** brand mark, search, “Online Support”, profile “Sarah William”, and an “Upgrade”/membership control.
- **Money Spent:** period selector “Yearly”; Total **$456,245**, Monthly **$36,962**, Daily **$3,382** (punctuation/decimal separators are small in the source).
- **Middle cards:** “Recent Transfers” with send/receive/overall totals; “Cash Flow” with balance, date, monthly bar chart, and period selector.
- **Lower cards:** “Quick Transfer” with wallet/cards, recipient, add-card and transfer controls; “Near Places” map/search; “AI Assistant” prompt card and finance-manager advice card.
- **Reusable patterns:** profile and global search; trend cards; transfer detail; maps/action panels; low-density accent colors. Only overall information architecture is relevant to Ehteraf; wallet/payment identities and values are unrelated.

### Image 18 — `image-18.png`: N analytics larger search-result variant

- **Frame and style:** larger 1235×918 image of the N-branded analytics screen, cropped/expanded compared with images 15/16; the lower-right includes a visible “Search image” overlay from the source viewer.
- **Screen content:** the same family of dashboard navigation, profit/rate/growth panels, compact fulfillment totals, ratings chart, stock heatmap, and promotional panel. A few chart labels become easier to see, but the product domain is still generic commerce/sales analytics.
- **Difference from image 15:** this is a related visual variant, not an exact file duplicate. It contributes the same broad card/chart/heatmap vocabulary; no additional Ehteraf requirements are inferred.

### Image 19 — `image-19.png`

- Exact duplicate of image 18. All layout and visible content are documented under image 18; this file adds no new elements.

### Image 20 — `image-20.png`: MediCare+ hospital dashboard

- **Frame and style:** polished browser-window mockup on a pale neutral canvas; white surfaces, soft blue highlights, green up/down deltas, colorful category icons, and a permanent left navigation.
- **Navigation:** MediCare+ Hospitals; Dashboard (selected), Patients, Appointments, Doctors, Reports, Billing & Payments, Pharmacy, Inventory, Lab Tests, Messages, Settings; bottom help/support panel.
- **Top controls:** search, notification/profile controls, date range **16 May–22 May 2025**.
- **KPI cards:** Total Revenue **₹24,85,750**, OPD Revenue **₹8,45,320**, IPD Revenue **₹14,20,430**, and Outstanding Amount **₹3,25,680**, each with a small comparison delta.
- **Middle row:** Appointment Overview mini-calendar for **May 2025**, with **48** today, **32** completed, **16** upcoming; Revenue Overview weekly area chart; Top Doctors list with speciality and patient counts.
- **Lower row:** Department Summary cards for Cardiology (**125** patients), Neurology (**98**), Orthopedics (**110**), Pediatrics (**85**), and General Medicine (**142**); “Today’s Schedule” with four time/status rows.
- **Bottom strip:** Total Patients **2,856**, Total Doctors **56**, Total Staff **142**, Total Beds **230** / **85%** occupied, Lab Tests **1,245**, and Pharmacy Sales **₹4,25,300**.
- **Reusable patterns:** complete hospital-manager information hierarchy; calendar paired with schedule counts; revenue chart; top-clinician list; department summaries; one compact operational-stat strip. Currency, hospital departments, beds, named clinicians, and all values are reference-only.

---

## Cross-image synthesis

### Patterns to adopt

1. **Stable application frame:** persistent icon-and-label navigation, global search, branch context, role context, notifications, theme, and language controls. Keep the existing Ehteraf navigation model; borrow the clear active state and dark-rail contrast from images 1, 7, 14, and 20.
2. **Scannable metric hierarchy:** one row of compact KPIs with icon, concise label, large value, comparison/helper text; reserve saturated/lime color for a small selected/positive state (images 1, 8, 10, 14, 15, 20).
3. **Useful dashboard composition:** primary trend/chart cards, month calendar, today’s counts/schedule, operational snapshot, and recent activity instead of a flat wall of unrelated widgets (images 1, 8, 20).
4. **Rounded surfaces with precise spacing:** consistent cards, subtle borders/shadows, simple icon containers, and restrained color. Avoid mixing the references’ incompatible neon, orange, bright blue, and purple palettes all at once.
5. **Patient 360 structure:** patient context stays visible while records are grouped into profile, visits, clinical history, imaging/labs, medications, and vital-sign/history areas (images 4, 6, 7).
6. **Timeline and appointment comprehension:** calendar day/week/month views, short status chips, clickable rows, selected dates, and understandable details without excessive chart decoration (images 1, 4, 6, 11, 20).
7. **Data-dense views remain legible:** list/detail finance pattern and contextual filters are useful for future invoice work; health pages should avoid borrowing the unrelated wallet/credit/workout content (images 9–11, 17).

### Ehteraf design direction

- **Foundation:** restrained clinical-neutral surfaces and deep teal/navy as the primary identity; soft lavender, blue, mint, and warm-lime are limited supporting accents.
- **Shell:** dark navy collapsible navigation rail; clean top utility bar; warm light-gray main canvas; white rounded panels with fine borders, low-contrast shadows, and consistent spacing.
- **Dashboard:** headline + branch/date/service context; five localized KPIs; revenue and appointment trends; date-aware appointment overview; operational indicators; upcoming appointments; recent activity.
- **Patients:** retain searchable/filterable directory and 360 profile; use clear hierarchy, compact record identity, visit/treatment timeline, and privacy-first health summaries.
- **Appointments:** compact status chips, conflict-aware booking, responsive day/week/month calendar, and an ordered daily schedule.
- **Unimplemented roadmap modules:** retain clear “coming soon”/access-denied states. The reference pack is a visual brief, not approval to build finance, imaging, labs, pharmacy, beds, or other later-milestone logic.
- **Responsive/accessibility:** translate the shell and card grids to mobile; preserve real RTL/LTR behavior, visible focus, legible contrast, and icon labels/tooltips. Avoid screenshot-only navigation, hover-only controls, and text embedded in images.

### Guardrails

- Do not reuse reference brands/logos (MEDIX, Dr+, Med.+, CityCare, Dynamics 365, creditkarma, Salesforce, etc.), staff portraits, patient names, diagnoses, clinical history, treatment values, or finance/account figures.
- Do not treat any displayed sample counts or colors as approved Ehteraf operational data. Current branch names and role assignments remain provisional.
- Keep the application frontend-only and mock-driven. Role/access behavior remains a UI simulation, not authorization/security.

---

## Supplementary module-workspace references

**Source:** the user-supplied [`codeandcanvas-native/REF` folder](https://github.com/3boalazm/codeandcanvas-native/tree/main/REF). Eight representative image files were visually reviewed on 17 November 2026. They are broad product-design inspiration, not clinic specifications or a source of operational data.

- **`Cards.jpg`:** offset image cards with concise titles and capsule tags. Borrow the compact card rhythm and rounded tags, not the topic cards or their product identity.
- **`Chart snippet by Mohammed Kabir Hussaini _ Layers.jpg`:** a soft, continuous curve with a clear focus point and a value callout. Use similar chart restraint only when the underlying time-series data is real and meaningful.
- **`Progress Bar.jpg`:** strong headline count, a clearly segmented progress bar, and a short contextual summary. Adapt this to workspace counters where a valid numerator/denominator exists; do not imply progress for unrelated raw totals.
- **`ui component.jpg`:** large summary total, active filter tabs, and a simple highlighted chart point. Keep filters and counts close to the workspace content they control.
- **`ui.jpg` and `visual inspo AI idea.jpg`:** image-led cards with rounded photography and a restrained caption/action overlay. Use clinic imagery and non-identifying care/space imagery, never reference portraits or patient content.
- **`3 layer stack diagram template...jpg` and `Week on Journal - summary card.jpg`:** layered visual hierarchy and stacked weekly summaries. Translate these into a clear sequence of workspace context, insight, and detailed records instead of copying the diagrams or sample content.

The module-workspace pass uses role-aware related-workspace links, progress tracks only for metrics with interpretable ratios, and clinic-specific hero images. Dashboard chart gradients now have per-instance SVG IDs so multiple chart instances cannot collide. Reference data, branding, and personal imagery are not copied.
