import { rateLimit } from '../../data/api-client.js';

export function renderHeader(container, { profile, rounds, stash }) {
  const totalRaids = rounds?.pagination?.total || 0;
  const recentRounds = rounds?.rounds || [];
  const extracted = recentRounds.filter(r => r.outcome === 'extracted').length;
  const survivalPct = recentRounds.length > 0 ? Math.round((extracted / recentRounds.length) * 100) : 0;
  const totalArcKills = recentRounds.reduce((s, r) => s + r.arcKills, 0);
  const totalPlayerKills = recentRounds.reduce((s, r) => s + (r.playerKills || 0), 0);
  const credits = stash?.currencies?.credits || 0;

  // Compute topside hours from round durations
  const totalDurationMs = recentRounds.reduce((s, r) => s + (r.durationMs || 0), 0);
  const topsideHours = Math.round(totalDurationMs / (1000 * 60 * 60));

  const rlRemaining = rateLimit.remaining;
  const rlTotal = rateLimit.limit;
  const rlClass = rlRemaining < 50 ? 'header__rate-limit--danger' : rlRemaining < 150 ? 'header__rate-limit--warning' : '';

  const totalDamage = recentRounds.reduce((s, r) => s + (r.damage || 0), 0);
  const playerLevel = profile?.level || profile?.playerLevel || 0;

  // Header stats in the preferred legacy layout: Big colorful numbers on top, uppercase labels on bottom.
  container.innerHTML = `
    <div class="header-inner">
      <div class="header__stats">
        <div class="header__stat">
          <div class="header__stat-value header__stat-value--cyan">${playerLevel}</div>
          <div class="header__stat-label">LEVEL</div>
        </div>
        <div class="header__stat">
          <div class="header__stat-value header__stat-value--cyan">${topsideHours}h</div>
          <div class="header__stat-label">TOPSIDE</div>
        </div>
        <div class="header__stat">
          <div class="header__stat-value header__stat-value--cyan">${totalRaids.toLocaleString()}</div>
          <div class="header__stat-label">TOTAL RAIDS</div>
        </div>
        <div class="header__stat">
          <div class="header__stat-value header__stat-value--green">${survivalPct}%</div>
          <div class="header__stat-label">SURVIVAL</div>
        </div>
        <div class="header__stat">
          <div class="header__stat-value header__stat-value--amber">${formatCredits(credits)}</div>
          <div class="header__stat-label">COINS</div>
        </div>
        <div class="header__stat">
          <div class="header__stat-value header__stat-value--amber">${totalDamage.toLocaleString()}</div>
          <div class="header__stat-label">TOTAL DMG</div>
        </div>
        <div class="header__stat">
          <div class="header__stat-value header__stat-value--cyan">${totalArcKills.toLocaleString()}</div>
          <div class="header__stat-label">ARC KILLS</div>
        </div>
        <div class="header__stat">
          <div class="header__stat-value header__stat-value--red">${totalPlayerKills.toLocaleString()}</div>
          <div class="header__stat-label">PLAYER KILLS</div>
        </div>
      </div>

      <div class="header-right-group">
        <!-- Departure Timers will be injected here by app.js -->
        <div id="departure-panel-container" class="inline-departures"></div>
      </div>
    </div>
  `;
}

function formatCredits(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
  return n.toLocaleString();
}
