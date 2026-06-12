
"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Search, 
  Loader2, 
  Star, 
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
  Scroll,
  Clock,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchShinigami, proxyShinigamiImage } from "@/app/actions/shinigami";
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

type View = 'discover' | 'search' | 'detail' | 'reader';

export function ShinigamiExplorer() {
  const [view, setView] = useState<View>('discover');
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [latestItems, setLatestItems] = useState<any[]>([]);
  const [rankItems, setRankItems] = useState<any[]>([]);
  const [rankFilter, setRankFilter] = useState('daily');
  const [selectedManga, setSelectedManga] = useState<any>(null);
  const [chapterData, setChapterData] = useState<any>(null);
  const [proxiedImages, setProxiedImages] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [fullScreen, setFullScreen] = useState(false);
  const { toast } = useToast();

  const fallbackImage = PlaceHolderImages.find(img => img.id === 'media-fallback')?.imageUrl || "https://picsum.photos/seed/media/400/600";

  useEffect(() => {
    loadDiscover();
  }, []);

  const loadDiscover = async () => {
    setLoading(true);
    setError(null);
    try {
      const [homeRes, rankRes] = await Promise.all([
        fetchShinigami({ mode: 'home' }),
        fetchShinigami({ mode: 'trending', filter: rankFilter })
      ]);
      if (homeRes.status) setLatestItems(homeRes.data.data);
      if (rankRes.status) setRankItems(rankRes.data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'discover') {
      const fetchRanks = async () => {
        const res = await fetchShinigami({ mode: 'trending', filter: rankFilter });
        if (res.status) setRankItems(res.data.data);
      };
      fetchRanks();
    }
  }, [rankFilter, view]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetchShinigami({ mode: 'search', query });
      if (!res.status) throw new Error(res.error);
      setResults(res.data.data);
      setView('search');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDetail = async (mangaId: string | number) => {
    setLoading(true);
    setError(null);
    try {
      const [detailRes, chaptersRes] = await Promise.all([
        fetchShinigami({ mode: 'detail', id: mangaId }),
        fetchShinigami({ mode: 'chapters', id: mangaId })
      ]);
      if (!detailRes.status) throw new Error(detailRes.error);
      
      setSelectedManga({ 
        ...detailRes.data.data, 
        chapters: chaptersRes.data?.data || [] 
      });
      setView('detail');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadChapter = async (chapterId: string | number) => {
    setLoading(true);
    setError(null);
    setProxiedImages({});
    try {
      const res = await fetchShinigami({ mode: 'read', id: chapterId });
      if (!res.status) throw new Error(res.error);
      
      const data = res.data;
      setChapterData(data);
      setView('reader');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Progressive proxy loading
      data.images.forEach(async (imgUrl: string) => {
        const proxyRes = await proxyShinigamiImage(imgUrl);
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
          onClick={() => handleDetail(item.manga_id)}
          className="group cursor-pointer text-left bg-secondary/20 border border-primary/5 rounded-[2rem] overflow-hidden hover:border-indigo-500/20 transition-all hover:shadow-xl relative"
        >
          <div className="relative aspect-[3/4] w-full bg-black/5">
            <Image 
              src={item.manga_cover || fallbackImage} 
              alt={item.title || "Manga Cover"} 
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              unoptimized
              data-ai-hint="manga cover"
            />
            <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
               <Badge className="bg-indigo-600 border-none text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-lg">
                 {item.type || 'Manga'}
               </Badge>
            </div>
            {item.manga_status && (
              <div className="absolute bottom-3 left-3">
                 <Badge variant="outline" className="bg-black/50 backdrop-blur-md text-white border-none rounded-lg text-[10px] font-bold">
                    {item.manga_status}
                 </Badge>
              </div>
            )}
          </div>
          <div className="p-4 space-y-1">
            <h4 className="font-headline font-bold text-xs line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
              {item.title}
            </h4>
            <div className="flex items-center gap-2 text-[9px] text-muted-foreground font-bold opacity-60 uppercase">
               <Clock className="size-2.5" /> {item.updated_at || 'Just Now'}
            </div>
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
            <Image 
              src={selectedManga.manga_cover || fallbackImage} 
              alt={selectedManga.title || "Manga Cover"} 
              fill 
              className="object-cover" 
              unoptimized 
              data-ai-hint="manga cover"
            />
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[80%]">
               <div className="bg-indigo-600 text-white p-3 rounded-2xl flex flex-col items-center gap-1 shadow-2xl">
                 <Star className="size-4 fill-white" />
                 <span className="text-[10px] font-bold uppercase tracking-widest">{selectedManga.rating || '0.0'} Score</span>
               </div>
            </div>
          </div>
          <div className="bg-secondary/20 p-8 rounded-[2rem] border border-primary/5 space-y-6">
             <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Series Intel</h5>
             <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Format</span>
                  <span className="text-sm font-bold truncate">{selectedManga.format || 'Standard'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Type</span>
                  <span className="text-sm font-bold truncate">{selectedManga.type}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Status</span>
                  <span className="text-sm font-bold text-indigo-600">{selectedManga.manga_status}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Views</span>
                  <span className="text-sm font-bold">{selectedManga.views_count?.toLocaleString()}</span>
                </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-10">
          <div className="space-y-4">
             <h2 className="text-4xl font-bold font-headline leading-tight tracking-tight">{selectedManga.title}</h2>
             <div className="flex flex-wrap gap-2 pt-2">
                {selectedManga.genres?.map((g: any, i: number) => (
                  <Badge key={i} variant="secondary" className="bg-primary/5 text-primary/60 border-none px-3 py-1 rounded-lg text-[9px] uppercase font-bold">
                    {g.name || g}
                  </Badge>
                ))}
             </div>
          </div>

          <div className="space-y-4">
             <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2">
               <Info className="size-3" /> Synopsis
             </h4>
             <p className="text-muted-foreground leading-relaxed text-base">
               {selectedManga.description || "No description provided."}
             </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-primary/5 pb-4">
               <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2">
                 <Library className="size-3" /> Chapter Archive
               </h4>
               <span className="text-[10px] font-bold uppercase text-muted-foreground/40">{selectedManga.chapters?.length} Items Indexed</span>
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {selectedManga.chapters?.map((ch: any, i: number) => (
                <Button 
                  key={i} 
                  variant="outline" 
                  onClick={() => loadChapter(ch.chapter_id)}
                  className="h-16 rounded-2xl justify-between px-6 border border-primary/5 bg-secondary/10 hover:bg-indigo-500/5 hover:text-indigo-600 transition-all font-bold group shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-secondary flex items-center justify-center text-xs font-bold font-mono group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      {ch.chapter_number}
                    </div>
                    <span className="truncate max-w-[250px]">Chapter {ch.chapter_number}</span>
                  </div>
                  <div className="flex items-center gap-4">
                       <span className="text-[10px] opacity-40 font-mono uppercase tracking-widest">{ch.release_date}</span>
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
            <h2 className="text-xl font-bold font-headline leading-tight">Chapter {chapterData.chapter_number}</h2>
            <button 
              onClick={() => handleDetail(chapterData.manga_id)}
              className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-1"
            >
              <Library className="size-2.5" /> Return to Series
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
              disabled={!chapterData.prev_chapter_id}
              onClick={() => loadChapter(chapterData.prev_chapter_id)}
              className="rounded-full gap-2 border-primary/5 font-bold uppercase text-[10px] tracking-widest"
            >
              <ChevronLeft className="size-3" /> Prev
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={!chapterData.next_chapter_id}
              onClick={() => loadChapter(chapterData.next_chapter_id)}
              className="rounded-full gap-2 border-primary/5 font-bold uppercase text-[10px] tracking-widest"
            >
              Next <ChevronRight className="size-3" />
            </Button>
         </div>
      </div>

      {/* Comic Panels */}
      <div className="flex flex-col items-center gap-1 bg-black/5 rounded-[3rem] overflow-hidden max-w-3xl mx-auto border border-primary/5 shadow-2xl min-h-screen">
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
                   <Scroll className="size-12 animate-bounce text-indigo-600" />
                   <p className="text-[10px] font-bold uppercase tracking-widest">Handshaking with Panel {idx + 1}...</p>
                </div>
              )}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                 <Badge variant="secondary" className="bg-black/50 text-white border-none rounded-lg text-[10px] font-mono">
                    {idx + 1} / {chapterData.images.length}
                 </Badge>
              </div>
           </div>
         ))}
      </div>

      <div className="max-w-3xl mx-auto flex justify-center py-12 border-t border-primary/5">
         <Button 
            variant="ghost" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="rounded-full gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-indigo-600"
          >
            <ArrowUp className="size-3" /> Back to Top
          </Button>
      </div>
    </div>
  );

  return (
    <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md overflow-hidden rounded-[3rem]">
      <CardHeader className="p-8 sm:p-12 pb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/10 text-indigo-600 rounded-2xl shadow-inner">
              <Zap className="size-8" />
            </div>
            <div>
              <CardTitle className="font-headline text-3xl tracking-tight">Shinigami Explorer</CardTitle>
              <CardDescription className="text-sm font-medium">Premium orchestrator for Shinigami.asia library.</CardDescription>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2 w-full lg:max-w-md">
            <div className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground opacity-40 group-focus-within:text-indigo-600 transition-colors" />
              <Input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search titles..." 
                className="h-14 pl-14 rounded-full bg-secondary/30 border-primary/5 focus-visible:ring-indigo-500/20"
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading || !query.trim()} 
              className="h-14 px-6 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xl shadow-indigo-500/10 transition-all active:scale-95"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : "Search"}
            </Button>
          </form>
        </div>
      </CardHeader>
      
      <CardContent className="p-8 sm:p-12 pt-0 space-y-10">
        {(view !== 'discover' && view !== 'search') && (
          <Button 
            variant="ghost" 
            onClick={() => { setFullScreen(false); setView(query ? 'search' : 'discover'); }} 
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-indigo-600 -ml-4"
          >
            <ChevronLeft className="size-3" /> Dashboard
          </Button>
        )}

        {loading && (view === 'discover' || view === 'search') ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="size-12 animate-spin text-indigo-500/20" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-40">Polling neural database...</p>
          </div>
        ) : error ? (
          <div className="p-16 text-center bg-destructive/5 rounded-[3rem] border border-destructive/10 space-y-4 animate-fade-in-up">
             <AlertCircle className="size-12 text-destructive mx-auto opacity-30" />
             <p className="text-sm font-bold text-destructive">Handshake Failed</p>
             <p className="text-xs text-destructive/60 font-medium">{error}</p>
             <Button variant="outline" size="sm" onClick={() => setView('discover')} className="rounded-full px-8 h-10 font-bold uppercase text-[10px] tracking-widest">Retry</Button>
          </div>
        ) : (
          <div className="min-h-[400px]">
            {view === 'discover' && (
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                  <div className="lg:col-span-8 space-y-8">
                    <div className="flex items-center justify-between px-2">
                       <div className="flex items-center gap-2">
                        <TrendingUp className="size-4 text-indigo-600/40" />
                        <h3 className="text-lg font-bold font-headline uppercase tracking-widest">Latest Updates</h3>
                       </div>
                       <Button variant="ghost" size="sm" onClick={loadDiscover} className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-indigo-600">Refresh Feed</Button>
                    </div>
                    {renderGrid(latestItems)}
                  </div>
                  <div className="lg:col-span-4 space-y-8">
                    <div className="space-y-6">
                       <div className="flex items-center justify-between px-2">
                         <div className="flex items-center gap-2">
                            <Trophy className="size-4 text-yellow-500/60" />
                            <h3 className="text-lg font-bold font-headline uppercase tracking-widest">Top Rated</h3>
                         </div>
                         <div className="flex bg-secondary/50 p-1 rounded-lg border border-primary/5">
                            {['daily', 'weekly'].map(f => (
                              <button 
                                key={f} 
                                onClick={() => setRankFilter(f)}
                                className={cn(
                                  "px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest transition-all",
                                  rankFilter === f ? "bg-indigo-600 text-white shadow-sm" : "text-muted-foreground opacity-60"
                                )}
                              >
                                {f}
                              </button>
                            ))}
                         </div>
                       </div>
                       <div className="space-y-3">
                          {rankItems.map((item, idx) => (
                            <div 
                             key={idx} 
                             onClick={() => handleDetail(item.manga_id)}
                             className="flex items-center justify-between p-4 rounded-2xl bg-secondary/20 border border-primary/5 hover:border-indigo-500/20 transition-all cursor-pointer group shadow-sm"
                            >
                               <div className="flex items-center gap-4">
                                  <div className="size-9 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-bold font-headline text-lg group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                    {idx + 1}
                                  </div>
                                  <div className="space-y-0.5">
                                    <p className="text-xs font-bold line-clamp-1 group-hover:text-indigo-600 transition-colors">{item.title}</p>
                                    <p className="text-[9px] font-medium text-muted-foreground/60 uppercase tracking-widest">{item.type || 'Manga'}</p>
                                  </div>
                               </div>
                               <div className="text-right">
                                  <span className="text-[10px] font-bold text-indigo-600/60 flex items-center gap-1">
                                    <Eye className="size-3" /> {item.views_count_short || (item.views_count > 1000 ? `${(item.views_count/1000).toFixed(1)}k` : item.views_count)}
                                  </span>
                                </div>
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>
               </div>
            )}
            {view === 'search' && (
              <div className="space-y-8">
                <div className="flex items-center gap-2 px-2">
                  <Search className="size-4 text-indigo-600/40" />
                  <h3 className="text-lg font-bold font-headline">Search Archive: "{query}"</h3>
                </div>
                {results.length > 0 ? renderGrid(results) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                     <div className="size-20 rounded-full bg-secondary/50 flex items-center justify-center border border-primary/5">
                        <Library className="size-10 text-muted-foreground/20" />
                     </div>
                     <p className="text-sm text-muted-foreground italic">No matches found in Shinigami archives.</p>
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
