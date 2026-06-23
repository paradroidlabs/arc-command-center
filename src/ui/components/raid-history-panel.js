import { computeHistoryStats } from '../../data/history-stats.js';
import { renderNetValueGraph } from './charts.js';

let currentRaidLimit = 50;

export function renderRaidHistoryPanel(container, { rounds }) {
  const stats = computeHistoryStats(rounds);

  if (!stats) {
    container.innerHTML = `
      <div class="panel__header">
        <h2 class="panel__title"><span class="panel__title-icon">📊</span> RAID HISTORY</h2>
      </div>
      <div class="empty-state">
        <div class="empty-state__icon">⚠️</div>
        <p>No round data available to generate history.</p>
      </div>
    `;
    return;
  }

  const { overview, mapStatsArray, enemiesArray, weaponsArray, historyChart } = stats;

  const formatCredits = (val) => {
    if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
    if (val >= 1000) return (val / 1000).toFixed(0) + 'K';
    return val.toString();
  };

  container.innerHTML = `
    <div class="panel__header">
      <h2 class="panel__title"><span class="panel__title-icon">📊</span> RAID HISTORY</h2>
      <span class="panel__badge panel__badge--cyan">LIFETIME DATA</span>
    </div>

    <!-- Top Stats Overview -->
    <div class="history-stat-grid">
      <div class="history-stat-box">
        <span class="history-stat-label">TIME TOPSIDE</span>
        <span class="history-stat-val">${overview.timeTopside}</span>
      </div>
      <div class="history-stat-box">
        <span class="history-stat-label">TOTAL RAIDS</span>
        <span class="history-stat-val">${overview.totalRaids}</span>
      </div>
      <div class="history-stat-box">
        <span class="history-stat-label">SURVIVAL RATE</span>
        <span class="history-stat-val" style="color: var(--green);">${overview.survivalRate}</span>
      </div>
      <div class="history-stat-box">
        <span class="history-stat-label">ARC DESTROYED</span>
        <span class="history-stat-val">${overview.arcEnemiesDestroyed.toLocaleString()}</span>
      </div>
      <div class="history-stat-box">
        <span class="history-stat-label">VALUE EXTRACTED</span>
        <span class="history-stat-val" style="color: var(--cyan);">${formatCredits(overview.totalValueExtracted)}</span>
      </div>
      <div class="history-stat-box">
        <span class="history-stat-label">NET PROFIT/LOSS</span>
        <span class="history-stat-val" style="color: var(--cyan);">+${formatCredits(overview.netProfit)}</span>
      </div>
      <div class="history-stat-box">
        <span class="history-stat-label">AVG PROFIT/EXT</span>
        <span class="history-stat-val">${formatCredits(overview.avgProfit)}</span>
      </div>
      <div class="history-stat-box">
        <span class="history-stat-label">PLAYER KILLS</span>
        <span class="history-stat-val" style="color: var(--amber);">${overview.playerKills}</span>
      </div>
      <div class="history-stat-box">
        <span class="history-stat-label">CONTAINERS LOOTED</span>
        <span class="history-stat-val">${overview.containersLooted?.toLocaleString() || 0}</span>
      </div>
      <div class="history-stat-box">
        <span class="history-stat-label">CONTAINERS / RAID</span>
        <span class="history-stat-val">${overview.containersPerRaid || 0}</span>
      </div>
    </div>

    <!-- Main Content Layout -->
    <div class="history-main-layout">
      <!-- Row 1: Graph & Map Stats -->
      <div class="history-section">
        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 12px;">
          <h3 class="history-section__title" style="margin-bottom: 0; display: flex; align-items: center; gap: 8px;">
            RAID VALUE HISTORY
            <div class="info-tooltip-container">
              <span class="info-icon">i</span>
              <div class="info-tooltip-content">
                <div style="font-weight: 600; margin-bottom: 8px; color: #fff;">How to read this graph</div>
                <div style="margin-bottom: 4px;"><span style="color: var(--cyan);">■</span> <strong>Up (Cyan):</strong> Positive Net Value (Extracted more than brought in)</div>
                <div style="margin-bottom: 4px;"><span style="color: var(--amber);">■</span> <strong>Down (Amber):</strong> Negative Net Value (KIA or lost value)</div>
                <div style="margin-top: 8px; font-style: italic; color: var(--text-muted);">Hover over any bar for a detailed breakdown.</div>
              </div>
            </div>
          </h3>
          <div class="raid-limit-toggle" style="display: flex; gap: 8px; font-family: var(--font-mono); font-size: 0.75rem;">
            <button class="limit-btn" data-limit="25" style="background: ${currentRaidLimit === 25 ? 'var(--amber)' : 'transparent'}; color: ${currentRaidLimit === 25 ? '#111' : 'var(--text-muted)'}; border: 1px solid var(--border-color); border-radius: 4px; padding: 2px 8px; cursor: pointer;">Last 25</button>
            <button class="limit-btn" data-limit="50" style="background: ${currentRaidLimit === 50 ? 'var(--amber)' : 'transparent'}; color: ${currentRaidLimit === 50 ? '#111' : 'var(--text-muted)'}; border: 1px solid var(--border-color); border-radius: 4px; padding: 2px 8px; cursor: pointer;">Last 50</button>
            <button class="limit-btn" data-limit="100" style="background: ${currentRaidLimit === 100 ? 'var(--amber)' : 'transparent'}; color: ${currentRaidLimit === 100 ? '#111' : 'var(--text-muted)'}; border: 1px solid var(--border-color); border-radius: 4px; padding: 2px 8px; cursor: pointer;">Last 100</button>
          </div>
        </div>
        ${renderNetValueGraph(historyChart.slice(-currentRaidLimit))}
      </div>
      
      <div class="history-section">
        <h3 class="history-section__title">PERFORMANCE BY MAP</h3>
        <table class="map-performance-table">
          <thead>
            <tr>
              <th>Map</th>
              <th>Raids</th>
              <th>SR %</th>
              <th>Avg Value</th>
            </tr>
          </thead>
          <tbody>
            ${(mapStatsArray || []).map(m => `
              <tr>
                <td>${m.map || m.mapName || 'Unknown'}</td>
                <td>${m.total}</td>
                <td style="color: ${m.sr >= 50 || m.survivalRate >= 50 ? 'var(--green)' : 'var(--red)'}">${m.sr || m.survivalRate || 0}%</td>
                <td style="font-family: var(--font-mono);">${formatCredits(m.avgValue || m.netValue || 0)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Row 2: Enemies & Weapons -->
      <div class="history-section">
        <h3 class="history-section__title">ARC ENEMIES DESTROYED</h3>
        ${renderBarChart(enemiesArray || [], 'var(--amber)')}
      </div>

      <div class="history-section">
        <h3 class="history-section__title">WEAPONS BY KILLS</h3>
        ${renderBarChart(weaponsArray || [], 'var(--cyan)')}
      </div>
    </div>

    <!-- Raid Log List -->
    <div class="history-section" style="margin-top: 2rem;">
      <h3 class="history-section__title">RECENT RAIDS</h3>
      <div class="raid-log-list">
        ${renderRaidLogList(rounds)}
      </div>
    </div>
  `;

  // Attach listeners for the limit toggle
  container.querySelectorAll('.limit-btn').forEach(btn => {
    btn.onclick = () => {
      currentRaidLimit = parseInt(btn.dataset.limit, 10);
      renderRaidHistoryPanel(container, { rounds });
    };
  });
}

function renderBarChart(dataItems, highlightColor) {
  if (!dataItems || dataItems.length === 0) return '<div style="padding: 1rem; color: #666;">No data available.</div>';
  const max = Math.max(...dataItems.map(d => d.count || d.value || 1), 1);
  const bars = dataItems.map(d => {
    const val = d.count || d.value || 0;
    const label = d.name || d.label || 'Unknown';
    const pct = Math.max((val / max) * 100, 2);
    const color = highlightColor;
    return `
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
        <div style="width: 120px; text-align: right; font-size: 0.8rem; color: #aaa; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${label}</div>
        <div style="flex: 1; height: 12px; background: rgba(255,255,255,0.05); border-radius: 2px; overflow: hidden; position: relative;">
          <div style="width: ${pct}%; height: 100%; background: ${color}; border-radius: 2px;"></div>
        </div>
        <div style="width: 40px; font-size: 0.8rem; color: #fff; font-family: var(--font-mono);">${val.toLocaleString()}</div>
      </div>
    `;
  });
  return `<div>${bars.join('')}</div>`;
}

function renderRaidLogList(roundsObj) {
  if (!roundsObj || !roundsObj.rounds || roundsObj.rounds.length === 0) return '<div class="empty-state"><p>No recent raids found.</p></div>';
  
  const recent = roundsObj.rounds.slice(0, 20);
  
  const formatTime = (ms) => {
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    const dateOpts = { month: 'short', day: 'numeric', year: 'numeric' };
    const timeOpts = { hour: '2-digit', minute: '2-digit' };
    return `${d.toLocaleDateString('en-US', dateOpts)} <span style="opacity:0.6; margin-left:0.5rem">${d.toLocaleTimeString('en-US', timeOpts)}</span>`;
  };

  const formatNet = (val) => {
    if (val > 0) return `<span style="color: var(--green);">+${(val/1000).toFixed(0)}K</span>`;
    if (val < 0) return `<span style="color: var(--red);">${(val/1000).toFixed(0)}K</span>`;
    return '0';
  };

  return recent.map(r => `
    <div class="raid-log-item">
      <div class="raid-log-item__outcome ${r.outcome === 'extracted' ? 'outcome-extracted' : 'outcome-died'}">
        <span class="outcome-icon">${r.outcome === 'extracted' ? '✔' : '✖'}</span>
        ${r.outcome === 'extracted' ? 'Extracted' : 'Died'}
      </div>
      <div class="raid-log-item__map">${r.mapName || 'Unknown Map'}</div>
      <div class="raid-log-item__date">${formatDate(r.roundEndedAt)}</div>
      <div class="raid-log-item__net">${formatNet(r.netValue)}</div>
      <div class="raid-log-item__stats">
        <span>⏱ ${formatTime(r.durationMs)}</span>
        <span>🤖 ${r.arcKills} ARC</span>
        <span>⚡ ${r.damage?.toLocaleString() || 0} dmg</span>
      </div>
    </div>
  `).join('');
}
