'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Tv, 
  Search, 
  Loader2, 
  Star, 
  Info, 
  ListOrdered, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Home as HomeIcon, 
  Download, 
  Library, 
  TrendingUp, 
  LayoutGrid, 
  AlertCircle, 
  Clock, 
  ExternalLink, 
  Tag,
  PlayCircle,
  MonitorPlay,
  X
} from "lucide-react";
import Image from 'next/image';
import { cn } from "@/lib/utils";
import { fetchNimegami } from "@/app/actions/nimegami";
import { useToast } from "@/hooks/use-toast";

type ViewMode = 'home' | 'latest' | 'archive' | 'detail' | 'search';

export function NimegamiExplorer() {
  const [view, setView] = useState<ViewMode>('home');
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFetch = async (params: { mode: string; url?: string; page?: number; query?: string }) => {
    setLoading(true);
    setError(null);
    setActiveVideo(null); // Clear video when switching content
    try {
      const res = await fetchNimegami(params);
      if (!res.status) throw new Error(res.error);
      
      setData(res.data);
      setView(params.mode as ViewMode);
      if (params.page) setPage(params.page);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetch({ mode: 'home' });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    handleFetch({ mode: 'search', query });
  };

  const renderGrid = (items: any[]) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in-up">
      {items.map((item, i) => (
        <button 
          key={i} 
          onClick={() => handleFetch({ mode: 'detail', url: item.link })}
          className="group text-left bg-secondary/20 border border-primary/5 rounded-3xl overflow-hidden hover:border-purple-500/30 transition-all hover:shadow-xl"
        >
          <div className="relative aspect-[3/4] w-full bg-black/5">
            <Image 
              src={item.thumbnail || "https://placehold.co/400x600/png?text=No+Cover"} 
              alt={item.title} 
              fill 
              className="object-cover group-hover:scale-105 transition-transform duration-500" 
              unoptimized 
            />
            <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
              {item.rating && (
                <Badge variant="outline" className="bg-black/50 backdrop-blur-md text-white border-none rounded-lg text-[10px] uppercase font-bold flex items-center gap-1">
                  <Star className="size-2.5 fill-yellow-400 text-yellow-400" /> {item.rating}
                </Badge>
              )}
              {item.status && <Badge className="bg-purple-600 border-none rounded-lg text-[10px] uppercase font-bold">{item.status}</Badge>}
            </div>
            {item.lastEpisode && (
              <div className="absolute bottom-2 left-2">
                <Badge variant="secondary" className="bg-white/90 text-purple-700 border-none rounded-lg text-[10px] font-bold">
                  EP {item.lastEpisode}
                </Badge>
              </div>
            )}
          </div>
          <div className="p-4 space-y-1">
            <h4 className="font-headline font-bold text-xs line-clamp-2 leading-tight group-hover:text-purple-600 transition-colors">{item.title}</h4>
            <div className="flex flex-wrap gap-1 mt-1">
               {item.types?.slice(0, 2).map((t: string, idx: number) => (
                 <span key={idx} className="text-[8px] uppercase font-bold text-muted-foreground/60">{t}</span>
               ))}
            </div>
          </div>
        </button>
      ))}
    </div>
  );

  const renderHome = () => (
    <div className="space-y-12 animate-fade-in-up">
      {data?.recommendedAnime?.length > 0 && (
        <div className="space-y-6">
           <h3 className="text-xl font-bold font-headline flex items-center gap-2">
             <Star className="size-5 text-yellow-500 fill-yellow-500" /> Recommended
           </h3>
           <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
              {data.recommendedAnime.map((item: any, idx: number) => (
                <button 
                  key={idx} 
                  onClick={() => handleFetch({ mode: 'detail', url: item.link })}
                  className="flex-shrink-0 w-40 space-y-2 group text-left"
                >
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-primary/5">
                    <Image src={item.thumbnail} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform" unoptimized />
                  </div>
                  <h4 className="text-[10px] font-bold line-clamp-1 group-hover:text-purple-600">{item.title}</h4>
                </button>
              ))}
           </div>
        </div>
      )}

      <div className="space-y-6">
        <h3 className="text-xl font-bold font-headline flex items-center gap-2">
          <TrendingUp className="size-5 text-purple-500" /> Latest Updates
        </h3>
        {renderGrid(data?.updateAnime || [])}
      </div>

      <div className="flex justify-center pt-8">
        <Button 
          variant="outline" 
          onClick={() => handleFetch({ mode: 'home', page: page + 1 })}
          className="rounded-full px-10 h-12 border-primary/5 font-bold uppercase text-[10px] tracking-widest hover:bg-purple-500/10 hover:text-purple-600"
        >
          Load More Content
        </Button>
      </div>
    </div>
  );

  const renderLatest = () => (
    <div className="space-y-12 animate-fade-in-up">
       {data?.map((section: any, idx: number) => (
         <div key={idx} className="space-y-6">
           <div className="flex items-center gap-3 border-b border-primary/5 pb-4">
              <div className="p-2 bg-purple-500/10 text-purple-600 rounded-lg">
                <Calendar className="size-4" />
              </div>
              <h3 className="text-xl font-bold font-headline uppercase tracking-widest text-purple-700">{section.day}</h3>
           </div>
           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {section.animeList.map((item: any, i: number) => (
                <button 
                  key={i} 
                  onClick={() => handleFetch({ mode: 'detail', url: item.link })}
                  className="group text-left bg-secondary/20 border border-primary/5 rounded-3xl overflow-hidden hover:border-purple-500/30 transition-all"
                >
                  <div className="relative aspect-[3/4] w-full">
                    <Image src={item.thumbnail} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform" unoptimized />
                    <div className="absolute bottom-2 left-2">
                       <Badge className="bg-purple-600 border-none text-[10px] font-bold">{item.episode}</Badge>
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-headline font-bold text-xs line-clamp-2 leading-tight group-hover:text-purple-600">{item.title}</h4>
                  </div>
                </button>
              ))}
           </div>
         </div>
       ))}
    </div>
  );

  const renderDetail = () => {
    const isPlayable = (host: string, link: string) => {
      const h = host.toLowerCase();
      const l = link.toLowerCase();
      return (
        h.includes('kraken') || 
        h.includes('streaming') || 
        h.includes('halahgan') || 
        l.includes('halahgan.com') ||
        l.includes('berkasdrive')
      );
    };

    const getEmbedUrl = (host: string, link: string) => {
      const h = host.toLowerCase();
      const l = link.toLowerCase();

      // Case 1: Krakenfiles
      if (h.includes('kraken')) {
        const code = link.split('/view/')[1]?.split('/')[0];
        if (code) return `https://krakenfiles.com/embed-video/${code}`;
      }

      // Case 2: Halahgan / BerkasDrive
      // Transforms: https://dlgan.halahgan.com/?id=...
      // Into: https://dlgan.halahgan.com/streaming.php?id=...
      if (h.includes('halahgan') || link.includes('halahgan.com')) {
        if (link.includes('?id=') && !link.includes('streaming.php')) {
          return link.replace('dlgan.halahgan.com/?id=', 'dlgan.halahgan.com/streaming.php?id=');
        }
      }

      return link;
    };

    return (
      <div className="space-y-10 animate-fade-in-up">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4 space-y-6">
            <div className="relative aspect-[3/4] w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-primary/5 bg-secondary/10">
              <Image src={data.thumbnail} alt={data.title} fill className="object-cover" unoptimized />
            </div>
            <div className="bg-secondary/20 p-8 rounded-[2rem] border border-primary/5 space-y-6">
               <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Series Info</h5>
               <div className="space-y-4">
                  {Object.entries(data.info || {}).map(([key, val]: [string, any]) => (
                    <div key={key} className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">{key.replace(/_/g, ' ')}</span>
                      <span className="text-sm font-bold">{val}</span>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-10">
            <h2 className="text-4xl font-bold font-headline leading-tight tracking-tight">{data.title}</h2>
            
            {/* Integrated Video Player */}
            {activeVideo && (
              <div className="space-y-4 animate-fade-in-up">
                 <div className="flex items-center justify-between px-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-600 flex items-center gap-2">
                      <MonitorPlay className="size-3" /> Now Streaming
                    </h4>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setActiveVideo(null)} 
                      className="h-6 px-2 rounded-lg text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-destructive gap-1.5"
                    >
                       <X className="size-3" /> Stop Player
                    </Button>
                 </div>
                 <div className="relative aspect-video w-full bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border border-primary/5">
                    <iframe 
                      src={activeVideo} 
                      className="w-full h-full border-none" 
                      allowFullScreen
                      allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
                      referrerPolicy="no-referrer"
                    />
                 </div>
              </div>
            )}

            <div className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2">
                <Info className="size-3" /> Synopsis
              </h4>
              <p className="text-muted-foreground leading-relaxed text-base">{data.synopsis}</p>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2">
                <Download className="size-4" /> Downloads & Streaming
              </h4>
              <div className="space-y-8 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {data.downloads?.map((ep: any, i: number) => (
                  <div key={i} className="p-6 rounded-[2rem] bg-secondary/30 border border-primary/5 space-y-4">
                     <h5 className="text-sm font-bold font-headline border-b border-primary/10 pb-2">{ep.episode}</h5>
                     <div className="grid grid-cols-1 gap-4">
                        {Object.entries(ep.resolutions || {}).map(([res, links]: [string, any]) => (
                          <div key={res} className="space-y-2">
                             <span className="text-[10px] font-bold uppercase text-purple-600 tracking-widest">{res}</span>
                             <div className="flex flex-wrap gap-2">
                                {links.map((link: any, idx: number) => (
                                  <div key={idx} className="flex items-center gap-1.5">
                                    <Button asChild variant="outline" size="sm" className="h-9 px-4 rounded-xl text-[9px] font-bold border-primary/10 hover:bg-purple-500/10 hover:text-purple-600 shadow-sm">
                                      <a href={link.link} target="_blank" rel="noopener noreferrer">{link.host}</a>
                                    </Button>
                                    {isPlayable(link.host, link.link) && (
                                      <Button 
                                        variant="secondary" 
                                        size="icon" 
                                        className="size-9 rounded-xl bg-purple-600/10 text-purple-600 hover:bg-purple-600 hover:text-white transition-all shadow-sm"
                                        onClick={() => {
                                          const embed = getEmbedUrl(link.host, link.link);
                                          setActiveVideo(embed);
                                          window.scrollTo({ top: 0, behavior: 'smooth' });
                                          toast({
                                            title: "Player Activated",
                                            description: `Streaming from ${link.host} source.`,
                                          });
                                        }}
                                      >
                                        <PlayCircle className="size-4" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md overflow-hidden rounded-[2.5rem]">
      <CardHeader className="p-8 sm:p-10 pb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 text-purple-500 rounded-xl">
              <Tv className="size-6" />
            </div>
            <div>
              <CardTitle className="font-headline text-2xl">Nimegami Explorer</CardTitle>
              <CardDescription>Premium database for Anime, Live Action, and J-Dramas.</CardDescription>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Tabs 
              value={view === 'detail' ? 'home' : view === 'search' ? 'home' : view} 
              onValueChange={(v) => {
                if (v === 'home') handleFetch({ mode: 'home' });
                else if (v === 'latest') handleFetch({ mode: 'latest' });
                else if (v === 'archive') handleFetch({ mode: 'archive' });
              }}
              className="bg-secondary/30 p-1 rounded-full border border-primary/5"
            >
              <TabsList className="bg-transparent h-10 gap-1">
                <TabsTrigger value="home" className="rounded-full gap-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all">
                  <HomeIcon className="size-3" /> Discover
                </TabsTrigger>
                <TabsTrigger value="latest" className="rounded-full gap-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all">
                  <Clock className="size-3" /> Latest
                </TabsTrigger>
                <TabsTrigger value="archive" className="rounded-full gap-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all">
                  <Tag className="size-3" /> BD Archive
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <form onSubmit={handleSearch} className="relative group min-w-[260px] w-full sm:w-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground opacity-40 group-focus-within:text-purple-600 transition-colors" />
              <Input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search titles...`} 
                className="h-12 pl-12 rounded-full bg-secondary/30 border-primary/5 focus-visible:ring-purple-500/20"
              />
            </form>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-8 sm:p-10 pt-0 space-y-8">
        {(view !== 'home' || error) && (
          <Button 
            variant="ghost" 
            onClick={() => handleFetch({ mode: 'home' })} 
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-purple-600 -ml-2"
          >
            <ChevronLeft className="size-3" /> Back to Discover
          </Button>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="size-12 animate-spin text-purple-500/20" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-40">Synchronizing database content...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center bg-destructive/5 rounded-[2.5rem] border border-destructive/10 space-y-4">
             <AlertCircle className="size-10 text-destructive mx-auto opacity-40" />
             <p className="text-sm font-medium text-destructive">{error}</p>
             <Button variant="outline" size="sm" onClick={() => handleFetch({ mode: 'home' })} className="rounded-full font-bold uppercase text-[10px] tracking-widest">Retry Connection</Button>
          </div>
        ) : (
          <div className="min-h-[400px]">
            {view === 'home' && renderHome()}
            {view === 'latest' && renderLatest()}
            {view === 'archive' && (
              <div className="space-y-10">
                <h3 className="text-lg font-bold font-headline px-2">Bluray Archive</h3>
                {renderGrid(data || [])}
                <div className="flex justify-center items-center gap-4 pt-8">
                  <Button disabled={page === 1} onClick={() => handleFetch({ mode: 'archive', page: page - 1 })} variant="ghost" className="rounded-full">
                    <ChevronLeft className="size-4" />
                  </Button>
                  <span className="font-mono text-xs font-bold bg-secondary px-3 py-1 rounded-lg">{page}</span>
                  <Button onClick={() => handleFetch({ mode: 'archive', page: page + 1 })} variant="ghost" className="rounded-full">
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
            {view === 'search' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold font-headline px-2">Results for "{query}"</h3>
                {data?.length > 0 ? renderGrid(data) : (
                  <div className="py-20 text-center">
                    <p className="text-muted-foreground">No matches found.</p>
                  </div>
                )}
              </div>
            )}
            {view === 'detail' && data && renderDetail()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
