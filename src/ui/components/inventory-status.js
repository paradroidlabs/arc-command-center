/**
 * Inventory Status Component
 * Stash capacity, backpack, safe pocket, currencies
 */

export function renderInventoryStatus(container, { stash, loadout }) {
  const stashUsed = stash?.slots?.used || 0;
  const stashMax = stash?.slots?.max || 208;
  const stashPct = Math.round((stashUsed / stashMax) * 100);

  const backpackSlots = loadout?.loadout?.slotCounts?.backpack || 20;
  const backpackItems = loadout?.loadout?.backpack?.length || 0;
  const backpackPct = Math.round((backpackItems / backpackSlots) * 100);
  const backpackFull = backpackItems >= backpackSlots;

  const safePocket = loadout?.loadout?.safePocket || [];
  const safePocketMax = loadout?.loadout?.slotCounts?.safePocket || 3;

  const currencies = stash?.currencies || {};

  const stashFillClass = stashPct >= 90 ? 'inventory-bar__fill--warning' : '';
  const backpackFillClass = backpackFull ? 'inventory-bar__fill--full' : backpackPct >= 80 ? 'inventory-bar__fill--warning' : '';

  container.innerHTML = `
    <div class="panel__header">
      <h2 class="panel__title"><span class="panel__title-icon">📦</span> INVENTORY</h2>
      ${backpackFull ? '<span class="panel__badge panel__badge--red">FULL</span>' : ''}
    </div>

    <div class="inventory-bar">
      <div class="inventory-bar__label">
        <span class="inventory-bar__label-text">Stash</span>
        <span class="inventory-bar__label-count" style="color: ${stashPct >= 90 ? 'var(--amber)' : 'var(--cyan)'}">${stashUsed} / ${stashMax}</span>
      </div>
      <div class="inventory-bar__track">
        <div class="inventory-bar__fill ${stashFillClass}" style="width: ${stashPct}%"></div>
      </div>
    </div>

    <div class="inventory-bar">
      <div class="inventory-bar__label">
        <span class="inventory-bar__label-text">${backpackFull ? '⚠️ Backpack' : 'Backpack'}</span>
        <span class="inventory-bar__label-count" style="color: ${backpackFull ? 'var(--red)' : 'var(--text-secondary)'}">${backpackItems} / ${backpackSlots}</span>
      </div>
      <div class="inventory-bar__track">
        <div class="inventory-bar__fill ${backpackFillClass}" style="width: ${backpackPct}%"></div>
      </div>
    </div>

    <div class="inventory-section">
      <div class="inventory-section__title">Safe Pocket (${safePocket.length}/${safePocketMax})</div>
      <div class="inventory-items">
        ${safePocket.map(item => `
          <div class="inventory-item">
            <span class="inventory-item__qty">🔒</span>
            ${item.name}
          </div>
        `).join('')}
        ${safePocket.length === 0 ? '<div class="inventory-item" style="color: var(--text-muted);">Empty</div>' : ''}
      </div>
    </div>

    <div class="currencies-row">
      <div class="currency-chip">
        <span class="currency-chip__icon">💰</span>
        <span class="currency-chip__value">${(currencies.credits || 0).toLocaleString()}</span>
        Credits
      </div>
      <div class="currency-chip">
        <span class="currency-chip__icon">🪙</span>
        <span class="currency-chip__value">${(currencies.cred || 0).toLocaleString()}</span>
        Cred
      </div>
      <div class="currency-chip">
        <span class="currency-chip__icon">🎖️</span>
        <span class="currency-chip__value">${(currencies.raiderTokens || 0).toLocaleString()}</span>
        Tokens
      </div>
    </div>
  `;
}
