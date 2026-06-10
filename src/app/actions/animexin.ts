'use server';

import axios from 'axios';

/**
 * Server action to fetch anime data from the AnimeXin API.
 * Supports two modes: 
 * 1. Search: { query: string }
 * 2. Detail: { url: string }
 */
export async function fetchAnimeXin(input: { query?: string; url?: string }) {
  const API = "https://api.rifkyshre.biz.id";
  const ROUTE = "/scrape/animexin";

  try {
    const res = await axios.post(
      `${API}${ROUTE}`,
      input,
      {
        timeout: 60000,
        validateStatus: () => true,
        headers: {
          "Content-Type": "application/json",
          "Origin": "https://code.rifkyshre.biz.id",
          "Referer": "https://code.rifkyshre.biz.id/",
        },
      }
    );

    return res.data;
  } catch (error: any) {
    console.error('AnimeXin Server Action Error:', error.message);
    return {
      status: false,
      error: error.message || "The anime service is currently unreachable."
    };
  }
}
