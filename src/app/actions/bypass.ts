'use server';

import axios from 'axios';

/**
 * Server action to bypass adlinks using the izen.lol API.
 * Uses an external solver for Cloudflare Turnstile.
 */
export async function bypassAdlink(url: string) {
  const SOLVER = "https://cf-solver-renofc.my.id/api/solvebeta";
  const IZEN = "https://izen.lol/api/bypass";
  const TARGET = "https://izen.lol";
  const SITEKEY = "0x4AAAAAADNEi_2N24gpQqY0";

  try {
    // 1. Solve Captcha
    const solverRes = await axios.post(SOLVER, { 
      mode: "turnstile-min", 
      url: TARGET, 
      siteKey: SITEKEY 
    }, { timeout: 45000 });

    const captchaToken = solverRes.data?.token?.result?.token;
    if (!captchaToken) {
      throw new Error("Failed to solve security challenge. The bypass service may be temporarily busy.");
    }

    // 2. Bypass URL
    const res = await axios.post(IZEN, { url, captchaToken }, {
      headers: {
        "Content-Type": "application/json",
        "Referer": "https://izen.lol/",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36",
      },
      timeout: 30000
    });

    if (!res.data || res.status !== 200) {
      throw new Error("Bypass failed or service returned invalid data.");
    }

    return {
      status: true,
      data: res.data
    };
  } catch (error: any) {
    console.error('Bypass Action Error:', error.message);
    return {
      status: false,
      error: error.response?.data?.message || error.message || "The bypass service is currently unreachable."
    };
  }
}
