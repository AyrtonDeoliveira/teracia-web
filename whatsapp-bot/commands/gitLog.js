import { execFile } from 'node:child_process';
import { paths } from '../config.js';

export function gitLogText() {
  return new Promise((resolve) => {
    execFile(
      'git',
      ['log', '-n', '5', '--date=short', '--pretty=format:%h %ad %s'],
      { cwd: paths.repoRoot },
      (err, stdout) => {
        if (err) {
          resolve('No pude leer el historial de git: ' + err.message);
          return;
        }
        resolve('Últimos cambios:\n' + stdout.trim());
      }
    );
  });
}
