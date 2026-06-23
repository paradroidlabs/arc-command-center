/**
 * Quest Tracker Component
 * Incomplete quests grouped by trader
 */

export function renderQuestTracker(container, { quests }) {
  if (!quests?.quests) {
    container.innerHTML = `
      <div class="panel__header">
        <h2 class="panel__title"><span class="panel__title-icon">📜</span> QUESTS</h2>
      </div>
      <div class="empty-state">
        <div class="empty-state__icon">📋</div>
        <p>No quest data available.</p>
      </div>
    `;
    return;
  }

  const incomplete = quests.quests.filter(q => !q.completed);
  const total = quests.summary?.total || 0;
  const completed = quests.summary?.completed || 0;

  // Group by trader
  const byTrader = {};
  for (const q of incomplete) {
    if (!byTrader[q.trader]) byTrader[q.trader] = [];
    byTrader[q.trader].push(q);
  }

  const traderEntries = Object.entries(byTrader).sort((a, b) => b[1].length - a[1].length);

  container.innerHTML = `
    <div class="panel__header">
      <h2 class="panel__title"><span class="panel__title-icon">📜</span> QUESTS</h2>
      <span class="panel__badge panel__badge--cyan">${completed}/${total}</span>
    </div>
    
    <div style="margin-bottom: 12px;">
      <div class="project-card__progress-bar">
        <div class="project-card__progress-fill" style="width: ${total > 0 ? Math.round((completed / total) * 100) : 0}%"></div>
      </div>
    </div>

    <div class="quest-list">
      ${traderEntries.map(([trader, quests]) => `
        <div class="quest-item">
          <div>
            <div class="quest-item__name">${trader}</div>
          </div>
          <div class="quest-item__trader">${quests.length} active</div>
        </div>
      `).join('')}
    </div>

    ${incomplete.length === 0 ? `
      <div class="empty-state" style="padding: 12px;">
        <p style="color: var(--green);">✅ All quests complete!</p>
      </div>
    ` : ''}
  `;
}
