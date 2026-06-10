'use server';

import axios from 'axios';
import * as cheerio from 'cheerio';

const BASE_URL = "https://nimegami.id/";
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

async function fetchHtml(url: string) {
  const { data } = await axios.get(url, { headers: HEADERS, timeout: 15000 });
  return data;
}

function parseArchiveList($: cheerio.CheerioAPI) {
  const results: any[] = [];
  $('.archive article').each((_, element) => {
    const title = $(element).find('h2[itemprop="name"] a').text().trim();
    const link = $(element).find('h2[itemprop="name"] a').attr('href');
    const thumbnail = $(element).find('.thumbnail img').attr('src');
    const ratingText = $(element).find('.rating-archive').text().trim();
    const rating = parseFloat(ratingText) || null;
    const episodeText = $(element).find('.eps-archive').text().trim();
    const lastEpisode = episodeText.replace('Ep.', '').trim();
    const status = $(element).find('.term_tag-a a').text().trim();
    const types: string[] = [];
    $(element).find('.terms_tag a').each((_, el) => {
      const tagText = $(el).text().trim();
      if (tagText !== 'BD') types.push(tagText);
    });
    if (title && link) results.push({ title, link, thumbnail, rating, lastEpisode, status, types });
  });
  return results;
}

export async function fetchNimegami(input: { mode: string; url?: string; page?: number; query?: string }) {
  try {
    const { mode, url, page = 1, query } = input;

    if (mode === 'home') {
      const target = page === 1 ? BASE_URL : `${BASE_URL}page/${page}/`;
      const html = await fetchHtml(target);
      const $ = cheerio.load(html);
      
      const updateAnime: any[] = [];
      $('.post-article article').each((_, element) => {
        const title = $(element).find('.info h2[itemprop="name"] a').text().trim();
        const link = $(element).find('.info h2[itemprop="name"] a').attr('href');
        const thumbnail = $(element).find('.thumb img').attr('src');
        const rating = $(element).find('.info .rating').text().trim();
        
        let postedOn = '';
        const category: string[] = [];
        let episodes = '';
        let studio = '';

        $(element).find('.info ul li').each((_, li) => {
          const text = $(li).text();
          if (text.includes('Posted on:')) postedOn = text.replace('Posted on:', '').trim();
          else if (text.includes('Category:')) {
            $(li).find('a').each((_, a) => { category.push($(a).text().trim()); });
          }
          else if (text.includes('Episode:')) episodes = text.replace('Episode:', '').trim();
          else if (text.includes('Studio:')) studio = text.replace('Studio:', '').trim().replace(/,$/, '');
        });

        if (title && link) updateAnime.push({ title, link, thumbnail, rating, postedOn, category, episodes, studio });
      });

      const recommendedAnime: any[] = [];
      $('.wrapper-2-a article').each((_, element) => {
        const title = $(element).find('.title-post2').text().trim();
        const link = $(element).find('a').attr('href');
        const thumbnail = $(element).find('.thumb img').attr('src');
        const category = $(element).find('.post-2-cat a').text().trim();
        if (title && link) recommendedAnime.push({ title, link, thumbnail, category });
      });

      return { status: true, data: { updateAnime, recommendedAnime, page } };
    }

    if (mode === 'latest') {
      const html = await fetchHtml(`${BASE_URL}anime-terbaru-sub-indo/`);
      const $ = cheerio.load(html);
      const schedule: any[] = [];

      $('.wrapper-3.post-3').each((_, element) => {
        const day = $(element).find('.title-a .title').text().replace(/[^a-zA-Z\s]/g, '').trim();
        const animeList: any[] = [];
        $(element).find('.wrapper-3-a article').each((_, article) => {
          const title = $(article).find('h3 a').text().trim();
          const link = $(article).find('h3 a').attr('href');
          const thumbnail = $(article).find('.thumb img').attr('src');
          const episode = $(article).find('.eps_ongo').text().trim();
          if (title && link) animeList.push({ title, link, thumbnail, episode });
        });
        if (day && animeList.length > 0) schedule.push({ day, animeList });
      });

      return { status: true, data: schedule };
    }

    if (mode === 'search') {
      const html = await fetchHtml(`${BASE_URL}?s=${encodeURIComponent(query || "")}`);
      const $ = cheerio.load(html);
      return { status: true, data: parseArchiveList($) };
    }

    if (mode === 'archive') {
      const target = page === 1 ? `${BASE_URL}tag/bd/` : `${BASE_URL}tag/bd/page/${page}/`;
      const html = await fetchHtml(target);
      const $ = cheerio.load(html);
      return { status: true, data: parseArchiveList($) };
    }

    if (mode === 'detail') {
      const html = await fetchHtml(url!);
      const $ = cheerio.load(html);

      const title = $('.single h1.title').text().trim();
      const thumbnail = $('.single .thumbnail img').attr('src');
      const synopsis = $('#Sinopsis p').text().trim();

      const info: any = {};
      $('.info2 table tr').each((_, element) => {
        const key = $(element).find('.tablex').text().replace(':', '').trim();
        const value = $(element).find('td').last().text().trim();
        if (key && value) info[key.toLowerCase().replace(/\s+/g, '_')] = value;
      });

      const downloads: any[] = [];
      $('.download_box .download h4').each((_, element) => {
        const episodeTitle = $(element).text().trim();
        const resolutionGroups: any = {};

        let nextUl = $(element).next('ul');
        nextUl.find('li').each((_, li) => {
          const resolution = $(li).find('strong').text().trim();
          const links: any[] = [];
          $(li).find('a').each((_, a) => {
            const host = $(a).text().trim();
            const link = $(a).attr('href');
            if (link) links.push({ host, link });
          });
          if (resolution && links.length > 0) resolutionGroups[resolution] = links;
        });

        if (episodeTitle) downloads.push({ episode: episodeTitle, resolutions: resolutionGroups });
      });

      return { status: true, data: { title, thumbnail, synopsis, info, downloads } };
    }

    return { status: false, error: 'Invalid mode' };
  } catch (error: any) {
    console.error('Nimegami Action Error:', error.message);
    return { status: false, error: error.message };
  }
}
