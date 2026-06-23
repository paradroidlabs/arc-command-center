/**
 * Sidebar Component
 * Renders the collapsible left sidebar, including Map Events, Navigation, and Player Profile.
 */

import { fetchMapConditions, rateLimit } from '../../data/api-client.js';

export async function initSidebar(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  renderSidebar(container);
  attachEventListeners(container);
  
  await updateMapConditions(container);
}

async function updateMapConditions(container) {
  const eventsList = container.querySelector('.events-list');
  if (!eventsList) return;
  
  eventsList.innerHTML = '<div style="color: var(--text-muted); font-size: 0.8rem; padding: 10px;">Syncing ARC Network...</div>';
  
  const liveEvents = await fetchMapConditions();
  
  if (!liveEvents || liveEvents.length === 0) {
    eventsList.innerHTML = '<div style="color: var(--text-muted); font-size: 0.8rem; padding: 10px;">No Active Anomalies</div>';
    return;
  }

  eventsList.innerHTML = liveEvents.map(event => {
    const isMajor = event.name.toLowerCase().includes('hurricane'); // keep heuristic for styling
    const eventType = isMajor ? 'major' : 'minor';
    const endDate = new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Use the downloaded local high-fidelity icons
    const cleanName = event.name.toLowerCase().replace(/ /g, '_');
    const ext = cleanName === 'close_scrutiny' ? '.gif.webp' : '.png.webp';
    const localIcon = `/images/conditions/icon_${cleanName}${ext}`;

    return `
      <div class="event-item event-${eventType}" title="Ends at ${new Date(event.endTime).toLocaleString()}">
        <div class="event-icon-wrapper" style="width: 48px; height: 48px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: transparent; margin-right: 0.5rem; transition: all 0.2s;">
          <img src="${localIcon}" alt="${event.name}" onerror="this.src='${event.icon}'" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
        </div>
        <div class="event-details">
          <span class="event-name">${event.name}</span>
          <span style="font-size: 0.65rem; color: var(--cyan); font-family: var(--font-mono);">${event.map} (Until ${endDate})</span>
        </div>
      </div>
    `;
  }).join('');
}

function renderSidebar(container) {
  // Use Phosphor icons (via SVG) or similar for nav links, matching ArcTracker's utilitarian aesthetic.
  const svgIcons = {
    brief: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256"><path fill="currentColor" d="M224,128a96,96,0,1,1-96-96A96,96,0,0,1,224,128Z" opacity="0.2"/><path fill="currentColor" d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm45.66-93.66a8,8,0,0,1-11.32,0L136,96V152a8,8,0,0,1-16,0V96l-26.34,26.34a8,8,0,0,1-11.32-11.32l40-40a8,8,0,0,1,11.32,0l40,40A8,8,0,0,1,173.66,122.34Z"/></svg>`,
    weapons: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256"><path fill="currentColor" d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm40-88a40,40,0,1,1-40-40A40,40,0,0,1,168,128Zm-16,0a24,24,0,1,1-24-24A24,24,0,0,1,152,128Zm-24-72a8,8,0,0,0-8,8V56a8,8,0,0,0,16,0V32A8,8,0,0,0,128,24ZM64,128a8,8,0,0,0-8-8H32a8,8,0,0,0,0,16H56A8,8,0,0,0,64,128Zm160-8h-24a8,8,0,0,0,0,16h24a8,8,0,0,0,0-16Zm-96,72a8,8,0,0,0-8,8v24a8,8,0,0,0,16,0V200A8,8,0,0,0,128,192Z"/></svg>`,
    trials: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256"><path fill="currentColor" d="M116,120H40a8,8,0,0,1-8-8V40a8,8,0,0,1,8-8h76a8,8,0,0,1,8,8v72A8,8,0,0,1,116,120ZM48,104h60V48H48Zm168,16h-76a8,8,0,0,1-8-8V40a8,8,0,0,1,8-8h76a8,8,0,0,1,8,8v72A8,8,0,0,1,216,120Zm-68-16h60V48H148Zm68,120H140a8,8,0,0,1-8-8V144a8,8,0,0,1,8-8h76a8,8,0,0,1,8,8v72A8,8,0,0,1,216,224Zm-68-16h60V152H148Zm-32,16H40a8,8,0,0,1-8-8V144a8,8,0,0,1,8-8h76a8,8,0,0,1,8,8v72A8,8,0,0,1,116,224Zm-68-16h60V152H48Z"/></svg>`,
    project: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-scroll-text"><path d="M15 12h-5"/><path d="M15 8h-5"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/></svg>`,
    history: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256"><path fill="currentColor" d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"/></svg>`,
    collapse: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256"><path fill="currentColor" d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"/></svg>`
  };

  const html = `
    <div class="sidebar-header">
      <div class="sidebar-logo">
        <span class="logo-accent">ARC</span> COMMAND
      </div>
      <button id="btn-collapse-sidebar" class="btn-icon" aria-label="Collapse Sidebar" title="Collapse Sidebar">
        ${svgIcons.collapse}
      </button>
    </div>

    <div class="sidebar-content">
      <!-- Map Events Module -->
      <div class="sidebar-module module-map-events">
        <h3 class="module-title">Map Conditions</h3>
        <div class="events-list">
          <!-- Populated by updateMapConditions -->
        </div>
      </div>

      <!-- Navigation Module -->
      <nav class="sidebar-nav">
        <button class="nav-item active" data-tab="tab-dashboard" title="Tactical Brief">
          <span class="nav-icon">${svgIcons.brief}</span>
          <span class="nav-label">Tactical Brief</span>
        </button>
        <button class="nav-item" data-tab="tab-weapons" title="Weapon Systems">
          <span class="nav-icon">${svgIcons.weapons}</span>
          <span class="nav-label">Weapon Systems</span>
        </button>
        <button class="nav-item" data-tab="tab-trials" title="Trials & Rank">
          <span class="nav-icon" style="display:flex;align-items:center;justify-content:center;"><img src="/images/Main_Page_Trials.png" alt="Trials" style="width:24px;height:24px;filter:invert(0.6) sepia(1) hue-rotate(180deg) saturate(0) brightness(1.2);transition:all 0.2s;" /></span>
          <span class="nav-label">Trials & Rank</span>
        </button>
        <button class="nav-item" data-tab="tab-blueprints" title="Blueprints">
          <span class="nav-icon">${svgIcons.project}</span>
          <span class="nav-label">Blueprints</span>
        </button>
        <button class="nav-item" data-tab="tab-history" title="Raid History">
          <span class="nav-icon">${svgIcons.history}</span>
          <span class="nav-label">Raid History</span>
        </button>
        
        <div class="sidebar-divider" style="height: 1px; background: var(--border-color); margin: 16px 20px;"></div>
        
        <div class="sidebar-label-group" style="padding: 0 24px; margin-bottom: 8px;">
          <span style="font-family: var(--font-mono); font-size: 0.6rem; color: var(--text-muted); letter-spacing: 1px;">SYSTEM LOGS</span>
        </div>
        
        <button class="nav-item" data-tab="tab-logs" data-log-type="roadmap" title="Roadmap">
          <span class="nav-icon" style="font-size: 14px;">🗺️</span>
          <span class="nav-label">Roadmap</span>
        </button>
        <button class="nav-item" data-tab="tab-logs" data-log-type="changes" title="Patch Notes">
          <span class="nav-icon" style="font-size: 14px;">🛠️</span>
          <span class="nav-label">Patch Notes</span>
        </button>
      </nav>
    </div>

    <!-- Player Profile Anchored at Bottom -->
    <div class="sidebar-footer">
      <div id="sidebar-controls-container" class="sidebar-controls">
        <!-- Populated by updateSidebarControls -->
      </div>
      <div class="player-profile-sidebar" id="sidebar-profile-container">
        <!-- Rendered via auth state eventually, mocked structure for now -->
        <div class="profile-avatar" style="background: transparent; border: none; padding: 0; display: flex; justify-content: center; align-items: center;">
          <img src="/images/TrialRank_Daredevil_III.png" alt="Daredevil III" style="width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 0 5px rgba(0, 255, 170, 0.4));" />
        </div>
        <div class="profile-info">
          <div class="profile-name">_paradroid</div>
          <div class="profile-rank" style="color: var(--neon-green); text-shadow: 0 0 5px var(--neon-green);">Daredevil III</div>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

export function updateSidebarControls() {
  const container = document.getElementById('sidebar-controls-container');
  if (!container) return;

  const rlRemaining = rateLimit.remaining;
  const rlTotal = rateLimit.limit;
  const rlClass = rlRemaining < 50 ? 'header__rate-limit--danger' : rlRemaining < 150 ? 'header__rate-limit--warning' : '';

  container.innerHTML = `
    <div class="header__rate-limit ${rlClass}">
      <span class="rate-limit-val">${rlRemaining}/${rlTotal}</span>
      <span class="rate-limit-label"> API</span>
    </div>
    <button class="header__refresh-btn" id="refresh-btn" title="Force Sync API">
      <span class="refresh-icon">⟳</span> <span class="refresh-label">SYNC</span>
    </button>
  `;
}

function attachEventListeners(container) {
  // Tab Switching
  const navItems = container.querySelectorAll('.nav-item');
  navItems.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Remove active class from all
      navItems.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetTabId = btn.getAttribute('data-tab');
      switchTab(targetTabId);

      if (targetTabId === 'tab-logs') {
        const logType = btn.getAttribute('data-log-type');
        import('./system-logs.js').then(module => {
          module.renderSystemLogs(document.getElementById('logs-panel-container'), logType);
        }).catch(err => console.error('Failed to load system logs module', err));
      }
    });
  });

  // Logo acts as home button
  const logo = container.querySelector('.sidebar-logo');
  if (logo) {
    logo.style.cursor = 'pointer';
    logo.addEventListener('click', () => {
      const dashboardBtn = container.querySelector('[data-tab="tab-dashboard"]');
      if (dashboardBtn) {
        dashboardBtn.click();
      }
    });
  }

  // Collapse Toggle
  const collapseBtn = container.querySelector('#btn-collapse-sidebar');
  if (collapseBtn) {
    collapseBtn.addEventListener('click', () => {
      document.body.classList.toggle('sidebar-collapsed');
    });
  }
}

function switchTab(tabId) {
  // Hide all main grids
  const grids = document.querySelectorAll('.main-grid');
  grids.forEach(grid => {
    grid.style.display = 'none';
  });

  // Show target
  const target = document.getElementById(tabId);
  if (target) {
    target.style.display = 'grid'; // Note: Raid history uses main-grid class which is display:grid
  }
}
