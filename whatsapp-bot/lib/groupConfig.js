import fs from 'node:fs';
import { paths } from '../config.js';

function ensureDataDir() {
  if (!fs.existsSync(paths.dataDir)) fs.mkdirSync(paths.dataDir, { recursive: true });
}

export function getTargetGroup() {
  if (!fs.existsSync(paths.groupConfigFile)) return null;
  try {
    const raw = fs.readFileSync(paths.groupConfigFile, 'utf8').trim();
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setTargetGroup(groupJid, activatedBy) {
  ensureDataDir();
  const data = {
    targetGroupJid: groupJid,
    activatedAt: new Date().toISOString(),
    activatedBy: activatedBy || null,
  };
  fs.writeFileSync(paths.groupConfigFile, JSON.stringify(data, null, 2) + '\n', 'utf8');
  return data;
}
