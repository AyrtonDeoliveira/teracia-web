export function helpText() {
  return [
    'Comandos (mencioname junto con uno de estos):',
    '',
    '• sugerencia: <texto> — anota una sugerencia nueva',
    '• sugerencias / pendientes — lista lo pendiente y en proceso',
    '• marcar <id> <pendiente|en_proceso|hecho> — cambia el estado a mano',
    '• buscar <palabra> / grep <palabra> — busca esa palabra en el código',
    '• captura [mvp] [sección] — screenshot de la página o del mvp',
    '• pdf — exporta la página en PDF',
    '• sprites — lista los sprites que hay ahora',
    '• cambios / últimos cambios — últimos commits del repo',
    '• activar — registra este grupo para recibir avisos de sugerencias',
    '• ayuda — este mensaje',
  ].join('\n');
}
