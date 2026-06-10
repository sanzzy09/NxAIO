'use server';

import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Server actions for the SinhalaSub Explorer.
 * Scrapes metadata, search results, and streaming options from sinhalasub.lk.
 */

const BASE = 'https://sinhalasub.lk';

const http = axios.create({
  baseURL: BASE,
  timeout: 30000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    Referer: BASE,
  },
});

let _nonce = { value: null as string | null, expiry: 0 };

async function getNonce() {
  if (_nonce.value && Date.now() < _nonce.expiry) return _nonce.value;
  try {
    const res = await http.get('/');
    const m = res.data.match(/"nonce"\s*:\s*"([a-f0-9]+)"/);
    if (!m) return null;
    _nonce = { value: m[1], expiry: Date.now() + 10 * 60 * 1000 };
    return _nonce.value;
  } catch {
    return null;
  }
}

function parseCard($: cheerio.CheerioAPI, el: any) {
  const $el = $(el);
  const $a = $el.find('a[href*="sinhalasub.lk"]').first();
  const $img = $el.find('img.thumb, img.mli-thumb, img.poster-img').first();
  const href = $a.attr('href') || '';
  const slug = href.split('/').filter(Boolean).pop() || '';
  
  return {
    id: $el.attr('id')?.replace('item-', '') || null,
    title: $el.find('.item-desc-title h3, h3').first().text().trim() || $a.attr('title') || 'Untitled',
    slug,
    url: href,
    type: $a.attr('data-ptype') || null,
    poster: $img.attr('src') || $img.attr('data-original') || '',
    language: $el.find('.language').text().trim() || null,
    quality: $el.find('.quality').text().trim() || null,
    resolution: $el.find('.qty').text().trim() || null,
    year: $el.find('.item-date').text().trim() || null,
  };
}

export async function fetchSinhalaSub(input: { mode: string; query?: string; slug?: string; page?: number; path?: string }) {
  try {
    const { mode, query, slug, page = 1, path } = input;

    if (mode === 'home') {
      const res = await http.get('/');
      const $ = cheerio.load(res.data);
      const items: any[] = [];
      $('.module-item').each((_, el) => items.push(parseCard($, el)));
      return { status: true, data: items };
    }

    if (mode === 'search') {
      let items: any[] = [];
      try {
        const nonce = await getNonce();
        if (nonce) {
          const res = await http.get('/wp-json/zetaflix/search/', {
            params: { s: query },
            headers: { 'X-WP-Nonce': nonce },
          });
          if (Array.isArray(res.data)) {
             items = res.data.map(item => ({
               title: item.title,
               slug: item.url?.split('/').filter(Boolean).pop(),
               poster: item.img,
               year: item.year,
               quality: item.quality,
               type: item.type
             }));
          }
        }
      } catch (_) {}

      if (items.length === 0) {
        const res = await http.get('/', { params: { s: query } });
        const $ = cheerio.load(res.data);
        $('.display-item, .module-item').each((_, el) => items.push(parseCard($, el)));
      }
      return { status: true, data: items };
    }

    if (mode === 'detail') {
      const res = await http.get(`/${slug}/`);
      const $ = cheerio.load(res.data);

      const genres: string[] = [];
      $('.details-genre a').each((_, el) => genres.push($(el).text().trim()));

      const cast: any[] = [];
      $('.cast-card').each((_, el) => {
        cast.push({
          name: $(el).find('.cast-card-name').text().trim(),
          image: $(el).find('img').attr('src') || null,
        });
      });

      const players: any[] = [];
      $('.zetaflix_player_option').each((_, el) => {
        players.push({ 
          nume: $(el).attr('data-nume'), 
          label: $(el).find('.opt-name').text().trim(),
          postId: $(el).attr('data-post')
        });
      });

      const episodes: any[] = [];
      $('.episodes-list li, .episodios li').each((_, el) => {
        const $ep = $(el);
        const href = $ep.find('a').attr('href') || '';
        episodes.push({
          num: $ep.find('.num-epi, .numerando').text().trim() || null,
          title: $ep.find('.episodiotitle, .epi-name').text().trim() || null,
          slug: href.split('/').filter(Boolean).pop()
        });
      });

      const downloads: any[] = [];
      $('table.links-table').each((_, table) => {
        $(table).find('tbody tr').each((_, row) => {
          const $row = $(row);
          const $a = $row.find('td a').first();
          downloads.push({
            host: $a.text().trim() || 'Link',
            quality: $row.find('.quality').text().trim(),
            size: $row.find('td:nth-child(3) span').text().trim(),
            href: $a.attr('href')
          });
        });
      });

      return {
        status: true,
        data: {
          title: $('.details-title h3').text().trim(),
          poster: $('img.poster-img').attr('src'),
          backdrop: $('.player-splash .splash-bg img').attr('src'),
          rating: $('.data-imdb').text().replace('IMDb:', '').trim(),
          quality: $('.data-quality').text().trim(),
          runtime: $('[itemprop="duration"]').text().trim(),
          year: $('.details-info a[href*="/release/"]').first().text().trim(),
          genres,
          description: $('.details-desc p').not(':empty').first().text().trim(),
          cast,
          players,
          episodes,
          downloads
        }
      };
    }

    if (mode === 'listing') {
      const res = await http.get(`/${path}/page/${page}/`);
      const $ = cheerio.load(res.data);
      const items: any[] = [];
      $('.display-item, .module-item').each((_, el) => items.push(parseCard($, el)));
      return { status: true, data: items };
    }

    return { status: false, error: 'Invalid mode' };
  } catch (error: any) {
    return { status: false, error: error.message };
  }
}
