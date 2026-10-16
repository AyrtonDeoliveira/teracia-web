/* Capa de interfaz: no calcula daño, tiradas, descanso ni efectos de veneno. */
(() => {
  'use strict';
  const state = JSON.parse(JSON.stringify(window.GAME_UI_DATA));
  const inventory = new InventoryModel({items:state.items,equipment:state.equipment});
  const slotLabels = {casco:'Casco',pechera:'Pechera',amuleto:'Amuleto',anillo:'Anillo',arma:'Arma',pantalones:'Pantalones',botas:'Botas',guantes:'Guantes'};
  const $ = id => document.getElementById(id);
  $('selection-description').style.whiteSpace = 'pre-line';
  const labels = {name:'Nombre',race:'Raza',class:'Clase',level:'Nivel',status:'Estado',health:'Vida',damage:'Daño',resource:'Recurso',v:'V',d:'D',die:'Tirada de acción',poison:'Veneno',portrait:'Retrato del personaje'};
  let selected = null;
  let activeTab = 'abilities';
  const value = input => input == null || input === '' ? '—' : String(input);
  const emit = (name, detail) => document.dispatchEvent(new CustomEvent(`gameui:${name}`, {detail}));
  const safeImage = input => {
    if (!input) return null;
    const url = new URL(String(input), document.baseURI);
    if (['http:', 'https:', 'file:', 'blob:'].includes(url.protocol) || /^data:image\/(png|jpeg|webp|gif);/i.test(String(input))) return url.href;
    throw new TypeError('La imagen debe ser una ruta de recurso o una URL de imagen.');
  };
  function icon(name) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    const use = document.createElementNS('http://www.w3.org/2000/svg','use');
    use.setAttribute('href',`#icon-${name}`); svg.setAttribute('aria-hidden','true'); svg.append(use); return svg;
  }
  function span(className, text) { const el = document.createElement('span'); el.className = className; el.textContent = text; return el; }
  function metric(key) {
    const {current,max} = state[key];
    const defined = Number.isFinite(current) && Number.isFinite(max) && max > 0;
    const clamped = defined ? Math.min(Math.max(current,0),max) : 0;
    $(`${key}-value`).textContent = defined ? `${clamped} / ${max}` : '— / —';
    $(`${key}-fill`).style.setProperty('--fill', `${defined ? clamped / max * 100 : 0}%`);
    const meter = $(`${key}-bar`);
    meter.setAttribute('aria-valuemax', defined ? max : 100);
    meter.setAttribute('aria-valuenow', clamped);
    meter.setAttribute('aria-valuetext', defined ? `${clamped} de ${max}` : 'Sin datos');
  }
  function renderCharacter() {
    Object.entries(state.character).forEach(([key,val]) => { if ($(`character-${key}`)) $(`character-${key}`).textContent = value(val); });
    $('damage-value').textContent = value(state.damage);
    $('resource-label').textContent = state.resource.label;
    $('resource-bar').setAttribute('aria-label', state.resource.label);
    metric('health'); metric('resource');
    ['v','d'].forEach(key => {
      const source = state.points[key];
      const count = Number.isFinite(source) ? Math.min(3, Math.max(0,Math.floor(source))) : null;
      const statuses = Array.isArray(source) ? [0,1,2].map(i => Boolean(source[i])) : [0,1,2].map(i => count !== null && i < count);
      [...$(`points-${key}`).children].forEach((point,i) => point.classList.toggle('is-filled',statuses[i]));
      $(`points-${key}`).setAttribute('aria-label',`${key.toUpperCase()}: ${source == null ? 'sin datos' : statuses.filter(Boolean).length + ' de 3 puntos'}`);
    });
    $('die-value').textContent = state.die == null ? 'Tirar' : value(state.die);
    $('die').setAttribute('aria-label',`Tirada de acción: ${state.die == null ? 'tirar D20' : state.die}`);
    $('poison-indicator').classList.toggle('is-active',state.poisoned === true);
    $('poison-indicator').setAttribute('aria-label',`Veneno: ${state.poisoned == null ? 'sin datos' : state.poisoned ? 'activo' : 'inactivo'}`);
    const image = $('portrait-image');
    if (state.portrait) { image.src = state.portrait; image.hidden = false; $('portrait-placeholder').hidden = true; }
    else { image.removeAttribute('src'); image.hidden = true; $('portrait-placeholder').hidden = false; }
    refreshSelection();
  }
  $('portrait-image').addEventListener('error', () => { $('portrait-image').hidden = true; $('portrait-placeholder').hidden = false; });
  function renderAbilities() {
    $('ability-list').replaceChildren();
    state.abilities.forEach((ability,i) => {
      const button = document.createElement('button'); button.className = 'ability-button'; button.id = `ability-slot-${i+1}`;
      button.dataset.ability = ability.id; button.disabled = Boolean(ability.disabled); button.setAttribute('aria-pressed','false');
      const symbol = span('ability-icon','');
      if (ability.icon) { const img = document.createElement('img'); img.src = safeImage(ability.icon); img.alt = ''; img.style.cssText = 'width:100%;height:100%;object-fit:contain'; symbol.append(img); }
      else symbol.append(icon('rune'));
      const copy = span('ability-copy',''); copy.append(span('ability-name',ability.name),span('ability-subtitle',ability.empty ? 'Sin asignar' : 'Ver descripción'));
      button.append(symbol,copy,span('slot-number',String(i+1).padStart(2,'0')));
      button.addEventListener('click',() => select({kind:'ability',id:ability.id})); $('ability-list').append(button);
    }); refreshSelection();
  }
  function renderItems() {
    Object.assign(state,inventory.snapshot());
    $('item-list').replaceChildren();
    $('item-count').textContent = String(state.items.length).padStart(2,'0');
    $('inventory-count').textContent = `${state.items.length} / 16`;
    $('equipment-count').textContent = `${Object.values(state.equipment).filter(Boolean).length} / ${InventoryModel.slots.length}`;
    state.inventorySlots.forEach((id,index) => {
      const item = state.items.find(entry => entry.id === id);
      const button = document.createElement('button'); button.className = 'inventory-cell'; button.id = `inventory-cell-${index+1}`;
      if (item) {
        button.dataset.item = item.id; button.disabled = Boolean(item.disabled); button.setAttribute('aria-pressed','false');
        button.setAttribute('aria-label',`Inventario, casilla ${index+1}: ${item.name}`); button.title = item.name;
        button.append(itemSymbol(item),span('cell-name',item.name));
        if (item.quantity != null) button.append(span('item-quantity',`× ${item.quantity}`));
        button.addEventListener('click',() => { select({kind:'item',id:item.id}); inventoryMessage(itemHint(item)); });
      } else {
        button.classList.add('is-empty'); button.disabled = true; button.setAttribute('aria-label',`Inventario, casilla ${index+1}: vacía`);
        button.append(span('cell-index',String(index+1).padStart(2,'0')));
      }
      $('item-list').append(button);
    }); refreshSelection();
    ['equipment-left','equipment-right'].forEach(id => $(id).replaceChildren());
    InventoryModel.slots.forEach((slot,index) => {
      const item = state.equipment[slot]; const button = document.createElement('button'); button.id = `equipment-${slot}`;
      button.className = 'equipment-slot'; button.dataset.slot = slot;
      button.setAttribute('aria-label',`${slotLabels[slot]}: ${item ? item.name + ', equipado' : 'vacío'}`);
      if (item) { button.dataset.item = item.id; button.classList.add('is-equipped'); button.disabled = Boolean(item.disabled); button.append(itemSymbol(item),span('equipped-name',item.name),span('equipped-marker','◆')); }
      else button.append(icon(slot === 'arma' ? 'sword' : slot));
      button.append(span('slot-label',slotLabels[slot]));
      button.addEventListener('click',() => {
        const candidate = selected?.kind === 'item' ? state.items.find(entry => entry.id === selected.id) : null;
        if (candidate && inventory.compatible(candidate,slot)) { equipItem(candidate.id,slot); return; }
        if (item) { select({kind:'item',id:item.id}); inventoryMessage('Objeto equipado. Puedes devolverlo al inventario con «Desequipar».'); }
        else inventoryMessage(candidate ? 'Este objeto no es compatible con esa casilla.' : `${slotLabels[slot]}: casilla vacía. Selecciona primero un objeto del inventario.`,Boolean(candidate));
      });
      $(index < 4 ? 'equipment-left' : 'equipment-right').append(button);
    });
    refreshSelection();
  }
  function itemSymbol(item) {
    if (item.icon) { const img = document.createElement('img'); img.className = 'item-image'; img.src = safeImage(item.icon); img.alt = ''; return img; }
    return icon(item.category === 'arma' ? 'sword' : InventoryModel.slots.includes(item.equipmentSlot) ? item.equipmentSlot === 'arma' ? 'sword' : item.equipmentSlot : 'bag');
  }
  function itemHint(item) {
    if (item.category === 'consumible') return 'Consumible. Se guarda en el inventario y no se equipa.';
    const slot = item.category === 'arma' ? 'arma' : item.equipmentSlot;
    return inventory.compatible(item,slot) ? `Puedes equiparlo en ${slotLabels[slot].toLowerCase()}. Selecciona la casilla resaltada o pulsa «Equipar».` : 'Este objeto aún no tiene una casilla compatible definida.';
  }
  function inventoryMessage(text,error = false) { $('inventory-feedback').textContent = text; $('inventory-feedback').classList.toggle('is-error',error); }
  function refreshItemActions() {
    const stored = selected?.kind === 'item' ? state.items.find(item => item.id === selected.id) : null;
    const equippedSlot = selected?.kind === 'item' ? InventoryModel.slots.find(slot => state.equipment[slot]?.id === selected.id) : null;
    const target = stored?.category === 'arma' ? 'arma' : stored?.equipmentSlot;
    $('equip-button').disabled = !inventory.compatible(stored,target);
    $('unequip-button').disabled = !equippedSlot || Boolean(state.equipment[equippedSlot]?.disabled) || !state.inventorySlots.includes(null);
    $('use-button').disabled = stored?.category !== 'consumible' || stored?.usable !== true;
    $('unequip-button').title = equippedSlot && !state.inventorySlots.includes(null) ? 'El inventario está lleno. Libera una casilla.' : '';
    $('item-location').textContent = stored ? 'Guardado en el inventario' : equippedSlot ? `Equipado · ${slotLabels[equippedSlot]}` : 'Selecciona un objeto para consultar sus detalles.';
    document.querySelectorAll('[data-slot]').forEach(button => button.classList.toggle('is-compatible',inventory.compatible(stored,button.dataset.slot)));
  }
  function equipItem(id,slot) {
    const result = inventory.equip(id,slot);
    if (result.ok) { renderItems(); $(`equipment-${slot}`).focus(); emit('equipmentchange',{action:'equip',...result,...inventory.snapshot()}); }
    inventoryMessage(result.message,!result.ok); return result;
  }
  function unequipItem(slot) {
    const result = inventory.unequip(slot);
    if (result.ok) { renderItems(); [...document.querySelectorAll('.inventory-cell[data-item]')].find(button => button.dataset.item === result.id)?.focus(); emit('equipmentchange',{action:'unequip',...result,...inventory.snapshot()}); }
    inventoryMessage(result.message,!result.ok); return result;
  }
  $('equip-button').addEventListener('click',() => {
    const item = state.items.find(item => selected?.kind === 'item' && item.id === selected.id);
    if (item) equipItem(item.id,item.category === 'arma' ? 'arma' : item.equipmentSlot);
  });
  $('unequip-button').addEventListener('click',() => {
    const slot = InventoryModel.slots.find(slot => selected?.kind === 'item' && state.equipment[slot]?.id === selected.id);
    if (slot) unequipItem(slot);
  });
  $('use-button').addEventListener('click',() => {
    const item = state.items.find(item => selected?.kind === 'item' && item.id === selected.id);
    if (!item || item.category !== 'consumible' || item.usable !== true) return;
    const detail = {item:JSON.parse(JSON.stringify(item)),result:null};
    emit('itemuse',detail);
    if (!detail.result?.ok) { inventoryMessage(detail.result?.message || 'No se pudo usar este objeto.',true); return; }
    if (detail.result.consume !== false) {
      const quantity = Math.max(0,Number(item.quantity || 1)-1);
      window.GameUI.setItemQuantity(item,quantity);
    }
    inventoryMessage(detail.result.message || `${item.name}: usado.`);
  });
  function selectionContent() {
    if (!selected) return null;
    if (selected.kind === 'ability' || selected.kind === 'item') {
      const entry = (selected.kind === 'ability' ? state.abilities : [...state.items,...Object.values(state.equipment).filter(Boolean)]).find(item => item.id === selected.id);
      const equipped = selected.kind === 'item' && Object.values(state.equipment).some(item => item?.id === selected.id);
      return entry ? {...entry, category:selected.kind === 'ability' ? 'Habilidad' : equipped ? 'Ítem equipado' : 'Ítem guardado',itemCategory:entry.category} : null;
    }
    const key = selected.id;
    if (selected.kind === 'custom') return {name:selected.name,description:selected.description,category:selected.category};
    return {name: key === 'resource' ? state.resource.label : labels[key],description:state.descriptions[key] || 'Sin descripción asignada.',category:'Personaje'};
  }
  function refreshSelection() {
    const entry = selectionContent();
    if (selected && !entry) selected = null;
    $('selection-title').textContent = entry ? entry.name : 'Cada detalle cuenta';
    $('selection-description').textContent = entry ? (entry.description || 'Sin descripción asignada.') : 'Selecciona una habilidad, un ítem o un dato del personaje para consultar su descripción.';
    $('selection-category').textContent = entry ? entry.category : 'Sin selección';
    [['element-value','element'],['type-value','type']].forEach(([id,key]) => { $(id).textContent = value(entry?.[key]); $(id).classList.toggle('has-value',entry?.[key] != null); $(id).title = value(entry?.[key]); });
    document.querySelectorAll('[data-inspect],[data-ability],[data-item]').forEach(el => {
      const active = Boolean(selected && ((selected.kind === 'stat' && el.dataset.inspect === selected.id) || (selected.kind === 'ability' && el.dataset.ability === selected.id) || (selected.kind === 'item' && el.dataset.item === selected.id)));
      el.classList.toggle('is-selected',active); el.setAttribute('aria-pressed',String(active));
    });
    refreshItemActions();
  }
  function select(selection) { selected = selection; refreshSelection(); emit('select',{...selection,content:selectionContent()}); }
  document.addEventListener('click',event => { const el = event.target.closest('[data-inspect]'); if (el) select({kind:'stat',id:el.dataset.inspect}); });
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  function setTab(key,focus = false) {
    if (!['abilities','items','info'].includes(key)) throw new TypeError('Pestaña desconocida.');
    activeTab = key;
    tabs.forEach(tab => { const active = tab.id === `tab-${key}`; tab.setAttribute('aria-selected',String(active)); tab.tabIndex = active ? 0 : -1; });
    ['abilities','items'].forEach(pane => $(`pane-${pane}`).hidden = pane !== key);
    document.querySelector('.inventory-content').hidden = key === 'info';
    document.querySelector('.inventory-body').classList.toggle('info-active',key === 'info');
    document.querySelector('.inventory-body').classList.toggle('items-active',key === 'items');
    if (focus) $(`tab-${key}`).focus(); emit('tab',{tab:activeTab});
  }
  tabs.forEach((tab,index) => {
    tab.addEventListener('click',() => setTab(tab.id.slice(4)));
    tab.addEventListener('keydown',event => {
      let next;
      if (event.key === 'ArrowRight') next = (index+1)%tabs.length;
      if (event.key === 'ArrowLeft') next = (index+tabs.length-1)%tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length-1;
      if (next != null) { event.preventDefault(); setTab(tabs[next].id.slice(4),true); }
    });
  });
  $('rest-button').addEventListener('click',() => { emit('rest',{}); $('rest-feedback').textContent = 'Acción pendiente de conectar al juego.'; });
  ['reserved-a','element-value','type-value'].forEach(id => $(id).addEventListener('click',() => emit('reserved',{id,selection:selected ? {...selected} : null})));
  function entries(list) {
    if (!Array.isArray(list)) throw new TypeError('Se requiere una lista.');
    const ids = new Set();
    return list.map(entry => {
      if (!entry || !entry.id || !entry.name || ids.has(String(entry.id))) throw new TypeError('Cada entrada debe tener id único y nombre.');
      ids.add(String(entry.id)); return {...entry,id:String(entry.id),name:String(entry.name)};
    });
  }
  window.GameUI = Object.freeze({
    setCharacter(fields) { Object.keys(state.character).forEach(key => { if (Object.hasOwn(fields,key)) state.character[key] = fields[key]; }); renderCharacter(); },
    setPortrait(source) { state.portrait = safeImage(source); renderCharacter(); },
    setHealth(current,max) { state.health = {current,max}; metric('health'); },
    setDamage(input) { state.damage = input; $('damage-value').textContent = value(input); },
    setResource(current,max,label = state.resource.label) { state.resource = {current,max,label:String(label)}; renderCharacter(); },
    setPoints(key,input) { if (!['v','d'].includes(key)) throw new TypeError('El grupo debe ser v o d.'); state.points[key] = Array.isArray(input) ? [...input] : input; renderCharacter(); },
    setDie(input) { state.die = input; renderCharacter(); },
    setPoisoned(input) { state.poisoned = input == null ? null : Boolean(input); renderCharacter(); },
    setAbilities(list) { const next = entries(list); if (next.length !== 4) throw new TypeError('Se requieren exactamente cuatro espacios de habilidades.'); state.abilities = next; renderAbilities(); },
    setItems(list) { inventory.setItems(list); renderItems(); },
    addItem(item) { inventory.addItem(item); renderItems(); },
    setItemQuantity(item,quantity) {
      const count=Math.max(0,Math.floor(Number(quantity)||0));
      const existing=inventory.items.find(entry=>entry.id===String(item.id));
      if(existing) {
        if(count===0) inventory.removeItem(existing.id);
        else existing.quantity=count;
      } else if(count>0) inventory.addItem({...item,id:String(item.id),quantity:count});
      renderItems();
    },
    consumeItem(id) {
      const item=inventory.items.find(entry=>entry.id===String(id));
      if(!item)return false;
      const quantity=Math.max(0,Number(item.quantity||1)-1);
      if(quantity===0)inventory.removeItem(item.id);else item.quantity=quantity;
      renderItems();return true;
    },
    removeItem(id) { inventory.removeItem(id); renderItems(); },
    setLoadout(data) { inventory.load(data); renderItems(); },
    equipItem,
    unequipItem,
    setDescription(key,text) { state.descriptions[key] = String(text); refreshSelection(); },
    showDetails(name,category,description) { selected={kind:'custom',id:'detail',name:String(name),category:String(category),description:String(description)}; refreshSelection(); },
    setRestDisabled(disabled) { $('rest-button').disabled = Boolean(disabled); },
    setReserved(id,text) { if (!['reserved-a','element-value','type-value'].includes(id)) throw new TypeError('Campo reservado desconocido.'); $(id).textContent = value(text); },
    setTab,
    mountGame(node) { if (!(node instanceof Node)) throw new TypeError('Se requiere un nodo DOM.'); $('game-content').replaceChildren(node); $('game-placeholder').hidden = true; },
    clearGame() { $('game-content').replaceChildren(); $('game-placeholder').hidden = false; },
    getState() { return JSON.parse(JSON.stringify({...state,activeTab,selected})); }
  });
  document.addEventListener('click',event => {
    const target = event.target.closest('[data-lore-category][data-lore-key]');
    if (!target) return;
    const entries = window.GAME_UI_DATA.lore?.[target.dataset.loreCategory];
    const entry = entries?.[target.dataset.loreKey];
    if (entry) window.GameUI.showDetails(entry.name,target.dataset.loreCategory === 'abilities' ? 'Habilidad' : target.dataset.loreCategory === 'enemies' ? 'Enemigo' : 'Personaje',entry.description);
  }, true);
  document.addEventListener('keydown',event => {
    const target=event.target.closest('[data-lore-category][data-lore-key][role="button"]');
    if(target&&target.tagName!=='BUTTON'&&(event.key==='Enter'||event.key===' ')){event.preventDefault();target.click();}
  });
  Object.assign(state,inventory.snapshot());
  renderCharacter(); renderAbilities(); renderItems(); emit('ready',{});
})();
