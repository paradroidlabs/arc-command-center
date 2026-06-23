export function renderHorizontalBarChart(items, maxCount) {
  if (!items || items.length === 0) return '<div class="empty-state">No data available</div>';

  return `
    <div class="horizontal-bar-chart">
      ${items.map(item => {
        const pct = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
        return `
          <div class="bar-chart-row">
            <div class="bar-chart-label">${item.name}</div>
            <div class="bar-chart-track">
              <div class="bar-chart-fill" style="width: ${pct}%"></div>
            </div>
            <div class="bar-chart-value">${item.count.toLocaleString()}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

export function renderNetValueGraph(history) {
  if (!history || history.length === 0) return '';

  const maxVal = Math.max(...history.map(h => Math.abs(h.netValue)), 10000);
  
  return `
    <div class="value-graph">
      <div class="value-graph__bars">
        ${history.map(h => {
          const heightPct = (Math.abs(h.netValue) / maxVal) * 100;
          const colorClass = h.netValue >= 0 ? 'value-graph__bar--positive' : 'value-graph__bar--negative';
          
          const formatVal = (v) => v >= 1000 ? (v/1000).toFixed(0) + 'K' : v;
          const tooltipHtml = `
            <div class="chart-tooltip">
              <div style="font-weight: 600; margin-bottom: 4px; color: #fff;">Raid ${h.index}</div>
              <div style="color: ${h.netValue >= 0 ? 'var(--green)' : 'var(--red)'}">Net Value: ${h.netValue >= 0 ? '+' : ''}${formatVal(h.netValue)}</div>
              ${h.extracted ? `
                <div style="color: var(--red);">Brought In: ${formatVal(h.valueBroughtIn)}</div>
                <div style="color: var(--amber);">Extracted: ${formatVal(h.valueExtracted)}</div>
              ` : `
                <div style="color: var(--red);">Lost: ${formatVal(Math.abs(h.netValue))}</div>
              `}
            </div>
          `;

          if (h.netValue >= 0) {
            return `
              <div class="value-graph__column">
                ${tooltipHtml}
                <div class="value-graph__bar value-graph__bar--up ${colorClass}" style="height: ${heightPct}%"></div>
                <div class="value-graph__bar value-graph__bar--down" style="height: 0%"></div>
              </div>
            `;
          } else {
            return `
              <div class="value-graph__column">
                ${tooltipHtml}
                <div class="value-graph__bar value-graph__bar--up" style="height: 0%"></div>
                <div class="value-graph__bar value-graph__bar--down ${colorClass}" style="height: ${heightPct}%"></div>
              </div>
            `;
          }
        }).join('')}
      </div>
      <div class="value-graph__zero-line"></div>
    </div>
  `;
}
