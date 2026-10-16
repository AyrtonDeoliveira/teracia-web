/* Modelo independiente del DOM. No calcula estadísticas ni efectos de objetos. */
(() => {
  'use strict';
  const slots = Object.freeze(['casco','pechera','amuleto','anillo','arma','pantalones','botas','guantes']);
  const copy = value => JSON.parse(JSON.stringify(value));
  class InventoryModel {
    static slots = slots;
    constructor({items = [], equipment = {}} = {}) { this.load({items,equipment}); }
    normalize(list) {
      if (!Array.isArray(list)) throw new TypeError('Se requiere una lista de objetos.');
      const ids = new Set();
      return list.map(item => {
        if (!item || !item.id || !item.name || ids.has(String(item.id))) throw new TypeError('Cada objeto debe tener un id único y un nombre.');
        if (item.category != null && !['armadura','arma','consumible'].includes(item.category)) throw new TypeError('Categoría desconocida.');
        ids.add(String(item.id)); return copy({...item,id:String(item.id),name:String(item.name)});
      });
    }
    compatible(item,slot) {
      return Boolean(item && !item.disabled && slots.includes(slot) && (
        (item.category === 'arma' && slot === 'arma') ||
        (item.category === 'armadura' && slot !== 'arma' && item.equipmentSlot === slot)
      ));
    }
    load({items = [],equipment = {},inventorySlots = null} = {}) {
      const nextItems = this.normalize(items);
      if (nextItems.length > 16) throw new RangeError('El inventario tiene 16 casillas.');
      if (!equipment || typeof equipment !== 'object' || Object.keys(equipment).some(key => !slots.includes(key))) throw new TypeError('Casilla de equipamiento desconocida.');
      const nextEquipment = Object.fromEntries(slots.map(slot => [slot,null]));
      slots.forEach(slot => {
        if (equipment[slot] == null) return;
        const item = this.normalize([equipment[slot]])[0];
        if (!this.compatible({...item,disabled:false},slot)) throw new TypeError(`Objeto incompatible con ${slot}.`);
        nextEquipment[slot] = item;
      });
      this.normalize([...nextItems,...Object.values(nextEquipment).filter(Boolean)]);
      const nextSlots = inventorySlots == null ? Array.from({length:16},(_,i) => nextItems[i]?.id ?? null) : copy(inventorySlots);
      if (!Array.isArray(nextSlots) || nextSlots.length !== 16 || nextSlots.some(id => id !== null && !nextItems.some(item => item.id === id)) || nextItems.some(item => nextSlots.filter(id => id === item.id).length !== 1)) throw new TypeError('Las 16 casillas deben contener una sola referencia por objeto guardado.');
      this.items = nextItems; this.equipment = nextEquipment;
      this.inventorySlots = nextSlots;
    }
    setItems(items) { this.load({items,equipment:this.equipment}); }
    addItem(item) {
      const next = this.normalize([...this.items,...Object.values(this.equipment).filter(Boolean),item]).at(-1);
      const index = this.inventorySlots.indexOf(null);
      if (index < 0) throw new RangeError('El inventario está lleno.');
      this.items.push(next); this.inventorySlots[index] = next.id;
    }
    removeItem(id) {
      id = String(id); this.items = this.items.filter(item => item.id !== id);
      this.inventorySlots = this.inventorySlots.map(value => value === id ? null : value);
      slots.forEach(slot => { if (this.equipment[slot]?.id === id) this.equipment[slot] = null; });
    }
    equip(id,slot) {
      id = String(id);
      const item = this.items.find(item => item.id === id);
      if (!item) return {ok:false,message:'Selecciona un objeto guardado en el inventario.'};
      if (!this.compatible(item,slot)) return {ok:false,message:'Este objeto no es compatible con esa casilla.'};
      const index = this.inventorySlots.indexOf(id);
      const previous = this.equipment[slot];
      this.items = this.items.filter(entry => entry.id !== id);
      if (previous) this.items.push(previous);
      this.inventorySlots[index] = previous?.id ?? null;
      this.equipment[slot] = item;
      return {ok:true,id,slot,replaced:previous?.id ?? null,message:`${item.name}: equipado en ${slot}.`};
    }
    unequip(slot) {
      const item = this.equipment[slot];
      if (!item) return {ok:false,message:'La casilla está vacía.'};
      if (item.disabled) return {ok:false,message:'Este objeto está desactivado.'};
      const index = this.inventorySlots.indexOf(null);
      if (index < 0) return {ok:false,message:'Inventario lleno. Libera una casilla para desequipar el objeto.'};
      this.items.push(item); this.inventorySlots[index] = item.id; this.equipment[slot] = null;
      return {ok:true,id:item.id,slot,message:`${item.name}: devuelto al inventario.`};
    }
    snapshot() { return copy({items:this.items,equipment:this.equipment,inventorySlots:this.inventorySlots}); }
  }
  globalThis.InventoryModel = InventoryModel;
})();
