import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import qrcodeTerminal from 'qrcode-terminal';
import pino from 'pino';
import { paths, BOT_PREFIX } from './config.js';
import { handleMessage, extractText } from './lib/messageRouter.js';
import { startSuggestionsWatcher } from './lib/suggestionsWatcher.js';
import { getTargetGroup } from './lib/groupConfig.js';

const logger = pino({ level: 'silent' });

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState(paths.authDir);

  const sock = makeWASocket({
    auth: state,
    logger,
    printQRInTerminal: false,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('Escaneá este QR con WhatsApp (Dispositivos vinculados > Vincular un dispositivo):');
      qrcodeTerminal.generate(qr, { small: true });
    }

    if (connection === 'open') {
      console.log('Conectado a WhatsApp.');
      startSuggestionsWatcher({
        sendText: (text) => sendTextToTargetGroup(sock, text),
        sendImage: (buffer, caption) => sendImageToTargetGroup(sock, buffer, caption),
      });
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      if (statusCode === DisconnectReason.loggedOut) {
        console.log('Sesión cerrada desde el teléfono. Borrá la carpeta auth_info_baileys/ y volvé a correr el bot para reescanear el QR.');
      } else {
        console.log('Conexión perdida, reintentando...');
        start();
      }
    }
  });

  sock.ev.on('messages.upsert', ({ messages }) => {
    for (const msg of messages) {
      if (!msg.message) continue;
      // si el numero del bot es el mismo que el tuyo, tus mensajes tambien
      // llegan marcados "fromMe" — solo descartamos los que son del bot
      // mismo (arrancan con su emoji), no todo lo que venga de ese numero.
      if (msg.key.fromMe && extractText(msg).startsWith(BOT_PREFIX)) continue;
      if (!msg.key.remoteJid?.endsWith('@g.us')) continue;
      handleMessage(sock, msg).catch((err) => console.error('Error en handleMessage:', err));
    }
  });
}

function getTargetOrWarn(context) {
  const target = getTargetGroup();
  if (!target?.targetGroupJid) {
    console.warn(`No hay grupo activado todavía (mandá "T!activar" desde el grupo del equipo). ${context} perdido.`);
    return null;
  }
  return target.targetGroupJid;
}

// Devuelven la promesa del envío para que quien llama pueda esperar la entrega
// real (y saber si falló). Si no hay grupo activado, rechazan: así el watcher
// no marca la sugerencia como "avisada" cuando en realidad no se mandó nada.
function sendTextToTargetGroup(sock, text) {
  const jid = getTargetOrWarn('Aviso');
  if (!jid) return Promise.reject(new Error('no hay grupo activado'));
  return sock.sendMessage(jid, { text: BOT_PREFIX + text });
}

function sendImageToTargetGroup(sock, buffer, caption) {
  const jid = getTargetOrWarn('Aviso con captura');
  if (!jid) return Promise.reject(new Error('no hay grupo activado'));
  return sock.sendMessage(jid, { image: buffer, caption: BOT_PREFIX + caption });
}

start().catch((err) => {
  console.error('Error arrancando el bot:', err);
  process.exit(1);
});
