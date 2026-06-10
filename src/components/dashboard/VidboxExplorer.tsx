"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Film, 
  Search, 
  Loader2, 
  Star, 
  Info, 
  PlayCircle, 
  ChevronLeft,
  X,
  ExternalLink,
  Tv,
  LayoutGrid,
  TrendingUp,
  AlertCircle,
  Clapperboard,
  MonitorPlay,
  Globe
} from "lucide-react";
import Image from 'next/image';
import { cn } from "@/lib/utils";
import { vidboxSearch, fetchSeriesDetails } from "@/app/actions/vidbox";
import { useToast } from "@/hooks/use-toast";

type View = 'search' | 'detail' | 'watch';

export function VidboxExplorer() {
  const [view, setView] = useState<View>('search');
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [activeServer, setActiveServer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await vidboxSearch(query);
      if (!res.status) throw new Error(res.error);
      setResults(res.data.results);
      setView('search');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMedia = (media: any) => {
    setSelectedMedia(media);
    setView('detail');
    setActiveServer(media.embed);
    setSeason(1);
    setEpisode(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateEpisode = async (s: number, e: number) => {
    if (loading) return;
    setSeason(s);
    setEpisode(e);
    if (selectedMedia.type === 'tv') {
      setLoading(true);
      try {
        const res = await fetchSeriesDetails(selectedMedia.id, s, e);
        if (res.status) {
          setSelectedMedia(prev => ({ ...prev, servers: res.data.servers }));
          setActiveServer(res.data.embed);
        }
      } catch (err) {
        toast({ variant: 'destructive', title: 'Update failed', description: 'Could not fetch episode links.' });
      } finally {
        setLoading(false);
      }
    }
  };

  const renderGrid = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in-up">
      {results.map((media, i) => (
        <div 
          key={i} 
          onClick={() => handleSelectMedia(media)}
          className="group cursor-pointer text-left bg-secondary/20 border border-primary/5 rounded-[2rem] overflow-hidden hover:border-primary/20 transition-all hover:shadow-xl relative"
        >
          <div className="relative aspect-[2/3] w-full bg-black/5 pointer-events-none">
            <Image 
              src={media.poster || "https://placehold.co/500x750/png?text=No+Poster"} 
              alt={media.title} 
              fill 
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              unoptimized
            />
            <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
               <Badge className="bg-primary/80 backdrop-blur-md border-none text-[10px] uppercase font-bold px-2 py-0.5 rounded-lg">
                 {media.type}
               </Badge>
               {media.rating && (
                 <Badge variant="outline" className="bg-black/40 backdrop-blur-md text-white border-none text-[10px] font-bold flex items-center gap-1 px-2 py-0.5 rounded-lg">
                   <Star className="size-2.5 fill-yellow-400 text-yellow-400" /> {media.rating.toFixed(1)}
                 </Badge>
               )}
            </div>
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <PlayCircle className="size-12 text-white drop-shadow-2xl" />
            </div>
          </div>
          <div className="p-4 pointer-events-none">
            <h4 className="font-headline font-bold text-xs line-clamp-1 group-hover:text-primary transition-colors">
              {media.title}
            </h4>
            <p className="text-[10px] text-muted-foreground font-bold mt-1 opacity-60">{media.year || 'Unknown Year'}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderDetail = () => (
    <div className="space-y-10 animate-fade-in-up">
      <div className="relative w-full aspect-[21/9] rounded-[3rem] overflow-hidden shadow-2xl border border-primary/5 group">
         <Image 
          src={selectedMedia.backdrop || selectedMedia.poster} 
          alt={selectedMedia.title} 
          fill 
          className="object-cover opacity-60 group-hover:scale-[1.02] transition-transform duration-1000"
          unoptimized
         />
         <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
         <div className="absolute bottom-8 left-8 right-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
               <div className="flex items-center gap-3">
                 <Badge className="bg-primary/20 backdrop-blur-md border border-white/10 text-white uppercase text-[10px] font-bold">{selectedMedia.type}</Badge>
                 <span className="text-white/60 text-xs font-bold font-mono">{selectedMedia.year}</span>
               </div>
               <h2 className="text-4xl md:text-6xl font-bold font-headline text-white tracking-tighter leading-none">{selectedMedia.title}</h2>
            </div>
            <Button 
              size="lg" 
              onClick={() => setView('watch')} 
              className="rounded-full h-14 px-10 gap-3 bg-white text-black hover:bg-white/90 shadow-2xl font-bold transition-all hover:scale-105 active:scale-95"
            >
               <PlayCircle className="size-6" /> Start Streaming
            </Button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 px-2">
        <div className="lg:col-span-8 space-y-8">
           <div className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2">
                <span className="p-1 bg-primary/5 rounded">
                  <Info className="size-3" />
                </span> 
                Overview
              </h4>
              <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                {selectedMedia.description || "No synopsis available for this title."}
              </p>
           </div>

           {selectedMedia.type === 'tv' && (
             <div className="p-8 rounded-[2.5rem] bg-secondary/30 border border-primary/5 space-y-6">
                <div className="flex items-center gap-3">
                  <Tv className="size-5 text-primary/40" />
                  <h4 className="text-lg font-bold font-headline">Series Selector</h4>
                </div>
                <div className="flex flex-wrap gap-6">
                   <div className="space-y-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 ml-1">Season</span>
                      <div className="flex flex-wrap gap-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                          <Button 
                            key={s} 
                            variant={season === s ? "default" : "outline"}
                            onClick={() => updateEpisode(s, episode)}
                            className="size-10 rounded-xl font-bold"
                          >
                            {s}
                          </Button>
                        ))}
                      </div>
                   </div>
                   <div className="space-y-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 ml-1">Episode</span>
                      <div className="flex items-center gap-3">
                         <Input 
                           type="number" 
                           min={1} 
                           value={episode} 
                           onChange={(e) => updateEpisode(season, parseInt(e.target.value) || 1)}
                           className="w-20 h-10 rounded-xl bg-background border-primary/5 text-center font-bold"
                         />
                      </div>
                   </div>
                </div>
             </div>
           )}
        </div>

        <div className="lg:col-span-4 space-y-8">
           <div className="bg-secondary/20 p-8 rounded-[2.5rem] border border-primary/5 space-y-6">
              <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Stats & Metadata</h5>
              <div className="space-y-5">
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-muted-foreground">User Score</span>
                    <div className="flex items-center gap-2">
                       <Star className="size-4 fill-yellow-400 text-yellow-400" />
                       <span className="text-sm font-bold">{selectedMedia.rating?.toFixed(1) || 'N/A'}</span>
                    </div>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-muted-foreground">Popularity</span>
                    <span className="text-sm font-bold font-mono">{selectedMedia.popularity?.toLocaleString() || '-'}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-muted-foreground">IMDB ID</span>
                    <Badge variant="outline" className="font-mono text-[10px] uppercase border-primary/10">{selectedMedia.imdb || 'Unknown'}</Badge>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );

  const renderWatch = () => (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-2">
         <div className="space-y-2">
            <h2 className="text-2xl font-bold font-headline leading-tight flex items-center gap-3">
              {selectedMedia.title}
              {selectedMedia.type === 'tv' && (
                <Badge variant="outline" className="bg-primary/5 border-none font-mono text-xs">S{season} E{episode}</Badge>
              )}
            </h2>
            <button onClick={() => setView('detail')} className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] hover:text-primary transition-all">
               Return to Summary
            </button>
         </div>
      </div>

      <div className="space-y-6">
        <div className="relative aspect-video w-full bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border border-primary/5">
           {loading ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-black/40 backdrop-blur-md z-20">
                <Loader2 className="size-12 animate-spin text-white/20" />
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Re-authorizing server link...</p>
             </div>
           ) : (
             <iframe 
               src={activeServer || ''} 
               className="w-full h-full border-none" 
               allowFullScreen
               allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
               referrerPolicy="no-referrer"
               sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation"
             />
           )}
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
             <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2">
               <Globe className="size-3" /> CDN Mirrors & Languages
             </h4>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
             {selectedMedia.servers?.map((s: any, i: number) => (
               <Button 
                key={i} 
                variant={activeServer === s.url ? "default" : "outline"}
                onClick={() => setActiveServer(s.url)}
                className={cn(
                  "h-10 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all gap-1.5",
                  activeServer === s.url ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-secondary/40 border-primary/5 hover:bg-secondary/60"
                )}
               >
                 <span className="opacity-40">{s.flag}</span>
                 {s.name}
               </Button>
             ))}
          </div>
          
          <div className="p-6 rounded-[2.5rem] bg-secondary/20 border border-primary/5 flex items-center gap-4">
             <MonitorPlay className="size-5 text-primary/40" />
             <p className="text-[11px] text-muted-foreground leading-relaxed">
               Streaming from distributed CDN servers. If a server fails or displays too many ads, try switching to another mirror in the list above.
             </p>
          </div>
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
              <CardTitle className="font-headline text-3xl tracking-tight">Vidbox Explorer</CardTitle>
              <CardDescription className="text-sm font-medium">Premium movie & series search engine with multi-CDN streaming.</CardDescription>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2 w-full lg:max-w-md">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground opacity-40 group-focus-within:text-primary transition-colors" />
              <Input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for movies or TV series..." 
                className="h-12 pl-12 rounded-full bg-secondary/30 border-primary/5 focus-visible:ring-primary/20"
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading || !query.trim()} 
              className="h-12 px-6 rounded-full bg-primary text-primary-foreground font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : "Search"}
            </Button>
          </form>
        </div>
      </CardHeader>
      
      <CardContent className="p-8 sm:p-12 pt-0 space-y-10">
        {view !== 'search' && (
          <Button 
            variant="ghost" 
            onClick={() => setView('search')} 
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary -ml-4"
          >
            <ChevronLeft className="size-3" /> Back to Search Results
          </Button>
        )}

        {loading && view === 'search' ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="size-12 animate-spin text-primary/20" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-40">Polling TMDB cluster...</p>
          </div>
        ) : error ? (
          <div className="p-16 text-center bg-destructive/5 rounded-[3rem] border border-destructive/10 space-y-4 animate-fade-in-up">
             <AlertCircle className="size-12 text-destructive mx-auto opacity-30" />
             <p className="text-sm font-bold text-destructive">Operation Interrupted</p>
             <p className="text-xs text-destructive/60 font-medium">{error}</p>
             <Button variant="outline" size="sm" onClick={() => setView('search')} className="rounded-full px-8 h-10 font-bold uppercase text-[10px] tracking-widest">Acknowledge</Button>
          </div>
        ) : (
          <div className="min-h-[400px]">
            {view === 'search' && results.length > 0 && renderGrid()}
            {view === 'search' && results.length === 0 && !loading && (
              <div className="py-32 text-center space-y-6 animate-fade-in-up">
                 <div className="w-20 h-20 bg-background rounded-3xl flex items-center justify-center mx-auto border border-primary/5 shadow-inner">
                    <Film className="size-10 text-muted-foreground/20" />
                 </div>
                 <div className="space-y-1">
                    <p className="text-lg font-bold font-headline text-muted-foreground">Ready for exploration?</p>
                    <p className="text-sm text-muted-foreground/40 font-medium">Enter a title above to search the global cinematic database.</p>
                 </div>
              </div>
            )}
            {view === 'detail' && selectedMedia && renderDetail()}
            {view === 'watch' && selectedMedia && renderWatch()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
