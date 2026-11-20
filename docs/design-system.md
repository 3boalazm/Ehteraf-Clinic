# Ehteraf design system — "Soft Bento"

Built from scratch from a set of ten dashboard references. Nothing from the
previous UI is reused; only data, routes, roles and translations were kept.

## Visual language

| Trait | Rule |
| --- | --- |
| Canvas | Warm grey page (`--canvas`) with the whole app inside one rounded "device" frame (`--frame`, 40px radius). |
| Navigation | A floating pill rail. Collapsed = icons only with tooltips; expanded = labelled panel. Active item is a solid ink pill. |
| Surfaces | Borderless white cards, 28px radius, very soft shadow. Pastel tinted cards (`mint`, `sky`, `lilac`, `peach`, `sand`) carry meaning-free variety; `lime` is the single accent; `ink` cards are used for summaries and calls to action. |
| Controls | Everything is a pill: buttons, inputs, tabs, badges, table rows. Primary action = ink pill, optionally with a circular arrow. |
| Type | Large, light headings and oversized light numerals (`.t-display`, `.num`). Inter for Latin, IBM Plex Sans Arabic for Arabic. |
| Data | Capsule bar charts, semi-circle gauge, dot-matrix capacity tiles, circular-day calendars. |
| Themes | Light and dark share the same tokens; dark is toggled with the `dark` class on `<html>`. |
| Direction | Logical CSS properties throughout, so RTL (Arabic) and LTR (English) use the same rules. |

## Where things live

- `src/app/globals.css` — tokens (`:root` / `:root.dark`), shell layout, every component class, responsive rules.
- `src/ui/index.tsx` — React primitives: `Button`, `IconButton`, `Card`, `CardHead`, `Bubble`, `Badge`, `Tabs`, `Field`, `Input`, `Select`, `Textarea`, `SearchBox`, `Switch`, `Avatar`, `PageHead`, `StatCard`, `Progress`, `Empty`, `Notice`, `Toast`.
- `src/ui/charts.tsx` — `PillBars`, `Gauge`, `Ring`, `MiniCalendar`.
- `src/shell/` — `AppShell` (frame, rail, top bar), `FeatureGate`, and the `useApp()` hook.
- `src/features/*` — pages composed only from the primitives above.

## Layout

Pages are a `.bento` 12-column grid; cards take `.span-3 … .span-12`. Below
1180px wide cards go full width, below 900px the rail becomes a drawer, below
640px everything stacks.

## Adding a screen

1. Start with `<PageHead>`.
2. Put content in `<div className="bento">` using `Card` / `StatCard`.
3. Pick tones for variety, keep `lime` for the one thing that matters most.
