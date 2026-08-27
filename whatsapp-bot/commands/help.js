export function helpText() {
  return [
    'Comandos (arrancá el mensaje con "T!"):',
    '',
    '• T!sugerencia: <texto> — anota una sugerencia nueva',
    '• T!sugerencias / T!pendientes — lista lo pendiente y en proceso',
    '• T!marcar <id> <pendiente|en_proceso|hecho> — cambia el estado a mano',
    '• T!buscar <palabra> / T!grep <palabra> — busca esa palabra en el código',
    '• T!captura [mvp] [sección] — screenshot de la página o del mvp',
    '• T!pdf — exporta la página en PDF',
    '• T!sprites — lista los sprites que hay ahora',
    '• T!cambios / T!últimos cambios — últimos commits del repo',
    '• T!ayuda — este mensaje',
    '',
    '(el bot solo responde en este grupo, el que se activó con "T!activar")',
  ].join('\n');
}
