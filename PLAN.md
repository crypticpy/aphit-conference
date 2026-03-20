# Implementation Plan: Expert Review Fixes

Created: 2026-03-19
Status: PENDING APPROVAL

## Summary
Implement all actionable fixes from the 3-expert design critique (Maya Chen, Javier Reyes, Karen Washington). This covers 18 code changes spanning brand compliance, motion refinement, navigation simplification, content condensing, and conference-day operational features.

## Scope

### In Scope (18 items)
1. **Brand fonts**: Switch from DM Sans/DM Serif Display → Montserrat/Open Sans per brand guidelines
2. **Navy color**: Add `--aph-brand-navy: #003054` token, keep dark `#001020` for immersive backgrounds but use brand navy in UI elements
3. **Fix CTA text**: "Touch to discover" → "Click anywhere to explore"
4. **APH branding lockup**: Add "City of Austin" above "Austin Public Health" with proper hierarchy
5. **Bullet-point story content**: Convert 40-64 word paragraphs to 2-3 bullet points each
6. **Remove MiniMapTimeline**: Simplify StoryViewer to just progress dots + arrow buttons
7. **Remove invisible click zones**: Remove left-half/right-half click behavior (confusing for walk-ups)
8. **Reduce motion 40%**: Remove white flash, tile breathing, icon float; reduce particle count 200→140
9. **Bump SVG tile patterns**: 4% opacity → 12% opacity so they're actually visible
10. **Extract shared WordReveal**: Deduplicate from 3 files into one shared component
11. **Panic-reset shortcut**: Triple-Escape reloads the app; Ctrl+Home alternative
12. **QR code on story views**: Small QR in bottom-right linking to a URL (configurable)
13. **Visible completion tracker**: "3 of 6 explored" text on grid view
14. **Add unifying visual motif**: Subtle bottom-edge horizon glow that persists across all attract scenes
15. **Staff conversation prompt**: Brief topic hint shown when a story is selected
16. **Condense to 3 slides**: Hero slide + 2 consolidated section slides (not 5)
17. **Shorten auto-advance**: 15s per slide instead of 30s (conference-appropriate)
18. **Clean up dead code**: Remove unused CursorEffects import, framer-motion dep, unused assets

### Out of Scope
- TV mirroring laptop selection (requires WebSocket architecture — future work)
- Quick Stats dashboard view (good idea but a new feature, not a fix)
- Actual APH logo image file (we don't have it — using text lockup instead)
- Staff script document (content deliverable, not code)
- On-site TV testing (logistics, not code)

## Open Questions for User
1. **Fonts**: The brand guidelines say Montserrat/Open Sans. We're currently using DM Sans/DM Serif Display. Should we switch back to brand-compliant fonts, or keep the current choice and document it as a deliberate deviation?
2. **Navy color**: Keep `#001020` for the immersive background (it looks better on TV) but add `#003054` as a secondary token for UI chrome? Or revert entirely to `#003054`?
3. **QR code URL**: What URL should the QR code link to? (Can use a placeholder for now)

## Parallel Execution Strategy

### File Ownership Matrix
| File | Phase 1 Owner | Phase 2 Owner |
|------|--------------|---------------|
| `src/index.css` | Agent A (Styles) | — |
| `index.html` | Agent A (Styles) | — |
| `src/data/stories.ts` | Agent B (Content) | — |
| `src/components/shared/WordReveal.tsx` | Agent C (Shared) | — |
| `src/components/shared/types.ts` | Agent C (Shared) | — |
| `src/components/shared/iconMap.ts` | Agent C (Shared) | — |
| `src/components/AttractMode.tsx` | — | Agent D |
| `src/components/StoryViewer.tsx` | — | Agent E |
| `src/components/TileGrid.tsx` | — | Agent F |
| `src/components/scenes/DataStream.tsx` | — | Agent G |
| `src/components/scenes/GradientWaves.tsx` | — | Agent G |
| `src/components/scenes/NumberStorm.tsx` | — | Agent G |
| `src/components/ParticleCanvas.tsx` | — | Agent H |
| `src/App.tsx` | — | Agent I |
| `package.json` | — | Agent J (Cleanup) |

## Implementation Phases

### Phase 1: Foundation (Data, Styles, Shared Utilities)
**Objective**: Update brand tokens, condense content, extract shared code. No component changes yet.

**Parallel Tasks** (3 agents):

**1A — Styles & Fonts** (Agent A)
- Owns: `src/index.css`, `index.html`
- Switch `--font-heading` to Montserrat, `--font-body` to Open Sans
- Remove `--font-display` (DM Serif Display) — replace all display usages with heading font
- Add `--aph-brand-navy: #003054` token (keep `--aph-navy: #001020` for backgrounds)
- Update Google Fonts link in `index.html` to load Montserrat (400,500,600,700) + Open Sans (400,400i,600)
- Remove DM Sans and DM Serif Display font imports

**1B — Content Condensation** (Agent B)
- Owns: `src/data/stories.ts`
- Convert all 24 section body paragraphs from prose to 2-3 bullet points (use `\n• ` format)
- Merge sections: combine 4 sections into 2 consolidated sections per story (keeping the best stat from each pair)
- Keep attractFacts unchanged

**1C — Shared Utilities** (Agent C)
- Owns: `src/components/shared/` (new directory)
- Create `src/components/shared/WordReveal.tsx` — extract from AttractMode, standardize staggerMs=50, marginRight=0.3em
- Create `src/components/shared/iconMap.ts` — extract duplicated icon map
- Create `src/components/shared/types.ts` — extract TileRect interface

**Phase 1 Verification**:
- [ ] `npx tsc --noEmit` passes (shared exports may have unused warnings, that's OK)
- [ ] stories.ts has exactly 2 sections per story (down from 4)
- [ ] Fonts load correctly in browser

---

### Phase 2: Component Updates
**Objective**: Apply all expert fixes to each component. Clear file ownership prevents conflicts.

**Parallel Tasks** (7 agents):

**2D — AttractMode** (Agent D)
- Owns: `src/components/AttractMode.tsx`
- Change CTA from "6 stories · 1,200 users · Touch to discover" → "Click anywhere to explore"
- Improve branding: Add "City of Austin" text above "Austin Public Health" with smaller font
- Import shared WordReveal, remove local copy and local TitleReveal
- Remove `am-flash` white flash transition between scenes
- Add unifying bottom-edge horizon glow (subtle teal gradient at bottom ~40px, persists across all scenes)

**2E — StoryViewer** (Agent E)
- Owns: `src/components/StoryViewer.tsx`
- Remove MiniMapTimeline component entirely (lines 144-218 + usage at 682-688)
- Remove `handleAreaClick` click-zone navigation (lines 359-375 + usage)
- Remove KeyboardHint component (we'll keep keyboard nav but remove the hint — staff will know)
- Adjust for 3 slides total (hero + 2 sections, down from hero + 4)
- Add QR code component in bottom-right of slide area (placeholder URL, configurable)
- Add brief staff prompt near top bar when story is selected (e.g., the story tagline)
- Reduce auto-advance from 30s to 15s per slide, last slide 8s
- Shift left arrow back to `left: 24px` (no longer needs to avoid MiniMap)
- Import shared WordReveal if used, import shared iconMap
- Import shared TileRect type

**2F — TileGrid** (Agent F)
- Owns: `src/components/TileGrid.tsx`
- Bump SVG background patterns from 4% to 12% opacity
- Remove `tg-breathe` breathing animation
- Remove `tg-iconFloat` animation
- Add visible completion text: "X of 6 explored" between header and grid (uses visitedIds.size)
- Import shared iconMap, remove local copy
- Import shared TileRect type, remove local copy

**2G — Scene Components** (Agent G)
- Owns: `src/components/scenes/DataStream.tsx`, `GradientWaves.tsx`, `NumberStorm.tsx`
- Import shared WordReveal in DataStream and GradientWaves, remove local copies
- Add subtle bottom-edge horizon element to each scene (matching the one in AttractMode)
- Reduce NumberStorm particle count from 120 to 80

**2H — ParticleCanvas** (Agent H)
- Owns: `src/components/ParticleCanvas.tsx`
- Reduce PARTICLE_COUNT from 200 to 140
- Keep all other behavior as-is

**2I — App.tsx** (Agent I)
- Owns: `src/App.tsx`
- Add panic-reset: triple-Escape within 1.5s triggers `location.reload()`
- Remove scatter animation white-flash overlay if present
- Import shared TileRect type, remove local definition
- Pass visitedIds to TileGrid (verify already happening)

**2J — Cleanup** (Agent J)
- Owns: `package.json`, any unused files
- Remove `framer-motion` from dependencies
- Delete `src/components/CursorEffects.tsx` (unused)
- Delete `src/assets/react.svg`, `src/assets/vite.svg` (Vite defaults, unused)
- Verify `src/assets/hero.png` is used; if not, delete

**Phase 2 Verification**:
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] App loads and cycles through attract scenes
- [ ] Grid view shows completion tracker
- [ ] Story viewer has 3 slides, no MiniMap, no click zones
- [ ] QR code visible on story slides
- [ ] Triple-Escape reloads the app
- [ ] All fonts render as Montserrat/Open Sans

---

### Phase 3: Final Review
**MANDATORY review gates:**
1. `final-review-completeness` agent — scan for TODOs, placeholders, broken imports
2. `principal-code-reviewer` agent — quality assessment against project standards
3. Visual screenshot verification of all 3 modes (attract, grid, story)

## Testing Strategy
- TypeScript compilation: `npx tsc --noEmit`
- Visual: Screenshot attract mode, grid mode, story hero slide, story section slide
- Interaction: Verify click-to-grid, tile selection, story navigation, back buttons
- Reset: Verify triple-Escape reloads
- TV mode: Verify `?mode=tv` still works correctly

## Rollback Plan
- All changes are on a git branch; `git stash` or `git reset` to previous commit

## Risks and Mitigations
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Font swap changes layout metrics | Med | Med | Test all views after font change |
| Merging 4 sections to 2 breaks StoryViewer indexing | Med | High | Agent E must handle variable section count |
| Shared WordReveal import paths break | Low | Med | TypeScript will catch immediately |
| File conflicts between parallel agents | Low | High | Strict file ownership matrix above |
| Removing click zones breaks mobile/touch | Low | Low | Arrow buttons and dots still work |

---
**USER: Please review this plan. Edit any section directly, then confirm to proceed.**
