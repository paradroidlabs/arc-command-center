/**
 * Decision Engine — The Advisor
 * Cross-references all data sources to produce prioritized action list
 * Heavy focus on Trials optimization
 */

import { getProfile, getMapMastery, computeMapStats } from '../data/profile-state.js';
import { CREATOR_TIPS, MAP_NAMES } from '../data/drop-rates.js';
import { loadTrialsState } from '../data/trials-state.js';

/**
 * Generate a prioritized list of recommended actions
 */
export function generateActionPlan({ profile, stash, loadout, quests, projects, hideout, rounds, blueprints }) {
  const actions = [];
  const mapStats = rounds?.rounds ? computeMapStats(rounds.rounds) : {};

  // 0. TRIALS FOR THE WEEK
  try {
    const trialsState = loadTrialsState();
    if (trialsState && trialsState.trials) {
      const incompleteTrials = trialsState.trials.filter(t => t.progress < t.maxProgress);
      if (incompleteTrials.length > 0) {
        actions.push({
          priority: 2,
          type: 'trials',
          icon: '🛡️',
          title: `Active Trials (${incompleteTrials.length} Remaining)`,
          reason: `Focus on completing your weekly trials to climb the ranks. Current rank: ${trialsState.rankTitle}.`,
          trials: incompleteTrials,
          tips: CREATOR_TIPS.trials_general,
        });
      }
    }
  } catch (e) {
    console.error("Failed to load trials for objectives:", e);
  }

  // 1. INVENTORY CHECK — always first if critical
  if (loadout) {
    const backpackSlots = loadout.loadout?.slotCounts?.backpack || 20;
    const backpackItems = loadout.loadout?.backpack?.length || 0;

    if (backpackItems >= backpackSlots) {
      actions.push({
        priority: 0,
        type: 'inventory',
        icon: '🎒',
        title: 'Clear Your Backpack — It\'s Full',
        reason: `Your backpack is at ${backpackItems}/${backpackSlots}. You won't be able to pick up loot. Clear out at the hideout before deploying.`,
        urgency: 'critical',
        tips: CREATOR_TIPS.loadout.filter(t => t.tags.includes('safe-pocket')),
      });
    } else if (backpackItems >= backpackSlots - 3) {
      actions.push({
        priority: 1,
        type: 'inventory',
        icon: '🎒',
        title: 'Backpack Almost Full',
        reason: `${backpackItems}/${backpackSlots} slots used. Consider clearing some space before your next raid for max loot efficiency.`,
        urgency: 'warning',
      });
    }

    // Safe pocket check
    const safePocketSlots = loadout.loadout?.slotCounts?.safePocket || 3;
    const safePocketUsed = loadout.loadout?.safePocket?.length || 0;
    if (safePocketUsed >= safePocketSlots) {
      /* Disabled per user request (intentional safe pocket setup)
      actions.push({
        priority: 1,
        type: 'inventory',
        icon: '🔒',
        title: 'Safe Pocket Full',
        reason: `All ${safePocketSlots} safe pocket slots are occupied. If you find a rare key or item, you won't be able to secure it. Consider clearing a slot.`,
        urgency: 'warning',
        safePocketItems: loadout.loadout.safePocket,
      });
      */
    }
  }

  // 2. STASH CAPACITY
  if (stash?.slots) {
    const pct = (stash.slots.used / stash.slots.max) * 100;
    if (pct >= 95) {
      actions.push({
        priority: 1,
        type: 'inventory',
        icon: '📦',
        title: 'Stash Nearly Full',
        reason: `Stash is at ${stash.slots.used}/${stash.slots.max} (${Math.round(pct)}%). Sell or scrap items to make room.`,
        urgency: 'warning',
      });
    }
  }

  // 3. INCOMPLETE PROJECTS — find items needed
  if (projects?.projects) {
    for (const project of projects.projects) {
      if (project.fullyCompleted) continue;
      if (project.name.includes('Expedition')) continue; // Disabled per user request (API syncing bug)

      // Find the current active phase (first incomplete one)
      const activePhase = project.phases.find(p => !p.completed);
      if (!activePhase) continue;

      // Parse requirements if available
      const reqs = activePhase.requirements || activePhase.categoryRequirements || [];
      const hasRequirements = reqs.length > 0;

      actions.push({
        priority: 3,
        type: 'project',
        icon: '🔧',
        title: `${project.name} — ${activePhase.name}`,
        reason: hasRequirements
          ? `Phase ${activePhase.phase}/${project.totalPhases}: Gather required items to progress.`
          : `Phase ${activePhase.phase}/${project.totalPhases}: Complete the objective to advance.`,
        project: project.name,
        phase: activePhase,
        progress: `${project.completedPhases}/${project.totalPhases}`,
      });
    }
  }

  // 4. INCOMPLETE QUESTS
  if (quests?.quests) {
    const incompleteQuests = quests.quests.filter(q => !q.completed);
    if (incompleteQuests.length > 0) {
      // Group by trader
      const byTrader = {};
      for (const q of incompleteQuests) {
        if (!byTrader[q.trader]) byTrader[q.trader] = [];
        byTrader[q.trader].push(q);
      }

      for (const [trader, traderQuests] of Object.entries(byTrader)) {
        actions.push({
          priority: 4,
          type: 'quest',
          icon: '📜',
          title: `${trader}'s Quests (${traderQuests.length} remaining)`,
          reason: `Complete quests for ${trader} to unlock rewards and progress the story.`,
          quests: traderQuests,
          trader,
        });
      }
    }
  }

  // 5. HIDEOUT UPGRADES
  if (hideout?.modules) {
    const upgradeable = hideout.modules.filter(m => m.currentLevel < m.maxLevel && m.maxLevel > 0);
    if (upgradeable.length > 0) {
      // Prioritize stash upgrades
      const stashModule = upgradeable.find(m => m.id === 'stash');
      if (stashModule) {
        actions.push({
          priority: 3,
          type: 'hideout',
          icon: '🏠',
          title: `Upgrade Stash (Level ${stashModule.currentLevel}/${stashModule.maxLevel})`,
          reason: 'More stash space = more loot storage = more profit per session.',
          module: stashModule,
        });
      }
    }
  }

  // 6. BLUEPRINT COLLECTION
  if (blueprints?.summary) {
    const missing = blueprints.summary.missing;
    if (missing > 0) {
      // Find high-priority missing categories
      const categories = blueprints.summary.byCategory || {};
      const missingByCategory = [];
      for (const [cat, data] of Object.entries(categories)) {
        // PowerShell serialized these weirdly, parse them
        let catMissing = 0;
        if (typeof data === 'string') {
          const match = data.match(/missing=(\d+)/);
          if (match) catMissing = parseInt(match[1], 10);
        } else if (data && typeof data.missing === 'number') {
          catMissing = data.missing;
        }
        if (catMissing > 0) {
          missingByCategory.push({ category: cat, missing: catMissing });
        }
      }
      missingByCategory.sort((a, b) => b.missing - a.missing);

      actions.push({
        priority: 5,
        type: 'blueprint',
        icon: '📘',
        title: `${missing} Blueprints Missing`,
        reason: `Focus on: ${missingByCategory.slice(0, 3).map(c => `${c.category} (${c.missing})`).join(', ')}`,
        missingCategories: missingByCategory,
        totalMissing: missing,
      });
    }
  }

  // 7. SESSION MOMENTUM — analyze recent rounds
  if (rounds?.rounds?.length > 0) {
    const recent = rounds.rounds.slice(0, 5);
    const deaths = recent.filter(r => r.outcome === 'died').length;
    const netTotal = recent.reduce((sum, r) => sum + r.netValue, 0);

    if (deaths >= 3) {
      actions.push({
        priority: 1,
        type: 'momentum',
        icon: '⚠️',
        title: 'Rough Session — Switch to Safe Maps',
        reason: `${deaths}/5 recent raids ended in death (net ${netTotal.toLocaleString()} coins). Consider switching to your home turf (Buried City, 85% survival rate) for a recovery run.`,
        urgency: 'warning',
        tips: CREATOR_TIPS.trials_general.filter(t => t.tags.includes('efficiency')),
      });
    } else if (netTotal > 50000) {
      actions.push({
        priority: 6,
        type: 'momentum',
        icon: '🔥',
        title: 'Hot Streak — Keep Pushing',
        reason: `Last 5 raids: +${netTotal.toLocaleString()} coins net. You're in the zone. Consider pushing into higher-risk maps for bigger rewards.`,
        urgency: 'positive',
      });
    }
  }

  // Sort by priority (lower = more urgent)
  actions.sort((a, b) => a.priority - b.priority);

  return actions;
}

/**
 * Get relevant tips for the current context
 */
export function getContextualTips(mapSlug, objectives = []) {
  const tips = [];

  // Map-specific tips
  if (mapSlug && CREATOR_TIPS.maps[mapSlug]) {
    tips.push(...CREATOR_TIPS.maps[mapSlug]);
  }

  // Trial tips
  if (objectives.some(o => o.type === 'trials')) {
    tips.push(...CREATOR_TIPS.trials_general);
  }

  // Loadout tips
  tips.push(...CREATOR_TIPS.loadout);

  return tips;
}

/**
 * Compute overall player stats from API data
 */
export function computePlayerStats(rounds) {
  if (!rounds?.rounds || !rounds.pagination) return null;

  const allRounds = rounds.rounds;
  const total = rounds.pagination.total;

  // From the fetched rounds (most recent)
  const extracted = allRounds.filter(r => r.outcome === 'extracted').length;
  const totalNet = allRounds.reduce((sum, r) => sum + r.netValue, 0);
  const totalKills = allRounds.reduce((sum, r) => sum + r.arcKills, 0);
  const totalPlayerKills = allRounds.reduce((sum, r) => sum + r.playerKills, 0);

  return {
    totalRaids: total,
    recentRaids: allRounds.length,
    recentExtracted: extracted,
    recentSurvivalRate: allRounds.length > 0 ? Math.round((extracted / allRounds.length) * 100) : 0,
    recentNetProfit: totalNet,
    recentArcKills: totalKills,
    recentPlayerKills: totalPlayerKills,
  };
}
