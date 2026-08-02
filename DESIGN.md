# DESIGN.md

Authoritative design system for Investigate.

**Every AI agent and contributor must read this file before creating or modifying user-facing UI.**

Tokens live in `src/styles/tokens.css`. Prefer CSS variables over hardcoded Tailwind color/spacing values.

## Product design principles

1. **Clarity over decoration** — one job per section
2. **Brand first** — product name is a hero-level signal on branded surfaces
3. **Calm density** — professional SaaS, not dashboard clutter in marketing views
4. **Token-driven** — no one-off hardcoded styling when a token should exist
5. **Accessible by default** — keyboard, contrast, focus-visible, reduced motion
6. **Progressive enhancement** — useful without excessive client JS

## Visual hierarchy

- Display headings use `--font-display` (Fraunces)
- Body uses `--font-sans` (Source Sans 3)
- Code/meta uses `--font-mono` (IBM Plex Mono)
- One primary CTA per viewport
- Muted text for supporting copy (`--color-fg-muted`)

## Spacing system

4px base scale via tokens: `--space-1` … `--space-24`.

Common patterns:

- Section vertical padding: `--space-12` / `--space-16`
- Stack gaps: `--space-3` / `--space-4`
- Inline control gaps: `--space-2` / `--space-3`

## Typography scale

| Token | Size | Use |
| --- | --- | --- |
| `--text-xs` | 12px | Labels, meta |
| `--text-sm` | 14px | Secondary UI |
| `--text-base` | 16px | Body |
| `--text-lg` | 18px | Lead paragraphs |
| `--text-xl`–`--text-5xl` | 20–48px | Headings |

Line heights: tight for display, normal for UI, relaxed for long reading.

## Color-token strategy

- Brand greens (`--color-brand-*`) for primary actions
- Cool neutrals (`--color-neutral-*`) — avoid warm cream defaults
- Accent blue for informational emphasis — not purple gradients
- Semantic colors for danger/warning/success

## Semantic design tokens

Use semantic tokens in components:

- `--color-bg`, `--color-bg-elevated`, `--color-fg`, `--color-fg-muted`
- `--color-border`, `--color-primary`, `--color-primary-fg`
- `--color-danger`, `--color-warning`, `--color-success`
- `--color-focus-ring`

## Light and dark theme rules

- Default follows system preference via `theme-boot.js`, overridable by toggle
- Theme attribute: `html[data-theme='light'|'dark']`
- Do not invent separate one-off dark colors in components — extend tokens

## Border radius

- `--radius-sm` controls
- `--radius-md` buttons/inputs
- `--radius-lg` surfaces
- Avoid pill-everywhere patterns

## Elevation and shadows

- Prefer border + subtle `--shadow-sm` for surfaces
- `--shadow-md` / `--shadow-lg` sparingly for overlays
- No multi-layer neon/glow aesthetics

## Layout width conventions

- Content: `--width-content` (72rem) via `.container-content`
- Narrow reading/forms: `--width-narrow` via `.container-narrow`
- Header height: `--header-height`

## Responsive breakpoints

Mobile-first. Practical Tailwind breakpoints:

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

Primary nav may collapse on small screens; ensure equivalent access exists.

## Mobile-first behavior

- Stack before splitting columns
- Touch targets ≥ 44px where practical (`h-11` buttons)
- Avoid horizontal overflow

## Navigation conventions

- Landmark `<nav aria-label="Primary">`
- Active route indication via router `active` class styling
- Skip link to `#main-content`
- Focus main content on route change

## Form layout rules

- Label above control
- One primary submit action
- Group related fields with spacing, not heavy cards inside cards
- Use `noValidate` only when custom accessible validation is provided

## Validation and error presentation

- Inline errors adjacent to fields
- `aria-invalid` + `aria-describedby` linking to error text
- `role="alert"` for errors; `role="status"` for success
- Never rely on color alone

## State patterns

| State | Guidance |
| --- | --- |
| Loading | Calm text or pending route component; `aria-live` |
| Empty | Explain next action |
| Success | Short confirmation in status region |
| Warning | Use warning tokens |
| Error | Specific, recoverable messaging |

## Tables and density

- Prefer readable density over cramped grids
- Sticky header optional for long tables
- Align numeric columns consistently when tables are introduced

## Overlay conventions

- Modal/sheet: focus trap, Esc to close, restore focus
- Popover/menu: keyboard arrow support via accessible primitives when added
- Tooltip: supplemental only — never required information
- Default: no cards in heroes; surfaces only when they aid interaction

## Animation and motion

- Use `--duration-*` and `--ease-standard`
- Intentional motion only (fade/fade-up helpers)
- No decorative perpetual animation

## Reduced motion

- Tokens collapse durations under `prefers-reduced-motion`
- Utility animations disabled in CSS

## Keyboard accessibility

- All interactive controls focusable
- Logical tab order
- No keyboard traps outside modals

## Focus-visible styling

Global `:focus-visible` uses `--color-focus-ring`. Do not remove outlines without an equivalent.

## Contrast

Aim for WCAG 2.2 AA for text and interactive contrast. Prefer semantic tokens already tuned for light/dark.

## Icon usage

- Prefer sparse icons with text labels
- Decorative icons: `aria-hidden="true"`
- Do not use emoji as UI icons

## Image usage

- Meaningful images need descriptive `alt`
- Decorative images: empty `alt`
- Prefer modern formats; size appropriately

## Content tone

- Direct, professional, concise
- Avoid hype and fake product copy
- Prefer concrete guidance

## Component reuse

- Check `src/components/ui` and `src/features` before creating new UI
- Extend primitives instead of cloning
- Keep features owning feature-specific UI

## Hardcoding prohibition

Do not hardcode colors, radii, or shadows when a token exists.
If a new value is needed, add a token and document it here.

## Investigation Console

Product UI for the AI-led case platform (Paper design language). Spec: `docs/superpowers/specs/2026-07-30-investigation-console-app-design.md`.

- Scoped surface: `[data-surface='console']` + `src/features/console/styles/console.css`
- Fonts: Geist / Geist Mono (console only); marketing keeps Fraunces / Source Sans 3
- Ink palette: `#111111`, `#3D3D3D`, `#6B6B6B` (floor), `#ECECEC` (hairline)
- Categorical: offence `#0070F3`, sensor `#B45309`, tip `#8E4EC6`, activity `#15682F`
- App shells: `CaseShell` (case tabs) and `AgencyShell` (no case tabs) — classification strip, top bar, 212px sidebar, main, optional 344px rail
- Mobile shell: sidebar collapses below `lg`; open via TopBar control into shadcn `Sheet` (`MobileNav` + shared `SidebarNav`). Touch targets ≥44px on key chrome controls. Case tabs scroll horizontally; dense tables switch to stacked rows below `md`.
- UI kit: shadcn primitives in `src/components/ui` (Button, Badge, Table, Sheet, Tabs, Input, ScrollArea, Tooltip, Command, Dialog, Dropdown, Separator, Avatar) + Phosphor Duotone icons; themed via console CSS variables
- Shared empty pattern: `src/features/console/ui/empty-state.tsx` (also demoed at `/console/empty-states`)
- Shared composition primitives (`src/features/console/ui/` + classes in `console.css`):
  - `ConsolePage` — page gap rhythm (`console-page` / `console-page-loose`)
  - `SectionHeader` — hairline section title + hint/action
  - `FilterBar` — pressed filter chips (`console-filter`)
  - `DetailPanel` — right-rail review panel (`console-panel`)
  - `FixtureCanvas` — map/scene fixture plane (`console-canvas`)
  - List/row language: `console-list`, `console-row`, `console-row-active`, `console-meta`, `console-action`
  - Metrics: `console-metric-strip` (connected cells, not scattered cards)
- Prefer dense hairline lists over card grids; bordered panels only for selection detail, media stage, or hypothesis tiles that aid comparison
- Dedicated composed pages for all agency/case product routes (typed fixtures + page modules; Paper dumps remain at `/console/reference`)
- Agency Record/Process case deep-links use `$caseId` resolved with `DEFAULT_CASE_ID` (not hardcoded northridge paths)
- Product routes: `/console` → `/console/command-center`; agency/media/system under `/console/*`; case workspace `/console/cases/$caseId/...`
- Paper dumps (exact JSX): `/console/reference` and `/console/reference/$slug` (`src/features/console/screens/paper/*`, Biome-ignored)
- Phase C plan: `docs/superpowers/plans/2026-07-31-investigation-console-phase-c.md`

## Extending the design system

1. Add/adjust tokens in `src/styles/tokens.css` (marketing) or `src/features/console/styles/console.css` (console)
2. Document the change in this file
3. Prefer semantic tokens over new brand steps when possible
4. Add a visual example in the starter UI if the pattern is shared

## UI review checklist

- [ ] Read this file before implementation
- [ ] Brand/product name hierarchy correct
- [ ] Tokens used instead of one-offs
- [ ] Light and dark verified
- [ ] Spacing matches scale
- [ ] Focus-visible and keyboard paths verified
- [ ] Forms have labels and accessible errors
- [ ] Reduced motion respected
- [ ] No unnecessary cards/pills/glow
- [ ] Mobile layout works without horizontal scroll
