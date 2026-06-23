import { loadTrialsState, updateTrialProgress, updateRankDetails, updateTrialDetails, selectTrial, getHistoricalBest } from '../../data/trials-state.js';

// Helper to get dynamic Monday-reset remaining time
function getTimerValue() {
  const now = new Date();
  const nextReset = new Date();
  nextReset.setUTCHours(7, 0, 0, 0);
  const day = nextReset.getUTCDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  
  let daysToAdd = (8 - day) % 7;
  if (day === 1 && now.getUTCHours() >= 7) {
    daysToAdd = 7;
  }
  nextReset.setUTCDate(nextReset.getUTCDate() + daysToAdd);
  
  const diffMs = nextReset - now;
  if (diffMs <= 0) return '⏱ 0d:00h:00mn';
  
  const diffDays = Math.floor(diffMs / 86400000);
  const diffHrs = Math.floor((diffMs % 86400000) / 3600000);
  const diffMins = Math.floor((diffMs % 3600000) / 60000);
  
  return `⏱ ${diffDays}d:${diffHrs.toString().padStart(2, '0')}h:${diffMins.toString().padStart(2, '0')}mn`;
}

export function renderTrialsPanel() {
  const container = document.createElement('div');
  container.className = 'trials-panel';

  const state = loadTrialsState();

  const reRender = () => {
    const parent = container.parentElement;
    if (parent) {
      parent.innerHTML = '';
      parent.appendChild(renderTrialsPanel());
    }
  };

  // Create Header (Rank, Points, Position)
  const header = document.createElement('div');
  header.className = 'rank-header';
  
  header.innerHTML = `
    <div class="rank-shield"></div>
    <div class="rank-info edit-rank-title" style="cursor: pointer;" title="Click to edit rank title">
      <div class="label">CURRENT RANK</div>
      <div class="value">${state.rankTitle}</div>
    </div>
    <div class="rank-stats">
      <div class="stat-block edit-rank-points" style="cursor: pointer;" title="Click to edit rank points">
        <div class="label">RANK POINTS</div>
        <div class="value">${state.rankPoints.toLocaleString()}</div>
      </div>
      <div class="stat-block edit-rank-position" style="cursor: pointer;" title="Click to edit position">
        <div class="label">POSITION</div>
        <div class="value">${state.position} <span class="up-arrow">▲</span></div>
      </div>
    </div>
  `;

  // Bind Rank Edit handlers
  header.querySelector('.edit-rank-title').addEventListener('click', () => {
    const newTitle = prompt('Enter new Rank Title:', state.rankTitle);
    if (newTitle !== null && newTitle.trim() !== '') {
      updateRankDetails({ rankTitle: newTitle.trim().toUpperCase() });
      reRender();
    }
  });

  header.querySelector('.edit-rank-points').addEventListener('click', () => {
    const newPoints = prompt('Enter new Rank Points:', state.rankPoints);
    if (newPoints !== null && !isNaN(newPoints)) {
      updateRankDetails({ rankPoints: parseInt(newPoints, 10) });
      reRender();
    }
  });

  header.querySelector('.edit-rank-position').addEventListener('click', () => {
    const newPos = prompt('Enter new Leaderboard Position:', state.position);
    if (newPos !== null) {
      updateRankDetails({ position: newPos.trim() || '-' });
      reRender();
    }
  });

  container.appendChild(header);

  // Create Carousel of Cards
  const cardsContainer = document.createElement('div');
  cardsContainer.className = 'trials-carousel';

  state.trials.forEach(trial => {
    const card = document.createElement('div');
    card.className = `trial-card ${trial.id === state.selectedTrialId ? 'active' : ''}`;
    if (trial.id === state.selectedTrialId) {
        card.innerHTML += `<div class="card-highlight-bar"></div>`;
    }

    card.innerHTML += `
      <div class="card-image-wrapper">
        <img src="${trial.image}" alt="${trial.title}" />
      </div>
    `;

    card.addEventListener('click', () => {
        selectTrial(trial.id);
        reRender();
    });

    cardsContainer.appendChild(card);
  });
  container.appendChild(cardsContainer);

  // Bottom Section: Selected Trial Details & Progress Bar
  const selectedTrial = state.trials.find(t => t.id === state.selectedTrialId) || state.trials[0];
  const bottomSection = document.createElement('div');
  bottomSection.className = 'trial-details-footer';

  let milestoneHtml = '';
  const milestones = [1000, 2000, 3000];
  const milestoneColors = [
    { border: 'linear-gradient(135deg, #2d8a4e, #1a5c32)', glow: 'rgba(48, 209, 88, 0.3)' },   // green
    { border: 'linear-gradient(135deg, #3a8fd4, #2563a0)', glow: 'rgba(58, 143, 212, 0.3)' },   // blue  
    { border: 'linear-gradient(135deg, #a855f7, #7c3aed, #ec4899)', glow: 'rgba(168, 85, 247, 0.3)' }  // purple-pink
  ];
  milestones.forEach((m, idx) => {
    const isReached = selectedTrial.progress >= m;
    const starCount = idx + 1;
    const stars = '★'.repeat(starCount);
    const color = milestoneColors[idx];
    milestoneHtml += `
      <div class="milestone ${isReached ? 'reached' : ''}" data-tier="${idx}">
        <div class="milestone-circle" style="background: ${color.border}; ${isReached ? 'box-shadow: 0 0 12px ' + color.glow + ';' : ''}">
          <div class="milestone-circle-inner">
            <img src="/images/trial_chest_real.png" alt="Chest" class="milestone-chest-img" />
          </div>
          ${!isReached ? '<div class="milestone-locked-overlay"></div>' : ''}
        </div>
        <div class="milestone-stars ${isReached ? 'milestone-stars--lit' : ''}">${stars}</div>
        <div class="milestone-label">${m.toLocaleString()}</div>
      </div>
    `;
  });

  const progressPercent = Math.min((selectedTrial.progress / 3000) * 100, 100);

  bottomSection.innerHTML = `
    <div class="footer-left edit-trial-details" style="cursor: pointer;" title="Click to edit trial name & map">
      <div class="footer-title">${selectedTrial.title.toUpperCase()} <span style="font-size:0.8rem; opacity:0.6;">✏️</span></div>
      <div class="footer-desc">${selectedTrial.description}</div>
    </div>
    
    <div class="footer-middle">
      <div class="label">PERSONAL BEST</div>
      <div class="label sub">RANK POINTS</div>
      <div class="value edit-progress" style="cursor: pointer;" title="Click to manually update progress">${selectedTrial.progress.toLocaleString()}</div>
    </div>
    
    <div class="footer-right">
      <div class="progress-track-container">
        <div class="progress-bar-bg"></div>
        <div class="progress-bar-fill" style="width: ${progressPercent}%;"></div>
        <div class="milestones-container">
          ${milestoneHtml}
        </div>
      </div>
    </div>
  `;

  // Click handler to edit trial details (name & description)
  bottomSection.querySelector('.edit-trial-details').addEventListener('click', () => {
    const newTitle = prompt('Enter new Trial Title:', selectedTrial.title);
    if (newTitle === null || newTitle.trim() === '') return;
    
    const newDesc = prompt('Enter map / description (e.g. SPACEPORT, AVAILABLE ON ALL MAPS):', selectedTrial.description);
    if (newDesc === null) return;
    
    updateTrialDetails(selectedTrial.id, {
      title: newTitle.trim(),
      description: newDesc.trim().toUpperCase()
    });
    reRender();
  });

  // Click handler to update progress
  const editProgressBtn = bottomSection.querySelector('.edit-progress');
  editProgressBtn.addEventListener('click', () => {
      const newScore = prompt(`Enter new progress score for "${selectedTrial.title}":`, selectedTrial.progress);
      if (newScore !== null && !isNaN(newScore)) {
          updateTrialProgress(selectedTrial.id, parseInt(newScore, 10));
          reRender();
      }
  });

  container.appendChild(bottomSection);

  // Trial Advisor Logic
  if (selectedTrial.advisorData) {
    const adv = selectedTrial.advisorData;
    const nextMilestone = adv.milestones.find(m => m.points > selectedTrial.progress);
    
    let milestoneInsight = '';
    if (nextMilestone) {
      const pointsNeeded = nextMilestone.points - selectedTrial.progress;
      const actionsNeeded = Math.ceil(pointsNeeded / adv.pointsPerAction);
      milestoneInsight = `To reach ${nextMilestone.stars} Star(s), you need <strong>${pointsNeeded.toLocaleString()}</strong> more points, which requires <strong>~${actionsNeeded}</strong> more ${adv.actionName}s.`;
    } else {
      milestoneInsight = `You have reached 3 Stars! Outstanding work, Raider.`;
    }

    const thousandPtsActions = Math.ceil(1000 / adv.pointsPerAction);
    
    const tipsHtml = adv.tips.map(tip => `<li>${tip}</li>`).join('');

    const advisorContainer = document.createElement('div');
    advisorContainer.innerHTML = `
      <div class="trial-advisor-panel">
        <div class="advisor-header">
          <span class="advisor-icon">🤖</span>
          <span class="advisor-title">TRIAL ADVISOR</span>
        </div>
        <div class="advisor-content">
          <div class="advisor-math">
            <div><span class="highlight">${adv.pointsPerAction}</span> points per ${adv.actionName}</div>
            <div style="margin-top:0.5rem;">${milestoneInsight}</div>
            <div style="margin-top:1rem; color: var(--text-dim); font-size: 0.8rem; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 0.5rem;">
              <em>Leaderboard Push: Climbing 1,000 points requires ~${thousandPtsActions} ${adv.actionName}s in this trial.</em>
            </div>
          </div>
          <div class="advisor-tips">
            <strong>Strategic Intel:</strong>
            <ul>
              ${tipsHtml}
            </ul>
          </div>
        </div>
      </div>
    `;
    container.appendChild(advisorContainer);
  }

  return container;
}
