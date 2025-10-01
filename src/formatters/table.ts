import Table from 'cli-table3';
import chalk from 'chalk';
import type { AnalysisResult } from '../types.js';
import { formatBytes, getSizeColor } from '../utils/format.js';
import { extractPackageName } from '../utils/package-resolver.js';

/**
 * Format analysis result as a table
 */
export function formatTable(result: AnalysisResult): string {
    const table = new Table({
        head: [
            chalk.bold('Package'),
            chalk.bold('Raw'),
            chalk.bold('Minified'),
            chalk.bold('Gzipped'),
        ],
        colWidths: [40, 15, 15, 15],
    });

    // Group by package name and aggregate sizes
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

    // Sort by gzipped size (descending)
    const sorted = Array.from(packageMap.entries()).sort((a, b) => b[1].gzipped - a[1].gzipped);

    // Add rows to table
    sorted.forEach(([packageName, sizes]) => {
        const color = getSizeColor(sizes.gzipped);
        const colorFn = color === 'green' ? chalk.green : color === 'yellow' ? chalk.yellow : chalk.red;

        table.push([
            packageName,
            colorFn(formatBytes(sizes.raw)),
            colorFn(formatBytes(sizes.minified)),
            colorFn(formatBytes(sizes.gzipped)),
        ]);
    });

    let output = table.toString();

    // Add summary
    output += '\n\n' + chalk.bold('Summary:');
    output += '\n' + chalk.gray(`Total Packages: ${result.summary.totalPackages}`);
    output += '\n' + chalk.gray(`Total Raw: ${formatBytes(result.summary.totalRaw)}`);
    output += '\n' + chalk.gray(`Total Minified: ${formatBytes(result.summary.totalMinified)}`);
    output += '\n' + chalk.gray(`Total Gzipped: ${formatBytes(result.summary.totalGzipped)}`);
    output += '\n' + chalk.gray(`Analysis Duration: ${(result.summary.duration / 1000).toFixed(2)}s`);

    // Add unused dependencies
    if (result.unusedDependencies && result.unusedDependencies.length > 0) {
        output += '\n\n' + chalk.yellow.bold('Unused Dependencies:');
        result.unusedDependencies.forEach((dep) => {
            output += '\n' + chalk.yellow(`- ${dep}`);
        });
    }

    return output;
}
