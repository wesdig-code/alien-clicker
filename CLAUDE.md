# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install           # one-time
npm run dev           # browser-sync on http://localhost:3000, watches index.html, style.css, main.js, js/**/*.js
npm run dev:open      # same, but opens the browser
npm run dev:host      # binds 0.0.0.0 — for testing on a phone over LAN (use the External URL printed by browser-sync)
```

There is no build step, no test runner, and no linter. Deployment is GitHub Pages from `master` via `.github/workflows/static.yml`, which uploads the repository as-is.

## Architecture

This is **vanilla JS with no bundler and no module system**. Phaser is loaded from a CDN in `index.html`. All game files in `js/` are plain `<script>` tags — there are no `import`/`export` statements.

Two consequences flow from this:

1. **Script load order in `index.html` is the source of truth.** Each file relies on globals defined by earlier files. The README's load order is slightly stale; trust `index.html` (currently: `data → utils → galaxy → farms → tools → upgrades → laboratory → drops → ui → save → background → wormhole → welcome → game → main`).
2. **State lives on `window`.** `window.score`, `clickPower`, `scorePerSecond`, `totalScoreEarned`, `stardust`, `galaxyPlanets`, `currentPlanetId`, `collectedItems`, `itemLevels`, `unlockedResearch`, `researchPoints`, `prestigeUpgrades`, etc. Modules read and mutate these directly. The save format in `js/save.js` is essentially a JSON snapshot of this global state — when you add a new piece of persistent state, both `saveGame()` and `applyLoadedGameData()` in `js/save.js` must be updated or saves will silently lose data on round-trip.

### Phaser is mostly a click target and a timer

`main.js` builds the Phaser instance lazily in `initGame()`, called from `welcome.js` (the welcome screen) — the game does **not** auto-start. Inside `js/game.js` the Phaser `scoreText` / `scorePerSecondText` / `clickPowerText` are immediately set invisible; the actual HUD lives in HTML (`#entropy-panel`) and is updated by `updateEntropyPanel()` / `updateDisplay()`. Phaser's main job is the click area (`createAlienClickArea`) and the 1-second income tick (`this.time.addEvent({ delay: 1000, callback: generateAutomaticScore, loop: true })`). Most rendering is direct DOM manipulation.

### Module responsibilities

- `data.js` — base globals + the `farms` / `tools` / upgrade definitions
- `galaxy.js` — multi-system planet map with `clickMultiplier` / `farmMultiplier` / `harvestCap` per planet (entropy harvested from the current planet caps the planet, exhausting it grants a research point)
- `farms.js` / `tools.js` / `upgrades.js` — passive production, click power, ×2 multiplier upgrades; bulk-buy helper is `calculateBulkCost` in `utils.js`
- `laboratory.js` — research tree, spends planet research points for permanent bonuses
- `wormhole.js` — prestige loop: convert entropy → stardust → permanent upgrades
- `drops.js` / `background.js` — random drops + decorative emoji background
- `welcome.js` — welcome screen, intro typing sequence, calls `initGame()`
- `save.js` — JSON file download / upload (no localStorage)
- `ui.js` — tab switching, click effects, stat panel updates
- `game.js` / `main.js` — Phaser bootstrap

## Conventions (from AGENTS.md — must follow)

- **Commit messages** use a gitmoji prefix: `:sparkles:` for features, `:bug:` for fixes, `:art:` for refactors / formatting. One commit per task, including all related changes. Pick the prefix that reflects the *primary* change.
- The project domain language is **French** (variable names like `entropie`, `clic`, UI strings, doc strings). Match the surrounding style.
- **Targeted changes only** — no broad refactors unless asked. Don't break existing globals/files without a clear reason.
- Comments only when the logic is non-obvious.
- Use placeholder assets if finals aren't available (existing placeholders are in `assets/`).
- Update `README.md` when user-visible behavior changes.

## Manual verification before commit

There are no automated tests. Before committing: load the page in the dev server, confirm no blocking console errors, exercise the changed mechanic, and round-trip a save (download → reload page → upload) if you touched any persistent state.
