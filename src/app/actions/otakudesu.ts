'use server';

import axios from 'axios';

/**
 * Server action to fetch data from the Otakudesu API.
 * Supports multiple modes: search, detail, episode, home, ongoing, completed, etc.
 */
export async function fetchOtakudesu(input: any) {
  const API = "https://api.rifkyshre.biz.id";
  const ROUTE = "/scrape/otakudesu";

  let payload;
  if (typeof input === "string") {
    payload = /^https?:\/\/otakudesu\./i.test(input)
      ? { url: input }
      : { query: input };
  } else {
    payload = input;
  }

  try {
    const res = await axios.post(
      `${API}${ROUTE}`,
      payload,
      {
        timeout: 45000,
        validateStatus: () => true,
        headers: { "Content-Type": "application/json" },
      }
    );

    return res.data;
  } catch (error: any) {
    console.error('Otakudesu Server Action Error:', error.message);
    return {
      status: false,
      error: error.message || "The Otakudesu service is currently unreachable."
    };
  }
}
