import axios from 'axios';
import * as cheerio from 'cheerio';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return new Response(JSON.stringify({ error: 'URL is required' }), { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendSSE = (data) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

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

        const links = Array.from(linksSet).slice(0, 30); // limit to first 30 links

        sendSSE({ type: 'total', total: links.length });

        for (const link of links) {
          try {
            let status;
            try {
              const headRes = await axios.head(link, {
                headers: { 'User-Agent': 'Mozilla/5.0' },
                timeout: 10000,
              });
              status = headRes.status;
            } catch (headErr) {
              if (headErr.response?.status === 405) {
                const getRes = await axios.get(link, {
                  headers: { 'User-Agent': 'Mozilla/5.0' },
                  timeout: 10000,
                });
                status = getRes.status;
              } else {
                status = headErr.response?.status || 'Blocked/Error';
              }
            }

            sendSSE({
              type: 'link',
              url: link,
              status,
              ok: typeof status === 'number' ? status < 400 : false,
            });
          } catch (err) {
            sendSSE({
              type: 'link',
              url: link,
              status: err.response?.status || 'Blocked/Error',
              ok: false,
            });
          }
        }

        sendSSE({ type: 'done' });
        controller.close();
      } catch {
        sendSSE({ type: 'error', message: 'Failed to fetch page' });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
