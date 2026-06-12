'use server';

import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * @fileOverview Dramabox Metadata and Streaming Orchestrator.
 * Directly interfaces with DramaboxDB mirrors for short series content.
 */

const CONFIG = {
    BASE_URL: 'https://www.dramaboxdb.com',
    HEADERS: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
};

const request = async (url: string) => {
    try {
        const response = await axios.get(url, { headers: CONFIG.HEADERS });
        return cheerio.load(response.data);
    } catch (error: any) {
        throw new Error(`Network Error: ${error.message}`);
    }
};

const resolveUrl = (link: string | undefined) => {
    if (link && !link.startsWith('http')) {
        return `${CONFIG.BASE_URL}/${link.replace(/^\//, '')}`;
    }
    return link || '';
};

const getBookIdFromUrl = (urlStr: string) => {
    try {
        const match = urlStr.match(/\/watch\/(\d+)/);
        if (match) return match[1];

        const urlObj = new URL(urlStr);
        return urlObj.searchParams.get('bookId');
    } catch (e) {
        return null;
    }
};

export async function fetchDramabox(input: { mode: string; query?: string; bookId?: string; episode?: number }) {
    try {
        const { mode, query, bookId, episode } = input;

        if (mode === 'home') {
            const $ = await request(`${CONFIG.BASE_URL}/in`);
            const latest: any[] = [];
            
            $('.drama-grid .drama-card').each((_, el) => {
                const link = resolveUrl($(el).find('.watch-button').attr('href'));
                const episodes = $(el).find('.drama-meta span[itemprop="numberOfEpisodes"]').text().replace(/[^0-9]/g, '');
                
                latest.push({
                    title: $(el).find('.drama-title').text().trim(),
                    book_id: getBookIdFromUrl(link),
                    image: $(el).find('.drama-image img').attr('src') || $(el).find('.drama-image img').attr('data-src'),
                    episodes: episodes
                });
            });

            const trending: any[] = [];
            $('.sidebar-widget .rank-list .rank-item').each((_, el) => {
                const link = resolveUrl($(el).attr('href'));
                const episodes = $(el).find('.rank-meta span').text().replace(/[^0-9]/g, '');

                trending.push({
                    rank: $(el).find('.rank-number').text().trim(),
                    title: $(el).find('.rank-title').text().trim(),
                    book_id: getBookIdFromUrl(link),
                    image: $(el).find('.rank-image img').attr('src') || $(el).find('.rank-image img').attr('data-src'),
                    episodes: episodes
                });
            });

            return { status: true, data: { latest, trending } };
        }

        if (mode === 'search') {
            const targetUrl = `${CONFIG.BASE_URL}/search.php?lang=in&q=${encodeURIComponent(query!)}`;
            const $ = await request(targetUrl);

            const results: any[] = [];
            $('.drama-grid .drama-card').each((_, el) => {
                const link = resolveUrl($(el).find('.watch-button').attr('href'));
                const viewsRaw = $(el).find('.drama-meta span').first().text().trim();
                
                results.push({
                    title: $(el).find('.drama-title').text().trim(),
                    book_id: getBookIdFromUrl(link),
                    views: viewsRaw,
                    image: $(el).find('.drama-image img').attr('src') || $(el).find('.drama-image img').attr('data-src')
                });
            });

            return { status: true, data: results };
        }

        if (mode === 'detail') {
            const targetUrl = `${CONFIG.BASE_URL}/watch/${bookId}`;
            const $ = await request(targetUrl);

            const fullTitle = $('.video-title').text().trim();
            const cleanTitle = fullTitle.split('- Episode')[0].trim();
            
            const episodes: any[] = [];
            $('.episodes-grid .episode-btn').each((_, el) => {
                episodes.push({
                    episode: parseInt($(el).text().trim()),
                    id: $(el).attr('data-episode')
                });
            });

            const followersRaw = $('.video-meta span').first().text().trim();
            const totalEpRaw = $('span[itemprop="numberOfEpisodes"]').text().replace(/[^0-9]/g, '');

            return {
                status: true,
                data: {
                    book_id: bookId,
                    title: cleanTitle,
                    description: $('.video-description').text().trim(),
                    thumbnail: $('meta[itemprop="thumbnailUrl"]').attr('content'),
                    upload_date: $('meta[itemprop="uploadDate"]').attr('content'),
                    stats: {
                        followers: followersRaw,
                        total_episodes: totalEpRaw,
                    },
                    episode_list: episodes
                }
            };
        }

        if (mode === 'stream') {
            const epPath = (episode === 0 || !episode) ? '' : `/ep-${episode}`;
            const targetUrl = `${CONFIG.BASE_URL}/watch/${bookId}${epPath}`;
            
            const $ = await request(targetUrl);
            const videoUrls: any[] = [];
            
            const rawHtml = $.html();
            const qualitiesRegex = /const\s+initialQualities\s*=\s*(\[.*?\]);/s;
            const match = rawHtml.match(qualitiesRegex);

            if (match && match[1]) {
                try {
                    const qualitiesData = JSON.parse(match[1]);
                    qualitiesData.forEach((item: any) => {
                        if (item.quality && item.videoPath) {
                            videoUrls.push({
                                quality: `${item.quality}p`,
                                url: item.videoPath
                            });
                        }
                    });
                } catch (error) {
                    console.error("Gagal parsing JSON kualitas");
                }
            }

            if (videoUrls.length === 0) {
                $('#qualityMenu .quality-option').each((_, el) => {
                    const quality = $(el).attr('data-quality');
                    const url = $(el).attr('data-url');
                    
                    if (quality && url) {
                        videoUrls.push({
                            quality: `${quality}p`,
                            url: url
                        });
                    }
                });
            }

            if (videoUrls.length === 0) {
                let fallbackUrl = $('#mainVideo source').attr('src') || 
                                  $('#mainVideo').attr('data-hls-url') || 
                                  $('#mainVideo').attr('src');
                                  
                if (fallbackUrl) {
                    videoUrls.push({
                        quality: 'default',
                        url: fallbackUrl
                    });
                }
            }

            return {
                status: true,
                data: {
                    book_id: bookId,
                    episode: episode,
                    videos: videoUrls
                }
            };
        }

        return { status: false, error: 'Invalid mode' };
    } catch (error: any) {
        return { status: false, error: error.message };
    }
}