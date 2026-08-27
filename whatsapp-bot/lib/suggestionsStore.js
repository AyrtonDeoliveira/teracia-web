import fs from 'node:fs';
import path from 'node:path';
import { paths } from '../config.js';

function readAll() {
  if (!fs.existsSync(paths.suggestionsFile)) return [];
  const raw = fs.readFileSync(paths.suggestionsFile, 'utf8').trim();
  if (!raw) return [];
  return JSON.parse(raw);
}

function writeAll(list) {
  const dir = path.dirname(paths.suggestionsFile);
  const tmpFile = path.join(dir, `.sugerencias.json.tmp-${process.pid}-${Date.now()}`);
  fs.writeFileSync(tmpFile, JSON.stringify(list, null, 2) + '\n', 'utf8');
  fs.renameSync(tmpFile, paths.suggestionsFile);
}

export function listSuggestions() {
  return readAll();
}

export function addSuggestion({ text, author, authorName }) {
  const list = readAll();
  const nextId = list.reduce((max, s) => Math.max(max, s.id), 0) + 1;
  const now = new Date().toISOString();
  const entry = {
    id: nextId,
    text,
    author,
    authorName: authorName || (author ? author.split('@')[0] : 'desconocido'),
    status: 'pendiente',
    createdAt: now,
    updatedAt: now,
    notes: null,
    screenshotHint: null,
  };
  list.push(entry);
  writeAll(list);
  return entry;
}

const VALID_STATUSES = ['pendiente', 'en_proceso', 'hecho'];

export function markSuggestion(id, status, { notes, screenshotHint } = {}) {
  if (!VALID_STATUSES.includes(status)) {
    throw new Error(`Estado inválido: ${status}`);
  }
  const list = readAll();
  const entry = list.find((s) => s.id === id);
  if (!entry) return null;
  entry.status = status;
  entry.updatedAt = new Date().toISOString();
  if (notes) entry.notes = notes;
  if (screenshotHint !== undefined) entry.screenshotHint = screenshotHint;
  writeAll(list);
  return entry;
}
