import { BOT_PREFIX } from '../config.js';
import { helpText } from '../commands/help.js';
import { gitLogText } from '../commands/gitLog.js';
import { spritesText } from '../commands/sprites.js';
import { searchText } from '../commands/search.js';
import { takeScreenshot, exportPdf } from '../commands/screenshot.js';
import { addSuggestionCommand, listSuggestionsCommand, markSuggestionCommand } from '../commands/suggestions.js';
import { activateGroupCommand } from '../commands/activateGroup.js';
import { getTargetGroup } from './groupConfig.js';

const PREFIX = /^t!\s*/i;

export function extractText(msg) {
  const m = msg.message;
  if (!m) return '';
  return m.extendedTextMessage?.text || m.conversation || '';
}

async function reply(sock, chatId, msg, text) {
  await sock.sendMessage(chatId, { text: BOT_PREFIX + text }, { quoted: msg });
}

async function replyImage(sock, chatId, msg, buffer, caption) {
  await sock.sendMessage(chatId, { image: buffer, caption: BOT_PREFIX + caption }, { quoted: msg });
}

async function replyDocument(sock, chatId, msg, buffer, fileName, mimetype, caption) {
  await sock.sendMessage(
    chatId,
    { document: buffer, fileName, mimetype, caption: BOT_PREFIX + caption },
    { quoted: msg }
  );
}

export async function handleMessage(sock, msg) {
  const rawText = extractText(msg).trim();
  if (!PREFIX.test(rawText)) return;

  const chatId = msg.key.remoteJid;
  const authorJid = msg.key.participant || msg.key.remoteJid;
  const authorName = msg.pushName || authorJid.split('@')[0];
  const text = rawText.replace(PREFIX, '').trim();

  // "activar" es el unico comando que funciona fuera del grupo ya
  // registrado, y solo mientras todavia no se registro ninguno — asi se
  // puede hacer el setup inicial, pero despues nadie puede "secuestrar" el
  // bot escribiendo el comando desde otro grupo random.
  if (/^activar\b/i.test(text)) {
    const existing = getTargetGroup();
    if (!existing?.targetGroupJid) {
      await reply(sock, chatId, msg, activateGroupCommand(chatId, authorJid));
    } else if (existing.targetGroupJid === chatId) {
      await reply(sock, chatId, msg, 'Este grupo ya estaba activado.');
    }
    // si ya hay un grupo activado y esto vino de OTRO grupo, se ignora en silencio
    return;
  }

  const target = getTargetGroup();
  if (target?.targetGroupJid !== chatId) {
    // no es el grupo activado (o todavia no se activo ninguno): no responder,
    // asi el bot no contesta en grupos de otros proyectos/trabajos
    return;
  }

  try {
    let m;

    if ((m = text.match(/^sugerencia\s*:\s*(.+)/is))) {
      await reply(sock, chatId, msg, addSuggestionCommand(m[1], authorJid, authorName));
      return;
    }

    if (/^(sugerencias|pendientes|en[_ ]proceso)\b/i.test(text)) {
      await reply(sock, chatId, msg, listSuggestionsCommand());
      return;
    }

    if ((m = text.match(/^marcar\s+(\d+)\s+(\w+)/i))) {
      await reply(sock, chatId, msg, markSuggestionCommand(m[1], m[2]));
      return;
    }

    if ((m = text.match(/^(?:buscar|buscá|grep)\s+(.+)/i))) {
      await reply(sock, chatId, msg, searchText(m[1]));
      return;
    }

    if (/\bpdf\b/i.test(text)) {
      const buffer = await exportPdf(text);
      await replyDocument(sock, chatId, msg, buffer, 'teracia.pdf', 'application/pdf', 'Acá va el PDF.');
      return;
    }

    if (/captura|screenshot/i.test(text)) {
      const buffer = await takeScreenshot(text);
      await replyImage(sock, chatId, msg, buffer, 'Acá va la captura.');
      return;
    }

    if (/sprites?/i.test(text)) {
      await reply(sock, chatId, msg, spritesText());
      return;
    }

    if (/cambios|últimos cambios|ultimos cambios|last changes|novedades/i.test(text)) {
      await reply(sock, chatId, msg, await gitLogText());
      return;
    }

    // ayuda / cualquier cosa no reconocida
    await reply(sock, chatId, msg, helpText());
  } catch (err) {
    console.error('Error manejando comando:', err);
    await reply(sock, chatId, msg, 'Uh, algo falló haciendo eso. Probá de nuevo o mandá "ayuda".');
  }
}
