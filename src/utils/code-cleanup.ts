import type { SupportedLanguage } from './judge0-langs';

export function cleanupImports(code: string, language: SupportedLanguage): string {
  const importPatterns: Partial<Record<SupportedLanguage, RegExp[]>> = {
    'cpp': [/#include\s*<[^>]+>/g],
    'java': [/import\s+[^;]+;/g],
    'python': [/^from\s+[\w.]+\s+import\s+.*$/gm, /^import\s+.*$/gm],
    'go': [/^import\s*\([^)]*\)/gm, /^import\s+".*?"$/gm],
  };

  if (!importPatterns[language]) return code;

  const patterns = importPatterns[language] || [];
  const imports = new Set<string>();
  let cleanCode = code;

  for (const pattern of patterns) {
    const matches = code.match(pattern) || [];
    for (const match of matches) {
      imports.add(match.trim());
    }
    cleanCode = cleanCode.replace(pattern, '');
  }

  let importSection = '';
  if (language === 'go' && imports.size > 0) {
    importSection = `import (\n  ${Array.from(imports).join('\n  ')}\n)\n`;
  } else if (imports.size > 0) {
    importSection = `${Array.from(imports).join('\n')}\n`;
  }

  return importSection + cleanCode.trim();
}