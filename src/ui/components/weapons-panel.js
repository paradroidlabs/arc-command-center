export function renderWeaponsPanel(container, { loadout, rounds, items }) {
  if (!items || !items.items) {
    container.innerHTML = `
      <div class="panel__header">
        <h2 class="panel__title"><span class="panel__title-icon">⚔️</span> WEAPON SYSTEMS</h2>
      </div>
      <div class="empty-state">
        <div class="empty-state__icon">⚠️</div>
        <p>No weapon data available.</p>
      </div>
    `;
    return;
  }

  const allItems = items.items;
  // Filter for actual weapons (usually have Ammo or Damage type, or just whitelist known weapon types)
  const weaponsDb = allItems.filter(item => 
    item.type && (
      item.type.includes('Rifle') || 
      item.type.includes('Gun') || 
      item.type.includes('Launcher') || 
      item.type.includes('Pistol') ||
      item.type.includes('Sniper') ||
      item.type.includes('Shotgun') ||
      item.type.includes('SMG') ||
      item.type.includes('Hand Cannon')
    )
  );

  container.innerHTML = `
    <div class="panel__header">
      <h2 class="panel__title"><span class="panel__title-icon">⚔️</span> WEAPON SYSTEMS</h2>
      <span class="panel__badge panel__badge--cyan">DATABASE ONLINE</span>
    </div>
    
    <div class="weapons-layout">
      <!-- Left Column: Stats & Equipped -->
      <div class="weapons-sidebar">
        ${renderCombatStats(rounds)}
        ${renderEquipped(loadout, allItems)}
      </div>

      <!-- Right Column: Database -->
      <div class="weapons-main">
        ${renderDatabaseBrowser(weaponsDb)}
      </div>
    </div>
  `;

  bindBrowserEvents(container, weaponsDb);
}

function renderCombatStats(rounds) {
  if (!rounds || !rounds.rounds) return '';

  const allRounds = rounds.rounds;
  const totalRounds = allRounds.length;
  if (totalRounds === 0) return '';

  const totalDamage = allRounds.reduce((sum, r) => sum + (r.damage || 0), 0);
  const totalArcKills = allRounds.reduce((sum, r) => sum + (r.arcKills || 0), 0);
  const avgDamage = Math.round(totalDamage / totalRounds);

  return `
    <div class="stats-summary">
      <div class="stat-metric-card">
        <div>
          <div class="stat-metric-card__label">Total Damage</div>
          <div class="stat-metric-card__value" style="color: var(--amber);">${totalDamage.toLocaleString()}</div>
        </div>
        <div class="stat-metric-card__sub">Avg ${avgDamage.toLocaleString()}</div>
      </div>
      <div class="stat-metric-card">
        <div>
          <div class="stat-metric-card__label">Total Kills</div>
          <div class="stat-metric-card__value" style="color: var(--cyan);">${totalArcKills.toLocaleString()}</div>
        </div>
        <div class="stat-metric-card__sub">Avg ${(totalArcKills / totalRounds).toFixed(1)}</div>
      </div>
    </div>
  `;
}

function renderEquipped(loadout, allItems) {
  if (!loadout || !loadout.loadout) return '';

  const equippedItems = [
    { label: 'Primary', ...loadout.loadout.weapon1 },
    { label: 'Secondary', ...loadout.loadout.weapon2 },
  ].filter(w => w && w.itemId);

  if (equippedItems.length === 0) return '';

  return `
    <div class="equipped-arsenal">
      <h3 style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-muted); margin-bottom: 8px;">EQUIPPED ARSENAL</h3>
      ${equippedItems.map(wpn => {
        // Find base stats in items db
        const baseItem = allItems.find(i => i.id === wpn.itemId) || {};
        const rawName = baseItem.name ? (baseItem.name.en || baseItem.name) : (wpn.itemId || '');
        const name = String(rawName).replace('weapon_', '').replace(/_/g, ' ');
        const level = wpn.level || 1;
        
        const ammo = (baseItem.effects && baseItem.effects['Ammo Type']) ? baseItem.effects['Ammo Type'].value : (baseItem.ammoType || 'N/A');
        const mag = (baseItem.effects && baseItem.effects['Magazine Size']) ? baseItem.effects['Magazine Size'].value : (baseItem.magazineSize || 'N/A');
        const mode = (baseItem.effects && baseItem.effects['Firing Mode']) ? baseItem.effects['Firing Mode'].value : (baseItem.firingMode || 'N/A');

        return `
          <div class="weapon-card--equipped">
            <div class="weapon-card__header">
              <div>
                <div class="weapon-card__title">${name}</div>
                <div class="weapon-card__type">${baseItem.type || 'Unknown Type'}</div>
              </div>
              <div class="weapon-card__level">LVL ${level}</div>
            </div>
            <div class="weapon-stats-list">
              <div class="weapon-stat-item">
                <span class="weapon-stat-item__label">Ammo</span>
                <span class="weapon-stat-item__value">${ammo}</span>
              </div>
              <div class="weapon-stat-item">
                <span class="weapon-stat-item__label">Mag Size</span>
                <span class="weapon-stat-item__value">${mag}</span>
              </div>
              <div class="weapon-stat-item">
                <span class="weapon-stat-item__label">Fire Mode</span>
                <span class="weapon-stat-item__value">${mode}</span>
              </div>
              <div class="weapon-stat-item">
                <span class="weapon-stat-item__label">Condition</span>
                <span class="weapon-stat-item__value" style="color: var(--green);">${Math.round(wpn.durabilityPercent || 100)}%</span>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderDatabaseBrowser(weaponsDb) {
  return `
    <div class="weapon-browser">
      <div class="weapon-search-container">
        <input type="text" id="weapon-search" class="weapon-search-input" placeholder="Search weapons database..." />
        <select id="weapon-category" class="weapon-search-select">
          <option value="all">All Types</option>
          <option value="Assault Rifle">Assault Rifle</option>
          <option value="SMG">SMG</option>
          <option value="Sniper">Sniper</option>
          <option value="Shotgun">Shotgun</option>
          <option value="Hand Cannon">Hand Cannon</option>
        </select>
      </div>
      <div id="weapon-db-grid" class="weapon-db-grid">
        ${renderWeaponCards(weaponsDb)}
      </div>
    </div>
  `;
}

function renderWeaponCards(weapons) {
  return weapons.map(w => {
    const name = w.name ? (w.name.en || w.name) : w.id;
    const ammo = (w.effects && w.effects['Ammo Type']) ? w.effects['Ammo Type'].value : w.ammoType;
    const mag = (w.effects && w.effects['Magazine Size']) ? w.effects['Magazine Size'].value : w.magazineSize;
    const mode = (w.effects && w.effects['Firing Mode']) ? w.effects['Firing Mode'].value : w.firingMode;
    const pen = (w.effects && w.effects['ARC Armor Penetration']) ? w.effects['ARC Armor Penetration'].value : w.armorPenetration;

    return `
    <div class="weapon-db-card">
      <div class="weapon-db-card__title">${name}</div>
      <div class="weapon-db-card__type">${w.type || 'Weapon'}</div>
      <div class="weapon-db-card__stats">
        ${ammo ? `<div class="weapon-db-stat">Ammo: <strong>${ammo}</strong></div>` : ''}
        ${mag ? `<div class="weapon-db-stat">Mag: <strong>${mag}</strong></div>` : ''}
        ${mode ? `<div class="weapon-db-stat">Mode: <strong>${mode}</strong></div>` : ''}
        ${pen ? `<div class="weapon-db-stat">Pen: <strong>${pen}</strong></div>` : ''}
      </div>
    </div>
    `;
  }).join('');
}

function bindBrowserEvents(container, weaponsDb) {
  const searchInput = container.querySelector('#weapon-search');
  const catSelect = container.querySelector('#weapon-category');
  const grid = container.querySelector('#weapon-db-grid');

  if (!searchInput || !catSelect || !grid) return;

  function filter() {
    const q = searchInput.value.toLowerCase();
    const cat = catSelect.value;
    
    const filtered = weaponsDb.filter(w => {
      const wName = w.name ? (w.name.en || w.name) : w.id;
      const matchName = String(wName).toLowerCase().includes(q);
      const matchCat = cat === 'all' || (w.type && w.type.includes(cat));
      return matchName && matchCat;
    });

    grid.innerHTML = renderWeaponCards(filtered);
  }

  searchInput.addEventListener('input', filter);
  catSelect.addEventListener('change', filter);
}
