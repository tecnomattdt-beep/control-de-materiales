# Tecnomat · Control de Materiales

App de gestión de stock, montaje/proyectos y pedidos con escaneo de código de barras (lector USB/Bluetooth o cámara del móvil), pensada para funcionar como una única página web (`index.html`).

## Cómo está construida

El objetivo era tener una herramienta de almacén que no necesitara servidor propio, se pudiera alojar gratis (GitHub Pages) y funcionara bien tanto en ordenador como en el móvil de un operario. Eso llevó a la decisión de arquitectura principal: **una única página HTML autocontenida**, sin build, sin framework, sin `npm install` — todo el HTML, CSS y JavaScript viven en un solo archivo (`index.html`).

**Stack técnico:**
- **JavaScript vanilla**, sin framework.
- **CSS con variables personalizadas** para recolorear secciones enteras (Trabajo, Almacén, Pedido) cambiando solo unas pocas líneas.
- **SheetJS** para leer/escribir Excel y CSV directamente en el navegador.
- **pdf.js** para extraer texto de PDFs al crear órdenes desde archivo (análisis heurístico línea a línea).
- **JsBarcode** para generar e imprimir etiquetas de código de barras.
- **jsPDF** para juntar las páginas escaneadas de un documento en un único PDF.
- **Tesseract.js** para reconocer el texto de un documento escaneado, directamente en el navegador, sin servidor.
- **Supabase (Postgres + tiempo real)** y **Firebase (Firestore + Authentication)**, opcionales, para guardado compartido en la nube. El login de la app lo lleva siempre Firebase Authentication — ver "Migrar a otro hosting o base de datos" si en algún momento se cambia de proveedor.
- **EmailJS**, opcional, para mandar avisos por correo sin backend propio.
- **`BarcodeDetector`** (API nativa del navegador) para escanear con la cámara del móvil.

**Modelo de datos:** el estado vive en un único objeto JavaScript. El catálogo de materiales usa un `id` interno único por referencia — el código de barras (`code`) **no tiene que ser único**, así que un mismo código puede tener varias referencias asociadas, y la app pregunta cuál es al escanear si hay más de una coincidencia.

**Guardado, en cadena de prioridad:** Supabase (si está configurado, con ajustes de stock a prueba de que dos dispositivos no se pisen un cambio, y tiempo real) → almacenamiento propio de la página → `localStorage` del navegador. La app nunca deja de guardar datos, solo cambia dónde.

**Decisiones de diseño relevantes:**
- Todos los datos dinámicos se escapan antes de pintarlos en HTML, porque pueden venir de un escáner o de un humano y contener caracteres que rompan la página.
- Al subir un archivo para crear una orden, la app enseña primero un resumen línea a línea y pide confirmación antes de tocar el stock.
- El histórico de movimientos y de firmas se archiva resumido en vez de borrarse sin más al superar un límite.
- Las funciones opcionales (cámara, Supabase, EmailJS, PDF) se degradan sin romper el resto de la app si no están disponibles o configuradas.
- Los botones de acción tienen un mínimo de 44px de alto, pensado para el dedo en móvil; los controles secundarios («Más opciones», «+ Nueva», los selectores de listado) son más compactos. Las acciones más frecuentes (Editar, Eliminar, Enviar, Guardar) llevan además un icono discreto de trazo fino junto al texto, sin sustituirlo.
- Al abrir la app, mientras llegan los datos de la nube se muestra un aviso breve de carga en vez de dejar la pantalla en blanco.

**Limitaciones conocidas:**
- Al ser una página estática, los avisos de la propia app (banner, sonido y notificación del sistema) solo se generan con la app abierta. Con la app cerrada solo llegan los avisos que gestiona el proxy de Apps Script (aviso diario de stock bajo, correo de la petición externa, Telegram y push); sin ese proxy, no hay tarea en segundo plano.
- La lectura de PDF es heurística (busca patrones de texto), no una lectura de tablas real.
- El pitido de aviso depende de que el navegador permita reproducir audio sin una interacción previa del usuario en esa pestaña — algunos navegadores (sobre todo Safari en iPhone) son más estrictos que otros. Si esto falla en algún dispositivo puntual, la notificación del sistema (si se le dio permiso) sigue llegando igual, ya que no depende de esta restricción.
- Las firmas de entrega, al ser una imagen, solo se guardan completas las 40 más recientes por orden/proyecto (para no hacer crecer demasiado esa fila); las más antiguas se archivan como resumen (quién, cuándo, cuántas líneas) sin la imagen.
- El logo de la empresa no sale como imagen en los Excel exportados — la librería gratuita usada para generarlos no lo permite, solo el texto "TECNOMAT · Control de materiales".

## 1. Publicarla en GitHub Pages

1. Entra en [github.com](https://github.com) y crea un repositorio nuevo (botón **New repository**).
2. Dentro del repositorio, pulsar **Add file → Upload files** y subir todos los archivos de esta carpeta (`index.html`, `sw.js`, `manifest.json`, `chat.html`, `OneSignalSDKWorker.js` y los iconos `icon-192.png` e `icon-512.png`; los archivos `.sql` y `.gs` no se publican, se usan en Supabase y Apps Script) a la raíz del repositorio, no dentro de ninguna subcarpeta.
3. Hacer commit de los cambios (botón verde **Commit changes**).
4. Ir a **Settings → Pages** (menú lateral del repositorio).
5. En **Build and deployment → Source**, seleccionar **Deploy from a branch**.
6. En **Branch**, elegir `main` (o `master`) y la carpeta `/ (root)`, y guardar.
7. Esperar 1-2 minutos. GitHub muestra una URL parecida a `https://usuario.github.io/repositorio/`.

**Al subir cambios más adelante:** subir siempre `index.html` **y** `sw.js` juntos, aumentando en 1 el número de la primera línea de verdad de `sw.js`:
```js
const CACHE_NAME = 'tecnomat-materiales-v4'; // incrementar a v5, v6... con cada subida de cambios
```
Si se sube un `index.html` nuevo sin modificar `sw.js`, el navegador no detecta ningún cambio y el aviso de "hay una versión nueva" no salta.

## 2. Cómo se guardan los datos

- **Con Supabase y/o Firebase configurados**: guardado compartido en la nube, con tiempo real entre dispositivos. Con los dos configurados a la vez, cada dato se escribe en ambos en paralelo, y se lee de Supabase primero — si uno falla o se cae, el otro sigue funcionando sin que nadie note nada (ver sección 3 para el detalle de este reparto, incluida una salvedad importante sobre el login).
- **Sin ninguno configurado**: usa `localStorage`, la memoria propia del navegador — sigue guardándose todo solo, pero queda en ese navegador y dispositivo concretos, sin sincronizarse con otros.
- **Si el backend en uso falla a media conexión** (el navegador puede seguir creyendo que hay internet, pero la petición concreta no llega) — el dato no se pierde: se guarda en `localStorage` de ese dispositivo, con un aviso, y se sincroniza en cuanto la conexión se recupera del todo.

**Recomendación:** usar el botón **"Descargar todo"** (dentro de Almacén) de vez en cuando para obtener una copia de seguridad real en un archivo `.json`, y **"Restaurar"** cuando haga falta pasar esos datos a otro dispositivo o recuperarlos tras borrar el navegador.

## 3. Backend real (Supabase + Firebase, a la vez)

GitHub Pages solo sirve archivos estáticos — no puede ejecutar un servidor ni una base de datos. Por eso el `index.html` se conecta, si se quiere, a **Supabase** y/o **Firebase**: la página sigue alojada 100% en GitHub Pages, pero los datos se guardan en esas bases externas y todos los dispositivos comparten el mismo stock en tiempo real.

Los dos backends pueden trabajar juntos, con un reparto claro:
- **Firebase Authentication** lleva el login y el control de usuarios — es quien decide quién puede entrar.
- **Los datos generales** (catálogo, movimientos, chat, pedidos, avisos, entregas, bobinas, ubicaciones, vehículos, mantenimiento) se escriben en **los dos backends a la vez**, en paralelo, y se leen del que responda primero (Supabase primero; si falla, Firebase). Así, si uno de los dos falla o se cae un rato, la app sigue funcionando con el otro sin que nadie tenga que hacer nada.
- **La integración con A3** (`ordenes_trabajo`, `materiales`, `materiales_rapidos`) vive **solo en Supabase** — la otra app escribe ahí directamente, así que duplicarlo en Firebase no tiene sentido: requeriría que esa otra app también escribiera en Firebase, algo fuera del alcance de este archivo.

**Importante:** con este reparto, **Firebase es necesario para poder iniciar sesión**, aunque Supabase esté configurado y funcionando perfectamente para los datos. Sin Firebase configurado, la app se queda en la pantalla de login sin forma de entrar. Si de verdad solo se quiere usar Supabase, sin Firebase en absoluto, hay que adaptar `backend.auth` a mano (ver "Migrar a otro backend" más abajo) para que use `sb.auth` en vez de `fbAuth`.

Si solo se rellena uno de los dos (Supabase o Firebase), la app funciona con esa única fuente para los datos — el ajuste de stock, por ejemplo, calcula con el que haya disponible. Si no se rellena ninguno, sigue funcionando con guardado local (`localStorage`), sin romper nada.

### Configurar Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta (gratis).
2. **New project** → nombre, contraseña de la base de datos (guárdala), región más cercana. Espera 1-2 minutos.
3. Menú lateral → **SQL Editor** → **New query** → pega el contenido de `supabase_setup.sql` (incluido en esta carpeta) → **Run**. Esto crea las tablas, la función de ajuste de stock, y activa el tiempo real.
4. Menú lateral → **Project Settings** (⚙) → **API** → copia la **Project URL** y la clave **anon public**.
5. En `index.html`, dentro del adaptador de backend cerca del principio del `<script>`, sustituye `TU_SUPABASE_URL` y `TU_SUPABASE_ANON_KEY` por esos dos valores.

### Configurar Firebase (necesario para el login)

1. Ve a [console.firebase.google.com](https://console.firebase.google.com) y crea un proyecto.
2. **Compilación → Firestore Database → Crear base de datos** (modo de producción, la región más cercana).
3. **Compilación → Authentication → Comenzar → Correo electrónico/contraseña** → activarlo.
4. **Configuración del proyecto** (⚙) → pestaña **General** → "Tus apps" → icono web `</>` → registrar la app. Firebase muestra un bloque `firebaseConfig`.
5. En `index.html`, sustituye el objeto `firebaseConfig` de ejemplo por ese bloque real.
6. **Authentication → Users → Add user** para crear las cuentas de acceso (por ejemplo, `taller@tecnomat.es` y la de Almacén).

### Seguridad

Las claves de Firebase y la clave `anon` de Supabase son públicas por diseño: la protección real está en las reglas de cada servicio. Mientras el registro público siga activo, cualquier persona puede crear una cuenta con esas claves, por lo que **«tener sesión iniciada» no basta**; hay que limitar el acceso a una lista de correos. Pasos, una sola vez:

1. **Firebase → Authentication → Settings → User actions**: desactivar «Enable create (sign-up)». Las cuentas se crean solo desde Authentication → Users.
2. **Firebase → Firestore Database → Reglas**: sustituir las reglas por las siguientes, con los correos reales de Almacén y Taller:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null
           && request.auth.token.email in ['almacen@tecnomat.es', 'taller@tecnomat.es'];
       }
     }
   }
   ```
3. **Supabase** (solo si se usa): crear en Authentication → Users las mismas cuentas, con el mismo correo y la misma contraseña que en Firebase (la app inicia sesión también en Supabase al entrar; si se cambia una contraseña, hay que cambiarla en los dos sitios); desactivar «Allow new users to sign up» antes de ejecutar nada más; revisar y ajustar los correos del bloque `insert` de `supabase_seguridad.sql` y ejecutarlo en el SQL Editor. El registro se desactiva en Authentication → Sign In / Providers. El SQL crea la tabla `tecnomat_usuarios` con los correos autorizados y limita todas las tablas a ellos. Para autorizar una cuenta nueva: `insert into tecnomat_usuarios (email) values ('correo@dominio.es');`.
4. **Proxy de Apps Script**: añadir las propiedades `FIREBASE_API_KEY` y `USUARIOS_PERMITIDOS` (ver más abajo). Sin ellas el proxy rechaza todas las peticiones.
5. **EmailJS** (solo si se usa): en el panel de EmailJS, limitar el servicio al dominio donde se publica la app, ya que su clave pública va en el código.
6. **Restricción real para Taller**: la de la interfaz (sección 5) es solo visual. Para impedir que esa cuenta escriba en el catálogo o los movimientos, las reglas de cada backend deben distinguir por correo en vez de aceptar a todos los autorizados.

Medidas incluidas en el código:
- Un saneador global elimina los manejadores de eventos, las etiquetas peligrosas y las direcciones `javascript:` de cualquier HTML que se inserte, de modo que un dato manipulado en la base de datos no pueda ejecutar código en el navegador de otro usuario.
- La política de seguridad del navegador impide objetos incrustados, cambios de base de URL y envíos de formularios a otros dominios. `chat.html` lleva una política más estricta, sin referer.
- El service worker solo guarda en caché los archivos de la app y las librerías de los CDN; las respuestas de las bases de datos nunca se almacenan.
- El proxy verifica la sesión de Firebase de cada petición, limita las consultas a la IA (20 por minuto y 400 al día), valida el tamaño y el tipo de las imágenes y el tamaño del respaldo.

### La otra app conectada al mismo proyecto de Supabase

Si otra app también inserta filas en `ordenes_trabajo` (y sus materiales en `orden_materiales`), Tecnomat las detecta solo, en tiempo real, y crea la orden/proyecto correspondiente — sin tener que darla de alta a mano. Ver la sección "Trabajo" más abajo para el detalle de qué pasa exactamente al recibir una.

La tabla `materiales_rapidos` (para la "Lista rápida" de Trabajo, ver esa sección) se gestiona desde dentro de la propia app, en Almacén → Más opciones → "Lista rápida (Trabajo)" — añadir y quitar materiales no requiere entrar a Supabase directamente, aunque también se puede editar ahí (Table Editor → `materiales_rapidos`) si se prefiere.

## 4. Avisos y notificaciones

**Correo (EmailJS, gratis):**
1. Cuenta gratuita en [emailjs.com](https://www.emailjs.com).
2. **Email Services → Add New Service**, conectar una cuenta de correo. Apuntar el **Service ID**.
3. **Email Templates → Create New Template**, con las variables `{{subject}}`, `{{message}}`, `{{to_email}}` en el cuerpo. Apuntar el **Template ID**.
4. **Account → General** → copiar la **Public Key**.
5. En `index.html`, bloque `emailjsConfig` (cerca de las claves de Supabase), sustituir las tres claves.
6. Dentro de la app, Almacén → panel "Avisos", poner el email de destino y guardar.

Sin `emailjsConfig` configurado, los avisos siguen apareciendo como banner dentro de la app, solo que sin correo.

**Qué avisa la app, y por qué canal:**
- **Stock bajo / bobinas por vencer**: banner al entrar en cualquier sección, y un correo diario (a partir de la hora configurada en Avisos) con el resumen. Un resumen semanal aparte incluye lo que más se ha movido.
- **Pedido nuevo desde Trabajo o Pedido**: al guardar una Hoja de pedido, o cuando Taller envía algo por el chat, Almacén recibe tres cosas — correo, un banner dentro de la app (pulsarlo lleva directo a esa orden), y un pitido + notificación del sistema en cualquier dispositivo con la app abierta. Pulsar **«Enviar»** en el chat equivale a «Guardar y avisar a almacén»: las líneas enviadas quedan marcadas como guardadas, con su fecha y hora, y avisan a Almacén igual que al guardar la hoja.
- **Sin conexión**: banner en rojo si se corta el internet a media faena, avisando de que los cambios se siguen guardando en el dispositivo pero no se sincronizan hasta que vuelva. Avisa también al recuperarse.
- **Sonido al escanear**: pitido corto al confirmar un escaneo con éxito (distinto del de "pedido nuevo"), desactivable en Almacén → Avisos.

Todo lo anterior (banner, sonido, notificación del sistema) solo funciona con la app abierta en ese momento, aunque sea en segundo plano si está instalada — para que funcione con la app completamente cerrada haría falta notificaciones push de verdad, una pieza bastante más grande de montar. El correo es el único de los avisos que llega siempre, esté la app abierta o no. El aviso con la app cerrada se cubre con el proxy de Apps Script descrito a continuación (Telegram y notificaciones push de OneSignal).

### Proxy de Apps Script: correo automático, Telegram y respaldo en Drive

El archivo `apps-script-proxy.gs` amplía el proxy de Gemini (mismo proyecto de Apps Script y misma URL) con funciones gratuitas:

- **Envío automático de la petición externa**: en el listado externo, el botón **«Enviar correo automáticamente»** manda el texto desde la cuenta de Google propietaria del script y registra la petición solo si el envío funciona. «Abrir correo» sigue disponible como alternativa. Una cuenta gmail.com admite 100 correos al día.
- **Aviso por Telegram** (opcional): cada correo enviado y las revisiones programadas avisan a un chat de Telegram.
- **Respaldo en Drive**: mientras Almacén usa la app, cada 30 minutos como máximo y solo si hay cambios, se envía una copia de los datos (catálogo, últimos 1000 movimientos, grupos, entregas, ubicaciones, trabajadores, clasificación y ajustes) y la lista de stock bajo. Se guarda en la carpeta «Tecnomat respaldo» de Drive (`respaldo_actual.json`, `stock_bajo.json`). Una copia fechada semanal conserva las últimas 8 semanas.
- **Stock mínimo por referencia**: en Almacén → Editar, el campo **«Stock mínimo»** fija el mínimo de esa referencia; vacío, rige el umbral general de Avisos. Una referencia está en stock bajo cuando sus unidades son iguales o inferiores a su mínimo, tanto en los avisos de la app como en los del proxy.
- **Aviso diario de stock bajo con la app cerrada**: a las 8:00 se envía por Telegram, por push y por correo (si se indica) la última lista de stock bajo recibida, con el mínimo de cada referencia.
- **Notificaciones push (OneSignal, plan gratuito)**: avisan en el dispositivo aunque la app esté cerrada, al enviarse una petición externa y en la revisión diaria de stock bajo.

**Instalación**
1. En el proyecto de Apps Script, sustituir todo el código por el contenido de `apps-script-proxy.gs` (incluye la función de Gemini). La clave de Gemini debe estar en las propiedades del script con el nombre `GEMINI_API_KEY`. El modelo por defecto está en la constante `MODELO_GEMINI`, al inicio del archivo; si Google retira un modelo basta con añadir la propiedad `MODELO_GEMINI` con el nombre nuevo, sin editar el código. Tras pegar el código hay que publicarlo: **Implementar → Gestionar implementaciones → editar (lápiz) → Versión: Nueva versión → Implementar**. Sin este paso sigue activa la versión anterior.
2. En **Configuración del proyecto → Propiedades del script**, añadir:
   - `FIREBASE_API_KEY` (obligatoria): la `apiKey` del objeto `firebaseConfig` del proyecto de Firebase. Sirve para comprobar la sesión de quien llama. Si la clave tiene restricción de sitios web en Google Cloud, la constante `ORIGEN_APP` de `apps-script-proxy.gs` debe coincidir con uno de los sitios permitidos; de lo contrario la comprobación falla y la IA responde «No autorizado».
   - `USUARIOS_PERMITIDOS` (obligatoria): correos con acceso al proxy, separados por comas, normalmente los de Almacén y Taller. Sin esta lista el proxy rechaza todo.
   - `CORREOS_PERMITIDOS`: direcciones a las que puede enviar el servidor, separadas por comas (obligatoria; sin ella no se envía ningún correo).
   - `TELEGRAM_TOKEN` y `TELEGRAM_CHAT_ID` (opcionales): token del bot creado con @BotFather e id del chat o grupo.
   - `AVISOS_CORREO` (opcional): dirección que recibe también el resumen diario de stock bajo.
   - `ONESIGNAL_APP_ID` y `ONESIGNAL_API_KEY` (opcionales, para push): identificador y clave de la API REST de la aplicación creada en OneSignal. `ONESIGNAL_SEGMENTO` (opcional) cambia el segmento de destino, que por defecto es «Subscribed Users».
3. Ejecutar una vez la función `instalarDisparadores` y aceptar los permisos (correo, Drive y conexiones externas).
4. **Implementar → Administrar implementaciones → Editar → Nueva versión** para mantener la misma URL.

**Activar las notificaciones push en cada dispositivo**
1. En OneSignal, crear una aplicación de tipo **Web** (*Custom Code*), con la URL de la app y HTTPS. Anotar el identificador de la aplicación y la clave de la API REST.
2. Subir a GitHub el archivo `OneSignalSDKWorker.js`, en la misma carpeta que `index.html` (no requiere subcarpetas).
3. En la app: Almacén → Más opciones → panel **Notificaciones push** → pegar el identificador de la aplicación y **Guardar ID**.
4. En cada dispositivo de Almacén que deba recibir avisos, pulsar **«Activar en este dispositivo»** y aceptar el permiso del navegador. En iPhone se requiere iOS 16.4 o superior y la app añadida a la pantalla de inicio.

**Seguridad.** La URL del proxy es pública, por eso toda petición debe llevar el token de sesión de Firebase de un usuario de `USUARIOS_PERMITIDOS`. Además, el servidor solo envía correos a las direcciones autorizadas en `CORREOS_PERMITIDOS`, limita los envíos a 20 por hora y las consultas a la IA a 20 por minuto y 400 al día, y no acepta respaldos vacíos ni superiores a 8 MB. Las claves viven solo en las propiedades del script.

## 5. Roles: Almacén y Taller

Quien entra con la cuenta **`taller@tecnomat.es`** solo ve las pestañas **Trabajo** y **Pedido** — Almacén, Resumen y Mantenimiento son exclusivas de Almacén, y tampoco ve el botón "Asociar" en el chat. **Sí puede finalizar/reactivar** una orden o proyecto (con confirmación siempre antes de hacerlo, para evitar toques accidentales), pero no puede eliminarla — eso sigue siendo solo de Almacén. Cualquier otra cuenta autorizada (por ejemplo `almacen@tecnomat.es`) ve todo.

**Esto es una restricción de interfaz**, no de seguridad real — oculta botones y redirige, pero no impide técnicamente que alguien con conocimientos edite datos saltándose la pantalla. Las reglas de seguridad de la sección 3 limitan el acceso a las cuentas autorizadas, pero no distinguen entre Almacén y Taller: una restricción real por rol exigiría reglas por correo en cada base de datos y separar los datos de cada rol.

## 6. Resumen (pantalla de inicio)

Al abrir la app, siempre se aterriza aquí primero (no en la última sección usada) — un vistazo con lo más urgente antes de entrar a trabajar: stock bajo, bobinas a punto de expirar, avisos sin leer, líneas pendientes en Pedido, y revisiones de Mantenimiento atrasadas o próximas. Cada tarjeta se puede tocar para ir directo a esa sección. **Exclusiva de Almacén** — Taller no ve esta pestaña, entra directo a Trabajo. La orden o proyecto que se estuviera viendo antes se recuerda igual, así que al entrar a Trabajo desde una tarjeta se sigue justo donde se dejó.

**Búsqueda global**: el cuadro «Buscar» del Resumen localiza a la vez referencias del stock (código, descripción, referencia, marca o ubicación), órdenes y proyectos (por nombre o por material pedido) y trabajadores. Con **«Ver»** se abre directamente el resultado. Se necesitan al menos dos caracteres.

**Reposición** (solo Almacén): cuando hay materiales por debajo de su mínimo, el Resumen muestra una lista con la cantidad propuesta para volver al doble del mínimo. Cada línea se puede desmarcar o ajustar, y la lista resultante se copia o se abre en el correo con un solo toque.

## 7. Trabajo (Montaje/Venta y Proyecto) y su chat

Montaje/Venta y Proyecto viven bajo una sola pestaña, **Trabajo** — al crear una orden se elige el tipo en un desplegable. Por dentro cada uno se sigue guardando por separado, solo cambia cómo se llega hasta ahí desde la pantalla.

**Textos en curso**: lo escrito en los campos del chat se conserva cuando la pantalla se actualiza sola (por ejemplo, por un cambio llegado desde otro dispositivo) mientras se siga en la misma orden y pestaña. Se vacía al enviar el mensaje y no pasa a otra orden ni a otra pestaña.

**El chat es la forma principal de pedir material** en una orden o proyecto, justo debajo del selector (que vive integrado ahí mismo, con "Finalizar"/"Eliminar" escondidos detrás de "Más opciones" para no saturar la pantalla, y "+ Nueva orden/proyecto" para crear otra):
- Cada escaneo aparece como mensaje en el hilo, en orden, junto con avisos como "Hoja guardada", "Recogida confirmada y firmada" o "Asociado a...".
- Se puede **escribir directamente** (no solo escanear) para pedir algo aunque no se sepa la referencia — queda como línea "sin referencia todavía". La caja admite **varias líneas**: **Enter baja de línea** y el envío se hace solo con el botón **Enviar**. Cada renglón es un artículo; el texto se respeta tal como está escrito y la cantidad es siempre 1. No hay selector de cantidad: Almacén fija la cantidad real al entregar, que es la que descuenta stock.
- **Solo Almacén** ve el botón **"Asociar"** en esas líneas, para enlazarlas con una referencia real (con el lector físico USB/Bluetooth, la cámara del móvil, o escribiéndolo a mano — un campo de texto normal acepta las tres formas) — y si esa referencia no existe todavía, se puede dar de alta ahí mismo, con 0 unidades.
- El chat tiene un alto fijo con su propio scroll, y se desplaza solo hasta el último mensaje.
- La tabla de siempre (**Hoja de pedido**, y **Servido**/**Devuelto** para Almacén) sigue existiendo en su propia pestaña, para imprimir o repasar de un vistazo — el chat no la sustituye, conviven las dos.
- El panel lateral también empieza compacto — solo "Resumen" a la vista, el resto (exportar, crear desde archivo, buscar en stock, histórico, entregas firmadas) detrás de "Más opciones".
- Con más de 6 órdenes/proyectos, encima del selector aparece un campo para buscar por nombre y filtrar la lista.
- **Lista rápida**: justo encima de la caja de escribir del chat, si hay materiales frecuentes configurados, aparece una lista pequeña de botones de selección para cada uno — misma lista para todas las órdenes y proyectos. Al marcar los que hagan falta y pulsar "Añadir seleccionados", se añaden de golpe a la solicitud pendiente (con su referencia real si el código coincide con algo del stock, o como línea "sin referencia todavía" si no), y queda anotado en el chat. Esta lista se mantiene aparte, directamente en Supabase (tabla `materiales_rapidos`), y se actualiza sola en cualquier dispositivo en cuanto cambia.
- **Referencias y unidades en el texto**: en el chat y en «Pegar una lista larga», varias referencias escritas en una misma línea («test1 test2 test3») se separan en una línea por referencia cuando todas parecen códigos (letras y números, o códigos del stock). Las unidades se leen cuando se indican solo con un número: «test1 5», «5 test1», «test1 x5», «5 uds test1», o en una línea aparte debajo de la referencia («test1» y debajo «5»). Los números que forman parte de una medida («tubo 20 mm», «cable 3x1.5») no se toman como cantidad. Las unidades leídas pueden corregirse luego en la línea.

**¿Quién pide el material?** No es un campo fijo en pantalla — al crear una orden, una ventana lo pregunta y obliga a rellenarlo. Cada tanda de material (cada vez que se firma una entrega, la orden queda lista para una tanda nueva) puede ser pedida por alguien distinto: si hace falta, se vuelve a preguntar con una ventana en el momento de escanear o escribir, sin bloquear ni esconder el chat mientras tanto.

**Flujo de entrega, con firma:**
1. Se escanea o se pide por chat el material necesario — no descuenta stock todavía, queda en la "Solicitud pendiente de recoger".
2. Al pulsar **"Preparar recogida y firmar"**, la app comprueba que hay stock real de cada línea.
3. La persona que recoge firma con el dedo o el ratón.
4. Al **"Confirmar entrega"** es cuando se descuenta el stock de verdad, y las líneas pasan a "Servido" — hasta ese momento no se ha tocado nada, por si se cancela a mitad de camino.
5. Queda un registro (quién pidió, quién recogió y firmó, qué materiales) en "Entregas firmadas", exportable a Excel.

Cada línea de la Hoja de pedido tiene además dos campos editables: **"Escandallo/Pedido"** (si ese material se pasó a un escandallo de costes o a un pedido a proveedor) y su **número identificativo** — editables tanto en líneas pendientes como en las **ya servidas**, ya que normalmente se sabe después de entregar el material, no antes. Al elegir el tipo en una línea, si ya hay otra línea de la misma hoja con ese mismo tipo y número puesto, se copia solo. Con la casilla por línea se pueden marcar varias a la vez (pendientes o servidas, mezcladas si hace falta), pidiendo un único número para todas las seleccionadas. **"Plano"** es un dato de toda la orden, no por línea — se edita en la cabecera de la Hoja de pedido, junto a la OT.

**Fecha y hora del pedido**: cada línea guarda el momento exacto en que se pidió (día, mes, año, hora y minutos). Ese dato se muestra en la columna «Fecha» de la Hoja de pedido, junto a cada línea en la clasificación de Almacén y en la columna «Fecha» de los Excel de listados. No cambia al volver a abrir o guardar la hoja. Las líneas creadas antes de esta función reciben como fecha el momento en que se abren por primera vez.

Una orden o proyecto **no se cierra sola** al entregar material — sigue activa y se puede seguir añadiendo hasta que alguien de Almacén pulse "Finalizar" a propósito.

**Clasificación del material (solo Almacén)**: cada línea de material se asigna a **Interno**, **Externo** o **Pequeño material** con un toque. El destino lo elige siempre Almacén: tener referencia, o parecerse a otro material, no determina el destino. Al crear una orden o proyecto no se elige Interno/Externo; la clasificación es solo por línea.
- **Qué propone el sistema**: solo dos casos. 1) Si la línea figura en la lista común de pequeño material (por referencia o por un texto muy parecido), se propone Pequeño material. 2) Si la misma referencia (o, en una línea sin referencia, las mismas palabras) se decidió **3 veces o más con el mismo destino** y sin decisiones en contra relevantes (al menos el 75 %), se propone ese destino, y con 5 decisiones iguales y ninguna distinta se aplica sola (ver «Automatización gradual»). Cuando no hay nada aprendido, la línea queda «Sin clasificar»; la IA puede dar una sugerencia a petición. Una propuesta aparece con el botón del destino en recuadro discontinuo y se acepta pulsándolo o con «Aceptar las N propuestas».
- En la pestaña **Hoja de pedido**, la tarjeta **«Revisar pedido»**, bajo la tabla, reúne todo lo de la clasificación: tres pestañas —**Sin clasificar**, **Interno** y **Externo**, con el número de líneas de cada una— separan las líneas, y los paneles solo muestran las del grupo elegido. La tabla de la hoja muestra siempre todas las líneas de la orden. Cada línea lleva tres botones **Interno / Externo / Pequeño**: pulsar uno la asigna y la pasa a su pestaña. Cualquier línea puede **moverse en cualquier momento** pulsando otro destino, sin límite de veces. Al pasar una línea a Externo aparecen los botones **Proveedor / Cliente** (opcionales; volver a pulsar el elegido lo quita); el destino figura en el texto de la petición y en el Excel. Al abrir una orden con líneas sin clasificar se muestra primero esa pestaña.
- **Aprendizaje**: cada asignación (incluida aceptar una propuesta o mover una línea) se recuerda por referencia y por las palabras con que Taller describe el material (sin distinguir mayúsculas ni tildes, ignorando cantidades y medidas); mover una línea resta la decisión anterior. Hasta que hay 3 decisiones iguales no se propone nada. Solo lo asignado por Almacén enseña al sistema y entra en la copia, la descarga y el envío automático de la petición externa. **Automatización gradual**: cuando la misma referencia (o las mismas palabras) se ha decidido **5 veces con el mismo destino y ninguna distinta**, la línea se clasifica sola, con la etiqueta «Auto» y la explicación en la propia línea. Basta pulsar otro destino para moverla: esa decisión contraria resta confianza y la línea deja de clasificarse sola. La casilla «Clasificar solo lo aprendido» de la tarjeta «Revisar pedido» lo desactiva. Lo clasificado así **nunca** se envía por el envío automático de la petición externa (solo entran las líneas asignadas por Almacén); sí aparece en el listado del correo, que Almacén revisa y abre a mano. Cuando Almacén decide un destino distinto a la sugerencia de la IA, la sugerencia guardada se corrige y no vuelve a proponerse.
- **Listado interno**: líneas asignadas a Interno y como Pequeño material (estas últimas con la etiqueta «Pequeño material»; botón «Copiar listado interno»). **Listado externo**: líneas asignadas a Externo y petición de material externo (ver abajo). Cada listado se descarga por separado con el botón visible **«Descargar listado interno/externo de esta orden (Excel)»**, que genera un archivo `listado_<interno|externo>_<orden>_<fecha>.xlsx` con las líneas de esa pestaña únicamente (el externo incluye el destino Proveedor/Cliente y la fecha de la petición).
- **Correo de material externo**: la tarjeta **«Correo de material externo»** está siempre visible para Almacén bajo el selector de orden, en todas las pestañas de Trabajo y sin necesidad de abrir ninguna orden; indica cuántos listados hay pendientes (o «nada pendiente», con la explicación de cómo hacer que aparezcan) y, al pulsarla, abre una ventana con la lista de **todos los listados externos pendientes de pedir**, de todas las órdenes y proyectos, cada uno con su casilla, sus líneas y su **número de plano** (editable ahí mismo). Los listados marcados se unen en un único correo, así que no hace falta preparar uno por uno; «Marcar todos» y «Quitar todos» aceptan o descartan la selección de golpe. El correo no usa la OT como referencia, sino el número de plano: La ventana tiene los botones de acción («Copiar texto», «Abrir correo», «Enviar correo automáticamente») siempre visibles abajo, se cierra con «Cerrar» o tocando fuera, y se cierra sola al copiar, abrir o enviar el correo. En la pestaña «Externo» de cada orden, el botón **«Preparar correo de material externo»** abre esa misma ventana.

  ```
  Buenas tardes,

  Este es el listado de material que me falta por suministrar.

  Número de plano: …
  - artículo — cantidad (Proveedor/Cliente)

  Número de plano: …
  - …

  Un saludo.
  ```

  **«Copiar texto»** lo lleva al portapapeles y **«Abrir correo»** abre el programa de correo del dispositivo (por ejemplo Outlook) con el asunto, el texto y el destinatario ya rellenos (el correo de destino se escribe una vez y se recuerda). Al usar cualquiera de los dos, las líneas incluidas quedan registradas como pedidas y no se repiten en el siguiente correo. Si algún listado no tiene número de plano, se avisa y el texto indica «(sin indicar)». El número de plano también se guarda al escribirlo en el campo «Plano» de la Hoja de pedido de cada orden.
- **Peticiones guardadas**: al copiar o abrir el correo, la petición queda guardada con su fecha y orden, y esas líneas dejan de aparecer en el listado, de modo que la siguiente petición solo incluye líneas nuevas y nunca se mezclan fechas ni órdenes. En «Peticiones anteriores de esta orden», **«Copiar»** vuelve a copiar exactamente una petición concreta y **«Anular»** la elimina y devuelve sus líneas a pendientes (por ejemplo, tras copiar por error). Se conservan las últimas 200 peticiones.
- **Referencias sugeridas**: el sistema también recuerda a qué referencia se asoció cada texto que Taller escribió a mano (sin distinguir mayúsculas, tildes ni singular/plural: «tornillo» y «tornillos» cuentan igual; tolera cambios de orden o palabras sueltas). En la Hoja de pedido, las líneas «sin referencia» parecidas a otras ya asociadas aparecen en el panel **«Referencias sugeridas»** con la referencia propuesta: **Confirmar** la asigna (queda anotado en el chat), **No es** descarta esa propuesta para la línea, y «Confirmar las N referencias sugeridas» lo hace de una vez. Solo lo confirmado enseña al sistema. Si la referencia ya no existe en el stock, no se propone.
- **Coincidencia con el stock**: un texto cuyas palabras están todas contenidas en la descripción de una única referencia del stock («bridas negras» frente a «Bridas negras 200mm») se propone en «Referencias sugeridas» y solo se asigna al confirmar. Si encaja con varias («cable»), se deja a la IA o a Almacén. La referencia solo se asigna sola cuando el texto coincide exactamente con un código o referencia del stock, o con una asociación ya validada 3 veces o más.
- **Mover entre listados**: pulsar otro destino en cualquier línea la mueve y avisa del nuevo destino; pasa a la pestaña correspondiente.
- **Envío automático de la petición externa**: si hay correo de destino y la casilla está activa (por defecto), 15 s después de que Almacén envíe líneas desde el chat o añada una lista pegada, aparece una barra con la cuenta atrás, **Enviar ya** y **Cancelar**. Al terminar, el correo sale por el proxy con las líneas asignadas a Externo aún no pedidas, y la petición queda registrada. Las líneas sin clasificar no se envían.
- **Referencias asignadas por coincidencia**: cuando el texto coincide exactamente con un código o referencia del stock, o con una asociación ya validada 3 veces o más, la línea recibe la referencia y aparece en el panel **«Referencias asignadas por coincidencia»**, con **Validar** (enseña al sistema y queda anotado en el chat) y **Deshacer** (devuelve el texto original y no vuelve a proponer esa referencia). Asignar la referencia no decide el destino: la línea sigue «Sin clasificar» hasta que Almacén la asigne.
- **Ayuda de IA**: refuerza la detección en las líneas que el algoritmo local no resuelve. Se lanza sola cuando hay 3 o más líneas sin detectar (casilla «IA automática», desactivable) o con el botón **«Pedir sugerencias a la IA (N)»**. Consumo de tokens limitado: solo se envían las líneas sin detectar y no consultadas antes (máximo 20, en **una única petición**), con como máximo 6 candidatos del stock por línea preseleccionados localmente (nunca el catálogo completo), sin imágenes y con respuesta en JSON compacto; cada resultado, también el de «sin coincidencia», se guarda en una caché por texto; y existe un tope de 8 consultas al día, visible en el panel. Lo ya aprendido no se consulta: las líneas con propuesta aprendida o con sugerencia guardada no se envían, y para dividir el texto del chat solo se recurre a la IA cuando una línea enlaza varios artículos con «y», «además» o «+», o repite la palabra inicial; una línea larga sin esos signos se trata como un solo artículo. Usa el mismo servicio de Gemini que el reconocimiento de documentos y envía a ese servicio el texto de las líneas pendientes y las descripciones de los candidatos. Si el servicio falla, se muestra un aviso y no se guarda nada.
- **Pestaña «Pequeño material»** (solo Almacén; Taller no la ve): entre «Chat» y «Hoja de pedido» de cada orden. Muestra la **lista común de pequeño material**, en cuadrícula compacta. Cada material es un botón que se resalta al tocarlo; **«Añadir al pedido»** incorpora los seleccionados a la orden abierta, con cantidad 1, ya con la etiqueta y sin escribir (con más de 8 hay un filtro). Almacén fija la cantidad real al entregar. Solo afecta a la orden abierta; el chat de Pedido no se toca.
- **La lista es independiente de las órdenes**: una entrada se crea al marcar una línea como Pequeño material (con o sin referencia) o desde «Gestionar la lista», y permanece aunque se quite la línea de cualquier pedido. Solo Almacén la modifica, de forma manual: **«Eliminar»** (con confirmación) y un campo para añadir por código o nombre. Si una entrada sin referencia se asocia después a una referencia del stock, pasa a ser la entrada de esa referencia. Las referencias que ya se habían clasificado como pequeño material pasan a la lista automáticamente. 
- **Sin duplicados**: los materiales que ya están en el pedido de la orden (o ya servidos) aparecen bloqueados («En el pedido» / «Ya servido») y no se pueden volver a marcar; para repetirlos se añaden a mano desde la Lista rápida o escribiéndolos. La selección pertenece a la orden abierta y se descarta al salir de la pestaña o cambiar de orden. 
- Lo aprendido se guarda en la clave `clasificacion` del mismo almacenamiento que el resto de datos.

**Órdenes creadas por otra app**: si otra app conectada al mismo proyecto de Supabase inserta una fila en `ordenes_trabajo` (con sus materiales en `orden_materiales`), Tecnomat la detecta en tiempo real y hace todo esto sola, sin intervención:
- Crea la orden o proyecto con el nombre, tipo e Interno/Externo que traiga.
- Busca cada material en el stock — si lo encuentra, lo añade a la solicitud pendiente con su referencia real; si no, lo deja como línea "sin referencia todavía" (con el botón "Asociar" para Almacén, igual que el resto).
- Dice quién lo pidió, y lo deja anotado en el chat de esa orden.
- Avisa a Almacén igual que con cualquier pedido nuevo (correo, banner, sonido).

Si Tecnomat todavía no está configurado con Supabase (ver sección 3), esta parte simplemente no ocurre y las órdenes se siguen creando a mano como siempre.

### Chat externo de Taller (dentro de otra aplicación)

Permite mostrar el chat de una orden dentro de otra aplicación, como un recuadro incrustado, sin abrir Tecnomat. Requiere **Supabase activo** (sin él, el panel no aparece).

**Preparación (una sola vez)**
1. En Supabase → SQL Editor, ejecutar `supabase_chat_externo.sql` (después de `supabase_setup.sql`). Crea las tablas del chat y dos funciones que son lo único accesible sin sesión, protegidas por el identificador de la orden y una clave.
2. Subir `chat.html` a GitHub junto a `index.html`. No requiere configuración: el enlace lleva los datos de Supabase.

**Uso**
1. En Tecnomat, dentro de la orden → pestaña **Chat** → panel **«Chat externo de Taller»** (solo Almacén) → **«Crear enlace de chat»**. El enlace se copia al portapapeles; **«Copiar enlace»** lo vuelve a copiar.
2. En la otra aplicación, pegar el enlace como página incrustada (iframe o vista web) en la pantalla de esa orden. Si Taller debe poder usar la cámara desde ahí, la otra aplicación tiene que permitir el acceso a la cámara en ese recuadro.
3. En el recuadro, Taller escribe su nombre, el material, la cantidad y, si la conoce, la referencia. Cada mensaje queda a la vista con la marca «recibido en almacén» cuando Tecnomat lo importa.

**Qué hace Tecnomat con los mensajes**
- Se importan cada 15 segundos mientras haya una sesión de Tecnomat abierta (de Almacén o de Taller); si no hay ninguna, esperan en Supabase hasta la siguiente.
- Cada mensaje se añade a la **solicitud pendiente** de esa orden: con la referencia del stock si el código coincide (las cantidades de una misma referencia se suman) o como línea «sin referencia todavía» si no. Queda anotado en el chat de la orden como «Taller (app externa)». Si la solicitud no tenía solicitante, se usa el nombre indicado en el mensaje.
- Un mensaje ya importado no se repite.

**Seguridad.** El enlace es la llave del chat de esa orden: quien lo tenga puede leerlo y escribir en él, y nada más. **«Regenerar enlace»** (con confirmación) invalida el anterior y copia uno nuevo, que hay que pegar de nuevo en la otra aplicación. La página solo acepta servidores `*.supabase.co`, y el servidor limita a 20 mensajes por minuto y 2000 en total por orden (hay que volver a ejecutar `supabase_chat_externo.sql` para aplicar el tope).

## 8. Pedido

Sirve para pedir material que falta en el almacén (por ejemplo, para reponer stock desde un proveedor) — no lleva firma, es un listado que se manda por correo. Tiene el mismo chat que Trabajo (con su pestaña "Chat" y "Lista"), pero aquí **se pregunta quién hace el pedido en cada escaneo o mensaje**, y en su caja de texto Enter envía directamente (en el chat de Trabajo Enter baja de línea), no solo una vez — pensado para un dispositivo que se comparte entre varias personas. Cada línea del chat muestra quién pidió esa unidad en concreto.

## 9. Mantenimiento

**Exclusiva de Almacén** — Taller no ve esta pestaña. Pestaña para llevar el mantenimiento de los vehículos de la empresa (furgonetas, coches de reparto...), independiente del resto de secciones — no descuenta stock ni tiene escáner, es solo un seguimiento de fechas y kilometraje.

- Se pueden dar de alta **varios vehículos** (matrícula, marca, modelo, año, kilómetros actuales), cambiando entre ellos con un desplegable, con botón para editarlos o eliminarlos. Se identifican por matrícula, como es natural en una flota de empresa.
- **Mecánico habitual**: nombre y contacto (teléfono o email) por vehículo, visibles en el panel lateral.
- **Fotos**: se pueden añadir fotos (con la cámara del móvil o desde archivo) enlazadas a cada vehículo, con una pequeña galería y opción de eliminarlas. Se comprimen automáticamente antes de guardarlas.
- Cada tarea de mantenimiento (cambio de aceite, ITV, correa de distribución, frenos...) tiene un intervalo en **kilómetros y/o en meses** — avisa con lo que llegue antes. Hay una lista de tareas habituales que rellena los intervalos típicos al elegirlas, editables después.
- Cada tarea se ve en verde (al día), naranja (pronto) o rojo (atrasada), con un resumen arriba del recuento de cada estado.
- **"Hecho"** actualiza el kilometraje y la fecha de esa tarea con un par de datos, y recalcula sola la próxima vez.
- **Los avisos de mantenimiento pendiente entran en el mismo sistema de avisos que ya usa el resto de la app**: aparecen en el banner de arriba (junto a los de stock bajo, si los hay) y en el correo diario, sin tener que entrar a mirar la pestaña a propósito.
- No tiene buscador de stock ni escáner — esta sección no descuenta ni consulta material.
- Los datos se guardan igual que el resto de la app — en la nube si Supabase está configurado, compartidos entre todos los dispositivos con la sesión iniciada.

## 10. Almacén

- **Panel lateral compacto**: por defecto solo se ven "Resumen" y "Últimos movimientos" — el resto (Exportar/Importar, Sobrescribir todo el stock, Copia de seguridad, Avisos, Ubicaciones, Histórico general, Actividad) se esconde detrás de un botón "Más opciones", para no abrumar con paneles que se usan poco.
- **Materiales sincronizados desde A3**: si otra app conectada al mismo proyecto de Supabase sincroniza el catálogo de artículos de A3 (código, descripción, precio de venta, stock según A3), Tecnomat los recibe solo, en tiempo real. Si el código ya existe en el stock, se actualiza la descripción sin tocar la cantidad real (esa la sigue llevando Tecnomat, sumando y restando por escaneo); si es un código nuevo, se da de alta con 0 unidades, a la espera de que entre stock de verdad. El número de stock que trae A3 se guarda aparte, solo de referencia — nunca sustituye a la cantidad real de Tecnomat.
- **Salud de datos frente a A3** (dentro de "Más opciones"): recuento de artículos ya confirmados por A3 frente a los dados de alta a mano que A3 todavía no ha reconocido — útil para detectar códigos con errata, duplicados, o artículos pendientes de dar de alta allí.
- **Gestión de la Lista rápida** (dentro de "Más opciones"): añadir o quitar los materiales frecuentes que aparecen junto al chat de Trabajo, sin salir de la app.
- **Editar**: un único botón agrupa código, artículo, referencia, ubicación, categoría, coste y características en un solo formulario. El **código** puede cambiarse; el cambio se aplica a los movimientos, a las órdenes (pendiente, servido, devuelto), a las entregas y al aprendizaje de la clasificación. Si varias referencias comparten código, solo cambian los registros vinculados a la referencia editada. Dentro de ese mismo formulario están también **Etiqueta**, **+ Otra referencia** y **Eliminar** — así cada fila de la lista solo muestra dos botones ("Editar" y "Cambiar cantidad"), en vez de cinco, que en una lista de decenas de artículos se nota mucho.
- **Filtros**: por categoría, solo stock bajo (0) o solo sin ubicar, combinables con la búsqueda de texto.
- **Ubicaciones**: panel para mantener una lista (añadir/quitar) que autocompleta al escribir la ubicación de un material — sigue siendo texto libre, esto solo evita erratas.
- **Valorización**: columna "Coste" reconocida al importar un Excel, o rellenable a mano por artículo. El resumen de Almacén muestra el valor total del inventario.
- **Trazabilidad**: cada movimiento, eliminación y entrega firmada guarda el email de quien lo hizo (si hay login).
- **Entrada/Salida al escanear**: interruptor junto al escáner para elegir si el escaneo suma o resta stock. El escáner va siempre justo debajo del buscador en Almacén, antes de la lista de stock — con inventarios largos, no queda empujado fuera de la vista.
- **Rendimiento con inventarios grandes**: la lista solo pinta 80 artículos a la vez, con "Cargar más" para ver el resto.
- **Colores pensados para daltonismo**: ningún dato depende solo del color (siempre hay texto o número también). Pedido usa magenta y Stock bajo/OK usan rosa/verde azulado en vez de rojo/verde puros, para distinguirse bien bajo daltonismo rojo-verde.
- **Tour inicial y botón "Ayuda"**: repaso corto de la app que aparece solo la primera vez, y se puede volver a abrir cuando se quiera. Incluye los pasos de pedido por chat y de clasificación Interno/Externo/Pequeño material (este último solo para Almacén).
- **Pantalla de Trabajo simplificada**: cada pestaña muestra una línea de guía según el rol; en la Hoja de pedido, Almacén dispone de una única tarjeta «Revisar pedido» (referencias por confirmar, las pestañas Sin clasificar / Interno / Externo con los botones de destino de cada línea, y la consulta a la IA para las líneas sin detectar); «Pegar una lista larga» y el listado interno quedan plegados; el bloque de escaneo es plegable (abierto por defecto para Almacén y cerrado para Taller, con la última elección recordada en el dispositivo).
- **Mensajes de error comprensibles**: los fallos de conexión, de límite de consultas y de tiempo de espera de la IA y del correo se muestran en lenguaje llano en lugar del texto técnico del navegador.

### Herramientas de Almacén: etiquetas e inventario guiado

En Almacén (solo rol Almacén) el panel **Herramientas** abre dos diálogos.

**Etiquetas (Brother QL-700).** Se eligen referencias (con buscador y filtro por categoría) o ubicaciones, el número de copias de cada una y el tamaño del rollo:

| Tamaño | Rollo Brother | Disposición |
|---|---|---|
| 62 × 29 mm | DK-11209 | horizontal |
| 29 × 90 mm | DK-11201 | girada 90° |
| 38 × 90 mm | DK-11208 | girada 90° |
| 17 × 54 mm | DK-11204 | girada 90° |
| 62 mm continuo | DK-22205 | horizontal, 30 mm de largo |

- **Contenido.** Las etiquetas de referencia llevan código de barras Code 128 del código, el código, la descripción y la ubicación. Las de ubicación llevan el nombre en grande y un código de barras con el prefijo `UB-` (p. ej. `UB-A-12`), que el inventario guiado reconoce al escanearlo.
- **Formatos estrechos.** En los rollos de 17, 29 y 38 mm el contenido se gira 90° para que el código de barras recorra la longitud de la etiqueta y mantenga un tamaño de barra legible.
- **Impresión.** El botón **Imprimir** fija el tamaño de página de la etiqueta y abre el cuadro de impresión del navegador. En él se elige la **Brother QL-700**, el tamaño de papel igual al del rollo cargado, márgenes «Ninguno» y escala 100 %. La QL-700 se conecta por USB, por lo que hay que imprimir desde un ordenador con el controlador de Brother instalado. Si el borde de la etiqueta sale cortado, hay que ajustar los márgenes del controlador.
- **Límite.** Máximo 300 etiquetas por impresión; a partir de 50 se pide confirmación. El generador de códigos de barras se descarga de internet la primera vez y queda en la caché de la app.

**Inventario guiado.** Se cuenta una ubicación cada vez: se escanea su etiqueta (o se elige de la lista) y después cada material; cada lectura suma 1 y la cantidad también se puede escribir o ajustar con − y +. La **cámara continua** permanece abierta entre lecturas (requiere un navegador con lector de códigos, como Chrome en Android; con lector USB o Bluetooth se usa el campo de texto). **Revisar diferencias** muestra solo lo que no coincide con el stock; lo no contado no se modifica. Al **aplicar los ajustes** (con confirmación) se registran movimientos de entrada o salida con el texto «Ajuste de inventario — ubicación». Hasta ese momento el stock no cambia.

**Etiquetas pendientes.** En la lista de referencias, **«Sin etiquetar»** marca las referencias cuya etiqueta aún no se ha impreso desde la app. Al imprimir, las referencias del lote quedan registradas como etiquetadas.

**Mínimos automáticos.** En Almacén → Herramientas → **«Mínimos automáticos»** se propone un mínimo por referencia a partir de las salidas de los últimos 90 días: el mínimo cubre 14 días de consumo y solo se tienen en cuenta las referencias con 3 o más salidas. Cada propuesta se puede desmarcar antes de **«Aplicar seleccionados»**; el stock no se modifica, solo el mínimo de la referencia.

**Pitido de lectura.** La casilla «Pitido al leer un código» del panel Herramientas activa o desactiva el sonido de la cámara continua y del inventario guiado.

### Categoría «Ropa» y Trabajadores

**Ropa** es una categoría más del stock: se asigna a una referencia desde Almacén → Editar → Categoría (también aparece en el filtro por categoría). En la sección **Trabajadores** cada persona tiene una **ficha de ropa**.

- **Añadir y asignar.** Se escribe el nombre y se pulsa **«Añadir»**. Después se asignan las prendas de la categoría Ropa (selector, cantidad y **«Asignar»**). Mientras no exista la ficha, la ropa asignada aparece como borrador.
- **Crear la ficha.** Con al menos una prenda asignada se activa **«Crear ficha»**. La ficha muestra la fecha de creación y lo asignado al trabajador. Asignar, crear o editar una ficha **nunca descuenta stock**.
- **Ficha editable.** **«Editar»** permite cambiar el nombre y las cantidades, **«Quitar»** una prenda y **«Añadir a la ficha»** otra; **«Listo»** vuelve a la vista de la ficha. Junto a cada prenda aparece lo entregado hasta ahora.
- **Entregar** (solo Almacén). Con las prendas marcadas de la ficha (por defecto todas), el botón **«Entregar la ropa marcada»** pide confirmación, descuenta las unidades del stock (movimiento de salida «Entrega de ropa — trabajador») y añade la entrega al listado. Es la única acción que modifica el stock. Las prendas permanecen en la ficha después de entregar. Si alguna referencia no existe o no tiene stock suficiente, la entrega se bloquea con un aviso.
- **Listado de ropa entregada.** Muestra cada entrega con fecha, artículos y cantidad, de la más reciente a la más antigua. Se puede **copiar** como texto o **descargar en Excel**. *Anular* (solo Almacén) devuelve las unidades al stock y elimina esa entrega; la ficha permanece igual.
- **Renovación.** Almacén fija en la parte superior los meses de renovación (12 por defecto). Cuando una prenda entregada supera ese plazo, la ficha la marca como «toca renovar» y la pantalla lista las **renovaciones pendientes** con un acceso a cada ficha.
- **Hoja firmable.** Cada entrega del listado tiene el botón **«Hoja firmable»**, que imprime en A4 una hoja con el trabajador, la fecha, las prendas y cantidades, y dos líneas de firma («Firma del trabajador» y «Entregado por»).
- Si una referencia se elimina del stock, la ficha lo indica y permite quitarla. Si no hay referencias de Ropa, la propia pantalla indica cómo crearlas.

## Pegar lista de material

En la pestaña Chat de cada orden, el panel plegable «Pegar lista de material» convierte texto escrito o pegado (un correo, un mensaje de mensajería, una nota) en líneas de la solicitud pendiente.

- Un artículo por línea; también se admiten comas y punto y coma. El texto se respeta tal como está escrito («test», «test 1», «test 2» son tres líneas distintas): no se extraen cantidades, que asigna Almacén en la Hoja de pedido. Cada línea entra con cantidad 1.
- El análisis es local y gratuito. Solo las líneas que mezclan varios artículos (largas, con «y» o «+», o con una palabra inicial repetida) se envían a Gemini, todas juntas en una única petición. El chat de Trabajo aplica la misma separación al enviar.
- Cada línea se enlaza con una referencia del catálogo cuando coincide; los números cuentan: «test 1» no se enlaza con una referencia «Test» sin número. Si no hay coincidencia, queda como texto libre. La vista previa permite desmarcar líneas antes de añadirlas.
- Si la solicitud no tiene solicitante, el panel pide el nombre antes de añadir.

## Análisis de actividad

En Resumen (solo Almacén), el panel «Análisis de actividad (30 días)» calcula sin IA: mayor consumo, referencias que se agotan en 10 días o menos, stock bajo, salidas anómalas y referencias con stock sin movimiento en 90 días. El botón de recomendaciones envía a Gemini únicamente ese resumen (nunca el catálogo completo) y guarda la respuesta; si los datos no han cambiado, se reutiliza sin nueva consulta.

## Control del consumo de Gemini

- **Primero lógica local:** Gemini solo interviene cuando el análisis local no resuelve.
- **Límites diarios:** clasificación de líneas, 8; lista de texto, 10; recomendaciones, 10. Solo cuentan las consultas que la IA responde correctamente. Cada panel muestra los usos del día. Al alcanzar el límite, la función sigue disponible en modo local.
- **Cachés:** las respuestas se conservan por contenido (texto interpretado, clasificación y resumen por huella de los datos), de modo que una consulta repetida no se vuelve a enviar.
- **Imágenes del escáner reducidas:** cada página se envía con lado máximo de 1600 px y JPEG al 80 %, en lugar de la resolución completa de la cámara. Es el mayor ahorro, ya que el coste de una imagen crece con su tamaño. Si un documento con letra muy pequeña deja de leerse bien, el valor se ajusta en `__GEMINI_LADO_MAX`.
- **Prompts cortos:** el contexto de catálogo enviado con el escáner se limita a 25 referencias con descripciones de 40 caracteres como máximo.

## 11. Crear una orden/proyecto subiendo un archivo (Excel, CSV o PDF)

Dentro de Trabajo, con una orden seleccionada, hay un botón para subir un archivo. Busca cada línea en el stock (por código o referencia) y la añade a la solicitud pendiente — no descuenta stock directamente, eso solo pasa al preparar la recogida y firmar.

- **Excel/CSV**: fiable, reconoce columnas tipo Código, Referencia/Descripción y Cantidad.
- **PDF**: "mejor esfuerzo" — sin columnas reales, la app busca en cada línea de texto algo con forma de "referencia ... cantidad al final". Con listados sencillos funciona bien; con PDFs de diseño complicado puede no acertar — en ese caso, mejor subir el Excel/CSV original.

Si una línea no coincide con nada del stock, se da de alta automáticamente como referencia "plantilla" (sin stock real) para completarla más tarde. Antes de aplicar el archivo, la app enseña un resumen línea a línea y pide confirmar.

## 12. Escanear un documento y guardarlo enlazado a su orden

Dentro de Trabajo, cada orden/proyecto tiene su propio panel de "Documentos escaneados" — útil para digitalizar un listado de material en papel, un albarán, o cualquier papel que llegue y haya que guardar junto a esa orden en concreto.

- **"Escanear documento"** abre la cámara del móvil, pidiendo resolución alta (hasta 2560×1440) a propósito, para que el texto del papel escaneado se lea bien y no salga borroso. Se puede capturar **varias páginas seguidas** (cada una queda como una miniatura, y se puede tocar una para quitarla antes de terminar).
- Cada página capturada se **recorta sola**: la app detecta el contraste entre la hoja y la superficie de debajo y quita el borde sobrante automáticamente. Si no encuentra un borde claro (por ejemplo, la hoja ya ocupa todo el encuadre), deja la foto tal cual, sin forzar el recorte.
- Al terminar de capturar todas las páginas, hay que elegir el **proveedor** (JULMATIC, INOXPA o BIONET) y pulsar **"Terminar documento"**: en un solo paso, junta las páginas en un único PDF (guardado y enlazado a esa orden/proyecto — no a ninguna otra) y a continuación reconoce el texto para el apartado de material, sin pasos intermedios.
- Desde el panel de "Documentos escaneados" se puede **"Ver"** el PDF en una pestaña nueva, o **"Eliminar"** el documento. Al verlo, se convierte primero en un archivo real (Blob) antes de abrirlo — los navegadores de escritorio bloquean por seguridad abrir directamente el enlace largo con el que se guarda el PDF.
- Se guardan hasta 20 documentos por orden/proyecto; a partir de ahí, los más antiguos se van sustituyendo.

### Reconocer material del documento (OCR)

Como parte de **"Terminar documento"**, la app lee el texto del documento (reconocimiento de texto en el propio navegador, sin servidor) y ayuda a darlo por **Servido** en esa orden, como si ya se hubiera entregado — útil para digitalizar un albarán de proveedor que ya se ha usado.

- **La app nunca decide sola si una línea es un artículo del stock o no** — reconoce el texto y lo enseña, línea a línea, en el mismo orden en que aparece en la hoja, para que la persona escriba (o confirme) el código real de cada una antes de aplicar nada.
- Si una línea ya se relacionó antes con un código (en cualquier orden anterior), la app lo recuerda y lo sugiere solo — sigue siendo editable, no se aplica sin revisar.
- Al confirmar: las líneas con un código válido **se sirven de verdad y descuentan stock real**. Las que se dejen en blanco **no crean ningún artículo nuevo** — pasan a un apartado de **"Material faltante"** dentro de esa misma orden, visible para cualquiera que la abra, con la cantidad, el proveedor y la fecha.
- Desde "Material faltante" se puede **"Pedir"** esa línea (la manda a la solicitud pendiente de esa orden, como cualquier otro pedido, para reclamarla formalmente) o **"Quitar"** cuando ya no haga falta.
- El reconocimiento de texto es heurístico, no es perfecto: funciona mejor con texto impreso claro y buena luz. Con letra manuscrita o fotos borrosas puede no acertar ninguna línea — en ese caso, mejor añadir el material a mano desde el chat.

## 13. Instalar la app en el móvil (PWA)

Gracias a `manifest.json`, `sw.js` y los iconos (súbelos todos junto al `index.html`):
- **Android (Chrome)**: aviso de "Añadir a pantalla de inicio", o menú ⋮ → "Instalar app".
- **iPhone (Safari)**: botón compartir → "Añadir a pantalla de inicio".

Una vez instalada, abre en pantalla completa y guarda una copia básica en caché para no quedarse en blanco si se corta la conexión un momento.

Cada publicación debe cambiar el valor de `CACHE_NAME` en `sw.js` (por ejemplo, `tecnomat-materiales-v218`); si no cambia, el navegador sigue mostrando una versión anterior.

Cuando se suben cambios nuevos, aparece un banner — *"Hay una versión nueva disponible"* — con un botón para actualizar. Hasta que no se pulse, sigue con la versión que ya tenía cargada.

### Adaptación a tablet y móvil

Listas de la Hoja de pedido: cuando hay líneas clasificadas, la tabla se divide en listas separadas, con un selector «Interno · Externo · Sin clasificar» y el número de líneas de cada una. En Interno se marca el Escandallo (con su número) y cuándo se entregó cada línea; en Externo se marca el Pedido (con su número) y cuándo se entregó. En Externo cada línea indica «Pedido» o «Sin pedir», y al enviar el correo de material externo (manual o automático) sus líneas pasan a «Pedido». Cada lista solo ofrece su propia marca, también en los botones de marcar varias líneas. Cambiar de lista solo cambia la vista, no modifica la orden. Enviar desde el chat equivale a «Guardar y avisar a almacén»: marca las líneas como guardadas, deja constancia en el chat y avisa a Almacén con el listado completo.

Sin parpadeos: al pulsar una opción o cambiar de pestaña, la pantalla se repinta sin animación de aparición y la tarjeta «Revisar pedido» mantiene su posición, de modo que el contenido no salta. La disposición de escritorio no cambia. En móvil, las pestañas de la orden (Chat, Pequeño material, Hoja de pedido, Servido y Devuelto) pasan a una segunda fila en vez de desplazarse hacia un lado, de modo que todas quedan a la vista. En pantallas de hasta 1000 px la **Hoja de pedido** pasa de tabla a tarjetas por línea (artículo, referencia, cantidad, reserva, escandallo/pedido y recibido), sin desplazamiento horizontal. En móvil (hasta 760 px) la cabecera se compacta (logotipo, título y botones en una sola franja; se ocultan el subtítulo y el aviso de guardado), el selector de orden y «+ Nueva» comparten fila, el chat coloca el texto en una línea propia y debajo cantidad, «Reserva» y «Enviar», los campos usan 16 px (evita el zoom automático), la pestaña activa del trabajo se centra en la barra de pestañas y los paneles secundarios «Ayuda de IA» y «Listado interno» aparecen plegados (se despliegan al pulsar el título).

## Migrar a otro hosting o base de datos

Todo lo que depende de Supabase y/o Firebase vive dentro de un único objeto, `backend`, cerca del principio del `<script>` — el resto de la app nunca menciona ninguno de los dos directamente fuera de ese bloque, solo llama a `backend.get/set/delete/watch` y a `backend.auth.*`. Ahora mismo ese objeto combina los dos (escritura doble, login por Firebase); sustituirlo entero por uno nuevo con esta misma forma es lo único que hace falta para dejar de depender de cualquiera de los dos, o de ambos.

- **El hosting** ya es independiente del backend — es un único archivo HTML, funciona en GitHub Pages, Netlify, Vercel, un servidor propio, o cualquier sitio que sirva archivos estáticos, sin cambiar nada.
- **La base de datos** es lo que está concentrado en el objeto `backend`. Para migrar de verdad, hay que escribir un objeto nuevo con esta misma forma y sustituir el `backend = {...}` actual:

```js
backend = {
  async get(key){ /* devuelve el valor guardado bajo esa clave, o null */ },
  async set(key, value){ /* guarda value bajo esa clave */ },
  async delete(key){ /* borra esa clave */ },
  watch(key, applyFn){ /* opcional: si el backend nuevo tiene tiempo real, se
    suscribe y llama a applyFn(valor) cada vez que cambia; si no lo tiene, se
    puede dejar sin hacer nada y la app sigue funcionando sin tiempo real */ },
  async adjustStockAtomic(item, delta){ /* opcional: ajuste de stock a prueba de
    que dos dispositivos escriban a la vez; si el backend nuevo no tiene
    transacciones, aquí se puede hacer un "leer, sumar, guardar" normal */ },
  auth: {
    signIn(email, pass){ /* inicia sesión, devuelve una promesa */ },
    signOut(){ /* cierra sesión */ },
    onChange(cb){ /* llama a cb(usuario) cuando cambia la sesión, o cb(null) si no hay */ },
    currentUserEmail(){ /* devuelve el email de quien ha iniciado sesión, o '' */ }
  }
};
```

Si el proyecto nuevo no necesita usuarios con contraseña, `backend.auth` se puede simplificar mucho — lo único que usa el resto de la app es saber el email de quien está dentro y si puede cerrar sesión.

Si se quiere conservar la detección automática de órdenes de trabajo creadas por otra app (ver sección 3), el backend nuevo necesita además:
```js
  watchOrdenesTrabajo(applyFn){ /* se suscribe a las órdenes nuevas y llama a
    applyFn(orden) por cada una; sin esto, las órdenes hay que seguir creándolas
    a mano dentro de Tecnomat, el resto de la app sigue funcionando igual */ },
  async getMaterialesDeOrden(ordenId){ /* devuelve la lista de materiales de esa
    orden, para poder rellenar la solicitud pendiente al recibirla */ }
```

Todo lo demás — catálogo, movimientos, chat, órdenes, Pedido, Hoja de pedido, diseño, avisos — llama siempre a `safeGet`/`safeSet`/`safeDelete`/`watchKey`/`getUserRole`/`currentUserEmail`, que reparten el trabajo entre `backend` y los otros dos niveles de reserva. Cambiar de base de datos no debería tocar ni una línea fuera de este bloque.
