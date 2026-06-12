"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Search, 
  Loader2, 
  Star, 
  Info, 
  ChevronLeft,
  LayoutGrid,
  Library,
  ArrowRight,
  AlertCircle,
  Clock,
  User,
  Tags,
  Download,
  Eye,
  X
} from "lucide-react";
import Image from 'next/image';
import { cn } from "@/lib/utils";
import { fetchKomiku } from "@/app/actions/komiku";
import { useToast } from "@/hooks/use-toast";

type View = 'search' | 'detail' | 'reader';

export function KomikuExplorer() {
  const [view, setView] = useState<View>('search');
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [selectedManga, setSelectedManga] = useState<any>(null);
  const [chapterData, setChapterData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
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

  const handleRead = async (url: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchKomiku({ mode: 'chapter', url });
      if (!res.status) throw new Error(res.error);
      setChapterData(res.data);
      setView('reader');
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
          className="group cursor-pointer text-left bg-secondary/20 border border-primary/5 rounded-[2rem] overflow-hidden hover:border-orange-500/20 transition-all hover:shadow-xl relative"
        >
          <div className="relative aspect-[3/4] w-full bg-black/5">
            <Image 
              src={item.thumbnail || "https://placehold.co/400x600/png?text=No+Cover"} 
              alt={item.title} 
              fill 
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              unoptimized
            />
            <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
               <Badge className="bg-orange-600 border-none text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-lg">
                 {item.type}
               </Badge>
            </div>
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <BookOpen className="size-10 text-white drop-shadow-2xl" />
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
            <Image src={selectedManga.thumbnail} alt={selectedManga.title} fill className="object-cover" unoptimized />
          </div>
          <div className="bg-secondary/20 p-8 rounded-[2rem] border border-primary/5 space-y-6">
             <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Series Data</h5>
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
             <div className="flex flex-wrap gap-2">
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
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2">
              <Library className="size-3" /> Available Chapters
            </h4>
            <div className="grid grid-cols-1 gap-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {selectedManga.chapters?.map((ch: any, i: number) => (
                <Button 
                  key={i} 
                  variant="outline" 
                  onClick={() => handleRead(ch.url)}
                  className="h-16 rounded-2xl justify-between px-6 border-primary/5 hover:bg-orange-500/5 hover:text-orange-600 transition-all font-bold group shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-secondary flex items-center justify-center text-xs font-bold font-mono group-hover:bg-orange-600 group-hover:text-white transition-all">
                      {i + 1}
                    </div>
                    <span className="truncate max-w-[300px]">{ch.name}</span>
                  </div>
                  <span className="text-[10px] opacity-40 font-mono uppercase tracking-widest">{ch.date}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReader = () => (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex items-center justify-between sticky top-24 z-30 bg-background/80 backdrop-blur-md p-4 rounded-3xl border border-primary/5 shadow-xl">
         <div className="space-y-0.5">
            <h3 className="text-sm font-bold font-headline">{chapterData.title}</h3>
            <p className="text-[10px] text-muted-foreground font-bold uppercase">{chapterData.total} Panels Loaded</p>
         </div>
         <Button variant="ghost" size="sm" onClick={() => setView('detail')} className="rounded-full text-[10px] font-bold uppercase gap-2 hover:bg-destructive/5 hover:text-destructive">
            <X className="size-3" /> Close Reader
         </Button>
      </div>

      <div className="max-w-3xl mx-auto space-y-1">
         {chapterData.images.map((img: string, i: number) => (
           <div key={i} className="relative w-full overflow-hidden bg-secondary/10 animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
              <img 
                src={img} 
                alt={`Panel ${i+1}`} 
                className="w-full h-auto select-none"
                loading="lazy"
                onContextMenu={(e) => e.preventDefault()}
              />
           </div>
         ))}
      </div>

      <div className="text-center py-12 border-t border-primary/5 space-y-4">
         <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">End of Chapter</p>
         <Button onClick={() => setView('detail')} variant="outline" className="rounded-full px-8 h-12 font-bold uppercase text-[10px] tracking-widest">
            Back to Series Info
         </Button>
      </div>
    </div>
  );

  return (
    <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md overflow-hidden rounded-[3rem]">
      <CardHeader className="p-8 sm:p-12 pb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-500/10 text-orange-600 rounded-2xl">
              <BookOpen className="size-8" />
            </div>
            <div>
              <CardTitle className="font-headline text-3xl">Komiku Explorer</CardTitle>
              <CardDescription>Premium Manga, Manhwa, and Manhua directory with high-fidelity reader.</CardDescription>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2 w-full lg:max-w-md">
            <div className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground opacity-40 group-focus-within:text-orange-600 transition-colors" />
              <Input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search series titles..." 
                className="h-14 pl-14 rounded-full bg-secondary/30 border-primary/5 focus-visible:ring-orange-500/20"
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading || !query.trim()} 
              className="h-14 px-8 rounded-full bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-xl shadow-orange-500/10 transition-all active:scale-95"
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
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-orange-600 -ml-4"
          >
            <ChevronLeft className="size-3" /> Back to Results
          </Button>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="size-12 animate-spin text-orange-500/20" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-40">Polling comic database...</p>
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
            {view === 'search' && (
              results.length > 0 ? renderGrid() : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                   <div className="size-20 rounded-full bg-secondary/50 flex items-center justify-center border border-primary/5">
                      <Library className="size-10 text-muted-foreground/20" />
                   </div>
                   <div className="space-y-1">
                      <h4 className="text-lg font-bold font-headline">Archive Waiting</h4>
                      <p className="text-sm text-muted-foreground">Search for a series title to begin orchestrating your library.</p>
                   </div>
                </div>
              )
            )}
            {view === 'detail' && selectedManga && renderDetail()}
            {view === 'reader' && chapterData && renderReader()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
