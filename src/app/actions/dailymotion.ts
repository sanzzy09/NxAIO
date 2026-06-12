'use server';

/**
 * @fileOverview Dailymotion metadata and download orchestrator.
 * Extracts video links, thumbnails, and parsed subtitles.
 */

import axios from 'axios';

const CONFIG = {
    HEADERS: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://cse.knospe.co'
    }
};

const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

const generateViewId = () => {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
    let id = '';
    for (let i = 0; i < 18; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
};

const extractVideoId = (url: string) => {
    const patterns = [
        /dailymotion\.com\/video\/([a-zA-Z0-9]+)/,
        /dai\.ly\/([a-zA-Z0-9]+)/,
        /video\/([a-zA-Z0-9]+)\.json/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
};

const buildApiUrl = (videoId: string) => {
    const params = new URLSearchParams({
        legacy: 'true',
        embedder: 'https://www.dailymotion.com/id',
        referer: 'https://cse.knospe.co',
        geo: '1',
        'player-id': 'x138o4',
        enableAds: '0',
        locale: 'en-US',
        dmV1st: generateUUID(),
        dmTs: Date.now().toString().slice(0, 6),
        is_native_app: '0',
        app: 'com.dailymotion.neon',
        client_type: 'webapp',
        dmViewId: generateViewId(),
        parallelCalls: '1'
    });

    return `https://geo.dailymotion.com/video/${videoId}.json?${params.toString()}`;
};

const parseSRT = (srtContent: string) => {
    const subtitles = [];
    const blocks = srtContent.trim().split(/\n\s*\n/);

    for (const block of blocks) {
        const lines = block.trim().split('\n');
        if (lines.length < 3) continue;

        const timestampLine = lines[1];
        const match = timestampLine.match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/);
        
        if (match) {
            subtitles.push({
                timestamp: `${match[1]} --> ${match[2]}`,
                text: lines.slice(2).join('\n').trim()
            });
        }
    }
    return subtitles;
};

async function _fetchSubtitles(subtitleData: any) {
    if (!subtitleData) return null;
    const allSubtitles: any = {};

    for (const [lang, info] of Object.entries(subtitleData) as [string, any][]) {
        if (info.urls && info.urls.length > 0) {
            try {
                const srtUrl = info.urls[0];
                const response = await axios.get(srtUrl, { headers: CONFIG.HEADERS });
                
                allSubtitles[lang] = {
                    label: info.label,
                    subtitles: parseSRT(response.data)
                };
            } catch (error: any) {
                console.error(`[-] Gagal mengambil subtitle untuk ${lang}:`, error.message);
            }
        }
    }
    return Object.keys(allSubtitles).length > 0 ? allSubtitles : null;
}

export async function fetchDailymotion(videoUrl: string) {
    try {
        const videoId = extractVideoId(videoUrl);
        if (!videoId) {
            throw new Error("Video ID tidak ditemukan di dalam URL");
        }

        const apiUrl = buildApiUrl(videoId);
        const response = await axios.get(apiUrl, { headers: CONFIG.HEADERS });
        const data = response.data;

        const subtitles = await _fetchSubtitles(data.subtitles?.data || null);

        return {
            status: true,
            data: {
                id: data.id,
                title: data.title,
                duration: data.duration,
                created_time: data.created_time,
                video_url: data.qualities,
                country: data.country,
                filmstrip_url: data.filmstrip_url,
                thumbnails: data.thumbnails,
                owner: {
                    username: data.owner?.username,
                    url: data.owner?.url,
                    avatar: data.owner?.avatar,
                    type: data.owner?.type
                },
                tags: data.tags,
                channel: data.channel,
                language: data.language,
                subtitles: subtitles
            }
        };
    } catch (error: any) {
        return {
            status: false,
            error: error.response?.data?.message || error.message
        };
    }
}
