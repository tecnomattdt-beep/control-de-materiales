import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const ctx = vm.createContext({});
vm.runInContext(readFileSync(new URL('../datos.js', import.meta.url), 'utf8'), ctx);
const { fusionarPorId, fusionarCatalogo, fusionarLista, estadoLinea, textoBarras, vaciarCola, tipoActividad, fusionarGrupo, textoCantidad } = ctx.TecnomatDatos;
const plano = x => JSON.parse(JSON.stringify(x));
const ids = l => plano(l).map(x => x.id);

test('dos escaneos a la vez: no se pierde ningún movimiento', () => {
  const base = [{ id: 'm1', tsMs: 100 }];
  const servidor = [{ id: 'b', tsMs: 201 }, ...base]; // lo guardó el otro dispositivo
  const local = [{ id: 'a', tsMs: 200 }, ...base];    // lo que tengo yo
  assert.deepEqual(ids(fusionarPorId(servidor, local)), ['b', 'a', 'm1']);
});

test('lo ya archivado aquí no vuelve desde el servidor', () => {
  const local = [{ id: 'n', tsMs: 500 }, { id: 'm5', tsMs: 400 }];
  const servidor = [{ id: 'm5', tsMs: 400 }, { id: 'viejo', tsMs: 10 }];
  assert.deepEqual(ids(fusionarPorId(servidor, local)), ['n', 'm5']);
});

test('mismo id en los dos: gana la versión local', () => {
  const r = fusionarPorId([{ id: 'x', tsMs: 1, texto: 'antes' }], [{ id: 'x', tsMs: 1, texto: 'editado' }]);
  assert.equal(plano(r)[0].texto, 'editado');
});

test('chat en orden ascendente con tope', () => {
  const local = [{ id: 'c1', tsMs: 1 }, { id: 'c3', tsMs: 3 }];
  const servidor = [{ id: 'c1', tsMs: 1 }, { id: 'c2', tsMs: 2 }];
  assert.deepEqual(ids(fusionarPorId(servidor, local, 'asc')), ['c1', 'c2', 'c3']);
  assert.deepEqual(ids(fusionarPorId(servidor, local, 'asc', 2)), ['c2', 'c3']);
});

test('servidor vacío o nulo: se guarda lo local tal cual', () => {
  const local = [{ id: 'a', tsMs: 2 }, { id: 'b', tsMs: 1 }];
  assert.deepEqual(ids(fusionarPorId(null, local)), ['a', 'b']);
  assert.deepEqual(ids(fusionarPorId([], [])), []);
});

test('movimientos antiguos sin tsMs no rompen el orden', () => {
  const local = [{ id: 'a', tsMs: 5 }, { id: 'viejo' }];
  assert.deepEqual(ids(fusionarPorId([{ id: 'b', tsMs: 6 }], local)), ['b', 'a', 'viejo']);
});

test('catálogo: editar una descripción no deshace un escaneo de otro dispositivo', () => {
  const servidor = [{ id: 'i1', code: 'A', desc: 'Tornillo', qty: 7 }];      // el otro escaneó: 5 → 7
  const local = [{ id: 'i1', code: 'A', desc: 'Tornillo M6', qty: 5 }];       // yo edité la descripción con qty vieja
  const r = plano(fusionarCatalogo(servidor, local, new Set(['i1'])));
  assert.deepEqual(r, [{ id: 'i1', code: 'A', desc: 'Tornillo M6', qty: 7 }]);
});

test('catálogo: conserva artículos nuevos de otro dispositivo y respeta los borrados aquí', () => {
  const servidor = [{ id: 'i1', qty: 1 }, { id: 'borrado', qty: 3 }, { id: 'nuevoOtro', qty: 2 }];
  const local = [{ id: 'i1', qty: 1 }, { id: 'nuevoMio', qty: 0 }];
  const r = ids(fusionarCatalogo(servidor, local, new Set(['i1', 'borrado'])));
  assert.deepEqual(r, ['i1', 'nuevoMio', 'nuevoOtro']);
});

test('trabajadores: el que añade otro móvil no desaparece al guardar aquí', () => {
  const servidor = [{ id: 't1', nombre: 'Ana' }, { id: 't2', nombre: 'Luis' }]; // Luis lo añadió otro móvil
  const local = [{ id: 't1', nombre: 'Ana', puesto: 'Montaje' }];              // yo solo conocía a Ana
  assert.deepEqual(plano(fusionarLista(servidor, local, new Set(['t1']))), [{ id: 't1', nombre: 'Ana', puesto: 'Montaje' }, { id: 't2', nombre: 'Luis' }]);
});

test('listas: lo borrado aquí no vuelve desde el servidor', () => {
  assert.deepEqual(ids(fusionarLista([{ id: 'a' }, { id: 'b' }], [{ id: 'a' }], new Set(['a', 'b']))), ['a']);
});

test('listas de textos (ubicaciones) y de órdenes por nombre', () => {
  assert.deepEqual(plano(fusionarLista(['A1', 'B2'], ['A1', 'C3'], new Set(['A1']), x => x)), ['A1', 'C3', 'B2']);
  const r = fusionarLista([{ name: 'OT-1' }, { name: 'OT-2' }], [{ name: 'OT-1' }], new Set(['OT-1']), x => x.name);
  assert.deepEqual(plano(r).map(x => x.name), ['OT-1', 'OT-2']);
});

// Cola de stock sin conexión: un almacén de mentira en memoria y un servidor que apunta lo que recibe
function colaDePrueba(ajustes, fallaEn = null) {
  let cola = ajustes.slice();
  const recibidos = [];
  const enviar = async a => {
    if (a.id === fallaEn) throw new Error('sin conexión');
    recibidos.push(a.id);
  };
  return { leer: () => cola, escribir: l => { cola = l; }, enviar, recibidos, cola: () => cola };
}

test('stock sin conexión: cada ajuste se envía una vez y en orden', async () => {
  const c = colaDePrueba([{ id: 'a', delta: -2 }, { id: 'b', delta: 5 }]);
  await vaciarCola(c.leer, c.escribir, c.enviar);
  assert.deepEqual(c.recibidos, ['a', 'b']);
  assert.deepEqual(c.cola(), []);
});

test('stock sin conexión: si uno falla, ese y los siguientes se quedan en la cola', async () => {
  const c = colaDePrueba([{ id: 'a' }, { id: 'b' }, { id: 'c' }], 'b');
  await assert.rejects(vaciarCola(c.leer, c.escribir, c.enviar));
  assert.deepEqual(c.recibidos, ['a']);
  assert.deepEqual(ids(c.cola()), ['b', 'c']);
});

test('stock sin conexión: un escaneo hecho mientras se envía también sale', async () => {
  const c = colaDePrueba([{ id: 'a' }]);
  const enviar = async x => { await c.enviar(x); if (x.id === 'a') c.escribir([...c.leer(), { id: 'nuevo' }]); };
  await vaciarCola(c.leer, c.escribir, enviar);
  assert.deepEqual(c.recibidos, ['a', 'nuevo']);
});

test('actividad: cada mensaje de la app sale con su tipo y sin repetir la palabra de la etiqueta', () => {
  const t = x => { const r = tipoActividad(x); return [r.clase, r.etiqueta, r.texto]; };
  assert.deepEqual(t('Pedido: test · 1 uds (sin referencia todavía)'), ['pedido', 'Pedido', 'test · 1 uds (sin referencia todavía)']);
  assert.deepEqual(t('Recogida confirmada y firmada por jonathan (3 línea(s))'), ['firma', 'Firmado', 'por jonathan (3 línea(s))']);
  assert.deepEqual(t('Documento escaneado revisado (proveedor INOXPA): 0 servida(s), 4 marcada(s) como material faltante'), ['doc', 'Albarán', 'INOXPA: 0 servida(s), 4 marcada(s) como material faltante']);
  assert.deepEqual(t('Asociado a 53195 — 3044160 BORNA'), ['ref', 'Referencia', '53195 — 3044160 BORNA']);
  assert.equal(t('Pequeño material: Test ×1 (pide: test)')[0], 'pedido');
  assert.equal(t('Algo que no conoce')[1], 'Nota');
  assert.equal(t('')[1], 'Nota');
});

test('orden: si el taller pide y almacén reserva a la vez, no se pierde ninguna de las dos cosas', () => {
  const conocidos = { pendiente: new Set(['l1']), servido: new Set() };
  const servidor = { chat: [], pendiente: { items: [{ id: 'l1' }, { id: 'nuevaTaller' }] }, servido: [] }; // el taller añadió una línea
  const local = { chat: [], pendiente: { requesterName: 'Ana', items: [{ id: 'l1', reservado: true }] }, servido: [], devuelto: [] }; // almacén reservó l1
  const r = plano(fusionarGrupo(servidor, local, conocidos));
  assert.deepEqual(r.pendiente.items, [{ id: 'l1', reservado: true }, { id: 'nuevaTaller' }]);
  assert.equal(r.pendiente.requesterName, 'Ana');
});

test('orden: una línea servida aquí no vuelve a pendientes, y la servida en otro móvil se conserva', () => {
  const conocidos = { pendiente: new Set(['l1']), servido: new Set() };
  const servidor = { chat: [], pendiente: { items: [{ id: 'l1' }] }, servido: [{ id: 's9' }] };
  const local = { chat: [], pendiente: { items: [] }, servido: [{ id: 's1' }] }; // aquí se sirvió l1
  const r = plano(fusionarGrupo(servidor, local, conocidos));
  assert.deepEqual(ids(r.pendiente.items), []);
  assert.deepEqual(ids(r.servido), ['s1', 's9']);
});

test('pedir: cantidad delante o detrás, con x o con «uds»', () => {
  const c = t => plano(textoCantidad(t, new Set()));
  assert.deepEqual(c('20 x borna paso UT-10'), { texto: 'borna paso UT-10', qty: 20 });
  assert.deepEqual(c('borna paso UT-10 x 20'), { texto: 'borna paso UT-10', qty: 20 });
  assert.deepEqual(c('topes fhoenix 40'), { texto: 'topes fhoenix', qty: 40 });
  assert.deepEqual(c('cable 3x2,5'), { texto: 'cable 3x2,5', qty: 1 });
  assert.deepEqual(c('5 m de cable'), { texto: '5 m de cable', qty: 1 }, '«5 m» es una medida');
});

test('pedir: el número detrás de una métrica es su medida, no la cantidad', () => {
  const c = t => plano(textoCantidad(t, new Set()));
  assert.deepEqual(c('tornillo M6 x 30'), { texto: 'tornillo M6 x 30', qty: 1 });
  assert.deepEqual(c('brida DN40 2'), { texto: 'brida DN40 2', qty: 1 });
  assert.deepEqual(c('tornillo M6 x 30 x 10 uds'), { texto: 'tornillo M6 x 30', qty: 10 }, 'con «uds» sí es cantidad');
  assert.deepEqual(c('tornillo M6 10 uds'), { texto: 'tornillo M6', qty: 10 });
});

test('pedir: un número que es un código del catálogo no se toma como cantidad', () => {
  assert.deepEqual(plano(textoCantidad('borna 53195', new Set(['53195']))), { texto: 'borna 53195', qty: 1 });
});

test('estado de cada línea de la hoja de pedido, en el orden que la vive el taller', () => {
  const e = (l, s) => estadoLinea(l, s).clave;
  assert.equal(e({}), 'borrador');
  assert.equal(e({ guardado: true }), 'pedido');
  assert.equal(e({ guardado: true, escandalloPedido: 'Pedido' }), 'proveedor');
  assert.equal(e({ guardado: true, destino: 'proveedor' }), 'proveedor');
  assert.equal(e({ guardado: true, escandalloPedido: 'Pedido', reservado: true }), 'listo', 'preparado gana a proveedor');
  assert.equal(e({ reservado: true }, true), 'recogido');
  assert.equal(estadoLinea({ reservado: true }).texto, 'Listo para recoger');
});

test('texto de código de barras: sin tildes ni ñ, que CODE128 no admite', () => {
  assert.equal(textoBarras('UB-Estantería 3'), 'UB-Estanteria 3');
  assert.equal(textoBarras('UB-Pasillo Ñ'), 'UB-Pasillo N');
  assert.equal(textoBarras('FT-257/5.38'), 'FT-257/5.38');
  assert.equal(textoBarras(' 61771 '), '61771');
  assert.equal(textoBarras(null), '');
});
