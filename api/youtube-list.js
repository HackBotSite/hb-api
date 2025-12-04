// api/youtube-list.js
export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { query } = req.query;
    if (!query || !String(query).trim()) {
      return res.status(400).json({ error: 'Missing query parameter ?query=' });
    }

    // Tanam langsung API key di sini
    const API_KEY = "AIzaSyABJ2vP5K61m1xx9V27U4vXp0d3dSkselc";

    const params = new URLSearchParams({
      key: API_KEY,
      part: 'snippet',
      type: 'video',
      maxResults: '10',
      q: query,
      regionCode: 'ID'
    });

    const url = `https://www.googleapis.com/youtube/v3/search?${params.toString()}`;
    const resp = await fetch(url);
    if (!resp.ok) {
      const text = await resp.text();
      return res.status(resp.status).json({ error: 'YouTube API error', details: text });
    }
    const data = await resp.json();

    const list = (data.items || [])
      .filter(item => item.id?.videoId)
      .map(item => {
        const vid = item.id.videoId;
        const sn = item.snippet || {};
        return {
          title: sn.title || '',
          channelTitle: sn.channelTitle || '',
          publishedAt: sn.publishedAt || '',
          videoId: vid,
          url: `https://www.youtube.com/watch?v=${vid}`,
          thumbnails: {
            default: sn.thumbnails?.default?.url || null,
            medium: sn.thumbnails?.medium?.url || null,
            high: sn.thumbnails?.high?.url || null,
          },
        };
      });

    res.setHeader('Cache-Control', 'public, max-age=60');
    return res.status(200).json({
      query,
      total: list.length,
      results: list,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error', details: String(err) });
  }
}
