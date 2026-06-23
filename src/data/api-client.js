/**
 * ArcTracker.io API Client
 * Dual-key auth, caching, rate-limit tracking
 */

const BASE_URL = '/api';
const APP_KEY = import.meta.env.VITE_ARC_APP_KEY;
const USER_KEY = import.meta.env.VITE_ARC_USER_KEY;

// In-memory cache with TTL
const cache = new Map();
const CACHE_TTL_SHORT = 5 * 60 * 1000;   // 5 min for user data
const CACHE_TTL_LONG = 30 * 60 * 1000;   // 30 min for static data

// Rate limit state
export const rateLimit = {
  limit: 500,
  remaining: 500,
  resetAt: null,
};

function updateRateLimit(headers) {
  const limit = headers.get('X-RateLimit-Limit');
  const remaining = headers.get('X-RateLimit-Remaining');
  const reset = headers.get('X-RateLimit-Reset');
  if (limit) rateLimit.limit = parseInt(limit, 10);
  if (remaining) rateLimit.remaining = parseInt(remaining, 10);
  if (reset) rateLimit.resetAt = new Date(parseInt(reset, 10) * 1000);
}

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key, data, ttl) {
  cache.set(key, { data, expiresAt: Date.now() + ttl });
}

export function clearCache() {
  cache.clear();
}

async function fetchAPI(path, params = {}, options = {}) {
  const { auth = true, cacheTTL = CACHE_TTL_SHORT } = options;

  const url = new URL(BASE_URL + path, window.location.origin);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, v);
  });

  const cacheKey = url.toString();
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const headers = {};
  if (auth) {
    headers['X-App-Key'] = APP_KEY;
    headers['Authorization'] = `Bearer ${USER_KEY}`;
  }

  const response = await fetch(url.toString(), { headers });

  if (auth) updateRateLimit(response.headers);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const err = new Error(errorBody?.error?.message || `API error ${response.status}`);
    err.status = response.status;
    err.code = errorBody?.error?.code;
    throw err;
  }

  const json = await response.json();
  setCache(cacheKey, json, cacheTTL);
  return json;
}

// --- Public Endpoints (no auth) ---

export async function fetchItems() {
  return fetchAPI('/items', {}, { auth: false, cacheTTL: CACHE_TTL_LONG });
}

export async function fetchAllQuests() {
  return fetchAPI('/quests', {}, { auth: false, cacheTTL: CACHE_TTL_LONG });
}

export async function fetchAllProjects(season) {
  return fetchAPI('/projects', season ? { season } : {}, { auth: false, cacheTTL: CACHE_TTL_LONG });
}

export async function fetchHideoutModules() {
  return fetchAPI('/hideout', {}, { auth: false, cacheTTL: CACHE_TTL_LONG });
}

// --- Authenticated Endpoints ---

export async function fetchProfile() {
  return fetchAPI('/v2/user/profile');
}

export async function fetchStash(page = 1, perPage = 500) {
  return fetchAPI('/v2/user/stash', { locale: 'en', page, per_page: perPage });
}

export async function fetchLoadout() {
  return fetchAPI('/v2/user/loadout', { locale: 'en' });
}

export async function fetchQuests(filter) {
  return fetchAPI('/v2/user/quests', { locale: 'en', filter });
}

export async function fetchUserProjects(season) {
  const params = { locale: 'en' };
  if (season) params.season = season;
  const res = await fetchAPI('/v2/user/projects', params);
  
  // Inject hardcoded state for Converging Paths due to API syncing bug
  if (res && res.projects) {
    const cp = res.projects.find(p => p.name === 'Converging Paths');
    if (cp) {
      cp.completedPhases = 1;
      if (cp.phases && cp.phases.length >= 2) {
        cp.phases[0].completed = true;
        // Phase 2 is 'Collect Supplies'
        cp.phases[1].completed = false;
        if (cp.phases[1].requirements) {
          const reqs = cp.phases[1].requirements;
          const setReq = (id, sub) => {
            const r = reqs.find(x => x.itemId === id);
            if (r) r.submitted = sub;
          };
          setReq('train_model', 0);
          setReq('vintage_steering_wheel', 0);
          setReq('air_freshener', 1);
          setReq('arc_thermo_lining', 5);
        }
      }
    }
  }
  return res;
}

export async function fetchHideout() {
  return fetchAPI('/v2/user/hideout', { locale: 'en' });
}

export async function fetchRounds(limit = 50, offset = 0, filters = {}) {
  return fetchAPI('/v2/user/rounds', {
    locale: 'en',
    limit,
    offset,
    sort: 'newest',
    ...filters,
  });
}

export async function fetchBlueprints(filter) {
  return fetchAPI('/v2/user/blueprints', { locale: 'en', filter });
}

// --- Aggregate Fetch ---

export async function fetchAllUserData() {
  const profilePromise = fetchProfile();
  const stashPromise = fetchStash();
  const loadoutPromise = fetchLoadout();
  const questsPromise = fetchQuests();
  const projectsPromise = fetchUserProjects();
  const hideoutPromise = fetchHideout();
  const blueprintsPromise = fetchBlueprints();

  // Fetch all rounds with pagination
  const fetchAllRounds = async () => {
    let allRounds = [];
    let offset = 0;
    const limit = 200;
    let total = 1;
    let paginationData = null;

    while (offset < total) {
      const res = await fetchRounds(limit, offset);
      if (!res.data || !res.data.rounds) break;
      allRounds = allRounds.concat(res.data.rounds);
      paginationData = res.data.pagination;
      total = paginationData?.total || 0;
      offset += limit;
    }
    return { data: { rounds: allRounds, pagination: paginationData } };
  };

  const [profile, stash, loadout, quests, projects, hideout, rounds, blueprints] =
    await Promise.allSettled([
      profilePromise,
      stashPromise,
      loadoutPromise,
      questsPromise,
      projectsPromise,
      hideoutPromise,
      fetchAllRounds(),
      blueprintsPromise,
    ]);

  return {
    profile: profile.status === 'fulfilled' ? profile.value.data : null,
    stash: stash.status === 'fulfilled' ? stash.value.data : null,
    loadout: loadout.status === 'fulfilled' ? loadout.value.data : null,
    quests: quests.status === 'fulfilled' ? quests.value.data : null,
    projects: projects.status === 'fulfilled' ? projects.value.data : null,
    hideout: hideout.status === 'fulfilled' ? hideout.value.data : null,
    rounds: rounds.status === 'fulfilled' ? rounds.value.data : null,
    blueprints: blueprints.status === 'fulfilled' ? blueprints.value.data : null,
    errors: [profile, stash, loadout, quests, projects, hideout, rounds, blueprints]
      .filter(r => r.status === 'rejected')
      .map(r => r.reason.message),
  };
}

// --- Map Conditions Fetch ---

export async function fetchMapConditions() {
  try {
    const res = await fetch('/metaforge/api/arc-raiders/events-schedule');
    if (!res.ok) throw new Error('Failed to fetch map conditions from Metaforge proxy');
    const json = await res.json();
    
    if (!json || !json.data) return [];
    
    const now = new Date().getTime();
    const activeEvents = json.data.filter(e => {
      const start = e.startTime;
      const end = e.endTime;
      return now >= start && now <= end;
    });
    
    return activeEvents;
  } catch (err) {
    console.error('Map Conditions Fetch Error:', err);
    return null;
  }
}
