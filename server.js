const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const app = express();
const PORT = 6880; // Puerto estándar de Stremio

// Cargar datos desde movies.json
let catalogData = JSON.parse(fs.readFileSync('movies.json', 'utf8'));

// URL base de HiSum para scraping
const HISUM_BASE_URL = "https://www.hisum.tv";

// --- RECURSO CATALOG (Muestra las series disponibles) ---
app.get('/catalog/hi-sum-series/:id.json', async (req, res) => {
    const id = req.params.id;
    
    if (id === 'hi-sum-series') {
        // Devuelve todas las series del JSON
        return res.json({
            metas: catalogData.series || []
        });
    }
    
    // Si pide una serie específica (ej: miraculous-ladybug)
    const series = catalogData.series.find(s => s.id === id);
    if (series) {
        return res.json({
            metas: [series]
        });
    }
    
    res.status(404).json({ error: 'Serie no encontrada' });
});

// --- RECURSO STREAM (Obtiene el enlace real de HiSum) ---
app.get('/stream/series/:id/:season/:episode.json', async (req, res) => {
    const { id, season, episode } = req.params;
    
    try {
        // Construir la URL de la temporada en HiSum
        // Nota: Ajusta esta ruta según cómo esté organizada la web de HiSum
        // Usualmente es: /serie/[nombre]/temporada-[num]
        let seriesUrl = `${HISUM_BASE_URL}/serie/${id}/temporada-${season}`;
        
        // Para Ladybug, a veces la URL es /temporada-1 o similar.
        // Si falla, intenta hardcodear la URL base de la serie si es muy estable.
        
        const { data } = await axios.get(seriesUrl);
        const $ = cheerio.load(data);
        
        // Buscar el iframe o el enlace del video específico
        // HiSum suele usar iframes. Buscamos el link dentro del iframe
        const iframeSrc = $('iframe').attr('src');
        
        if (!iframeSrc) {
            throw new Error("No se encontró iframe en la página de la temporada");
        }

        // Entrar al iframe para buscar el reproductor final (m3u8 o embed directo)
        const { data: iframeData } = await axios.get(iframeSrc);
        const $$ = cheerio.load(iframeData);
        
        // Intentar encontrar el enlace del video (busca atributos comunes de video)
        // Esto puede variar si HiSum cambia su diseño. 
        // Aquí buscamos enlaces que contengan 'embed' o '.m3u8'
        const streamLink = $$('a').filter(function() {
            return $(this).attr('href') && $(this).attr('href').includes('video');
        }).first().attr('href') || iframeSrc;

        // Devolver el stream a Stremio
        res.json({
            streams: [{
                name: `T${season} E${episode} - ${id}`,
                url: streamLink,
                behaviorHints: {
                    notWebReady: true // Indica que es streaming directo
                }
            }]
        });

    } catch (error) {
        console.error(error);
        res.json({
            streams: [{
                name: "Error al cargar el video",
                url: ""
            }]
        });
    }
});

app.listen(PORT, () => {
    console.log(`Addon corriendo en http://localhost:${PORT}`);
});
