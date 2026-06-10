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
  Clock,
  Copy
} from "lucide-react";
import Image from 'next/image';
import { cn } from "@/lib/utils";
import { fetchDonghua } from "@/app/actions/donghua";
import { useToast } from "@/hooks/use-toast";

type ViewMode = 'home' | 'search' | 'detail' | 'watch' | 'schedule';

export function DonghuaExplorer() {
  const [view, setView] = useState<ViewMode>('home');
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeServer, setActiveServer] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFetch = async (params: { mode: string; query?: string; slug?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchDonghua(params);
      if (!res.status) throw new Error(res.error);
      setData(res.data);
      if (params.mode as ViewMode) setView(params.mode as ViewMode);
      if (params.mode === 'watch' && res.data.servers?.length > 0) {
        setActiveServer(res.data.video_url || res.data.servers[0].url);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'home') handleFetch({ mode: 'home' });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    handleFetch({ mode: 'search', query });
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "Link Copied", description: "You can now paste this into a private window." });
  };

  const renderHome = () => (
    <div className="space-y-12 animate-fade-in-up">
      {/* Slider Section */}
      {data?.slider?.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">Featured Donghua</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.slider.slice(0, 2).map((item: any, i: number) => (
              <div 
                key={i} 
                onClick={() => handleFetch({ mode: 'detail', slug: item.slug })}
                className="group relative h-64 rounded-[2.5rem] overflow-hidden cursor-pointer shadow-2xl border border-primary/5 transition-transform hover:scale-[1.01]"
              >
                <Image src={item.thumbnail} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" unoptimized />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-8 flex flex-col justify-end">
                   <h4 className="text-xl font-bold font-headline text-white mb-2 leading-tight">{item.title}</h4>
                   <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">{item.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Latest Grid */}
      <div className="space-y-6">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">Latest Updates</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {data?.latest_episodes?.map((item: any, i: number) => (
            <button 
              key={i} 
              // Changed from 'watch' to 'detail' per user request to see detail first
              onClick={() => handleFetch({ mode: 'detail', slug: item.slug })}
              className="group text-left bg-secondary/20 border border-primary/5 rounded-3xl overflow-hidden hover:border-blue-500/30 transition-all hover:shadow-xl"
            >
              <div className="relative aspect-[3/4] w-full bg-black/5">
                <Image src={item.thumbnail} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                <div className="absolute bottom-2 left-2">
                  <Badge className="bg-blue-600 border-none rounded-lg text-[10px] uppercase font-bold">{item.episode}</Badge>
                </div>
              </div>
              <div className="p-3">
                <h4 className="font-headline font-bold text-xs line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">{item.title}</h4>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSearch = () => (
    <div className="space-y-6 animate-fade-in-up">
       <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold font-headline px-2">Results for "{query}"</h3>
          <Button variant="ghost" size="sm" onClick={() => handleFetch({ mode: 'home' })} className="rounded-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Clear</Button>
       </div>
       <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {data?.results?.map((item: any, i: number) => (
            <button 
              key={i} 
              onClick={() => handleFetch({ mode: 'detail', slug: item.slug })}
              className="group text-left bg-secondary/20 border border-primary/5 rounded-3xl overflow-hidden hover:border-blue-500/30 transition-all hover:shadow-xl"
            >
              <div className="relative aspect-[3/4] w-full bg-black/5">
                <Image src={item.thumbnail} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                {item.episode && (
                  <div className="absolute bottom-2 left-2">
                    <Badge className="bg-emerald-600 border-none rounded-lg text-[10px] uppercase font-bold">{item.episode}</Badge>
                  </div>
                )}
              </div>
              <div className="p-3">
                <h4 className="font-headline font-bold text-xs line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">{item.title}</h4>
              </div>
            </button>
          ))}
       </div>
    </div>
  );

  const renderDetail = () => (
    <div className="space-y-10 animate-fade-in-up">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-6">
          <div className="relative aspect-[3/4] w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-primary/5 bg-secondary/10">
            <Image src={data.poster} alt={data.title} fill className="object-cover" unoptimized />
            <div className="absolute top-4 right-4 bg-blue-600 text-white p-3 rounded-2xl flex flex-col items-center gap-1 shadow-lg">
              <Star className="size-4 fill-white" />
              <span className="text-xs font-bold">{data.rating || "-"}</span>
            </div>
          </div>
          <div className="bg-secondary/20 p-8 rounded-[2rem] border border-primary/5 space-y-6">
             <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Status & Info</h5>
             <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Status</span>
                  <span className="text-sm font-bold text-blue-600">{data.status}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Episodes</span>
                  <span className="text-sm font-bold">{data.total_episodes}</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {data.genres?.map((g: string, i: number) => (
                    <Badge key={i} variant="secondary" className="bg-primary/5 text-primary/60 border-none px-3 py-1 rounded-lg text-[9px] uppercase font-bold tracking-wider">{g}</Badge>
                  ))}
                </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-10">
          <h2 className="text-4xl font-bold font-headline leading-tight tracking-tight">{data.title}</h2>
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2">
              <Info className="size-3" /> Synopsis
            </h4>
            <p className="text-muted-foreground leading-relaxed text-base">{data.synopsis}</p>
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
                  className="h-16 rounded-2xl justify-between px-6 border-primary/5 hover:bg-blue-500/5 hover:text-blue-600 transition-all font-bold group shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-secondary flex items-center justify-center text-xs font-bold font-mono group-hover:bg-blue-600 group-hover:text-white transition-all">{ep.episode}</div>
                    <span className="truncate max-w-[300px]">{ep.title}</span>
                  </div>
                  <span className="text-[10px] opacity-40 font-mono uppercase tracking-widest">{ep.release_date}</span>
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
            <h2 className="text-2xl font-bold font-headline leading-tight">{data.title}</h2>
            {data.series?.title && (
              <button onClick={() => handleFetch({ mode: 'detail', slug: data.series.url.split('/').filter(Boolean).pop() })} className="text-xs font-bold text-blue-600 uppercase tracking-widest hover:underline">
                View Series Collection
              </button>
            )}
         </div>
         <div className="flex gap-3">
            {data.prev_slug && (
              <Button variant="outline" size="sm" onClick={() => handleFetch({ mode: 'watch', slug: data.prev_slug })} className="rounded-full gap-2 border-primary/5 font-bold uppercase text-[10px] tracking-widest">
                <ChevronLeft className="size-3" /> Prev
              </Button>
            )}
            {data.next_slug && (
              <Button variant="outline" size="sm" onClick={() => handleFetch({ mode: 'watch', slug: data.next_slug })} className="rounded-full gap-2 border-primary/5 font-bold uppercase text-[10px] tracking-widest">
                Next <ChevronRight className="size-3" />
              </Button>
            )}
         </div>
      </div>

      <div className="space-y-6">
        <div className="relative aspect-video w-full bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border border-primary/5 group">
           <iframe 
            src={activeServer || ''} 
            className="w-full h-full border-none" 
            allowFullScreen
            allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
             <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2 ml-1">
               <Tv className="size-3" /> Switching Server
             </h4>
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {data.servers?.map((s: any, i: number) => (
                  <Button 
                    key={i} 
                    variant={activeServer === s.url ? "default" : "secondary"}
                    onClick={() => setActiveServer(s.url)}
                    className={cn(
                      "h-12 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                      activeServer === s.url ? "bg-blue-600 text-white shadow-xl shadow-blue-500/20" : "bg-secondary/50 border border-primary/5"
                    )}
                  >
                    {s.name}
                  </Button>
                ))}
             </div>
          </div>
          <div className="lg:col-span-4 space-y-4">
             <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2 ml-1">
               <PlayCircle className="size-3" /> Troubleshooting
             </h4>
             <div className="p-6 bg-secondary/20 rounded-[2rem] border border-primary/5 space-y-4">
                <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">If the player is blank or redirects to home, the provider is likely blocking third-party embeds.</p>
                <div className="flex gap-2">
                  <Button asChild className="flex-1 h-10 rounded-xl bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-blue-500/10">
                    <a href={activeServer || ''} target="_blank" rel="noopener noreferrer">Launch Player</a>
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(activeServer || '')} className="size-10 rounded-xl border-primary/5">
                    <Copy className="size-4" />
                  </Button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSchedule = () => (
    <div className="space-y-12 animate-fade-in-up">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
            const items = data?.filter((item: any) => item.day === day) || [];
            return (
              <div key={day} className="space-y-4">
                 <div className="flex items-center gap-2 border-b border-primary/5 pb-2">
                   <Calendar className="size-4 text-blue-600" />
                   <h3 className="font-headline font-bold uppercase tracking-widest text-sm">{day}</h3>
                 </div>
                 <div className="space-y-2">
                    {items.length > 0 ? items.map((item: any, i: number) => (
                      <button 
                        key={i} 
                        onClick={() => handleFetch({ mode: 'detail', slug: item.slug })}
                        className="w-full text-left p-4 rounded-2xl bg-secondary/30 hover:bg-blue-500/5 hover:text-blue-600 transition-all text-xs font-bold border border-transparent hover:border-blue-500/20 leading-snug"
                      >
                        {item.title}
                      </button>
                    )) : (
                      <p className="text-[10px] italic text-muted-foreground opacity-30 py-4 text-center">No schedule active.</p>
                    )}
                 </div>
              </div>
            );
          })}
       </div>
    </div>
  );

  return (
    <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md overflow-hidden rounded-[2.5rem]">
      <CardHeader className="p-8 sm:p-10 pb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">
              <Tv className="size-6" />
            </div>
            <div>
              <CardTitle className="font-headline text-2xl">Donghua Stream</CardTitle>
              <CardDescription>Premium Chinese animation hub with multi-server streaming.</CardDescription>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Tabs 
              value={view} 
              onValueChange={(v) => {
                if (v === 'home' || v === 'schedule') {
                  handleFetch({ mode: v });
                } else {
                  setView(v as ViewMode);
                }
              }}
              className="bg-secondary/30 p-1 rounded-full border border-primary/5"
            >
              <TabsList className="bg-transparent h-10 gap-1">
                <TabsTrigger value="home" className="rounded-full gap-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
                  <HomeIcon className="size-3" /> Discover
                </TabsTrigger>
                <TabsTrigger value="schedule" className="rounded-full gap-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
                  <Clock className="size-3" /> Schedule
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <form onSubmit={handleSearch} className="relative group min-w-[260px] w-full sm:w-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground opacity-40 group-focus-within:text-blue-600 transition-colors" />
              <Input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search titles...`} 
                className="h-12 pl-12 rounded-full bg-secondary/30 border-primary/5 focus-visible:ring-blue-500/20"
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
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-blue-600 -ml-2"
          >
            <ChevronLeft className="size-3" /> Back to Discover
          </Button>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="size-12 animate-spin text-blue-500/20" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-40">Synchronizing stream data...</p>
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
            {view === 'search' && renderSearch()}
            {view === 'detail' && renderDetail()}
            {view === 'watch' && renderWatch()}
            {view === 'schedule' && renderSchedule()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
