# Teracia

RPG táctico por turnos y casilleros. Este repo contiene:

- `pagina-teracia/` — sitio estático de marketing/demo (`index.html` + `Sprites/` + `Fuentes/`). HTML/CSS/JS plano, sin build.
- `mvp/` — prototipo jugable del combate (`index.html` + `sprites/`). También HTML/CSS/JS plano, sin build.
- `cosas D&D/`, `enemigos/`, `*.txt` — documentos de diseño (clases, enemigos, reglas, trama) en español.
- `sprites varios/` — sprites originales sin procesar.
- `whatsapp-bot/` — bot de WhatsApp del equipo (ver más abajo). Es el único subproyecto Node del repo; se corre aparte con `node index.js` desde dentro de esa carpeta — **nunca lo inicies vos mismo**, es un proceso persistente que el usuario deja corriendo en su PC.

Convención: los mensajes de commit van en español.

## `sugerencias.json` — qué es, para qué sirve, y por qué existe

**Si estás leyendo esto en una sesión de Codex nueva, en otra PC, sin memoria de conversaciones anteriores: esto es para vos. Leé toda esta sección antes de tocar nada del proyecto.**

### Qué es

Ayrton (el dueño del proyecto) tiene un bot de WhatsApp (`whatsapp-bot/`, ver más arriba) conectado al grupo de su equipo. Cuando alguien del equipo le escribe al bot un mensaje que arranca con `T!` (por ejemplo `T!sugerencia: sería bueno que el arquero tenga más alcance`), el bot anota esa sugerencia en este archivo, `sugerencias.json`, en la raíz del repo.

### Para qué sirve / por qué existe

Ayrton no siempre puede estar viendo el grupo de WhatsApp. La idea es que ninguna sugerencia del equipo se pierda: quedan guardadas acá, en el repo, así viajan de PC en PC junto con el resto del código (por git). Cuando Ayrton (en cualquier PC, con cualquier sesión de Codex) te pida trabajar en el proyecto, **vos sos el que cierra el círculo**: revisás qué sugerencias hay pendientes, las vas resolviendo, y marcás el archivo — el bot de WhatsApp (que corre aparte, en la PC de Ayrton) detecta esos cambios de estado y le avisa solo al equipo. Así el equipo sabe que su sugerencia fue vista y qué pasó con ella, sin que Ayrton tenga que escribirles a mano.

### El archivo

Es un array plano de objetos. Ejemplo con una sugerencia de cada estado:

```json
[
  {
    "id": 3,
    "text": "sería bueno que el arquero tenga más alcance",
    "author": "5491122334455@s.whatsapp.net",
    "authorName": "Juan",
    "status": "pendiente",
    "createdAt": "2026-08-26T18:00:00.000Z",
    "updatedAt": "2026-08-26T18:00:00.000Z",
    "notes": null,
    "screenshotHint": null
  }
]
```

Campos:
- `id`: número entero, autoincremental (el bot lo asigna al crear la sugerencia; vos nunca lo cambiás). En los mensajes de WhatsApp y al hablar de una sugerencia se muestra con formato `#001` (3 dígitos), pero en el JSON es un número plano (`1`, no `"001"`).
- `text`: el pedido tal cual lo escribió la persona.
- `author` / `authorName`: quién lo pidió (JID de WhatsApp y nombre para mostrar).
- `status`: `"pendiente" | "en_proceso" | "hecho"`.
- `notes`: opcional — una línea corta que vos escribís al cerrar la sugerencia, describiendo qué se hizo. `null` si no hay nada que aclarar.
- `screenshotHint`: opcional, lo llenás vos (ver más abajo).

### Instrucciones para vos (Codex), paso a paso

1. **Al empezar cualquier sesión de trabajo en este repo**, leé `sugerencias.json` — sin que haga falta que el usuario te lo pida. Es tu forma de estar al tanto de lo que el equipo necesita, incluso si Ayrton se olvidó de mencionarlo o si otra sesión de Codex (en otra PC) cambió algo desde la última vez que viste el repo.
2. Si hay entradas `pendiente`: si el usuario te pide "seguí con lo que falta" (o algo similar), o si una sugerencia pendiente es claramente relevante a lo que ya te está pidiendo, resolvela vos mismo sin esperar que te la repita — para eso está este archivo.
3. **Si el texto de una sugerencia es ambiguo, incompleto, o no entendés bien qué se pide:** no adivines ni la ignores. Preguntale al usuario (a Ayrton, en el chat) qué quiso decir esa sugerencia antes de marcarla `en_proceso` o tocar código. Él va a responderte directo, o va a preguntarle al equipo si hace falta — no lo resuelvas por tu cuenta con una interpretación incierta.
4. **Al arrancar una sugerencia** (ya entendida, sin ambigüedad pendiente): marcala `en_proceso` (actualizando `updatedAt`) y guardá el archivo **antes** de empezar a programar el cambio, como un paso propio y commiteado aparte (no lo mezcles en el mismo commit que edits no relacionados). El bot avisa al grupo apenas detecta este cambio.
5. **Al terminarla:**
   - Marcala `hecho`, actualizá `updatedAt`, y dejá en `notes` una línea corta describiendo qué se hizo.
   - Si el cambio es algo visible en la página o el MVP (no si es, por ejemplo, un fix interno del bot o un doc de diseño), completá `screenshotHint` para que el aviso de WhatsApp incluya una captura automática. El valor es el mismo texto que usarías después de `T!captura` en WhatsApp:
     - `""` (string vacío) → captura de toda la página (`pagina-teracia/index.html`).
     - `"combate"`, `"clases"`, `"personaje"`, `"mundo"`, `"aventura"`, `"enemigos"`, `"taller"`, `"steam"` → esa sección de la página.
     - `"mvp"` → el prototipo jugable completo; `"mvp tablero"` → solo el tablero del MVP.
   - Si el cambio **no** es visual, dejá `screenshotHint` en `null` — el bot va a avisar solo con texto, sin intentar sacar una captura que no tendría sentido.
   - Guardá este cambio de estado como su propio paso (commit aparte), igual que en el punto 4.
6. Nunca borres ni reordenes entradas del array. Reescribí siempre el archivo completo, con indentación de 2 espacios.
7. No toques `whatsapp-bot/auth_info_baileys/` ni `whatsapp-bot/data/` — son credenciales y estado local de esa máquina, están en `.gitignore` a propósito y nunca viajan por git.
