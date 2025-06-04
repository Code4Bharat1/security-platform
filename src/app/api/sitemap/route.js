// File: app/api/sitemap-generator/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';
import { URL } from 'url';
import * as cheerio from 'cheerio';  // <-- changed this import

// Function to normalize URL (add protocol if missing)
const normalizeUrl = (url) => {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
};

// Function to check if a URL belongs to the same domain
// Function to check if a URL belongs to the same domain
const isSameDomain = (baseUrl, url) => {
  try {
    const baseHostname = new URL(baseUrl).hostname;
    const urlHostname = new URL(url).hostname;
    return baseHostname === urlHostname;
  } catch {
    return false;  // no error var needed here
  }
};


// Function to extract and normalize links from HTML
const extractLinks = async (url, baseUrl, visited = new Set(), depth = 3, maxDepth = 3) => {
  if (depth > maxDepth || visited.has(url)) {
    return visited;
  }
  
  visited.add(url);
  
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SitemapGenerator/1.0)'
      },
      timeout: 10000 // 10 second timeout
    });
    
    const $ = cheerio.load(data);
    const links = new Set();

    $('a').each((_, element) => {
      let link = $(element).attr('href');
      
      if (!link || link.startsWith('#') || link.startsWith('mailto:') || link.startsWith('tel:')) {
        return;
      }
      
      try {
        if (!link.startsWith('http')) {
          const base = new URL(url);
          if (link.startsWith('/')) {
            link = `${base.protocol}//${base.hostname}${link}`;
          } else {
            let basePath = base.pathname;
            if (!basePath.endsWith('/')) {
              basePath = basePath.substring(0, basePath.lastIndexOf('/') + 1);
            }
            link = `${base.protocol}//${base.hostname}${basePath}${link}`;
          }
        }
        
        if (isSameDomain(baseUrl, link)) {
          links.add(link);
        }
      } catch {
        // skip invalid URLs
      }
    });

    if (depth < maxDepth) {
      for (const link of links) {
        if (!visited.has(link)) {
          await extractLinks(link, baseUrl, visited, depth + 1, maxDepth);
        }
      }
    }
    
    return visited;
  } catch (error) {
    console.error(`Error crawling ${url}: ${error.message}`);
    return visited;
  }
};

// Main API handler
export async function POST(request) {
  try {
    const { url, depth = 3 } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }
    
    const normalizedUrl = normalizeUrl(url);
    const maxDepth = Math.min(Math.max(parseInt(depth), 1), 5);
    const visited = new Set();
    
    const urls = await extractLinks(normalizedUrl, normalizedUrl, visited, 1, maxDepth);
    
    const urlArray = Array.from(urls);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    urlArray.forEach((link) => {
      xml += `  <url>\n    <loc>${link}</loc>\n  </url>\n`;
    });
    xml += `</urlset>`;
    
    return NextResponse.json({
      success: true,
      pagesFound: urlArray.length,
      urls: urlArray,
      xml: xml
    });
    
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate sitemap',
      message: error.message
    }, { status: 500 });
  }
}
