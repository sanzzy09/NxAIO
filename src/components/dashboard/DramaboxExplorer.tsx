"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Film, 
  Search, 
  Loader2, 
  Star, 
  Info, 
  ListOrdered, 
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  Home as HomeIcon,
  Download,
  Library,
  TrendingUp,
  LayoutGrid,
  ArrowRight,
  AlertCircle,
  Video,
  MonitorPlay,
  X
} from "lucide-react";
import Image from 'next/image';
import { cn } from "@/lib/utils";
import { fetchDramabox } from "@/app/actions/dramabox";
import { useToast } from "@/hooks/use-toast";

type ViewMode = 'home' | 'search' | 'detail';

export function DramaboxExplorer() {
  const [view, setView] = useState<ViewMode>('home');
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [selectedDrama, setSelectedDrama] = useState<any>(null);
  const { toast } = useToast();

  const handleFetch = async (params: { mode: string; query?: string; bookId?: string; episode?: number }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchDramabox(params);
      if (!res.status) throw new Error(res.error);
      
      if (params.mode === 'home' || params.mode === 'search') {
        setData(res.data);
        setView(params.mode as ViewMode);
      } else if (params.mode === 'detail') {
        setSelectedDrama(res.data);
        setView('detail');
      } else if (params.mode === 'stream') {
        if (res.data.videos?.length > 0) {
          setActiveVideo(res.data.videos[0].url);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          toast({ title: "Stream active", description: `Playing Episode ${params.episode}.` });
        } else {
          toast({ variant: 'destructive', title: 'Stream unavailable', description: 'No video sources found for this episode.' });
        }
      }
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
          onClick={() => handleFetch({ mode: 'detail', bookId: item.book_id })}
          className="group text-left bg-secondary/20 border border-primary/5 rounded-3xl overflow-hidden hover:border-purple-500/30 transition-all hover:shadow-xl relative"
        >
          <div className="relative aspect-[3/4] w-full bg-black/5">
            <Image 
              src={item.image || item.thumbnail || "https://placehold.co/400x600/png?text=No+Cover"} 
              alt={item.title} 
              fill 
              className="object-cover group-hover:scale-105 transition-transform duration-500" 
              unoptimized 
            />
            {item.episodes && (
              <div className="absolute bottom-2 left-2">
                <Badge variant="secondary" className="bg-white/90 text-purple-700 border-none rounded-lg text-[10px] font-bold uppercase tracking-widest px-2 py-0.5">
                  {item.episodes} EPS
                </Badge>
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <PlayCircle className="size-12 text-white drop-shadow-2xl" />
            </div>
          </div>
          <div className="p-4 space-y-1">
            <h4 className="font-headline font-bold text-xs line-clamp-2 leading-tight group-hover:text-purple-600 transition-colors">{item.title}</h4>
            {(item.views || item.rank) && (
              <p className="text-[10px] text-muted-foreground font-bold opacity-60 uppercase tracking-widest">
                {item.views || `Rank #${item.rank}`}
              </p>
            )}
          </div>
        </button>
      ))}
    </div>
  );

  const renderHome = () => (
    <div className="space-y-12 animate-fade-in-up">
      {data?.trending?.length > 0 && (
        <div className="space-y-6">
           <h3 className="text-xl font-bold font-headline flex items-center gap-2">
             <TrendingUp className="size-5 text-purple-500" /> Trending Dramas
           </h3>
           <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
              {data.trending.map((item: any, idx: number) => (
                <button 
                  key={idx} 
                  onClick={() => handleFetch({ mode: 'detail', bookId: item.book_id })}
                  className="flex-shrink-0 w-44 space-y-2 group text-left relative"
                >
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-primary/5">
                    <Image src={item.image} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform" unoptimized />
                    <div className="absolute top-2 left-2 size-6 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-[10px] shadow-lg">
                      {item.rank}
                    </div>
                  </div>
                  <h4 className="text-[10px] font-bold line-clamp-1 group-hover:text-purple-600 transition-colors">{item.title}</h4>
                </button>
              ))}
           </div>
        </div>
      )}

      <div className="space-y-6">
        <h3 className="text-xl font-bold font-headline flex items-center gap-2 border-b border-primary/5 pb-4">
          <Library className="size-5 text-purple-500" /> Latest Short Series
        </h3>
        {renderGrid(data?.latest || [])}
      </div>
    </div>
  );

  const renderDetail = () => (
    <div className="space-y-10 animate-fade-in-up">
      {/* Theater Player */}
      {activeVideo && (
        <div className="space-y-4 animate-fade-in-up">
           <div className="flex items-center justify-between px-2">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-600 flex items-center gap-2">
                <MonitorPlay className="size-3" /> Theater Mode Active
              </h4>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setActiveVideo(null)} 
                className="h-6 px-2 rounded-lg text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-destructive gap-1.5"
              >
                 <X className="size-3" /> Close Player
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-6">
          <div className="relative aspect-[3/4] w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-primary/5 bg-secondary/10">
            <Image src={selectedDrama.thumbnail} alt={selectedDrama.title} fill className="object-cover" unoptimized />
          </div>
          <div className="bg-secondary/20 p-8 rounded-[2rem] border border-primary/5 space-y-6">
             <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Technical Summary</h5>
             <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Followers</span>
                  <span className="text-sm font-bold">{selectedDrama.stats.followers}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Total Episodes</span>
                  <span className="text-sm font-bold">{selectedDrama.stats.total_episodes}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Upload Date</span>
                  <span className="text-sm font-bold">{selectedDrama.upload_date || "Unknown"}</span>
                </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-10">
          <h2 className="text-4xl font-bold font-headline leading-tight tracking-tight">{selectedDrama.title}</h2>
          
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2">
              <span className="p-1 bg-primary/5 rounded"><Info className="size-3" /></span>
              Synopsis
            </h4>
            <p className="text-muted-foreground leading-relaxed text-base">{selectedDrama.description}</p>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2">
              <span className="p-1 bg-primary/5 rounded"><ListOrdered className="size-4" /></span>
              Episodes Directory
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {selectedDrama.episode_list?.map((ep: any, i: number) => (
                <Button 
                  key={i} 
                  variant="outline" 
                  onClick={() => handleFetch({ mode: 'stream', bookId: selectedDrama.book_id, episode: ep.episode })}
                  className="h-12 rounded-xl border-primary/5 bg-secondary/10 hover:bg-purple-600 hover:text-white transition-all font-bold group shadow-sm text-xs"
                >
                  Ep {ep.episode}
                </Button>
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
            <div className="p-2 bg-purple-500/10 text-purple-600 rounded-xl">
              <Film className="size-6" />
            </div>
            <div>
              <CardTitle className="font-headline text-2xl">Dramabox Explorer</CardTitle>
              <CardDescription>Short drama archives directly via DramaboxDB API.</CardDescription>
            </div>
          </div>

          <form onSubmit={handleSearch} className="relative group min-w-[300px] w-full lg:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground opacity-40 group-focus-within:text-purple-600 transition-colors" />
            <Input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search short series...`} 
              className="h-12 pl-12 rounded-full bg-secondary/30 border-primary/5 focus-visible:ring-purple-500/20"
            />
          </form>
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
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-40">Polling DramaboxDB endpoints...</p>
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
            {view === 'search' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold font-headline px-2">Archive Results for "{query}"</h3>
                {data?.length > 0 ? renderGrid(data) : (
                  <div className="py-20 text-center">
                    <p className="text-muted-foreground">No matches found in the short drama database.</p>
                  </div>
                )}
              </div>
            )}
            {view === 'detail' && selectedDrama && renderDetail()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}