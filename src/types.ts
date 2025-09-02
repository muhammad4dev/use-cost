/**
 * Represents information about an import statement
 */
export interface ImportInfo {
    /** The package name being imported */
    source: string;
    /** The specific items being imported (empty array for default imports) */
    specifiers: string[];
    /** The type of import */
    type: 'import' | 'require' | 'dynamic';
    /** The file containing this import */
    file: string;
    /** The line number of the import */
    line: number;
}

/**
 * Size information for a bundled import
 */
export interface SizeInfo {
    /** The import that was analyzed */
    import: ImportInfo;
    /** Size metrics in bytes */
    size: {
        /** Raw bundle size */
        raw: number;
        /** Minified size */
        minified: number;
        /** Gzipped size */
        gzipped: number;
    };
    /** Analysis duration in milliseconds */
    duration: number;
}

/**
 * Analysis result for a project
 */
export interface AnalysisResult {
    /** All analyzed imports with their sizes */
    imports: SizeInfo[];
    /** Summary statistics */
    summary: {
        /** Total number of unique packages */
        totalPackages: number;
        /** Total raw size in bytes */
        totalRaw: number;
        /** Total minified size in bytes */
        totalMinified: number;
        /** Total gzipped size in bytes */
        totalGzipped: number;
        /** Analysis duration in milliseconds */
        duration: number;
    };
}

/**
 * Configuration options for analysis
 */
export interface AnalysisOptions {
    /** Project root directory */
    cwd?: string;
    /** File patterns to include */
    include?: string[];
    /** File patterns to exclude */
    exclude?: string[];
    /** Enable caching */
    cache?: boolean;
    /** Cache directory */
    cacheDir?: string;
    /** Show progress indicators */
    progress?: boolean;
}

/**
 * Output format options
 */
export type OutputFormat = 'table' | 'json' | 'html';
