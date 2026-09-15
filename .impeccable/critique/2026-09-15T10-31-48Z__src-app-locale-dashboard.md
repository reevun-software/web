---
target: dashboard (rest of pages)
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 5
target_identity: "file:C:\\Users\\Kanyor\\Documents\\Reevun\\web\\src\\app\\[locale]\\dashboard"
timestamp: 2026-09-15T10-31-48Z
slug: src-app-locale-dashboard
---
Method: dual-agent (A: design review across 12 pages · B: detector/CLI evidence)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Live odometer refresh + tooltips excellent; write actions give zero feedback |
| 2 | Match System / Real World | 3 | Domain vocabulary correct; rank shown as bare number, no name |
| 3 | User Control and Freedom | 2 | No undo, no delete on blacklist entries, no bulk actions |
| 4 | Consistency and Standards | 4 | Same Card/Table/empty-state grammar across all 12 pages |
| 5 | Error Prevention | 2 | Blacklist form allows a submit that server-side silently no-ops |
| 6 | Recognition Rather Than Recall | 3 | Sidebar icons/grouping good; no cross-links between related data |
| 7 | Flexibility and Efficiency | 1 | Zero search/filter/sort/pagination anywhere |
| 8 | Aesthetic and Minimalist Design | 4 | Clean, terse, restrained color use |
| 9 | Error Recovery | 1 | No error states surfaced on any write path found |
| 10 | Help and Documentation | 2 | Minimal, acceptable for admin tool |
| **Total** | | **25/40** | **Acceptable** |

## Design Specificity Verdict
Monitoring page shows genuine bespoke craft (hand-rolled SVG chart, odometer roll, edge-aware tooltip); Russian localization with plural/rank interpolation applied consistently. But the same Card/Table/empty-state template is stamped on every page regardless of substance - Ranks and Settings read as the template applied to content that doesn't exist yet.

## Detector Evidence (Assessment B)
src/app/[locale]/dashboard and src/components/dashboard: exit code 0 on both, no findings. Browser check skipped: route requires live Discord OAuth session, no dev server running.

## What's Working
- Deep structural consistency across 12 pages
- Monitoring page got genuine design care (SVG chart, odometer, tooltip clamping)
- Full consistent Russian localization with pluralized interpolation

## Priority Issues

[P1] Silent no-op on invalid blacklist input - blacklist/page.tsx:35-52, action returns early with zero feedback when both ID fields are empty. → /impeccable harden

[P1] No delete/edit on blacklist entries - one-way CRUD, mistakes are permanent. → /impeccable optimize

[P1] Sidebar has no responsive/collapsed state - sidebar.tsx:68, w-64 shrink-0, breaks whole shell below ~768px. → /impeccable adapt

[P1] No search/filter/sort/pagination anywhere - members, audit-log (hard-capped at 100 rows) and effectively every list page. → /impeccable optimize

[P1] Hardcoded English aria-label + keyboard-inaccessible chart - online-history-chart.tsx:128, "Online players over time" in an otherwise Russian app, data only reachable via onPointerMove. → /impeccable harden

[P2] Audit-log description column forced to one line - table.tsx:85 whitespace-nowrap on the column that matters most. → /impeccable layout

[P2] Overview stat cards not clickable despite 1:1 mapping to sidebar pages - dashboard/[guildId]/page.tsx:48-56. → /impeccable optimize

[P2] Ranks page doesn't let you manage ranks - only aggregates counts, no naming/config. → /impeccable clarify

## Persona Red Flags
Alex: no search/filter/sort anywhere; no drill-down between related records; blacklist mistakes irreversible.
Sam: sidebar has no responsive state, breaks shell below 768px; monitoring chart is pointer-only with a hardcoded English aria-label read wrong by a Russian screen reader.

## Questions to Consider
1. Should Ranks and Settings exist as nav-level pages yet, given they do almost nothing right now?
2. Is the small-browsable-data assumption a real product constraint, or a works-on-seed-data trap?
3. If the one write path audited fails silently, what do the others do on failure?
