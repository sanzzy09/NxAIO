'use server';

import axios from 'axios';
import * as cheerio from 'cheerio';
import { URL } from 'url';

const BASE_URL = "https://anichin.moe";
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

function buildHeaders(extra = {}) {
  return {
    "User-Agent": USER_AGENT,
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br",
    Connection: "keep-alive",
    ...extra,
  };
}

function resolveUrl(slug: string) {
  if (!slug || slug === "") return BASE_URL;
  if (slug.startsWith("http")) return slug;
  if (slug.startsWith("/")) return `${BASE_URL}${slug}`;
  return `${BASE_URL}/${slug}`;
}

function extractSlug(href: string) {
  try {
    const parts = new URL(href, BASE_URL).pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || parts[parts.length - 2] || "";
  } catch {
    return href.split("/").filter(Boolean).pop() || "";
  }
}

function parseCards($: cheerio.CheerioAPI, wrapper: string) {
  const cards: any[] = [];
  $(wrapper).find("article").each((_, article) => {
    const ttDiv = $(article).find("div.tt");
    const h2 = ttDiv.length ? ttDiv.find("h2") : $(article).find("h2");
    
    const headline = h2.text().trim();
    const title = ttDiv.length ? ttDiv.text().replace(headline, "").trim() || headline : headline;
    
    const type = $(article).find("div.typez").text().trim() || "Unknown";
    const status = $(article).find("span.epx").text().trim() || "Unknown";
    
    const img = $(article).find("img").first();
    const thumbnail = img.attr("data-lazy-src") || img.attr("data-src") || img.attr("src") || "";
    
    const a = $(article).find("a").first();
    if (!a.length) return;
    
    const slug = extractSlug(a.attr("href") || "");
    if (!slug) return;
    
    cards.push({ title, type, headline, status, thumbnail, slug });
  });
  return cards;
}

function parseInfoDetails($: cheerio.CheerioAPI) {
  const info: any = {};
  $("div.info-content div.spe span, div.spe span").each((_, span) => {
    const text = $(span).text().trim();
    const idx = text.indexOf(":");
    if (idx !== -1) {
      const key = text.slice(0, idx).trim().toLowerCase().replace(/\s+/g, "_");
      const val = text.slice(idx + 1).trim();
      if (key && val) info[key] = val;
    }
  });
  return info;
}

export async function fetchAnichin(input: { mode: string; query?: string; slug?: string; page?: number }) {
  try {
    const { mode, query, slug, page = 1 } = input;

    if (mode === 'home') {
      const url = page > 1 ? `${BASE_URL}/page/${page}/` : BASE_URL;
      const res = await axios.get(url, { headers: buildHeaders(), timeout: 15000 });
      const $ = cheerio.load(res.data);
      const sections: any[] = [];
      
      $("div.bixbox, div.listupd").each((_, section) => {
        const sectionEl = $(section).find("div.releases, h2, h3").first();
        const sectionName = sectionEl.length
          ? sectionEl.text().trim().toLowerCase().replace(/\s+/g, "_")
          : "latest_updates";
          
        const cards = parseCards($, section as any);
        if (cards.length) sections.push({ section: sectionName, cards });
      });
      
      return { status: true, data: { results: sections, page } };
    }

    if (mode === 'search') {
      const url = `${BASE_URL}/?s=${encodeURIComponent(query!)}`;
      const res = await axios.get(url, { headers: buildHeaders(), timeout: 15000 });
      const $ = cheerio.load(res.data);
      const cards = parseCards($, "div.bixbox, div.listupd");
      return { status: true, data: { results: cards, query } };
    }

    if (mode === 'list') {
      const url = page > 1 ? `${BASE_URL}/anime/page/${page}/` : `${BASE_URL}/anime`;
      const res = await axios.get(url, { headers: buildHeaders(), timeout: 15000 });
      const $ = cheerio.load(res.data);
      const cards = parseCards($, "div.bixbox, div.listupd");
      return { status: true, data: { results: cards, page } };
    }

    if (mode === 'detail') {
      const url = resolveUrl(slug!);
      const res = await axios.get(url, { headers: buildHeaders(), timeout: 15000 });
      const $ = cheerio.load(res.data);
      
      const name = $("h1.entry-title").first().text().trim() || 
                   $("div.infox h1").first().text().trim() || 
                   "Unknown Title";
                   
      const thumbImg = $("div.thumb img, div.poster img").first();
      const thumbnail = thumbImg.attr("data-lazy-src") || thumbImg.attr("data-src") || thumbImg.attr("src") || "";
      
      const genres: string[] = [];
      $("div.genxed a, .genre-info a").each((_, a) => { 
        const g = $(a).text().trim(); 
        if (g) genres.push(g); 
      });
      
      const infoDetails = parseInfoDetails($);
      
      let rating = null;
      const ratingEl = $("div.rating strong, .numscore").first();
      if (ratingEl.length) {
        rating = ratingEl.text().replace(/Rating|/gi, "").trim();
      }
      
      const synDiv = $("div.entry-content[itemprop='description'], .entry-content, .sinopsis");
      const paragraphs: string[] = [];
      synDiv.find("p").each((_, p) => { 
        const t = $(p).text().trim(); 
        if (t) paragraphs.push(t); 
      });
      
      const episodes: any[] = [];
      $("div.eplister ul li, .eplister li").each((_, li) => {
        const a = $(li).find("a").first();
        if (!a.length || !a.attr("href")) return;
        const epSlug = extractSlug(a.attr("href") || "");
        const subtitle = $(li).find("div.epl-title, .epl-title").text().trim() || "Episode";
        const date = $(li).find("div.epl-date, .epl-date").text().trim() || "Unknown Date";
        const episode = $(li).find("div.epl-num, .epl-num").text().trim() || null;
        episodes.push({ slug: epSlug, subtitle, date, episode, thumbnail });
      });

      return {
        status: true,
        data: { ...infoDetails, name, thumbnail, genre: genres, rating, synopsis: { paragraphs }, episodes }
      };
    }

    if (mode === 'watch') {
      const url = resolveUrl(slug!);
      const res = await axios.get(url, { headers: buildHeaders(), timeout: 15000 });
      const $ = cheerio.load(res.data);
      
      const name = $("h2[itemprop='partOfSeries']").text().trim() || 
                   $(".breadcrumb a").last().text().trim() || 
                   "Unknown Episode";
      const title = $("h1.entry-title").text().trim();
      
      let rootSlug = "unknown";
      const bc = $("div.ts-breadcrumb li, .breadcrumb li");
      if (bc.length > 1) {
        const a = bc.eq(1).find("a").first();
        if (a.length) rootSlug = extractSlug(a.attr("href") || "");
      }
      
      const thumbEl = $("div.thumbnail img, div.thumb img").first();
      const thumbnail = thumbEl.attr("data-lazy-src") || thumbEl.attr("data-src") || thumbEl.attr("src") || null;
      
      const servers: any[] = [];
      $("select.mirror option, .mirror option").each((_, opt) => {
        const label = $(opt).text().trim();
        const rawValue = $(opt).attr("value") || "";
        if (!rawValue || label.includes("Select")) return;
        
        let embedUrl = null;
        try {
          const decoded = Buffer.from(rawValue, "base64").toString("utf-8");
          const $dec = cheerio.load(decoded);
          embedUrl = $dec("iframe").attr("src") || null;
        } catch { 
          if (rawValue.includes("<iframe")) {
            const $dec = cheerio.load(rawValue);
            embedUrl = $dec("iframe").attr("src") || null;
          }
        }
        
        if (embedUrl) {
          if (embedUrl.startsWith("//")) embedUrl = "https:" + embedUrl;
          servers.push({ label, embedUrl });
        }
      });
      
      const downloads: any[] = [];
      $("div.soraurlx, .download-links").each((_, row) => {
        const quality = $(row).find("strong, b").first().text().trim() || "Unknown";
        const links: any[] = [];
        $(row).find("a").each((_, a) => { 
          links.push({ host: $(a).text().trim(), url: $(a).attr("href") || "" }); 
        });
        if (links.length) downloads.push({ quality, links });
      });
      
      const prevA = $("div.naveps a.prev, a[rel='prev']").first();
      const nextA = $("div.naveps a.next, a[rel='next']").first();
      
      return {
        status: true,
        data: {
          name, title, rootSlug, thumbnail, servers, downloads,
          navigation: {
            prev: prevA.length ? extractSlug(prevA.attr("href") || "") : null,
            next: nextA.length ? extractSlug(nextA.attr("href") || "") : null,
          },
        }
      };
    }

    if (mode === 'genres') {
      const url = `${BASE_URL}/anime`;
      const res = await axios.get(url, { headers: buildHeaders(), timeout: 15000 });
      const $ = cheerio.load(res.data);
      const genres: any[] = [];
      $("input[name='genre[]'], .genrelist a").each((_, input) => {
        const value = $(input).attr("value") || $(input).text().trim();
        if (!value) return;
        const name = value.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
        genres.push({ name, slug: value.toLowerCase().replace(/\s+/g, "-") });
      });
      return { status: true, data: genres };
    }

    return { status: false, error: 'Invalid mode' };
  } catch (error: any) {
    console.error('Anichin Action Error:', error.message);
    return { status: false, error: error.message };
  }
}
