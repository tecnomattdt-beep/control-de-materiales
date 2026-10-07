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
- **Supabase (Postgres + Authentication + tiempo real)**, opcional, para guardado compartido en la nube con login — ver "Migrar a otro hosting o base de datos" si en algún momento se cambia de proveedor.
- **EmailJS**, opcional, para mandar avisos por correo sin backend propio.
- **`BarcodeDetector`** (API nativa del navegador) para escanear con la cámara del móvil.

**Modelo de datos:** el estado vive en un único objeto JavaScript. El catálogo de materiales usa un `id` interno único por referencia — el código de barras (`code`) **no tiene que ser único**, así que un mismo código puede tener varias referencias asociadas, y la app pregunta cuál es al escanear si hay más de una coincidencia.

**Guardado, en cadena de prioridad:** Supabase (si está configurado, con ajustes de stock a prueba de que dos dispositivos no se pisen un cambio, y tiempo real) → almacenamiento propio de la página → `localStorage` del navegador. La app nunca deja de guardar datos, solo cambia dónde.

**Decisiones de diseño relevantes:**
- Todos los datos dinámicos se escapan antes de pintarlos en HTML, porque pueden venir de un escáner o de un humano y contener caracteres que rompan la página.
- Al subir un archivo para crear una orden, la app enseña primero un resumen línea a línea y pide confirmación antes de tocar el stock.
- El histórico de movimientos y de firmas se archiva resumido en vez de borrarse sin más al superar un límite.
- Las funciones opcionales (cámara, Supabase, EmailJS, PDF) se degradan sin romper el resto de la app si no están disponibles o configuradas.
- Todos los botones tienen un mínimo de 44px de alto, pensado para el dedo en móvil. Las acciones más frecuentes (Editar, Eliminar, Enviar, Guardar) llevan además un icono discreto de trazo fino junto al texto, sin sustituirlo.
- Al abrir la app, mientras llegan los datos de la nube se muestra un aviso breve de carga en vez de dejar la pantalla en blanco.

**Limitaciones conocidas:**
- Al ser una página estática, los avisos programados (stock bajo, bobinas por vencer) solo se comprueban cuando alguien tiene la app abierta — no hay tarea en segundo plano que se ejecute sola. El correo de pedido nuevo sí funciona siempre que se guarde una solicitud, esté quien esté conectado.
- La lectura de PDF es heurística (busca patrones de texto), no una lectura de tablas real.
- El pitido de aviso depende de que el navegador permita reproducir audio sin una interacción previa del usuario en esa pestaña — algunos navegadores (sobre todo Safari en iPhone) son más estrictos que otros. Si esto falla en algún dispositivo puntual, la notificación del sistema (si se le dio permiso) sigue llegando igual, ya que no depende de esta restricción.
- Las firmas de entrega, al ser una imagen, solo se guardan completas las 40 más recientes por orden/proyecto (para no hacer crecer demasiado esa fila); las más antiguas se archivan como resumen (quién, cuándo, cuántas líneas) sin la imagen.
- El logo de la empresa no sale como imagen en los Excel exportados — la librería gratuita usada para generarlos no lo permite, solo el texto "TECNOMAT · Control de materiales".

## 1. Publicarla en GitHub Pages

1. Entra en [github.com](https://github.com) y crea un repositorio nuevo (botón **New repository**).
2. Dentro del repositorio, pulsar **Add file → Upload files** y subir todos los archivos de esta carpeta (`index.html`, `sw.js`, `manifest.json`, `icon-192.png`, `icon-512.png`) a la raíz del repositorio, no dentro de ninguna subcarpeta.
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

- **Con Supabase y/o Firebase configurados**: guardado compartido en la nube, con tiempo real entre dispositivos. Con los dos configurados a la vez, cada dato se escribe en ambos en paralelo, y se lee del que responda primero — si uno falla o se cae, el otro sigue funcionando sin que nadie note nada (ver sección 3 para el detalle de este reparto, incluida una salvedad importante sobre el login).
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

### Notas de seguridad

- **Supabase**: el SQL de configuración ya deja las tablas cerradas a cualquiera que no haya iniciado sesión (Row Level Security activada, con una política que exige `auth.role() = 'authenticated'`). Con eso basta para que nadie sin cuenta pueda leer ni escribir nada, aunque conozca la URL y la clave pública del proyecto — la clave `anon` está pensada para ir en el código del cliente, no es un secreto por sí sola. Nótese que, como el login corre por Firebase y no por Supabase, esta condición (`auth.role() = 'authenticated'`, que mira la sesión de Supabase) puede no reflejar el login real de la app — si se quiere cerrar Supabase de verdad en este reparto, conviene ajustar esa política o restringir por otra vía (por ejemplo, IP o solo permitir desde el dominio publicado).
- **Firebase**: en Firestore Database → Reglas, exigir `request.auth != null` para leer y escribir la colección `tecnomat_materiales`.
- **Restricción real para Taller** (la de la interfaz, ver sección 5, es solo visual) — para impedir de verdad que esa cuenta escriba en el catálogo o los movimientos, hay que añadir una regla equivalente en cada backend configurado, comprobando el email de quien ha iniciado sesión en vez de solo si hay sesión.

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
- **Pedido nuevo desde Trabajo o Pedido**: al guardar una Hoja de pedido, o cuando Taller envía algo por el chat, Almacén recibe tres cosas — correo, un banner dentro de la app (pulsarlo lleva directo a esa orden), y un pitido + notificación del sistema en cualquier dispositivo con la app abierta.
- **Sin conexión**: banner en rojo si se corta el internet a media faena, avisando de que los cambios se siguen guardando en el dispositivo pero no se sincronizan hasta que vuelva. Avisa también al recuperarse.
- **Sonido al escanear**: pitido corto al confirmar un escaneo con éxito (distinto del de "pedido nuevo"), desactivable en Almacén → Avisos.

Todo lo anterior (banner, sonido, notificación del sistema) solo funciona con la app abierta en ese momento, aunque sea en segundo plano si está instalada — para que funcione con la app completamente cerrada haría falta notificaciones push de verdad, una pieza bastante más grande de montar. El correo es el único de los avisos que llega siempre, esté la app abierta o no.

## 5. Roles: Almacén y Taller

Quien entra con la cuenta **`taller@tecnomat.es`** solo ve las pestañas **Trabajo** y **Pedido** — Almacén, Resumen y Mantenimiento son exclusivas de Almacén, y tampoco ve el botón "Asociar" en el chat. **Sí puede finalizar/reactivar** una orden o proyecto (con confirmación siempre antes de hacerlo, para evitar toques accidentales), pero no puede eliminarla — eso sigue siendo solo de Almacén. Cualquier otra cuenta ve todo.

**Esto es una restricción de interfaz**, no de seguridad real — oculta botones y redirige, pero no impide técnicamente que alguien con conocimientos edite datos saltándose la pantalla. La restricción real (a nivel de base de datos) se configura con Row Level Security en Supabase, ver sección 3.

## 6. Resumen (pantalla de inicio)

Al abrir la app, siempre se aterriza aquí primero (no en la última sección usada) — un vistazo con lo más urgente antes de entrar a trabajar: stock bajo, bobinas a punto de expirar, avisos sin leer, líneas pendientes en Pedido, y revisiones de Mantenimiento atrasadas o próximas. Cada tarjeta se puede tocar para ir directo a esa sección. **Exclusiva de Almacén** — Taller no ve esta pestaña, entra directo a Trabajo. La orden o proyecto que se estuviera viendo antes se recuerda igual, así que al entrar a Trabajo desde una tarjeta se sigue justo donde se dejó.

## 7. Trabajo (Montaje/Venta y Proyecto) y su chat

Montaje/Venta y Proyecto viven bajo una sola pestaña, **Trabajo** — al crear una orden se elige el tipo en un desplegable. Por dentro cada uno se sigue guardando por separado, solo cambia cómo se llega hasta ahí desde la pantalla.

**Textos en curso**: lo escrito en los campos del chat se conserva cuando la pantalla se actualiza sola (por ejemplo, por un cambio llegado desde otro dispositivo) mientras se siga en la misma orden y pestaña. Se vacía al enviar el mensaje y no pasa a otra orden ni a otra pestaña.

**El chat es la forma principal de pedir material** en una orden o proyecto, justo debajo del selector (que vive integrado ahí mismo, con "Finalizar"/"Eliminar" escondidos detrás de "Más opciones" para no saturar la pantalla, y "+ Nueva orden/proyecto" para crear otra):
- Cada escaneo aparece como mensaje en el hilo, en orden, junto con avisos como "Hoja guardada", "Recogida confirmada y firmada" o "Asociado a...".
- Se puede **escribir directamente** (no solo escanear) para pedir algo aunque no se sepa la referencia — queda como línea "sin referencia todavía".
- **Solo Almacén** ve el botón **"Asociar"** en esas líneas, para enlazarlas con una referencia real (con el lector físico USB/Bluetooth, la cámara del móvil, o escribiéndolo a mano — un campo de texto normal acepta las tres formas) — y si esa referencia no existe todavía, se puede dar de alta ahí mismo, con 0 unidades.
- El chat tiene un alto fijo con su propio scroll, y se desplaza solo hasta el último mensaje.
- La tabla de siempre (**Hoja de pedido**, y **Servido**/**Devuelto** para Almacén) sigue existiendo en su propia pestaña, para imprimir o repasar de un vistazo — el chat no la sustituye, conviven las dos.
- El panel lateral también empieza compacto — solo "Resumen" a la vista, el resto (exportar, crear desde archivo, buscar en stock, histórico, entregas firmadas) detrás de "Más opciones".
- Con más de 6 órdenes/proyectos, encima del selector aparece un campo para buscar por nombre y filtrar la lista.
- **Lista rápida**: justo encima de la caja de escribir del chat, si hay materiales frecuentes configurados, aparece una lista pequeña con casilla y cantidad para cada uno — misma lista para todas las órdenes y proyectos. Al marcar los que hagan falta y pulsar "Añadir seleccionados", se añaden de golpe a la solicitud pendiente (con su referencia real si el código coincide con algo del stock, o como línea "sin referencia todavía" si no), y queda anotado en el chat. Esta lista se mantiene aparte, directamente en Supabase (tabla `materiales_rapidos`), y se actualiza sola en cualquier dispositivo en cuanto cambia.

**¿Quién pide el material?** No es un campo fijo en pantalla — al crear una orden, una ventana lo pregunta y obliga a rellenarlo. Cada tanda de material (cada vez que se firma una entrega, la orden queda lista para una tanda nueva) puede ser pedida por alguien distinto: si hace falta, se vuelve a preguntar con una ventana en el momento de escanear o escribir, sin bloquear ni esconder el chat mientras tanto.

**Flujo de entrega, con firma:**
1. Se escanea o se pide por chat el material necesario — no descuenta stock todavía, queda en la "Solicitud pendiente de recoger".
2. Al pulsar **"Preparar recogida y firmar"**, la app comprueba que hay stock real de cada línea.
3. La persona que recoge firma con el dedo o el ratón.
4. Al **"Confirmar entrega"** es cuando se descuenta el stock de verdad, y las líneas pasan a "Servido" — hasta ese momento no se ha tocado nada, por si se cancela a mitad de camino.
5. Queda un registro (quién pidió, quién recogió y firmó, qué materiales) en "Entregas firmadas", exportable a Excel.

Cada línea de la Hoja de pedido tiene además dos campos editables: **"Escandallo/Pedido"** (si ese material se pasó a un escandallo de costes o a un pedido a proveedor) y su **número identificativo** — editables tanto en líneas pendientes como en las **ya servidas**, ya que normalmente se sabe después de entregar el material, no antes. Al elegir el tipo en una línea, si ya hay otra línea de la misma hoja con ese mismo tipo y número puesto, se copia solo. Con la casilla por línea se pueden marcar varias a la vez (pendientes o servidas, mezcladas si hace falta), pidiendo un único número para todas las seleccionadas. **"Plano"** es un dato de toda la orden, no por línea — se edita en la cabecera de la Hoja de pedido, junto a la OT.

Una orden o proyecto **no se cierra sola** al entregar material — sigue activa y se puede seguir añadiendo hasta que alguien de Almacén pulse "Finalizar" a propósito.

**Clasificación del material (solo Almacén)**: cada línea de material se separa automáticamente en **Interno**, **Externo** o **Pequeño material**, sin elegir el tipo a mano. Es independiente del tipo Interno/Externo de la orden completa; esta clasificación es por línea.
- **Reglas de separación** (por orden de prioridad): 1) si la línea figura en la lista común de pequeño material (por referencia o por un texto muy parecido), es Pequeño material; 2) si el sistema ya aprendió su tipo por la referencia o por las palabras de otras líneas validadas, se usa ese tipo; 3) si tiene referencia del stock, es Interno; 4) si es un texto sin referencia y no se parece a nada de la app, es Externo. Cuando no hay nada aprendido, la IA puede indicar el tipo. Al pulsar **«Asignar referencia»** no se pregunta el tipo: la línea pasa sola al listado que le corresponde por la referencia elegida (y, si era pequeño material, la entrada de la lista pasa a esa referencia).
- En la pestaña **Hoja de pedido**, un **conmutador «Listado interno / Listado externo»** (arriba, con el número de líneas de cada uno) separa las dos listas: la tabla y los paneles solo muestran las líneas del listado elegido, sin mezclarlas. El panel de **Clasificación** indica, para cada línea, lo detectado («Detectado: Externo · sin validar»). **Validar** lo da por bueno y **«Mover a externo / interno»** lo corrige con un solo clic y lo pasa al otro listado; «Validar las N detectadas» valida todas de una vez. Lo único que se mueve a mano es Interno ↔ Externo; el pequeño material se gestiona en su lista común. Al cambiar de orden el conmutador vuelve a «Listado interno».
- **Aprendizaje**: cada clasificación validada o corregida se recuerda por referencia y por las palabras con que Taller describe el material (sin distinguir mayúsculas ni tildes, ignorando cantidades y medidas). Con el uso, la detección acierta más. Lo detectado nunca es definitivo: solo lo validado enseña al sistema y solo lo validado entra en la petición externa, en la copia y en la descarga.
- **Listado interno**: líneas validadas como Interno y como Pequeño material (estas últimas con la etiqueta «Pequeño material»; botón «Copiar listado interno»). **Listado externo**: líneas detectadas o confirmadas como externas y petición de material externo (ver abajo). Cada listado se descarga por separado con el botón visible **«Descargar listado interno/externo de esta orden (Excel)»**, que genera un archivo `listado_<interno|externo>_<orden>_<fecha>.xlsx` con las líneas validadas de esa orden únicamente (el externo incluye la fecha de la petición).
- **Listado externo**: en la vista «Listado externo», con las líneas validadas como Externo que aún no se han pedido, se genera un texto listo para copiar («En la orden «…», a fecha dd/mm/aaaa, hacen falta las siguientes unidades de material externo: descripción y cantidad»). **«Copiar texto»** lo lleva al portapapeles y **«Abrir correo»** abre el correo del dispositivo ya redactado, con el asunto y el correo de destino (se escribe una vez y se recuerda).
- **Peticiones guardadas**: al copiar o abrir el correo, la petición queda guardada con su fecha y orden, y esas líneas dejan de aparecer en el listado, de modo que la siguiente petición solo incluye líneas nuevas y nunca se mezclan fechas ni órdenes. En «Peticiones anteriores de esta orden», **«Copiar»** vuelve a copiar exactamente una petición concreta y **«Anular»** la elimina y devuelve sus líneas a pendientes (por ejemplo, tras copiar por error). Se conservan las últimas 200 peticiones.
- **Referencias sugeridas**: el sistema también recuerda a qué referencia se asoció cada texto que Taller escribió a mano (sin distinguir mayúsculas, tildes ni singular/plural: «tornillo» y «tornillos» cuentan igual; tolera cambios de orden o palabras sueltas). En la Hoja de pedido, las líneas «sin referencia» parecidas a otras ya asociadas aparecen en el panel **«Referencias sugeridas»** con la referencia propuesta: **Confirmar** la asigna (queda anotado en el chat), **No es** descarta esa propuesta para la línea, y «Confirmar las N referencias sugeridas» lo hace de una vez. Solo lo confirmado enseña al sistema. Si la referencia ya no existe en el stock, no se propone.
- **Detección automática con validación de Almacén**: el sistema detecta por sí solo, a partir de los textos, a qué listado pertenece cada línea (Interno, Externo o Pequeño material) y con qué referencia del stock se corresponde. Lo detectado se aplica de inmediato, pero queda **sin validar** hasta que Almacén lo da por bueno: las líneas detectadas como externas pasan solas al listado externo, marcadas con «?», y solo entran en la petición, la copia o la descarga cuando se validan. Las referencias asignadas automáticamente aparecen en el panel **«Referencias asignadas automáticamente»**, con **Validar** (enseña al sistema y queda anotado en el chat) y **Deshacer** (devuelve el texto original y no vuelve a proponer esa referencia). La asignación automática se hace cuando el texto es casi idéntico a uno ya asociado, cuando contiene un código o referencia del stock, o cuando la IA lo indica; las coincidencias más débiles siguen apareciendo como «Referencias sugeridas». Una línea externa sin referencia en el stock conserva su texto. Corregir o validar un tipo o una referencia mejora la detección posterior, por lo que cada vez se consulta menos a la IA.
- **Ayuda de IA**: refuerza la detección en las líneas que el algoritmo local no resuelve. Se lanza sola cuando hay 3 o más líneas sin detectar (casilla «IA automática», desactivable) o con el botón **«Pedir sugerencias a la IA (N)»**. Consumo de tokens limitado: solo se envían las líneas sin detectar y no consultadas antes (máximo 20, en **una única petición**), con como máximo 6 candidatos del stock por línea preseleccionados localmente (nunca el catálogo completo), sin imágenes y con respuesta en JSON compacto; cada resultado, también el de «sin coincidencia», se guarda en una caché por texto; y existe un tope de 8 consultas al día, visible en el panel. Usa el mismo servicio de Gemini que el reconocimiento de documentos y envía a ese servicio el texto de las líneas pendientes y las descripciones de los candidatos. Si el servicio falla, se muestra un aviso y no se guarda nada.
- **Pestaña «Pequeño material»** (Taller y Almacén): entre «Chat» y «Hoja de pedido» de cada orden. Muestra la **lista común de pequeño material**, en cuadrícula compacta. Se marcan los materiales, se ajusta la cantidad y **«Añadir al pedido»** los incorpora a la orden abierta, ya con la etiqueta y sin escribir (con más de 8 hay un filtro). Solo afecta a la orden abierta; el chat de Pedido no se toca.
- **La lista es independiente de las órdenes**: una entrada se crea al marcar una línea como Pequeño material (con o sin referencia) o desde «Gestionar la lista», y permanece aunque se quite la línea de cualquier pedido. Solo Almacén la modifica, de forma manual: **«Eliminar»** (con confirmación) y un campo para añadir por código o nombre. Si una entrada sin referencia se asocia después a una referencia del stock, pasa a ser la entrada de esa referencia. Las referencias que ya se habían clasificado como pequeño material pasan a la lista automáticamente.
- **Sin duplicados**: los materiales que ya están en el pedido de la orden (o ya servidos) aparecen bloqueados («En el pedido» / «Ya servido») y no se pueden volver a marcar; para repetirlos se añaden a mano desde la Lista rápida o escribiéndolos. La selección pertenece a la orden abierta y se descarta al salir de la pestaña o cambiar de orden. Taller recibe la lista actualizada de forma periódica (cada ~30 s).
- Lo aprendido se guarda en la clave `clasificacion` del mismo almacenamiento que el resto de datos.

**Órdenes creadas por otra app**: si otra app conectada al mismo proyecto de Supabase inserta una fila en `ordenes_trabajo` (con sus materiales en `orden_materiales`), Tecnomat la detecta en tiempo real y hace todo esto sola, sin intervención:
- Crea la orden o proyecto con el nombre, tipo e Interno/Externo que traiga.
- Busca cada material en el stock — si lo encuentra, lo añade a la solicitud pendiente con su referencia real; si no, lo deja como línea "sin referencia todavía" (con el botón "Asociar" para Almacén, igual que el resto).
- Dice quién lo pidió, y lo deja anotado en el chat de esa orden.
- Avisa a Almacén igual que con cualquier pedido nuevo (correo, banner, sonido).

Si Tecnomat todavía no está configurado con Supabase (ver sección 3), esta parte simplemente no ocurre y las órdenes se siguen creando a mano como siempre.

## 8. Pedido

Sirve para pedir material que falta en el almacén (por ejemplo, para reponer stock desde un proveedor) — no lleva firma, es un listado que se manda por correo. Tiene el mismo chat que Trabajo (con su pestaña "Chat" y "Lista"), pero aquí **se pregunta quién hace el pedido en cada escaneo o mensaje**, no solo una vez — pensado para un dispositivo que se comparte entre varias personas. Cada línea del chat muestra quién pidió esa unidad en concreto.

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
- **Editar**: un único botón agrupa artículo, referencia, ubicación, categoría, coste y características en un solo formulario. Dentro de ese mismo formulario están también **Etiqueta**, **+ Otra referencia** y **Eliminar** — así cada fila de la lista solo muestra dos botones ("Editar" y "Cambiar cantidad"), en vez de cinco, que en una lista de decenas de artículos se nota mucho.
- **Filtros**: por categoría, solo stock bajo (0) o solo sin ubicar, combinables con la búsqueda de texto.
- **Ubicaciones**: panel para mantener una lista (añadir/quitar) que autocompleta al escribir la ubicación de un material — sigue siendo texto libre, esto solo evita erratas.
- **Valorización**: columna "Coste" reconocida al importar un Excel, o rellenable a mano por artículo. El resumen de Almacén muestra el valor total del inventario.
- **Trazabilidad**: cada movimiento, eliminación y entrega firmada guarda el email de quien lo hizo (si hay login).
- **Entrada/Salida al escanear**: interruptor junto al escáner para elegir si el escaneo suma o resta stock. El escáner va siempre justo debajo del buscador en Almacén, antes de la lista de stock — con inventarios largos, no queda empujado fuera de la vista.
- **Rendimiento con inventarios grandes**: la lista solo pinta 80 artículos a la vez, con "Cargar más" para ver el resto.
- **Colores pensados para daltonismo**: ningún dato depende solo del color (siempre hay texto o número también). Pedido usa magenta y Stock bajo/OK usan rosa/verde azulado en vez de rojo/verde puros, para distinguirse bien bajo daltonismo rojo-verde.
- **Tour inicial y botón "Ayuda"**: repaso corto de la app que aparece solo la primera vez, y se puede volver a abrir cuando se quiera.

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

Cuando se suben cambios nuevos, aparece un banner — *"Hay una versión nueva disponible"* — con un botón para actualizar. Hasta que no se pulse, sigue con la versión que ya tenía cargada.

### Adaptación a tablet y móvil

La disposición de escritorio no cambia. En pantallas de hasta 1000 px la **Hoja de pedido** pasa de tabla a tarjetas por línea (artículo, referencia, cantidad, reserva, escandallo/pedido y recibido), sin desplazamiento horizontal. En móvil (hasta 760 px) la cabecera se compacta (logotipo, título y botones en una sola franja; se ocultan el subtítulo y el aviso de guardado), el selector de orden y «+ Nueva» comparten fila, el chat coloca el texto en una línea propia y debajo cantidad, «Reserva» y «Enviar», los campos usan 16 px (evita el zoom automático), la pestaña activa del trabajo se centra en la barra de pestañas y los paneles secundarios «Ayuda de IA» y «Listado interno» aparecen plegados (se despliegan al pulsar el título).

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
