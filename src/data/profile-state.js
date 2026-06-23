/**
 * Profile State Manager
 * Loads/saves the player profile to localStorage, merges with live API data
 */

const STORAGE_KEY = 'arc_command_profile';
const SESSION_KEY = 'arc_session_events';

const DEFAULT_PROFILE = {
  metadata: {
    last_updated: new Date().toISOString().split('T')[0],
    schema_version: '2.1',
  },
  player_identity: {
    username: '_paradroid',
    playstyle_bias: 'PVE-Focused / Stealth / Container Looter',
    ai_directive: 'Always default to high-survival PVE loops. Override community PVP meta if it conflicts with player map survival stats.',
  },
  map_mastery: {
    'buried-city': {
      designation: 'Primary Home Turf / Highest Efficiency',
      survival_rate: 85,
      status: 'home',
    },
    'the-spaceport': {
      designation: 'Reliable Secondary',
      survival_rate: 79,
      status: 'secondary',
    },
    'dam-battleground': {
      designation: 'Hostile / Bad RNG',
      survival_rate: 50,
      status: 'avoid',
    },
    'blue-gate': {
      designation: 'Consistent / High Volume',
      survival_rate: 70,
      status: 'neutral',
    },
    'stella-montis': {
      designation: 'Exploration / Moderate',
      survival_rate: 65,
      status: 'neutral',
    },
    'riven-tides': {
      designation: 'Avoid / Low Drop Rates',
      survival_rate: 55,
      status: 'avoid',
    },
  },
  recent_session_events: [],
};

let profile = null;
const listeners = new Set();

export function loadProfile() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    profile = stored ? JSON.parse(stored) : { ...DEFAULT_PROFILE };
  } catch {
    profile = { ...DEFAULT_PROFILE };
  }
  return profile;
}

export function saveProfile() {
  if (!profile) return;
  profile.metadata.last_updated = new Date().toISOString().split('T')[0];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  notify();
}

export function getProfile() {
  if (!profile) loadProfile();
  return profile;
}

export function updateProfile(updates) {
  if (!profile) loadProfile();
  Object.assign(profile, updates);
  saveProfile();
}

export function getMapMastery(mapSlug) {
  if (!profile) loadProfile();
  return profile.map_mastery[mapSlug] || { designation: 'Unknown', survival_rate: 50, status: 'neutral' };
}

export function setMapMastery(mapSlug, data) {
  if (!profile) loadProfile();
  profile.map_mastery[mapSlug] = { ...profile.map_mastery[mapSlug], ...data };
  saveProfile();
}

// --- Session Events ---

export function getSessionEvents() {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addSessionEvent(event) {
  const events = getSessionEvents();
  events.unshift({
    ...event,
    timestamp: new Date().toISOString(),
  });
  // Keep last 50
  if (events.length > 50) events.length = 50;
  localStorage.setItem(SESSION_KEY, JSON.stringify(events));
  notify();
}

export function autoLogRounds(rounds) {
  if (!rounds || !rounds.length) return;

  const events = getSessionEvents();
  const lastLoggedId = events.length > 0 ? events[0].roundId : null;

  // Find new rounds (ones we haven't logged yet)
  const newRounds = [];
  for (const round of rounds) {
    if (round.id === lastLoggedId) break;
    newRounds.push(round);
  }

  // Log them in chronological order (oldest first)
  for (const round of newRounds.reverse()) {
    const durationMin = Math.round(round.durationMs / 60000);
    const netStr = round.netValue >= 0 ? `+${round.netValue.toLocaleString()}` : round.netValue.toLocaleString();

    addSessionEvent({
      roundId: round.id,
      type: round.outcome,
      map: round.mapName,
      mapSlug: round.map,
      detail: round.outcome === 'extracted'
        ? `Extracted from ${round.mapName} (${durationMin}m) — ${netStr} coins, ${round.arcKills} ARC kills`
        : `Died in ${round.mapName} (${durationMin}m) — ${netStr} coins lost`,
      netValue: round.netValue,
      kills: round.arcKills,
      playerKills: round.playerKills,
      score: round.score,
    });
  }
}

// --- Computed Stats from Round History ---

export function computeMapStats(rounds) {
  if (!rounds) return {};

  const stats = {};
  for (const round of rounds) {
    const slug = round.map;
    if (!stats[slug]) {
      stats[slug] = { total: 0, extracted: 0, died: 0, totalNet: 0, totalKills: 0, mapName: round.mapName };
    }
    stats[slug].total++;
    if (round.outcome === 'extracted') stats[slug].extracted++;
    else if (round.outcome === 'died') stats[slug].died++;
    stats[slug].totalNet += round.netValue;
    stats[slug].totalKills += round.arcKills;
  }

  // Compute rates
  for (const slug of Object.keys(stats)) {
    const s = stats[slug];
    s.survivalRate = s.total > 0 ? Math.round((s.extracted / s.total) * 100) : 0;
    s.avgNet = s.total > 0 ? Math.round(s.totalNet / s.total) : 0;
  }

  return stats;
}

// --- Pub/Sub ---

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify() {
  for (const fn of listeners) fn(profile);
}
