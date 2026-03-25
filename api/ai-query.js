// api/ai-query.js — v4: términos de imagen separados del contenido

async function callAnthropic(prompt) {
  return fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: `Eres el historiador militar más experto del mundo. Escribes en español con estilo académico apasionante y exhaustivo.

ESTRUCTURA OBLIGATORIA — sigue este orden exacto:

PRIMERO — en la primera línea SIEMPRE escribe los términos de búsqueda de imágenes en Wikipedia en inglés, con este formato exacto (3 términos separados por |):
IMAGES:término1|término2|término3

Ejemplos de términos válidos de Wikipedia: Battle of Stalingrad, Erwin Rommel, Tiger I tank, D-Day Normandy, Napoleon Bonaparte, Battle of Waterloo, Spitfire aircraft, Roman Legion, Battle of Marathon, Genghis Khan

SEGUNDO - <h3>Contexto Histórico</h3>
4 párrafos mínimo con fechas exactas, cifras, nombres, contexto político y geográfico detallado.

TERCERO - <h3>Desarrollo de los Hechos</h3>
4 párrafos describiendo la secuencia fase a fase, movimientos de tropas, decisiones tácticas, momentos de inflexión.

CUARTO - <h3>Análisis Militar</h3>
3 párrafos sobre tácticas empleadas, errores estratégicos, innovaciones, comparaciones.

QUINTO - <h3>Los Protagonistas</h3>
2-3 párrafos sobre comandantes clave, su psicología, decisiones y consecuencias personales.

SEXTO - <h3>Consecuencias e Impacto</h3>
3 párrafos sobre impacto inmediato, medio plazo y legado histórico hasta hoy.

SÉPTIMO - <h4>Datos Clave</h4>
Lista ul con exactamente 10 datos numéricos precisos.

OCTAVO — BIBLIOGRAFÍA (NUNCA omitirla, SIEMPRE al final):
<div class="books-section">
<div class="books-title">📚 Bibliografía Recomendada</div>
<div class="books-grid">
<a class="book-item" href="https://www.amazon.es/s?k=PALABRAS+CLAVE&tag=bellummundi-21" target="_blank">
<div class="book-cover">📖</div>
<div><div class="book-title">TITULO REAL</div><div class="book-author">AUTOR REAL</div><div class="book-affiliate-tag">Ver en Amazon →</div></div>
</a>
<a class="book-item" href="https://www.amazon.es/s?k=PALABRAS+CLAVE&tag=bellummundi-21" target="_blank">
<div class="book-cover">📖</div>
<div><div class="book-title">TITULO REAL</div><div class="book-author">AUTOR REAL</div><div class="book-affiliate-tag">Ver en Amazon →</div></div>
</a>
<a class="book-item" href="https://www.amazon.es/s?k=PALABRAS+CLAVE&tag=bellummundi-21" target="_blank">
<div class="book-cover">📖</div>
<div><div class="book-title">TITULO REAL</div><div class="book-author">AUTOR REAL</div><div class="book-affiliate-tag">Ver en Amazon →</div></div>
</a>
</div>
</div>

REGLAS: mínimo 1500 palabras de contenido real, libros que existan en Amazon, tag bellummundi-21 en los 3 enlaces.`,
      messages: [{ role: 'user', content: prompt }]
    })
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt requerido' });

  const MAX_RETRIES = 3;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await callAnthropic(prompt);

      if (!response.ok) {
        const err = await response.json();
        if (err?.error?.type === 'overloaded_error' && attempt < MAX_RETRIES) {
          await new Promise(r => setTimeout(r, 2000 * attempt));
          continue;
        }
        return res.status(500).json({ error: 'Error en la API de IA' });
      }

      const data = await response.json();
      let fullText = data.content[0].text;

      // Extraer términos de imágenes de la primera línea
      let imageTerms = [];
      let content = fullText;
      const firstLine = fullText.split('\n')[0];
      if (firstLine.startsWith('IMAGES:')) {
        imageTerms = firstLine.replace('IMAGES:', '').split('|').map(t => t.trim()).filter(Boolean);
        content = fullText.split('\n').slice(1).join('\n').trim();
      }

      // Garantizar bibliografía si se cortó
      if (!content.includes('bellummundi-21')) {
        content += `
<div class="books-section">
<div class="books-title">📚 Bibliografía Recomendada</div>
<div class="books-grid">
<a class="book-item" href="https://www.amazon.es/s?k=historia+militar+antony+beevor&tag=bellummundi-21" target="_blank">
<div class="book-cover">📖</div>
<div><div class="book-title">La Segunda Guerra Mundial</div><div class="book-author">Antony Beevor</div><div class="book-affiliate-tag">Ver en Amazon →</div></div>
</a>
<a class="book-item" href="https://www.amazon.es/s?k=historia+guerra+john+keegan&tag=bellummundi-21" target="_blank">
<div class="book-cover">📖</div>
<div><div class="book-title">Historia de la Guerra</div><div class="book-author">John Keegan</div><div class="book-affiliate-tag">Ver en Amazon →</div></div>
</a>
<a class="book-item" href="https://www.amazon.es/s?k=batallas+decisivas+historia+militar&tag=bellummundi-21" target="_blank">
<div class="book-cover">📖</div>
<div><div class="book-title">Las Grandes Batallas de la Historia</div><div class="book-author">Victor Davis Hanson</div><div class="book-affiliate-tag">Ver en Amazon →</div></div>
</a>
</div>
</div>`;
      }

      return res.status(200).json({ content, imageTerms });

    } catch (err) {
      if (attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, 2000 * attempt));
        continue;
      }
      return res.status(500).json({ error: 'Servicio no disponible. Inténtalo en unos segundos.' });
    }
  }
};


