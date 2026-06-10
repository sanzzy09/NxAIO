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
  Layers
} from "lucide-react";
import Image from 'next/image';
import { cn } from "@/lib/utils";
import { fetchLk21 } from "@/app/actions/lk21";

type View = 'home' | 'search' | 'detail';
type MediaType = 'movie' | 'series';

export function Lk21Explorer() {
  const [activeTab, setActiveTab] = useState<MediaType>('movie');
  const [view, setView] = useState<View>('home');
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchHome = async (type: MediaType) => {
    setLoading(true);
    setError(null);
    setView('home');
    try {
      const mode = type === 'movie' ? 'home' : 'series-home';
      const res = await fetchLk21({ mode });
      if (!res.status) throw new Error(res.error);
      setData(res.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHome(activeTab);
  }, [activeTab]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setView('search');
    try {
      const mode = activeTab === 'movie' ? 'search' : 'series-search';
      const res = await fetchLk21({ mode, query });
      if (!res.status) throw new Error(res.error);
      setData(res.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDetail = async (slug: string) => {
    setLoading(true);
    setError(null);
    try {
      const mode = activeTab === 'movie' ? 'detail' : 'series-detail';
      const res = await fetchLk21({ mode, slug });
      if (!res.status) throw new Error(res.error);
      
      setData(res.data);
      setView('detail');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderGrid = (items: any[]) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in-up">
      {items.map((item, i) => (
        <button 
          key={i} 
          onClick={() => handleDetail(item.slug)}
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
              {item.rating && (
                <Badge variant="outline" className="bg-black/50 backdrop-blur-md text-white border-none rounded-lg text-[10px] uppercase font-bold flex items-center gap-1">
                  <Star className="size-2.5 fill-yellow-400 text-yellow-400" /> {item.rating}
                </Badge>
              )}
            </div>
          </div>
          <div className="p-4">
            <h4 className="font-headline font-bold text-xs line-clamp-2 leading-tight group-hover:text-primary transition-colors">
              {item.title}
            </h4>
            <div className="flex items-center justify-between mt-2">
               <span className="text-[10px] text-muted-foreground font-bold">{item.year}</span>
               {item.duration && <span className="text-[10px] text-muted-foreground font-medium opacity-60">{item.duration}</span>}
            </div>
          </div>
        </button>
      ))}
    </div>
  );

  const renderDetail = () => (
    <div className="space-y-10 animate-fade-in-up">
      <div className="flex flex-col md:flex-row gap-10">
        <div className="w-full md:w-72 flex-shrink-0">
          <div className="relative aspect-[2/3] w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-primary/5 bg-secondary/10">
            <Image src={data.poster} alt={data.title} fill className="object-cover" unoptimized />
            <div className="absolute top-4 right-4 bg-primary text-primary-foreground p-3 rounded-2xl flex flex-col items-center gap-1 shadow-lg">
              <Star className="size-4 fill-primary-foreground" />
              <span className="text-xs font-bold">{data.rating || "-"}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-8">
          <div className="space-y-3">
            <h2 className="text-4xl font-bold font-headline leading-tight tracking-tight">{data.title}</h2>
            <div className="flex flex-wrap gap-2">
              {data.genre?.map((g: string, i: number) => (
                <Badge key={i} variant="secondary" className="bg-primary/5 text-primary/60 border-none px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide">
                  {g}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
             <div className="p-5 bg-secondary/30 rounded-[1.5rem] border border-primary/5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">Quality</p>
                <p className="text-sm font-bold font-headline">{data.quality || "-"}</p>
             </div>
             <div className="p-5 bg-secondary/30 rounded-[1.5rem] border border-primary/5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">Duration</p>
                <p className="text-sm font-bold font-headline">{data.duration || "-"}</p>
             </div>
             <div className="p-5 bg-secondary/30 rounded-[1.5rem] border border-primary/5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">Country</p>
                <p className="text-sm font-bold font-headline">{data.country?.[0] || "-"}</p>
             </div>
             <div className="p-5 bg-secondary/30 rounded-[1.5rem] border border-primary/5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">Status</p>
                <p className="text-sm font-bold font-headline">{data.status || "Complete"}</p>
             </div>
          </div>

          <div className="space-y-4">
             <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2">
               <Info className="size-3" /> Synopsis
             </h4>
             <p className="text-sm text-muted-foreground leading-relaxed">
               {data.synopsis || "No synopsis available."}
             </p>
          </div>
        </div>
      </div>

      {activeTab === 'series' && (
        <div className="space-y-6 pt-10 border-t border-primary/5">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2">
            <Layers className="size-4" /> Episodes Directory
          </h4>
          <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {data.episodes?.map((ep: any, i: number) => (
              <div 
                key={i} 
                className="h-14 rounded-2xl flex items-center justify-between px-6 border border-primary/5 bg-secondary/10 font-bold"
              >
                <div className="flex items-center gap-4">
                   <div className="size-8 rounded-lg bg-secondary flex items-center justify-center text-[10px] font-bold font-mono">
                     {ep.episode || i+1}
                   </div>
                   <span className="text-sm truncate max-w-[250px]">{ep.title || `Episode ${ep.episode || i+1}`}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md overflow-hidden rounded-[2.5rem]">
      <CardHeader className="p-8 sm:p-10 pb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <Clapperboard className="size-6" />
            </div>
            <div>
              <CardTitle className="font-headline text-2xl">LK21 Explorer</CardTitle>
              <CardDescription>Premium movie & drama search directory.</CardDescription>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Tabs 
              value={activeTab} 
              onValueChange={(v) => {
                setActiveTab(v as MediaType);
                setView('home');
              }}
              className="bg-secondary/30 p-1 rounded-full border border-primary/5"
            >
              <TabsList className="bg-transparent h-10 gap-1">
                <TabsTrigger value="movie" className="rounded-full gap-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                  <Film className="size-3" /> Movies
                </TabsTrigger>
                <TabsTrigger value="series" className="rounded-full gap-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                  <Tv className="size-3" /> Series
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <form onSubmit={handleSearch} className="relative group min-w-[260px] w-full sm:w-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground opacity-40 group-focus-within:text-primary transition-colors" />
              <Input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search titles...`} 
                className="h-12 pl-12 rounded-full bg-secondary/30 border-primary/5 focus-visible:ring-primary/20"
              />
            </form>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-8 sm:p-10 pt-0 space-y-8">
        {(view !== 'home' || error) && (
          <Button 
            variant="ghost" 
            onClick={() => fetchHome(activeTab)} 
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary -ml-2"
          >
            <ChevronLeft className="size-3" /> Back to Discover
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
             <Button variant="outline" size="sm" onClick={() => fetchHome(activeTab)} className="rounded-full font-bold uppercase text-[10px] tracking-widest">Retry Connection</Button>
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
