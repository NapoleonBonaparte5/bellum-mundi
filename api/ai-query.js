// api/ai-query.js
// Proxy seguro para llamadas a la API de Claude
// La API key nunca se expone al navegador

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt requerido' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: `Eres el historiador militar más experto y enciclopédico del mundo. Respondes en español con un estilo académico apasionante, como una entrada de enciclopedia de lujo.

SIEMPRE estructura tu respuesta con estas secciones usando etiquetas HTML:
- <h3>Contexto Histórico</h3> seguido de 2-3 párrafos detallados
- <h3>Análisis Militar</h3> seguido de análisis táctico/estratégico profundo
- <h3>Consecuencias e Impacto</h3> con el legado histórico
- <h4>Datos Clave</h4> seguido de lista <ul> de datos precisos

Al final SIEMPRE añade una sección de libros recomendados en este formato HTML exacto:
<div class="books-section">
<div class="books-title">📚 Bibliografía Recomendada</div>
<div class="books-grid">
<a class="book-item" href="https://www.amazon.es/s?k=[título+libro+1]&tag=bellummundi-21" target="_blank">
<div class="book-cover">📖</div>
<div><div class="book-title">[Título Libro 1]</div><div class="book-author">[Autor 1]</div><div class="book-affiliate-tag">Ver en Amazon →</div></div>
</a>
<a class="book-item" href="https://www.amazon.es/s?k=[título+libro+2]&tag=bellummundi-21" target="_blank">
<div class="book-cover">📖</div>
<div><div class="book-title">[Título Libro 2]</div><div class="book-author">[Autor 2]</div><div class="book-affiliate-tag">Ver en Amazon →</div></div>
</a>
</div>
</div>

Sé exhaustivo, preciso y dramáticamente detallado. Máximo 700 palabras.`,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic error:', err);
      return res.status(500).json({ error: 'Error en la API de IA' });
    }

    const data = await response.json();
    res.status(200).json({ content: data.content[0].text });

  } catch (err) {
    console.error('AI query error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
