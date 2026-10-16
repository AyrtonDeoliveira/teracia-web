(() => {
  'use strict';

  function initialize() {
    if (!window.GameUI) return;

    // La cuadrícula va sola en el espacio central. El estado y las acciones
    // permanecen en los paneles de la interfaz entregada por el usuario.
    const game = document.querySelector('main');
    const board = game?.querySelector('#marcoTablero');
    const characterPanel = document.querySelector('.character-panel');
    const abilities = document.getElementById('pane-abilities');
    const description = document.getElementById('description-panel');
    const controls = game?.querySelector('.col-tablero');
    const details = game?.querySelector('.col-lateral');

    if (board && abilities && description && controls) {
      // El tablero necesita una fila propia entre la ficha y el inventario;
      // dentro de `main` quedaba atrapado en la columna angosta del MVP viejo.
      let stage = document.getElementById('game-stage');
      if (!stage && characterPanel) {
        stage = document.createElement('section');
        stage.id = 'game-stage';
        stage.className = 'game-section';
        stage.setAttribute('aria-label', 'Espacio de juego');
        const frame = document.createElement('div');
        frame.className = 'game-stage';
        const content = document.createElement('div');
        content.id = 'game-content';
        const roster = document.createElement('aside');
        roster.id = 'combat-roster';
        roster.className = 'battle-rail battle-roster';
        roster.setAttribute('aria-label', 'Enemigos del combate');
        const rosterTitle = document.createElement('h2');
        rosterTitle.className = 'battle-rail-title';
        rosterTitle.textContent = 'Enemigos';
        roster.append(rosterTitle);
        const turns = document.createElement('aside');
        turns.id = 'turn-panel';
        turns.className = 'battle-rail turn-panel';
        turns.setAttribute('aria-label', 'Turnos del combate');
        const turnsTitle = document.createElement('h2');
        turnsTitle.className = 'battle-rail-title';
        turnsTitle.textContent = 'Turnos';
        turns.append(turnsTitle);
        const placeholder = document.createElement('div');
        placeholder.id = 'game-placeholder';
        placeholder.className = 'game-placeholder';
        placeholder.hidden = true;
        frame.append(roster, content, turns, placeholder);
        stage.append(frame);
        characterPanel.after(stage);
      }

      const abilityList = abilities.querySelector('#ability-list');
      const heading = abilities.querySelector('.pane-heading');
      if (heading) {
        heading.querySelector('.eyebrow')?.replaceChildren('Acciones de combate');
        heading.querySelector('.subtle')?.remove();
      }
      abilityList?.remove();
      const actionBar = controls.querySelector('.barra-acciones');
      if (actionBar) abilities.append(actionBar);

      const roster = document.getElementById('combat-roster');
      const playerCard = details?.querySelector('#fichaJugador');
      const bossCard = details?.querySelector('#fichaEnemigo');
      const allies = details?.querySelector('#fichasEnemigosSecundarios');
      if (playerCard) { playerCard.hidden = true; roster?.append(playerCard); }
      if (bossCard) {
        bossCard.classList.add('combatant-card');
        const portrait = document.createElement('img');
        portrait.id = 'spriteEnemigoFicha';
        portrait.className = 'combatant-sprite';
        portrait.src = '../pagina-teracia/Sprites/magoCazador.png';
        portrait.alt = 'Sprite del enemigo';
        bossCard.prepend(portrait);
        roster?.append(bossCard);
      }
      if (allies) roster?.append(allies);

      const turnPanel = document.getElementById('turn-panel');
      const banner = controls.querySelector('.banner-turno');
      const initiative = controls.querySelector('.orden-iniciativa');
      if (banner) turnPanel?.append(banner);
      if (initiative) turnPanel?.append(initiative);
      // El registro conserva su nodo para que la lógica existente siga
      // escribiendo en él, pero no forma parte de la pantalla nueva.
      details?.querySelector('.registro')?.remove();
      board.style.width = 'min(100%, 70vh, 680px)';
      board.style.aspectRatio = '1 / 1';
      window.GameUI.mountGame(board);
      game.remove();
    }

    document.addEventListener('gameui:rest', () => {
      const rest = document.getElementById('btnDescansar');
      if (rest && !rest.disabled) rest.click();
    });

    document.addEventListener('gameui:equipmentchange', event => {
      window.actualizarBonosEquipo?.(event.detail.equipment);
    });

    window.actualizarInterfazMesa?.();
  }

  if (window.GameUI) initialize();
  else document.addEventListener('gameui:ready', initialize, {once:true});
})();
