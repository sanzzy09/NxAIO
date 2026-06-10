"use client"

import React, { useState, useEffect } from 'react';
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
  ListOrdered, 
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  TrendingUp,
  FileText,
  Bookmark,
  ArrowRight,
  Maximize2,
  ChevronDown
} from "lucide-react";
import Image from 'next/image';
import { cn } from "@/lib/utils";
import { fetchShinigami } from "@/app/actions/shinigami";
import { useToast } from "@/hooks/use-toast";

type ViewMode = 'discover' | 'search' | 'detail' | 'read';

export function ShinigamiExplorer() {
  const [view, setView] = useState<ViewMode>('discover');
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('daily');
  const { toast } = useToast();

  const handleFetch = async (params: { mode: string; [key: string]: any }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchShinigami(params);
      if (!res.status) throw new Error(res.message || "Failed to sync library.");
      setData(res.data);
      if (params.mode === 'trending') setActiveTab(params.filter || 'daily');
    } catch (err: any) {
      setError(err.message);
      toast({ variant: "destructive", title: "Library Sync Error", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'discover') handleFetch({ mode: 'list', pageSize: 12 });
  }, [view]);

  const getImageUrl = (manga: any) => {
    if (!manga) return "https://picsum.photos/seed/manga/400/600";
    const path = manga.image || manga.manga?.image || manga.manga_image;
    const base = manga.base_url || "https://assets.shngm.id";
    if (!path) return "https://picsum.photos/seed/manga/400/600";
    return path.startsWith('http') ? path : `${base}${path}`;
  };

  const renderHome = () => {
    const list = Array.isArray(data) ? data : (data?.data && Array.isArray(data.data) ? data.data : []);
    
    return (
      <div className="space-y-12 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">Library Updates</h3>
          <Tabs value={activeTab} onValueChange={(v) => handleFetch({ mode: 'trending', filter: v })} className="bg-secondary/30 p-1 rounded-full border border-primary/5">
            <TabsList className="bg-transparent h-8 gap-1">
              <TabsTrigger value="daily" className="rounded-full px-4 text-[9px] font-bold uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Daily</TabsTrigger>
              <TabsTrigger value="weekly" className="rounded-full px-4 text-[9px] font-bold uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Weekly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {list.map((manga: any, i: number) => (
            <button 
              key={manga.manga_id || manga.id || i} 
              onClick={() => {
                setView('detail');
                handleFetch({ mode: 'detail', id: manga.manga_id || manga.id });
              }}
              className="group text-left space-y-4"
            >
              <div className="relative aspect-[3/4] w-full bg-black/5 rounded-[2rem] overflow-hidden shadow-sm group-hover:shadow-2xl transition-all duration-500">
                <Image 
                  src={getImageUrl(manga)} 
                  alt={manga.title || "Cover"} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-700" 
                  unoptimized
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                   <Badge className="bg-white/20 backdrop-blur-md border-none text-white text-[10px] uppercase font-bold">
                     Ch. {manga.last_chapter || "?"}
                   </Badge>
                </div>
              </div>
              <div className="px-2 space-y-1">
                <h4 className="font-headline font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">{manga.title || manga.manga_title}</h4>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                   <TrendingUp className="size-3 text-emerald-500" />
                   <span>{manga.type || "Series"}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderDetail = () => {
    if (!data) return null;
    const chapters = Array.isArray(data.chapters) ? data.chapters : [];

    return (
      <div className="space-y-10 animate-fade-in-up pb-10">
        <Button 
          variant="ghost" 
          onClick={() => setView('discover')}
          className="group text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-all -ml-2"
        >
          <ChevronLeft className="size-3 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Library
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4 space-y-8">
            <div className="relative aspect-[3/4] w-full rounded-[3rem] overflow-hidden shadow-2xl border border-primary/5">
              <Image src={getImageUrl(data)} alt={data.title} fill className="object-cover" unoptimized referrerPolicy="no-referrer" />
              <div className="absolute top-6 right-6 bg-primary text-primary-foreground p-3 rounded-2xl flex flex-col items-center gap-1 shadow-2xl">
                 <Star className="size-4 fill-primary-foreground" />
                 <span className="text-xs font-bold">{data.rating || "8.5"}</span>
              </div>
            </div>

            <div className="bg-secondary/20 p-8 rounded-[2.5rem] border border-primary/5 space-y-6">
               <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Status & Info</h5>
               <div className="grid grid-cols-1 gap-4">
                  <div className="flex justify-between items-center py-2 border-b border-primary/5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Status</span>
                    <Badge variant="outline" className="rounded-lg border-primary/10 text-primary font-bold text-[10px]">{data.status || "Ongoing"}</Badge>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-primary/5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Format</span>
                    <span className="text-sm font-bold font-headline">{data.format || "Series"}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Released</span>
                    <span className="text-sm font-bold font-headline">{data.release_year || "2024"}</span>
                  </div>
               </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-12">
            <div className="space-y-6">
              <h2 className="text-4xl lg:text-6xl font-bold font-headline leading-[0.9] tracking-tighter">{data.title}</h2>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(data.genres) && data.genres.map((g: any, i: number) => (
                  <Badge key={i} variant="secondary" className="bg-primary/5 text-primary/60 border-none px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                    {g.name || g}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2">
                <FileText className="size-3" /> Synopsis
              </h4>
              <p className="text-base text-muted-foreground leading-relaxed">
                {data.description || "No description available."}
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-primary/5 pb-4">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2">
                  <ListOrdered className="size-3" /> Chapters ({chapters.length})
                </h4>
              </div>

              <div className="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                {chapters.map((ch: any, i: number) => (
                  <button 
                    key={ch.chapter_id || i}
                    onClick={() => {
                      setView('read');
                      handleFetch({ mode: 'chapter', id: ch.chapter_id });
                    }}
                    className="flex items-center justify-between p-6 rounded-[1.5rem] bg-secondary/10 border border-primary/5 hover:bg-primary hover:text-primary-foreground hover:scale-[1.01] transition-all group shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                       <div className="size-10 rounded-xl bg-secondary group-hover:bg-white/10 flex items-center justify-center text-xs font-bold font-mono">
                         {ch.chapter_number}
                       </div>
                       <div className="text-left">
                         <span className="block text-sm font-bold font-headline">{ch.title || `Chapter ${ch.chapter_number}`}</span>
                         <span className="text-[9px] uppercase tracking-widest opacity-40 font-medium">{ch.release_date}</span>
                       </div>
                    </div>
                    <ArrowRight className="size-4 opacity-20 group-hover:opacity-100 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderReader = () => {
    if (!data) return null;
    const pages = Array.isArray(data.pages) ? data.pages : [];

    return (
      <div className="space-y-8 animate-fade-in-up pb-20">
        <div className="flex items-center justify-between sticky top-24 z-20 bg-background/80 backdrop-blur-xl p-4 rounded-[2rem] border border-primary/5 shadow-2xl">
          <Button variant="ghost" size="sm" onClick={() => setView('detail')} className="rounded-full gap-2 text-[10px] font-bold uppercase tracking-widest">
            <ChevronLeft className="size-3" /> Back
          </Button>
          <div className="text-center">
            <h4 className="text-sm font-bold font-headline leading-tight line-clamp-1">{data.manga_title}</h4>
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Chapter {data.chapter_number}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="rounded-xl border-primary/5 shadow-sm"><Bookmark className="size-4" /></Button>
            <Button variant="outline" size="icon" className="rounded-xl border-primary/5 shadow-sm"><Maximize2 className="size-4" /></Button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto flex flex-col items-center bg-black/5 rounded-[3rem] overflow-hidden">
          {pages.map((page: string, idx: number) => (
            <div key={idx} className="relative w-full min-h-[400px]">
              <Image 
                src={page} 
                alt={`Page ${idx + 1}`} 
                width={800} 
                height={1200} 
                className="w-full h-auto object-contain"
                loading="lazy"
                unoptimized
                referrerPolicy="no-referrer"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-4 pt-10">
           {data.prev_chapter_id && (
             <Button variant="outline" onClick={() => handleFetch({ mode: 'chapter', id: data.prev_chapter_id })} className="h-14 px-10 rounded-2xl font-bold gap-3 border-primary/10">
               <ChevronLeft className="size-4" /> Prev Chapter
             </Button>
           )}
           {data.next_chapter_id && (
             <Button onClick={() => handleFetch({ mode: 'chapter', id: data.next_chapter_id })} className="h-14 px-10 rounded-2xl font-bold gap-3 shadow-xl shadow-primary/10">
               Next Chapter <ChevronRight className="size-4" />
             </Button>
           )}
        </div>
      </div>
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setView('search');
    handleFetch({ mode: 'search', query });
  };

  return (
    <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md overflow-hidden rounded-[2.5rem]">
      <CardHeader className="p-8 sm:p-10 pb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <BookOpen className="size-6" />
            </div>
            <div>
              <CardTitle className="font-headline text-2xl">Shinigami Library</CardTitle>
              <CardDescription>Premium manga directory with high-performance reader.</CardDescription>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Tabs value={view === 'discover' ? 'discover' : 'library'} onValueChange={(v) => { if (v === 'discover') setView('discover'); }} className="bg-secondary/30 p-1 rounded-full border border-primary/5">
              <TabsList className="bg-transparent h-10 gap-1">
                <TabsTrigger value="discover" className="rounded-full gap-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                  <LayoutGrid className="size-3" /> Discover
                </TabsTrigger>
                <TabsTrigger value="library" className="rounded-full gap-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                  <Bookmark className="size-3" /> My List
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <form onSubmit={handleSearch} className="relative group min-w-[260px] w-full sm:w-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground opacity-40 group-focus-within:text-primary transition-colors" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search library...`} className="h-12 pl-12 rounded-full bg-secondary/30 border-primary/5 focus-visible:ring-primary/20" />
            </form>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-8 sm:p-10 pt-0 space-y-8 min-h-[500px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 space-y-4">
            <Loader2 className="size-12 animate-spin text-primary/20" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-40">Synchronizing data...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center bg-destructive/5 rounded-[2.5rem] border border-destructive/10 space-y-4">
             <Info className="size-10 text-destructive mx-auto opacity-40" />
             <p className="text-sm font-medium text-destructive">{error}</p>
             <Button variant="outline" size="sm" onClick={() => setView('discover')} className="rounded-full font-bold uppercase text-[10px] tracking-widest">Retry Connection</Button>
          </div>
        ) : (
          <>
            {view === 'discover' && renderHome()}
            {view === 'search' && (
              <div className="space-y-6">
                 <h3 className="text-lg font-bold font-headline px-2">Matches for "{query}"</h3>
                 {renderHome()}
              </div>
            )}
            {view === 'detail' && renderDetail()}
            {view === 'read' && renderReader()}
          </>
        )}
      </CardContent>
    </Card>
  );
}
