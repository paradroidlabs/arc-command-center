/**
 * Project Tracker Component
 * Shows active projects with phase progress and item requirements
 */

export function renderProjectTracker(container, { projects }) {
  if (!projects?.projects || projects.projects.length === 0) {
    container.innerHTML = `
      <div class="panel__header">
        <h2 class="panel__title"><span class="panel__title-icon">🔧</span> PROJECTS</h2>
      </div>
      <div class="empty-state">
        <div class="empty-state__icon">📋</div>
        <p>No project data available.</p>
      </div>
    `;
    return;
  }

  let activeProjects = projects.projects.filter(p => !p.fullyCompleted);

  // Clean up expedition display - only show the most progressed one
  const expeditions = activeProjects.filter(p => p.id.includes('expedition'));
  if (expeditions.length > 0) {
    const activeExpedition = expeditions.reduce((prev, curr) => 
      (prev.completedPhases > curr.completedPhases) ? prev : curr
    );
    activeProjects = activeProjects.filter(p => !p.id.includes('expedition') || p.id === activeExpedition.id);
  }

  container.innerHTML = `
    <div class="panel__header">
      <h2 class="panel__title"><span class="panel__title-icon">🔧</span> PROJECTS</h2>
      <span class="panel__badge panel__badge--cyan">${activeProjects.length} ACTIVE</span>
    </div>
    ${activeProjects.map(project => renderProjectCard(project)).join('')}
  `;
}

function renderProjectCard(project) {
  const progressPct = project.totalPhases > 0
    ? Math.round((project.completedPhases / project.totalPhases) * 100)
    : 0;
  const fillClass = progressPct < 30 ? 'project-card__progress-fill--low' : '';

  // Find current active phase
  const activePhase = project.phases.find(p => !p.completed);
  let phaseName = activePhase ? activePhase.name : 'Complete';

  // Special case: Expedition waiting for window
  const isWaitingForWindow = project.id.includes('expedition') && project.completedPhases === 5;
  if (isWaitingForWindow) {
    phaseName = 'Window Pending';
  }

  return `
    <div class="project-card">
      <div class="project-card__name">${project.name}</div>
      <div class="project-card__phase">Phase ${project.completedPhases + 1}/${project.totalPhases} — ${phaseName}</div>
      <div class="project-card__progress-bar">
        <div class="project-card__progress-fill ${fillClass}" style="width: ${isWaitingForWindow ? 100 : Math.max(progressPct, 3)}%"></div>
      </div>
      ${isWaitingForWindow ? renderWindowWait() : (activePhase ? renderRequirements(activePhase) : '')}
    </div>
  `;
}

function renderRequirements(phase) {
  const items = phase.requirements || [];
  const categories = phase.categoryRequirements || [];

  if (items.length === 0 && categories.length === 0) {
    return `
      <div class="project-card__requirements">
        <div class="req-item">
          <span class="req-item__name">Complete objective to progress</span>
        </div>
      </div>
    `;
  }

  const renderedItems = items.map(req => {
    const name = req.itemId.replace(/_/g, ' ').toUpperCase();
    const have = req.submitted || 0;
    const need = req.required;
    const countClass = have === 0 ? 'req-item__count--zero' : have >= need ? 'req-item__count--have' : 'req-item__count--need';
    return `
      <div class="req-item">
        <span class="req-item__name">${name}</span>
        <span class="req-item__count ${countClass}">${have}/${need}</span>
      </div>
    `;
  });

  const renderedCategories = categories.map(req => {
    // Split camelCase category name if needed
    const name = req.category.replace(/([A-Z])/g, ' $1').trim().toUpperCase();
    const have = req.submitted || 0;
    const need = req.required;
    const countClass = have === 0 ? 'req-item__count--zero' : have >= need ? 'req-item__count--have' : 'req-item__count--need';
    return `
      <div class="req-item">
        <span class="req-item__name">${name}</span>
        <span class="req-item__count ${countClass}">${have.toLocaleString()}/${need.toLocaleString()}</span>
      </div>
    `;
  });

  return `
    <div class="project-card__requirements">
      ${[...renderedItems, ...renderedCategories].join('')}
    </div>
  `;
}

function renderWindowWait() {
  return `
    <div class="project-card__requirements">
      <div class="req-item">
        <span class="req-item__name" style="color: var(--color-cyan);">EXPEDITION PREPARED</span>
        <span class="req-item__count req-item__count--have">STANDBY</span>
      </div>
      <div class="req-item" style="margin-top: 4px; font-size: 0.8rem; opacity: 0.8;">
        Waiting for the expedition window to open.
      </div>
    </div>
  `;
}
