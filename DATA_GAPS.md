# ARC Command Center — Data Gaps & Wanted Tracking

Stats and features we **want to track** but the ArcTracker.io API does not currently expose.

---

## Not Available via API

| Stat | Why We Want It | Potential Solutions |
|------|---------------|---------------------|
| **Revives (Squadmate vs Stranger)** | Core social stat — shows playstyle (team player vs solo). Want breakdown by squad vs random. | 1. Manual entry per-session (like trials rank) 2. OCR screenshot parsing of end-of-round screen 3. Browser extension to intercept game overlay data 4. Request from ArcTracker dev (API feature request) |
| **Weekly Trials & Rank** | Already solved locally — rank, points, position, trial progress all stored in `localStorage` via inline editors. | ✅ Solved — manual entry with `arc_trials_state_v2` |
| **Containers Looted** | Tracks looting efficiency per raid. Currently hardcoded in `history-stats.js`. | Same solutions as revives — manual entry or screenshot OCR |
| **Detailed Enemy Kill Breakdown** | Kill counts per enemy type (Wasp, Pop, Tick, etc.). Currently hardcoded. | Same — not in round data from API |

---

## Available via API (already implemented)

| Stat | Source |
|------|--------|
| Player Level | `/v2/user/profile` |
| Topside Hours | Computed from `durationMs` across all rounds |
| Total Raids | `rounds.pagination.total` |
| Survival Rate | Computed from round outcomes |
| Credits | `stash.currencies.credits` |
| ARC Kills | `round.arcKills` per round |
| Player Kills | `round.playerKills` per round |
| Net Value / Profit | `round.netValue` per round |
| Damage Dealt | `round.damage` per round |

---

## Ideas for Closing the Gap

### 1. Per-Session Manual Logger
Add a "Log Session" button that opens a quick form after a play session:
- Revives (squad / stranger)
- Notable moments
- Could auto-populate from last N rounds' timestamps

### 2. Screenshot OCR Pipeline
Parse end-of-round screenshots for stats the API misses. Would need:
- A file watcher on the game's screenshot directory
- An OCR pass (Tesseract or cloud vision API)
- Template matching for the ARC Raiders result screen layout

### 3. ArcTracker API Feature Request
Reach out to ArcTracker devs to request additional round fields:
- `revives`, `squadmateRevives`, `strangerRevives`
- `containersLooted`
- `enemyKillBreakdown` (by type)
