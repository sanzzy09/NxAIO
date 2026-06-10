
"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Clapperboard, 
  Search, 
  Loader2, 
  Star, 
  Info, 
  PlayCircle, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Film,
  Tv,
  MonitorPlay,
  Play,
  Server,
  Layers,
  Calendar,
  AlertCircle,
  ShieldAlert
} from "lucide-react";
import Image from 'next/image';
import { cn } from "@/lib/utils";
import { fetchLk21 } from "@/app/actions/lk21";

type View = 'home' | 'search' | 'detail' | 'watch';
type MediaType = 'movie' | 'series';

export function Lk21Explorer() {
  const [activeTab, setActiveTab] = useState<MediaType>('movie');
  const [view, setView] = useState<View>('home');
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeServer, setActiveTabServer] = useState<string | null>(null);

  const fetchHome = async (type: MediaType) => {
    setLoading(true);
    setError(null);
    setView('home');
    try {
      const mode = type === 'movie' ? 'home' : 'series-home';
      const res = await fetchLk21({ mode });
      if (!res.status) throw new Error(res.error);
      setData(res.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHome(activeTab);
  }, [activeTab]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setView('search');
    try {
      const mode = activeTab === 'movie' ? 'search' : 'series-search';
      const res = await fetchLk21({ mode, query });
      if (!res.status) throw new Error(res.error);
      setData(res.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDetail = async (slug: string) => {
    setLoading(true);
    setError(null);
    try {
      const mode = activeTab === 'movie' ? 'detail' : 'series-detail';
      const res = await fetchLk21({ mode, slug });
      if (!res.status) throw new Error(res.error);
      
      setData(res.data);
      setView('detail');
      if (res.data.servers?.length > 0) setActiveTabServer(res.data.servers[0].url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWatchEpisode = async (slug: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchLk21({ mode: 'watch-episode', slug });
      if (!res.status) throw new Error(res.error);
      
      setData(res.data);
      setView('watch');
      if (res.data.servers?.length > 0) setActiveTabServer(res.data.servers[0].url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderGrid = (items: any[]) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in-up">
      {items.map((item, i) => (
        <button 
          key={i} 
          onClick={() => handleDetail(item.slug)}
          className="group text-left bg-secondary/20 border border-primary/5 rounded-2xl overflow-hidden hover:border-primary/20 transition-all hover:shadow-xl"
        >
          <div className="relative aspect-[2/3] w-full bg-black/5">
            <Image 
              src={item.poster} 
              alt={item.title} 
              fill 
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              unoptimized
            />
            <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
              {item.quality && <Badge className="bg-primary border-none rounded-md text-[10px] uppercase font-bold px-1.5 py-0.5">{item.quality}</Badge>}
              {item.rating && (
                <Badge variant="outline" className="bg-black/50 backdrop-blur-md text-white border-none rounded-md text-[10px] uppercase font-bold px-1.5 py-0.5 flex items-center gap-1">
                  <Star className="size-2.5 fill-yellow-400 text-yellow-400" /> {item.rating}
                </Badge>
              )}
            </div>
            {item.episode && (
              <div className="absolute bottom-2 left-2">
                <Badge className="bg-blue-600 border-none rounded-md text-[10px] uppercase font-bold px-1.5 py-0.5">EPS {item.episode}</Badge>
              </div>
            )}
          </div>
          <div className="p-3">
            <h4 className="font-headline font-bold text-xs line-clamp-2 leading-tight group-hover:text-primary transition-colors">
              {item.title}
            </h4>
            <div className="flex items-center justify-between mt-1">
               <span className="text-[10px] text-muted-foreground font-bold">{item.year}</span>
               {item.duration && <span className="text-[10px] text-muted-foreground font-medium opacity-60">{item.duration}</span>}
            </div>
          </div>
        </button>
      ))}
    </div>
  );

  const renderDetail = () => (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="relative aspect-[2/3] w-full rounded-[2rem] overflow-hidden shadow-2xl border border-primary/5 bg-secondary/10">
            <Image 
              src={data.poster} 
              alt={data.title} 
              fill 
              className="object-cover"
              unoptimized
            />
            <div className="absolute top-4 right-4 bg-primary text-primary-foreground p-3 rounded-2xl flex flex-col items-center gap-1 shadow-lg">
              <Star className="size-4 fill-primary-foreground" />
              <span className="text-xs font-bold">{data.rating || "-"}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl lg:text-4xl font-bold font-headline leading-tight tracking-tight">{data.title}</h2>
            <div className="flex flex-wrap gap-2">
              {data.genre?.map((g: string, i: number) => (
                <Badge key={i} variant="secondary" className="bg-primary/5 text-primary/60 border-none px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide">
                  {g}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
             <div className="p-4 bg-secondary/30 rounded-2xl border border-primary/5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">Year</p>
                <p className="text-sm font-bold font-headline">{data.year || "-"}</p>
             </div>
             <div className="p-4 bg-secondary/30 rounded-2xl border border-primary/5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">Quality</p>
                <p className="text-sm font-bold font-headline">{data.quality || "-"}</p>
             </div>
             <div className="p-4 bg-secondary/30 rounded-2xl border border-primary/5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">Duration</p>
                <p className="text-sm font-bold font-headline">{data.duration || "-"}</p>
             </div>
             <div className="p-4 bg-secondary/30 rounded-2xl border border-primary/5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">Country</p>
                <p className="text-sm font-bold font-headline">{data.country?.[0] || "-"}</p>
             </div>
          </div>

          <div className="space-y-3">
             <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2">
               <Info className="size-3" /> Synopsis
             </h4>
             <p className="text-sm text-muted-foreground leading-relaxed">
               {data.synopsis || "No synopsis available."}
             </p>
          </div>
        </div>
      </div>

      {activeTab === 'movie' ? (
        <div className="space-y-6 pt-4 border-t border-primary/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MonitorPlay className="size-4 text-primary/40" />
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Stream Video</h4>
            </div>
            {activeServer && (
              <Button asChild className="h-10 rounded-full px-6 bg-primary text-primary-foreground font-bold text-[10px] uppercase tracking-widest gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                <a href={activeServer} target="_blank" rel="noopener noreferrer">
                  Open External Player <ExternalLink className="size-3" />
                </a>
              </Button>
            )}
          </div>
          
          <div className="relative aspect-video w-full bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border border-primary/5 group">
             {activeServer ? (
               <iframe 
                src={activeServer} 
                className="w-full h-full border-none" 
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation"
              />
             ) : (
               <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/40 space-y-4">
                  <PlayCircle className="size-16 opacity-20" />
                  <p className="font-bold uppercase tracking-widest text-[10px]">Select a server below to start streaming</p>
               </div>
             )}
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">Select Server</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
               {data.servers?.map((srv: any, i: number) => (
                 <Button 
                  key={i} 
                  variant={activeServer === srv.url ? "default" : "outline"}
                  onClick={() => setActiveTabServer(srv.url)}
                  className="h-12 rounded-xl text-[10px] font-bold uppercase tracking-widest border-primary/5 shadow-sm transition-all"
                 >
                   <Server className="size-3 mr-2" /> {srv.server}
                 </Button>
               ))}
            </div>
          </div>

          <div className="p-6 bg-secondary/30 rounded-[2rem] border border-primary/10 flex items-start gap-4 animate-fade-in-up">
            <div className="p-2 bg-primary/5 rounded-xl">
              <ShieldAlert className="size-5 text-primary/60" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold font-headline uppercase tracking-wider">Troubleshooting Connection</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                If the player shows a <span className="font-bold">"Refused to connect"</span> or broken file icon, this is due to strict security policies from the streaming host. Please use the <span className="font-bold text-primary">"Open External Player"</span> button above to watch the content directly.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 pt-4 border-t border-primary/5">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2">
            <Layers className="size-4" /> Episodes List
          </h4>
          <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {data.episodes?.map((ep: any, i: number) => (
              <Button 
                key={i} 
                variant="outline" 
                onClick={() => handleWatchEpisode(ep.slug)}
                className="h-14 rounded-2xl justify-between px-6 border-primary/5 hover:bg-primary/5 hover:border-primary/20 transition-all font-bold"
              >
                <div className="flex items-center gap-4">
                   <div className="size-8 rounded-lg bg-secondary flex items-center justify-center text-[10px] font-bold font-mono">
                     {ep.episode || i+1}
                   </div>
                   <span className="text-sm truncate max-w-[250px]">{ep.title || ep.label}</span>
                </div>
                <Play className="size-3 opacity-20" />
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderWatch = () => (
    <div className="space-y-8 animate-fade-in-up">
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
           <h2 className="text-2xl font-bold font-headline leading-tight">{data.title}</h2>
           <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                disabled={!data.prevEp}
                onClick={() => handleWatchEpisode(data.prevEp!.split('/').filter(Boolean).pop()!)}
                className="rounded-full gap-2 text-[10px] font-bold uppercase tracking-widest"
              >
                <ChevronLeft className="size-3" /> Prev
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                disabled={!data.nextEp}
                onClick={() => handleWatchEpisode(data.nextEp!.split('/').filter(Boolean).pop()!)}
                className="rounded-full gap-2 text-[10px] font-bold uppercase tracking-widest"
              >
                Next <ChevronRight className="size-3" />
              </Button>
           </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
             <MonitorPlay className="size-4 text-primary/40" />
             <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Player Control</h4>
           </div>
           {activeServer && (
             <Button asChild className="h-10 rounded-full px-6 bg-primary text-primary-foreground font-bold text-[10px] uppercase tracking-widest gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-105">
                <a href={activeServer} target="_blank" rel="noopener noreferrer">
                  Open External Player <ExternalLink className="size-3" />
                </a>
             </Button>
           )}
        </div>

        <div className="relative aspect-video w-full bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border border-primary/5">
           {activeServer ? (
             <iframe 
                src={activeServer} 
                className="w-full h-full border-none" 
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation"
              />
           ) : (
             <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/40 space-y-4">
                <Loader2 className="size-10 animate-spin opacity-20" />
                <p className="font-bold uppercase tracking-widest text-[10px]">Loading Stream...</p>
             </div>
           )}
        </div>
        
        <div className="space-y-4">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">Select Server</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
             {data.servers?.map((srv: any, i: number) => (
               <Button 
                key={i} 
                variant={activeServer === srv.url ? "default" : "outline"}
                onClick={() => setActiveTabServer(srv.url)}
                className="h-12 rounded-xl text-[10px] font-bold uppercase tracking-widest border-primary/5 shadow-sm transition-all"
               >
                 <Server className="size-3 mr-2" /> {srv.server}
               </Button>
             ))}
          </div>
        </div>

        <div className="p-6 bg-secondary/30 rounded-[2rem] border border-primary/10 flex items-start gap-4 animate-fade-in-up">
          <div className="p-2 bg-primary/5 rounded-xl">
            <ShieldAlert className="size-5 text-primary/60" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold font-headline uppercase tracking-wider">Connection Trouble?</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              If the player says <span className="font-bold italic">"refused to connect"</span>, it means the host is blocking iframe embedding. Use the <span className="font-bold text-primary">"Open External Player"</span> button above to bypass this.
            </p>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-primary/5 flex items-center justify-between">
         <div className="flex items-center gap-3">
            {data.poster && (
              <div className="size-16 relative rounded-xl overflow-hidden flex-shrink-0">
                <Image src={data.poster} alt="Poster" fill className="object-cover" unoptimized />
              </div>
            )}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Currently Watching</p>
              <p className="text-sm font-bold font-headline">Season {data.season || "-"} · Episode {data.episode || "-"}</p>
            </div>
         </div>
         <Button 
          variant="ghost" 
          className="text-[10px] font-bold uppercase tracking-widest gap-2"
          onClick={() => handleDetail(data.seriesSlug)}
         >
           Series Details <ExternalLink className="size-3" />
         </Button>
      </div>
    </div>
  );

  return (
    <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md overflow-hidden rounded-[2.5rem]">
      <CardHeader className="p-8 sm:p-10 pb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <Clapperboard className="size-6" />
            </div>
            <div>
              <CardTitle className="font-headline text-2xl">LK21 Explorer</CardTitle>
              <CardDescription>Premium movie & drama streaming control center.</CardDescription>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Tabs 
              value={activeTab} 
              onValueChange={(v) => {
                setActiveTab(v as MediaType);
                setView('home');
              }}
              className="bg-secondary/30 p-1 rounded-full border border-primary/5"
            >
              <TabsList className="bg-transparent h-10 gap-1">
                <TabsTrigger value="movie" className="rounded-full gap-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                  <Film className="size-3" /> Movies
                </TabsTrigger>
                <TabsTrigger value="series" className="rounded-full gap-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                  <Tv className="size-3" /> Series
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <form onSubmit={handleSearch} className="relative group min-w-[260px] w-full sm:w-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground opacity-40 group-focus-within:text-primary transition-colors" />
              <Input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${activeTab}s...`} 
                className="h-12 pl-12 rounded-full bg-secondary/30 border-primary/5 focus-visible:ring-primary/20"
              />
            </form>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-8 sm:p-10 pt-0 space-y-8">
        {(view !== 'home' || error) && (
          <Button 
            variant="ghost" 
            onClick={() => fetchHome(activeTab)} 
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary -ml-2"
          >
            <ChevronLeft className="size-3" /> Back to Discover
          </Button>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="size-12 animate-spin text-primary/20" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-40">Synchronizing database content...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center bg-destructive/5 rounded-[2.5rem] border border-destructive/10 space-y-4">
             <Info className="size-10 text-destructive mx-auto opacity-40" />
             <p className="text-sm font-medium text-destructive">{error}</p>
             <Button variant="outline" size="sm" onClick={() => fetchHome(activeTab)} className="rounded-full font-bold uppercase text-[10px] tracking-widest">Retry Connection</Button>
          </div>
        ) : (
          <div className="min-h-[400px]">
            {view === 'home' && renderGrid(data || [])}
            {view === 'search' && (
              <div className="space-y-6">
                 <h3 className="text-lg font-bold font-headline px-2">Results for "{query}"</h3>
                 {renderGrid(data || [])}
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
