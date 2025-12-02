import { describe, it, expect } from 'vitest';
import { join } from 'path';
import {
    loadAliasConfig,
    isAliasImport,
    resolveAlias,
    resolveImportPath,
} from './alias-resolver.js';

describe('alias-resolver', () => {
    describe('isAliasImport', () => {
        it('should detect alias imports', () => {
            const config = {
                baseUrl: '/project',
                aliases: [
                    { alias: '@', paths: ['src'] },
                    { alias: '~', paths: ['.'] },
                ],
            };

            expect(isAliasImport('@/components/Button', config)).toBe(true);
            expect(isAliasImport('~/utils/helper', config)).toBe(true);
            expect(isAliasImport('./local', config)).toBe(false);
            expect(isAliasImport('react', config)).toBe(false);
        });

        it('should return false when no config provided', () => {
            expect(isAliasImport('@/components', null)).toBe(false);
        });
    });

    describe('resolveAlias', () => {
        it('should resolve alias paths', () => {
            const config = {
                baseUrl: '/project',
                aliases: [
                    { alias: '@', paths: ['src'] },
                    { alias: '@components', paths: ['src/components', 'lib/components'] },
                ],
            };

            const result1 = resolveAlias('@/utils/helper', config);
            expect(result1).toEqual(['/project/src/utils/helper']);

            const result2 = resolveAlias('@components/Button', config);
            expect(result2).toEqual([
                '/project/src/components/Button',
                '/project/lib/components/Button',
            ]);
        });

        it('should handle exact alias match', () => {
            const config = {
                baseUrl: '/project',
                aliases: [{ alias: '@utils', paths: ['src/utils'] }],
            };

            const result = resolveAlias('@utils', config);
            expect(result).toEqual(['/project/src/utils']);
        });

        it('should return null for non-matching imports', () => {
            const config = {
                baseUrl: '/project',
                aliases: [{ alias: '@', paths: ['src'] }],
            };

            expect(resolveAlias('react', config)).toBeNull();
            expect(resolveAlias('./local', config)).toBeNull();
        });
    });
});
