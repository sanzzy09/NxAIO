'use server';

import axios from 'axios';

/**
 * Server action to handle media transcription via FreeScribe.
 * Supports social media links (TikTok, YouTube, IG) and direct audio URLs.
 */
export async function transcribeMedia(url: string, language: string = "auto") {
  const BASE_URL = "https://freescribe.app";
  const visitorId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  const HEADERS = {
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    Origin: BASE_URL,
    Referer: `${BASE_URL}/`,
  };

  try {
    // 1. Fetch Video Info
    const infoRes = await axios.post(
      `${BASE_URL}/api/video-info`, 
      { url, language }, 
      { headers: HEADERS, timeout: 20000 }
    );

    // 2. Fetch Transcript
    const transcriptRes = await axios.post(
      `${BASE_URL}/api/transcript`, 
      { url, language, visitorId }, 
      { headers: HEADERS, timeout: 45000 }
    );

    if (!transcriptRes.data || !transcriptRes.data.segments) {
      throw new Error("No transcription segments found for this content.");
    }

    return {
      status: true,
      data: {
        platform: infoRes.data.platform || "unknown",
        segments: transcriptRes.data.segments.map((s: any) => ({
          text: s.text,
          start: s.start,
          end: s.end
        })),
        fullText: transcriptRes.data.segments.map((s: any) => s.text).join(" "),
        language: language === "auto" ? "Detected" : language.toUpperCase()
      }
    };
  } catch (error: any) {
    console.error('Transcribe Action Error:', error.message);
    return {
      status: false,
      error: error.response?.data?.message || error.message || "Failed to process transcription."
    };
  }
}
