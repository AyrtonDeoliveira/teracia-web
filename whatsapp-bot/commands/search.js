import fs from 'node:fs';
import path from 'node:path';
import { paths } from '../config.js';

const MAX_MATCHES = 6;
const MAX_REPLY_CHARS = 1500;

function searchInFile(filePath, keyword) {
  if (!fs.existsSync(filePath)) return [];
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  const needle = keyword.toLowerCase();
  const results = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes(needle)) {
      const context = lines[i - 1] !== undefined ? lines[i - 1].trim() : '';
      results.push({
        file: path.basename(path.dirname(filePath)) + '/' + path.basename(filePath),
        lineNumber: i + 1,
        line: lines[i].trim(),
        context,
      });
    }
  }
  return results;
}

export function searchText(keyword) {
  if (!keyword || !keyword.trim()) {
    return 'Decime qué palabra buscar, ej: "buscar paladin"';
  }
  const matches = [
    ...searchInFile(paths.siteHtml, keyword),
    ...searchInFile(paths.mvpHtml, keyword),
  ];
  if (matches.length === 0) {
    return `No encontré "${keyword}" en el código.`;
  }
  const shown = matches.slice(0, MAX_MATCHES);
  let reply = `Encontré ${matches.length} coincidencia(s) para "${keyword}":\n\n`;
  for (const m of shown) {
    reply += `${m.file}:${m.lineNumber}\n${m.context ? '  ' + m.context + '\n' : ''}> ${m.line}\n\n`;
  }
  if (matches.length > shown.length) {
    reply += `... ${matches.length - shown.length} más, afiná la búsqueda para verlas.`;
  }
  if (reply.length > MAX_REPLY_CHARS) {
    reply = reply.slice(0, MAX_REPLY_CHARS) + '\n... (recortado)';
  }
  return reply.trim();
}
