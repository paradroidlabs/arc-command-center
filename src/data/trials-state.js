const STORAGE_KEY = 'arc_trials_state_v2';
const HISTORY_KEY = 'arc_trials_history_v2';

// Helper to get the ISO date of the most recent Monday reset at 07:00 UTC
function getWeeklyResetTime() {
  const now = new Date();
  const reset = new Date();
  reset.setUTCHours(7, 0, 0, 0);
  const day = reset.getUTCDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  
  // Find the most recent Monday reset
  let daysToSubtract = (day + 6) % 7;
  if (day === 1 && now.getUTCHours() < 7) {
    daysToSubtract = 7;
  }
  reset.setUTCDate(reset.getUTCDate() - daysToSubtract);
  return reset.toISOString().split('T')[0]; // e.g. "2026-06-22"
}

const DEFAULT_STATE = {
  weekResetDate: getWeeklyResetTime(),
  rankTitle: "DAREDEVIL III",
  rankPoints: 0,
  position: "-",
  trials: [
    {
      id: "t1",
      title: "Damage flying ARC enemies inside the Spaceport walls",
      description: "SPACEPORT",
      progress: 0,
      maxProgress: 3000,
      image: "/images/trial_damage_flying_arc_enemies_inside_the_spaceport_walls.png",
      stars: 0,
      maxStars: 3
    },
    {
      id: "t2",
      title: "Search ARC Probes, Couriers and Assessors",
      description: "AVAILABLE ON ALL MAPS",
      progress: 0,
      maxProgress: 3000,
      image: "/images/trial_search_raider_caches.png",
      stars: 0,
      maxStars: 3,
      advisorData: {
        pointsPerAction: 286,
        actionName: "section searched",
        milestones: [
          { stars: 1, points: 1000, actionsRequired: 4 },
          { stars: 2, points: 2000, actionsRequired: 7 },
          { stars: 3, points: 3000, actionsRequired: 11 }
        ],
        tips: [
          "**Prospecting Probes**: Increased number of ARC Probes descending. Each has 3 sections to loot (fastest for 3 stars).",
          "**Electromagnetic Storm**: More Crashed Probes and Couriers, but each has only 1 section.",
          "**Close Scrutiny**: Assessors spawn. Pinpoint locations shown on the map."
        ]
      }
    },
    {
      id: "t3",
      title: "Search Supply Drops",
      description: "AVAILABLE ON ALL MAPS",
      progress: 0,
      maxProgress: 3000,
      image: "/images/trial_search_supply_drops.png",
      stars: 0,
      maxStars: 3
    },
    {
      id: "t4",
      title: "Damage Leapers",
      description: "AVAILABLE ON ALL MAPS",
      progress: 0,
      maxProgress: 3000,
      image: "/images/trial_damage_leapers.png",
      stars: 0,
      maxStars: 3
    },
    {
      id: "t5",
      title: "Destroy Pops",
      description: "AVAILABLE ON ALL MAPS",
      progress: 0,
      maxProgress: 3000,
      image: "/images/trial_destroy_pops.png",
      stars: 0,
      maxStars: 3
    }
  ],
  selectedTrialId: "t1"
};

export function loadTrialsState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const currentReset = getWeeklyResetTime();
    
    if (saved) {
      const parsed = JSON.parse(saved);
      // If the saved trials are from a previous week, trigger a reset to DEFAULT_STATE
      if (parsed.weekResetDate !== currentReset) {
        console.log(`[ARC Command Center] Weekly reset detected. Resetting trials from ${parsed.weekResetDate} to ${currentReset}.`);
        const freshState = { ...DEFAULT_STATE, weekResetDate: currentReset };
        saveTrialsState(freshState);
        return freshState;
      }

      // Merge in latest image paths from DEFAULT_STATE so old states get updated
      parsed.trials = parsed.trials.map(t => {
        const defaultTrial = DEFAULT_STATE.trials.find(dt => dt.id === t.id);
        if (defaultTrial) {
          t.image = defaultTrial.image;
        }
        return t;
      });

      return { ...DEFAULT_STATE, ...parsed };
    }
  } catch (e) {
    console.error("Failed to load trials state", e);
  }
  
  // Set and save initial default state if not saved
  const initialState = { ...DEFAULT_STATE };
  saveTrialsState(initialState);
  return initialState;
}

export function saveTrialsState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save trials state", e);
  }
}

export function updateTrialProgress(id, newProgress) {
  const state = loadTrialsState();
  const trial = state.trials.find(t => t.id === id);
  if (trial) {
    trial.progress = newProgress;
    // Auto-calculate stars based on thresholds (1000, 2000, 3000)
    if (newProgress >= 3000) trial.stars = 3;
    else if (newProgress >= 2000) trial.stars = 2;
    else if (newProgress >= 1000) trial.stars = 1;
    else trial.stars = 0;
    
    // Update historical best if this score is higher
    updateHistoricalRecord(trial.title, newProgress);
    
    saveTrialsState(state);
  }
  return state;
}

export function updateTrialDetails(id, updates) {
  const state = loadTrialsState();
  const trial = state.trials.find(t => t.id === id);
  if (trial) {
    Object.assign(trial, updates);
    // Recalculate stars in case progress/maxProgress changed
    if (trial.progress >= 3000) trial.stars = 3;
    else if (trial.progress >= 2000) trial.stars = 2;
    else if (trial.progress >= 1000) trial.stars = 1;
    else trial.stars = 0;
    
    // Update historical best if progress changed
    if (trial.progress > 0) {
      updateHistoricalRecord(trial.title, trial.progress);
    }
    
    saveTrialsState(state);
  }
  return state;
}

export function updateRankDetails(updates) {
  const state = loadTrialsState();
  Object.assign(state, updates);
  saveTrialsState(state);
  return state;
}

export function updateRankPoints(points) {
  const state = loadTrialsState();
  state.rankPoints = points;
  saveTrialsState(state);
  return state;
}

export function selectTrial(id) {
    const state = loadTrialsState();
    state.selectedTrialId = id;
    saveTrialsState(state);
    return state;
}

// --- Historical Tracking ---

function loadTrialsHistory() {
  try {
    const saved = localStorage.getItem(HISTORY_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    console.error('Failed to load trials history', e);
    return {};
  }
}

function saveTrialsHistory(history) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save trials history', e);
  }
}

function updateHistoricalRecord(title, score) {
  const key = title.toLowerCase().trim();
  const history = loadTrialsHistory();
  const existing = history[key];
  
  if (!existing || score > existing.bestScore) {
    history[key] = {
      bestScore: score,
      achievedDate: new Date().toISOString(),
      title: title // preserve original casing
    };
    saveTrialsHistory(history);
  }
}

export function getHistoricalBest(title) {
  const key = title.toLowerCase().trim();
  const history = loadTrialsHistory();
  return history[key] || null;
}

// --- Timer Calculation (shared) ---

export function getNextTrialsReset() {
  const now = new Date();
  const nextReset = new Date();
  nextReset.setUTCHours(7, 0, 0, 0);
  const day = nextReset.getUTCDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  
  let daysToAdd = (8 - day) % 7;
  if (day === 1 && now.getUTCHours() >= 7) {
    daysToAdd = 7;
  }
  nextReset.setUTCDate(nextReset.getUTCDate() + daysToAdd);
  return nextReset;
}
