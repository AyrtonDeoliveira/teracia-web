import baileysPkg from '@whiskeysockets/baileys';
import qrcodeTerminal from 'qrcode-terminal';
import pino from 'pino';
import { paths, BOT_PREFIX } from './config.js';
import { handleMessage } from './lib/messageRouter.js';
import { startSuggestionsWatcher } from './lib/suggestionsWatcher.js';
import { getTargetGroup } from './lib/groupConfig.js';

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = baileysPkg;

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
      startSuggestionsWatcher((text) => sendToTargetGroup(sock, text));
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
      if (msg.key.fromMe) continue;
      if (!msg.key.remoteJid?.endsWith('@g.us')) continue;
      handleMessage(sock, msg).catch((err) => console.error('Error en handleMessage:', err));
    }
  });
}

function sendToTargetGroup(sock, text) {
  const target = getTargetGroup();
  if (!target?.targetGroupJid) {
    console.warn('No hay grupo activado todavía (mandá "activar" desde el grupo del equipo). Mensaje perdido:', text);
    return;
  }
  sock.sendMessage(target.targetGroupJid, { text: BOT_PREFIX + text }).catch((err) => {
    console.error('Error mandando aviso al grupo:', err);
  });
}

start().catch((err) => {
  console.error('Error arrancando el bot:', err);
  process.exit(1);
});
