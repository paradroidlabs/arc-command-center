import { marked } from 'marked';

export async function renderSystemLogs(container, logType) {
  container.innerHTML = `
    <div class="panel__header">
      <h2 class="panel__title">
        <span class="panel__title-icon">📝</span> 
        ${logType === 'roadmap' ? 'SYSTEM ROADMAP' : 'CHANGELOG & PATCH NOTES'}
      </h2>
    </div>
    <div class="loading-state" style="padding: 24px;">Loading...</div>
  `;

  try {
    const filename = logType === 'roadmap' ? '/roadmap.md' : '/changes.md';
    const response = await fetch(filename);
    
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}`);
    }
    
    const text = await response.text();
    const htmlContent = marked.parse(text);

    container.innerHTML = `
      <div class="panel__header" style="margin-bottom: 24px;">
        <h2 class="panel__title">
          <span class="panel__title-icon">📝</span> 
          ${logType === 'roadmap' ? 'SYSTEM ROADMAP' : 'CHANGELOG & PATCH NOTES'}
        </h2>
      </div>
      <div class="markdown-content" style="
        font-family: var(--font-body);
        color: var(--text-color);
        line-height: 1.6;
        font-size: 0.9rem;
      ">
        ${htmlContent}
      </div>
    `;

  } catch (err) {
    console.error('Error loading markdown:', err);
    container.innerHTML = `
      <div class="panel__header">
        <h2 class="panel__title"><span class="panel__title-icon">⚠️</span> ERROR LOADNG LOG</h2>
      </div>
      <div class="empty-state">
        <p>Could not load the requested system document.</p>
      </div>
    `;
  }
}
