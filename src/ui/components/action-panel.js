/**
 * Action Panel — Mission Brief
 * The hero component: prioritized action recommendations
 */

let isExpanded = false;

export function renderActionPanel(container, actions) {
  if (!actions || actions.length === 0) {
    container.innerHTML = `
      <div class="panel__header">
        <h2 class="panel__title"><span class="panel__title-icon">📡</span> MISSION BRIEF</h2>
      </div>
      <div class="empty-state">
        <div class="empty-state__icon">✅</div>
        <p>All objectives clear. You're free to roam, Raider.</p>
      </div>
    `;
    return;
  }

  const primary = actions[0];
  const allSecondary = actions.slice(1);
  const visibleSecondary = isExpanded ? allSecondary : allSecondary.slice(0, 3);
  const hiddenCount = allSecondary.length - visibleSecondary.length;

  const getRoute = (type) => {
    if (type === 'trials') return 'tab-trials';
    if (type === 'blueprint') return 'tab-blueprints';
    return null;
  };

  container.innerHTML = `
    <div class="panel__header">
      <h2 class="panel__title"><span class="panel__title-icon">📡</span> MISSION BRIEF</h2>
      <span class="panel__badge panel__badge--amber">${actions.length} OBJECTIVES</span>
    </div>
    
    <div class="mission-card mission-card--priority" ${getRoute(primary.type) ? `data-route="${getRoute(primary.type)}" style="cursor:pointer;"` : ''}>
      <div class="mission-card__priority-tag">
        <span class="pulse-dot"></span> PRIORITY #1
      </div>
      <h3 class="mission-card__title">${primary.icon} ${primary.title}</h3>
      <p class="mission-card__reason">${primary.reason}</p>
      ${renderMetaTags(primary)}
      ${renderTips(primary.tips)}
    </div>
    
    ${visibleSecondary.length > 0 ? `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-bottom: 16px;">
        ${visibleSecondary.map((action, i) => `
          <div class="mission-card" ${getRoute(action.type) ? `data-route="${getRoute(action.type)}" style="cursor:pointer;"` : ''}>
            <div class="mission-card__priority-tag" style="color: var(--text-muted);">
              PRIORITY #${i + 2}
            </div>
            <h3 class="mission-card__title" style="font-size: 0.95rem;">${action.icon} ${action.title}</h3>
            <p class="mission-card__reason" style="font-size: 0.8rem;">${action.reason}</p>
            ${renderMetaTags(action)}
          </div>
        `).join('')}
      </div>
    ` : ''}

    ${hiddenCount > 0 ? `
      <button id="btn-toggle-objectives" class="header__refresh-btn" style="width: 100%; justify-content: center; margin-top: 8px;">
        SHOW ${hiddenCount} MORE OBJECTIVES ▼
      </button>
    ` : ''}
    
    ${isExpanded && allSecondary.length > 3 ? `
      <button id="btn-toggle-objectives" class="header__refresh-btn" style="width: 100%; justify-content: center; margin-top: 8px;">
        COLLAPSE ▲
      </button>
    ` : ''}
  `;

  // Attach event listener to the toggle button
  const toggleBtn = container.querySelectorAll('#btn-toggle-objectives');
  toggleBtn.forEach(btn => btn.addEventListener('click', () => {
    isExpanded = !isExpanded;
    renderActionPanel(container, actions); // Re-render with new state
  }));

  // Attach event listeners for routing cards
  const routeCards = container.querySelectorAll('.mission-card[data-route]');
  routeCards.forEach(card => {
    card.addEventListener('click', () => {
      const tabId = card.getAttribute('data-route');
      const sidebarNavBtn = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
      if (sidebarNavBtn) sidebarNavBtn.click();
    });
  });
}

function renderMetaTags(action) {
  const tags = [];
  if (action.type) tags.push(`<span class="mission-card__meta-tag">TYPE: <span class="tag-highlight">${action.type.toUpperCase()}</span></span>`);
  if (action.project) tags.push(`<span class="mission-card__meta-tag">PROJECT: <span class="tag-highlight">${action.project}</span></span>`);
  if (action.progress) tags.push(`<span class="mission-card__meta-tag">PROGRESS: <span class="tag-highlight">${action.progress}</span></span>`);
  if (action.trader) tags.push(`<span class="mission-card__meta-tag">TRADER: <span class="tag-highlight">${action.trader}</span></span>`);
  if (action.urgency === 'critical') tags.push(`<span class="mission-card__meta-tag" style="border-color: var(--red); color: var(--red);">⚠ CRITICAL</span>`);
  if (action.urgency === 'warning') tags.push(`<span class="mission-card__meta-tag" style="border-color: var(--amber); color: var(--amber);">⚡ WARNING</span>`);
  if (action.safePocketItems) {
    action.safePocketItems.forEach(item => {
      tags.push(`<span class="mission-card__meta-tag">🔒 ${item.name}</span>`);
    });
  }
  if (tags.length === 0) return '';
  return `<div class="mission-card__meta">${tags.join('')}</div>`;
}

function renderTips(tips) {
  if (!tips || tips.length === 0) return '';
  return `
    <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-dim);">
      ${tips.slice(0, 2).map(t => `
        <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 4px; font-family: var(--font-mono);">
          💡 <span style="color: var(--cyan);">${t.creator}:</span> ${t.tip}
        </p>
      `).join('')}
    </div>
  `;
}
