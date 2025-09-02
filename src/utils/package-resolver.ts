import { readFileSync } from 'fs';
import { join, dirname } from 'path';

export interface PackageInfo {
    name: string;
    version: string;
    path: string;
}

/**
 * Resolve package.json for a given package name
 */
export function resolvePackage(packageName: string, fromPath: string): PackageInfo | null {
    try {
        // Try to resolve the package
        const packageJsonPath = require.resolve(`${packageName}/package.json`, {
            paths: [fromPath],
        });

        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

        return {
            name: packageJson.name || packageName,
            version: packageJson.version || '0.0.0',
            path: dirname(packageJsonPath),
        };
    } catch (error) {
        // Package not found or not installed
        return null;
    }
}

/**
 * Check if a package is a local dependency
 */
export function isLocalPackage(packageName: string): boolean {
    return packageName.startsWith('.') || packageName.startsWith('/');
}

/**
 * Extract package name from scoped or subpath imports
 * Examples:
 * - '@scope/package' => '@scope/package'
 * - '@scope/package/subpath' => '@scope/package'
 * - 'package' => 'package'
 * - 'package/subpath' => 'package'
 */
export function extractPackageName(importSource: string): string {
    if (importSource.startsWith('@')) {
        // Scoped package
        const parts = importSource.split('/');
        return parts.slice(0, 2).join('/');
    } else {
        // Regular package
        return importSource.split('/')[0];
    }
}
