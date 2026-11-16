# Design

Mundo visual: **Etiqueta de estantería**. La nave en acero azul oscuro; cada material, una etiqueta blanca de estantería con su ubicación en grande, para leer de un vistazo dónde está y cuánto hay, con poca luz o al sol. Elegido el 2026-11-16 tras investigar apps de almacén (ubicación, material y cantidad en grande; respuesta inmediata al escanear; objetivos grandes para guantes). El contrato de dirección está en `.impeccable/surfaces/index-html.md`.

## Tokens (`index.html`, bloque «Etiqueta de estantería» del `<style>`)

| Token | Oscuro (por defecto) | Claro (al sol) | Uso |
|---|---|---|---|
| `--bg-base` | `#121A20` | `#D5DBE0` | Suelo de la página (acero) |
| `--bg-panel` | `#1A252E` | `#EEF1F3` | Placas: paneles y tickets |
| `--bg-raised` / `--bg-raised-2` | `#22303B` / `#2B3B47` | `#E2E7EB` / `#D3DAE0` | Campos, cabeceras de ticket |
| `--border` | `#344654` | `#9AA7B2` | Bordes |
| `--text-primary` / `--text-muted` / `--text-faint` | `#F2F4F5` / `#AEB9C2` / `#97A3AD` | `#111417` / `#3F4850` / `#545E68` | Texto (todos ≥ 4,5:1) |
| `--etiqueta` | `#F6F5F0` | `#FFFFFF` | Papel de las filas de material y del campo de escaneo |
| `--tinta` / `--tinta-2` | `#111417` / `#3F4850` | igual | Texto sobre etiqueta; bloque de ubicación |
| `--viga` | `#F2701B` | igual | Acción principal (botón relleno) y cursor |
| `--zona` | color de nivel de la sección | igual | Pestaña activa, cartel, pestaña de la ubicación, foco. Siempre con `--tinta` encima |
| `--accent` | versión legible de la zona | versión oscura | Texto con el color de la sección |
| `--sobre-estado` | `#111417` | `#FFFFFF` | Texto sobre botones de estado (Entrada/Salida) |
| `--success` / `--danger` / `--warning` | `#2FBF71` / `#FF6B5E` / `#FFB020` | `#1A6B3C` / `#B3261E` / `#8A5300` | Estados |
| `--radio` | `2px` | | Esquinas |

Colores de nivel: Resumen `#AEB9C2`, Montaje `#F2701B`, Proyecto `#4C8DF6`, Almacén `#F2C230`, Reponer `#B48CFF`, Mantenimiento `#3CCB7F`, Trabajadores `#2EC4B6`. Los aplica la clase `mode-<sección>` de `#app`.

## Tipografía

- `--letra-cartel`: **Barlow Condensed** 600–800, en mayúsculas, para carteles, pestañas, botones, ubicaciones y cantidades.
- `--letra`: **Barlow** 400–700 para el texto. Cifras tabulares en toda la app.

## Componentes

- **Etiqueta de material** (`.stock-row`, `.ticket-row`): papel `--etiqueta` con tinta negra. Las variables de texto se redefinen dentro, así los estilos en línea de `app.js` se leen bien. Empieza por el **bloque de ubicación** (`.etq-ub`, de `etiquetaUbicacion()` en `app.js`): fondo de tinta, código en Barlow Condensed 800 a 22–26 px y pestaña de 6 px del color de nivel. Sin ubicación: «Sin ubicar» en pequeño.
- **Cantidad** (`.stock-qty`): cifra grande con una barra de 4 px que mide el stock frente al doble de su mínimo (`--nivel`, de `nivelStock()`); en rojo si está en el mínimo o por debajo.
- **Cartel de sección** (`#app > h1`): etiqueta blanca con el bloque de color de nivel y su icono.
- **Barra de secciones**: negra; la activa se rellena con su color de nivel.
- **Escáner** (`#scanInput`): etiqueta blanca grande con borde de tinta; foco en naranja de viga. Al leer un código el panel se ilumina en verde (bien) o rojo (error) y el móvil vibra (`destelloEscaner()`).
- **Botones**: letra de cartel en mayúsculas; el principal en naranja de viga; Entrada/Salida de almacén en verde/rojo con `--sobre-estado`.
- **Avisos**: placa con franja superior de 5 px (amarilla, o roja sin conexión). Sin rayas.

## Reglas

1. Los datos van en etiquetas blancas; el acero es solo el fondo.
2. El color de nivel orienta; los estados usan sus propios colores y siempre llevan texto.
3. Ubicación y cantidad mandan: nunca más pequeñas que el nombre del material.
4. Cambiar de aspecto toca este bloque de tokens, no las plantillas de `app.js`.
