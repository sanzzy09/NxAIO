'use server';

import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Server action to scrape Movieku (movieku.rest).
 * Credits: DEFAN
 */

const BASE_URL = 'https://movieku.rest';

export async function fetchMovieku(input: { mode: 'search' | 'detail' | 'home'; query?: string; url?: string }) {
  try {
    if (input.mode === 'home') {
      const res = await axios.get(BASE_URL, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      const $ = cheerio.load(res.data);
      const results: any[] = [];

      $('article').each((_, el) => {
        const title = $(el).find('.entry-title a').text().trim();
        const url = $(el).find('.entry-title a').attr('href');
        const posterImg = $(el).find('img').first();
        let thumbnail = posterImg.attr('data-src') || posterImg.attr('src');
        
        if (thumbnail && thumbnail.startsWith('/')) {
          thumbnail = `${BASE_URL}${thumbnail}`;
        }

        if (title && url) {
          results.push({
            id: url.split('/').filter(Boolean).pop(),
            title,
            url,
            thumbnail
          });
        }
      });

      return {
        status: true,
        data: results.slice(0, 16)
      };
    }

    if (input.mode === 'search') {
      if (!input.query) throw new Error('Search query is required');
      
      const res = await axios.post(
        `${BASE_URL}/wp-admin/admin-ajax.php`,
        `action=ts_ac_do_search&ts_ac_query=${encodeURIComponent(input.query)}`,
        { 
          headers: { 
            'Content-Type': 'application/x-www-form-urlencoded', 
            'X-Requested-With': 'XMLHttpRequest',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          } 
        }
      );

      // movieku returns an array of categories, we want the "all" results from the first one
      const results = res.data.post?.[0]?.all || [];
      return {
        status: true,
        data: results.map((m: any) => ({
          id: m.ID,
          title: m.post_title,
          url: m.post_link,
          thumbnail: m.post_image,
        }))
      };
    }

    if (input.mode === 'detail') {
      if (!input.url) throw new Error('Movie URL is required');
      
      const res = await axios.get(input.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      const $ = cheerio.load(res.data);

      const title = $('h1').first().text().trim();
      const synopsis = $('.entry-content p').first().text().trim();
      
      // Improved poster selection
      const posterImg = $('.post-thumbnail img, .thumb img, img[src*="wp-content/uploads"]').first();
      let poster = posterImg.attr('data-src') || posterImg.attr('src') || null;
      
      if (poster && poster.startsWith('/')) {
        poster = `${BASE_URL}${poster}`;
      }

      const detail: any = {};
      $('ul li').each((_, el) => {
        const text = $(el).text().trim();
        if (text.startsWith('Genre:')) detail.genre = $(el).find('a').map((_, a) => $(a).text()).get().join(', ');
        if (text.startsWith('Release:')) detail.release = text.replace('Release:', '').trim();
        if (text.startsWith('Duration:')) detail.duration = text.replace('Duration:', '').trim();
        if (text.startsWith('Director:')) detail.director = $(el).find('a').first().text().trim();
        if (text.startsWith('Country:')) detail.country = $(el).find('a').first().text().trim();
        if (text.startsWith('Quality:')) detail.quality = text.replace('Quality:', '').trim();
        if (text.startsWith('Score:')) detail.score = text.replace('Score:', '').trim();
        if (text.startsWith('Rating:')) detail.rating = text.replace('Rating:', '').trim();
        if (text.startsWith('Stars:')) detail.stars = $(el).find('a').map((_, a) => $(a).text()).get().join(', ');
      });

      const stream = $('a[href*="abyssplayer"]').first().attr('href') || null;

      const downloads: any = {};
      $('strong').each((_, el) => {
        const label = $(el).text().trim();
        if (['1080p', '720p', '480p', '360p'].includes(label)) {
          downloads[label] = [];
          $(el).parent().find('a').each((_, a) => {
            downloads[label].push({
              name: $(a).text().trim(),
              url: $(a).attr('href')
            });
          });
        }
      });

      return { 
        status: true, 
        data: { title, poster, synopsis, ...detail, stream, downloads } 
      };
    }

    throw new Error('Invalid mode');
  } catch (error: any) {
    console.error('Movieku Action Error:', error.message);
    return { status: false, error: error.message };
  }
}
