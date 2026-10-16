/* Contenido inicial. null significa que el juego todavía no proporcionó un valor.
   Las descripciones y los nombres son independientes de la presentación. */
window.GAME_UI_DATA = {
  character: { name: 'Sin nombre', race: null, class: null, level: null, status: null },
  portrait: null,
  health: { current: null, max: null },
  damage: null,
  resource: { label: 'Recurso', current: null, max: null },
  points: { v: null, d: null },
  die: null,
  poisoned: null,
  abilities: [
    { id: 'ability-1', name: 'Habilidad I', description: 'Esta habilidad aún no tiene contenido asignado.', empty: true },
    { id: 'ability-2', name: 'Habilidad II', description: 'Esta habilidad aún no tiene contenido asignado.', empty: true },
    { id: 'ability-3', name: 'Habilidad III', description: 'Esta habilidad aún no tiene contenido asignado.', empty: true },
    { id: 'ability-4', name: 'Habilidad IV', description: 'Esta habilidad aún no tiene contenido asignado.', empty: true }
  ],
  items: [],
  equipment: { casco: null, pechera: null, amuleto: null, anillo: null, arma: null, pantalones: null, botas: null, guantes: null },
  descriptions: {
    portrait: 'Retrato pixel art de la raza elegida. La imagen también se usa en la ficha del personaje y el inventario.',
    name: 'Nombre que elegiste para tu personaje. Se muestra en el tablero y en el orden de iniciativa.',
    race: 'La raza define el retrato y el tamaño del sprite. En esta demo, el Enano se mueve 2 casillas por uso; las demás razas, 4.',
    class: 'La clase determina tus habilidades, recurso y estilo de combate. Seleccioná esta ficha para leer su descripción completa.',
    level: 'Nivel actual del personaje. Ganás 4 niveles al vencer el primer encuentro y 5 en cada uno de los siguientes.',
    status: 'Muestra los efectos activos. Seleccioná Estado para consultar qué hace cada uno; si no tenés ninguno, dice Ninguno.',
    health: 'Vida actual y máxima. Si llega a 0, empezás las tiradas de salvación: tres aciertos te levantan con 1 HP; tres fallos significan la muerte. Los críticos cuentan doble.',
    damage: 'Fórmula de daño del ataque básico de tu clase. Magia vence a Sagrado, Sagrado a No-muerto y No-muerto a Magia: el tipo ventajoso hace el doble de daño y el desfavorecido recibe la mitad.',
    resource: 'Maná actual y máximo. Se gasta en habilidades; el Paladín recupera 1 al descansar.',
    v: 'Aciertos acumulados en tus tiradas de salvación al llegar a 0 HP. Los resultados 11–17 suman uno y 18–20 suman dos.',
    d: 'Fallos acumulados en tus tiradas de salvación al llegar a 0 HP. Los resultados 6–10 suman uno y 1–5 suman dos.',
    die: 'Tirá el D20 al comenzar tu turno. Con 15 o más podés elegir moverte o atacar y la misma tirada resuelve el ataque; con menos de 15, solo podés moverte.',
    poison: 'Indica si tu personaje está envenenado. El veneno puede causar daño al avanzar el combate.'
  },
  lore: {
    races: {
      humano: {name:'Humano',description:'Resistencia: suma +2 a la tirada para evitar efectos de estado. Movimiento: 4 casillas.'},
      elfo: {name:'Elfo',description:'Visión nocturna (rasgo descriptivo por ahora) y +1 a todas sus tiradas de D20. Recibe el doble de daño de fuego.'},
      enano: {name:'Enano',description:'Los enemigos no lo fijan como objetivo a más de 4 casillas; cuando se acercan a 4 casillas o menos, pueden atacarlo. Movimiento reducido: 2 casillas.'},
      draconido: {name:'Dracónido',description:'Aliento de fuego: daño 4 en un área de 3 casillas de ancho y hasta 3 de profundidad; cuesta 1 de maná y puede reutilizarse. Inmune al fuego; recibe el doble de daño de hielo.'},
      genari: {name:'Genari',description:'Inmune al hielo y a Congelación. Tiene +1 de maná máximo y recibe el doble de daño elemental.'},
      esqueleto: {name:'Esqueleto',description:'Sus ataques hacen daño no-muerto. Necesita 2 aciertos para revivir en vez de 3 y recibe el doble de daño de ataques sangrantes.'},
      ogro: {name:'Ogro',description:'Puede gastar su acción para devorar un enemigo caído y recuperar hasta 4 de vida. En un fallo crítico puede golpear a un aliado invocado. '},
      minotauro: {name:'Minotauro',description:'Los ataques consecutivos contra el mismo objetivo infligen +2 de daño. Recibe el doble de daño mágico.'}
    },
    classes: {
      paladin:{name:'Paladín · Ataque',description:'Combatiente de primera línea con 38 HP y 4 de maná en esta demo. Ataca cuerpo a cuerpo en un área de 3×3. Descarga cuesta 2 de maná, usa Fe para acertar y añade daño eléctrico en el área.'},
      escudero:{name:'Escudero · Tanque',description:'Protege el frente con un escudo orientable que cubre hasta 3 casillas. Puede absorber golpes frontales, empujar enemigos con Separación y lanzar el escudo; si falla el lanzamiento, queda desarmado hasta recuperarlo. Sus estadísticas son valores de prueba.'},
      bardo:{name:'Bardo · Soporte',description:'Controla el ritmo del combate con efectos sobre sus enemigos. Canción de cuna puede dormir durante 2 turnos; Ruido desordenado puede confundir durante 3. Melodía poderosa requiere un aliado y está deshabilitada en esta demo individual. Sus estadísticas son valores de prueba.'},
      nigromante:{name:'Nigromante · Mago',description:'Sus ataques infligen daño no-muerto. Su alcance normal cubre hasta 3 casillas al frente. Portal abre un punto de ataque en una casilla libre durante 2 turnos; desde ahí también alcanza 3 casillas al frente.'},
      arquero:{name:'Arquero · Rango',description:'Ataca a distancia sin límite de alcance. Triple flecha requiere que el objetivo esté alineado; Flecha bomba afecta un área de 3×3; Tiro certero ignora armadura y Búmeran tiene alcance de 3 casillas. Sus estadísticas son valores de prueba.'}
    },
    enemies: {
      'mago-cazador':{name:'Mago Cazador',description:'Jefe del Encuentro I, en la Fortaleza. Sus ataques hacen daño mágico. Antes de atacar aplica, en orden, efectos genéricos de congelación, electricidad, confusión, ceguera y fatiga; podés resistirlos con una salvación D20. Sus dos duendes aliados tienen 6 HP y daño D4−2.'},
      'caballero-guardian':{name:'Caballero Guardián',description:'Jefe del Encuentro II, en el Bosque. Tiene 45 HP. Cuerpo Robusto le concede +3 de armadura durante 3 turnos; Purificación elimina estados y después lo vuelve inmune a ellos. Su Lanzamiento puede desplazarte hasta 4 casillas. Lo acompaña un duende.'},
      'monstruo-esqueletico':{name:'Monstruo Esquelético',description:'Jefe del Encuentro III, en la Llanura. Sus ataques normales hacen daño no-muerto. Tiene 60 HP y tres aliados medianos. Advierte un área 3×3 de Veneno: si seguís dentro al resolverse, una salvación puede evitar D4+D6 y 3 turnos de veneno. A distancia puede Asaltar; de cerca usa Giro (3D4), que puede causar sangrado.'},
      'demonio-de-luna':{name:'Demonio de Luna',description:'Jefe final: sus ataques normales hacen daño no-muerto. Tiene 140 HP y 36 de maná. Empieza con Floración de manos (+8 de armadura) y alterna dos ataques anunciados: ocho casillas alrededor del jugador (D8 si no las esquivás ni superás la salvación) o una línea recta (D20+5 si te alcanza). Sincronía puede copiar un estado que le hayas aplicado.'},
      duende:{name:'Duende',description:'Aliado menor de los encuentros. En esta demo tiene 6 HP y daño D4−2. Su resultado de daño nunca baja de 0.'},
      'duende-mediano':{name:'Duende mediano',description:'Acompaña al Monstruo Esquelético. En esta demo tiene 6 HP y daño D4−2. Su resultado de daño nunca baja de 0.'},
      espejismo:{name:'Espejismo del Demonio',description:'Copia ilusoria invocada durante el encuentro final. Es una unidad enemiga temporal y puede desaparecer al recibir un golpe.'}
    },
    statuses: {
      sueno:{name:'Dormido',description:'Perdés el turno mientras dure el efecto.'},
      fatiga:{name:'Fatigado',description:'Tus ataques infligen 1 punto menos de daño mientras dure el efecto.'},
      veneno:{name:'Veneno',description:'Recibís 2 puntos de daño al comienzo de cada uno de tus turnos mientras dure el efecto.'},
      quemadura:{name:'Quemadura',description:'Recibís 3 puntos de daño al comienzo de cada uno de tus turnos mientras dure el efecto.'},
      sangrado:{name:'Sangrado',description:'Recibís 2 puntos de daño al comienzo de cada uno de tus turnos mientras dure el efecto.'},
      congelacion:{name:'Congelado',description:'No podés moverte durante el turno afectado.'},
      electricidad:{name:'Electricidad',description:'Modifica tu próximo ataque: agrega 3 de daño que ignora armadura. Se consume al atacar.'},
      confusion:{name:'Confusión',description:'Si fallás un ataque mientras dure el efecto, también te lastimás con tu daño normal.'},
      ceguera:{name:'Cegado',description:'Tus tiradas necesitan 2 puntos más para alcanzar el umbral requerido mientras dure el efecto.'},
      caido:{name:'Caído',description:'Un fallo crítico al moverte te deja en el piso. Una tirada de movimiento exitosa te levanta en el lugar, sin desplazarte.'},
      salvacion:{name:'Salvación',description:'Llegaste a 0 HP. Tirás D20 manualmente: 1–5 suma 2 fallos, 6–10 suma 1 fallo, 11–17 suma 1 acierto y 18–20 suma 2 aciertos. Tres aciertos te levantan con 1 HP; tres fallos causan la muerte.'},
      muerto:{name:'Muerto',description:'Tu personaje alcanzó tres fallos en las tiradas de salvación y el combate terminó.'}
    },
    abilities: {
      mover:{name:'Mover',description:'Tirá D20 para desplazarte hasta 4 casillas (2 si sos Enano). El rango se calcula desde tu posición actual. Tenés 2 usos por turno; el primero es gratis y un movimiento adicional que te desplace consume tu ataque. Un fallo crítico te deja Caído; un acierto crítico concede un paso extra.'},
      descansar:{name:'Descansar',description:'Cierra tu turno y recupera 1 de maná. También puede usarse para terminar el turno cuando no quedan acciones que quieras realizar.'},
      'paladin-ataque':{name:'Ataque · Paladín',description:'Golpe cuerpo a cuerpo de área 3×3, incluidas diagonales. Inflige D8+3 de daño a cada enemigo alcanzado.'},
      'bardo-ataque':{name:'Ataque básico · Bardo',description:'Golpe cuerpo a cuerpo. El daño base provisional del Bardo en la demo es D4+1.'},
      'nigromante-ataque':{name:'Proyectil del Nigromante',description:'Ataque de daño no-muerto a un objetivo hasta 3 casillas al frente. Usa Inteligencia y causa D6 de daño. Si abriste un Portal, también podés elegir objetivos hasta 3 casillas al frente de él.'},
      descarga:{name:'Descarga',description:'Ataque eléctrico cuerpo a cuerpo en un área de 3×3. Cuesta 2 de maná y usa Fe para acertar. Inflige el daño normal al objetivo y 3 de daño eléctrico adicional en el área, que ignora armadura.'},
      'escudero-ataque':{name:'Golpe de escudo',description:'Ataque cuerpo a cuerpo que usa Fuerza. El daño base de esta clase en la demo es D6+2.'},
      persecucion:{name:'Persecución',description:'El Escudero avanza hasta 7 casillas hacia el enemigo y lo golpea con 2D4. Usa Destreza para acertar.'},
      'orientar-escudo':{name:'Orientar / alzar escudo',description:'Primero elegí hacia dónde apunta el escudo; orientar no consume una acción. Después podés alzarlo para cubrir hasta 3 casillas frente a vos. Alzarlo o guardarlo consume la acción mayor; mientras está alzado no podés atacar.'},
      separacion:{name:'Separación',description:'Con el escudo alzado, golpea con D4 a un enemigo ubicado frente a él y lo empuja una casilla si hay espacio. Usa Fuerza para acertar.'},
      lanzamiento:{name:'Lanzamiento',description:'Arroja el escudo hasta 3 casillas e inflige D6. Si acierta vuelve a la mano; si falla, queda perdido hasta que lo orientes y lo alces de nuevo.'},
      'cancion-cuna':{name:'Canción de cuna',description:'Tirada de Carisma contra el enemigo principal. Si acierta y el objetivo no es inmune, lo duerme durante 2 turnos y pierde esos turnos.'},
      melodia:{name:'Melodía poderosa',description:'Habilidad de apoyo que necesita un aliado a 3 casillas. Está deshabilitada en la demo individual porque el jugador no tiene compañeros.'},
      ruido:{name:'Ruido desordenado',description:'Tirada de Carisma. Si acierta, confunde al enemigo durante 3 turnos; si falla un ataque mientras está confundido, se daña a sí mismo.'},
      musicoterapia:{name:'Musicoterapia',description:'Habilidad de apoyo del Bardo para limpiar el estado Caído. En la demo individual no hay aliados a quienes asistir.'},
      necromicon:{name:'Necronomicón',description:'Ataque de daño no-muerto que usa Inteligencia y D6 contra los enemigos vivos del escenario.'},
      'alma-menor':{name:'Generación de almas',description:'Invoca junto al Nigromante un Alma menor con 3 HP y daño D4. Actúa después del turno del Nigromante; solo puede haber una activa.'},
      resurreccion:{name:'Resurrección',description:'Habilidad destinada a levantar a un aliado caído. Requiere un compañero, así que no se puede usar en esta demo individual.'},
      proyeccion:{name:'Portal',description:'Elegí una casilla libre para abrir un portal. Consume tu acción y permanece 2 turnos. Durante ese tiempo, podés atacar desde el portal hasta 3 casillas al frente, además de tu alcance normal.'},
      'arquero-ataque':{name:'Flecha simple',description:'Ataque a distancia ilimitada. El daño base provisional del Arquero en la demo es D6+2.'},
      'triple-flecha':{name:'Triple flecha',description:'Dispara hasta 3 flechas al objetivo en línea recta. El objetivo debe estar alineado en la misma fila o columna.'},
      'flecha-bomba':{name:'Flecha bomba',description:'Usa Perspicacia para acertar; inflige D8 en un área de 3×3 alrededor del objetivo.'},
      'tiro-certero':{name:'Tiro certero',description:'Ataque de precisión que usa Perspicacia e ignora la armadura del objetivo.'},
      bumeran:{name:'Búmeran',description:'Ataque a distancia de hasta 3 casillas que inflige 2D4.'},
      'ataque-enemigo':{name:'Ataque enemigo',description:'El enemigo tira D20 para acertar y aplica su fórmula y tipo de daño al impactar. Magia vence a Sagrado, Sagrado a No-muerto y No-muerto a Magia.'}
    }
  }
};
