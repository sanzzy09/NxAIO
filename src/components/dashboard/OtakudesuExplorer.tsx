"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Tv, 
  Search, 
  Loader2, 
  Star, 
  Info, 
  ListOrdered, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Calendar,
  PlayCircle,
  Download,
  Home,
  Clock,
  CheckCircle2,
  Library,
  Layers,
  FileVideo,
  MonitorPlay
} from "lucide-react";
import Image from 'next/image';
import { cn } from "@/lib/utils";
import { fetchOtakudesu } from "@/app/actions/otakudesu";

type Mode = 'home' | 'search' | 'ongoing' | 'completed' | 'schedule' | 'genres' | 'detail' | 'episode' | 'genre_browse';

export function OtakudesuExplorer() {
  const [currentMode, setCurrentMode] = useState<Mode>('home');
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [history, setHistory] = useState<any[]>([]);

  const fetchData = async (input: any, mode?: Mode) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchOtakudesu(input);
      if (!res?.status) throw new Error(res?.error || "Failed to fetch data.");
      
      if (mode) setCurrentMode(mode);
      setData(res.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentMode === 'home') fetchData({ mode: 'home' });
  }, [currentMode]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    fetchData({ query }, 'search');
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchData({ mode: currentMode, page: newPage });
  };

  const handleNavigate = (url: string) => {
    // Determine if it's detail or episode based on URL
    const mode = url.includes('/episode/') ? 'episode' : 'detail';
    fetchData({ url }, mode);
  };

  const renderHome = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up">
      {data?.results?.map((anime: any, i: number) => (
        <button 
          key={i} 
          onClick={() => handleNavigate(anime.url)}
          className="group text-left bg-secondary/20 border border-primary/5 rounded-3xl overflow-hidden hover:border-blue-500/30 transition-all hover:shadow-xl"
        >
          <div className="relative aspect-[3/4] w-full bg-black/5">
            <Image 
              src={anime.thumb} 
              alt={anime.title} 
              fill 
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              unoptimized
            />
            <div className="absolute bottom-3 left-3 flex flex-col gap-1">
              <Badge className="bg-blue-600 border-none rounded-lg text-[10px] uppercase font-bold w-fit">
                {anime.episodes}
              </Badge>
              <Badge variant="outline" className="bg-black/50 backdrop-blur-md text-white border-none rounded-lg text-[10px] uppercase font-bold w-fit">
                {anime.day}
              </Badge>
            </div>
          </div>
          <div className="p-4 space-y-1">
            <h4 className="font-headline font-bold text-sm line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
              {anime.title}
            </h4>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-60">{anime.date}</p>
          </div>
        </button>
      ))}
    </div>
  );

  const renderSearch = () => (
    <div className="space-y-6 animate-fade-in-up">
      <h3 className="text-lg font-bold font-headline px-2">{data?.message}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {data?.results?.map((anime: any, i: number) => (
          <button 
            key={i} 
            onClick={() => handleNavigate(anime.url)}
            className="group text-left bg-secondary/20 border border-primary/5 rounded-3xl overflow-hidden hover:border-blue-500/30 transition-all hover:shadow-xl"
          >
            <div className="relative aspect-[3/4] w-full bg-black/5">
              <Image 
                src={anime.thumb} 
                alt={anime.title} 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                unoptimized
              />
              <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                <Badge className="bg-emerald-600 border-none rounded-lg text-[10px] uppercase font-bold">{anime.status}</Badge>
                {anime.rating && <Badge variant="outline" className="bg-black/50 backdrop-blur-md text-white border-none rounded-lg text-[10px] uppercase font-bold">{anime.rating}</Badge>}
              </div>
            </div>
            <div className="p-4 space-y-2">
              <h4 className="font-headline font-bold text-sm line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                {anime.title}
              </h4>
              <div className="flex flex-wrap gap-1">
                {anime.genres?.split(', ').map((g: string, idx: number) => (
                  <span key={idx} className="text-[9px] text-muted-foreground bg-primary/5 px-2 py-0.5 rounded-full">{g}</span>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderSchedule = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up">
      {Object.entries(data?.schedule || {}).map(([day, items]: [string, any]) => (
        <div key={day} className="space-y-4">
          <div className="flex items-center gap-2 border-b border-primary/5 pb-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            <h3 className="font-headline font-bold uppercase tracking-widest text-sm">{day}</h3>
          </div>
          <div className="space-y-2">
            {items.map((item: any, i: number) => (
              <button 
                key={i} 
                onClick={() => handleNavigate(item.url)}
                className="w-full text-left p-3 rounded-2xl bg-secondary/30 hover:bg-blue-500/5 hover:text-blue-600 transition-all text-sm font-medium border border-transparent hover:border-blue-500/20"
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderDetail = () => (
    <div className="space-y-10 animate-fade-in-up">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Poster Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="relative aspect-[3/4] w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-primary/5 bg-secondary/10">
            <Image 
              src={data.thumb} 
              alt={data.title} 
              fill 
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="bg-secondary/20 p-8 rounded-[2rem] border border-primary/5 space-y-4">
             <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Series Info</h5>
             <div className="space-y-3">
               {data.info?.map((info: string, i: number) => (
                 <div key={i} className="text-sm font-medium border-b border-primary/5 pb-2 last:border-0">{info}</div>
               ))}
             </div>
          </div>
        </div>

        {/* Info Column */}
        <div className="lg:col-span-8 space-y-8">
          <h2 className="text-4xl font-bold font-headline leading-tight">{data.title}</h2>
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2">
              <Info className="w-3 h-3" /> Synopsis
            </h4>
            <p className="text-muted-foreground leading-relaxed">{data.synopsis}</p>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2">
              <ListOrdered className="w-3 h-3" /> Episodes
            </h4>
            <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {data.episode_list?.map((ep: any, i: number) => (
                <Button 
                  key={i} 
                  variant="outline" 
                  onClick={() => handleNavigate(ep.url)}
                  className="h-14 rounded-2xl justify-between px-6 border-primary/5 hover:bg-blue-500/5 hover:text-blue-600 transition-all font-bold"
                >
                  <span className="truncate max-w-[80%]">{ep.title}</span>
                  <span className="text-[10px] opacity-40 font-mono">{ep.date}</span>
                </Button>
              ))}
            </div>
          </div>

          {data.batch && (
            <div className="p-6 rounded-[2rem] bg-blue-500/5 border border-blue-500/10 space-y-4">
               <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600 flex items-center gap-2">
                 <Layers className="w-3 h-3" /> Complete Batch
               </h4>
               <Button asChild className="w-full h-12 rounded-xl bg-blue-600 text-white font-bold">
                 <a href={data.batch.url} target="_blank" rel="noopener noreferrer">
                   <Download className="w-4 h-4 mr-2" /> Download Full Batch
                 </a>
               </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderEpisode = () => (
    <div className="space-y-10 animate-fade-in-up">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold font-headline leading-tight">{data.title}</h2>
        <div className="flex gap-4">
           {data.has_prev && (
             <Button variant="ghost" size="sm" onClick={() => handleNavigate(data.prev_url)} className="rounded-full gap-2">
               <ChevronLeft className="w-4 h-4" /> Previous
             </Button>
           )}
           {data.has_next && (
             <Button variant="ghost" size="sm" onClick={() => handleNavigate(data.next_url)} className="rounded-full gap-2">
               Next <ChevronRight className="w-4 h-4" />
             </Button>
           )}
        </div>
      </div>

      {data.stream_url && (
        <div className="relative aspect-video w-full bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border border-primary/5">
           <iframe 
            src={data.stream_url} 
            className="w-full h-full border-none" 
            allowFullScreen
          />
        </div>
      )}

      <div className="space-y-8">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2">
          <Download className="w-4 h-4" /> Download Mirrors
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {data.download_links?.map((group: any, i: number) => (
             <div key={i} className="bg-secondary/20 p-6 rounded-[2rem] border border-primary/5 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className="bg-blue-600/10 text-blue-600 border-none px-3 py-1 font-bold text-xs">
                    {group.quality}
                  </Badge>
                  <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">{group.size}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {group.links.map((link: any, idx: number) => (
                    <Button 
                      key={idx} 
                      asChild 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full px-4 h-9 text-[10px] font-bold uppercase tracking-widest border-primary/10 hover:bg-blue-600 hover:text-white transition-all"
                    >
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        {link.host}
                      </a>
                    </Button>
                  ))}
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );

  return (
    <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md overflow-hidden rounded-[2.5rem]">
      <CardHeader className="p-8 sm:p-10 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">
              <Tv className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="font-headline text-2xl">Otakudesu Explorer</CardTitle>
              <CardDescription>Premium anime database with high-speed streaming and downloads.</CardDescription>
            </div>
          </div>
          
          <form onSubmit={handleSearch} className="relative group min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-40 group-focus-within:text-blue-500 transition-colors" />
            <Input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search anime..." 
              className="h-12 pl-12 rounded-2xl bg-secondary/30 border-primary/5 focus-visible:ring-blue-500/20"
            />
          </form>
        </div>
      </CardHeader>
      
      <CardContent className="p-8 sm:p-10 pt-0 space-y-8">
        <Tabs value={currentMode} onValueChange={(v) => setCurrentMode(v as Mode)} className="w-full">
          <TabsList className="bg-secondary/20 p-1.5 h-12 rounded-full border border-primary/5 w-full grid grid-cols-3 sm:grid-cols-6 mb-8 overflow-x-auto">
            <TabsTrigger value="home" className="rounded-full gap-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
              <Home className="w-3 h-3" /> Home
            </TabsTrigger>
            <TabsTrigger value="ongoing" className="rounded-full gap-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
              <Clock className="w-3 h-3" /> Ongoing
            </TabsTrigger>
            <TabsTrigger value="completed" className="rounded-full gap-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
              <CheckCircle2 className="w-3 h-3" /> Done
            </TabsTrigger>
            <TabsTrigger value="schedule" className="rounded-full gap-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
              <Calendar className="w-3 h-3" /> Day
            </TabsTrigger>
            <TabsTrigger value="genres" className="rounded-full gap-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
              <Library className="w-3 h-3" /> Genre
            </TabsTrigger>
            <TabsTrigger value="list" className="rounded-full gap-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
              <ListOrdered className="w-3 h-3" /> A-Z
            </TabsTrigger>
          </TabsList>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-blue-500/20" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-40">Synchronizing anime data...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center bg-destructive/5 rounded-[2.5rem] border border-destructive/10 space-y-4">
               <Info className="w-8 h-8 text-destructive mx-auto" />
               <p className="text-sm font-medium text-destructive">{error}</p>
               <Button variant="outline" size="sm" onClick={() => fetchData({ mode: currentMode })} className="rounded-full">Retry</Button>
            </div>
          ) : (
            <div className="min-h-[400px]">
              {currentMode === 'home' && renderHome()}
              {currentMode === 'search' && renderSearch()}
              {currentMode === 'schedule' && renderSchedule()}
              {currentMode === 'detail' && renderDetail()}
              {currentMode === 'episode' && renderEpisode()}
              
              {/* Pagination for list modes */}
              {(currentMode === 'ongoing' || currentMode === 'completed') && (
                <div className="space-y-10">
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {data?.results?.map((anime: any, i: number) => (
                        <button 
                          key={i} 
                          onClick={() => handleNavigate(anime.url)}
                          className="group text-left bg-secondary/20 border border-primary/5 rounded-3xl overflow-hidden hover:border-blue-500/30 transition-all hover:shadow-xl"
                        >
                          <div className="relative aspect-[3/4] w-full">
                            <Image src={anime.thumb} alt={anime.title} fill className="object-cover" unoptimized />
                          </div>
                          <div className="p-4 space-y-1">
                            <h4 className="font-headline font-bold text-sm line-clamp-2">{anime.title}</h4>
                            <p className="text-[10px] text-muted-foreground">{anime.episodes}</p>
                          </div>
                        </button>
                      ))}
                   </div>
                   <div className="flex justify-center items-center gap-4">
                      <Button 
                        disabled={page === 1} 
                        onClick={() => handlePageChange(page - 1)}
                        variant="ghost" className="rounded-full"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="font-mono text-xs font-bold">{page}</span>
                      <Button 
                        onClick={() => handlePageChange(page + 1)}
                        variant="ghost" className="rounded-full"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                   </div>
                </div>
              )}
            </div>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}
