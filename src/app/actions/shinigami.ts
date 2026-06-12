
'use server';

import axios from 'axios';

/**
 * Shinigami Server Action
 * Based on logic by ShanMolvyr
 */

const BASE_API = 'https://api.shngm.io';
const ASSETS_BASE = 'https://assets.shngm.id';

const HEADERS = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'Origin': 'https://g.shinigami.asia',
  'Referer': 'https://g.shinigami.asia/',
  'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
};

async function apiRequest(path: string, params: any = {}) {
  try {
    const res = await axios.get(`${BASE_API}${path}`, {
      headers: HEADERS,
      params,
      timeout: 20000
    });
    return { status: true, data: res.data };
  } catch (error: any) {
    console.error(`Shinigami API Error (${path}):`, error.message);
    return { status: false, error: error.message };
  }
}

export async function fetchShinigami(input: { mode: string; query?: string; id?: string | number; page?: number; filter?: string; type?: string }) {
  const { mode, query, id, page = 1, filter = 'daily' } = input;

  if (mode === 'home') {
    return apiRequest('/v1/manga/list', {
      page,
      page_size: 24,
      sort: 'latest',
      sort_order: 'desc',
      is_update: 1
    });
  }

  if (mode === 'trending') {
    return apiRequest('/v1/manga/top', {
      filter,
      page,
      page_size: 10
    });
  }

  if (mode === 'search') {
    return apiRequest('/v1/manga/list', {
      page,
      page_size: 24,
      sort: 'latest',
      sort_order: 'desc',
      q: query || ''
    });
  }

  if (mode === 'detail') {
    return apiRequest(`/v1/manga/detail/${id}`);
  }

  if (mode === 'chapters') {
    return apiRequest(`/v1/chapter/${id}/list`, {
      page: 1,
      page_size: 500,
      sort_by: 'chapter_number',
      sort_order: 'desc'
    });
  }

  if (mode === 'read') {
    const res = await apiRequest(`/v1/chapter/detail/${id}`);
    if (res.status && res.data?.data) {
      const ch = res.data.data;
      const baseUrl = ch.base_url || ASSETS_BASE;
      const images = ch.chapter.data.map((f: string) => {
        const fullPath = ch.chapter.path + f;
        return baseUrl.endsWith('/') ? baseUrl + fullPath.replace(/^\//, '') : baseUrl + fullPath;
      });
      return { 
        status: true, 
        data: { 
          ...ch, 
          images,
          assets_base: ASSETS_BASE
        } 
      };
    }
    return res;
  }

  if (mode === 'genres') {
    return apiRequest('/v1/genre/list');
  }

  return { status: false, error: 'Invalid mode' };
}

export async function proxyShinigamiImage(imageUrl: string) {
  try {
    if (!imageUrl) throw new Error("Image URL is required");
    
    // Handle relative paths
    const finalUrl = imageUrl.startsWith('http') 
      ? imageUrl 
      : `${ASSETS_BASE}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;

    const res = await axios.get(finalUrl, {
      responseType: 'arraybuffer',
      headers: {
        ...HEADERS,
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
      timeout: 15000
    });

    const contentType = res.headers['content-type'] || 'image/jpeg';
    const base64 = Buffer.from(res.data).toString('base64');
    
    return {
      status: true,
      data: `data:${contentType};base64,${base64}`
    };
  } catch (error: any) {
    return { status: false, error: error.message };
  }
}
