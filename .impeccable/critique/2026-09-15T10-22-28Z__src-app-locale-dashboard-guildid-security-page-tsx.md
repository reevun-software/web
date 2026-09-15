---
target: security page
total_score: 20
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 1
target_identity: "file:C:\\Users\\Kanyor\\Documents\\Reevun\\web\\src\\app\\[locale]\\dashboard\\[guildId]\\security\\page.tsx"
target_fingerprint: "sha256:9ab4e877fd0adcbb097362acf2c59cdb14dde04495f15d427155ec4b740925f9"
target_path: "C:\\Users\\Kanyor\\Documents\\Reevun\\web\\src\\app\\[locale]\\dashboard\\[guildId]\\security\\page.tsx"
timestamp: 2026-09-15T10-22-28Z
slug: src-app-locale-dashboard-guildid-security-page-tsx
---
Method: dual-agent (A: design review · B: detector/CLI evidence)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Sheet saves+closes silently, no toast; outer form has no dirty-state indicator |
| 2 | Match System / Real World | 3 | Correct Discord vocabulary/icons/hierarchy semantics |
| 3 | User Control and Freedom | 2 | No explicit "cancel/discard" in sheet; no undo post-save |
| 4 | Consistency and Standards | 1 | Two save models on one page (sheet auto-persists immediately; switches wait for page Save); divider pattern churned across last 5 commits |
| 5 | Error Prevention | 2 | Hierarchy warning is advisory-only, doesn't block selection; no confirm on punishment=ban |
| 6 | Recognition Rather Than Recall | 3 | Chips show current state inline; label-maps correctly resolve enum values |
| 7 | Flexibility and Efficiency | 1 | No search/type-ahead in role/channel checklists; no bulk actions |
| 8 | Aesthetic and Minimalist Design | 3 | Clean sectioning undercut by translate-y hacks and gear+switch crowding |
| 9 | Error Recovery | 2 | No wired validation error state; no confirmation for destructive punishment |
| 10 | Help and Documentation | 1 | Only inline text-xs hints; no contextual help for blocklist vs allowlist |
| **Total** | | **20/40** | **Acceptable (lower bound)** |

## Design Specificity Verdict
Real Discord-domain authorship (channel-type icons match Discord's type enum, role color dots mirror Discord's role list, hierarchy warning prevents a silent bot-permission failure), but uneven execution: hardcoded -translate-y-2, divider pattern churned across 5 commits.

## Detector Evidence (Assessment B)
CLI scan on security page + all dashboard/ui components involved: exit code 0, no findings. Browser check skipped with reported reason: route requires live Discord OAuth session, no dev server running.

## What's Working
- Discord-accurate iconography and role-hierarchy language
- Progressive disclosure on mute-role field (slide-in only for role/both modes)
- Chip-box pickers avoid closing menu per selection (closeOnClick=false)

## Priority Issues

[P0] Dual save semantics — FilterSettingsSheet submits its own server action and closes immediately (filter-settings-sheet.tsx:64-67), decoupled from the page's <form action={save}> that switches depend on. Fix: unify save semantics or surface the distinction in UI. → /impeccable clarify

[P1] Hardcoded pixel-nudge alignment — page.tsx:234,241 apply -translate-y-2 independently to label block and gear+switch block per automod row; breaks under text wrap/zoom/font-size change. Fix: items-center on row flex container instead of transform. → /impeccable harden

[P2] Labels not programmatically associated with pickers — every <Label> preceding RolePicker/ChannelPicker/RoleSelect lacks htmlFor; triggers lack id/aria-label. Fix: wire id+htmlFor or aria-labelledby. → /impeccable harden

[P2] Unbounded chip text for long role/channel names — role-picker.tsx:99, channel-picker.tsx:66 render name with no truncate/max-w, unlike role-select.tsx:69. Fix: add max-w-[10rem] truncate. → /impeccable harden

[P3] No search in role/channel checklists — flat max-h-64 scroll list; guilds with 30-100+ roles is a real efficiency failure. Fix: add filter input above a threshold. → /impeccable optimize

## Persona Red Flags
Alex (power user): no search/bulk-select; dual-save model forces re-checking whether sheet edits persisted.
Sam (a11y-dependent): missing label associations break SR navigation; RoleHierarchyWarning trigger (role-picker.tsx:30-43) is a bare <span> with no tabIndex/role — mouse-hover-only, invisible to keyboard users.

## Minor Observations
- filterSheetLabels (page.tsx:137-174) is a 30-key hand-built prop bag, easy to silently drop a translation key.
- Punishment/strategy/muteMode label-resolution maps duplicated inline in 3 places.
- timeoutLimitNotice renders as plain muted box with no icon, ambiguous error-vs-info.

## Questions to Consider
1. If the sheet already saves and closes on its own, what is the outer page's Save button the source of truth for?
2. Was the flat scrolling role/channel list ever tested against a 100+ role guild?
3. Why does the hierarchy warning depend on mouse hover, the interaction mode least likely to be used by a moderator moving fast?
