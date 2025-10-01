# use-cost

> 📦 Analyze JavaScript/TypeScript imports and display bundle size reports

A fast, modern CLI tool that analyzes your project's imports and calculates their bundle sizes. Built with TypeScript, powered by esbuild.

## Features

- ⚡️ **Fast Analysis** - Powered by esbuild for lightning-fast bundling
- 🎯 **Framework Agnostic** - Supports JavaScript, TypeScript, Vue, Svelte, and Angular
- 📊 **Multiple Output Formats** - Table, JSON, and HTML reports
- 💾 **Smart Caching** - Caches results to speed up subsequent analyses
- 🌳 **Tree-Shaking Aware** - Calculates actual bundle sizes with tree-shaking
- 🧹 **Unused Dependencies** - Detects dependencies installed but not used in your code
- 🎨 **Beautiful CLI** - Color-coded output with progress indicators

## Installation

```bash
# Using pnpm
pnpm add -D use-cost

# Using npm
npm install --save-dev use-cost

# Using yarn
yarn add -D use-cost
```

## Usage

### CLI

Analyze your project and display results in a table:

```bash
use-cost
```

Generate an HTML report:

```bash
use-cost --format html --output report.html
```

Export as JSON:

```bash
use-cost --format json --output analysis.json
```

### CLI Options

```
Options:
  -V, --version              output the version number
  -f, --format <type>        Output format (table, json, html) (default: "table")
  -o, --output <file>        Output file path
  --no-cache                 Disable caching
  --cache-dir <dir>          Cache directory (default: ".use-cost-cache")
  --include <patterns...>    File patterns to include
  --exclude <patterns...>    File patterns to exclude
  --cwd <dir>                Working directory (default: current directory)
  -h, --help                 display help for command
```

### Programmatic API

```typescript
import { analyzeProject } from 'use-cost';

const result = await analyzeProject({
  cwd: process.cwd(),
  cache: true,
  progress: true,
});

console.log(`Total packages: ${result.summary.totalPackages}`);
console.log(`Total gzipped: ${result.summary.totalGzipped} bytes`);
```

## Supported File Types

- **JavaScript**: `.js`, `.jsx`, `.mjs`, `.cjs`
- **TypeScript**: `.ts`, `.tsx`
- **Vue**: `.vue` (extracts `<script>` and `<script setup>` blocks)
- **Svelte**: `.svelte` (extracts `<script>` blocks)
- **Angular**: All `.ts` files (components, modules, services)

## How It Works

1. **File Discovery** - Finds all source files in your project
2. **Import Parsing** - Uses Babel AST parser to extract import statements
3. **Bundle Analysis** - Bundles each import with esbuild
4. **Size Calculation** - Calculates minified and gzipped sizes
5. **Caching** - Stores results for faster subsequent runs
6. **Reporting** - Generates formatted output

## Output Formats

### Table (Default)

```
┌─────────────────────┬──────────┬──────────┬──────────┐
│ Package             │ Raw      │ Minified │ Gzipped  │
├─────────────────────┼──────────┼──────────┼──────────┤
│ react               │ 320 KB   │ 120 KB   │ 40 KB    │
│ lodash              │ 540 KB   │ 70 KB    │ 25 KB    │
└─────────────────────┴──────────┴──────────┴──────────┘

Summary:
Total Packages: 2
Total Gzipped: 65 KB
```

### JSON

Structured data perfect for CI/CD integration:

```json
{
  "metadata": {
    "timestamp": "2025-12-01T20:00:00.000Z",
    "nodeVersion": "v24.11.1"
  },
  "summary": {
    "totalPackages": 2,
    "totalGzipped": 66560
  },
  "imports": [...]
}
```

### HTML

Beautiful, interactive HTML report with charts and sortable tables.

## Examples

### Analyze a specific directory

```bash
use-cost --cwd ./src
```

### Include only specific file patterns

```bash
use-cost --include "**/*.ts" "**/*.tsx"
```

### Exclude test files

```bash
use-cost --exclude "**/*.test.ts" "**/*.spec.ts"
```

### Disable caching

```bash
use-cost --no-cache
```

## Comparison with Similar Tools

| Feature | use-cost | Import Cost (VSCode) | webpack-bundle-analyzer |
|---------|----------|---------------------|------------------------|
| CLI Tool | ✅ | ❌ | ❌ |
| Real-time Editor Feedback | ❌ | ✅ | ❌ |
| Framework Support | Vue, Svelte, Angular | Limited | N/A |
| Multiple Output Formats | ✅ | ❌ | ✅ |
| Caching | ✅ | ✅ | ❌ |
| CI/CD Integration | ✅ | ❌ | ✅ |

## Roadmap

- [ ] VSCode Extension
- [ ] Vite Plugin
- [ ] Threshold enforcement for CI/CD
- [ ] Historical size tracking
- [ ] Alternative package suggestions
- [ ] Bundle comparison for PRs

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © 2025

## Author

Built with ❤️ using TypeScript and esbuild
