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
  X,
  Layers,
  ArrowRight
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

  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    if (url.includes('acefile.co/f/')) {
      const parts = url.split('/f/')[1]?.split('/');
      const id = parts?.[0];
      return id ? `https://acefile.co/player/${id}` : url;
    }
    return url;
  };

  const isPlayable = (url: string) => {
    if (!url) return false;
    return url.includes('acefile.co/f/') || url.includes('abyssplayer.com');
  };

  const renderGrid = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in-up">
      {results.map((item, i) => (
        <div 
          key={i} 
          onClick={() => handleDetail(item.url)}
          className="group cursor-pointer text-left bg-secondary/20 border border-primary/5 rounded-[2.5rem] overflow-hidden hover:border-primary/20 transition-all hover:shadow-xl relative"
        >
          <div className="relative aspect-[2/3] w-full bg-black/5">
            {item.thumbnail ? (
              <Image 
                src={item.thumbnail} 
                alt={item.title} 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted/50">
                <Film className="size-10 text-muted-foreground/20" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <PlayCircle className="size-12 text-white drop-shadow-2xl" />
            </div>
          </div>
          <div className="p-5">
            <h4 className="font-headline font-bold text-xs line-clamp-2 leading-tight group-hover:text-primary transition-colors">
              {item.title}
            </h4>
          </div>
        </div>
      ))}
    </div>
  );

  const renderDetail = () => (
    <div className="space-y-12 animate-fade-in-up">
      {/* Player Section - Theater Mode */}
      {activeVideo && (
        <div className="space-y-4 animate-fade-in-up">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
               <div className="relative flex h-3 w-3">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
               </div>
               <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Now Streaming</h4>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setActiveVideo(null)} 
              className="h-8 rounded-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-destructive/10 hover:text-destructive gap-2 px-4 transition-all"
            >
               <X className="size-3" /> Stop Player
            </Button>
          </div>
          <div className="relative aspect-video w-full bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border border-primary/10 group">
             <iframe 
              src={activeVideo} 
              className="w-full h-full border-none" 
              allowFullScreen
              allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
              referrerPolicy="no-referrer"
              sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Poster & Quick Info */}
        <div className="lg:col-span-4 space-y-8">
          <div className="relative aspect-[2/3] w-full rounded-[3rem] overflow-hidden shadow-2xl border border-primary/5 bg-secondary/10">
            {selectedMedia.poster ? (
              <Image src={selectedMedia.poster} alt={selectedMedia.title} fill className="object-cover" unoptimized />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted/50">
                <Film className="size-16 text-muted-foreground/20" />
              </div>
            )}
            {selectedMedia.rating && (
              <div className="absolute top-6 right-6 bg-primary text-primary-foreground p-4 rounded-[1.5rem] flex flex-col items-center gap-1 shadow-2xl ring-4 ring-background/10">
                <Star className="size-4 fill-primary-foreground" />
                <span className="text-sm font-bold">{selectedMedia.rating}</span>
              </div>
            )}
          </div>

          <div className="bg-secondary/20 p-8 rounded-[2.5rem] border border-primary/5 space-y-6">
            <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 px-1">Technical Specs</h5>
            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                     <Calendar className="size-3" /> Released
                  </div>
                  <p className="text-xs font-bold leading-none">{selectedMedia.release || "-"}</p>
               </div>
               <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                     <Clock className="size-3" /> Runtime
                  </div>
                  <p className="text-xs font-bold leading-none">{selectedMedia.duration || "-"}</p>
               </div>
               <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                     <Globe className="size-3" /> Country
                  </div>
                  <p className="text-xs font-bold leading-none">{selectedMedia.country || "-"}</p>
               </div>
               <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                     <MonitorPlay className="size-3" /> Quality
                  </div>
                  <p className="text-xs font-bold leading-none text-primary">{selectedMedia.quality || "-"}</p>
               </div>
            </div>
          </div>
        </div>

        {/* Detailed Description & Mirrors */}
        <div className="lg:col-span-8 space-y-10">
          <div className="space-y-6">
            <h2 className="text-4xl lg:text-5xl font-bold font-headline leading-tight tracking-tighter">{selectedMedia.title}</h2>
            <div className="flex flex-wrap gap-2">
              {selectedMedia.genre?.split(', ').map((g: string, i: number) => (
                <Badge key={i} variant="secondary" className="bg-primary/5 text-primary/60 border-none px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  {g}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-4">
             <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2 px-1">
               <Info className="size-3" /> Synopsis
             </h4>
             <p className="text-lg text-muted-foreground leading-relaxed font-medium">
               {selectedMedia.synopsis || "No synopsis available."}
             </p>
          </div>

          {(selectedMedia.director || selectedMedia.stars) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-primary/5">
               {selectedMedia.director && (
                 <div className="space-y-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Director</h4>
                    <div className="flex items-center gap-3 bg-secondary/20 p-4 rounded-2xl border border-primary/5">
                       <div className="p-2 bg-primary/5 rounded-xl">
                          <User className="size-4 text-primary/40" />
                       </div>
                       <span className="text-sm font-bold font-headline">{selectedMedia.director}</span>
                    </div>
                 </div>
               )}
               {selectedMedia.stars && (
                 <div className="space-y-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Starring</h4>
                    <p className="text-sm font-medium leading-relaxed bg-secondary/20 p-4 rounded-2xl border border-primary/5">
                      {selectedMedia.stars}
                    </p>
                 </div>
               )}
            </div>
          )}

          {/* Mirror Selection UI */}
          <div className="space-y-8 pt-4">
             <div className="flex items-center justify-between px-1">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2">
                  <Layers className="size-3" /> Quality & Mirror Selection
                </h4>
             </div>

             <div className="grid grid-cols-1 gap-6">
                {Object.keys(selectedMedia.downloads || {}).length > 0 ? (
                  Object.entries(selectedMedia.downloads).map(([res, links]: [string, any]) => (
                    <div key={res} className="p-8 rounded-[2.5rem] bg-secondary/10 border border-primary/5 space-y-6">
                       <div className="flex items-center gap-4">
                          <Badge className="bg-primary text-primary-foreground border-none rounded-xl px-4 py-2 font-bold text-sm shadow-xl shadow-primary/10">
                            {res}
                          </Badge>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Available Mirrors</span>
                       </div>
                       
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {links.map((link: any, idx: number) => (
                            <div key={idx} className="flex gap-2">
                              <Button asChild variant="outline" className="h-14 flex-1 justify-between rounded-2xl border-primary/5 bg-background hover:bg-primary/5 hover:text-primary transition-all font-bold group shadow-sm px-6">
                                 <a href={link.url} target="_blank" rel="noopener noreferrer">
                                    <div className="flex items-center gap-3">
                                       <span className="text-xs uppercase tracking-wide">{link.name}</span>
                                    </div>
                                    <ExternalLink className="size-3.5 opacity-20 group-hover:opacity-100 transition-opacity" />
                                 </a>
                              </Button>
                              {isPlayable(link.url) && (
                                <Button 
                                  variant="secondary" 
                                  size="icon" 
                                  className="h-14 w-14 rounded-2xl bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"
                                  onClick={() => {
                                    setActiveVideo(getEmbedUrl(link.url));
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                    toast({
                                      title: "Mirror Activated",
                                      description: `Now playing ${res} version from ${link.name}.`,
                                    });
                                  }}
                                >
                                  <PlayCircle className="size-6" />
                                </Button>
                              )}
                            </div>
                          ))}
                       </div>
                    </div>
                  ))
                ) : selectedMedia.stream ? (
                   <div className="space-y-4">
                      <p className="text-xs text-muted-foreground/60 italic ml-1">No direct mirrors found. Use the primary player below.</p>
                      <Button 
                        onClick={() => setActiveVideo(getEmbedUrl(selectedMedia.stream))}
                        className="w-full h-16 rounded-[2rem] bg-primary text-primary-foreground font-bold shadow-2xl shadow-primary/20 gap-3 transition-all hover:scale-[1.01]"
                      >
                        <MonitorPlay className="size-6" /> Start Main Stream
                      </Button>
                   </div>
                ) : (
                  <div className="p-12 text-center border-2 border-dashed border-primary/5 rounded-[2.5rem]">
                     <p className="text-sm text-muted-foreground font-medium opacity-40 italic">No mirrors currently indexable for this title.</p>
                  </div>
                )}
             </div>
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
            <div className="p-3 bg-indigo-500/10 text-indigo-600 rounded-2xl shadow-inner">
              <Film className="size-8" />
            </div>
            <div>
              <CardTitle className="font-headline text-3xl tracking-tight">Movieku Explorer</CardTitle>
              <CardDescription className="text-sm font-medium">Premium movie directory with multi-quality mirrors.</CardDescription>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2 w-full lg:max-w-md">
            <div className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground opacity-40 group-focus-within:text-indigo-600 transition-colors" />
              <Input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for movies..." 
                className="h-14 pl-14 rounded-full bg-secondary/30 border-primary/5 focus-visible:ring-indigo-500/20"
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading || !query.trim()} 
              className="h-14 px-8 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xl shadow-indigo-500/10 transition-all active:scale-95"
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
                 <div className="w-24 h-24 bg-background rounded-[2rem] flex items-center justify-center mx-auto border border-primary/5 shadow-inner">
                    <Film className="size-10 text-muted-foreground/20" />
                 </div>
                 <div className="space-y-2">
                    <p className="text-xl font-bold font-headline text-muted-foreground">Search your favorite films</p>
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
