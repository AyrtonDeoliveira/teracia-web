import { setTargetGroup } from '../lib/groupConfig.js';

export function activateGroupCommand(groupJid, activatedBy) {
  setTargetGroup(groupJid, activatedBy);
  return 'Listo, este grupo va a recibir los avisos de sugerencias.';
}
