import fs from 'node:fs';
import chokidar from 'chokidar';
import { paths } from '../config.js';
import { listSuggestions } from './suggestionsStore.js';

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

const STATUS_LABEL = {
  pendiente: 'pendiente',
  en_proceso: 'en proceso',
  hecho: 'hecha',
};

function announcementLine(id, text, status) {
  const icon = status === 'hecho' ? '✅' : status === 'en_proceso' ? '🔧' : '📋';
  const verb = status === 'hecho' ? 'ya está' : 'pasó a';
  return `${icon} Sugerencia #${id} (${text}) ${verb} ${STATUS_LABEL[status] || status}`;
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

export function startSuggestionsWatcher(sendToTargetGroup) {
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
        changedLines.push(announcementLine(s.id, s.text, s.status));
      }
    }
    if (changedLines.length > 0) {
      sendToTargetGroup(`Mientras estaba desconectado:\n${changedLines.join('\n')}`);
    }
    announced = currentState;
    writeAnnouncedState(announced);
  }

  const watcher = chokidar.watch(paths.suggestionsFile, {
    awaitWriteFinish: { stabilityThreshold: 300, pollInterval: 100 },
  });

  watcher.on('change', () => {
    let list;
    try {
      list = listSuggestions();
    } catch {
      // archivo a medio escribir; el proximo evento estable lo captura bien
      return;
    }
    for (const s of list) {
      if (announced[s.id] !== s.status) {
        sendToTargetGroup(announcementLine(s.id, s.text, s.status));
        announced[s.id] = s.status;
        writeAnnouncedState(announced);
      }
    }
  });

  return watcher;
}
