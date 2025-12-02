import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
import type { SizeInfo, ImportInfo } from '../types.js';
import { resolvePackage, extractPackageName } from '../utils/package-resolver.js';

export interface CacheOptions {
  cacheDir?: string;
  ttl?: number; // Time to live in milliseconds
}

const DEFAULT_CACHE_DIR = '.use-cost-cache';
const DEFAULT_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Generate cache key for an import
 */
function getCacheKey(importInfo: ImportInfo, cwd: string): string {
  const packageName = extractPackageName(importInfo.source);
  const packageInfo = resolvePackage(packageName, cwd);

  if (!packageInfo) {
    return '';
  }

  // Create a hash of package name, version, and specifiers
  const data = `${packageInfo.name}@${packageInfo.version}:${importInfo.specifiers.sort().join(',')}`;
  return createHash('md5').update(data).digest('hex');
}

/**
 * Cache manager for storing analysis results
 */
export class Cache {
  private cacheDir: string;
  private ttl: number;

  constructor(options: CacheOptions = {}) {
    this.cacheDir = options.cacheDir || DEFAULT_CACHE_DIR;
    this.ttl = options.ttl || DEFAULT_TTL;

    // Ensure cache directory exists
    if (!existsSync(this.cacheDir)) {
      mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  /**
   * Get cached result for an import
   */
  get(importInfo: ImportInfo, cwd: string): SizeInfo | null {
    const key = getCacheKey(importInfo, cwd);
    if (!key) return null;

    const cachePath = join(this.cacheDir, `${key}.json`);

    if (!existsSync(cachePath)) {
      return null;
    }

    try {
      const cached = JSON.parse(readFileSync(cachePath, 'utf-8'));

      // Check if cache is expired
      const age = Date.now() - cached.timestamp;
      if (age > this.ttl) {
        return null;
      }

      return cached.data;
    } catch (error) {
      // Invalid cache file
      return null;
    }
  }

  /**
   * Store analysis result in cache
   */
  set(sizeInfo: SizeInfo, cwd: string): void {
    const key = getCacheKey(sizeInfo.import, cwd);
    if (!key) return;

    const cachePath = join(this.cacheDir, `${key}.json`);

    const cacheData = {
      timestamp: Date.now(),
      data: sizeInfo,
    };

    try {
      writeFileSync(cachePath, JSON.stringify(cacheData, null, 2), 'utf-8');
    } catch (error) {
      console.warn('Failed to write cache:', error);
    }
  }

  /**
   * Check if an import is cached
   */
  has(importInfo: ImportInfo, cwd: string): boolean {
    return this.get(importInfo, cwd) !== null;
  }
}
