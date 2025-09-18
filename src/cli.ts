#!/usr/bin/env node

import { Command } from 'commander';
import { writeFileSync } from 'fs';
import { analyzeProject } from './index.js';
import { formatTable } from './formatters/table.js';
import { formatJson } from './formatters/json.js';
import { formatHtml } from './formatters/html.js';
import type { OutputFormat } from './types.js';

const program = new Command();

program
    .name('use-cost')
    .description('Analyze JavaScript/TypeScript imports and display bundle size reports')
    .version('0.1.0')
    .option('-f, --format <type>', 'Output format (table, json, html)', 'table')
    .option('-o, --output <file>', 'Output file path')
    .option('--no-cache', 'Disable caching')
    .option('--cache-dir <dir>', 'Cache directory', '.use-cost-cache')
    .option('--include <patterns...>', 'File patterns to include')
    .option('--exclude <patterns...>', 'File patterns to exclude')
    .option('--cwd <dir>', 'Working directory', process.cwd())
    .action(async (options) => {
        try {
            // Run analysis
            const result = await analyzeProject({
                cwd: options.cwd,
                include: options.include,
                exclude: options.exclude,
                cache: options.cache,
                cacheDir: options.cacheDir,
                progress: true,
            });

            // Format output
            const format = options.format as OutputFormat;
            let output: string;

            switch (format) {
                case 'json':
                    output = formatJson(result);
                    break;
                case 'html':
                    output = formatHtml(result);
                    break;
                case 'table':
                default:
                    output = formatTable(result);
                    break;
            }

            // Write to file or stdout
            if (options.output) {
                writeFileSync(options.output, output, 'utf-8');
                console.log(`\n✅ Report saved to: ${options.output}`);
            } else {
                console.log('\n' + output);
            }
        } catch (error) {
            console.error('\n❌ Error:', error instanceof Error ? error.message : error);
            process.exit(1);
        }
    });

program.parse();
