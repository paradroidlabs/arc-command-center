/**
 * ARC Command Center — App Shell
 * Bootstrap, fetch data, run advisor engine, render components
 */

import { fetchAllUserData, fetchItems, clearCache } from './data/api-client.js';
import { loadProfile, autoLogRounds } from './data/profile-state.js';
import { generateActionPlan } from './engine/advisor.js';
import { renderHeader } from './ui/components/header.js';
import { initSidebar, updateSidebarControls } from './ui/components/sidebar.js';
import { renderActionPanel } from './ui/components/action-panel.js';
import { renderProjectTracker } from './ui/components/project-tracker.js';
import { renderMapIntel } from './ui/components/map-intel.js';
import { renderInventoryStatus } from './ui/components/inventory-status.js';
import { renderBlueprintShortcut } from './ui/components/blueprint-shortcut.js';
import { renderQuestTracker } from './ui/components/quest-tracker.js';
import { renderSessionLog } from './ui/components/session-log.js';
import { renderWeaponsPanel } from './ui/components/weapons-panel.js';
import { renderTrialsPanel } from './ui/components/trials-panel.js';
import { renderRaidHistoryPanel } from './ui/components/raid-history-panel.js';
import { renderDeparturePanel } from './ui/components/departure-panel.js';
import { renderBlueprintsPanel } from './ui/components/blueprints-panel.js';

// --- DOM References ---
const $ = (id) => document.getElementById(id);
const loadingOverlay = $('loading-overlay');
const toastContainer = $('toast-container');

// --- State ---
let appData = null;
let currentTab = 'dashboard';

// --- Init ---
async function init() {
  // Load local profile
  loadProfile();

  // Initialize Sidebar (which manages tab state internally now)
  initSidebar('sidebar');

  // Show loading
  showLoading(true);

  try {
    const [userData, itemsData] = await Promise.all([
      fetchAllUserData(),
      fetchItems()
    ]);

    appData = userData;
    appData.items = itemsData;

    // Log any partial errors
    if (appData.errors.length > 0) {
      for (const err of appData.errors) {
        showToast(`API Warning: ${err}`, 'error');
      }
    }

    render(appData);
  } catch (err) {
    console.error('Fatal error loading data:', err);
    showToast(`Failed to load data: ${err.message}`, 'error');
    renderFallback();
  } finally {
    showLoading(false);
  }
}

// --- Render Everything ---
function render(data) {
  const {
    profile, stash, loadout, quests,
    projects, hideout, rounds, blueprints, items
  } = data;

  // Tab State
  $('tab-dashboard').style.display = currentTab === 'dashboard' ? 'grid' : 'none';
  $('tab-weapons').style.display = currentTab === 'weapons' ? 'block' : 'none';
  $('tab-trials').style.display = currentTab === 'trials' ? 'block' : 'none';
  $('tab-history').style.display = currentTab === 'history' ? 'block' : 'none';

  // Header
  renderHeader($('header'), { 
    profile, 
    rounds, 
    stash
  });

  // Departure Banner (now inside header)
  if ($('departure-panel-container')) {
    renderDeparturePanel($('departure-panel-container'));
  }

  // Run the advisor engine
  const actions = generateActionPlan({
    profile, stash, loadout, quests,
    projects, hideout, rounds, blueprints
  });
  window.debugBlueprints = blueprints;

  // Mission Brief (Action Panel)
  renderActionPanel($('action-panel'), actions);

  // Projects
  renderProjectTracker($('project-tracker'), { projects });
  renderQuestTracker($('quest-tracker'), { quests });
  renderBlueprintShortcut($('blueprint-shortcut'), { blueprints });

  // Map Intel
  renderMapIntel($('map-intel'), { rounds });

  // Inventory
  renderInventoryStatus($('inventory-status'), { stash, loadout });

  // Session Log
  renderSessionLog($('session-log'), { rounds });

  // Weapons Panel
  renderWeaponsPanel($('weapons-panel'), { loadout, rounds, items });

  // Trials Panel
  const trialsContainer = $('trials-panel-container');
  if (trialsContainer) {
    trialsContainer.innerHTML = '';
    trialsContainer.appendChild(renderTrialsPanel());
  }
  
  // Raid History
  if ($('history-panel-container')) {
    renderRaidHistoryPanel($('history-panel-container'), appData);
  }

  // Blueprints
  if ($('blueprints-panel-container')) {
    renderBlueprintsPanel($('blueprints-panel-container'), { blueprints, items });
  }

  // Update Sidebar API limit and Sync button
  updateSidebarControls();

  // Bind refresh button
  bindRefresh();

  console.log('[ARC Command Center] Render complete. Actions:', actions.length);
}

function renderFallback() {
  $('action-panel').innerHTML = `
    <div class="panel__header">
      <h2 class="panel__title"><span class="panel__title-icon">📡</span> MISSION BRIEF</h2>
    </div>
    <div class="empty-state">
      <div class="empty-state__icon">⚠️</div>
      <p>Failed to connect to ARC Network. Check your API keys in the .env file and try refreshing.</p>
    </div>
  `;
}

// --- Tabs ---
function handleTabChange(tabId) {
  if (currentTab === tabId) return;
  currentTab = tabId;
  if (appData) render(appData);
}

// --- Refresh ---
function bindRefresh() {
  const btn = $('refresh-btn');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    if (btn.classList.contains('is-loading')) return;

    btn.classList.add('is-loading');
    clearCache();

    try {
      const [userData, itemsData] = await Promise.all([
        fetchAllUserData(),
        fetchItems()
      ]);
      appData = userData;
      appData.items = itemsData;
      render(appData);
      showToast('✓ Data synced from ARC Network', 'success');
    } catch (err) {
      showToast(`Sync failed: ${err.message}`, 'error');
    } finally {
      btn.classList.remove('is-loading');
    }
  });
}

// --- Loading ---
function showLoading(show) {
  if (show) {
    loadingOverlay.classList.remove('is-hidden');
  } else {
    loadingOverlay.classList.add('is-hidden');
  }
}

// --- Toast ---
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 300ms ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// --- Launch ---
init();
