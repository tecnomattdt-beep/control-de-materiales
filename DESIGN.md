# Design

Mundo visual: **Señalética de nave**. Cada sección de la app es un pasillo señalizado de la nave: el operario sabe dónde está antes de leer nada. Conserva la esencia de la versión anterior (grafito oscuro, amarillo Tecnomat, letra condensada en mayúsculas) como sistema propio. El contrato de dirección está en `.impeccable/surfaces/index-html.md`.

## Tokens (`index.html`, bloque «Señalética de nave» al final del `<style>`)

| Token | Oscuro (por defecto) | Claro (al sol) | Uso |
|---|---|---|---|
| `--bg-base` | `#121417` | `#E4E6E3` | Suelo de la página |
| `--bg-panel` | `#1B1F23` | `#FFFFFF` | Placas: paneles y tickets |
| `--bg-raised` / `--bg-raised-2` | `#242A30` / `#2E353C` | `#F1F2EF` / `#E3E5E1` | Campos, cabeceras de ticket |
| `--border` | `#3A424A` | `#B9BEC2` | Bordes y filetes |
| `--text-primary` / `--text-muted` / `--text-faint` | `#F2F4F5` / `#A9B1B9` / `#959EA7` | `#121417` / `#3F464D` / `#575E65` | Texto (todos ≥ 4,5:1) |
| `--zona` | color de la sección | igual | Relleno de cartel, pestaña activa, acción principal, chat propio. Siempre con `--tinta` encima |
| `--accent` | = `--zona` | versión oscura de la zona | Texto con el color de la sección |
| `--tinta` | `#121417` | `#121417` | Texto sobre zona o cinta |
| `--cinta` | `#FFC20E` | `#FFC20E` | Cinta de seguridad, solo en avisos |
| `--success` / `--danger` / `--warning` | `#2FBF71` / `#FF6B5E` / `#FFB020` | `#1A6B3C` / `#B3261E` / `#8A5300` | Estados |
| `--radio` | `3px` | | Esquinas de placas y controles |

Colores de zona: Resumen `#C9D1D8`, Montaje `#FF8A1F`, Proyecto `#3DA5FF`, Almacén `#FFC20E`, Pedido `#B98CFF`, Mantenimiento `#3CCB7F`, Trabajadores `#2EC4B6`. La clase `mode-<sección>` de `#app` los aplica.

## Tipografía

- `--letra-cartel`: **Saira Condensed** 600/700/800, en mayúsculas, para carteles, pestañas, botones y títulos de panel.
- `--letra`: **Saira** 400–700 para el texto y los datos. Cifras tabulares en toda la app.

## Componentes

- **Cartel de pasillo** (`#app > h1`): bloque de tinta con el icono de la sección y el nombre sobre `--zona`, con la esquina superior derecha cortada como una chapa. Lo rellena `app.js` al pintar el menú.
- **Menú**: carril lateral oscuro en ordenador y carril de suelo abajo en móvil. La pestaña activa se rellena de `--zona`.
- **Placas** (`.panel`, `.ticket`): fondo de panel, borde de 1 px y sombra suave. El ticket lleva una franja superior de 4 px del color de la zona; nunca una franja lateral gruesa.
- **Botones**: letra de cartel en mayúsculas. El principal se rellena de `--zona` y lleva la esquina cortada; el resto, borde de 1,5 px.
- **Campo de escaneo** (`#scanInput`): el más grande de la app, con borde de 2 px de la zona y anillo de foco.
- **Estados**: placas sólidas (entrada y devuelto en verde, salida en rojo) con texto de tinta.
- **Avisos** (`.alert-banner`, `#offlineBanner`): única pieza con la cinta amarilla y negra (7 px arriba).
- **Casillas**: 24 px. **Foco**: contorno de 2 px de la zona.

## Reglas

1. El color de la zona orienta; no decora. Los estados usan sus propios colores.
2. La cinta de seguridad es solo para avisos.
3. Nada de franjas laterales gruesas ni esquinas redondeadas con franja: las franjas van arriba.
4. Cambiar de aspecto toca este bloque de tokens, no las plantillas de `app.js`.
