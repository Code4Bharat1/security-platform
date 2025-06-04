import axios from 'axios';
import * as cheerio from 'cheerio';
import pLimit from 'p-limit';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return Response.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    const pageRes = await axios.get(targetUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 15000,
    });

    const $ = cheerio.load(pageRes.data);
    const linksSet = new Set();

    $('a').each((_, el) => {
      const href = $(el).attr('href');
      if (href && href.startsWith('http')) linksSet.add(href);
    });

    const links = Array.from(linksSet).slice(0, 30); // max 30 links

    const limit = pLimit(5); // concurrency limit 5

    const results = await Promise.all(
      links.map(link =>
        limit(async () => {
          try {
            const headRes = await axios.head(link, {
              headers: { 'User-Agent': 'Mozilla/5.0' },
              timeout: 10000,
            });
            return { url: link, status: headRes.status, ok: headRes.status < 400 };
          } catch (err) {
            if (err.response?.status === 405) {
              // fallback to GET if HEAD not allowed
              try {
                const getRes = await axios.get(link, {
                  headers: { 'User-Agent': 'Mozilla/5.0' },
                  timeout: 10000,
                });
                return { url: link, status: getRes.status, ok: getRes.status < 400 };
              } catch (getErr) {
                return {
                  url: link,
                  status: getErr.response?.status || 'Blocked/Error',
                  ok: false,
                };
              }
            }

            return {
              url: link,
              status: err.response?.status || 'Blocked/Error',
              ok: false,
            };
          }
        })
      )
    );

    return Response.json({ links: results });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch page' }, { status: 500 });
  }
}
