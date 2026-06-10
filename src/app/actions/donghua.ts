'use server';

import axios from 'axios';
import * as cheerio from 'cheerio';

const BASE_URL = "https://donghuastream.org";
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8',
  'Cache-Control': 'no-cache',
};

async function fetchPage(url: string) {
  const res = await axios.get(url, {
    headers: { ...HEADERS, Referer: BASE_URL },
    timeout: 15000,
    validateStatus: (status) => status < 500, // Handle 404s manually
  });
  if (res.status === 404) return null;
  return cheerio.load(res.data);
}

function extractEpisodeNum(str: string) {
  const match = str.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

export async function fetchDonghua(input: { mode: string; query?: string; slug?: string }) {
  try {
    const { mode, query, slug } = input;

    if (mode === 'home') {
      const $ = await fetchPage(BASE_URL);
      if (!$) return { status: false, error: 'Failed to load homepage' };
      
      const latest_episodes: any[] = [];
      $('.listupd .bsx').each((_, el) => {
        const $el = $(el);
        const link = $el.find('a').attr('href') || '';
        const title = $el.find('.tt h2').text().trim();
        const episode = $el.find('.epx').text().trim();
        const thumbnail = $el.find('img').attr('data-src') || $el.find('img').attr('src') || '';
        
        if (link) {
          latest_episodes.push({ 
            title, 
            episode, 
            url: link, 
            thumbnail, 
            slug: link.split('/').filter(Boolean).pop() 
          });
        }
      });

      const slider: any[] = [];
      $('.slide-item').each((_, el) => {
        const $el = $(el);
        const title = $el.find('.ellipsis a').text().trim();
        const url = $el.find('.ellipsis a').attr('href') || '';
        const summary = $el.find('.excerpt .story p').text().trim();
        const thumbnail = $el.find('.poster img').attr('data-src') || $el.find('.poster img').attr('src') || '';
        if (title) {
          slider.push({ title, url, summary: summary.substring(0, 200) + '...', thumbnail, slug: url.split('/').filter(Boolean).pop() });
        }
      });

      return { status: true, data: { latest_episodes: latest_episodes.slice(0, 20), slider } };
    }

    if (mode === 'search') {
      const $ = await fetchPage(`${BASE_URL}/?s=${encodeURIComponent(query!)}`);
      if (!$) return { status: false, error: 'Search failed' };
      const results: any[] = [];
      $('.listupd .bsx').each((_, el) => {
        const $el = $(el);
        const link = $el.find('a').attr('href') || '';
        const title = $el.find('.tt h2').text().trim();
        const thumbnail = $el.find('img').attr('data-src') || $el.find('img').attr('src') || '';
        const episode = $el.find('.epx').text().trim();
        if (link && title) {
          results.push({ title, url: link, thumbnail, episode, slug: link.split('/').filter(Boolean).pop() });
        }
      });
      return { status: true, data: { results } };
    }

    if (mode === 'detail') {
      let currentSlug = slug;
      let $ = await fetchPage(`${BASE_URL}/anime/${currentSlug}/`);
      
      // If direct anime lookup fails or title is missing, it might be an episode slug
      if (!$ || $('.infox h1').text().trim() === '') {
        const $ep = await fetchPage(`${BASE_URL}/${slug}/`);
        if ($ep) {
          const seriesLink = $ep('#singlepisode .det h3 a').attr('href') || $ep('.breadcrumb a[href*="/anime/"]').attr('href');
          if (seriesLink) {
            const resolvedSlug = seriesLink.split('/').filter(Boolean).pop();
            if (resolvedSlug) {
              currentSlug = resolvedSlug;
              $ = await fetchPage(`${BASE_URL}/anime/${currentSlug}/`);
            }
          }
        }
      }

      if (!$) return { status: false, error: 'Series not found (404)' };

      const title = $('.infox h1').text().trim();
      if (!title) return { status: false, error: 'Series metadata not found' };

      let status = '';
      let total_episodes = '';
      $('.spe span').each((_, el) => {
        const text = $(el).text().trim();
        if (text.includes('Status:')) status = text.replace('Status:', '').trim();
        if (text.includes('Episodes:')) total_episodes = text.replace('Episodes:', '').trim();
      });

      const genres: string[] = [];
      $('.genxed a').each((_, el) => { genres.push($(el).text().trim()); });

      const synopsis = $('.entry-content p').first().text().trim();
      const poster = $('.thumb img').attr('data-src') || $('.thumb img').attr('src') || '';
      const rating = $('.rating strong').text().replace('Rating', '').trim();

      const episodes: any[] = [];
      $('.eplister ul li a').each((_, el) => {
        const $el = $(el);
        const episode = $el.find('.epl-num').text().trim().replace(/\([^)]*\)/g, '').replace('Preview', '').trim();
        const epTitle = $el.find('.epl-title').text().trim();
        const date = $el.find('.epl-date').text().trim();
        const url = $el.attr('href') || '';
        episodes.push({ episode, title: epTitle, url, release_date: date, slug: url.split('/').filter(Boolean).pop() });
      });

      episodes.sort((a, b) => extractEpisodeNum(a.episode) - extractEpisodeNum(b.episode));

      return { status: true, data: { title, status, total_episodes, genres, synopsis, poster, rating, episodes } };
    }

    if (mode === 'watch') {
      const $ = await fetchPage(`${BASE_URL}/${slug}/`);
      if (!$) return { status: false, error: 'Watch page not found' };
      const title = $('h1.entry-title').text().trim();
      
      let video_url = $('#embed_holder iframe').attr('src') || $('#embed_holder iframe').attr('data-src');
      if (!video_url) {
        video_url = $('.player-embed iframe').attr('src') || $('.player-embed iframe').attr('data-src');
      }
      if (video_url && video_url.startsWith('//')) video_url = 'https:' + video_url;

      const servers: any[] = [];
      $('.mirror option').each((_, el) => {
        const val = $(el).attr('value');
        const name = $(el).text().trim();
        if (val && val.trim() && !['', 'Select Video Server'].includes(name)) {
          try {
            const decoded = Buffer.from(val, 'base64').toString('utf-8');
            const srcMatch = decoded.match(/src=["']([^"']+)["']/);
            let sUrl = srcMatch ? srcMatch[1] : val;
            if (sUrl.startsWith('//')) sUrl = 'https:' + sUrl;
            servers.push({ name, url: sUrl });
          } catch {
            servers.push({ name, url: val });
          }
        }
      });

      const navs = $('.naveps .nvs a');
      let prev_slug = null;
      let next_slug = null;
      navs.each((_, el) => {
        const $el = $(el);
        const href = $el.attr('href') || '';
        const txt = $el.text().toLowerCase();
        const s = href.split('/').filter(Boolean).pop() || null;
        if (txt.includes('prev') || txt.includes('‹')) prev_slug = s;
        else if (txt.includes('next') || txt.includes('›')) next_slug = s;
      });

      return { status: true, data: { title, video_url, servers, prev_slug, next_slug } };
    }

    if (mode === 'schedule') {
      const $ = await fetchPage(`${BASE_URL}/schedule/`);
      if (!$) return { status: false, error: 'Schedule page not found' };
      const schedule: any[] = [];
      $('.schedule-item, .episode-list li').each((_, el) => {
        const day = $(el).find('.day').text().trim();
        const title = $(el).find('.title a').text().trim();
        const url = $(el).find('.title a').attr('href') || '';
        if (title) {
          schedule.push({ day, title, slug: url.split('/').filter(Boolean).pop() });
        }
      });
      return { status: true, data: schedule };
    }

    return { status: false, error: 'Invalid mode' };
  } catch (error: any) {
    return { status: false, error: error.message };
  }
}