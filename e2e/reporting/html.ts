import fs from 'fs';
import path from 'path';
import type { TestResult } from '../types.js';
import { config } from '../config.js';

export function generateHTMLReport(results: TestResult[]): string {
  const reportsDir = path.resolve(process.cwd(), config.reportsDir);
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;
  const totalTime = results.reduce((acc, r) => acc + r.durationMs, 0);

  const modelUsed = config.stagehand.modelClientOptions?.baseURL
    ? `Ollama Local (${config.stagehand.modelName})`
    : `Cloud (${config.stagehand.modelName})`;

  const rowsHtml = results
    .map((res) => {
      const statusBadge = res.passed
        ? `<span class="badge pass">PASS</span>`
        : `<span class="badge fail">FAIL</span>`;

      const screenshotHtml = res.screenshotPath
        ? `<div class="screenshot-preview">
             <a href="../${res.screenshotPath.replace(/\\/g, '/')}" target="_blank">
               📸 View Failure Screenshot
             </a>
           </div>`
        : '';

      const errorHtml = res.error
        ? `<div class="error-msg"><strong>Error:</strong> ${res.error.message}</div>`
        : '';

      const logsHtml = res.logs
        .map((log) => `<li>${log}</li>`)
        .join('');

      return `
        <div class="card ${res.passed ? 'border-pass' : 'border-fail'}">
          <div class="card-header">
            <div class="title-group">
              ${statusBadge}
              <h3>[${res.specId}] ${res.specName}</h3>
            </div>
            <span class="duration">${res.durationMs} ms</span>
          </div>
          ${errorHtml}
          ${screenshotHtml}
          <details class="logs-container">
            <summary>Execution Logs (${res.logs.length} steps)</summary>
            <ul>${logsHtml}</ul>
          </details>
        </div>
      `;
    })
    .join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nexus Automate — E2E Execution Report</title>
  <style>
    :root {
      --bg: #0f172a;
      --card-bg: #1e293b;
      --text: #f8fafc;
      --text-dim: #94a3b8;
      --pass: #22c55e;
      --fail: #ef4444;
      --border: #334155;
      --accent: #38bdf8;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      margin: 0;
      padding: 2rem;
    }
    .container {
      max-width: 960px;
      margin: 0 auto;
    }
    header {
      border-bottom: 1px solid var(--border);
      padding-bottom: 1rem;
      margin-bottom: 2rem;
    }
    h1 {
      margin: 0 0 0.5rem 0;
      color: var(--text);
    }
    .subtitle {
      color: var(--text-dim);
      font-size: 0.95rem;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 1.25rem;
      text-align: center;
    }
    .stat-card .value {
      font-size: 2rem;
      font-weight: bold;
      margin-top: 0.5rem;
    }
    .stat-card.pass .value { color: var(--pass); }
    .stat-card.fail .value { color: var(--fail); }
    .stat-card.info .value { color: var(--accent); }
    
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 1.25rem;
      margin-bottom: 1rem;
    }
    .card.border-pass { border-left: 4px solid var(--pass); }
    .card.border-fail { border-left: 4px solid var(--fail); }
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .title-group {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .title-group h3 {
      margin: 0;
      font-size: 1.1rem;
    }
    .badge {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: bold;
    }
    .badge.pass { background: rgba(34, 197, 94, 0.2); color: var(--pass); }
    .badge.fail { background: rgba(239, 68, 68, 0.2); color: var(--fail); }
    
    .duration {
      color: var(--text-dim);
      font-size: 0.9rem;
    }
    .error-msg {
      background: rgba(239, 68, 68, 0.1);
      border-left: 3px solid var(--fail);
      padding: 0.75rem;
      border-radius: 4px;
      margin-top: 1rem;
      color: #fca5a5;
    }
    .screenshot-preview {
      margin-top: 1rem;
    }
    .screenshot-preview a {
      color: var(--accent);
      text-decoration: none;
      font-weight: 500;
    }
    .screenshot-preview a:hover {
      text-decoration: underline;
    }
    details {
      margin-top: 1rem;
    }
    summary {
      cursor: pointer;
      color: var(--text-dim);
      font-size: 0.9rem;
    }
    ul {
      margin: 0.5rem 0 0 1.25rem;
      padding: 0;
      color: var(--text-dim);
      font-size: 0.85rem;
    }
    li {
      margin-bottom: 0.25rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Nexus Automate Report</h1>
      <div class="subtitle">Generated at ${new Date().toLocaleString()} | Model Engine: <strong>${modelUsed}</strong></div>
    </header>

    <div class="stats-grid">
      <div class="stat-card info">
        <div>Total Specs</div>
        <div class="value">${total}</div>
      </div>
      <div class="stat-card pass">
        <div>Passed</div>
        <div class="value">${passed}</div>
      </div>
      <div class="stat-card fail">
        <div>Failed</div>
        <div class="value">${failed}</div>
      </div>
      <div class="stat-card info">
        <div>Duration</div>
        <div class="value">${totalTime}ms</div>
      </div>
    </div>

    <h2>Test Specifications</h2>
    ${rowsHtml}
  </div>
</body>
</html>`;

  const reportFilePath = path.join(reportsDir, 'index.html');
  fs.writeFileSync(reportFilePath, html, 'utf-8');
  return reportFilePath;
}
