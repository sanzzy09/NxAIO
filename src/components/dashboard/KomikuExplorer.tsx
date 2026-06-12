"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Search, 
  Loader2, 
  Info, 
  ChevronLeft,
  ChevronRight,
  Library,
  AlertCircle,
  TrendingUp,
  LayoutGrid,
  Trophy,
  ExternalLink,
  BookMarked,
  Eye,
  ArrowUp,
  Maximize2,
  Minimize2,
  Download,
  Scroll
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchKomiku, proxyImage } from "@/app/actions/komiku";
import { useToast } from "@/hooks/use-toast";

type View = 'discover' | 'search' | 'detail' | 'reader';

export function KomikuExplorer() {
  const [view, setView] = useState<View>('discover');
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [discoverItems, setDiscoverItems] = useState<any[]>([]);
  const [rankItems, setRankItems] = useState<any[]>([]);
  const [selectedManga, setSelectedManga] = useState<any>(null);
  const [chapterData, setChapterData] = useState<any>(null);
  const [proxiedImages, setProxiedImages] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [fullScreen, setFullScreen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDiscover();
  }, []);

  const loadDiscover = async () => {
    setLoading(true);
    setError(null);
    try {
      const [homeRes, rankRes] = await Promise.all([
        fetchKomiku({ mode: 'home' }),
        fetchKomiku({ mode: 'rank', rankType: 'mingguan' })
      ]);
      if (homeRes.status) setDiscoverItems(homeRes.data.results);
      if (rankRes.status) setRankItems(rankRes.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const res = await fetchKomiku({ mode: 'search', query });
      if (!res.status) throw new Error(res.error);
      
      setResults(res.data.results);
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
    try {
      const res = await fetchKomiku({ mode: 'detail', url });
      if (!res.status) throw new Error(res.error);
      setSelectedManga({ ...res.data, url });
      setView('detail');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadChapter = async (url: string) => {
    setLoading(true);
    setError(null);
    setProxiedImages({});
    try {
      const res = await fetchKomiku({ mode: 'chapter', url });
      if (!res.status) throw new Error(res.error);
      
      setChapterData(res.data);
      setView('reader');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Parallel proxying of images to speed up loading
      const images = res.data.images;
      images.forEach(async (imgUrl: string) => {
        const proxyRes = await proxyImage(imgUrl);
        if (proxyRes.status) {
          setProxiedImages(prev => ({ ...prev, [imgUrl]: proxyRes.data }));
        }
      });

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderGrid = (items: any[]) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in-up">
      {items.map((item, i) => (
        <div 
          key={i} 
          onClick={() => handleDetail(item.url)}
          className="group cursor-pointer text-left bg-secondary/20 border border-primary/5 rounded-[2rem] overflow-hidden hover:border-orange-500/20 transition-all hover:shadow-xl relative"
        >
          <div className="relative aspect-[3/4] w-full bg-black/5">
            {item.thumbnail ? (
              <img 
                src={item.thumbnail} 
                alt={item.title} 
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted/50">
                 <BookOpen className="size-10 text-muted-foreground/20" />
              </div>
            )}
            <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
               <Badge className="bg-orange-600 border-none text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-lg">
                 {item.type}
               </Badge>
            </div>
          </div>
          <div className="p-4 space-y-1">
            <h4 className="font-headline font-bold text-xs line-clamp-2 leading-tight group-hover:text-orange-600 transition-colors">
              {item.title}
            </h4>
            <p className="text-[10px] text-muted-foreground font-bold opacity-60 uppercase">{item.latest}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderDetail = () => (
    <div className="space-y-10 animate-fade-in-up">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-6">
          <div className="relative aspect-[3/4] w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-primary/5 bg-secondary/10">
            {selectedManga.thumbnail && (
              <img src={selectedManga.thumbnail} alt={selectedManga.title} className="object-cover w-full h-full" />
            )}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[80%]">
               <div className="bg-orange-600 text-white p-3 rounded-2xl flex flex-col items-center gap-1 shadow-2xl">
                 <BookMarked className="size-4" />
                 <span className="text-[10px] font-bold uppercase tracking-widest">{selectedManga.info.status}</span>
               </div>
            </div>
          </div>
          <div className="bg-secondary/20 p-8 rounded-[2rem] border border-primary/5 space-y-6">
             <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Series Metadata</h5>
             <div className="space-y-4">
                {Object.entries(selectedManga.info || {}).map(([key, val]: [string, any]) => (
                  <div key={key} className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">{key.replace(/_/g, ' ')}</span>
                    <span className="text-sm font-bold truncate">{val}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-10">
          <div className="space-y-4">
             <h2 className="text-4xl font-bold font-headline leading-tight tracking-tight">{selectedManga.title}</h2>
             {selectedManga.altTitle && <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{selectedManga.altTitle}</p>}
             <div className="flex flex-wrap gap-2 pt-2">
                {selectedManga.genres?.map((g: string, i: number) => (
                  <Badge key={i} variant="secondary" className="bg-primary/5 text-primary/60 border-none px-3 py-1 rounded-lg text-[9px] uppercase font-bold">
                    {g}
                  </Badge>
                ))}
             </div>
          </div>

          <div className="space-y-4">
             <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2">
               <Info className="size-3" /> Synopsis
             </h4>
             <p className="text-muted-foreground leading-relaxed text-base">
               {selectedManga.synopsis || "No description provided."}
             </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-primary/5 pb-4">
               <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2">
                 <Library className="size-3" /> Chapter Archive
               </h4>
               <span className="text-[10px] font-bold uppercase text-muted-foreground/40">{selectedManga.chapters?.length} Chapters Indexed</span>
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {selectedManga.chapters?.map((ch: any, i: number) => (
                <Button 
                  key={i} 
                  variant="outline" 
                  onClick={() => loadChapter(ch.url)}
                  className="h-16 rounded-2xl justify-between px-6 border border-primary/5 bg-secondary/10 hover:bg-orange-500/5 hover:text-orange-600 transition-all font-bold group shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-secondary flex items-center justify-center text-xs font-bold font-mono group-hover:bg-orange-600 group-hover:text-white transition-all">
                      {selectedManga.chapters.length - i}
                    </div>
                    <span className="truncate max-w-[250px]">{ch.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                       <span className="text-[10px] opacity-40 font-mono uppercase tracking-widest">{ch.date}</span>
                       <Eye className="size-4 opacity-20 group-hover:opacity-100" />
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReader = () => (
    <div className={cn(
      "space-y-8 animate-fade-in-up transition-all duration-500",
      fullScreen ? "fixed inset-0 z-50 bg-background overflow-y-auto p-4 md:p-8" : "relative"
    )}>
      {/* Reader Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-card border border-primary/5 p-6 rounded-[2rem] shadow-xl backdrop-blur-md sticky top-0 z-20">
         <div className="space-y-1">
            <h2 className="text-xl font-bold font-headline leading-tight">{chapterData.title}</h2>
            <button 
              onClick={() => handleDetail(chapterData.seriesUrl)}
              className="text-[10px] font-bold text-orange-600 uppercase tracking-widest hover:underline flex items-center gap-1"
            >
              <Library className="size-2.5" /> {chapterData.seriesTitle}
            </button>
         </div>
         <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setFullScreen(!fullScreen)}
              className="rounded-full gap-2 border-primary/5 font-bold uppercase text-[10px] tracking-widest"
            >
              {fullScreen ? <Minimize2 className="size-3" /> : <Maximize2 className="size-3" />}
              {fullScreen ? "Exit" : "Expand"}
            </Button>
            <div className="h-4 w-px bg-primary/10 mx-1" />
            <Button 
              variant="outline" 
              size="sm" 
              disabled={!chapterData.prev}
              onClick={() => loadChapter(chapterData.prev)}
              className="rounded-full gap-2 border-primary/5 font-bold uppercase text-[10px] tracking-widest"
            >
              <ChevronLeft className="size-3" /> Prev
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={!chapterData.next}
              onClick={() => loadChapter(chapterData.next)}
              className="rounded-full gap-2 border-primary/5 font-bold uppercase text-[10px] tracking-widest"
            >
              Next <ChevronRight className="size-3" />
            </Button>
            {fullScreen && (
              <Button variant="ghost" size="icon" onClick={() => setFullScreen(false)} className="rounded-full hover:bg-destructive/10 hover:text-destructive ml-2">
                <ChevronLeft className="size-5" />
              </Button>
            )}
         </div>
      </div>

      {/* Comic Panels */}
      <div className="flex flex-col items-center gap-0.5 bg-black/5 rounded-[3rem] overflow-hidden max-w-4xl mx-auto border border-primary/5 shadow-2xl min-h-screen">
         {chapterData.images?.map((imgUrl: string, idx: number) => (
           <div key={idx} className="relative w-full min-h-[400px] flex items-center justify-center bg-secondary/10 group">
              {proxiedImages[imgUrl] ? (
                <img 
                  src={proxiedImages[imgUrl]} 
                  alt={`Panel ${idx + 1}`} 
                  className="w-full h-auto object-contain transition-opacity duration-700"
                  loading="lazy"
                />
              ) : (
                <div className="flex flex-col items-center gap-4 py-32 opacity-20 group-hover:opacity-40 transition-opacity">
                   <Scroll className="size-12 animate-bounce" />
                   <p className="text-[10px] font-bold uppercase tracking-widest">Handshaking with Panel {idx + 1}...</p>
                </div>
              )}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                 <Badge variant="secondary" className="bg-black/50 text-white border-none rounded-lg text-[10px] font-mono">
                    Page {idx + 1} / {chapterData.images.length}
                 </Badge>
              </div>
           </div>
         ))}
      </div>

      {/* Bottom Navigation */}
      <div className="max-w-4xl mx-auto flex justify-between items-center py-12 border-t border-primary/5">
         <Button 
            variant="ghost" 
            onClick={() => { setFullScreen(false); setView('detail'); }}
            className="rounded-full gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-orange-600"
          >
            <ChevronLeft className="size-3" /> Return to Series
          </Button>
          <div className="flex gap-4">
             {chapterData.prev && (
               <Button onClick={() => loadChapter(chapterData.prev)} className="h-12 px-8 rounded-2xl bg-secondary text-primary font-bold shadow-sm hover:bg-secondary/80">
                 Previous Chapter
               </Button>
             )}
             {chapterData.next && (
               <Button onClick={() => loadChapter(chapterData.next)} className="h-12 px-10 rounded-2xl bg-orange-600 text-white font-bold shadow-xl shadow-orange-500/20 hover:bg-orange-700">
                 Next Chapter <ChevronRight className="size-4 ml-2" />
               </Button>
             )}
          </div>
          <Button 
            variant="ghost" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="rounded-full gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
          >
            <ArrowUp className="size-3" /> To Top
          </Button>
      </div>
    </div>
  );

  return (
    <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md overflow-hidden rounded-[3rem]">
      <CardHeader className="p-8 sm:p-12 pb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-500/10 text-orange-600 rounded-2xl shadow-inner">
              <BookOpen className="size-8" />
            </div>
            <div>
              <CardTitle className="font-headline text-3xl tracking-tight">Komiku Explorer</CardTitle>
              <CardDescription className="text-sm font-medium">Premium library orchestrator for Manga, Manhwa, and Manhua.</CardDescription>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:max-w-xl">
            <div className="flex items-center bg-secondary/30 p-1 rounded-full border border-primary/5 shadow-inner">
               <Button variant="ghost" size="sm" onClick={() => { setView('discover'); loadDiscover(); }} className={cn("rounded-full h-9 px-4 gap-2 text-[10px] font-bold uppercase tracking-wider transition-all", view === 'discover' ? "bg-orange-600 text-white shadow-sm" : "text-muted-foreground/60")}>
                  <TrendingUp className="size-3" /> Discover
               </Button>
               <Button variant="ghost" size="sm" onClick={() => setView('search')} className={cn("rounded-full h-9 px-4 gap-2 text-[10px] font-bold uppercase tracking-wider transition-all", (view === 'search' || view === 'detail') ? "bg-orange-600 text-white shadow-sm" : "text-muted-foreground/60")}>
                  <LayoutGrid className="size-3" /> Archive
               </Button>
            </div>

            <form onSubmit={handleSearch} className="flex-1 flex gap-2 w-full">
              <div className="relative flex-1 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground opacity-40 group-focus-within:text-orange-600 transition-colors" />
                <Input 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search series titles..." 
                  className="h-12 pl-14 rounded-full bg-secondary/30 border-primary/5 focus-visible:ring-orange-500/20"
                />
              </div>
              <Button 
                type="submit" 
                disabled={loading || !query.trim()} 
                className="h-12 px-6 rounded-full bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-xl shadow-orange-500/10"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : "Search"}
              </Button>
            </form>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-8 sm:p-12 pt-0 space-y-10">
        {(view !== 'discover' && view !== 'search') && (
          <Button 
            variant="ghost" 
            onClick={() => { setFullScreen(false); setView(query ? 'search' : 'discover'); }} 
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-orange-600 -ml-4"
          >
            <ChevronLeft className="size-3" /> Back to Dashboard
          </Button>
        )}

        {loading && (view === 'discover' || view === 'search') ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="size-12 animate-spin text-orange-500/20" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-40">Polling comic database...</p>
          </div>
        ) : error ? (
          <div className="p-16 text-center bg-destructive/5 rounded-[3rem] border border-destructive/10 space-y-4 animate-fade-in-up">
             <AlertCircle className="size-12 text-destructive mx-auto opacity-30" />
             <p className="text-sm font-bold text-destructive">Handshake Interrupted</p>
             <p className="text-xs text-destructive/60 font-medium">{error}</p>
             <Button variant="outline" size="sm" onClick={() => setView('discover')} className="rounded-full px-8 h-10 font-bold uppercase text-[10px] tracking-widest">Acknowledge</Button>
          </div>
        ) : (
          <div className="min-h-[400px]">
            {view === 'discover' && (
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                  <div className="lg:col-span-8 space-y-8">
                    <div className="flex items-center gap-2 px-2">
                      <TrendingUp className="size-4 text-orange-600/40" />
                      <h3 className="text-lg font-bold font-headline uppercase tracking-widest">Latest Sync</h3>
                    </div>
                    {renderGrid(discoverItems)}
                  </div>
                  <div className="lg:col-span-4 space-y-8">
                    <div className="flex items-center gap-2 px-2">
                       <Trophy className="size-4 text-yellow-500/60" />
                       <h3 className="text-lg font-bold font-headline uppercase tracking-widest">Weekly Ranks</h3>
                    </div>
                    <div className="space-y-3">
                       {rankItems.map((item, idx) => (
                         <div 
                          key={idx} 
                          onClick={() => handleDetail(item.url)}
                          className="flex items-center justify-between p-5 rounded-2xl bg-secondary/20 border border-primary/5 hover:border-orange-500/20 transition-all cursor-pointer group shadow-sm"
                         >
                            <div className="flex items-center gap-4">
                               <div className="size-10 rounded-xl bg-orange-600/10 text-orange-600 flex items-center justify-center font-bold font-headline text-lg group-hover:bg-orange-600 group-hover:text-white transition-all">
                                 {idx + 1}
                               </div>
                               <div className="space-y-0.5">
                                 <p className="text-sm font-bold line-clamp-1 group-hover:text-orange-600 transition-colors">{item.title}</p>
                                 <p className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-widest">{item.chapter}</p>
                               </div>
                            </div>
                            <div className="text-right">
                               <span className="text-[10px] font-bold text-muted-foreground/40 uppercase">{item.views}</span>
                            </div>
                         </div>
                       ))}
                    </div>
                  </div>
               </div>
            )}
            {view === 'search' && (
              <div className="space-y-8">
                <div className="flex items-center gap-2 px-2">
                  <Search className="size-4 text-orange-600/40" />
                  <h3 className="text-lg font-bold font-headline">Archive Results: "{query}"</h3>
                </div>
                {results.length > 0 ? renderGrid(results) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                     <div className="size-20 rounded-full bg-secondary/50 flex items-center justify-center border border-primary/5">
                        <Library className="size-10 text-muted-foreground/20" />
                     </div>
                     <p className="text-sm text-muted-foreground">Archive waiting for input.</p>
                  </div>
                )}
              </div>
            )}
            {view === 'detail' && selectedManga && renderDetail()}
            {view === 'reader' && chapterData && renderReader()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
