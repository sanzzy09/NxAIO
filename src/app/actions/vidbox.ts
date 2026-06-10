'use server';

/**
 * Server action for Vidbox Explorer.
 * Integrates TMDB search, trending, and builds streaming server links.
 */

const TMDB = "cc62b52e2d5f4ea112a698f20c090b13";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0";

const SERVERS = [
    { n: "V2", f: "GB", m: "https://player2.vidplus.pro/embed/movie/{id}?autoplay=true" },
    { n: "Premium", f: "US", m: "https://player.vidplus.to/embed/movie/{id}?autoplay=true&download=true" },
    { n: "4K", f: "GB", m: "https://player.videasy.net/movie/{id}" },
    { n: "Max", f: "US", m: "https://ythd.org/embed/{id}" },
    { n: "Vidfast", f: "GB", m: "https://vidfast.pro/movie/{id}?autoplay=true" },
    { n: "Vidpro", f: "GB", m: "https://vixsrc.to/movie/{id}" },
    { n: "Nxsha", f: "US", m: "https://web.nxsha.app/embed/movie/{id}?lang=en&autoplay=true&sub=en" },
    { n: "Atlas", f: "US", m: "https://vidsrc.cc/v2/embed/movie/{id}" },
    { n: "Vidsrc", f: "US", m: "https://vidsrc.tw/embed/movie/{id}?referrer=none" },
    { n: "2Embed", f: "AU", m: "https://2embed.stream/embed/movie/{id}" },
    { n: "Cinemaos", f: "US", m: "https://cinemaos.tech/player/{id}" },
    { n: "Prime", f: "US", m: "https://web.nxsha.app/embed/movie/{id}?lang=en&autoplay=true&one_server=true&server=OrVid-[Multi-Lang]" },
    { n: "Netflix", f: "US", m: "https://web.nxsha.app/embed/movie/{id}?lang=en&autoplay=true&one_server=true&server=ZetPly-[Multi-Lang]" },
    { n: "Hotstar", f: "US", m: "https://web.nxsha.app/embed/movie/{id}?lang=en&autoplay=true&one_server=true&server=QsPly-[Multi-Lang]" },
    { n: "Vidnest", f: "GB", m: "https://vidnest.fun/movie/{id}" },
    { n: "Tongo", f: "US", m: "https://www.NontonGo.win/embed/movie/{id}" },
    { n: "Echo", f: "US", m: "https://vidlink.pro/movie/{id}?primaryColor=white&secondaryColor=white&iconColor=white&title=false&poster=true&autoplay=true" },
    { n: "Drive", f: "GB", m: "https://godriveplayer.com/player.php?imdb={imdb}" },
    { n: "NHD", f: "IN", m: "https://nhdapi.com/embed/movie/{id}?autoplay=true&autonext=true&audio=true&title=true&download=true" },
    { n: "Asia", f: "IN", m: "https://player.autoembed.app/embed/movie/{imdb}?server=2" },
    { n: "Bravo", f: "GB", m: "https://moviesapi.club/movie/{id}" },
    { n: "Vidking", f: "US", m: "https://www.vidking.net/embed/movie/{id}?autoplay=true" },
    { n: "Rip", f: "GB", m: "https://vidsrc.rip/embed/movie/{id}" },
    { n: "Spencer", f: "US", m: "https://spencerdevs.xyz/movie/{id}" },
    { n: "Lima", f: "US", m: "https://vidsrc.vip/embed/movie/{id}" },
    { n: "111", f: "GB", m: "https://111movies.com/movie/{id}" },
    { n: "Jade", f: "PT", m: "https://superflixapi.digital/filme/{id}" },
    { n: "French", f: "FR", m: "https://frembed.work/api/film.php?id={id}" },
    { n: "Spanish", f: "ES", m: "https://web.nxsha.app/embed/movie/{id}?lang=es&autoplay=true&sub=es" },
    { n: "Hindi", f: "IN", m: "https://web.nxsha.app/embed/movie/{id}?lang=hindi&autoplay=true" },
    { n: "Tamil", f: "IN", m: "https://web.nxsha.app/embed/movie/{id}?lang=tamil&autoplay=true" },
    { n: "Telugu", f: "IN", m: "https://web.nxsha.app/embed/movie/{id}?lang=telugu&autoplay=true" },
    { n: "Arab", f: "SA", m: "https://web.nxsha.app/embed/movie/{id}?lang=ar&autoplay=true&sub=ar" },
    { n: "Brazil", f: "BR", m: "https://web.nxsha.app/embed/movie/{id}?lang=pt&autoplay=true&sub=pt" },
    { n: "Rus", f: "RU", m: "https://web.nxsha.app/embed/movie/{id}?lang=ru&autoplay=true&sub=ru" },
    { n: "German", f: "DE", m: "https://web.nxsha.app/embed/movie/{id}?lang=de&autoplay=true&sub=de" },
    { n: "Italy", f: "IT", m: "https://vixsrc.to/movie/{id}?lang=it" },
    { n: "Japan", f: "JP", m: "https://web.nxsha.app/embed/movie/{id}?lang=ja&autoplay=true&sub=ja" },
    { n: "Turkish", f: "TR", m: "https://web.nxsha.app/embed/movie/{id}?lang=tr&autoplay=true&sub=tr" },
    { n: "Rive", f: "GB", m: "https://rivestream.net/embed?type=movie&id={id}" },
    { n: "Flicky", f: "IN", m: "https://flicky.host/embed/movie/?id={id}" },
    { n: "Peachify", f: "US", m: "https://peachify.top/embed/movie/{id}?autoplay=true&sub=English" }
];

const tj = async (u: string) => { 
  const r = await fetch(u, { headers: { "user-agent": UA, accept: "application/json" } }); 
  return r.ok ? r.json() : null; 
};

function toTv(tpl: string, s: number, e: number) {
    if (tpl.includes("type=movie")) return tpl.replace("type=movie", "type=tv") + `&season=${s}&episode=${e}`
    if (tpl.includes("frembed.work/api/film.php")) return tpl.replace("film.php", "serie.php") + `&sa=${s}&epi=${e}`
    if (tpl.includes("superflixapi.digital/filme/")) return tpl.replace("/filme/", "/serie/").replace("{id}", `{id}/${s}/${e}`)
    if (tpl.includes("godriveplayer.com/player.php")) return tpl.replace("player.php", "serie.php") + `&season=${s}&episode=${e}`
    if (tpl.includes("moviesapi.club/movie/")) return tpl.replace("/movie/{id}", `/tv/{id}-${s}-${e}`)
    if (tpl.includes("flicky.host/embed/movie/")) return tpl.replace("/embed/movie/", "/embed/tv/") + `&season=${s}&episode=${e}`
    if (tpl.includes("/embed/movie/")) return tpl.replace("/embed/movie/{id}", `/embed/tv/{id}/${s}/${e}`).replace("/embed/movie/{imdb}", `/embed/tv/{imdb}/${s}/${e}`)
    if (tpl.includes("ythd.org/embed/")) return tpl.replace("/embed/{id}", `/embed/tv/{id}/${s}/${e}`)
    if (tpl.includes("cinemaos.tech/player/")) return tpl.replace("/player/{id}", `/player/tv/{id}/${s}/${e}`)
    if (tpl.includes("/movie/{id}")) return tpl.replace("/movie/{id}", `/tv/{id}/${s}/${e}`)
    return null
}

function buildServers(type: string, id: string | number, imdb: string | null, s: number, e: number) {
    return SERVERS.map(sv => {
        const tpl = type === "tv" ? toTv(sv.m, s, e) : sv.m
        if (!tpl) return null
        if (tpl.includes("{imdb}") && !imdb) return null
        return { 
          name: sv.n, 
          flag: sv.f, 
          url: tpl.replace(/{id}/g, String(id)).replace(/{imdb}/g, imdb || "") 
        }
    }).filter(Boolean)
}

export async function vidboxSearch(query: string, options: { limit?: number; season?: number; episode?: number } = {}) {
  try {
    const { limit = 12, season = 1, episode = 1 } = options;
    const data = await tj(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB}&query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`);
    const hits = (data?.results || []).filter((r: any) => r.media_type === "movie" || r.media_type === "tv").slice(0, limit);

    const results = await Promise.all(hits.map(async (r: any) => {
        const type = r.media_type;
        const ext = await tj(`https://api.themoviedb.org/3/${type}/${r.id}/external_ids?api_key=${TMDB}`).catch(() => null);
        const imdb = ext?.imdb_id || null;
        const servers = buildServers(type, r.id, imdb, season, episode);
        
        return {
            id: r.id,
            type,
            title: r.title || r.name,
            year: (r.release_date || r.first_air_date || "").slice(0, 4) || null,
            description: r.overview || null,
            rating: r.vote_average ?? null,
            votes: r.vote_count ?? null,
            popularity: r.popularity ?? null,
            imdb,
            poster: r.poster_path ? "https://image.tmdb.org/t/p/w500" + r.poster_path : null,
            backdrop: r.backdrop_path ? "https://image.tmdb.org/t/p/original" + r.backdrop_path : null,
            url: `https://vidbox.pages.dev/watch/${type}/${r.id}`,
            embed: servers[0]?.url || null,
            servers
        };
    }));

    return { 
      status: true,
      data: { query, count: results.length, results }
    };
  } catch (error: any) {
    console.error("Vidbox Action Error:", error.message);
    return { status: false, error: error.message };
  }
}

export async function vidboxTrending(options: { limit?: number } = {}) {
  try {
    const { limit = 12 } = options;
    const data = await tj(`https://api.themoviedb.org/3/trending/all/day?api_key=${TMDB}`);
    const hits = (data?.results || []).filter((r: any) => r.media_type === "movie" || r.media_type === "tv").slice(0, limit);

    const results = await Promise.all(hits.map(async (r: any) => {
        const type = r.media_type;
        const ext = await tj(`https://api.themoviedb.org/3/${type}/${r.id}/external_ids?api_key=${TMDB}`).catch(() => null);
        const imdb = ext?.imdb_id || null;
        const servers = buildServers(type, r.id, imdb, 1, 1);
        
        return {
            id: r.id,
            type,
            title: r.title || r.name,
            year: (r.release_date || r.first_air_date || "").slice(0, 4) || null,
            description: r.overview || null,
            rating: r.vote_average ?? null,
            votes: r.vote_count ?? null,
            popularity: r.popularity ?? null,
            imdb,
            poster: r.poster_path ? "https://image.tmdb.org/t/p/w500" + r.poster_path : null,
            backdrop: r.backdrop_path ? "https://image.tmdb.org/t/p/original" + r.backdrop_path : null,
            url: `https://vidbox.pages.dev/watch/${type}/${r.id}`,
            embed: servers[0]?.url || null,
            servers
        };
    }));

    return { 
      status: true,
      data: { results }
    };
  } catch (error: any) {
    console.error("Vidbox Trending Action Error:", error.message);
    return { status: false, error: error.message };
  }
}

export async function fetchSeriesDetails(id: number | string, season: number, episode: number) {
  try {
    const ext = await tj(`https://api.themoviedb.org/3/tv/${id}/external_ids?api_key=${TMDB}`).catch(() => null);
    const imdb = ext?.imdb_id || null;
    const servers = buildServers("tv", id, imdb, season, episode);
    
    return {
      status: true,
      data: {
        servers,
        embed: servers[0]?.url || null
      }
    };
  } catch (error: any) {
    return { status: false, error: error.message };
  }
}
