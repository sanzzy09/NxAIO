'use server';

import axios from 'axios';

/**
 * Server action to fetch media content from the SnapVideo API.
 * This bypasses browser CORS restrictions by performing the request server-side.
 */
export async function fetchSnapVideo(url: string) {
  const API = "https://api.rifkyshre.biz.id";
  const ROUTE = "/scrape/snapvideo";

  try {
    const res = await axios.post(
      `${API}${ROUTE}`,
      { url },
      {
        timeout: 45000,
        validateStatus: () => true,
        headers: { "Content-Type": "application/json" },
      }
    );

    return res.data;
  } catch (error: any) {
    console.error('SnapVideo Server Action Error:', error.message);
    return {
      status: false,
      error: error.message || "The downloader service is currently unreachable."
    };
  }
}
