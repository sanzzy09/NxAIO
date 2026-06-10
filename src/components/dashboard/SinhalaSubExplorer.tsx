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
  Tv,
  Download,
  Users,
  PlayCircle,
  ExternalLink,
  Copy
} from "lucide-react";
import Image from 'next/image';
import { cn } from "@/lib/utils";
import { fetchSinhalaSub } from "@/app/actions/sinhalasub";
import { useToast } from "@/hooks/use-toast";

type View = 'home' | 'search' | 'detail';
type ListType = 'discover' | 'trending' | 'imdb';

export function SinhalaSubExplorer() {
  const [listType, setListType] = useState<ListType>('discover');
  const [view, setView] = useState<View>('home');
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFetch = async (params: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchSinhalaSub(params);
      if (!res.status) throw new Error(res.error);
      setData(res.data);
      if (params.mode === 'detail') setView('detail');
      else if (params.mode === 'search') setView('search');
      else setView('home');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const pathMap = { discover: 'home', trending: 'trending', imdb: 'imdb' };
    if (listType === 'discover') handleFetch({ mode: 'home' });
    else handleFetch({ mode: 'listing', path: listType });
  }, [listType]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    handleFetch({ mode: 'search', query });
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "Link Copied", description: "Paste this into a private window if redirects occur." });
  };

  const renderGrid = (items: any[]) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in-up">
      {items.map((item, i) => (
        <button 
          key={i} 
          onClick={() => handleFetch({ mode: 'detail', slug: item.slug })}
          className="group text-left bg-secondary/20 border border-primary/5 rounded-3xl overflow-hidden hover:border-primary/20 transition-all hover:shadow-xl"
        >
          <div className="relative aspect-[2/3] w-full bg-black/5">
            <Image 
              src={item.poster} 
              alt={item.title} 
              fill 
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              unoptimized
            />
            <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
              {item.quality && <Badge className="bg-primary border-none rounded-lg text-[10px] uppercase font-bold">{item.quality}</Badge>}
              {item.year && <Badge variant="outline" className="bg-black/50 backdrop-blur-md text-white border-none rounded-lg text-[10px] uppercase font-bold">{item.year}</Badge>}
            </div>
          </div>
          <div className="p-4 space-y-1">
            <h4 className="font-headline font-bold text-xs line-clamp-2 leading-tight group-hover:text-primary transition-colors">
              {item.title}
            </h4>
          </div>
        </button>
      ))}
    </div>
  );

  const renderDetail = () => (
    <div className="space-y-10 animate-fade-in-up">
      <div className="relative w-full h-48 sm:h-64 rounded-[2.5rem] overflow-hidden shadow-inner border border-primary/5">
         <Image src={data.backdrop || data.poster} alt="Backdrop" fill className="object-cover opacity-30 grayscale-[0.5]" unoptimized />
         <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
         <div className="absolute bottom-8 left-8">
            <h2 className="text-3xl lg:text-5xl font-bold font-headline leading-tight tracking-tight">{data.title}</h2>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-6">
          <div className="relative aspect-[2/3] w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-primary/5">
            <Image src={data.poster} alt={data.title} fill className="object-cover" unoptimized />
            <div className="absolute top-4 right-4 bg-primary text-primary-foreground p-3 rounded-2xl flex flex-col items-center gap-1 shadow-lg">
              <Star className="size-4 fill-primary-foreground" />
              <span className="text-xs font-bold">{data.rating || "-"}</span>
            </div>
          </div>

          <div className="bg-secondary/20 p-8 rounded-[2rem] border border-primary/5 space-y-6">
             <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Metadata</h5>
             <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Quality</span>
                  <span className="text-sm font-bold text-primary">{data.quality}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Runtime</span>
                  <span className="text-sm font-bold">{data.runtime}</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {data.genres?.map((g: string, i: number) => (
                    <Badge key={i} variant="secondary" className="bg-primary/5 text-primary/60 border-none px-3 py-1 rounded-lg text-[9px] uppercase font-bold">{g}</Badge>
                  ))}
                </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-10">
          <div className="space-y-4">
             <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2">
               <Info className="size-3" /> Synopsis
             </h4>
             <p className="text-sm text-muted-foreground leading-relaxed">
               {data.description || "No synopsis available."}
             </p>
          </div>

          {data.cast?.length > 0 && (
            <div className="space-y-6">
               <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2">
                 <Users className="size-3" /> Featured Cast
               </h4>
               <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                  {data.cast.map((c: any, i: number) => (
                    <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2 w-24">
                       <div className="relative size-16 rounded-full overflow-hidden border-2 border-primary/5">
                          <Image src={c.image || 'https://placehold.co/100'} alt={c.name} fill className="object-cover" unoptimized />
                       </div>
                       <span className="text-[10px] font-bold text-center leading-tight line-clamp-2">{c.name}</span>
                    </div>
                  ))}
               </div>
            </div>
          )}

          <div className="space-y-6">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2">
              <Download className="size-4" /> Download Mirrors
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {data.downloads?.map((dl: any, i: number) => (
                 <div key={i} className="p-5 rounded-[1.5rem] bg-secondary/20 border border-primary/5 flex items-center justify-between group hover:border-primary/20 transition-all">
                    <div className="flex flex-col gap-1">
                       <span className="text-xs font-bold font-headline">{dl.host}</span>
                       <span className="text-[10px] text-muted-foreground font-bold">{dl.quality} · {dl.size}</span>
                    </div>
                    <Button asChild size="icon" variant="ghost" className="rounded-xl hover:bg-primary hover:text-primary-foreground">
                       <a href={dl.href} target="_blank" rel="noopener noreferrer nofollow"><ExternalLink className="size-4" /></a>
                    </Button>
                 </div>
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
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <Film className="size-6" />
            </div>
            <div>
              <CardTitle className="font-headline text-2xl">SinhalaSub Hub</CardTitle>
              <CardDescription>International cinema directory with high-quality metadata.</CardDescription>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Tabs 
              value={listType} 
              onValueChange={(v) => {
                setListType(v as ListType);
                setView('home');
              }}
              className="bg-secondary/30 p-1 rounded-full border border-primary/5"
            >
              <TabsList className="bg-transparent h-10 gap-1">
                <TabsTrigger value="discover" className="rounded-full gap-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">Discover</TabsTrigger>
                <TabsTrigger value="trending" className="rounded-full gap-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">Popular</TabsTrigger>
                <TabsTrigger value="imdb" className="rounded-full gap-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">IMDb Top</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <form onSubmit={handleSearch} className="relative group min-w-[260px] w-full sm:w-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground opacity-40 group-focus-within:text-primary transition-colors" />
              <Input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search cinema...`} 
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
            onClick={() => setListType('discover')} 
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary -ml-2"
          >
            <ChevronLeft className="size-3" /> Back to Dashboard
          </Button>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="size-12 animate-spin text-primary/20" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-40">Synchronizing database content...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center bg-destructive/5 rounded-[2.5rem] border border-destructive/10 space-y-4">
             <Info className="size-10 text-destructive mx-auto opacity-40" />
             <p className="text-sm font-medium text-destructive">{error}</p>
             <Button variant="outline" size="sm" onClick={() => setListType('discover')} className="rounded-full font-bold uppercase text-[10px] tracking-widest">Retry Connection</Button>
          </div>
        ) : (
          <div className="min-h-[400px]">
            {view === 'home' && renderGrid(data || [])}
            {view === 'search' && (
              <div className="space-y-6">
                 <h3 className="text-lg font-bold font-headline px-2">Results for "{query}"</h3>
                 {renderGrid(data || [])}
              </div>
            )}
            {view === 'detail' && renderDetail()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
