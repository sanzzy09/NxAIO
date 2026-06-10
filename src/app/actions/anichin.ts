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
    if (!ttDiv.length) return;
    const h2 = ttDiv.find("h2");
    const headline = h2.text().trim();
    h2.remove();
    const title = ttDiv.text().trim() || headline;
    const type = $(article).find("div.typez").text().trim() || "Unknown";
    const status = $(article).find("span.epx").text().trim() || "Unknown";
    const img = $(article).find("img[src]").first();
    const thumbnail = img.attr("data-lazy-src") || img.attr("src") || "";
    const a = $(article).find("a[title]").first();
    if (!a.length) return;
    const slug = extractSlug(a.attr("href") || "");
    if (!slug) return;
    cards.push({ title, type, headline, status, thumbnail, slug });
  });
  return cards;
}

function parseInfoDetails($: cheerio.CheerioAPI) {
  const info: any = {};
  $("div.info-content div.spe span").each((_, span) => {
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
      
      $("div.bixbox.bbnofrm").each((_, section) => {
        const sectionEl = $(section).find("div.releases").children().first();
        const sectionName = sectionEl.length
          ? sectionEl.text().trim().toLowerCase().replace(/\s+/g, "_")
          : "unknown";
        const cards: any[] = [];
        $(section).find("article").each((_, article) => {
          const a = $(article).find("a[href]").first();
          if (!a.length) return;
          const href = a.attr("href") || "";
          let title = a.attr("title") || "";
          if (!title) {
            const ttDiv = $(article).find("div.tt");
            title = ttDiv.find("h2").text().trim() || ttDiv.text().trim();
          }
          if (!title || title.length < 2) return;
          const headline = $(article).find("h2").text().trim() || title;
          const type = $(article).find("[class*='typez']").text().trim() || "Unknown";
          const epsText = $(article).find("span.epx").text().replace(/\D/g, "");
          const eps = epsText ? parseInt(epsText) : null;
          const img = $(article).find("img[src]").first();
          const thumbnail = img.attr("data-lazy-src") || img.attr("src") || "";
          const slug = extractSlug(href);
          if (!slug) return;
          cards.push({ title, type, headline, eps, thumbnail, slug });
        });
        if (cards.length) sections.push({ section: sectionName, cards });
      });
      return { status: true, data: { results: sections, page } };
    }

    if (mode === 'search') {
      const url = `${BASE_URL}/?s=${encodeURIComponent(query!)}`;
      const res = await axios.get(url, { headers: buildHeaders(), timeout: 15000 });
      const $ = cheerio.load(res.data);
      const cards = parseCards($, "div.bixbox div.listupd");
      return { status: true, data: { results: cards, query } };
    }

    if (mode === 'list') {
      const url = page > 1 ? `${BASE_URL}/anime/page/${page}/` : `${BASE_URL}/anime`;
      const res = await axios.get(url, { headers: buildHeaders(), timeout: 15000 });
      const $ = cheerio.load(res.data);
      const cards = parseCards($, "div.bixbox div.listupd");
      return { status: true, data: { results: cards, page } };
    }

    if (mode === 'detail') {
      const url = resolveUrl(slug!);
      const res = await axios.get(url, { headers: buildHeaders(), timeout: 15000 });
      const $ = cheerio.load(res.data);
      
      const name = $("div.infox h1.entry-title[itemprop='name']").text().trim() || "Unknown Title";
      const thumbImg = $("div.thumb img").first();
      const thumbnail = thumbImg.attr("data-lazy-src") || thumbImg.attr("src") || "";
      
      const genres: string[] = [];
      $("div.genxed a").each((_, a) => { const g = $(a).text().trim(); if (g) genres.push(g); });
      
      const infoDetails = parseInfoDetails($);
      
      let rating = null;
      const ratingStrong = $("div.rating strong").first();
      if (ratingStrong.length) {
        const parts = ratingStrong.text().trim().split(/\s+/);
        rating = parts[1] || parts[0] || null;
      } else {
        const ns = $("div.rating div.numscore").first();
        if (ns.length) rating = ns.text().trim();
      }
      
      const synDiv = $("div.entry-content[itemprop='description']");
      const paragraphs: string[] = [];
      synDiv.find("p").each((_, p) => { const t = $(p).text().trim(); if (t) paragraphs.push(t); });
      
      const episodes: any[] = [];
      $("div.eplister ul li").each((_, li) => {
        const a = $(li).find("a").first();
        if (!a.length || !a.attr("href")) return;
        const epSlug = extractSlug(a.attr("href") || "");
        const subtitle = $(li).find("div.epl-title").text().trim() || "Unknown";
        const date = $(li).find("div.epl-date").text().trim() || "Unknown Date";
        const episode = $(li).find("div.epl-num").text().trim() || null;
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
      
      const name = $("h2[itemprop='partOfSeries']").text().trim() || "Unknown Episode";
      const title = $("h1.entry-title").text().trim();
      
      let rootSlug = "unknown";
      const bc = $("div.ts-breadcrumb li");
      if (bc.length > 1) {
        const a = bc.eq(1).find("a").first();
        if (a.length) rootSlug = extractSlug(a.attr("href") || "");
      }
      
      const thumbEl = $("div.thumbnail img").first().length ? $("div.thumbnail img").first() : $("div.thumb img").first();
      const thumbnail = thumbEl.attr("data-lazy-src") || thumbEl.attr("src") || null;
      
      const servers: any[] = [];
      $("select.mirror option").each((_, opt) => {
        const label = $(opt).text().trim();
        const rawValue = $(opt).attr("value") || "";
        if (!rawValue || label === "Select Video Server") return;
        
        let embedUrl = null;
        try {
          const decoded = Buffer.from(rawValue, "base64").toString("utf-8");
          const $dec = cheerio.load(decoded);
          embedUrl = $dec("iframe").attr("src") || null;
        } catch { }
        
        if (embedUrl) {
          if (embedUrl.startsWith("//")) embedUrl = "https:" + embedUrl;
          servers.push({ label, embedUrl });
        }
      });
      
      const downloads: any[] = [];
      $("div.soraurlx").each((_, row) => {
        const quality = $(row).find("strong").text().trim() || "Unknown";
        const links: any[] = [];
        $(row).find("a").each((_, a) => { links.push({ host: $(a).text().trim(), url: $(a).attr("href") || "" }); });
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
      $("input[name='genre[]'][value]").each((_, input) => {
        const value = $(input).attr("value") || "";
        if (!value) return;
        const name = value.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
        genres.push({ name, slug: value });
      });
      return { status: true, data: genres };
    }

    if (mode === 'genre_browse') {
      const url = `${BASE_URL}/anime?genre[]=${slug}${page > 1 ? `&page=${page}` : ''}`;
      const res = await axios.get(url, { headers: buildHeaders(), timeout: 15000 });
      const $ = cheerio.load(res.data);
      const cards = parseCards($, "div.bixbox div.listupd");
      return { status: true, data: { results: cards, page } };
    }

    return { status: false, error: 'Invalid mode' };
  } catch (error: any) {
    console.error('Anichin Action Error:', error.message);
    return { status: false, error: error.message };
  }
}
