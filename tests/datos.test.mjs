import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const ctx = vm.createContext({});
vm.runInContext(readFileSync(new URL('../datos.js', import.meta.url), 'utf8'), ctx);
const { fusionarPorId, fusionarCatalogo, fusionarLista, estadoLinea, textoBarras, vaciarCola } = ctx.TecnomatDatos;
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
