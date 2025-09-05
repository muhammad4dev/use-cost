import { parse as babelParse } from '@babel/parser';
import { parse as vueParse } from '@vue/compiler-sfc';
import { parse as svelteParse } from 'svelte/compiler';
import type { ImportInfo } from '../types.js';
import { readFileContent } from '../utils/file-finder.js';
import { isLocalPackage } from '../utils/package-resolver.js';

/**
 * Extract script content from Vue SFC
 */
function extractVueScript(content: string): string {
    try {
        const { descriptor } = vueParse(content);
        const scripts: string[] = [];

        if (descriptor.script) {
            scripts.push(descriptor.script.content);
        }
        if (descriptor.scriptSetup) {
            scripts.push(descriptor.scriptSetup.content);
        }

        return scripts.join('\n');
    } catch (error) {
        console.warn('Failed to parse Vue file:', error);
        return '';
    }
}

/**
 * Extract script content from Svelte component
 */
function extractSvelteScript(content: string): string {
    try {
        const ast = svelteParse(content);
        const scripts: string[] = [];

        if (ast.instance) {
            scripts.push(content.substring(ast.instance.content.start, ast.instance.content.end));
        }
        if (ast.module) {
            scripts.push(content.substring(ast.module.content.start, ast.module.content.end));
        }

        return scripts.join('\n');
    } catch (error) {
        console.warn('Failed to parse Svelte file:', error);
        return '';
    }
}

/**
 * Parse JavaScript/TypeScript code and extract imports
 */
function parseJavaScript(code: string, filePath: string): ImportInfo[] {
    const imports: ImportInfo[] = [];

    try {
        const ast = babelParse(code, {
            sourceType: 'module',
            plugins: [
                'typescript',
                'jsx',
                'decorators-legacy',
                'classProperties',
                'dynamicImport',
            ],
        });

        ast.program.body.forEach((node) => {
            // Handle import declarations
            if (node.type === 'ImportDeclaration') {
                const source = node.source.value;

                // Skip local imports
                if (isLocalPackage(source)) return;

                const specifiers: string[] = [];
                node.specifiers.forEach((spec) => {
                    if (spec.type === 'ImportDefaultSpecifier') {
                        specifiers.push('default');
                    } else if (spec.type === 'ImportNamespaceSpecifier') {
                        specifiers.push('*');
                    } else if (spec.type === 'ImportSpecifier') {
                        specifiers.push(spec.imported.type === 'Identifier' ? spec.imported.name : spec.imported.value);
                    }
                });

                imports.push({
                    source,
                    specifiers,
                    type: 'import',
                    file: filePath,
                    line: node.loc?.start.line || 0,
                });
            }

            // Handle require() calls
            if (
                node.type === 'VariableDeclaration' &&
                node.declarations.length > 0
            ) {
                node.declarations.forEach((decl) => {
                    if (
                        decl.init &&
                        decl.init.type === 'CallExpression' &&
                        decl.init.callee.type === 'Identifier' &&
                        decl.init.callee.name === 'require' &&
                        decl.init.arguments.length > 0 &&
                        decl.init.arguments[0].type === 'StringLiteral'
                    ) {
                        const source = decl.init.arguments[0].value;

                        // Skip local imports
                        if (isLocalPackage(source)) return;

                        imports.push({
                            source,
                            specifiers: [],
                            type: 'require',
                            file: filePath,
                            line: node.loc?.start.line || 0,
                        });
                    }
                });
            }

            // Handle dynamic imports
            if (
                node.type === 'ExpressionStatement' &&
                node.expression.type === 'CallExpression' &&
                node.expression.callee.type === 'Import' &&
                node.expression.arguments.length > 0 &&
                node.expression.arguments[0].type === 'StringLiteral'
            ) {
                const source = node.expression.arguments[0].value;

                // Skip local imports
                if (isLocalPackage(source)) return;

                imports.push({
                    source,
                    specifiers: [],
                    type: 'dynamic',
                    file: filePath,
                    line: node.loc?.start.line || 0,
                });
            }
        });
    } catch (error) {
        console.warn(`Failed to parse file ${filePath}:`, error);
    }

    return imports;
}

/**
 * Parse a file and extract all imports
 */
export function parseFile(filePath: string): ImportInfo[] {
    const content = readFileContent(filePath);
    if (!content) return [];

    let codeToAnalyze = content;

    // Extract script content from framework files
    if (filePath.endsWith('.vue')) {
        codeToAnalyze = extractVueScript(content);
    } else if (filePath.endsWith('.svelte')) {
        codeToAnalyze = extractSvelteScript(content);
    }

    return parseJavaScript(codeToAnalyze, filePath);
}

/**
 * Parse multiple files and extract all imports
 */
export async function parseFiles(filePaths: string[]): Promise<ImportInfo[]> {
    const allImports: ImportInfo[] = [];

    for (const filePath of filePaths) {
        const imports = parseFile(filePath);
        allImports.push(...imports);
    }

    return allImports;
}
