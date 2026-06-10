'use server';

import axios from 'axios';
import FormData from 'form-data';

/**
 * Server action to handle background removal requests via PixPunk AI.
 */
export async function removeImageBackground(input: { file?: File; url?: string }) {
  const API_URL = 'https://api.pixpunk.ai/api/remove-background';
  const HEADERS = {
    'Origin': 'https://pixpunk.ai',
    'Referer': 'https://pixpunk.ai/',
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0',
    'Accept': 'application/json',
  };

  try {
    const form = new FormData();

    if (input.file) {
      const buffer = Buffer.from(await input.file.arrayBuffer());
      form.append('image', buffer, {
        filename: input.file.name,
        contentType: input.file.type || 'image/jpeg',
      });
    } else if (input.url) {
      // Fetch the remote image first
      const imageRes = await axios.get(input.url, { responseType: 'arraybuffer' });
      const contentType = imageRes.headers['content-type'] || 'image/jpeg';
      form.append('image', Buffer.from(imageRes.data), {
        filename: 'remote_image.jpg',
        contentType,
      });
    } else {
      throw new Error('No image source provided.');
    }

    const res = await axios.post(API_URL, form, {
      headers: { ...HEADERS, ...form.getHeaders() },
      responseType: 'arraybuffer',
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: 60000,
    });

    if (res.status !== 200) {
      throw new Error(`API returned ${res.status}: ${res.statusText}`);
    }

    // Convert the resulting binary data to a data URI for the client
    const base64 = Buffer.from(res.data).toString('base64');
    return {
      status: true,
      data: `data:image/png;base64,${base64}`,
    };
  } catch (error: any) {
    console.error('Remove BG Action Error:', error.message);
    return {
      status: false,
      error: error.message || 'The background removal service is currently unreachable.',
    };
  }
}
