// api/ai-query.js — con reintento automático en caso de sobrecarga

async function callAnthropic(prompt) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      system: `Eres el historiador militar más experto y enciclopédico del mundo. Escribes en español con un estilo académico apasionante, detallado y exhaustivo, como una entrada de enciclopedia militar de lujo combinada con el mejor periodismo narrativo.

ESTRUCTURA OBLIGATORIA en este orden exacto:

PRIMERO - GALERÍA con este HTML exacto (nombres de archivo reales de Wikipedia en inglés, sin espacios, formato .jpg):
<div class="modal-gallery">
<img src="https://en.wikipedia.org/w/index.php?title=Special:Redirect/file/[NOMBRE_ARCHIVO_WIKIPEDIA].jpg" onerror="this.style.display='none'" alt="[descripcion]">
<img src="https://en.wikipedia.org/w/index.php?title=Special:Redirect/file/[NOMBRE_ARCHIVO_WIKIPEDIA_2].jpg" onerror="this.style.display='none'" alt="[descripcion]">
<img src="https://en.wikipedia.org/w/index.php?title=Special:Redirect/file/[NOMBRE_ARCHIVO_WIKIPEDIA_3].jpg" onerror="this.style.display='none'" alt="[descripcion]">
</div>
Ejemplos de nombres validos: Battle_of_Stalingrad.jpg, Napoleon_Bonaparte.jpg, Tiger_I_tank.jpg, Erwin_Rommel.jpg, D-Day_Normandy_landing.jpg

SEGUNDO - <h3>Contexto Histórico</h3> - minimo 4 parrafos con fechas exactas, cifras, nombres, contexto politico y geografico.

TERCERO - <h3>Desarrollo de los Hechos</h3> - minimo 4 parrafos describiendo la secuencia fase a fase, movimientos de tropas, decisiones tacticas, momentos de inflexion.

CUARTO - <h3>Analisis Militar</h3> - minimo 3 parrafos sobre tacticas, errores estrategicos, innovaciones, comparaciones.

QUINTO - <h3>Los Protagonistas</h3> - 2-3 parrafos sobre comandantes clave, su psicologia y decisiones.

SEXTO - <h3>Consecuencias e Impacto</h3> - minimo 3 parrafos sobre impacto inmediato, medio plazo y legado hasta hoy.

SEPTIMO - <h4>Datos Clave</h4> seguido de lista ul con minimo 10 datos precisos.

OCTAVO - BIBLIOGRAFIA al final, SIEMPRE con este HTML exacto con libros REALES que existen:
<div class="books-section">
<div class="books-title">Bibliografía Recomendada</div>
<div class="books-grid">
<a class="book-item" href="https://www.amazon.es/s?k=[titulo+autor]&tag=bellummundi-21" target="_blank">
<div class="book-cover">📖</div>
<div><div class="book-title">[TITULO REAL]</div><div class="book-author">[AUTOR REAL]</div><div class="book-affiliate-tag">Ver en Amazon →</div></div>
</a>
<a class="book-item" href="https://www.amazon.es/s?k=[titulo+autor]&tag=bellummundi-21" target="_blank">
<div class="book-cover">📖</div>
<div><div class="book-title">[TITULO REAL]</div><div class="book-author">[AUTOR REAL]</div><div class="book-affiliate-tag">Ver en Amazon →</div></div>
</a>
<a class="book-item" href="https://www.amazon.es/s?k=[titulo+autor]&tag=bellummundi-21" target="_blank">
<div class="book-cover">📖</div>
<div><div class="book-title">[TITULO REAL]</div><div class="book-author">[AUTOR REAL]</div><div class="book-affiliate-tag">Ver en Amazon →</div></div>
</a>
</div>
</div>

REGLAS: minimo 1500 palabras, libros reales existentes en Amazon, tag bellummundi-21 en todos los enlaces, imagenes con nombres reales de Wikipedia.`,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  return response;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt requerido' });

  // Reintento automático hasta 3 veces si hay sobrecarga
  const MAX_RETRIES = 3;
  let lastError;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await callAnthropic(prompt);

      if (!response.ok) {
        const err = await response.json();
        // Si es sobrecarga, esperar y reintentar
        if (err?.error?.type === 'overloaded_error' && attempt < MAX_RETRIES) {
          console.log(`Sobrecarga Anthropic, reintento ${attempt}/${MAX_RETRIES}...`);
          await new Promise(r => setTimeout(r, 2000 * attempt)); // 2s, 4s
          continue;
        }
        console.error('Anthropic error:', JSON.stringify(err));
        return res.status(500).json({ error: 'Error en la API de IA' });
      }

      const data = await response.json();
      return res.status(200).json({ content: data.content[0].text });

    } catch (err) {
      lastError = err;
      if (attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, 2000 * attempt));
        continue;
      }
    }
  }

  console.error('AI query failed after retries:', lastError?.message);
  res.status(500).json({ error: 'Servicio temporalmente sobrecargado. Inténtalo en unos segundos.' });
};

