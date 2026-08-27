import { addSuggestion, listSuggestions, markSuggestion } from '../lib/suggestionsStore.js';
import { noteLocalChange } from '../lib/suggestionsWatcher.js';
import { formatSuggestionId } from '../lib/format.js';

export function addSuggestionCommand(text, authorJid, authorName) {
  const entry = addSuggestion({ text: text.trim(), author: authorJid, authorName });
  noteLocalChange(entry.id, entry.status);
  return `Anotada como sugerencia ${formatSuggestionId(entry.id)}. Gracias!`;
}

export function listSuggestionsCommand() {
  const list = listSuggestions().filter((s) => s.status !== 'hecho');
  if (list.length === 0) return 'No hay sugerencias pendientes ni en proceso ahora mismo.';
  const byStatus = { pendiente: [], en_proceso: [] };
  for (const s of list) {
    (byStatus[s.status] || (byStatus[s.status] = [])).push(s);
  }
  const lines = [];
  if (byStatus.en_proceso?.length) {
    lines.push('🔧 En proceso:');
    for (const s of byStatus.en_proceso) lines.push(`  ${formatSuggestionId(s.id)} — ${s.text}`);
  }
  if (byStatus.pendiente?.length) {
    lines.push('📋 Pendientes:');
    for (const s of byStatus.pendiente) lines.push(`  ${formatSuggestionId(s.id)} — ${s.text}`);
  }
  return lines.join('\n');
}

const VALID_STATUSES = ['pendiente', 'en_proceso', 'hecho'];

export function markSuggestionCommand(idText, statusText) {
  const id = parseInt(idText, 10);
  if (Number.isNaN(id)) return 'Decime el número de sugerencia, ej: "T!marcar 3 hecho"';
  const status = (statusText || '').trim().toLowerCase();
  if (!VALID_STATUSES.includes(status)) {
    return `Estado inválido. Usá uno de: ${VALID_STATUSES.join(', ')}`;
  }
  const entry = markSuggestion(id, status);
  if (!entry) return `No encontré la sugerencia ${formatSuggestionId(id)}.`;
  noteLocalChange(entry.id, entry.status);
  return `Listo, sugerencia ${formatSuggestionId(id)} ahora está "${status}".`;
}
