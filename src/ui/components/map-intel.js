/**
 * Map Intel Component
 * Grid of maps with survival rates, designations, active events
 */

import { getProfile } from '../../data/profile-state.js';
import { MAP_NAMES } from '../../data/drop-rates.js';

const MAP_SLUGS = ['buried-city', 'the-spaceport', 'dam-battleground', 'blue-gate', 'stella-montis', 'riven-tides'];

export function renderMapIntel(container, { rounds }) {
  const profile = getProfile();
  const mapMastery = profile.map_mastery || {};

  // Compute live stats from rounds
  const mapStats = computeRoundStats(rounds?.rounds || []);

  container.innerHTML = `
    <div class="panel__header">
      <h2 class="panel__title"><span class="panel__title-icon">🗺️</span> MAP INTEL</h2>
    </div>
    <div class="map-grid">
      ${MAP_SLUGS.map(slug => renderMapCard(slug, mapMastery[slug], mapStats[slug])).join('')}
    </div>
  `;
}

function renderMapCard(slug, mastery, liveStats) {
  const name = MAP_NAMES[slug] || slug;
  const status = mastery?.status || 'neutral';
  const designation = mastery?.designation || '';
  const survivalRate = liveStats?.survivalRate ?? mastery?.survival_rate ?? '—';

  const cardClass = status === 'home' ? 'map-card--home'
    : status === 'secondary' ? 'map-card--secondary'
    : status === 'avoid' ? 'map-card--avoid' : '';

  const desigClass = status === 'home' ? 'map-card__designation--home'
    : status === 'secondary' ? 'map-card__designation--secondary'
    : status === 'avoid' ? 'map-card__designation--avoid'
    : 'map-card__designation--neutral';

  const raids = liveStats?.total || 0;
  const avgNet = liveStats?.avgNet || 0;
  const avgNetStr = avgNet >= 0 ? `+${formatNum(avgNet)}` : formatNum(avgNet);

  return `
    <div class="map-card ${cardClass}">
      <div class="map-card__name">${name}</div>
      <div class="map-card__designation ${desigClass}">${designation || status.toUpperCase()}</div>
      <div class="map-card__stats">
        <div class="map-card__stat">SURV: <strong>${survivalRate}%</strong></div>
        ${raids > 0 ? `<div class="map-card__stat">RUNS: <strong>${raids}</strong></div>` : ''}
        ${raids > 0 ? `<div class="map-card__stat">AVG: <strong>${avgNetStr}</strong></div>` : ''}
      </div>
    </div>
  `;
}

function computeRoundStats(rounds) {
  const stats = {};
  for (const round of rounds) {
    const slug = round.map;
    if (!stats[slug]) stats[slug] = { total: 0, extracted: 0, totalNet: 0 };
    stats[slug].total++;
    if (round.outcome === 'extracted') stats[slug].extracted++;
    stats[slug].totalNet += round.netValue;
  }
  for (const s of Object.values(stats)) {
    s.survivalRate = s.total > 0 ? Math.round((s.extracted / s.total) * 100) : 0;
    s.avgNet = s.total > 0 ? Math.round(s.totalNet / s.total) : 0;
  }
  return stats;
}

function formatNum(n) {
  if (Math.abs(n) >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}
