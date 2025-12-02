import { describe, it, expect } from 'vitest';
import { analyzeProject } from './index.js';

describe('analyzeProject', () => {
  it('should analyze the current project', async () => {
    const result = await analyzeProject({
      cwd: process.cwd(),
      include: ['src/**/*.ts'],
      exclude: ['**/*.test.ts', 'dist/**'],
      cache: false,
      progress: false,
    });

    expect(result).toBeDefined();
    expect(result.summary.totalPackages).toBeGreaterThan(0);
    expect(result.imports.length).toBeGreaterThan(0);

    // Check for unused dependencies (should include lodash if we added it, or be empty/defined)
    expect(result.unusedDependencies).toBeDefined();
  });
});
