# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install           # one-time
npm test              # Node's built-in runner; no dependencies needed
npm test -- --test-name-pattern="import"  # focused save/import checks
npm run dev           # browser-sync on http://localhost:3000, watches index.html, style.css, main.js, js/**/*.js
npm run dev:open      # same, but opens the browser
npm run dev:host      # binds 0.0.0.0 — for testing on a phone over LAN (use the External URL printed by browser-sync)
```

There is no build step or linter. Tests use `node --test`; `tests/helpers/game.cjs` evaluates the scripts in the order from `index.html`, with rendering stubbed out. Deployment is GitHub Pages from `master` via `.github/workflows/static.yml`, which runs the tests on Node.js 24 before uploading the repository as-is, without an install or build step.

## Architecture

This is **vanilla JS with no bundler, no module system and no runtime dependency**. All game files in `js/` are plain `<script>` tags — there are no `import`/`export` statements.

Two consequences flow from this:

1. **Script load order in `index.html` is the source of truth.** Each file relies on globals defined by earlier files. Trust `index.html` (currently: `data → utils → galaxy → farms → tools → upgrades → laboratory → drops → ui → save → background → wormhole → welcome → game → main`).
2. **State lives on `window`.** Persisted globals include `window.score`, `clickPower`, `scorePerSecond`, `totalScoreEarned`, `stardust`, `prestigeUpgrades`, `collectedItems`, `itemLevels`, `unlockedResearch`, `researchPoints`, `activeResearch`, `currentPlanetId`, `currentSystemId`, `visitedPlanets`, `planetHarvested`, `claimedPlanetResearchRewards`, `totalScoreConverted`, plus per-`farms`/`tools` count/level/multiplier/upgrades. (The `galaxySystems` / `galaxyPlanets` map definitions in `galaxy.js` are static — only the player's position and harvest state are saved.) Modules read and mutate these directly. The save format in `js/save.js` is a JSON snapshot of this global state (current `version: "1.4"`) — when you add a new piece of persistent state, both `serializeGameState()` and `applyLoadedGameData()` in `js/save.js` must be updated or saves will silently lose data on round-trip. Saves are written to `localStorage` every 15 s (key `alienClickerSave`) in addition to the JSON file export; `lastSeenAt` drives offline progress, capped at 8 h.

### Runtime bootstrap and the three refresh levels

`initGame()` (`main.js`) is synchronous and idempotent, and is called from `welcome.js` (the welcome screen) — the game does **not** auto-start. It wires the click area, the shops, drops, the laboratory, the galaxy map, then starts the game loop. All rendering is direct DOM manipulation; the HUD lives in HTML (`#entropy-panel`).

Passive income runs on a `setInterval` in `js/game.js` that credits the **elapsed wall-clock time** (`Date.now()` delta, capped at 60 s per tick) rather than a fixed tick, so a backgrounded tab — where browsers throttle timers to ~1/minute — does not lose production.

Rendering is split by cost: `updateHUD()` is cheap; `updateDisplay()` adds buy-button affordability and refreshes galaxy/prestige **only when their tab is active**. `refreshShop()` rebuilds DOM and stays event-driven (purchase, load). `refreshGalaxy()` updates existing cards; it rebuilds them only when the displayed system changes, preserving keyboard focus.

**`clickPower` has a single source of truth: `updateClickPower()` in `js/tools.js`.** It recomputes the value from scratch, so any `clickPower += bonus` elsewhere is silently erased at the next purchase, travel or research. Additive bonuses must be exposed to `getFlatClickBonus()` instead (`getPrestigeFlatClickBonus()`, `getDropFlatClickBonus()`, `getCollectionFlatClickBonus()`). Likewise, every entropy gain must go through `addScore()` so `totalScoreEarned` — which drives galaxy unlocks and prestige — stays correct.

### Module responsibilities

- `data.js` — base globals + the `farms` / `tools` / upgrade definitions
- `galaxy.js` — `galaxySystems` → flattened `galaxyPlanets` map; each planet has `clickMultiplier` / `farmMultiplier` / `harvestCap`, and systems/planets unlock progressively. Entropy harvested from the current planet is capped per planet (`planetHarvested`); exhausting a planet grants a research point (tracked once in `claimedPlanetResearchRewards`). Travel/system helpers: `travelToPlanet`, `setCurrentSystem`, `getCurrentPlanet`.
- `farms.js` / `tools.js` / `upgrades.js` — passive production, click power, ×2 multiplier upgrades; bulk-buy helper is `calculateBulkCost` in `utils.js`
- `laboratory.js` — research tree; each node is a **timed** research (one `activeResearch` at a time with `startAt` / `endAt`) that completes after real elapsed time and grants a permanent bonus, spending planet research points; duration derives from the node cost (`getResearchDurationMs`, 30 s–5 min) and survives a reload
- `wormhole.js` — prestige loop: convert entropy → stardust → permanent upgrades. Only entropy not yet converted counts (`totalScoreEarned - totalScoreConverted`); prestige also resets planet harvest so planets become exploitable again
- `drops.js` / `background.js` — random drops + decorative emoji background
- `welcome.js` — welcome screen, intro typing sequence, calls `initGame()`
- `save.js` — `serializeGameState()`, JSON file download / upload, `localStorage` autosave, offline progress, and `resetRunState({ keepPrestige })` (the single reset path shared by New Game and prestige)
- `ui.js` — tab switching, click effects, stat panel updates
- `game.js` / `main.js` — click area, game loop, refresh levels, and the `initGame()` entry point

### State and collection constraints

- `normalizeGameData()` must validate and fill defaults for the entire save before any state changes. Add new persisted fields there as well as in serialization, loading and reset. Derived production and multipliers are recalculated rather than trusted from JSON.
- Import/reset clear temporary effects and resynchronize the passive tick. An in-game import also rebuilds shops and immediately autosaves. Preserve the `collectedItems` / `itemLevels` object identities shared with `drops.js`.
- Offline production covers at most the last eight hours and the current planet's remaining capacity. Split the calculation at an expired research's `endAt`, using the old and new production rates on either side.
- Collection getters in `drops.js` drive all nine items, including level-based discounts, Stardust, drop chance and auto-click timing. `reapplyCollectionBonuses()` derives farm/tool multipliers from purchased upgrades and collection; do not re-multiply saved multipliers. See `README.md` for the exact bonus scope and caps.
- The first prestige requires 2,500 unconverted Entropy. Its button and upgrade affordability must stay current while the Wormhole tab is open.

## Conventions (from AGENTS.md — must follow)

- **Commit messages** use a gitmoji prefix: `:sparkles:` for features, `:bug:` for fixes, `:art:` for refactors / formatting. One commit per task, including all related changes. Pick the prefix that reflects the *primary* change.
- The project domain language is **French** (variable names like `entropie`, `clic`, UI strings, doc strings). Match the surrounding style.
- **Targeted changes only** — no broad refactors unless asked. Don't break existing globals/files without a clear reason.
- Comments only when the logic is non-obvious.
- Use placeholder assets if finals aren't available (existing placeholders are in `assets/`).
- Update `README.md` when user-visible behavior changes.

## Manual verification before commit

Run `npm test`. For game changes, also load the page in the dev server, confirm no blocking console errors and exercise the changed mechanic. If persistent state changed, round-trip a save (download → reload → continue/import), try an invalid import, New Game and prestige. For UI changes, check keyboard navigation and a small viewport with the collection open.
