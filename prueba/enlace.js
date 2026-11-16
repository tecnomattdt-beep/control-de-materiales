// Reglas del enlace con la app hermana (Supabase). Sin acceso a red ni al DOM: se prueban con `node --test tests/`.
(function (raiz) {
  const URL_SEGURA = /^https:\/\/[^\s"'<>]+$/;

  // Esquemas de una OT: solo enlaces https, con nombre, como mucho 50
  function esquemasSeguros(lista) {
    return (Array.isArray(lista) ? lista : [])
      .filter(e => e && typeof e.url === 'string' && URL_SEGURA.test(e.url) && String(e.nombre || '').trim())
      .slice(0, 50)
      .map(e => ({ nombre: String(e.nombre).trim().slice(0, 120), url: e.url }));
  }

  // Añade a la lista local los trabajadores de la app hermana (por su id, o por nombre si ya se creó a mano).
  // Nunca borra trabajadores locales: tienen ropa y entregas firmadas.
  function fusionarTrabajadores(locales, externos, nuevoId) {
    const lista = Array.isArray(locales) ? locales.slice() : [];
    let cambiado = false;
    const norm = s => String(s || '').trim().toLowerCase();
    for (const ext of Array.isArray(externos) ? externos : []) {
      const nombre = String(ext && ext.nombre || '').trim();
      if (!ext || !ext.id || !nombre || ext.activo === false) continue;
      const extId = String(ext.id);
      const puesto = String(ext.puesto || '').trim();
      const i = lista.findIndex(t => t.extId === extId || (!t.extId && norm(t.nombre) === norm(nombre)));
      if (i === -1) {
        lista.push({ id: nuevoId(), extId, nombre, puesto, ropa: [], entregas: [] });
        cambiado = true;
      } else if (lista[i].extId !== extId || lista[i].nombre !== nombre || (lista[i].puesto || '') !== puesto) {
        lista[i] = Object.assign({}, lista[i], { extId, nombre, puesto });
        cambiado = true;
      }
    }
    return { lista, cambiado };
  }

  raiz.TecnomatEnlace = { esquemasSeguros, fusionarTrabajadores };
})(globalThis);
