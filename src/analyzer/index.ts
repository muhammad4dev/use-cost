import { build } from 'esbuild';
import { gzipSync } from 'zlib';
import { writeFileSync, unlinkSync, mkdtempSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import type { ImportInfo, SizeInfo } from '../types.js';

/**
 * Create a temporary entry file for bundling
 */
function createTempEntry(importInfo: ImportInfo): string {
  const tempDir = mkdtempSync(join(tmpdir(), 'use-cost-'));
  const tempFile = join(tempDir, 'entry.js');

  let code = '';

  // Generate import statement based on type
  if (importInfo.type === 'import') {
    if (importInfo.specifiers.length === 0) {
      code = `import '${importInfo.source}';\n`;
    } else if (importInfo.specifiers.includes('*')) {
      code = `import * as pkg from '${importInfo.source}';\nconsole.log(pkg);\n`;
    } else if (importInfo.specifiers.includes('default')) {
      code = `import pkg from '${importInfo.source}';\nconsole.log(pkg);\n`;
    } else {
      const specs = importInfo.specifiers.join(', ');
      code = `import { ${specs} } from '${importInfo.source}';\nconsole.log(${importInfo.specifiers[0]});\n`;
    }
  } else if (importInfo.type === 'require') {
    code = `const pkg = require('${importInfo.source}');\nconsole.log(pkg);\n`;
  } else if (importInfo.type === 'dynamic') {
    code = `import('${importInfo.source}').then(pkg => console.log(pkg));\n`;
  }

  writeFileSync(tempFile, code, 'utf-8');
  return tempFile;
}

/**
 * Bundle and calculate size for a single import
 */
export async function analyzeImport(importInfo: ImportInfo): Promise<SizeInfo> {
  const startTime = Date.now();
  let tempFile: string | null = null;
  let outfile: string | null = null;

  try {
    // Create temporary entry file
    tempFile = createTempEntry(importInfo);
    outfile = tempFile.replace('.js', '.bundle.js');

    // Bundle with esbuild
    const { cwd } = process;
    await build({
      entryPoints: [tempFile],
      bundle: true,
      minify: true,
      write: true,
      outfile,
      platform: 'node',
      format: 'esm',
      treeShaking: true,
      logLevel: 'silent',
      nodePaths: [
        join(cwd(), 'node_modules'),
        join(cwd(), '..', 'node_modules'),
        join(cwd(), '..', '..', 'node_modules'),
      ],
    });

    // Read the bundled output
    const { readFileSync } = await import('fs');
    const bundled = readFileSync(outfile);

    // Calculate sizes
    const minified = bundled.length;
    const gzipped = gzipSync(bundled).length;

    const duration = Date.now() - startTime;

    return {
      import: importInfo,
      size: {
        raw: minified, // For bundled code, raw and minified are the same
        minified,
        gzipped,
      },
      duration,
    };
  } catch (error) {
    console.warn(`Failed to analyze import ${importInfo.source}:`, error);

    // Return zero sizes on error
    return {
      import: importInfo,
      size: {
        raw: 0,
        minified: 0,
        gzipped: 0,
      },
      duration: Date.now() - startTime,
    };
  } finally {
    // Cleanup temporary files
    try {
      if (tempFile) unlinkSync(tempFile);
      if (outfile) unlinkSync(outfile);
    } catch {
      // Ignore cleanup errors
    }
  }
}

/**
 * Analyze multiple imports in parallel
 */
export async function analyzeImports(
  imports: ImportInfo[],
  concurrency: number = 5
): Promise<SizeInfo[]> {
  const results: SizeInfo[] = [];

  // Process in batches for better performance
  for (let i = 0; i < imports.length; i += concurrency) {
    const batch = imports.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(analyzeImport));
    results.push(...batchResults);
  }

  return results;
}
