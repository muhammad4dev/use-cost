import { readFileSync, existsSync } from 'fs';
import { join, resolve, dirname } from 'path';

export interface PathAlias {
    alias: string;
    paths: string[];
}

export interface AliasConfig {
    baseUrl: string;
    aliases: PathAlias[];
}

/**
 * Load and parse tsconfig.json or jsconfig.json to extract path aliases
 */
export function loadAliasConfig(projectRoot: string): AliasConfig | null {
    const configFiles = ['tsconfig.json', 'jsconfig.json'];

    for (const configFile of configFiles) {
        const configPath = join(projectRoot, configFile);

        if (existsSync(configPath)) {
            try {
                const content = readFileSync(configPath, 'utf-8');
                // Remove comments from JSON (basic implementation)
                const cleanedContent = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
                const config = JSON.parse(cleanedContent);

                if (config.compilerOptions?.paths) {
                    const baseUrl = config.compilerOptions.baseUrl || '.';
                    const aliases: PathAlias[] = [];

                    for (const [alias, paths] of Object.entries(config.compilerOptions.paths)) {
                        if (Array.isArray(paths)) {
                            // Remove the glob pattern (* or **)
                            const cleanAlias = alias.replace(/\/\*+$/, '');
                            const cleanPaths = paths.map((p: string) => p.replace(/\/\*+$/, ''));

                            aliases.push({
                                alias: cleanAlias,
                                paths: cleanPaths,
                            });
                        }
                    }

                    return {
                        baseUrl: resolve(projectRoot, baseUrl),
                        aliases,
                    };
                }
            } catch (error) {
                console.warn(`Failed to parse ${configFile}:`, error);
            }
        }
    }

    return null;
}

/**
 * Check if an import path uses an alias
 */
export function isAliasImport(importPath: string, aliasConfig: AliasConfig | null): boolean {
    if (!aliasConfig) return false;

    return aliasConfig.aliases.some((alias) => {
        return importPath === alias.alias || importPath.startsWith(alias.alias + '/');
    });
}

/**
 * Resolve an alias import to actual file system paths
 * Returns all possible resolved paths (since one alias can map to multiple paths)
 */
export function resolveAlias(
    importPath: string,
    aliasConfig: AliasConfig | null
): string[] | null {
    if (!aliasConfig) return null;

    for (const alias of aliasConfig.aliases) {
        if (importPath === alias.alias || importPath.startsWith(alias.alias + '/')) {
            // Replace the alias prefix with the actual paths
            const relativePath = importPath.slice(alias.alias.length);
            return alias.paths.map((p) => resolve(aliasConfig.baseUrl, p + relativePath));
        }
    }

    return null;
}

/**
 * Check if a file exists with common extensions
 */
export function resolveFileWithExtensions(basePath: string): string | null {
    const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '.vue', '.svelte', '.mjs', '.cjs'];

    for (const ext of extensions) {
        const fullPath = basePath + ext;
        if (existsSync(fullPath)) {
            return fullPath;
        }
    }

    // Try index files
    for (const ext of extensions.slice(1)) {
        // skip empty string
        const indexPath = join(basePath, `index${ext}`);
        if (existsSync(indexPath)) {
            return indexPath;
        }
    }

    return null;
}

/**
 * Resolve an import path to an actual file path, handling aliases
 * @param importPath - The import string (e.g., '@/components/Button', './utils')
 * @param fromFile - The file that contains this import
 * @param aliasConfig - The alias configuration from tsconfig/jsconfig
 * @returns The resolved absolute file path, or null if not found
 */
export function resolveImportPath(
    importPath: string,
    fromFile: string,
    aliasConfig: AliasConfig | null
): string | null {
    // Handle relative imports (./xxx or ../xxx)
    if (importPath.startsWith('.')) {
        const basePath = resolve(dirname(fromFile), importPath);
        return resolveFileWithExtensions(basePath);
    }

    // Handle absolute imports (/xxx)
    if (importPath.startsWith('/')) {
        return resolveFileWithExtensions(importPath);
    }

    // Handle alias imports (@/xxx, ~/xxx, etc.)
    if (aliasConfig && isAliasImport(importPath, aliasConfig)) {
        const resolvedPaths = resolveAlias(importPath, aliasConfig);
        if (resolvedPaths) {
            // Try each possible path
            for (const path of resolvedPaths) {
                const resolved = resolveFileWithExtensions(path);
                if (resolved) {
                    return resolved;
                }
            }
        }
    }

    // Not a local import (it's a node_modules package)
    return null;
}
