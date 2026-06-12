'use server';

import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Server action to fetch data from Komiku.org
 * Enhanced with High-Fidelity image proxying and robust scraping logic.
 */

const BASE_URL = "https://komiku.org";
const API_URL = "https://api.komiku.org";
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
  'Referer': BASE_URL + '/',
  'Origin': BASE_URL,
  'Connection': 'keep-alive',
};

/**
 * Proxies a manga image URL to a data URI to bypass hotlink protection.
 * This is CRITICAL for Komiku as their servers check Referer headers.
 */
export async function proxyImage(url: string) {
  try {
    const res = await axios.get(url, {
      headers: {
        ...HEADERS,
        'Referer': BASE_URL + '/',
        'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
      },
      responseType: 'arraybuffer',
      timeout: 20000
    });
    const contentType = res.headers['content-type'] || 'image/jpeg';
    const base64 = Buffer.from(res.data).toString('base64');
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error('Image Proxy Error:', url);
    return null; // Return null on failure so UI can show error state
  }
}

export async function fetchKomiku(input: { mode: string; query?: string; url?: string; page?: number; type?: string; rankType?: string }) {
  try {
    const { mode, query, url, page = 1, type = "semua", rankType = "mingguan" } = input;

    // --- HOME / LATEST ---
    if (mode === 'home') {
      const res = await axios.get(BASE_URL, { headers: HEADERS, timeout: 30000 });
      const $ = cheerio.load(res.data);
      const items: any[] = [];

      $('#Terbaru .ls2').each((_, el) => {
        const flag = $(el).find('.flag').attr('src');
        let mangaType = "Manga";
        if (flag?.includes('jp.png')) mangaType = "Manga";
        else if (flag?.includes('kr.png')) mangaType = "Manhwa";
        else if (flag?.includes('cn.png')) mangaType = "Manhua";

        const thumb = $(el).find('.ls2v img').attr('data-src') || $(el).find('.ls2v img').attr('src');

        items.push({
          title: $(el).find('h3 a').text().trim(),
          url: BASE_URL + $(el).find('h3 a').attr('href'),
          type: mangaType,
          latest: $(el).find('.ls2l').text().trim(),
          thumbnail: thumb?.includes('lazy.jpg') ? null : thumb
        });
      });

      return { status: true, data: { results: items } };
    }

    // --- SEARCH ---
    if (mode === 'search') {
      // Use API subdomain for more reliable search results if possible, otherwise fallback
      const searchUrl = `${API_URL}/?post_type=manga&s=${encodeURIComponent(query!)}&page=${page}`;
      const res = await axios.get(searchUrl, { headers: HEADERS, timeout: 30000 });
      const $ = cheerio.load(res.data);
      const items: any[] = [];

      $('.bge').each((_, el) => {
        const title = $(el).find('.kan h3').text().trim();
        const mangaUrl = $(el).find('.bgei a').first().attr('href');
        const image = $(el).find('.bgei img').attr('data-src') || $(el).find('.bgei img').attr('src');
        const mangaType = $(el).find('.tpe1_inf b').text().trim();
        const latest = $(el).find('.new1:last a span:last-child').text().trim();
        
        if (title) {
          items.push({
            title,
            url: mangaUrl ? (mangaUrl.startsWith('http') ? mangaUrl : BASE_URL + mangaUrl) : null,
            thumbnail: image?.includes('lazy.jpg') ? null : image,
            type: mangaType || 'Manga',
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
      const thumbnail = $('.ims img').attr('data-src') || $('.ims img').attr('src');
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
      const response = await axios.get(url!, { headers: HEADERS, timeout: 30000 });
      const $ = cheerio.load(response.data);

      let chapterData: any = {};
      const scriptMatch = response.data.match(/var chapterData = ({[\s\S]*?});/);
      if (scriptMatch) {
          try {
              // Extract the JS object literal safely
              const jsonLike = scriptMatch[1];
              // Convert to JSON (heuristic: quote keys, fix quotes)
              const jsonStr = jsonLike
                .replace(/(\w+):/g, '"$1":')
                .replace(/'/g, '"')
                .replace(/,(\s*})/g, '$1');
              chapterData = JSON.parse(jsonStr);
          } catch (e) {
              // Simple fallback for evaluation in context
          }
      }

      const images: any[] = [];
      $('#Baca_Komik img').each((i, el) => {
          // Komiku uses data-src for lazy loading. src is often lazy.jpg
          const src = $(el).attr('data-src') || $(el).attr('src');
          if (src && !src.includes('lazy.jpg')) {
              images.push({
                  page: i + 1,
                  url: src.trim()
              });
          }
      });

      const seriesTitle = $('.breadcrumb a').eq(1).text().trim() || chapterData.series;
      const chapterTitle = $('h1').first().text().trim();

      return {
          status: true,
          data: {
              series: seriesTitle,
              chapter: chapterTitle,
              chapter_number: chapterData.chapter,
              total_pages: images.length,
              images: images,
              has_next: chapterData.hasNext || false,
              next_chapter_url: chapterData.hasNext ? chapterData.link.replace(/[^/]+$/, '') + (parseInt(chapterData.chapter) + 1) + '/' : null
          }
      };
    }

    // --- RANKS ---
    if (mode === 'rank') {
      const res = await axios.get(BASE_URL, { headers: HEADERS });
      const $ = cheerio.load(res.data);
      const items: any[] = [];
      $(`#rank-${rankType} article.ls4`).each((_, el) => {
        items.push({
          rank: $(el).find('.rank-num').text().trim(),
          title: $(el).find('h4 a').text().trim(),
          url: BASE_URL + $(el).find('h4 a').attr('href'),
          views: $(el).find('.ls4s').text().trim(),
          chapter: $(el).find('.ls24').text().trim(),
        });
      });
      return { status: true, data: items };
    }

    return { status: false, error: 'Invalid mode provided.' };
  } catch (error: any) {
    console.error('Komiku Action Error:', error.message);
    return { status: false, error: error.message };
  }
}
