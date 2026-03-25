// api/get-images.js — busca imágenes reales en Wikipedia

module.exports = async (req, res) => {
  // Permitir CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { terms } = req.body;
  if (!terms || !Array.isArray(terms)) return res.status(400).json({ error: 'Terms requeridos' });

  const images = [];

  for (const term of terms.slice(0, 3)) {
    try {
      // Buscar la imagen principal del artículo de Wikipedia
      const apiUrl = `https://en.wikipedia.org/w/api.php?` +
        `action=query&titles=${encodeURIComponent(term)}&prop=pageimages&format=json` +
        `&pithumbsize=500&pilimit=1&origin=*`;

      const response = await fetch(apiUrl, {
        headers: { 'User-Agent': 'BellumMundi/1.0 (https://bellummundi.com)' }
      });

      if (!response.ok) continue;

      const data = await response.json();
      const pages = data?.query?.pages;
      if (!pages) continue;

      const page = Object.values(pages)[0];
      if (page && page.thumbnail && page.thumbnail.source) {
        images.push({
          url: page.thumbnail.source,
          title: page.title || term
        });
      }
    } catch (e) {
      console.log(`Error fetching image for: ${term}`, e.message);
    }
  }

  res.status(200).json({ images });
};
