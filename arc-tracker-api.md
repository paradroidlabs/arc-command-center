### ![](C:\Users\mkibb\AppData\Roaming\marktext\images\2026-06-18-17-07-35-image.png)

### ![](C:\Users\mkibb\AppData\Roaming\marktext\images\2026-06-18-17-07-44-image.png)

### 'your API Key'

arc_u1_rihfancHhCknoNbXIgmP2xUm4bLgBPyq

```
arc_u1_rihfancHhCknoNbXIgmP2xUm4bLgBPyq
```

```ag-0-1jre2mjn2ag-1-1jre2mjn2
### App Information

API Key

arc_k1_l2sjO...

Rate Limit

500 requests/hour

Created

6/18/2026

Description

helps track an additional layer of player focused data/context specific to personal goals, self-made challenges, overall progression, etc.

---

ARCTracker.io - ARC Raiders Progress Tracker

[![](https://arctracker.io/cdn-cgi/image/width=384/images/logos/logo_full.png)ARCTracker](https://arctracker.io/)

[

Active Events

](https://arctracker.io/map-events)

[

![Husk Graveyard](https://arctracker.io/cdn-cgi/image/width=3840/https://cdn.arctracker.io/map-events/husk_graveyard.png)

Husk Graveyard

](https://arctracker.io/map-events "Husk Graveyard - Buried City")[

![Close Scrutiny](https://arctracker.io/cdn-cgi/image/width=3840/https://cdn.arctracker.io/map-events/close-scrutiny.png)

Close Scrutiny

](https://arctracker.io/map-events "Close Scrutiny - The Blue Gate")[

![Night Raid](https://arctracker.io/cdn-cgi/image/width=3840/https://cdn.arctracker.io/map-events/night_raid.png)

Night Raid

](https://arctracker.io/map-events "Night Raid - Riven Tides")

[Home](https://arctracker.io/)

### Maps

[Raid History](https://arctracker.io/raid-history)[Stash](https://arctracker.io/stash)[Needed Items](https://arctracker.io/needed-items)[Quests](https://arctracker.io/quests)[Hideout](https://arctracker.io/hideout)[Projects](https://arctracker.io/projects)[Squads](https://arctracker.io/squads)[Map Events](https://arctracker.io/map-events)[Items](https://arctracker.io/items)[Expeditions](https://arctracker.io/seasons)[Skill Tree](https://arctracker.io/skill-tree)

### Apps

[Settings](https://arctracker.io/settings)

_paradroid

Sign Out

[Go Premium](https://arctracker.io/subscribe)

[![Discord Looking for Group](https://arctracker.io/cdn-cgi/image/width=48/images/discord_icon.png)Looking for Group](https://discord.gg/QNeSxEXrzR)

### Resources

Language

EN English

[](https://arctracker.io/developers)API Documentation

## Getting Started

The ArcTracker API provides access to ARC Raiders game data. Public endpoints require no authentication, while user data endpoints use a dual-key authentication system.

1. Public endpoints (items, quests, hideout, projects) are freely accessible with no authentication.

2. To access user data, register an app at the Developer Dashboard to get an app key.

3. Users create personal API keys in their Settings page and share them with your app.

## Base URL

```bash
https://arctracker.io
```

## Public Endpoints (No Auth Required)

These endpoints return static game data and require no authentication. Responses include all locales as multilingual objects (e.g., name: { en: "...", de: "...", ... }). Responses are cached and suitable for high-frequency requests.

GET`/api/items`

All items with multilingual names, descriptions, and effects. Static response, no parameters.

GET`/api/quests`

All quests with multilingual details, objectives, and rewards. Static response, no parameters.

GET`/api/hideout`

All hideout modules with multilingual names, levels, and requirements. Static response, no parameters.

GET`/api/projects`

All projects with multilingual names and phases. Supports expedition filtering.

Parameters

`season`Filter by expedition: 1, 2, or comma-separated (e.g., 1,2).

## Authentication

User data endpoints use a dual-key system. Your app sends both an app key and a user key with each request. This ensures users explicitly consent to sharing their data.

### 1Register your app

Go to the Developer Dashboard and register your app. You'll receive an app key (arc_k1_...) that identifies your application.

### 2User creates a personal key

Users go to Settings > Developer Access and create a personal API key (arc_u1_...) with the scopes they want to share.

### 3Send both keys with requests

Include the app key in the X-App-Key header and the user key in the Authorization: Bearer header.

### Required Headers

`X-App-Key`Your app's API key (from Developer Dashboard)

`Authorization: Bearer <key>`The user's personal API key

### Example Request

```bash
curl -H "X-App-Key: arc_k1_your_app_key" \
     -H "Authorization: Bearer arc_u1_user_key" \
     https://arctracker.io/api/v2/user/profile
```

## Authenticated Endpoints (Dual-Key Required)

These endpoints return user-specific data and require both an app key and a user key.

GET`/api/v2/user/profile`profile:read

Basic user profile information (username, level, member since).

GET`/api/v2/user/stash`stash:read

User's inventory/stash with enriched item data. Supports pagination.

Parameters

`locale`Language code (e.g., en, de, fr). Defaults to en.

`page`Page number for pagination (default: 1).

`per_page`Items per page, max 500 (default: 50).

`sort`Sort by: slot (default), name, quantity.

GET`/api/v2/user/loadout`loadout:read

User's current loadout with enriched equipment details.

Parameters

`locale`Language code (e.g., en, de, fr). Defaults to en.

GET`/api/v2/user/quests`quests:read

User's quest completion progress with optional filtering.

Parameters

`locale`Language code (e.g., en, de, fr). Defaults to en.

`filter`Filter: completed, incomplete.

GET`/api/v2/user/hideout`hideout:read

User's hideout module upgrade progress.

Parameters

`locale`Language code (e.g., en, de, fr). Defaults to en.

GET`/api/v2/user/projects`projects:read

User's project phase completion progress.

Parameters

`locale`Language code (e.g., en, de, fr). Defaults to en.

`season`Filter by expedition: 1, 2.

GET`/api/v2/user/rounds`rounds:read

User's Embark-synced round history with stats (kills, damage, outcome, loot). Includes looted items when a screenshot is attached.

Parameters

`locale`Language code (e.g., en, de, fr). Defaults to en.

`limit`Max rounds to return (default: 50, max: 200).

`offset`Pagination offset (default: 0).

`outcome`Filter: extracted, died, unknown.

`map`Filter by map slug: dam-battleground, the-spaceport, blue-gate, stella-montis, buried-city, riven-tides.

`season`Filter by season number (e.g., 1, 2).

`date_from`Inclusive start date (ISO format, e.g., 2025-01-01).

`date_to`Inclusive end date (ISO format, e.g., 2025-12-31).

`sort`Sort order: newest (default), oldest, value_desc, value_asc.

GET`/api/v2/user/blueprints`blueprints:read

User's blueprint learning status with category breakdown.

Parameters

`locale`Language code (e.g., en, de, fr). Defaults to en.

`filter`Filter: learned, missing.

## Rate Limits

Each app gets 500 requests per hour by default. Rate limit info is included in response headers. You can request a higher limit from the Developer Dashboard.

`X-RateLimit-Limit`Maximum requests allowed per window.

`X-RateLimit-Remaining`Requests remaining in current window.

`X-RateLimit-Reset`Unix timestamp when the rate limit resets.

## Error Codes

All error responses follow a standard format with an error code and message.

| Code | Description                                                                        |
| ---- | ---------------------------------------------------------------------------------- |
| 401  | Missing or invalid API key(s). Check both app key and user key.                    |
| 403  | Insufficient scope or app suspended. The user key must include the required scope. |
| 404  | Resource not found or user has no data for this endpoint.                          |
| 429  | Rate limit exceeded. Wait for the reset time in the X-RateLimit-Reset header.      |
| 500  | Internal server error. Please try again later.                                     |

## Code Examples

### cURL

```bash
curl -H "X-App-Key: arc_k1_your_app_key" \
     -H "Authorization: Bearer arc_u1_user_key" \
     "https://arctracker.io/api/v2/user/stash?locale=en&page=1&per_page=50"
```

### JavaScript

```javascript
const response = await fetch(
  "https://arctracker.io/api/v2/user/stash?locale=en",
  {
    headers: {
      "X-App-Key": "arc_k1_your_app_key",
      "Authorization": "Bearer arc_u1_user_key",
    },
  }
);
const { data, meta } = await response.json();
console.log(data.items);
```

### Python

```python
import requests

response = requests.get(
    "https://arctracker.io/api/v2/user/stash",
    params={"locale": "en", "page": 1, "per_page": 50},
    headers={
        "X-App-Key": "arc_k1_your_app_key",
        "Authorization": "Bearer arc_u1_user_key",
    },
)
data = response.json()
print(data["data"]["items"])
```

## Response Format

All authenticated endpoints return a consistent JSON envelope.

### Success Response

```json
{
  "data": { ... },
  "meta": {
    "requestId": "req_abc123"
  }
}
```

### Error Response

```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Rate limit exceeded. Try again later."
  },
  "meta": {
    "requestId": "req_abc123"
  }
}
```

Game content and materials are trademarks and copyrights of Embark Studios and its licensors. All rights reserved.  
ArcTracker.io 2025-2026

Check out our other site. [SpaceCraftDB.com](https://spacecraftdb.com/)

[Terms of Service](https://arctracker.io/terms)[Privacy Policy](https://arctracker.io/privacy)
