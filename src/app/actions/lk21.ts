'use server';

import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * LayarKaca21 wrapper based on Shanvyr logic
 * Base: https://bridgestoabrighterfuture.org
 */

const BASE = "https://bridgestoabrighterfuture.org";

const ADULT_GENRES = new Set([
  "jav", "film-semi", "film-semi-barat", "film-semi-jepang",
  "semi-jepang", "film-semi-korea", "semi-korea", "film-semi-philippines",
  "xtube", "none",
]);

const ADULT_PATTERN = /\b(jav|bokep|xxx|18\+|dewasa|porno|indoviral|film semi)\b/i;

function isAdult(title = "", genres: string[] = []) {
  if (ADULT_PATTERN.test(title)) return true;
  return genres.some(g => ADULT_GENRES.has(g.toLowerCase().replace(/\s+/g, "-")));
}

function parseMovieCard($, el) {
  const $el = $(el);
  const title = $el.find(".entry-title a").text().trim();
  const url = $el.find(".entry-title a").attr("href") || "";
  const slug = url.replace(BASE, "").replace(/\//g, "");
  const thumb = $el.find(".content-thumbnail img").attr("src") || "";
  const rating = $el.find(".gmr-rating-item").text().replace(/[^\d.]/g, "").trim();
  const duration = $el.find(".gmr-duration-item").text().replace(/[^\d\s]/g, "").trim();
  const trailer = $el.find(".gmr-trailer-popup").attr("href") || "";
  
  const genres: string[] = [];
  const countries: string[] = [];
  
  $el.find(".gmr-movie-on a").each((_, a) => {
    const href = $(a).attr("href") || "";
    if (href.includes("/country/")) countries.push($(a).text().trim());
    else genres.push($(a).text().trim());
  });

  return { title, slug, url, thumb, rating, duration, genres, countries, trailer };
}

export async function fetchLk21(input: { 
  mode: string; 
  query?: string; 
  slug?: string; 
  page?: number; 
  country?: string; 
  adult?: boolean 
}) {
  try {
    const { mode, query, slug, page = 1, country = "indonesia", adult = false } = input;
    const filterAdult = !adult;

    const headers = {
      "User-Agent": "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/124 Safari/537.36",
      "Accept-Language": "id-ID,id;q=0.9",
      Referer: BASE,
    };

    if (mode === 'home') {
      const path = country ? `/country/${country}` : "";
      const targetUrl = page > 1 ? `${BASE}${path}/page/${page}/` : `${BASE}${path || "/"}/`;
      
      const res = await axios.get(targetUrl, { headers, timeout: 15000 });
      const $ = cheerio.load(res.data);
      const movies: any[] = [];

      $("#gmr-main-load article, .gmr-grid article").each((_, el) => {
        const movie = parseMovieCard($, el);
        if (filterAdult && isAdult(movie.title, movie.genres)) return;
        movies.push(movie);
      });

      return { status: true, data: movies };
    }

    if (mode === 'search') {
      const params: any = { s: query, search: "advanced", post_type: "movie" };
      if (page > 1) params.paged = page;
      
      const res = await axios.get(BASE, { params, headers, timeout: 15000 });
      const $ = cheerio.load(res.data);
      const movies: any[] = [];

      $("#gmr-main-load article, .gmr-grid article, #primary article").each((_, el) => {
        const movie = parseMovieCard($, el);
        if (filterAdult && isAdult(movie.title, movie.genres)) return;
        movies.push(movie);
      });

      return { status: true, data: movies };
    }

    if (mode === 'detail') {
      const path = slug!.startsWith("http") ? slug!.replace(BASE, "") : `/${slug}/`;
      const res = await axios.get(`${BASE}${path}`, { headers, timeout: 15000 });
      const $ = cheerio.load(res.data);
      
      const title = $(".entry-title[itemprop='name'], h1.entry-title").first().text().trim();
      const thumb = $(".gmr-movie-data img").first().attr("src") || "";
      const synopsis = $(".entry-content-single p").first().text().trim();
      const rating = $("[itemprop='ratingValue']").text().trim();
      const votes = $("[itemprop='ratingCount']").text().trim();
      const trailer = $(".gmr-trailer-popup").attr("href") || "";
      const embed = $(".gmr-embed-responsive iframe, .gmr-pagi-player iframe").first().attr("src") || "";

      const meta: any = {};
      $(".gmr-moviedata").each((_, el) => {
        const rawKey = $(el).find("strong").text().replace(":", "").trim();
        const key = rawKey.toLowerCase();
        const val = $(el).text().replace(rawKey, "").replace(":", "").trim();
        if (key && val) meta[key] = val;
      });

      const genres: string[] = [];
      $(".gmr-moviedata a[rel='category tag']").each((_, a) => {
        const href = $(a).attr("href") || "";
        if (!href.includes("/country/")) genres.push($(a).text().trim());
      });

      const cast: string[] = [];
      $("[itemprop='actors'] [itemprop='name']").each((_, el) => cast.push($(el).text().trim()));

      const servers: any[] = [];
      $(".muvipro-player-tabs a").each((_, a) => {
        servers.push({ label: $(a).text().trim(), url: $(a).attr("href") || "" });
      });

      if (filterAdult && isAdult(title, genres)) {
        return { status: false, error: "This content is restricted." };
      }

      return { 
        status: true, 
        data: { 
          title, 
          thumb, 
          synopsis, 
          rating, 
          votes, 
          trailer, 
          embed, 
          servers, 
          cast, 
          meta, 
          genres 
        } 
      };
    }

    return { status: false, error: 'Invalid mode' };
  } catch (error: any) {
    console.error('LK21 Action Error:', error.message);
    return { status: false, error: error.message };
  }
}
