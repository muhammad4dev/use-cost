import { describe, it, expect, vi, beforeEach } from 'vitest';
import { findFiles, shouldIgnoreFile } from './file-finder.js';
import fg from 'fast-glob';

vi.mock('fast-glob');
vi.mock('fs');

describe('File Finder', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('should find files with default options', async () => {
        vi.mocked(fg).mockResolvedValue(['/path/to/file.ts']);
        const files = await findFiles();
        expect(files).toHaveLength(1);
        expect(files[0]).toBe('/path/to/file.ts');
        expect(fg).toHaveBeenCalledWith(
            expect.arrayContaining(['**/*.{js,jsx,ts,tsx,mjs,cjs,vue,svelte}']),
            expect.objectContaining({
                ignore: expect.arrayContaining(['**/node_modules/**']),
            })
        );
    });

    it('should respect custom include/exclude options', async () => {
        vi.mocked(fg).mockResolvedValue([]);
        await findFiles({
            include: ['**/*.custom'],
            exclude: ['**/ignored/**'],
        });
        expect(fg).toHaveBeenCalledWith(
            ['**/*.custom'],
            expect.objectContaining({
                ignore: ['**/ignored/**'],
            })
        );
    });

    it('should identify ignored files correctly', () => {
        expect(shouldIgnoreFile('node_modules/package/index.js')).toBe(true);
        expect(shouldIgnoreFile('src/index.ts')).toBe(false);
        expect(shouldIgnoreFile('.git/config')).toBe(true);
        expect(shouldIgnoreFile('dist/bundle.js')).toBe(true);
    });
});
