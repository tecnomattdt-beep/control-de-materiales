/**
 * Ampliación del proxy de Tecnomat (Google Apps Script).
 *
 * Añade al proxy de Gemini existente cuatro funciones, todas gratuitas:
 *   - correo:   envío automático de la petición de material externo.
 *   - aviso:    notificación por Telegram y push de OneSignal (tras cada correo enviado y en las revisiones programadas).
 *   - respaldo: copia de los datos en Google Drive y registro del stock bajo.
 *   - revisiones programadas: aviso diario de stock bajo y copia semanal con histórico.
 *
 * Instalación: ver la sección «Proxy de Apps Script» del README.
 * Las claves y destinatarios se guardan solo en Propiedades del script, nunca en el index.html.
 */

const CARPETA = 'Tecnomat respaldo';
const MAX_CORREOS_HORA = 20;
const MAX_TEXTO = 5000;
const SEMANAS_HISTORICO = 8;

function doPost(e) {
  let d = null;
  try { d = JSON.parse(e.postData.contents); } catch (err) { d = null; }
  if (!d || !d.accion) return doPostGemini(e);
  try {
    if (d.accion === 'correo') return responder(enviarCorreo(d));
    if (d.accion === 'respaldo') return responder(guardarRespaldo(d));
    return responder({ ok: false, error: 'Acción desconocida.' });
  } catch (err) {
    return responder({ ok: false, error: String(err.message || err) });
  }
}

function responder(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function propiedad(nombre) {
  return (PropertiesService.getScriptProperties().getProperty(nombre) || '').trim();
}

function enviarCorreo(d) {
  const permitidos = propiedad('CORREOS_PERMITIDOS').toLowerCase().split(',').map(function (x) { return x.trim(); }).filter(Boolean);
  const para = String(d.para || '').trim().toLowerCase();
  if (!permitidos.length) return { ok: false, error: 'No hay destinatarios autorizados en el servidor.' };
  if (permitidos.indexOf(para) === -1) return { ok: false, error: 'El destinatario no está autorizado en el servidor.' };
  const cache = CacheService.getScriptCache();
  const usados = parseInt(cache.get('correos_hora') || '0', 10);
  if (usados >= MAX_CORREOS_HORA) return { ok: false, error: 'Límite de correos por hora alcanzado.' };
  const asunto = String(d.asunto || 'Material externo').slice(0, 150);
  const texto = String(d.texto || '').slice(0, MAX_TEXTO);
  if (!texto) return { ok: false, error: 'El texto está vacío.' };
  MailApp.sendEmail({ to: para, subject: asunto, body: texto });
  cache.put('correos_hora', String(usados + 1), 3600);
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

function guardarRespaldo(d) {
  if (!d.datos || !Array.isArray(d.datos.catalog) || !d.datos.catalog.length) return { ok: false, error: 'Datos no válidos.' };
  const ahora = new Date().toISOString();
  escribirArchivo('respaldo_actual.json', JSON.stringify({ fecha: ahora, datos: d.datos }));
  escribirArchivo('stock_bajo.json', JSON.stringify({ fecha: ahora, umbral: d.umbral, items: Array.isArray(d.bajo) ? d.bajo : [] }));
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
