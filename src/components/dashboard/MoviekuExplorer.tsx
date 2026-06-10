'use client';

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
  ChevronLeft,
  Download,
  PlayCircle,
  ExternalLink,
  Calendar,
  Globe,
  Clock,
  User,
  AlertCircle,
  MonitorPlay,
  X
} from "lucide-react";
import Image from 'next/image';
import { cn } from "@/lib/utils";
import { fetchMovieku } from "@/app/actions/movieku";
import { useToast } from "@/hooks/use-toast";

type View = 'search' | 'detail';

export function MoviekuExplorer() {
  const [view, setView] = useState<View>('search');
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const res = await fetchMovieku({ mode: 'search', query });
      if (!res.status) throw new Error(res.error);
      setResults(res.data);
      setView('search');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDetail = async (url: string) => {
    setLoading(true);
    setError(null);
    setActiveVideo(null);
    try {
      const res = await fetchMovieku({ mode: 'detail', url });
      if (!res.status) throw new Error(res.error);
      setSelectedMedia(res.data);
      setView('detail');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderGrid = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in-up">
      {results.map((item, i) => (
        <div 
          key={i} 
          onClick={() => handleDetail(item.url)}
          className="group cursor-pointer text-left bg-secondary/20 border border-primary/5 rounded-[2rem] overflow-hidden hover:border-primary/20 transition-all hover:shadow-xl"
        >
          <div className="relative aspect-[2/3] w-full bg-black/5">
            <Image 
              src={item.thumbnail || "https://placehold.co/500x750/png?text=No+Poster"} 
              alt={item.title} 
              fill 
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              unoptimized
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <PlayCircle className="size-12 text-white drop-shadow-2xl" />
            </div>
          </div>
          <div className="p-4">
            <h4 className="font-headline font-bold text-xs line-clamp-2 leading-tight group-hover:text-primary transition-colors">
              {item.title}
            </h4>
          </div>
        </div>
      ))}
    </div>
  );

  const renderDetail = () => (
    <div className="space-y-10 animate-fade-in-up">
      <div className="flex flex-col md:flex-row gap-10">
        <div className="w-full md:w-80 flex-shrink-0">
          <div className="relative aspect-[2/3] w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-primary/5 bg-secondary/10">
            <Image src={selectedMedia.poster} alt={selectedMedia.title} fill className="object-cover" unoptimized />
            {selectedMedia.rating && (
              <div className="absolute top-4 right-4 bg-primary text-primary-foreground p-3 rounded-2xl flex flex-col items-center gap-1 shadow-lg">
                <Star className="size-4 fill-primary-foreground" />
                <span className="text-xs font-bold">{selectedMedia.rating}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 space-y-8">
          <div className="space-y-3">
            <h2 className="text-4xl font-bold font-headline leading-tight tracking-tight">{selectedMedia.title}</h2>
            <div className="flex flex-wrap gap-2">
              {selectedMedia.genre?.split(', ').map((g: string, i: number) => (
                <Badge key={i} variant="secondary" className="bg-primary/5 text-primary/60 border-none px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide">
                  {g}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
             <div className="p-5 bg-secondary/30 rounded-[1.5rem] border border-primary/5 space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                   <Calendar className="size-3" /> Released
                </div>
                <p className="text-xs font-bold">{selectedMedia.release || "-"}</p>
             </div>
             <div className="p-5 bg-secondary/30 rounded-[1.5rem] border border-primary/5 space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                   <Clock className="size-3" /> Runtime
                </div>
                <p className="text-xs font-bold">{selectedMedia.duration || "-"}</p>
             </div>
             <div className="p-5 bg-secondary/30 rounded-[1.5rem] border border-primary/5 space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                   <Globe className="size-3" /> Country
                </div>
                <p className="text-xs font-bold">{selectedMedia.country || "-"}</p>
             </div>
             <div className="p-5 bg-secondary/30 rounded-[1.5rem] border border-primary/5 space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                   <MonitorPlay className="size-3" /> Quality
                </div>
                <p className="text-xs font-bold text-primary">{selectedMedia.quality || "-"}</p>
             </div>
          </div>

          {activeVideo && (
            <div className="space-y-4 animate-fade-in-up">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                  <PlayCircle className="size-3" /> Streaming Active
                </h4>
                <Button variant="ghost" size="sm" onClick={() => setActiveVideo(null)} className="h-6 px-2 rounded-lg text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-destructive gap-1">
                   <X className="size-3" /> Stop
                </Button>
              </div>
              <div className="relative aspect-video w-full bg-black rounded-[2rem] overflow-hidden shadow-2xl border border-primary/5">
                 <iframe 
                  src={activeVideo} 
                  className="w-full h-full border-none" 
                  allowFullScreen
                  allow="autoplay; encrypted-media"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          )}

          <div className="space-y-4">
             <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2">
               <Info className="size-3" /> Synopsis
             </h4>
             <p className="text-sm text-muted-foreground leading-relaxed font-medium">
               {selectedMedia.synopsis || "No synopsis available."}
             </p>
          </div>

          {(selectedMedia.director || selectedMedia.stars) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4 border-t border-primary/5">
               {selectedMedia.director && (
                 <div className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Director</h4>
                    <div className="flex items-center gap-2">
                       <div className="p-1.5 bg-primary/5 rounded-lg">
                          <User className="size-3 text-primary/40" />
                       </div>
                       <span className="text-sm font-bold">{selectedMedia.director}</span>
                    </div>
                 </div>
               )}
               {selectedMedia.stars && (
                 <div className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Cast</h4>
                    <p className="text-sm font-medium leading-relaxed">{selectedMedia.stars}</p>
                 </div>
               )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {selectedMedia.stream && !activeVideo && (
                <div className="space-y-4">
                   <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2">
                     <PlayCircle className="size-3" /> Video Player
                   </h4>
                   <Button 
                    onClick={() => setActiveVideo(selectedMedia.stream)}
                    className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold shadow-xl shadow-primary/20 gap-2 transition-all hover:scale-[1.02]"
                   >
                     <PlayCircle className="size-5" /> Launch Streaming
                   </Button>
                </div>
             )}
             
             {Object.keys(selectedMedia.downloads || {}).length > 0 && (
                <div className="space-y-4 md:col-span-2">
                   <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2">
                     <Download className="size-3" /> Download Mirrors
                   </h4>
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {Object.entries(selectedMedia.downloads).map(([res, links]: [string, any]) => (
                        <div key={res} className="p-4 rounded-2xl bg-secondary/20 border border-primary/5 space-y-3">
                           <span className="text-[10px] font-bold uppercase text-primary tracking-widest">{res}</span>
                           <div className="flex flex-col gap-1.5">
                              {links.map((link: any, idx: number) => (
                                <Button key={idx} asChild variant="outline" size="sm" className="h-8 justify-between rounded-lg border-primary/5 bg-background hover:bg-primary/5 hover:text-primary transition-all font-bold text-[9px] uppercase tracking-wider">
                                   <a href={link.url} target="_blank" rel="noopener noreferrer">
                                      {link.name} <ExternalLink className="size-2.5 opacity-40" />
                                   </a>
                                </Button>
                              ))}
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             )}
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
            <div className="p-2 bg-indigo-500/10 text-indigo-600 rounded-xl">
              <Film className="size-6" />
            </div>
            <div>
              <CardTitle className="font-headline text-2xl">Movieku Explorer</CardTitle>
              <CardDescription>Premium movie directory with multiple quality download mirrors.</CardDescription>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2 w-full lg:max-w-md">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground opacity-40 group-focus-within:text-indigo-600 transition-colors" />
              <Input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for movies..." 
                className="h-12 pl-12 rounded-full bg-secondary/30 border-primary/5 focus-visible:ring-indigo-500/20"
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading || !query.trim()} 
              className="h-12 px-6 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xl shadow-indigo-500/10 transition-all"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : "Search"}
            </Button>
          </form>
        </div>
      </CardHeader>
      
      <CardContent className="p-8 sm:p-10 pt-0 space-y-8">
        {view !== 'search' && (
          <Button 
            variant="ghost" 
            onClick={() => setView('search')} 
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-indigo-600 -ml-4"
          >
            <ChevronLeft className="size-3" /> Back to Results
          </Button>
        )}

        {loading && view === 'search' ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="size-12 animate-spin text-indigo-500/20" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-40">Synchronizing database content...</p>
          </div>
        ) : error ? (
          <div className="p-16 text-center bg-destructive/5 rounded-[2.5rem] border border-destructive/10 space-y-4 animate-fade-in-up">
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
                    <p className="text-lg font-bold font-headline text-muted-foreground">Search your favorite films</p>
                    <p className="text-sm text-muted-foreground/40 font-medium">Enter a title above to explore the Movieku collection.</p>
                 </div>
              </div>
            )}
            {view === 'detail' && selectedMedia && renderDetail()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
