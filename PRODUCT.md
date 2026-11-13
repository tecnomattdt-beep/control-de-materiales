# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Almacén** (uso diario, 1-3 personas): controla el stock, sirve el material de cada orden, firma recogidas, hace pedidos a proveedores. Trabaja en el ordenador del almacén con lector de códigos USB y en el móvil por la nave.
- **Taller y montadores** (uso ocasional, varios operarios): piden material para su orden o proyecto, lo recogen y firman. Usan el móvil, a menudo con guantes, en la nave o en obra al aire libre.
- También se usa en tablets compartidas de taller y almacén.

## Product Purpose

Control de materiales de Tecnomat: stock con escaneo de códigos de barras (lector o cámara), órdenes de montaje/venta y proyectos con su chat y hoja de pedido, entregas firmadas, pedidos a proveedor, mantenimiento de vehículos y ropa de trabajadores. Éxito: el stock real coincide con el de la app y nadie se queda esperando material sin saber dónde está su pedido.

## Positioning

Herramienta interna hecha a la medida del flujo real de Tecnomat (almacén ↔ taller ↔ proveedor), sin servidor propio, que funciona en cualquier móvil como app instalada. Futura app hermana de la app de OT de Tecnomat (Supabase), de la que leerá OT, esquemas y trabajadores.

## Operating Context

- Escaneo continuo: entrada/salida de stock, lector USB que escribe como un teclado, cámara del móvil.
- Luz variable: naves con poca luz, obra con sol directo en la pantalla, puesto fijo de ordenador.
- Guantes y prisas: se toca con el pulgar, de pie, a veces con una sola mano.
- Dos roles con permisos distintos en la interfaz: Almacén y Taller.
- Documentos reales: albaranes y listados en PDF/Excel/foto (OCR y lectura con IA), etiquetas de códigos de barras impresas, firmas de recogida.

## Capabilities and Constraints

- Web estática (GitHub Pages) + Firebase (login y datos); Supabase preparado e inactivo.
- Un `index.html` con el CSS en línea y las plantillas HTML generadas en `app.js`; sin framework ni paso de compilación.
- PWA instalable con service worker; tiene que seguir funcionando sin conexión para consultar.
- Modo oscuro (por defecto) y modo claro conmutables.
- Todas las funciones, textos y flujos actuales se conservan en cualquier rediseño.

## Brand Commitments

- Nombre: Tecnomat. Logo actual en `logo.jpg` (amarillo sobre negro). El usuario ha dejado libres el logo dentro de la app y los colores: no son obligatorios.
- Voz: español de España, directo, de taller ("Escanea", "Recogida confirmada y firmada").

## Evidence on Hand

- Datos reales en Firestore (≈1.800 referencias, órdenes, entregas firmadas). No hay métricas de uso ni testimonios: no inventarlos.

## Product Principles

1. El escaneo manda: lo más frecuente (escanear, servir, firmar) está a un toque y se ve de un vistazo.
2. Legible en cualquier luz y con guantes: contraste y tamaños de toque generosos antes que adorno.
3. El estado del material siempre claro: pedido, reservado, servido, devuelto, pendiente.
4. Nada se pierde: cambios de varios dispositivos y sin conexión no borran datos.
5. Lo conocido se respeta: cada función sigue donde la buscan los que la usan a diario.

## Accessibility & Inclusion

- WCAG 2.1 AA: contraste 4,5:1, objetivos táctiles ≥ 24 px (44 px en acciones principales), foco visible.
- Uso con guantes y al sol: tamaños y contraste por encima del mínimo en las pantallas de escaneo.
