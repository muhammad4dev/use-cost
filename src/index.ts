import ora from 'ora';
import type { AnalysisOptions, AnalysisResult, ImportInfo, SizeInfo } from './types.js';
import { findFiles } from './utils/file-finder.js';
import { parseFiles } from './parser/index.js';
import { analyzeImports } from './analyzer/index.js';
import { Cache } from './cache/index.js';
import { extractPackageName } from './utils/package-resolver.js';

/**
 * Analyze a project and return import cost information
 */
export async function analyzeProject(options: AnalysisOptions = {}): Promise<AnalysisResult> {
    const startTime = Date.now();
    const {
        cwd = process.cwd(),
        include,
        exclude,
        cache: enableCache = true,
        cacheDir,
        progress = true,
    } = options;

    const spinner = progress ? ora('Finding files...').start() : null;

    try {
        // Find all source files
        const files = await findFiles({ cwd, include, exclude });
        spinner?.succeed(`Found ${files.length} files`);

        // Parse imports from all files
        spinner?.start('Parsing imports...');
        const allImports = await parseFiles(files);

        // Deduplicate imports by package + specifiers
        const uniqueImports = deduplicateImports(allImports);
        spinner?.succeed(`Found ${uniqueImports.length} unique imports`);

        // Initialize cache if enabled
        const cacheInstance = enableCache ? new Cache({ cacheDir }) : null;

        // Analyze imports
        spinner?.start('Analyzing bundle sizes...');
        const results: SizeInfo[] = [];
        const toAnalyze: ImportInfo[] = [];

        // Check cache first
        for (const importInfo of uniqueImports) {
            if (cacheInstance) {
                const cached = cacheInstance.get(importInfo, cwd);
                if (cached) {
                    results.push(cached);
                    continue;
                }
            }
            toAnalyze.push(importInfo);
        }

        if (toAnalyze.length > 0) {
            if (spinner) {
                spinner.text = `Analyzing ${toAnalyze.length} imports (${results.length} cached)...`;
            }
            const analyzed = await analyzeImports(toAnalyze);

            // Cache the results
            if (cacheInstance) {
                analyzed.forEach((result) => cacheInstance.set(result, cwd));
            }

            results.push(...analyzed);
        }

        spinner?.succeed(`Analyzed ${results.length} imports`);

        // Calculate summary
        const packageNames = new Set(results.map((r) => extractPackageName(r.import.source)));
        const summary = {
            totalPackages: packageNames.size,
            totalRaw: results.reduce((sum, r) => sum + r.size.raw, 0),
            totalMinified: results.reduce((sum, r) => sum + r.size.minified, 0),
            totalGzipped: results.reduce((sum, r) => sum + r.size.gzipped, 0),
            duration: Date.now() - startTime,
        };

        return {
            imports: results,
            summary,
        };
    } catch (error) {
        spinner?.fail('Analysis failed');
        throw error;
    }
}

/**
 * Deduplicate imports by package name and specifiers
 */
function deduplicateImports(imports: ImportInfo[]): ImportInfo[] {
    const seen = new Map<string, ImportInfo>();

    for (const importInfo of imports) {
        const key = `${importInfo.source}:${importInfo.specifiers.sort().join(',')}`;
        if (!seen.has(key)) {
            seen.set(key, importInfo);
        }
    }

    return Array.from(seen.values());
}

// Export types and utilities
export type { AnalysisOptions, AnalysisResult, ImportInfo, SizeInfo, OutputFormat } from './types.js';
export { analyzeImport } from './analyzer/index.js';
