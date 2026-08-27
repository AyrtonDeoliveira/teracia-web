import fs from 'node:fs';
import chokidar from 'chokidar';
import { paths } from '../config.js';
import { listSuggestions } from './suggestionsStore.js';
import { formatSuggestionId } from './format.js';
import { takeScreenshot } from '../commands/screenshot.js';

function readAnnouncedState() {
  if (!fs.existsSync(paths.announcedStateFile)) return null;
  try {
    const raw = fs.readFileSync(paths.announcedStateFile, 'utf8').trim();
    return raw ? JSON.parse(raw) : {};
  } catch {
    return null;
  }
}

function writeAnnouncedState(state) {
  fs.mkdirSync(paths.dataDir, { recursive: true });
  fs.writeFileSync(paths.announcedStateFile, JSON.stringify(state, null, 2) + '\n', 'utf8');
}

function stateFromList(list) {
  const state = {};
  for (const s of list) state[s.id] = s.status;
  return state;
}

const STATUS_PHRASE = {
  pendiente: 'volvió a estar pendiente',
  en_proceso: 'está en proceso',
  hecho: 'está completa',
};

const STATUS_ICON = {
  pendiente: '📋',
  en_proceso: '🔧',
  hecho: '✅',
};

function announcementText(suggestion) {
  const icon = STATUS_ICON[suggestion.status] || '•';
  const phrase = STATUS_PHRASE[suggestion.status] || `cambió a "${suggestion.status}"`;
  const author = suggestion.authorName || 'desconocido';
  return `${icon} La sugerencia ${formatSuggestionId(suggestion.id)}: ${suggestion.text}. Autor: ${author}. ${phrase[0].toUpperCase()}${phrase.slice(1)}.`;
}

let announced = null;

/**
 * Permite que un comando disparado desde el propio bot (agregar/marcar una
 * sugerencia) le avise al watcher "esto ya lo anuncié yo, no lo vuelvas a
 * anunciar cuando veas el archivo cambiar" — evita duplicar el aviso cuando
 * el cambio no vino de afuera (de Claude Code) sino del propio WhatsApp.
 */
export function noteLocalChange(id, status) {
  if (!announced) return;
  announced[id] = status;
  writeAnnouncedState(announced);
}

async function announceChange(suggestion, { sendText, sendImage }) {
  const text = announcementText(suggestion);

  if (suggestion.status === 'hecho' && suggestion.screenshotHint !== null && suggestion.screenshotHint !== undefined) {
    try {
      const buffer = await takeScreenshot(suggestion.screenshotHint);
      await sendImage(buffer, text);
      return;
    } catch (err) {
      console.error('No pude sacar la captura para el aviso de la sugerencia', suggestion.id, err);
      // sigue abajo y manda el aviso solo en texto
    }
  }

  await sendText(text);
}

export function startSuggestionsWatcher({ sendText, sendImage }) {
  announced = readAnnouncedState();
  const currentList = listSuggestions();
  const currentState = stateFromList(currentList);

  if (announced === null) {
    // primera vez que corre el watcher: no avisar retroactivamente de todo lo que ya había
    announced = currentState;
    writeAnnouncedState(announced);
  } else {
    const changedLines = [];
    for (const s of currentList) {
      if (announced[s.id] !== s.status) {
        changedLines.push(announcementText(s));
      }
    }
    if (changedLines.length > 0) {
      sendText(`Mientras estaba desconectado:\n${changedLines.join('\n')}`);
    }
    announced = currentState;
    writeAnnouncedState(announced);
  }

  const watcher = chokidar.watch(paths.suggestionsFile, {
    awaitWriteFinish: { stabilityThreshold: 300, pollInterval: 100 },
  });

  watcher.on('change', async () => {
    let list;
    try {
      list = listSuggestions();
    } catch {
      // archivo a medio escribir; el proximo evento estable lo captura bien
      return;
    }
    for (const s of list) {
      if (announced[s.id] !== s.status) {
        await announceChange(s, { sendText, sendImage });
        announced[s.id] = s.status;
        writeAnnouncedState(announced);
      }
    }
  });

  return watcher;
}
