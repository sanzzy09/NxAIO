'use server';

import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Server action to fetch data from Komiku.org
 * Handles search, detail extraction, and chapter image retrieval.
 */

const BASE_URL = "https://komiku.org";
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";

const HEADERS = {
    'User-Agent': USER_AGENT,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8',
    'Referer': BASE_URL + '/',
    'Origin': BASE_URL,
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1'
};

export async function fetchKomiku(input: { mode: string; query?: string; url?: string; page?: number }) {
  try {
    const { mode, query, url, page = 1 } = input;

    if (mode === 'search') {
      // Use the standard search URL
      const searchUrl = `${BASE_URL}/?post_type=manga&s=${encodeURIComponent(query!)}&page=${page}`;
      const res = await axios.get(searchUrl, { headers: HEADERS, timeout: 20000 });
      const $ = cheerio.load(res.data);
      const items: any[] = [];

      // Komiku uses .bge class for search result items
      $('.bge').each((_, el) => {
        const title = $(el).find('.kan h3').text().trim();
        const mangaUrl = $(el).find('.bgei a').first().attr('href');
        const image = $(el).find('.bgei img').attr('src');
        const type = $(el).find('.tpe1_inf b').text().trim();
        const latest = $(el).find('.new1:last a span:last-child').text().trim();
        
        if (title && mangaUrl) {
          items.push({
            title,
            url: mangaUrl.startsWith('http') ? mangaUrl : BASE_URL + mangaUrl,
            thumbnail: image,
            type: type || 'Manga',
            latest: latest || 'New Chapter'
          });
        }
      });

      return { 
        status: true, 
        data: { 
          results: items, 
          query,
          count: items.length 
        } 
      };
    }

    if (mode === 'detail') {
      const res = await axios.get(url!, { headers: HEADERS, timeout: 20000 });
      const $ = cheerio.load(res.data);
      
      const title = $('h1 span').text().trim();
      const thumbnail = $('.ims img').attr('src');
      const synopsis = $('.desc').text().trim();
      
      const info: any = {};
      $('.inftable tr').each((_, el) => {
        const key = $(el).find('td').first().text().trim().toLowerCase().replace(/\s+/g, '_');
        const val = $(el).find('td').last().text().trim();
        if (key && val) info[key] = val;
      });

      const genres: string[] = [];
      $('.genre li a span').each((_, el) => {
        genres.push($(el).text().trim());
      });

      const chapters: any[] = [];
      $('#Daftar_Chapter tbody tr').each((_, el) => {
        const link = $(el).find('td.judulseries a').attr('href');
        const name = $(el).find('td.judulseries a span').text().trim();
        const date = $(el).find('td.tanggalseries').text().trim();
        if (link) {
          chapters.push({
            name,
            url: link.startsWith('http') ? link : BASE_URL + link,
            date
          });
        }
      });

      return {
        status: true,
        data: {
          title,
          thumbnail,
          synopsis,
          info,
          genres,
          chapters: chapters // Reverse handled in UI or keep as is if chronological
        }
      };
    }

    if (mode === 'chapter') {
      const res = await axios.get(url!, { headers: HEADERS, timeout: 20000 });
      const $ = cheerio.load(res.data);
      
      const images: string[] = [];
      $('#Baca_Komik img').each((_, el) => {
        const src = $(el).attr('src');
        // Filter out low-res placeholders
        if (src && !src.includes('lazy.jpg') && !src.includes('logo')) {
          images.push(src);
        }
      });

      const title = $('h1').first().text().trim();
      
      return {
        status: true,
        data: {
          title,
          images,
          total: images.length
        }
      };
    }

    return { status: false, error: 'Invalid mode provided.' };
  } catch (error: any) {
    console.error('Komiku Action Error:', error.message);
    return { 
      status: false, 
      error: error.response?.status === 403 
        ? "Access Denied by Komiku. They may be blocking our node." 
        : error.message 
    };
  }
}
