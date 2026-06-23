export function renderDeparturePanel(containerOrId) {
  const container = typeof containerOrId === 'string' ? document.getElementById(containerOrId) : containerOrId;
  if (!container) return;

  // We are removing the expand/collapse logic because this is now permanently
  // docked inside a dense header row.
  const renderContent = () => {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 6px; justify-content: center; height: 100%;">
        <div class="departure-timer-badge" title="until window opens">
          <span class="timer-icon">🕒</span>
          <span id="departure-countdown">--d : --h : --mn</span>
        </div>
        <div class="departure-timer-badge departure-timer-badge--trials" title="trials reset">
          <span class="timer-icon">🛡️</span>
          <span id="trials-countdown">--d : --h : --mn</span>
        </div>
      </div>
    `;
  };

  renderContent();

  const depEl = container.querySelector('#departure-countdown');
  const trialsEl = container.querySelector('#trials-countdown');

  // Hardcoded target date from previous logic:
  // e.g. July 10th 2026 12:00 UTC
  const targetDate = new Date('2026-07-10T12:00:00Z').getTime();
  
  // Weekly reset (Tuesday 08:00 UTC)
  const getNextTuesday = () => {
    const now = new Date();
    const result = new Date(now);
    result.setUTCHours(8, 0, 0, 0);
    const day = result.getUTCDay();
    const diff = day <= 2 ? 2 - day : 9 - day;
    result.setUTCDate(result.getUTCDate() + diff);
    // If it's already past 8AM UTC on Tuesday, go to next week
    if (day === 2 && now.getTime() >= result.getTime()) {
      result.setUTCDate(result.getUTCDate() + 7);
    }
    return result.getTime();
  };

  let nextTrialsReset = getNextTuesday();

  const formatTime = (diff) => {
    if (diff <= 0) return '00s';
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    
    let parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0 || d > 0) parts.push(`${h.toString().padStart(2, '0')}h`);
    if (m > 0 || h > 0 || d > 0) parts.push(`${m.toString().padStart(2, '0')}m`);
    parts.push(`${s.toString().padStart(2, '0')}s`);
    
    return parts.join(' : ');
  };

  setInterval(() => {
    const now = Date.now();
    const depDiff = targetDate - now;
    if (depEl) {
      if (depDiff <= 0) {
        depEl.textContent = 'WINDOW OPEN';
        depEl.style.color = '#fff';
      } else {
        depEl.textContent = formatTime(depDiff);
      }
    }

    const trialsDiff = nextTrialsReset - now;
    if (trialsDiff <= 0) {
      nextTrialsReset = getNextTuesday(); // recalc
    }
    if (trialsEl) {
      trialsEl.textContent = formatTime(trialsDiff);
    }
  }, 1000);
}
