
'use server';

import axios from 'axios';
import * as cheerio from 'cheerio';

const DOMAINS = {
  lk21: 'https://tv10.lk21official.cc',
  nontondrama: 'https://tv4.nontondrama.my',
};

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8',
  'Cache-Control': 'no-cache',
};

async function fetchPage(url: string, referer?: string) {
  const res = await axios.get(url, {
    headers: { ...HEADERS, Referer: referer || url },
    timeout: 15000,
  });
  return cheerio.load(res.data);
}

function parseList($: cheerio.CheerioAPI) {
  const results: any[] = [];
  $('article').each((_, el) => {
    const $el = $(el);
    const $a = $el.find('figure a').first();
    const href = $a.attr('href') || '';
    if (!href) return;
    
    // Extract slug from href
    const slug = href.split('/').filter(Boolean).pop() || '';
    
    const title = $el.find('h3.poster-title, h2.poster-title').first().text().trim() || $a.attr('title') || '';
    const poster = $el.find('source[type="image/jpeg"]').attr('srcset') || $el.find('img').attr('data-src') || $el.find('img').attr('src') || '';
    const year = $el.find('span.year').text().trim() || '';
    const quality = $el.find('span.label').text().trim() || '';
    const rating = $el.find('span[itemprop="ratingValue"]').text().trim() || '';
    const episode = $el.find('span.episode strong').text().trim() || '';
    const duration = $el.find('span.duration').text().trim() || '';
    
    results.push({ title, slug, href, poster, year, quality, rating, episode, duration });
  });
  return results;
}

function normalizeUrl(url: string | undefined, base: string) {
  if (!url) return '';
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('/')) return `${base}${url}`;
  return url;
}

export async function fetchLk21(input: { mode: string; query?: string; slug?: string; page?: number }) {
  try {
    const { mode, query, slug, page = 1 } = input;

    if (mode === 'home') {
      const $ = await fetchPage(`${DOMAINS.lk21}/`);
      return { status: true, data: parseList($) };
    }

    if (mode === 'series-home') {
      const $ = await fetchPage(`${DOMAINS.nontondrama}/`);
      return { status: true, data: parseList($) };
    }

    if (mode === 'search') {
      const b = `${DOMAINS.lk21}/search/`;
      const url = page > 1 ? `${b}page/${page}/?s=${encodeURIComponent(query!)}` : `${b}?s=${encodeURIComponent(query!)}`;
      const $ = await fetchPage(url);
      return { status: true, data: parseList($) };
    }

    if (mode === 'series-search') {
      const b = `${DOMAINS.nontondrama}/search/`;
      const url = page > 1 ? `${b}page/${page}/?s=${encodeURIComponent(query!)}` : `${b}?s=${encodeURIComponent(query!)}`;
      const $ = await fetchPage(url);
      return { status: true, data: parseList($) };
    }

    if (mode === 'detail') {
      const url = `${DOMAINS.lk21}/${slug}/`;
      const $ = await fetchPage(url, DOMAINS.lk21);
      
      const h1 = $('h1').first().text().toLowerCase();
      if (h1.includes('dialihkan') || h1.includes('nontondrama')) {
        const sUrl = `${DOMAINS.nontondrama}/${slug}/`;
        const $s = await fetchPage(sUrl, DOMAINS.nontondrama);
        return { status: true, type: 'series', data: parseSeriesDetail($s, DOMAINS.nontondrama) };
      }
      return { status: true, type: 'movie', data: parseMovieDetail($, DOMAINS.lk21) };
    }

    if (mode === 'series-detail') {
      const url = `${DOMAINS.nontondrama}/${slug}/`;
      const $ = await fetchPage(url, DOMAINS.nontondrama);
      return { status: true, type: 'series', data: parseSeriesDetail($, DOMAINS.nontondrama) };
    }

    if (mode === 'watch-episode') {
      const url = `${DOMAINS.nontondrama}/${slug}/`;
      const $ = await fetchPage(url, DOMAINS.nontondrama);
      return { status: true, data: parseEpisodeWatch($, DOMAINS.nontondrama) };
    }

    return { status: false, error: 'Invalid mode' };
  } catch (error: any) {
    console.error('LK21 Server Action Error:', error.message);
    return { status: false, error: error.message };
  }
}

function parseMovieDetail($: cheerio.CheerioAPI, baseDomain: string) {
  const title = $('h1').first().text().trim();
  const rating = ($('.info-tag span strong').first().text().trim()).replace(/[^\d.]/g, '');
  const infoSpans: string[] = [];
  $('.info-tag span').each((_, el) => { const t = $(el).text().trim(); if (t) infoSpans.push(t); });
  
  const tags: any[] = [];
  $('.tag-list .tag a').each((_, el) => tags.push({ label: $(el).text().trim(), href: $(el).attr('href') || '' }));
  
  const genre = tags.filter(t => t.href.includes('/genre/')).map(t => t.label);
  const country = tags.filter(t => t.href.includes('/country/')).map(t => t.label);
  
  const synopsis = $('[data-full]').first().attr('data-full') || '';
  const poster = $('meta[property="og:image"]').attr('content') || '';
  const servers: any[] = [];
  const seen = new Set();
  $('[data-server]').each((_, el) => {
    const server = $(el).attr('data-server');
    const rawUrl = $(el).attr('data-url');
    if (server && rawUrl && !seen.has(server)) { 
      seen.add(server); 
      servers.push({ server, url: normalizeUrl(rawUrl, baseDomain) }); 
    }
  });
  
  return { title, rating, quality: infoSpans[1] || '', resolution: infoSpans[2] || '', duration: infoSpans[3] || '', genre, country, synopsis, poster, servers };
}

function parseSeriesDetail($: cheerio.CheerioAPI, baseDomain: string) {
  const title = $('h1').first().text().trim();
  const rating = ($('.info-tag span strong').first().text().trim()).replace(/[^\d.]/g, '');
  const infoSpans: string[] = [];
  $('.info-tag span').each((_, el) => { const t = $(el).text().trim(); if (t) infoSpans.push(t); });

  const tags: any[] = [];
  $('.tag-list .tag a').each((_, el) => tags.push({ label: $(el).text().trim(), href: $(el).attr('href') || '' }));
  const genre = tags.filter(t => t.href.includes('/genre/')).map(t => t.label);
  const country = tags.filter(t => t.href.includes('/country/')).map(t => t.label);

  const synopsis = $('[data-full]').first().attr('data-full') || '';
  const poster = $('meta[property="og:image"]').attr('content') || '';
  
  let episodes: any[] = [];
  $('script').each((_, el) => {
    const txt = $(el).html() || '';
    const m = txt.match(/^\s*(\{"1":\[.*\].*\})\s*$/);
    if (m) {
      try {
        const data = JSON.parse(m[1]);
        Object.values(data).forEach((season: any) => season.forEach((ep: any) => {
          episodes.push({ episode: ep.episode_no, season: ep.s, title: ep.title, slug: ep.slug, href: `/${ep.slug}` });
        }));
      } catch (_) {}
    }
  });
  
  if (episodes.length === 0) {
    $('.episode-list a').each((_, el) => {
      const href = $(el).attr('href') || '', label = $(el).text().trim();
      const epSlug = href.split('/').filter(Boolean).pop() || '';
      if (href && href.includes('episode')) episodes.push({ title: label, slug: epSlug, href });
    });
  }
  
  return { title, rating, airDate: infoSpans[1] || '', type: infoSpans[2] || '', status: infoSpans[3] || '', genre, country, synopsis, poster, episodes };
}

function parseEpisodeWatch($: cheerio.CheerioAPI, baseDomain: string) {
  const title = $('h1').first().text().trim();
  let meta: any = {};
  $('script').each((_, el) => {
    const txt = $(el).html() || '';
    const m = txt.match(/\{[^<]*"current_eps"[^<]*\}/);
    if (m) { try { meta = JSON.parse(m[0]); } catch (_) {} }
  });
  
  const servers: any[] = [];
  const seen = new Set();
  $('[data-server]').each((_, el) => {
    const server = $(el).attr('data-server');
    const rawUrl = $(el).attr('data-url');
    if (server && rawUrl && !seen.has(server)) { 
      seen.add(server); 
      servers.push({ server, url: normalizeUrl(rawUrl, baseDomain) }); 
    }
  });
  
  const nextEpSlug = meta.next ? meta.next.split('/').filter(Boolean).pop() : null;
  const seriesSlug = meta.slug;
  let prevEpSlug = null;
  if (meta.current_eps > 1 && seriesSlug) {
    // Attempting to guess previous episode slug
    prevEpSlug = `${seriesSlug}-episode-${meta.current_eps - 1}`;
  }
  
  return { 
    title, 
    season: meta.current_season || null, 
    episode: meta.current_eps || null, 
    totalEps: meta.total_eps || null, 
    rating: meta.rating || null, 
    poster: meta.poster || null, 
    seriesSlug, 
    servers, 
    prevEpSlug, 
    nextEpSlug 
  };
}
