/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Get color for size based on thresholds
 */
export function getSizeColor(bytes: number): 'green' | 'yellow' | 'red' {
    const kb = bytes / 1024;
    if (kb < 50) return 'green';
    if (kb < 200) return 'yellow';
    return 'red';
}

/**
 * Format duration in milliseconds
 */
export function formatDuration(ms: number): string {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
}
