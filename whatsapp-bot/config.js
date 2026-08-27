import path from 'node:path';
import { fileURLToPath } from 'node:url';

const botDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(botDir, '..');

export const paths = {
  repoRoot,
  botDir,
  authDir: path.join(botDir, 'auth_info_baileys'),
  dataDir: path.join(botDir, 'data'),
  groupConfigFile: path.join(botDir, 'data', 'group-config.json'),
  announcedStateFile: path.join(botDir, 'data', 'announced-state.json'),
  suggestionsFile: path.join(repoRoot, 'sugerencias.json'),
  siteHtml: path.join(repoRoot, 'pagina-teracia', 'index.html'),
  siteSprites: path.join(repoRoot, 'pagina-teracia', 'Sprites'),
  mvpHtml: path.join(repoRoot, 'mvp', 'index.html'),
  mvpSprites: path.join(repoRoot, 'mvp', 'sprites'),
};

export const siteSections = ['mundo', 'personaje', 'combate', 'clases', 'aventura', 'enemigos', 'taller', 'steam'];

export const BOT_PREFIX = '🤖 ';
