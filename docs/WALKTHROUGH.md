# ARC Command Center — Development Walkthrough

## Project Overview

The **ARC Command Center** is a personalized tactical operations dashboard for *ARC Raiders*, built for player `_paradroid`. It pulls live data from **ArcTracker.io** via dual-key API auth and layers on local tracking for stats the API doesn't expose.

- **Stack:** Vite + vanilla JS modules + CSS
- **Port:** `localhost:3000`
- **API Proxy:** Vite proxies `/api` → `https://arctracker.io`

---

## Build History

### Original Build (June 18, 2026)
- Conceived as a localized "memory drive" and dashboard for tracking progression, map stats, and active objectives.
- **Design decision:** Hardcode a stealth/PVE bias to override community PVP meta when it conflicts with personal map survival stats.
- **Narrative event logging:** `recent_session_events` captures round-by-round history with personal context.

### Coldstart & Refactor (June 23, 2026)
- Full coldstart from conversation context reconstruction.
- Verified live API connectivity (200 OK, Level 75 profile rendering).
- **Architecture lock:** Solidified the 12-column CSS grid and vector CRT aesthetic. Rejected third-party DOM-manipulating libraries (like GridStack.js) in favor of CSS-native responsive reflow to protect the vanilla JS rendering pipeline.
- **Documentation:** Initialized the Paradroid Labs AI operational framework inside `docs/agent-framework/`.

---

## Architecture

```text
src/
  app.js                  — App shell, tab routing, data fetching
  data/
    api-client.js          — ArcTracker.io API client (dual-key auth, caching, rate limits)
    profile-state.js       — Player identity, map mastery, session events (localStorage)
    trials-state.js        — Weekly trials, rank, historical tracking (localStorage)
    history-stats.js       — Computed lifetime stats from round data
    drop-rates.js          — Creator tips, map names, static reference data
  engine/
    advisor.js             — Decision engine producing prioritized action recommendations
  ui/components/
    header.js              — Player stats bar, tabs, trials rank badge
    departure-panel.js     — Expedition + trials reset countdown timers
    action-panel.js        — Mission brief / prioritized actions
    trials-panel.js        — Weekly trials cards, rank editor, progress tracking
    raid-history-panel.js  — Lifetime stats, charts, raid log
    weapons-panel.js       — Weapon kill stats
    session-log.js         — Recent round event feed
    project-tracker.js     — Project phase progress
    quest-tracker.js       — Quest completion tracking
    map-intel.js           — Map performance intel
    inventory-status.js    — Stash/loadout status
    charts.js              — Net value graph renderer
    blueprints-panel.js    — Blueprints archive, missing/acquired rendering
    blueprint-shortcut.js  — Sidebar progress bar for blueprint completion
```

---

## Key Features Implemented

### Header Stats Bar
- **Level**, **Topside Hours**, **Total Raids**, **Survival %**, **Credits**, **ARC Kills**, **Player Kills**
- **Trials Rank** badge (purple glow) with rank points — pulled from localStorage.

### Dual Countdown Timers (Departure Panel)
- **Expedition countdown** (amber) — time until departure window opens.
- **Trials reset countdown** (cyan) — time until Monday 07:00 UTC weekly reset.
- Both update every second, visible in minimized and expanded modes.

### Weekly Trials System
- **Automatic weekly reset detection** — compares stored `weekResetDate` against current Monday boundary.
- **Inline editors** — click to edit rank title, points, position, trial names, descriptions, and progress.
- **Historical tracking** — `arc_trials_history_v2` in localStorage records all-time best scores per trial title for comparison when trials return.

### Blueprints Archive
- Dedicated archive panel categorizing blueprints as MISSING (amber) or ACQUIRED (cyan).
- Shortcut progress bar on the Tactical Brief dynamically tracking completion percentages.
- Graceful UI fallback for items lacking public CDN images.

### Advanced Data Visualization
- **Raid Value History Chart**: Interactive bar chart with toggles for the Last 25 / 50 / 100 raids. Includes detailed hover tooltips breaking down Net Value, Brought In, and Extracted totals.
- **Raid History Grid**: CSS grid alignments ensuring horizontal parity across dense statistical rows.

### Live API Data
- Profile, stash, loadout, quests, projects, hideout, rounds, blueprints.
- Full round pagination (fetches all rounds, not just first page).
- Rate limit tracking displayed in header.

---

## Data Gaps

See [DATA_GAPS.md](./DATA_GAPS.md) for stats we want to track but can't get from the API yet (revives, containers looted, enemy kill breakdown).

---

## Local Storage Keys

| Key | Purpose |
|-----|---------|
| `arc_trials_state_v2` | Current week's trials, rank, points, position |
| `arc_trials_history_v2` | All-time best scores per trial title |
| `arc_command_profile` | Player identity, map mastery, playstyle bias |
| `arc_session_events` | Recent session event log (last 50) |
| `arc_departure_target` | Expedition countdown target timestamp |
| `arc_departure_minimized` | Departure panel collapsed state |
