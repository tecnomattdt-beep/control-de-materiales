// Reglas para guardar sin pisar lo que otro dispositivo acaba de guardar. Funciones puras: se prueban con `node --test tests/`.
(function (raiz) {
  const ms = x => Number(x && x.tsMs) || 0;

  // Une la lista del servidor con la local, por id. Si un id está en las dos, gana la local (es la edición más reciente).
  // Lo que solo está en el servidor entra si no es más antiguo que lo más antiguo de la local: lo más viejo ya se archivó aquí.
  // orden: "desc" (lo nuevo primero: movimientos, entregas) o "asc" (chat). max: tope opcional, se quitan los más antiguos.
  function fusionarPorId(servidor, local, orden = "desc", max = Infinity) {
    const loc = Array.isArray(local) ? local : [];
    const srv = Array.isArray(servidor) ? servidor : [];
    const ids = new Set(loc.map(x => x && x.id));
    const limite = loc.length ? Math.min(...loc.map(ms)) : -Infinity;
    const nuevos = srv.filter(x => x && !ids.has(x.id) && ms(x) >= limite);
    if (!nuevos.length) return loc.slice(orden === "asc" ? -max : 0, orden === "asc" ? undefined : max);
    // orden estable: entre iguales se respeta el orden en que venían
    const todo = [...loc, ...nuevos].map((x, i) => [x, i]).sort((a, b) => (orden === "asc" ? ms(a[0]) - ms(b[0]) : ms(b[0]) - ms(a[0])) || a[1] - b[1]).map(p => p[0]);
    return orden === "asc" ? todo.slice(-max) : todo.slice(0, max);
  }

  // Catálogo: la lista y los datos de cada artículo vienen del dispositivo que guarda, pero la CANTIDAD siempre del servidor,
  // porque solo cambia por transacción (ajustar stock). Un artículo que solo está en el servidor se conserva si este
  // dispositivo no lo conocía (lo creó otro); si lo conocía y ya no está, es que aquí se borró.
  function fusionarCatalogo(servidor, local, idsConocidos) {
    const srv = Array.isArray(servidor) ? servidor : [];
    const qtyServidor = new Map(srv.map(x => [x.id, x.qty]));
    const ids = new Set();
    const lista = (Array.isArray(local) ? local : []).map(x => {
      ids.add(x.id);
      return qtyServidor.has(x.id) ? Object.assign({}, x, { qty: qtyServidor.get(x.id) }) : x;
    });
    for (const x of srv) if (!ids.has(x.id) && !idsConocidos.has(x.id)) lista.push(x);
    return lista;
  }

  // Estado de una línea de la hoja de pedido, en palabras del taller. `servida`: la línea ya está en Servido.
  function estadoLinea(linea, servida) {
    if (servida) return { clave: "recogido", texto: "Recogido" };
    if (linea.reservado) return { clave: "listo", texto: "Listo para recoger" };
    if (linea.escandalloPedido || linea.destino === "proveedor") return { clave: "proveedor", texto: "Pedido a proveedor" };
    if (linea.guardado) return { clave: "pedido", texto: "Pedido a almacén" };
    return { clave: "borrador", texto: "Sin enviar" };
  }

  // Texto apto para un código de barras CODE128: solo ASCII imprimible. «Estantería Ñ» → «Estanteria N».
  // Sin esto, JsBarcode falla con tildes o ñ y la etiqueta sale sin código.
  function textoBarras(s) {
    return String(s == null ? "" : s).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\x20-\x7E]/g, "").trim();
  }

  raiz.TecnomatDatos = { fusionarPorId, fusionarCatalogo, estadoLinea, textoBarras };
})(globalThis);
