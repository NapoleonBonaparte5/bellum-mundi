// api/get-images.js
// Busca imágenes reales en Wikimedia Commons dado un término de búsqueda

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { terms } = req.body; // array de términos de búsqueda en inglés
  if (!terms || !Array.isArray(terms)) return res.status(400).json({ error: 'Terms requeridos' });

  const images = [];

  for (const term of terms.slice(0, 3)) {
    try {
      const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(term)}&prop=pageimages&format=json&pithumbsize=400&origin=*`;
      const response = await fetch(url);
      const data = await response.json();
      const pages = data?.query?.pages;
      if (pages) {
        const page = Object.values(pages)[0];
        if (page?.thumbnail?.source) {
          images.push({
            url: page.thumbnail.source,
            title: page.title
          });
        }
      }
    } catch (e) {
      console.log(`No image for term: ${term}`);
    }
  }

  res.status(200).json({ images });
};
