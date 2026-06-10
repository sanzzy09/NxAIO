'use server';

import crypto from 'crypto';

const API = "https://remusic.ai/api/v1/ai-music/music";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0";

const freshGa = () => `GA1.1.${Math.floor(Math.random() * 9e9 + 1e9)}.${Math.floor(Date.now() / 1000)}`;
const randIP = () => Array.from({ length: 4 }, () => 1 + Math.floor(Math.random() * 254)).join(".");

function getHeaders() {
  return {
    "accept": "application/json, text/plain, */*",
    "content-type": "application/json",
    "origin": "https://remusic.ai",
    "referer": "https://remusic.ai/ai-music-generator",
    "user-agent": UA,
    "cookie": `_ga=${freshGa()}; anonymous_user_id=${crypto.randomUUID()}`,
    "x-forwarded-for": randIP()
  };
}

export async function createMusicJob(input: {
  prompt: string;
  styles?: string[];
  title?: string;
  lyrics?: string;
  mode: 'simple' | 'custom';
}) {
  try {
    const { prompt, styles = [], title, lyrics, mode } = input;
    const tags = styles.filter(Boolean).join(", ");
    
    const body = mode === 'custom'
      ? { 
          mode: 2, 
          supplier: 10, 
          mv: "v4", 
          is_instrumental: false, 
          is_public: true, 
          prompt: String(prompt || tags || title), 
          title: title || "Untitled Track", 
          tags, 
          lyrics: lyrics || "" 
        }
      : { 
          mode: 1, 
          supplier: 10, 
          mv: "v4", 
          is_instrumental: false, 
          is_public: true, 
          prompt: tags ? `${prompt}, ${tags}` : String(prompt) 
        };

    const res = await fetch(API, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(body),
    });

    const json = await res.json();
    if (json && json.code === 100000 && Array.isArray(json.data) && json.data.length) {
      return { status: true, data: json.data };
    }

    return { status: false, error: json?.message || "Failed to create music generation job." };
  } catch (error: any) {
    return { status: false, error: error.message };
  }
}

export async function pollMusicStatus(songId: string) {
  try {
    const res = await fetch(`${API}/${songId}`, { headers: getHeaders() });
    const json = await res.json();
    const row = Array.isArray(json?.data) ? json.data[0] : json?.data;

    if (!row) return { status: 'pending', percentage: 0 };

    if (row.status === "success" && row.audio_url) {
      return {
        status: 'success',
        percentage: 100,
        result: {
          id: row.song_id,
          title: row.title || "Untitled",
          audio: row.audio_url,
          image: row.image_url || row.cover_url || null,
          duration: row.duration,
          tags: row.tags,
          lyrics: row.lyrics,
          description: row.description
        }
      };
    }

    if (["failed", "error", "fail"].includes(row.status)) {
      return { status: 'failed', error: "Generation failed on the server." };
    }

    return { 
      status: row.status || 'processing', 
      percentage: row.percentage ?? 10 
    };
  } catch (error: any) {
    return { status: 'failed', error: error.message };
  }
}
