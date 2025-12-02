import { describe, it, expect } from 'vitest';
import { analyzeImport, analyzeImports } from './index.js';

describe('Analyzer', () => {
  it('should analyze a single import', async () => {
    const importInfo = {
      source: 'chalk',
      specifiers: ['default'],
      type: 'import' as const,
      file: 'test.ts',
      line: 1,
    };

    const result = await analyzeImport(importInfo);

    expect(result).toBeDefined();
    expect(result.import).toEqual(importInfo);
    expect(result.size.raw).toBeGreaterThan(0);
    expect(result.size.minified).toBeGreaterThan(0);
    expect(result.size.gzipped).toBeGreaterThan(0);
    expect(result.duration).toBeGreaterThan(0);
  });

  it('should analyze multiple imports', async () => {
    const imports = [
      {
        source: 'chalk',
        specifiers: ['default'],
        type: 'import' as const,
        file: 'test.ts',
        line: 1,
      },
      {
        source: 'ora',
        specifiers: ['default'],
        type: 'import' as const,
        file: 'test.ts',
        line: 2,
      },
    ];

    const results = await analyzeImports(imports);

    expect(results).toHaveLength(2);
    results.forEach((result) => {
      expect(result.size.raw).toBeGreaterThan(0);
      expect(result.size.minified).toBeGreaterThan(0);
      expect(result.size.gzipped).toBeGreaterThan(0);
    });
  });

  it('should handle analysis errors gracefully', async () => {
    const importInfo = {
      source: 'non-existent-package-that-does-not-exist',
      specifiers: [],
      type: 'import' as const,
      file: 'test.ts',
      line: 1,
    };

    // Should not throw, but return a result with 0 sizes
    const result = await analyzeImport(importInfo);
    expect(result).toBeDefined();
  });
});
