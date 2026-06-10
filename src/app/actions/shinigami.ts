'use server';

/**
 * Server actions for the Shinigami Manga/Manhwa API.
 * Handles fetching list, details, chapters, and reader data.
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

async function apiRequest(path: string) {
  try {
    const res = await fetch(`${BASE_API}${path}`, { 
      headers: HEADERS,
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!res.ok) {
      throw new Error(`Shinigami API Error: ${res.status}`);
    }
    
    return await res.json();
  } catch (error: any) {
    console.error('Shinigami Server Action Error:', error.message);
    return { status: false, message: error.message };
  }
}

export async function fetchShinigami(params: { mode: string; [key: string]: any }) {
  const { mode, ...p } = params;

  switch (mode) {
    case 'list': {
      const q = new URLSearchParams({
        page: p.page?.toString() || '1',
        page_size: p.pageSize?.toString() || '24',
        sort: p.sort || 'latest',
        sort_order: p.sortOrder || 'desc',
      });
      if (p.format) q.set('format', p.format);
      if (p.type) q.set('type', p.type);
      return apiRequest(`/v1/manga/list?${q}`);
    }

    case 'trending': {
      const q = new URLSearchParams({
        filter: p.filter || 'daily',
        page: '1',
        page_size: '10',
      });
      return apiRequest(`/v1/manga/top?${q}`);
    }

    case 'detail': {
      if (!p.id) return { status: false, message: 'ID required' };
      // Aggregating detail and first 100 chapters
      const detail = await apiRequest(`/v1/manga/detail/${p.id}`);
      const chapters = await apiRequest(`/v1/chapter/${p.id}/list?page=1&page_size=100&sort_by=chapter_number&sort_order=desc`);
      return { status: true, data: { ...detail.data, chapters: chapters.data || [] } };
    }

    case 'chapter': {
      if (!p.id) return { status: false, message: 'Chapter ID required' };
      const res = await apiRequest(`/v1/chapter/detail/${p.id}`);
      if (res.status && res.data) {
        const ch = res.data;
        const base = ch.base_url + ch.chapter.path;
        const pages = ch.chapter.data.map((f: string) => base + f);
        return { status: true, data: { ...ch, pages } };
      }
      return res;
    }

    case 'search': {
      const q = new URLSearchParams({
        page: '1',
        page_size: '24',
        sort: 'latest',
        sort_order: 'desc',
        q: p.query || '',
      });
      return apiRequest(`/v1/manga/list?${q}`);
    }

    case 'genres': {
      return apiRequest('/v1/genre/list');
    }

    case 'announcements': {
      return apiRequest('/v1/announcement/list?page=1&page_size=10');
    }

    default:
      return { status: false, message: 'Invalid mode' };
  }
}
