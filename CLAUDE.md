# Teracia

RPG táctico por turnos y casilleros. Este repo contiene:

- `pagina-teracia/` — sitio estático de marketing/demo (`index.html` + `Sprites/` + `Fuentes/`). HTML/CSS/JS plano, sin build.
- `mvp/` — prototipo jugable del combate (`index.html` + `sprites/`). También HTML/CSS/JS plano, sin build.
- `cosas D&D/`, `enemigos/`, `*.txt` — documentos de diseño (clases, enemigos, reglas, trama) en español.
- `sprites varios/` — sprites originales sin procesar.
- `whatsapp-bot/` — bot de WhatsApp del equipo (ver más abajo). Es el único subproyecto Node del repo; se corre aparte con `node index.js` desde dentro de esa carpeta — **nunca lo inicies vos mismo**, es un proceso persistente que el usuario deja corriendo en su PC.

Convención: los mensajes de commit van en español.

## Flujo de sugerencias del equipo (`sugerencias.json`)

El equipo manda sugerencias desde WhatsApp a través del bot, y quedan anotadas en `sugerencias.json` (raíz del repo). Es un array plano de objetos:

```json
{
  "id": 3,
  "text": "sería bueno que el arquero tenga más alcance",
  "author": "5491122334455@s.whatsapp.net",
  "authorName": "Juan",
  "status": "pendiente",
  "createdAt": "2026-08-26T18:00:00.000Z",
  "updatedAt": "2026-08-26T18:00:00.000Z",
  "notes": null
}
```

`status` es `"pendiente" | "en_proceso" | "hecho"`.

**Instrucciones para vos (Claude):**

1. Al empezar una sesión de trabajo en este repo, revisá `sugerencias.json`. Si hay entradas `pendiente`, tenelas en cuenta — si el usuario te pide "segui con lo que falta" o algo similar, o si una sugerencia pendiente es claramente relevante a lo que ya te está pidiendo, procesala.
2. Al arrancar una sugerencia: marcala `en_proceso` (actualizando `updatedAt`) y guardá el archivo **antes** de empezar a programar el cambio, como un paso propio (no lo mezcles en el mismo commit que edits no relacionados).
3. Al terminarla: marcala `hecho`, actualizá `updatedAt`, y si querés dejá una línea corta en `notes` describiendo qué se hizo.
4. Nunca borres ni reordenes entradas del array. Reescribí siempre el archivo completo, con indentación de 2 espacios.
5. Hay un proceso aparte (`whatsapp-bot`) vigilando este archivo para avisarle al equipo por WhatsApp cuando una sugerencia cambia de estado — por eso el cambio de `status` tiene que quedar guardado (y comiteado) como su propio paso, no silenciado dentro de otro cambio.
6. No toques `whatsapp-bot/auth_info_baileys/` ni `whatsapp-bot/data/` — son credenciales y estado local de esa máquina, están en `.gitignore` a propósito.
