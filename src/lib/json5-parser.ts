import JSON5 from 'json5';
import fs from 'fs';
import path from 'path';

export function toInlineCommentJsonc(json5FilePath: string): string {
  const fileContent = fs.readFileSync(json5FilePath, 'utf-8');
  const data = JSON5.parse(fileContent);

  const lines = fileContent.split('\n');
  const comments: Record<string, string> = {};

  let lastComment: string | null = null;
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('//')) {
      lastComment = trimmedLine.substring(2).trim();
    } else if (lastComment && trimmedLine.includes(':')) {
      const key = trimmedLine.split(':')[0].replace(/"/g, '').trim();
      comments[key] = lastComment;
      lastComment = null;
    }
  }

  function toInlineCommentJsoncRecursive(obj: Record<string, any>, comments: Record<string, string>): string {
    const entries = Object.entries(obj).map(([key, value]) => {
      const jsonValue = JSON.stringify(value, null, 2);
      const comment = comments[key] ? ` // ${comments[key]}` : "";
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const nestedJsonc = toInlineCommentJsoncRecursive(value, comments);
        return `  "${key}": ${nestedJsonc},${comment}`;
      }
      return `  "${key}": ${jsonValue},${comment}`;
    });

    if (entries.length > 0) {
      entries[entries.length - 1] = entries[entries.length - 1].replace(/,(?=\s*\/\/|$)/, '');
    }

    return `{\n${entries.join("\n")}\n}`;
  }

  return toInlineCommentJsoncRecursive(data, comments);
}
