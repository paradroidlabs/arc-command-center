/**
 * Session Log Component
 * Recent raid history timeline, auto-populated from round data
 */

import { getSessionEvents, autoLogRounds } from '../../data/profile-state.js';

export function renderSessionLog(container, { rounds }) {
  // Auto-log new rounds
  if (rounds?.rounds) {
    autoLogRounds(rounds.rounds);
  }

  const events = getSessionEvents();
  const recentRounds = rounds?.rounds || [];

  // Combine: use round data directly for display (more reliable than session events)
  const displayEntries = recentRounds.slice(0, 10);

  container.innerHTML = `
    <div class="panel__header">
      <h2 class="panel__title"><span class="panel__title-icon">📋</span> SESSION LOG</h2>
      <span class="panel__badge panel__badge--cyan">${displayEntries.length} RECENT</span>
    </div>
    <div class="session-log__entries">
      ${displayEntries.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state__icon">📡</div>
          <p>No recent raid data.</p>
        </div>
      ` : displayEntries.map((round, i) => renderEntry(round, i)).join('')}
    </div>
  `;

  // Make the entire panel clickable to go to Raid History
  container.style.cursor = 'pointer';
  container.onclick = () => {
    const historyBtn = document.querySelector('#sidebar [data-tab="tab-history"]');
    if (historyBtn) historyBtn.click();
  };
}

function renderEntry(round, index) {
  const isExtracted = round.outcome === 'extracted';
  const icon = isExtracted ? '🚀' : '💀';
  const statusClass = isExtracted ? 'session-entry--extracted' : 'session-entry--died';

  const durationMin = Math.round(round.durationMs / 60000);
  const netStr = round.netValue >= 0
    ? `+${round.netValue.toLocaleString()}`
    : round.netValue.toLocaleString();
  const netColor = round.netValue >= 0 ? 'var(--green)' : 'var(--red)';

  const timeAgo = getTimeAgo(round.roundEndedAt);

  return `
    <div class="session-entry ${statusClass}" style="animation-delay: ${index * 50}ms">
      <div class="session-entry__icon">${icon}</div>
      <div class="session-entry__content">
        <div class="session-entry__map">${round.mapName}</div>
        <div class="session-entry__detail">
          ${isExtracted ? 'Extracted' : 'KIA'} — 
          <span style="color: ${netColor}; font-weight: 600; font-family: var(--font-mono);">${netStr}</span> credits
          ${round.arcKills > 0 ? ` · ${round.arcKills} ARC kills` : ''}
          · ${durationMin}m
          ${round.score > 0 ? ` · ${round.score.toLocaleString()} pts` : ''}
        </div>
      </div>
      <div class="session-entry__time">${timeAgo}</div>
    </div>
  `;
}

function getTimeAgo(dateStr) {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return `${diffDays}d ago`;
}
