import fs from 'node:fs';
import { paths } from '../config.js';

const IMAGE_EXT = /\.(png|jpg|jpeg|gif|webp)$/i;

function listImages(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => IMAGE_EXT.test(f));
}

export function spritesText() {
  const site = listImages(paths.siteSprites);
  const mvp = listImages(paths.mvpSprites);
  const lines = [];
  lines.push(`Sprites de la página (${site.length}):`);
  lines.push(site.length ? site.map((f) => `  - ${f}`).join('\n') : '  (ninguno)');
  lines.push(`Sprites del MVP (${mvp.length}):`);
  lines.push(mvp.length ? mvp.map((f) => `  - ${f}`).join('\n') : '  (ninguno)');
  return lines.join('\n');
}
