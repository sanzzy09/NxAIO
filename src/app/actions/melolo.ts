'use server';

import axios from 'axios';

/**
 * @fileOverview Melolo API Orchestrator.
 * Handles device-mimicking parameters and base64-decoded streaming protocols.
 */

const generateRandomId = (length = 19) => {
    let result = '';
    result += Math.floor(Math.random() * 9) + 1; 
    for (let i = 1; i < length; i++) {
        result += Math.floor(Math.random() * 10);
    }
    return result;
};

const generateOpenUdid = () => {
    return 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () => {
        return (Math.random() * 16 | 0).toString(16);
    });
};

const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

const CONFIG = {
    BASE_URL: "https://api.tmtreader.com",
    HEADERS: {
        "Host": "api.tmtreader.com",
        "Accept": "application/json; charset=utf-8,application/x-protobuf",
        "X-Xs-From-Web": "false",
        "Age-Range": "8",
        "Sdk-Version": "2",
        "Passport-Sdk-Version": "50357",
        "X-Vc-Bdturing-Sdk-Version": "2.2.1.i18n",
        "User-Agent": "ScRaPe/9.9 (KaliLinux; Nusantara Os; My/Shannz)"
    },

    COMMON_PARAMS: {
        "iid": generateRandomId(19),
        "device_id": generateRandomId(19),
        "ac": "wifi",
        "channel": "gp",
        "aid": "645713",
        "app_name": "Melolo",
        "version_code": "49819",
        "version_name": "4.9.8",
        "device_platform": "android",
        "os": "android",
        "ssmix": "a",
        "device_type": "ScRaPe",
        "device_brand": "Shannz",
        "language": "in",
        "os_api": "28",
        "os_version": "15",
        "openudid": generateOpenUdid(),
        "manifest_version_code": "49819",
        "resolution": "900*1600",
        "dpi": "320",
        "update_version_code": "49819",
        "current_region": "ID",
        "carrier_region": "ID",
        "app_language": "id",
        "sys_language": "in",
        "app_region": "ID",
        "sys_region": "ID",
        "mcc_mnc": "46002",
        "carrier_region_v2": "460",
        "user_language": "id",
        "time_zone": "Asia/Jakarta",
        "ui_language": "in",
        "cdid": generateUUID(),
    }
};

const generateRticket = () => {
    return String(Math.floor(Date.now() * 1000) + Math.floor(Math.random() * 1000));
};

const request = async (method: string, endpoint: string, params = {}, data = null, customHeaders = {}) => {
    try {
        const url = `${CONFIG.BASE_URL}${endpoint}`;

        const finalParams = {
            ...CONFIG.COMMON_PARAMS,
            ...params,
            "_rticket": generateRticket()
        };

        const config = {
            method,
            url,
            headers: { ...CONFIG.HEADERS, ...customHeaders },
            params: finalParams,
            data
        };

        const response = await axios(config);
        return response.data;
    } catch (error: any) {
        const errorMsg = error.response ? JSON.stringify(error.response.data) : error.message;
        throw new Error(`Melolo API Error: ${errorMsg}`);
    }
};

export async function fetchMelolo(input: { mode: string; query?: string; bookId?: string; videoId?: string }) {
  try {
    const { mode, query, bookId, videoId } = input;

    if (mode === 'search') {
      const endpoint = '/i18n_novel/search/page/v1/';
      const params = {
          "search_source_id": "clks###",
          "IsFetchDebug": "false",
          "offset": 0,
          "cancel_search_category_enhance": "false",
          "query": query,
          "limit": 12,
          "search_id": ""
      };

      const json = await request('GET', endpoint, params);
      const searchData = json?.data?.search_data || [];
      const results: any[] = [];

      if (Array.isArray(searchData)) {
          searchData.forEach(section => {
              if (section.books && Array.isArray(section.books)) {
                  section.books.forEach(book => {
                      results.push({
                          title: book.book_name,
                          book_id: book.book_id,
                          cover: book.thumb_url,
                          author: book.author,
                          sinopsis: book.abstract,
                          status: book.show_creation_status,
                          tags: book.stat_infos || [],
                          total_chapters: book.serial_count || book.last_chapter_index
                      });
                  });
              }
          });
      }
      return { status: true, data: results };
    }

    if (mode === 'detail') {
      const endpoint = '/novel/player/video_detail/v1/';
      const headers = {
          "X-Ss-Stub": "238B6268DE1F0B757306031C76B5397E",
          "Content-Type": "application/json; charset=utf-8"
      };
      const payload = {
          "biz_param": {
              "detail_page_version": 0,
              "from_video_id": "",
              "need_all_video_definition": false,
              "need_mp4_align": false,
              "source": 4,
              "use_os_player": false,
              "video_id_type": 1
          },
          "series_id": bookId
      };

      const json = await request('POST', endpoint, {}, payload, headers);
      const data = json?.data?.video_data || {}; 

      let tags: string[] = [];
      try {
          if (data.category_schema) {
              const parsed = JSON.parse(data.category_schema);
              tags = parsed.map((cat: any) => cat.name);
          }
      } catch (e) {}

      const videoList = data.video_list || [];
      const episodes = videoList.map((v: any) => ({
          video_id: v.vid,
          episode: v.vid_index,
          title: v.title,
          duration: v.duration,
          likes: v.digged_count,
          cover: v.cover
      }));

      return {
          status: true,
          data: {
            book_id: data.series_id_str || bookId,
            title: data.series_title,
            intro: data.series_intro,
            cover: data.series_cover,
            total_episodes: data.episode_cnt,
            tags: tags,
            status: data.series_status === 1 ? "Ongoing" : "Completed",
            episodes: episodes
          }
      };
    }

    if (mode === 'stream') {
      const endpoint = '/novel/player/video_model/v1/';
      const headers = {
          "X-Ss-Stub": "B7FB786F2CAA8B9EFB7C67A524B73AFB",
          "Content-Type": "application/json; charset=utf-8"
      };
      const payload = {
          "biz_param": {
              "detail_page_version": 0,
              "device_level": 3,
              "from_video_id": "",
              "need_all_video_definition": true,
              "need_mp4_align": false,
              "source": 4,
              "use_os_player": false,
              "video_id_type": 0,
              "video_platform": 3
          },
          "video_id": videoId
      };

      const json = await request('POST', endpoint, {}, payload, headers);
      const raw = json?.data || {};

      let result: any = {
          url: raw.main_url,
          backup_url: raw.backup_url,
          expire_at: raw.expire_time,
          width: raw.video_width,
          height: raw.video_height,
          metadata: {},
          downloads: []
      };

      if (raw.video_model) {
          const model = JSON.parse(raw.video_model);
          const thumbs = model.big_thumbs || [];
          result.metadata = {
              id: model.video_id,
              duration: model.video_duration,
              thumbnail: thumbs.length > 0 ? thumbs[0].img_url : null
          };

          if (model.video_list) {
              Object.values(model.video_list).forEach((item: any) => {
                  let videoUrl = item.main_url;
                  if (videoUrl && !videoUrl.startsWith('http')) {
                      try {
                          videoUrl = Buffer.from(videoUrl, 'base64').toString('utf-8');
                      } catch (err) {}
                  }
                  result.downloads.push({
                      quality: item.definition,
                      size: item.size,
                      fps: item.fps,
                      url: videoUrl
                  });
              });
              result.downloads.sort((a: any, b: any) => b.size - a.size);
          }
      }
      return { status: true, data: result };
    }

    return { status: false, error: 'Invalid mode' };
  } catch (error: any) {
    return { status: false, error: error.message };
  }
}