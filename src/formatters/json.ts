import type { AnalysisResult } from '../types.js';

/**
 * Format analysis result as JSON
 */
export function formatJson(result: AnalysisResult): string {
  const output = {
    metadata: {
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      platform: process.platform,
    },
    summary: result.summary,
    unusedDependencies: result.unusedDependencies,
    imports: result.imports.map((sizeInfo) => ({
      package: sizeInfo.import.source,
      specifiers: sizeInfo.import.specifiers,
      type: sizeInfo.import.type,
      file: sizeInfo.import.file,
      line: sizeInfo.import.line,
      size: sizeInfo.size,
      duration: sizeInfo.duration,
    })),
  };

  return JSON.stringify(output, null, 2);
}
