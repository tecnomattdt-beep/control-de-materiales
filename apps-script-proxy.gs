const MODELO_GEMINI = 'gemini-3.5-flash-lite';
const CLAVES_GEMINI = ['GEMINI_API_KEY', 'GEMINI_KEY', 'API_KEY'];
const CARPETA = 'Tecnomat respaldo';
const ORIGEN_APP = 'https://tecnomattdt-beep.github.io/control-de-materiales/';
const MAX_CORREOS_HORA = 20;
const MAX_GEMINI_MINUTO = 20;
const MAX_GEMINI_DIA = 400;
const MAX_PROMPT = 30000;
const MAX_IMAGENES = 12;
const MAX_IMAGEN = 7000000;
const MAX_RESPALDO = 8000000;
const MAX_TEXTO = 5000;
const SEMANAS_HISTORICO = 8;
const MIME_IMAGEN = /^image\/(?:jpeg|png|webp)$/;

function doPost(e) {
  let d = null;
  try { d = JSON.parse(e.postData.contents); } catch (err) { d = null; }
  if (!d || typeof d !== 'object') return responder({ ok: false, error: { message: 'Petición no válida.' } });
  const usuario = autenticar(d);
  if (!usuario) {
    return responder(d.accion
      ? { ok: false, error: 'No autorizado: es necesario iniciar sesión de nuevo.' }
      : { error: { message: 'No autorizado: es necesario iniciar sesión de nuevo.' } });
  }
  if (!d.accion) return responder(consultarGemini(d));
  try {
    if (d.accion === 'correo') return responder(enviarCorreo(d));
    if (d.accion === 'respaldo') return responder(guardarRespaldo(d, usuario));
    return responder({ ok: false, error: 'Acción desconocida.' });
  } catch (err) {
    return responder({ ok: false, error: String(err.message || err) });
  }
}

function lista(nombre) {
  return propiedad(nombre).toLowerCase().split(',').map(function (x) { return x.trim(); }).filter(Boolean);
}

function contador(clave, segundos, maximo) {
  const cache = CacheService.getScriptCache();
  const usados = parseInt(cache.get(clave) || '0', 10);
  if (usados >= maximo) return false;
  cache.put(clave, String(usados + 1), segundos);
  return true;
}

function autenticar(d) {
  const token = String(d.token || '');
  if (token.length < 20 || token.length > 4096) return '';
  const cache = CacheService.getScriptCache();
  const huella = 'tok_' + Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, token));
  const conocido = cache.get(huella);
  if (conocido) return conocido;
  const clave = propiedad('FIREBASE_API_KEY');
  const permitidos = lista('USUARIOS_PERMITIDOS');
  if (!clave || !permitidos.length) return '';
  const minuto = Math.floor(Date.now() / 60000);
  if (parseInt(cache.get('fallos_' + minuto) || '0', 10) >= 30) return '';
  let correo = '';
  try {
    const resp = UrlFetchApp.fetch('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + encodeURIComponent(clave), {
      method: 'post',
      contentType: 'application/json',
      headers: { Referer: ORIGEN_APP },
      payload: JSON.stringify({ idToken: token }),
      muteHttpExceptions: true
    });
    if (resp.getResponseCode() === 200) {
      const u = (JSON.parse(resp.getContentText()).users || [])[0];
      if (u && u.email && !u.disabled) correo = String(u.email).toLowerCase();
    }
  } catch (err) { correo = ''; }
  if (!correo || permitidos.indexOf(correo) === -1) {
    contador('fallos_' + minuto, 120, 1000);
    return '';
  }
  cache.put(huella, correo, 300);
  return correo;
}

function consultarGemini(d) {
  const clave = CLAVES_GEMINI.map(propiedad).filter(Boolean)[0];
  if (!clave) return { error: { message: 'Falta la clave de Gemini en las propiedades del script.' } };
  const prompt = String(d.prompt || '');
  const imagenes = Array.isArray(d.imagenes) ? d.imagenes : [];
  if (!prompt || prompt.length > MAX_PROMPT || imagenes.length > MAX_IMAGENES) return { error: { message: 'Petición no válida.' } };
  const partes = [{ text: prompt }];
  for (let i = 0; i < imagenes.length; i++) {
    const img = imagenes[i] || {};
    if (!MIME_IMAGEN.test(String(img.mime_type)) || typeof img.data !== 'string' || img.data.length > MAX_IMAGEN) return { error: { message: 'Imagen no válida.' } };
    partes.push({ inline_data: { mime_type: img.mime_type, data: img.data } });
  }
  const dia = new Date().toISOString().slice(0, 10);
  if (!contador('gemini_min_' + Math.floor(Date.now() / 60000), 120, MAX_GEMINI_MINUTO) || !contador('gemini_dia_' + dia, 90000, MAX_GEMINI_DIA)) {
    return { error: { message: 'Límite de consultas a la IA alcanzado.' } };
  }
  try {
    const resp = UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(propiedad('MODELO_GEMINI') || MODELO_GEMINI) + ':generateContent', {
      method: 'post',
      contentType: 'application/json',
      headers: { 'x-goog-api-key': clave },
      payload: JSON.stringify({ contents: [{ parts: partes }], generationConfig: { temperature: 0, thinkingConfig: { thinkingLevel: 'low' } } }),
      muteHttpExceptions: true
    });
    try { return JSON.parse(resp.getContentText()); }
    catch (err) { return { error: { message: 'Respuesta de Gemini no válida (HTTP ' + resp.getResponseCode() + ').' } }; }
  } catch (err) {
    return { error: { message: String(err.message || err) } };
  }
}

function responder(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function propiedad(nombre) {
  return (PropertiesService.getScriptProperties().getProperty(nombre) || '').trim();
}

function enviarCorreo(d) {
  const permitidos = lista('CORREOS_PERMITIDOS');
  const para = String(d.para || '').trim().toLowerCase();
  if (!permitidos.length) return { ok: false, error: 'No hay destinatarios autorizados en el servidor.' };
  if (permitidos.indexOf(para) === -1) return { ok: false, error: 'El destinatario no está autorizado en el servidor.' };
  const asunto = String(d.asunto || 'Material externo').replace(/[\r\n]+/g, ' ').slice(0, 150);
  const texto = String(d.texto || '').slice(0, MAX_TEXTO);
  if (!texto) return { ok: false, error: 'El texto está vacío.' };
  if (!contador('correos_' + Math.floor(Date.now() / 3600000), 7200, MAX_CORREOS_HORA)) return { ok: false, error: 'Límite de correos por hora alcanzado.' };
  MailApp.sendEmail({ to: para, subject: asunto, body: texto });
  enviarAviso('Petición enviada', 'Enviada a ' + para + ': ' + asunto);
  return { ok: true };
}

function enviarTelegram(texto) {
  const token = propiedad('TELEGRAM_TOKEN');
  const chat = propiedad('TELEGRAM_CHAT_ID');
  if (!token || !chat) return;
  UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
    method: 'post',
    payload: { chat_id: chat, text: String(texto).slice(0, 4000) },
    muteHttpExceptions: true
  });
}

function enviarPush(titulo, texto) {
  const app = propiedad('ONESIGNAL_APP_ID');
  const clave = propiedad('ONESIGNAL_API_KEY');
  if (!app || !clave) return;
  UrlFetchApp.fetch('https://api.onesignal.com/notifications?c=push', {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Key ' + clave },
    payload: JSON.stringify({
      app_id: app,
      target_channel: 'push',
      included_segments: [propiedad('ONESIGNAL_SEGMENTO') || 'Subscribed Users'],
      headings: { en: titulo, es: titulo },
      contents: { en: String(texto).slice(0, 300), es: String(texto).slice(0, 300) }
    }),
    muteHttpExceptions: true
  });
}

function enviarAviso(titulo, texto) {
  enviarTelegram(titulo + ': ' + texto);
  enviarPush(titulo, texto);
}

function carpeta() {
  const it = DriveApp.getFoldersByName(CARPETA);
  return it.hasNext() ? it.next() : DriveApp.createFolder(CARPETA);
}

function escribirArchivo(nombre, contenido) {
  const dir = carpeta();
  const it = dir.getFilesByName(nombre);
  if (it.hasNext()) it.next().setContent(contenido);
  else dir.createFile(nombre, contenido, MimeType.PLAIN_TEXT);
}

function leerArchivo(nombre) {
  const it = carpeta().getFilesByName(nombre);
  return it.hasNext() ? it.next().getBlob().getDataAsString() : null;
}

function guardarRespaldo(d, usuario) {
  if (!d.datos || !Array.isArray(d.datos.catalog) || !d.datos.catalog.length) return { ok: false, error: 'Datos no válidos.' };
  const contenido = JSON.stringify({ fecha: new Date().toISOString(), usuario: usuario, datos: d.datos });
  if (contenido.length > MAX_RESPALDO) return { ok: false, error: 'Los datos superan el tamaño máximo del respaldo.' };
  escribirArchivo('respaldo_actual.json', contenido);
  escribirArchivo('stock_bajo.json', JSON.stringify({ fecha: new Date().toISOString(), umbral: d.umbral, items: Array.isArray(d.bajo) ? d.bajo.slice(0, 500) : [] }));
  return { ok: true };
}

function revisarStock() {
  const crudo = leerArchivo('stock_bajo.json');
  if (!crudo) return;
  const s = JSON.parse(crudo);
  if (!s.items || !s.items.length) return;
  const lineas = s.items.map(function (x) { return '- ' + x.code + ' — ' + x.desc + ' (' + x.qty + ', mínimo ' + x.min + ')'; });
  const texto = 'Stock bajo (' + s.items.length + ' referencias), datos del ' + s.fecha.slice(0, 16).replace('T', ' ') + ':\n' + lineas.join('\n');
  enviarTelegram(texto);
  enviarPush('Stock bajo', s.items.length + ' referencias por debajo de su mínimo');
  const destino = propiedad('AVISOS_CORREO');
  if (destino) MailApp.sendEmail({ to: destino, subject: 'Tecnomat — stock bajo', body: texto.slice(0, 20000) });
}

function respaldoSemanal() {
  const crudo = leerArchivo('respaldo_actual.json');
  if (!crudo) return;
  escribirArchivo('respaldo_' + new Date().toISOString().slice(0, 10) + '.json', crudo);
  const limite = Date.now() - SEMANAS_HISTORICO * 7 * 24 * 3600 * 1000;
  const it = carpeta().getFiles();
  while (it.hasNext()) {
    const f = it.next();
    if (/^respaldo_\d{4}-\d{2}-\d{2}\.json$/.test(f.getName()) && f.getDateCreated().getTime() < limite) f.setTrashed(true);
  }
}

function instalarDisparadores() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    const f = t.getHandlerFunction();
    if (f === 'revisarStock' || f === 'respaldoSemanal') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('revisarStock').timeBased().everyDays(1).atHour(8).create();
  ScriptApp.newTrigger('respaldoSemanal').timeBased().onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(3).create();
}
