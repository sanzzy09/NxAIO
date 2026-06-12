"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Clapperboard, 
  Search, 
  Loader2, 
  Star, 
  Info, 
  ChevronLeft,
  Film,
  Globe,
  PlayCircle,
  MonitorPlay,
  X,
  User,
  Clock,
  History,
  TrendingUp,
  AlertCircle,
  Youtube
} from "lucide-react";
import Image from 'next/image';
import { cn } from "@/lib/utils";
import { fetchLk21 } from "@/app/actions/lk21";
import { useToast } from "@/hooks/use-toast";
import { PlaceHolderImages } from '@/lib/placeholder-images';

type View = 'home' | 'search' | 'detail';

const COUNTRIES = [
  { label: "Indonesia", id: "indonesia" },
  { label: "Korea", id: "korea" },
  { label: "Japan", id: "japan" },
  { label: "USA", id: "usa" },
  { label: "China", id: "china" },
  { label: "Thailand", id: "thailand" },
];

export function Lk21Explorer() {
  const [country, setCountry] = useState("indonesia");
  const [view, setView] = useState<View>('home');
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fallbackImage = PlaceHolderImages.find(img => img.id === 'media-fallback')?.imageUrl || "";

  const handleFetch = async (params: { 
    mode: string; 
    query?: string; 
    slug?: string; 
    page?: number; 
    country?: string 
  }) => {
    setLoading(true);
    setError(null);
    setActiveVideo(null);
    try {
      const res = await fetchLk21(params);
      if (!res.status) throw new Error(res.error);
      
      if (params.mode === 'detail') {
        setSelectedMovie(res.data);
        setView('detail');
        if (res.data.embed) setActiveVideo(res.data.embed);
      } else {
        setData(res.data);
        setView(params.mode as View);
      }
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message);
      toast({ variant: 'destructive', title: 'Connection Failure', description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetch({ mode: 'home', country });
  }, [country]);

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
          className="group text-left bg-secondary/20 border border-primary/5 rounded-[2rem] overflow-hidden hover:border-primary/20 transition-all hover:shadow-xl relative"
        >
          <div className="relative aspect-[2/3] w-full bg-black/5">
            <Image 
              src={item.thumb || fallbackImage} 
              alt={item.title} 
              fill 
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              unoptimized
            />
            <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
               <Badge className="bg-primary/80 backdrop-blur-md border-none text-[10px] uppercase font-bold px-2 py-0.5 rounded-lg shadow-lg">
                 {item.rating || 'N/A'}
               </Badge>
            </div>
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <PlayCircle className="size-12 text-white drop-shadow-2xl" />
            </div>
            {item.duration && (
              <div className="absolute bottom-3 right-3">
                 <Badge variant="outline" className="bg-black/60 backdrop-blur-md text-white border-none text-[9px] font-bold px-2 py-0.5 rounded-lg">
                   {item.duration}
                 </Badge>
              </div>
            )}
          </div>
          <div className="p-5 space-y-1">
            <h4 className="font-headline font-bold text-xs line-clamp-2 leading-tight group-hover:text-primary transition-colors">
              {item.title}
            </h4>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">
              {item.genres?.slice(0, 2).join(', ')}
            </p>
          </div>
        </button>
      ))}
    </div>
  );

  const renderDetail = () => (
    <div className="space-y-10 animate-fade-in-up">
      {/* Player Section */}
      {activeVideo && (
        <div className="space-y-4 animate-fade-in-up">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-2">
              <MonitorPlay className="size-3" /> Theater Mode Active
            </h4>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setActiveVideo(null)} 
              className="h-7 px-3 rounded-full text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-destructive/10 hover:text-destructive gap-2 transition-all"
            >
               <X className="size-3" /> Close Player
            </Button>
          </div>
          <div className="relative aspect-video w-full bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border border-primary/10 group">
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
        <div className="lg:col-span-4 space-y-8">
          <div className="relative aspect-[2/3] w-full rounded-[3rem] overflow-hidden shadow-2xl border border-primary/5 bg-secondary/10">
            <Image src={selectedMovie.thumb || fallbackImage} alt={selectedMovie.title} fill className="object-cover" unoptimized />
            <div className="absolute top-6 right-6 bg-primary text-primary-foreground p-4 rounded-[1.5rem] flex flex-col items-center gap-1 shadow-2xl">
              <Star className="size-4 fill-primary-foreground" />
              <span className="text-sm font-bold">{selectedMovie.rating || "-"}</span>
              <span className="text-[8px] uppercase tracking-widest font-bold opacity-60">{selectedMovie.votes} votes</span>
            </div>
          </div>

          <div className="bg-secondary/20 p-8 rounded-[2.5rem] border border-primary/5 space-y-6">
            <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 px-1">Orchestration Meta</h5>
            <div className="grid grid-cols-1 gap-5">
               {Object.entries(selectedMovie.meta || {}).map(([key, val]: [string, any]) => (
                 <div key={key} className="flex flex-col gap-1 border-b border-primary/5 pb-3 last:border-0">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-wider">{key.replace(/_/g, ' ')}</span>
                    <span className="text-sm font-bold truncate">{val}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-10">
          <div className="space-y-6">
            <h2 className="text-4xl lg:text-5xl font-bold font-headline leading-tight tracking-tighter">{selectedMovie.title}</h2>
            <div className="flex flex-wrap gap-2">
              {selectedMovie.genres?.map((g: string, i: number) => (
                <Badge key={i} variant="secondary" className="bg-primary/5 text-primary/60 border-none px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  {g}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                size="lg" 
                onClick={() => setView('watch')} 
                className="rounded-full h-14 px-10 gap-3 bg-primary text-primary-foreground shadow-2xl font-bold transition-all hover:scale-105 active:scale-95 flex-1"
              >
                 <PlayCircle className="size-6" /> Start Streaming
              </Button>
              {selectedMovie.trailer && (
                <Button 
                  variant="outline"
                  size="lg" 
                  asChild
                  className="rounded-full h-14 px-8 gap-3 border-primary/10 font-bold transition-all hover:bg-red-500/5 hover:text-red-600 hover:border-red-500/20 flex-1 sm:flex-none"
                >
                  <a href={selectedMovie.trailer} target="_blank" rel="noopener noreferrer">
                     <Youtube className="size-6" /> Watch Trailer
                  </a>
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-4">
             <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2 px-1">
               <Info className="size-3" /> Synopsis
             </h4>
             <p className="text-lg text-muted-foreground leading-relaxed font-medium">
               {selectedMovie.synopsis || "No synopsis metadata found for this record."}
             </p>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2 px-1">
              <User className="size-3" /> Cast Information
            </h4>
            <div className="flex flex-wrap gap-2">
               {selectedMovie.cast?.map((name: string, i: number) => (
                 <Badge key={i} variant="outline" className="px-4 py-1.5 rounded-xl border-primary/10 text-[11px] font-medium text-muted-foreground">
                   {name}
                 </Badge>
               ))}
            </div>
          </div>

          {selectedMovie.servers?.length > 0 && (
            <div className="space-y-6 pt-4">
               <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2 px-1">
                 <Globe className="size-3" /> Transmission Mirrors
               </h4>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedMovie.servers.map((srv: any, i: number) => (
                    <Button 
                      key={i} 
                      variant="outline" 
                      onClick={() => setActiveVideo(srv.url)}
                      className={cn(
                        "h-14 rounded-2xl justify-between px-6 border-primary/5 transition-all font-bold",
                        activeVideo === srv.url ? "bg-primary text-primary-foreground border-primary" : "bg-secondary/10 hover:bg-secondary/20"
                      )}
                    >
                      <span className="text-xs uppercase tracking-widest">{srv.label}</span>
                      <PlayCircle className="size-4 opacity-40" />
                    </Button>
                  ))}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md overflow-hidden rounded-[3rem]">
      <CardHeader className="p-8 sm:p-12 pb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 text-primary rounded-2xl shadow-inner">
              <Clapperboard className="size-8" />
            </div>
            <div>
              <CardTitle className="font-headline text-3xl tracking-tight">LK21 Explorer</CardTitle>
              <CardDescription className="text-sm font-medium">Premium movie orchestration layer based on Shanvyr logic.</CardDescription>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:max-w-xl">
             <div className="flex items-center bg-secondary/30 p-1 rounded-full border border-primary/5 shadow-inner overflow-x-auto max-w-full">
                {COUNTRIES.map((c) => (
                  <Button 
                    key={c.id}
                    variant="ghost" 
                    size="sm" 
                    onClick={() => { setCountry(c.id); setView('home'); }} 
                    className={cn(
                      "rounded-full h-9 px-4 text-[9px] font-bold uppercase tracking-wider transition-all flex-shrink-0", 
                      country === c.id && view === 'home' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground/60"
                    )}
                  >
                    {c.label}
                  </Button>
                ))}
            </div>

            <form onSubmit={handleSearch} className="flex-1 flex gap-2 w-full">
              <div className="relative flex-1 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground opacity-40 group-focus-within:text-primary transition-colors" />
                <Input 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search titles..." 
                  className="h-12 pl-14 rounded-full bg-secondary/30 border-primary/5 focus-visible:ring-primary/20"
                />
              </div>
              <Button 
                type="submit" 
                disabled={loading || !query.trim()} 
                className="h-12 px-6 rounded-full bg-primary text-primary-foreground font-bold shadow-xl shadow-primary/10 transition-all active:scale-95"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : "Orchestrate"}
              </Button>
            </form>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-8 sm:p-12 pt-0 space-y-10">
        {(view !== 'home' || error) && (
          <Button 
            variant="ghost" 
            onClick={() => { setView('home'); handleFetch({ mode: 'home', country }); }} 
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary -ml-4"
          >
            <ChevronLeft className="size-3" /> Back to Dashboard
          </Button>
        )}

        {loading && view !== 'detail' ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="size-12 animate-spin text-primary/20" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-40">Polling distributed CDN mirrors...</p>
          </div>
        ) : error ? (
          <div className="p-16 text-center bg-destructive/5 rounded-[3rem] border border-destructive/10 space-y-4 animate-fade-in-up">
             <AlertCircle className="size-12 text-destructive mx-auto opacity-30" />
             <p className="text-sm font-bold text-destructive">Handshake Failed</p>
             <p className="text-xs text-destructive/60 font-medium">{error}</p>
             <Button variant="outline" size="sm" onClick={() => handleFetch({ mode: 'home', country })} className="rounded-full px-8 h-10 font-bold uppercase text-[10px] tracking-widest">Retry Connection</Button>
          </div>
        ) : (
          <div className="min-h-[400px]">
            {view === 'home' && (
              <div className="space-y-8">
                <div className="flex items-center gap-2 px-2">
                  <TrendingUp className="size-4 text-primary/40" />
                  <h3 className="text-lg font-bold font-headline uppercase tracking-widest">Latest in {country}</h3>
                </div>
                {renderGrid(data || [])}
              </div>
            )}
            {view === 'search' && (
              <div className="space-y-8">
                <div className="flex items-center gap-2 px-2">
                  <Search className="size-4 text-primary/40" />
                  <h3 className="text-lg font-bold font-headline">Archive Results: "{query}"</h3>
                </div>
                {data?.length > 0 ? renderGrid(data) : (
                  <div className="py-24 text-center text-muted-foreground italic">No matches found in the film archives.</div>
                )}
              </div>
            )}
            {view === 'detail' && selectedMovie && renderDetail()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
