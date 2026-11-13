import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const ctx = vm.createContext({});
vm.runInContext(readFileSync(new URL('../datos.js', import.meta.url), 'utf8'), ctx);
const { fusionarPorId, fusionarCatalogo, estadoLinea, textoBarras } = ctx.TecnomatDatos;
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
