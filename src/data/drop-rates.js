/**
 * Drop Rates & Creator Knowledge Base
 * Local data tables for item drop rates per map/event
 * Plus curated tips from known YT creators
 */

const STORAGE_KEY = 'arc_drop_rates';

// Pre-populated from Paradroid's research + Perplexity data
const DEFAULT_DROP_RATES = {
  'spaceport_trench_tower_key': {
    itemName: 'Spaceport Trench Tower Key',
    rates: {
      'the-spaceport': {
        base: 1.0,
        events: {
          'Prospecting Probes': 2.79,
          'Locked Gate': 2.17,
          'Night Raid': 1.75,
        },
      },
      'buried-city': {
        base: 0.8,
        events: {
          'Cold Snap': 1.95,
        },
      },
      'stella-montis': {
        base: 1.16,
        events: {
          'Night Raid': 1.28,
        },
      },
      'blue-gate': {
        base: 0.5,
        events: {
          'Cold Snap': 1.23,
        },
      },
    },
  },
};

// --- Creator Knowledge Base ---
// Curated tips, strats, and video references from known ARC Raiders YT creators

export const CREATOR_TIPS = {
  // General trials strategies
  trials_general: [
    {
      creator: 'Community Meta',
      tip: 'Stack multiple trial objectives on the same map to maximize division points per raid.',
      tags: ['trials', 'efficiency'],
    },
    {
      creator: 'Community Meta',
      tip: 'ARC damage trials are best done in areas with high ARC density — Old Town in Buried City, industrial zones in Spaceport.',
      tags: ['trials', 'arc-damage'],
    },
    {
      creator: 'Community Meta',
      tip: 'Search X containers/cars trials — Blue Gate collapsed highway loop has the highest density of searchable cars.',
      tags: ['trials', 'search', 'blue-gate'],
    },
    {
      creator: 'Community Meta',
      tip: '6-Scanner Wolfpack Exploit: Lure 6+ scanners into a pack, then AoE them with grenades for massive multi-kill trial credit.',
      tags: ['trials', 'multi-kill', 'exploit'],
    },
    {
      creator: 'Community Meta',
      tip: 'Comet sniping from rooftops during Storm conditions in Buried City is efficient for ranged kill trials.',
      tags: ['trials', 'sniping', 'buried-city'],
    },
  ],

  // Map-specific knowledge
  maps: {
    'buried-city': [
      {
        creator: 'Community Meta',
        tip: 'Hospital area has the highest density of containers + rare surface spawns for Expired Respirators.',
        tags: ['loot', 'respirator', 'containers'],
      },
      {
        creator: 'Community Meta',
        tip: 'Old Town is the best zone for stacking ARC damage trials — constant ARC patrol spawns near the plaza.',
        tags: ['trials', 'arc-damage'],
      },
    ],
    'the-spaceport': [
      {
        creator: 'Community Meta',
        tip: 'During Prospecting Probes events, high-tier ARC spawns increase alongside key drop rates — farm both.',
        tags: ['events', 'key-farming'],
      },
      {
        creator: 'Community Meta',
        tip: 'Industrial crate route: Start at landing pad → move through hangars → extract at south hatch for a tight 15-min loop.',
        tags: ['loot-route', 'efficiency'],
      },
    ],
    'dam-battleground': [
      {
        creator: 'Community Meta',
        tip: 'Testing Annex has reliable rare spawns but extraction hatches can be blocked — always have backup extract planned.',
        tags: ['loot', 'extraction'],
      },
    ],
    'blue-gate': [
      {
        creator: 'Community Meta',
        tip: 'Collapsed highway loop: 15+ searchable cars in a circuit, great for Search Cars trial objectives.',
        tags: ['trials', 'cars', 'loot-route'],
      },
    ],
  },

  // Loadout advice
  loadout: [
    {
      creator: 'Community Meta',
      tip: 'Always carry a Survivor Augment in your loadout — it\'s a life-saving second chance for clutch extractions.',
      tags: ['loadout', 'augment', 'safety'],
    },
    {
      creator: 'Community Meta',
      tip: 'Keep Safe Pocket slots reserved for high-value rare finds. Don\'t waste them on consumables.',
      tags: ['loadout', 'safe-pocket'],
    },
    {
      creator: 'Community Meta',
      tip: 'Photoelectric Cloak is the ultimate PVE stealth tool — use it to bypass dangerous ARC clusters when low on health.',
      tags: ['loadout', 'stealth', 'pve'],
    },
  ],
};

// --- Drop Rate Functions ---

let dropRates = null;

export function loadDropRates() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    dropRates = stored ? JSON.parse(stored) : { ...DEFAULT_DROP_RATES };
  } catch {
    dropRates = { ...DEFAULT_DROP_RATES };
  }
  return dropRates;
}

export function getDropRates() {
  if (!dropRates) loadDropRates();
  return dropRates;
}

export function getBestDropLocation(itemKey, activeEvents = []) {
  const rates = getDropRates()[itemKey];
  if (!rates) return null;

  let best = { map: null, event: null, rate: 0 };

  for (const [mapSlug, mapData] of Object.entries(rates.rates)) {
    // Check event-boosted rates first
    if (mapData.events) {
      for (const [eventName, rate] of Object.entries(mapData.events)) {
        const isActive = activeEvents.some(e =>
          e.toLowerCase().includes(eventName.toLowerCase())
        );
        if (rate > best.rate) {
          best = { map: mapSlug, event: eventName, rate, isActive };
        }
      }
    }
    // Base rate
    if (mapData.base > best.rate) {
      best = { map: mapSlug, event: null, rate: mapData.base, isActive: true };
    }
  }

  return best;
}

/**
 * Get the best map for an item, factoring in survival rate
 */
export function getOptimalFarmingSpot(itemKey, mapMastery, activeEvents = []) {
  const rates = getDropRates()[itemKey];
  if (!rates) return null;

  const spots = [];

  for (const [mapSlug, mapData] of Object.entries(rates.rates)) {
    const mastery = mapMastery[mapSlug] || { survival_rate: 50 };
    const survivalRate = mastery.survival_rate / 100;

    if (mapData.events) {
      for (const [eventName, dropRate] of Object.entries(mapData.events)) {
        const isActive = activeEvents.some(e =>
          e.toLowerCase().includes(eventName.toLowerCase())
        );
        // Compound score: drop_rate × survival_rate, bonus if event is live
        const score = dropRate * survivalRate * (isActive ? 1.5 : 1.0);
        spots.push({ map: mapSlug, event: eventName, dropRate, survivalRate: mastery.survival_rate, score, isActive });
      }
    }

    const baseScore = mapData.base * survivalRate;
    spots.push({ map: mapSlug, event: null, dropRate: mapData.base, survivalRate: mastery.survival_rate, score: baseScore, isActive: true });
  }

  spots.sort((a, b) => b.score - a.score);
  return spots;
}

// Map display names
export const MAP_NAMES = {
  'buried-city': 'Buried City',
  'the-spaceport': 'Spaceport',
  'dam-battleground': 'The Dam',
  'blue-gate': 'Blue Gate',
  'stella-montis': 'Stella Montis',
  'riven-tides': 'Riven Tides',
};
