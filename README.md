# Películas en Castellano — Addon de Stremio

Addon de Stremio que expone un catálogo de películas con **audio en español (castellano)** en formato JSON.

## Estructura

```
stremio-addon-peliculas-castellano/
├── manifest.json    # Manifiesto del addon (lo lee Stremio)
├── movies.json      # Catálogo de películas (metadatos)
├── server.js        # Servidor HTTP (endpoints /manifest, /catalog, /stream)
├── package.json
└── README.md
```

## Endpoints que implementa

| Endpoint | Descripción |
|----------|-------------|
| `GET /manifest.json` | Devuelve el manifiesto del addon |
| `GET /catalog/movie/peliculas-castellano.json` | Lista de películas del catálogo |
| `GET /stream/movie/:id.json` | Fuentes de streaming de una película |

## Cómo ejecutarlo localmente

1. Instala [Node.js](https://nodejs.org/) (v14 o superior).
2. Abre una terminal en esta carpeta:

   ```bash
   cd stremio-addon-peliculas-castellano
   npm install   # no hay dependencias externas, solo crea el lockfile
   npm start
   ```

3. El servidor escuchará en `http://localhost:7000`.
4. En Stremio, ve a **Addons → Mis addons → Añadir addon** y pega:

   ```
   http://localhost:7000/manifest.json
   ```

   (O despliega el servidor en cualquier hosting público y usa esa URL.)

## ⚠️ Sobre los enlaces de streaming

Este addon es un **esqueleto funcional con metadatos reales** (títulos, año, director, género, sinopsis, póster). Los campos `streams` devuelven URLs de **ejemplo (placeholder)** con un aviso legal.

**No incluyes enlaces a películas con derechos de autor.** Debes añadir tú mismo las fuentes de streaming legales (tuyas, de dominio público o con licencia) en `server.js`, dentro de la función `getStreamsForMovie(id)`. Stremio reproduce los `url` que devuelvas ahí.

## Cómo añadir más películas

Edita `movies.json` y añade objetos al array `movies`. Cada película necesita al menos:
- `id`: identificador único (ej. IMDb `ttxxxxxxx` o un slug propio)
- `title`, `year`, `director`, `genre`, `description`
- `poster`, `background` (URLs de imagen)
- `audioLanguage`: `"español (castellano)"`
- `subtitleLanguages`: `[ "español" ]`
- `streamPlaceholder`: descripción del enlace legal que pondrás luego

Luego reinicia el servidor.

## Instalar en Stremio (resumen)

1. Ejecuta `npm start`.
2. Stremio → Addons → Mis addons → "Añadir addon".
3. Pega `http://localhost:7000/manifest.json` (o tu URL desplegada).
4. Aparecerá el catálogo "Películas en Castellano" en Mis catálogos.
