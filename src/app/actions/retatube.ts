'use server';

import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * @fileOverview Retatube AIO Downloader Action.
 * Based on logic by ShanMolvyr.
 * Interfaces with retatube.com API for high-fidelity media extraction.
 */

const BASE_URL = "https://retatube.com";
const PREFIX = "retatube.com";

const HEADERS = {
  "Content-Type": "application/json",
  "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36",
  Referer: "https://retatube.com/",
  Origin: "https://retatube.com",
};

export async function fetchRetatube(url: string) {
  try {
    const res = await axios.post(
      `${BASE_URL}/api/v1/aio/html`,
      { vid: url, prefix: PREFIX, ex: "", format: "" },
      { headers: HEADERS, timeout: 30000 }
    );

    const $ = cheerio.load(res.data);
    const section = $(".download-section");
    
    if (!section.length) {
      throw new Error("No download results found. Please check the URL or try again later.");
    }

    const title = section.find("h3").text().trim() || section.find(".wrap-break-word").text().trim() || "Untitled Media";
    
    let owner = null;
    const ownerEl = section.find("p strong").parent();
    if (ownerEl.length) {
      owner = ownerEl.text().replace("Owner:", "").trim();
    }

    const thumbnail = section.find("img").attr("src") || null;

    const downloads: any[] = [];
    section.find("a.download-btn").each((_, el) => {
      const href = $(el).attr("href");
      const label = $(el).text().trim();
      if (href && !href.startsWith("#")) {
        downloads.push({ label, url: href });
      }
    });

    return { 
      status: true, 
      data: { 
        credit: "ShanMolvyr",
        source: url, 
        title, 
        owner, 
        thumbnail, 
        downloads 
      } 
    };
  } catch (error: any) {
    console.error('Retatube Action Error:', error.message);
    return { 
      status: false, 
      error: error.message || "The downloader service encountered an orchestration error." 
    };
  }
}
