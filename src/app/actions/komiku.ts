'use server';

import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Server action to fetch data from Komiku.org
 * Using optimized selectors from provided scraper logic.
 */

const BASE_URL = "https://komiku.org";
const API_URL = "https://api.komiku.org";
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
  'Referer': BASE_URL + '/',
  'Origin': BASE_URL,
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1'
};

export async function fetchKomiku(input: { mode: string; query?: string; url?: string; page?: number; genre?: string }) {
  try {
    const { mode, query, url, page = 1 } = input;

    // --- HOME / LATEST ---
    if (mode === 'home') {
      const res = await axios.get(BASE_URL, { headers: HEADERS, timeout: 30000 });
      const $ = cheerio.load(res.data);
      const items: any[] = [];

      $('#Terbaru .ls2').each((_, el) => {
        const flag = $(el).find('.flag').attr('src');
        let type = "Manga";
        if (flag?.includes('jp.png')) type = "Manga";
        else if (flag?.includes('kr.png')) type = "Manhwa";
        else if (flag?.includes('cn.png')) type = "Manhua";

        items.push({
          title: $(el).find('h3 a').text().trim(),
          url: BASE_URL + $(el).find('h3 a').attr('href'),
          type: type,
          latest: $(el).find('.ls2l').text().trim(),
          thumbnail: $(el).find('.ls2v img').data('src') || $(el).find('.ls2v img').attr('src')
        });
      });

      return { status: true, data: { results: items } };
    }

    // --- SEARCH ---
    if (mode === 'search') {
      const searchUrl = `${API_URL}/?post_type=manga&s=${encodeURIComponent(query!)}&page=${page}`;
      const res = await axios.get(searchUrl, { headers: HEADERS, timeout: 30000 });
      const $ = cheerio.load(res.data);
      const items: any[] = [];

      $('.bge').each((_, el) => {
        const title = $(el).find('.kan h3').text().trim();
        const mangaUrl = $(el).find('.bgei a').first().attr('href');
        const image = $(el).find('.bgei img').attr('src');
        const type = $(el).find('.tpe1_inf b').text().trim();
        const latest = $(el).find('.new1:last a span:last-child').text().trim();
        
        if (title) {
          items.push({
            title,
            url: mangaUrl ? (mangaUrl.startsWith('http') ? mangaUrl : BASE_URL + mangaUrl) : null,
            thumbnail: image,
            type: type || 'Manga',
            latest: latest || 'New'
          });
        }
      });

      return { status: true, data: { results: items, count: items.length } };
    }

    // --- DETAIL ---
    if (mode === 'detail') {
      const res = await axios.get(url!, { headers: HEADERS, timeout: 30000 });
      const $ = cheerio.load(res.data);
      
      const title = $('h1 span').text().trim();
      const altTitle = $('.j2').text().trim();
      const thumbnail = $('.ims img').attr('src');
      const synopsis = $('.desc').text().trim();
      
      const info: any = {};
      const tableCells = $('.inftable td');
      info.type = tableCells.eq(5).text().trim();
      info.theme = tableCells.eq(7).text().trim();
      info.author = tableCells.eq(11).text().trim();
      info.status = tableCells.eq(13).text().trim();
      info.rating = tableCells.eq(15).text().trim();

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
            url: BASE_URL + link,
            date
          });
        }
      });

      return {
        status: true,
        data: {
          title,
          altTitle,
          thumbnail,
          synopsis,
          info,
          genres,
          chapters
        }
      };
    }

    // --- CHAPTER IMAGES ---
    if (mode === 'chapter') {
      const res = await axios.get(url!, { headers: HEADERS, timeout: 30000 });
      const $ = cheerio.load(res.data);
      
      const images: string[] = [];
      $('#Baca_Komik img').each((_, el) => {
        const src = $(el).attr('src');
        if (src && !src.includes('lazy.jpg')) {
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
