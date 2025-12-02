import { describe, it, expect } from 'vitest';
import { formatJson } from './json.js';
import type { AnalysisResult } from '../types.js';

describe('JSON Formatter', () => {
  it('should format analysis result as JSON', () => {
    const result: AnalysisResult = {
      imports: [
        {
          import: { source: 'react', specifiers: [], type: 'import', file: 'test.ts', line: 1 },
          size: { raw: 1000, minified: 500, gzipped: 200 },
          duration: 10,
        },
      ],
      summary: {
        totalPackages: 1,
        totalRaw: 1000,
        totalMinified: 500,
        totalGzipped: 200,
        duration: 100,
      },
      unusedDependencies: ['lodash'],
    };

    const output = formatJson(result);
    const parsed = JSON.parse(output);

    expect(parsed.metadata).toBeDefined();
    expect(parsed.metadata.timestamp).toBeDefined();
    expect(parsed.summary).toEqual(result.summary);
    expect(parsed.unusedDependencies).toEqual(['lodash']);
    expect(parsed.imports).toHaveLength(1);
  });

  it('should handle empty results', () => {
    const result: AnalysisResult = {
      imports: [],
      summary: {
        totalPackages: 0,
        totalRaw: 0,
        totalMinified: 0,
        totalGzipped: 0,
        duration: 0,
      },
    };

    const output = formatJson(result);
    const parsed = JSON.parse(output);

    expect(parsed.summary.totalPackages).toBe(0);
    expect(parsed.imports).toHaveLength(0);
  });
});
