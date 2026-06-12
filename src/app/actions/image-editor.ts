'use server';

import crypto from 'crypto';
import { basename, extname } from 'path';

/**
 * DeepAI Image Editor Server Action
 * Implements complex signature generation and multi-attempt processing.
 */

const AGENT = 'Mozilla/5.0 (Linux; Android 8.0; Pixel 2 Build/OPD3.170816.012) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36';
const SALT = 'hackers_become_a_little_stinkier_every_time_they_hack';

const md5 = (s: string) => crypto.createHash('md5').update(s).digest('hex');
const reverse = (s: string) => s.split('').reverse().join('');
const generateRandomIP = () => Array.from({ length: 4 }, () => 1 + Math.floor(Math.random() * 254)).join('.');

const getMime = (ext: string) => {
  const map: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp'
  };
  return map[ext.toLowerCase()] || 'application/octet-stream';
};

function genKEY() {
  const r = String(Math.floor(Math.random() * 1e11));
  const h1 = reverse(md5(AGENT + r + SALT));
  const h2 = reverse(md5(AGENT + h1));
  const h3 = reverse(md5(AGENT + h2));
  return `tryit-${r}-${h3}`;
}

export async function editImageAI(input: { file?: File; prompt: string }) {
  if (!input.file) throw new Error('No image file provided.');
  if (!input.prompt) throw new Error('No editing instructions provided.');

  const buffer = Buffer.from(await input.file.arrayBuffer());
  const filename = input.file.name;
  const mimeType = getMime(extname(filename));

  let lastError = 'Request initialization failed';

  // DeepAI often requires multiple attempts due to their unique key rotation
  for (let i = 0; i < 6; i++) {
    try {
      const form = new FormData();
      const blob = new Blob([buffer], { type: mimeType });
      
      form.append('image', blob, filename);
      form.append('text', input.prompt);
      form.append('image_generator_version', 'standard');

      const res = await fetch('https://api.deepai.org/api/image-editor', {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'origin': 'https://deepai.org',
          'referer': 'https://deepai.org/',
          'user-agent': AGENT,
          'api-key': genKEY(),
          'x-forwarded-for': generateRandomIP()
        },
        body: form
      });

      const json = await res.json().catch(() => null);

      if (json?.output_url) {
        const imageRes = await fetch(json.output_url);
        const imageBuffer = await imageRes.arrayBuffer();
        const base64 = Buffer.from(imageBuffer).toString('base64');
        const contentType = imageRes.headers.get('content-type') || 'image/png';

        return {
          status: true,
          data: `data:${contentType};base64,${base64}`
        };
      }

      lastError = json?.status || `DeepAI protocol error (${res.status})`;
    } catch (e: any) {
      lastError = e.message;
    }
  }

  return {
    status: false,
    error: `Editor failed after multiple handshake attempts: ${lastError}`
  };
}
