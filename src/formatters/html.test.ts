import { describe, it, expect } from 'vitest';
import { formatHtml } from './html.js';
import type { AnalysisResult } from '../types.js';

describe('HTML Formatter', () => {
  it('should format analysis result as HTML', () => {
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

    const output = formatHtml(result);

    expect(output).toContain('<!DOCTYPE html>');
    expect(output).toContain('<html');
    expect(output).toContain('react');
    expect(output).toMatch(/1000/); // Check raw value present
    expect(output).toMatch(/500/); // Check minified value present
    expect(output).toMatch(/200/); // Check gzipped value present
    expect(output).toContain('lodash');
    expect(output).toContain('Unused Dependencies');
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

    const output = formatHtml(result);

    expect(output).toContain('<!DOCTYPE html>');
    expect(output).toContain('Total Packages');
    expect(output).not.toContain('Unused Dependencies'); // Should not show when empty
  });
});
