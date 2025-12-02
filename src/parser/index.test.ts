import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseFile } from './index.js';
import * as fileFinder from '../utils/file-finder.js';

vi.mock('../utils/file-finder.js');

describe('Parser', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should parse JavaScript imports', () => {
    vi.mocked(fileFinder.readFileContent).mockReturnValue('import foo from "bar";');
    const imports = parseFile('test.js');
    expect(imports).toHaveLength(1);
    expect(imports[0].source).toBe('bar');
    expect(imports[0].specifiers).toContain('default');
  });

  it('should parse TypeScript imports', () => {
    vi.mocked(fileFinder.readFileContent).mockReturnValue('import { foo } from "bar";');
    const imports = parseFile('test.ts');
    expect(imports).toHaveLength(1);
    expect(imports[0].source).toBe('bar');
    expect(imports[0].specifiers).toContain('foo');
  });

  it('should parse Vue SFC imports', () => {
    const vueContent = `
<script setup>
import foo from "bar";
</script>
<template>
  <div></div>
</template>
`;
    vi.mocked(fileFinder.readFileContent).mockReturnValue(vueContent);
    const imports = parseFile('test.vue');
    expect(imports).toHaveLength(1);
    expect(imports[0].source).toBe('bar');
  });

  it('should parse Svelte imports', () => {
    const svelteContent = `
<script>
import foo from "bar";
</script>
<div></div>
`;
    vi.mocked(fileFinder.readFileContent).mockReturnValue(svelteContent);
    const imports = parseFile('test.svelte');
    expect(imports).toHaveLength(1);
    expect(imports[0].source).toBe('bar');
  });

  it('should ignore local imports', () => {
    vi.mocked(fileFinder.readFileContent).mockReturnValue('import foo from "./local";');
    const imports = parseFile('test.js');
    expect(imports).toHaveLength(0);
  });

  it('should handle require calls', () => {
    vi.mocked(fileFinder.readFileContent).mockReturnValue('const foo = require("bar");');
    const imports = parseFile('test.js');
    expect(imports).toHaveLength(1);
    expect(imports[0].source).toBe('bar');
    expect(imports[0].type).toBe('require');
  });

  it('should handle dynamic imports', () => {
    vi.mocked(fileFinder.readFileContent).mockReturnValue('import("bar");');
    const imports = parseFile('test.js');
    expect(imports).toHaveLength(1);
    expect(imports[0].source).toBe('bar');
    expect(imports[0].type).toBe('dynamic');
  });
});
