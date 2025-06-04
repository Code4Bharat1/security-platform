import  axios from "axios";
import * as cheerio from "cheerio";

// Function to fetch webpage and extract links
const extractLinks = async (url) => {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const links = [];
    const linkMap = new Map(); // To track which page each link was found on

    $("a").each((_, element) => {
      const link = $(element).attr("href");
      if (link && link.startsWith("http")) {
        links.push(link);
        linkMap.set(link, url); // Store the current page URL as the source
      }
    });

    return { links, linkMap };
  } catch (error) {
    console.error("Error fetching page:", error.message);
    return { links: [], linkMap: new Map() };
  }
};

// Function to check if links are broken
const checkLinks = async (links, linkMap) => {
  const results = await Promise.all(
    links.map(async (link) => {
      try {
        
  const response = await axios.get(link, {
  timeout: 5000,
  validateStatus: false,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91.0.4472.124 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
  }
});


        return {
          url: link,
          status: response.status,
          working: response.status >= 200 && response.status < 400,
          foundOn: linkMap.get(link),
        };
      } catch (error) {
        return {
          url: link,
          status: error.response ? error.response.status : "Network Error",
          error: error.message,
          working: false,
          foundOn: linkMap.get(link),
        };
      }
    })
  );

  return results;
};

// POST handler for Next.js App Router
export async function POST(request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { links, linkMap } = await extractLinks(url);
    const checkedLinks = await checkLinks(links, linkMap);
    const brokenLinks = checkedLinks.filter((link) => !link.working);

    return new Response(
      JSON.stringify({
        url,
        totalLinks: links.length,
        brokenLinks: brokenLinks.map((link) => ({
          url: link.url,
          status: link.status,
          error: link.error || `Status Code: ${link.status}`,
          foundOn: link.foundOn || url,
        })),
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: "Failed to check links" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
