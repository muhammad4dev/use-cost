import fg from 'fast-glob';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Default file patterns to exclude
 */
const DEFAULT_EXCLUDES = [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.git/**',
    '**/coverage/**',
    '**/.next/**',
    '**/.nuxt/**',
];

/**
 * Default file patterns to include
 */
const DEFAULT_INCLUDES = [
    '**/*.{js,jsx,ts,tsx,mjs,cjs,vue,svelte}',
];

export interface FindFilesOptions {
    cwd?: string;
    include?: string[];
    exclude?: string[];
}

/**
 * Find all source files in a project
 */
export async function findFiles(options: FindFilesOptions = {}): Promise<string[]> {
    const {
        cwd = process.cwd(),
        include = DEFAULT_INCLUDES,
        exclude = DEFAULT_EXCLUDES,
    } = options;

    const files = await fg(include, {
        cwd,
        ignore: exclude,
        absolute: true,
        onlyFiles: true,
    });

    return files;
}

/**
 * Check if a file should be ignored based on .gitignore
 */
export function shouldIgnoreFile(filePath: string): boolean {
    // Basic check for common ignore patterns
    const ignoredPatterns = [
        'node_modules',
        'dist',
        'build',
        '.git',
        'coverage',
    ];

    return ignoredPatterns.some((pattern) => filePath.includes(pattern));
}

/**
 * Read file content with error handling
 */
export function readFileContent(filePath: string): string | null {
    try {
        return readFileSync(filePath, 'utf-8');
    } catch (error) {
        console.warn(`Failed to read file: ${filePath}`, error);
        return null;
    }
}
