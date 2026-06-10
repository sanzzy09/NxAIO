"use client"

import React, { useState, useEffect, useMemo } from 'react';
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
  PlayCircle,
  Home as HomeIcon,
  Download,
  ExternalLink,
  Library,
  Layers,
  ArrowRight,
  TrendingUp,
  Clock,
  LayoutGrid
} from "lucide-react";
import Image from 'next/image';
import { cn } from "@/lib/utils";
import { fetchAnichin } from "@/app/actions/anichin";
import { useToast } from "@/hooks/use-toast";

type ViewMode = 'home' | 'search' | 'list' | 'genres' | 'detail' | 'watch' | 'genre_browse';

export function AnichinExplorer() {
  const [view, setView] = useState<ViewMode>('home');
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeServer, setActiveServer] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFetch = async (params: { mode: string; query?: string; slug?: string; page?: number }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAnichin(params);
      if (!res.status) throw new Error(res.error);
      
      setData(res.data);
      setView(params.mode as ViewMode);
      
      if (params.mode === 'watch' && res.data.servers?.length > 0) {
        setActiveServer(res.data.servers[0].embedUrl);
      }
      
      if (params.page) setPage(params.page);
      if (params.mode === 'genre_browse') setActiveGenre(params.slug!);
      
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
          onClick={() => handleFetch({ mode: 'detail', slug: item.slug })}
          className="group text-left bg-secondary/20 border border-primary/5 rounded-3xl overflow-hidden hover:border-orange-500/30 transition-all hover:shadow-xl"
        >
          <div className="relative aspect-[3/4] w-full bg-black/5">
            <Image src={item.thumbnail} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
            <div className="absolute bottom-2 right-2 flex flex-col gap-1 items-end">
              {item.type && <Badge className="bg-orange-600 border-none rounded-lg text-[10px] uppercase font-bold">{item.type}</Badge>}
              {item.status && <Badge variant="outline" className="bg-black/50 backdrop-blur-md text-white border-none rounded-lg text-[10px] uppercase font-bold">{item.status}</Badge>}
              {item.eps && <Badge className="bg-blue-600 border-none rounded-lg text-[10px] uppercase font-bold">EP {item.eps}</Badge>}
            </div>
          </div>
          <div className="p-4 space-y-1">
            <h4 className="font-headline font-bold text-sm line-clamp-2 leading-tight group-hover:text-orange-600 transition-colors">{item.title}</h4>
            {item.headline && item.headline !== item.title && (
              <p className="text-[10px] text-muted-foreground opacity-60 font-medium line-clamp-1">{item.headline}</p>
            )}
          </div>
        </button>
      ))}
    </div>
  );

  const renderHome = () => (
    <div className="space-y-12 animate-fade-in-up">
      {data?.results?.map((section: any, idx: number) => (
        <div key={idx} className="space-y-6">
          <div className="flex items-center justify-between border-b border-primary/5 pb-4">
             <h3 className="text-xl font-bold font-headline capitalize flex items-center gap-2">
               <TrendingUp className="size-4 text-orange-500" />
               {section.section.replace(/_/g, ' ')}
             </h3>
             <Button variant="ghost" size="sm" className="rounded-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-orange-600" onClick={() => handleFetch({ mode: 'list' })}>
               View All <ArrowRight className="size-3 ml-1" />
             </Button>
          </div>
          {renderGrid(section.cards)}
        </div>
      ))}
      <div className="flex justify-center pt-8">
        <Button 
          variant="outline" 
          onClick={() => handleFetch({ mode: 'home', page: page + 1 })}
          className="rounded-full px-10 h-12 border-primary/5 font-bold uppercase text-[10px] tracking-widest hover:bg-orange-500/10 hover:text-orange-600 transition-all"
        >
          Load More Content
        </Button>
      </div>
    </div>
  );

  const renderGenres = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 animate-fade-in-up">
      {data?.map((genre: any, i: number) => (
        <button 
          key={i} 
          onClick={() => handleFetch({ mode: 'genre_browse', slug: genre.slug })}
          className="p-6 rounded-[2rem] bg-secondary/20 border border-primary/5 hover:border-orange-500/30 hover:bg-secondary/40 transition-all text-center group"
        >
          <span className="text-xs font-bold font-headline group-hover:text-orange-600 transition-colors uppercase tracking-wider">{genre.name}</span>
        </button>
      ))}
    </div>
  );

  const renderDetail = () => (
    <div className="space-y-10 animate-fade-in-up">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-6">
          <div className="relative aspect-[3/4] w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-primary/5 bg-secondary/10">
            <Image src={data.thumbnail} alt={data.name} fill className="object-cover" unoptimized />
            <div className="absolute top-4 right-4 bg-orange-600 text-white p-3 rounded-2xl flex flex-col items-center gap-1 shadow-lg">
              <Star className="size-4 fill-white" />
              <span className="text-xs font-bold">{data.rating || "-"}</span>
            </div>
          </div>
          <div className="bg-secondary/20 p-8 rounded-[2rem] border border-primary/5 space-y-6">
             <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Technical Info</h5>
             <div className="space-y-4">
                {Object.entries(data).map(([key, val]: [string, any]) => {
                  if (['name', 'thumbnail', 'genre', 'rating', 'synopsis', 'episodes', 'source'].includes(key)) return null;
                  return (
                    <div key={key} className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">{key.replace(/_/g, ' ')}</span>
                      <span className="text-sm font-bold truncate">{val}</span>
                    </div>
                  );
                })}
                <div className="flex flex-wrap gap-2 pt-2">
                  {data.genre?.map((g: string, i: number) => (
                    <Badge key={i} variant="secondary" className="bg-primary/5 text-primary/60 border-none px-3 py-1 rounded-lg text-[9px] uppercase font-bold tracking-wider">{g}</Badge>
                  ))}
                </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-10">
          <h2 className="text-4xl font-bold font-headline leading-tight tracking-tight">{data.name}</h2>
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2">
              <Info className="size-3" /> Synopsis
            </h4>
            <div className="space-y-4">
              {data.synopsis.paragraphs.map((p: string, i: number) => (
                <p key={i} className="text-muted-foreground leading-relaxed text-base">{p}</p>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2">
              <ListOrdered className="size-3" /> Episode List
            </h4>
            <div className="grid grid-cols-1 gap-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {data.episodes?.map((ep: any, i: number) => (
                <Button 
                  key={i} 
                  variant="outline" 
                  onClick={() => handleFetch({ mode: 'watch', slug: ep.slug })}
                  className="h-16 rounded-2xl justify-between px-6 border-primary/5 hover:bg-orange-500/5 hover:text-orange-600 transition-all font-bold group shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-secondary flex items-center justify-center text-xs font-bold font-mono group-hover:bg-orange-600 group-hover:text-white transition-all">{ep.episode || 'EP'}</div>
                    <span className="truncate max-w-[300px]">{ep.subtitle}</span>
                  </div>
                  <span className="text-[10px] opacity-40 font-mono uppercase tracking-widest">{ep.date}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWatch = () => (
    <div className="space-y-10 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
         <div className="space-y-2">
            <h2 className="text-2xl font-bold font-headline leading-tight">{data.name}</h2>
            <p className="text-xs font-bold text-orange-600 uppercase tracking-widest">{data.title}</p>
            <button onClick={() => handleFetch({ mode: 'detail', slug: data.rootSlug })} className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:text-orange-600 underline underline-offset-4">
              View Full Series
            </button>
         </div>
         <div className="flex gap-3">
            {data.navigation.prev && (
              <Button variant="outline" size="sm" onClick={() => handleFetch({ mode: 'watch', slug: data.navigation.prev })} className="rounded-full gap-2 border-primary/5 font-bold uppercase text-[10px] tracking-widest">
                <ChevronLeft className="size-3" /> Prev
              </Button>
            )}
            {data.navigation.next && (
              <Button variant="outline" size="sm" onClick={() => handleFetch({ mode: 'watch', slug: data.navigation.next })} className="rounded-full gap-2 border-primary/5 font-bold uppercase text-[10px] tracking-widest">
                Next <ChevronRight className="size-3" />
              </Button>
            )}
         </div>
      </div>

      <div className="space-y-6">
        <div className="relative aspect-video w-full bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border border-primary/5">
           <iframe 
            src={activeServer || ''} 
            className="w-full h-full border-none" 
            allowFullScreen
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-4">
             <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2 ml-1">
               <Tv className="size-3" /> Streaming Servers
             </h4>
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {data.servers?.map((s: any, i: number) => (
                  <Button 
                    key={i} 
                    variant={activeServer === s.embedUrl ? "default" : "secondary"}
                    onClick={() => setActiveServer(s.embedUrl)}
                    className={cn(
                      "h-12 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                      activeServer === s.embedUrl ? "bg-orange-600 text-white shadow-xl shadow-orange-500/20" : "bg-secondary/50 border border-primary/5"
                    )}
                  >
                    {s.label}
                  </Button>
                ))}
             </div>
          </div>
          <div className="lg:col-span-5 space-y-4">
             <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2 ml-1">
               <Download className="size-3" /> Download Mirrors
             </h4>
             <div className="grid grid-cols-1 gap-2">
                {data.downloads?.map((dl: any, i: number) => (
                  <div key={i} className="p-4 rounded-2xl bg-secondary/20 border border-primary/5 space-y-2">
                    <span className="text-[10px] font-bold uppercase text-orange-600">{dl.quality}</span>
                    <div className="flex flex-wrap gap-2">
                      {dl.links.map((link: any, idx: number) => (
                        <Button key={idx} asChild variant="outline" size="sm" className="h-8 rounded-lg text-[9px] font-bold border-primary/10 hover:bg-orange-500/10 hover:text-orange-600">
                          <a href={link.url} target="_blank" rel="noopener noreferrer">{link.host}</a>
                        </Button>
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

  return (
    <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md overflow-hidden rounded-[2.5rem]">
      <CardHeader className="p-8 sm:p-10 pb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 text-orange-500 rounded-xl">
              <Tv className="size-6" />
            </div>
            <div>
              <CardTitle className="font-headline text-2xl">Anichin Explorer</CardTitle>
              <CardDescription>Premium Donghua & Anime database with multi-server streaming.</CardDescription>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Tabs 
              value={view === 'genre_browse' ? 'genres' : view === 'list' ? 'list' : view === 'home' ? 'home' : 'home'} 
              onValueChange={(v) => {
                if (v === 'home') handleFetch({ mode: 'home' });
                else if (v === 'list') handleFetch({ mode: 'list' });
                else if (v === 'genres') handleFetch({ mode: 'genres' });
              }}
              className="bg-secondary/30 p-1 rounded-full border border-primary/5"
            >
              <TabsList className="bg-transparent h-10 gap-1">
                <TabsTrigger value="home" className="rounded-full gap-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-orange-600 data-[state=active]:text-white transition-all">
                  <HomeIcon className="size-3" /> Discover
                </TabsTrigger>
                <TabsTrigger value="list" className="rounded-full gap-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-orange-600 data-[state=active]:text-white transition-all">
                  <LayoutGrid className="size-3" /> Anime List
                </TabsTrigger>
                <TabsTrigger value="genres" className="rounded-full gap-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-orange-600 data-[state=active]:text-white transition-all">
                  <Library className="size-3" /> Genres
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <form onSubmit={handleSearch} className="relative group min-w-[260px] w-full sm:w-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground opacity-40 group-focus-within:text-orange-600 transition-colors" />
              <Input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search anime...`} 
                className="h-12 pl-12 rounded-full bg-secondary/30 border-primary/5 focus-visible:ring-orange-500/20"
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
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-orange-600 -ml-2"
          >
            <ChevronLeft className="size-3" /> Back to Discover
          </Button>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="size-12 animate-spin text-orange-500/20" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-40">Synchronizing anime database...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center bg-destructive/5 rounded-[2.5rem] border border-destructive/10 space-y-4">
             <Info className="size-10 text-destructive mx-auto opacity-40" />
             <p className="text-sm font-medium text-destructive">{error}</p>
             <Button variant="outline" size="sm" onClick={() => handleFetch({ mode: 'home' })} className="rounded-full font-bold uppercase text-[10px] tracking-widest">Retry Connection</Button>
          </div>
        ) : (
          <div className="min-h-[400px]">
            {view === 'home' && renderHome()}
            {view === 'search' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold font-headline px-2">Results for "{query}"</h3>
                {renderGrid(data?.results || [])}
              </div>
            )}
            {view === 'list' && (
              <div className="space-y-10">
                <h3 className="text-lg font-bold font-headline px-2">All Anime</h3>
                {renderGrid(data?.results || [])}
                <div className="flex justify-center items-center gap-4 pt-8">
                  <Button disabled={page === 1} onClick={() => handleFetch({ mode: 'list', page: page - 1 })} variant="ghost" className="rounded-full">
                    <ChevronLeft className="size-4" />
                  </Button>
                  <span className="font-mono text-xs font-bold bg-secondary px-3 py-1 rounded-lg">{page}</span>
                  <Button onClick={() => handleFetch({ mode: 'list', page: page + 1 })} variant="ghost" className="rounded-full">
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
            {view === 'genres' && renderGenres()}
            {view === 'genre_browse' && (
              <div className="space-y-10">
                <h3 className="text-lg font-bold font-headline px-2 capitalize">{activeGenre?.replace(/-/g, ' ')} Anime</h3>
                {renderGrid(data?.results || [])}
                <div className="flex justify-center items-center gap-4 pt-8">
                  <Button disabled={page === 1} onClick={() => handleFetch({ mode: 'genre_browse', slug: activeGenre!, page: page - 1 })} variant="ghost" className="rounded-full">
                    <ChevronLeft className="size-4" />
                  </Button>
                  <span className="font-mono text-xs font-bold bg-secondary px-3 py-1 rounded-lg">{page}</span>
                  <Button onClick={() => handleFetch({ mode: 'genre_browse', slug: activeGenre!, page: page + 1 })} variant="ghost" className="rounded-full">
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
            {view === 'detail' && renderDetail()}
            {view === 'watch' && renderWatch()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
