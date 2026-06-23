export function renderBlueprintShortcut(container, { blueprints }) {
  if (!container) return;
  
  let unlocked = 0;
  let total = 0;
  let missing = 0;
  
  if (blueprints && blueprints.blueprints) {
    total = blueprints.blueprints.length;
    unlocked = blueprints.blueprints.filter(bp => bp.learned).length;
    missing = total - unlocked;
  }
  
  const pct = total > 0 ? Math.round((unlocked / total) * 100) : 0;
  
  container.innerHTML = `
    <div class="panel__header">
      <h2 class="panel__title">
        <span class="panel__title-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 12h-5"/><path d="M15 8h-5"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/></svg>
        </span>
        BLUEPRINTS ARCHIVE
      </h2>
    </div>
    
    <div style="padding: 12px; background: rgba(0, 240, 255, 0.03); border-radius: 8px; border: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between;">
      <div style="flex: 1; margin-right: 16px;">
        <div style="font-family: var(--font-display); font-size: 0.9rem; font-weight: 600; color: var(--text-primary); margin-bottom: 8px; display: flex; justify-content: space-between;">
          <span>Engineering Schematics</span>
          <span style="color: var(--cyan); font-family: var(--font-mono); font-size: 0.8rem;">${pct}%</span>
        </div>
        
        <div style="width: 100%; background: var(--bg-surface); height: 4px; border-radius: 2px; overflow: hidden; margin-bottom: 8px;">
          <div style="width: ${pct}%; height: 100%; background: var(--cyan); box-shadow: 0 0 8px var(--cyan);"></div>
        </div>
        
        <div style="display: flex; gap: 12px; font-family: var(--font-mono); font-size: 0.65rem;">
          <div style="color: var(--cyan);"><span style="color: var(--text-muted);">ACQUIRED:</span> ${unlocked}</div>
          <div style="color: var(--amber);"><span style="color: var(--text-muted);">MISSING:</span> ${missing}</div>
        </div>
      </div>
      <button class="blueprint-link-btn" style="background: var(--cyan-dim); color: var(--cyan); border: 1px solid var(--cyan); border-radius: 4px; padding: 6px 12px; cursor: pointer; font-family: var(--font-mono); font-size: 0.75rem; font-weight: 600; display: flex; align-items: center; gap: 6px; transition: all 0.2s;">
        VIEW 
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
      </button>
    </div>
  `;

  const btn = container.querySelector('.blueprint-link-btn');
  if (btn) {
    btn.addEventListener('click', () => {
      const blueprintsTab = document.querySelector('.nav-item[data-tab="tab-blueprints"]');
      if (blueprintsTab) blueprintsTab.click();
    });
    
    btn.addEventListener('mouseenter', () => {
      btn.style.background = 'var(--cyan)';
      btn.style.color = '#000';
      btn.style.boxShadow = 'var(--shadow-glow-cyan)';
    });
    
    btn.addEventListener('mouseleave', () => {
      btn.style.background = 'var(--cyan-dim)';
      btn.style.color = 'var(--cyan)';
      btn.style.boxShadow = 'none';
    });
  }
}
