import type { AnalysisResult } from '../types.js';
import { formatBytes } from '../utils/format.js';
import { extractPackageName } from '../utils/package-resolver.js';

/**
 * Format analysis result as HTML
 */
export function formatHtml(result: AnalysisResult): string {
  // Group by package name
  const packageMap = new Map<string, { raw: number; minified: number; gzipped: number }>();

  result.imports.forEach((sizeInfo) => {
    const packageName = extractPackageName(sizeInfo.import.source);
    const existing = packageMap.get(packageName) || { raw: 0, minified: 0, gzipped: 0 };

    packageMap.set(packageName, {
      raw: existing.raw + sizeInfo.size.raw,
      minified: existing.minified + sizeInfo.size.minified,
      gzipped: existing.gzipped + sizeInfo.size.gzipped,
    });
  });

  // Sort by gzipped size
  const sorted = Array.from(packageMap.entries()).sort((a, b) => b[1].gzipped - a[1].gzipped);

  // Generate table rows
  const rows = sorted
    .map(([packageName, sizes]) => {
      const color =
        sizes.gzipped < 50 * 1024
          ? '#10b981'
          : sizes.gzipped < 200 * 1024
            ? '#f59e0b'
            : '#ef4444';

      return `
        <tr>
          <td>${packageName}</td>
          <td style="color: ${color}">${formatBytes(sizes.raw)}</td>
          <td style="color: ${color}">${formatBytes(sizes.minified)}</td>
          <td style="color: ${color}">${formatBytes(sizes.gzipped)}</td>
        </tr>
      `;
    })
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Import Cost Analysis Report</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 2rem;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      overflow: hidden;
    }

    header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
    }

    h1 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      opacity: 0.9;
      font-size: 0.9rem;
    }

    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      padding: 2rem;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
    }

    .summary-item {
      text-align: center;
    }

    .summary-label {
      font-size: 0.875rem;
      color: #6b7280;
      margin-bottom: 0.25rem;
    }

    .summary-value {
      font-size: 1.5rem;
      font-weight: bold;
      color: #111827;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    thead {
      background: #f3f4f6;
    }

    th {
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: #374151;
      border-bottom: 2px solid #e5e7eb;
    }

    td {
      padding: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }

    tr:hover {
      background: #f9fafb;
    }

    .footer {
      padding: 1.5rem 2rem;
      background: #f9fafb;
      text-align: center;
      color: #6b7280;
      font-size: 0.875rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>📦 Import Cost Analysis Report</h1>
      <p class="subtitle">Generated on ${new Date().toLocaleString()}</p>
    </header>

    <div class="summary">
      <div class="summary-item">
        <div class="summary-label">Total Packages</div>
        <div class="summary-value">${result.summary.totalPackages}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Total Raw</div>
        <div class="summary-value">${formatBytes(result.summary.totalRaw)}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Total Minified</div>
        <div class="summary-value">${formatBytes(result.summary.totalMinified)}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Total Gzipped</div>
        <div class="summary-value">${formatBytes(result.summary.totalGzipped)}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Package</th>
          <th>Raw</th>
          <th>Minified</th>
          <th>Gzipped</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    ${result.unusedDependencies && result.unusedDependencies.length > 0
      ? `
    <div style="padding: 2rem; background: #fef3c7; border-top: 1px solid #f59e0b;">
      <h2 style="color: #92400e; margin-bottom: 1rem; font-size: 1.25rem;">⚠️ Unused Dependencies</h2>
      <p style="color: #78350f; margin-bottom: 0.5rem;">The following dependencies are installed but not used:</p>
      <ul style="list-style: none; padding-left: 0;">
        ${result.unusedDependencies.map((dep) => `<li style="color: #78350f; padding: 0.25rem 0;">• ${dep}</li>`).join('')}
      </ul>
    </div>
    `
      : ''
    }

    <div class="footer">
      Generated by use-cost • Analysis took ${(result.summary.duration / 1000).toFixed(2)}s
    </div>
  </div>
</body>
</html>
  `.trim();
}
