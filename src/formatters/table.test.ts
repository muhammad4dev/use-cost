import { describe, it, expect } from 'vitest';
import { formatTable } from './table.js';
import type { AnalysisResult } from '../types.js';

describe('Table Formatter', () => {
    it('should format analysis result correctly', () => {
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

        const output = formatTable(result);
        expect(output).toContain('react');
        expect(output).toContain('1000 B');
        expect(output).toContain('500 B');
        expect(output).toContain('200 B');
        expect(output).toContain('Unused Dependencies');
        expect(output).toContain('lodash');
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

        const output = formatTable(result);
        expect(output).toContain('Summary');
        expect(output).toContain('Total Packages: 0');
    });
});
