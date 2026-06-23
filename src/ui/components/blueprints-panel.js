export function renderBlueprintsPanel(container, { blueprints, items }) {
  if (!blueprints || !blueprints.blueprints) {
    container.innerHTML = `
      <div class="panel__header">
        <h2 class="panel__title"><span class="panel__title-icon">📘</span> BLUEPRINTS ARCHIVE</h2>
      </div>
      <div class="empty-state">
        <div class="empty-state__icon">⚠️</div>
        <p>No blueprint data available.</p>
      </div>
    `;
    return;
  }

  // Parse categories from summary if available
  const summary = blueprints.summary || {};
  
  // Categorize raw blueprints
  const missing = [];
  const acquired = [];
  
  blueprints.blueprints.forEach(bp => {
    // A blueprint is missing if it's not learned.
    if (bp.learned) {
      acquired.push(bp);
    } else {
      missing.push(bp);
    }
  });

  // Group missing by category
  const missingByCategory = missing.reduce((acc, bp) => {
    const cat = bp.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(bp);
    return acc;
  }, {});

  // Group acquired by category
  const acquiredByCategory = acquired.reduce((acc, bp) => {
    const cat = bp.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(bp);
    return acc;
  }, {});

  function renderBlueprintCard(bp, isMissing) {
    // Find the item to get the image
    let imageUrl = '';
    if (items && items.items) {
      const item = items.items.find(i => i.id === bp.id);
      if (item && item.imageFilename) {
        imageUrl = item.imageFilename.startsWith('http') ? item.imageFilename : `https://cdn.arctracker.io/items/v2/${item.imageFilename}`;
      } else {
        // Fallback: construct it from id
        imageUrl = `https://cdn.arctracker.io/items/v2/${bp.id}.png`;
      }
    }

    const imageHtml = imageUrl ? `<div style="flex: 0 0 60px; margin-right: 12px;"><img src="${imageUrl}" style="width: 100%; border-radius: 4px; object-fit: contain;" alt="${bp.name}" /></div>` : '';

    return `
    <div class="mission-card ${isMissing ? '' : 'mission-card--completed'}" style="display: flex; align-items: center; padding: 12px;">
      ${imageHtml}
      <div>
        <h3 class="mission-card__title" style="font-size: 0.95rem;">
          ${isMissing ? '🔒' : '✅'} ${bp.name || bp.id}
        </h3>
        <p class="mission-card__reason" style="font-size: 0.8rem;">
          ${bp.category || 'Unknown Category'}
        </p>
        <div class="mission-card__meta">
          ${isMissing ? `<span class="mission-card__meta-tag" style="color: var(--amber); border-color: var(--amber);">MISSING</span>` : `<span class="mission-card__meta-tag" style="color: var(--cyan); border-color: var(--cyan);">ACQUIRED</span>`}
        </div>
      </div>
    </div>
    `;
  }

  container.innerHTML = `
    <div class="panel__header">
      <h2 class="panel__title"><span class="panel__title-icon">📘</span> BLUEPRINTS ARCHIVE</h2>
      <div class="header__controls">
        <div class="header__stat">
          <div class="header__stat-value header__stat-value--cyan">${acquired.length}</div>
          <div class="header__stat-label">ACQUIRED</div>
        </div>
        <div class="header__stat">
          <div class="header__stat-value header__stat-value--amber">${missing.length}</div>
          <div class="header__stat-label">MISSING</div>
        </div>
      </div>
    </div>

    <div style="margin-top: 24px;">
      <h3 style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px; border-bottom: 1px solid var(--border-dim); padding-bottom: 8px;">
        PRIORITY ACQUISITIONS (MISSING)
      </h3>
      ${missing.length > 0 ? `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px;">
          ${missing.map(bp => renderBlueprintCard(bp, true)).join('')}
        </div>
      ` : `
        <div class="empty-state" style="padding: 24px 0;">
          <p>All known blueprints acquired.</p>
        </div>
      `}
    </div>

    <div style="margin-top: 32px;">
      <h3 style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px; border-bottom: 1px solid var(--border-dim); padding-bottom: 8px;">
        ARCHIVED BLUEPRINTS (ACQUIRED)
      </h3>
      ${acquired.length > 0 ? `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px;">
          ${acquired.map(bp => renderBlueprintCard(bp, false)).join('')}
        </div>
      ` : `
        <div class="empty-state" style="padding: 24px 0;">
          <p>No blueprints acquired yet.</p>
        </div>
      `}
    </div>
  `;
}
