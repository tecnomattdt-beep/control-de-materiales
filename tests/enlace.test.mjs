import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const ctx = vm.createContext({});
vm.runInContext(readFileSync(new URL('../enlace.js', import.meta.url), 'utf8'), ctx);
const { esquemasSeguros, fusionarTrabajadores } = ctx.TecnomatEnlace;
let n = 0;
const nuevoId = () => 'n' + ++n;

test('esquemasSeguros solo deja enlaces https con nombre', () => {
  const r = esquemasSeguros([
    { nombre: 'Unifilar', url: 'https://x.supabase.co/storage/v1/object/public/esquemas/a.pdf' },
    { nombre: 'Malo', url: 'javascript:alert(1)' },
    { nombre: 'Http', url: 'http://x.com/a.pdf' },
    { nombre: 'Comillas', url: 'https://x.com/"onerror=1' },
    { nombre: '  ', url: 'https://x.com/b.pdf' },
    null
  ]);
  assert.deepEqual(JSON.parse(JSON.stringify(r)), [{ nombre: 'Unifilar', url: 'https://x.supabase.co/storage/v1/object/public/esquemas/a.pdf' }]);
  assert.equal(esquemasSeguros(null).length, 0);
});

test('fusionarTrabajadores añade, enlaza por nombre y no borra', () => {
  const locales = [
    { id: 'a', nombre: 'Ana López', ropa: [{ x: 1 }], entregas: [] },
    { id: 'b', nombre: 'Solo local', ropa: [], entregas: [] }
  ];
  const { lista, cambiado } = fusionarTrabajadores(locales, [
    { id: 'e1', nombre: 'ana lópez', puesto: 'Oficial' },
    { id: 'e2', nombre: 'Luis Pérez', puesto: '' },
    { id: 'e3', nombre: 'De baja', activo: false },
    { id: '', nombre: 'Sin id' }
  ], nuevoId);
  assert.ok(cambiado);
  assert.equal(lista.length, 3);
  assert.equal(lista[0].id, 'a');
  assert.equal(lista[0].extId, 'e1');
  assert.equal(lista[0].ropa.length, 1, 'conserva la ropa');
  assert.equal(lista[1].nombre, 'Solo local');
  assert.equal(lista[2].extId, 'e2');
  assert.equal(locales[0].extId, undefined, 'no modifica la lista original');
});

test('fusionarTrabajadores sin cambios devuelve cambiado=false', () => {
  const locales = [{ id: 'a', extId: 'e1', nombre: 'Ana', puesto: 'Oficial', ropa: [], entregas: [] }];
  assert.equal(fusionarTrabajadores(locales, [{ id: 'e1', nombre: 'Ana', puesto: 'Oficial' }], nuevoId).cambiado, false);
});
