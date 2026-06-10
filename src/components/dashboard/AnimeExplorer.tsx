"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Tv, 
  Search, 
  Loader2, 
  Star, 
  Info, 
  ListOrdered, 
  ExternalLink,
  ChevronLeft,
  Calendar,
  Flag,
  Building2,
  PlayCircle
} from "lucide-react";
import Image from 'next/image';
import { cn } from "@/lib/utils";
import { fetchAnimeXin } from "@/app/actions/animexin";

interface AnimeSearchResult {
  title: string;
  url: string;
  thumbnail: string;
  type?: string;
  status?: string;
  episode?: string;
  rating?: string | null;
}

interface AnimeDetail {
  mode: 'detail';
  title: string;
  thumbnail?: string;
  synopsis?: string;
  rating?: string;
  totalEpisode?: string;
  genres: string[];
  information: {
    status: string;
    type: string;
    country: string;
    studio: string;
    released: string;
  };
  episodes: {
    episode: string;
    url: string;
    date: string;
  }[];
}

export function AnimeExplorer() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<AnimeSearchResult[] | null>(null);
  const [detailData, setDetailData] = useState<AnimeDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setDetailData(null);
    
    try {
      const body = await fetchAnimeXin({ query });
      if (!body?.status) throw new Error(body?.error || "Search failed.");
      
      setSearchResults(body.data.results);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchDetail = async (url: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const body = await fetchAnimeXin({ url });
      if (!body?.status) throw new Error(body?.error || "Failed to fetch details.");
      
      setDetailData(body.data);
      setSearchResults(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetView = () => {
    setDetailData(null);
    setSearchResults(null);
    setQuery("");
  };

  return (
    <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md overflow-hidden rounded-[2.5rem]">
      <CardHeader className="p-8 sm:p-10 pb-6">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 text-orange-500 rounded-xl">
              <Tv className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="font-headline text-2xl">Anime Explorer</CardTitle>
              <CardDescription>Search and stream your favorite series via AnimeXin.</CardDescription>
            </div>
          </div>
          {(searchResults || detailData) && (
            <Button variant="ghost" size="sm" onClick={resetView} className="rounded-full text-[10px] font-bold uppercase tracking-widest">
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-8 sm:p-10 pt-0 space-y-8">
        {!detailData && (
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-40 group-focus-within:text-orange-500 transition-colors" />
              <Input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search anime (e.g., 'Renegade Immortal')..." 
                className="h-14 pl-12 rounded-2xl bg-secondary/30 border-primary/5 focus-visible:ring-orange-500/20"
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading || !query.trim()} 
              className="h-14 px-8 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-xl shadow-orange-500/10"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search"}
            </Button>
          </form>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-destructive/5 border border-destructive/10 flex items-start gap-3 animate-fade-in-up">
            <Info className="w-5 h-5 text-destructive mt-0.5" />
            <p className="text-sm text-destructive font-medium">{error}</p>
          </div>
        )}

        {/* Search Results List */}
        {searchResults && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
            {searchResults.map((anime, i) => (
              <div 
                key={i} 
                onClick={() => handleFetchDetail(anime.url)}
                className="group cursor-pointer bg-secondary/20 border border-primary/5 rounded-3xl overflow-hidden hover:border-orange-500/30 transition-all hover:shadow-xl"
              >
                <div className="relative aspect-[3/4] w-full bg-black/5">
                  <Image 
                    src={anime.thumbnail} 
                    alt={anime.title} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                  <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                    {anime.type && <Badge className="bg-orange-600 border-none rounded-lg text-[10px] uppercase font-bold">{anime.type}</Badge>}
                    {anime.status && <Badge variant="outline" className="bg-black/50 backdrop-blur-md text-white border-none rounded-lg text-[10px] uppercase font-bold">{anime.status}</Badge>}
                  </div>
                </div>
                <div className="p-4 space-y-1">
                  <h4 className="font-headline font-bold text-sm line-clamp-2 leading-tight group-hover:text-orange-600 transition-colors">
                    {anime.title}
                  </h4>
                  {anime.episode && <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-60">{anime.episode}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detailed View */}
        {detailData && (
          <div className="space-y-10 animate-fade-in-up">
            <Button 
              variant="ghost" 
              onClick={() => handleSearch()} 
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-orange-600 -ml-2"
            >
              <ChevronLeft className="w-3 h-3" /> Back to results
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
              {/* Poster Column */}
              <div className="md:col-span-4 space-y-6">
                <div className="relative aspect-[3/4] w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-primary/5">
                  {detailData.thumbnail && (
                    <Image 
                      src={detailData.thumbnail} 
                      alt={detailData.title} 
                      fill 
                      className="object-cover"
                      unoptimized
                    />
                  )}
                  <div className="absolute top-4 right-4 bg-orange-600 text-white p-3 rounded-2xl flex flex-col items-center gap-1 shadow-lg">
                    <Star className="w-4 h-4 fill-white" />
                    <span className="text-xs font-bold">{detailData.rating || "-"}</span>
                  </div>
                </div>

                <div className="bg-secondary/20 p-6 rounded-3xl border border-primary/5 space-y-4">
                  <h5 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Information</h5>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-muted-foreground flex items-center gap-2"><Flag className="w-3 h-3" /> Status</span>
                      <span className="text-orange-600">{detailData.information.status}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-muted-foreground flex items-center gap-2"><PlayCircle className="w-3 h-3" /> Type</span>
                      <span>{detailData.information.type}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-muted-foreground flex items-center gap-2"><Building2 className="w-3 h-3" /> Studio</span>
                      <span>{detailData.information.studio}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-muted-foreground flex items-center gap-2"><Calendar className="w-3 h-3" /> Released</span>
                      <span>{detailData.information.released}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details Column */}
              <div className="md:col-span-8 space-y-8">
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold font-headline leading-tight">{detailData.title}</h2>
                  <div className="flex flex-wrap gap-2">
                    {detailData.genres.map((genre, i) => (
                      <Badge key={i} variant="secondary" className="bg-primary/5 text-primary/60 border-none px-3 py-1 rounded-full text-[10px] font-bold">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                   <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 flex items-center gap-2">
                     <Info className="w-3 h-3" /> Synopsis
                   </h4>
                   <p className="text-sm text-muted-foreground leading-relaxed">
                     {detailData.synopsis || "No synopsis available."}
                   </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 flex items-center gap-2">
                      <ListOrdered className="w-3 h-3" /> Episodes ({detailData.totalEpisode})
                    </h4>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {detailData.episodes.map((ep, i) => (
                      <Button 
                        key={i} 
                        variant="outline" 
                        asChild 
                        className="h-14 rounded-2xl border-primary/5 hover:bg-orange-500/5 hover:border-orange-500/20 justify-between px-6 transition-all group"
                      >
                        <a href={ep.url} target="_blank" rel="noopener noreferrer">
                          <div className="flex items-center gap-4">
                             <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-[10px] font-bold font-mono group-hover:bg-orange-600 group-hover:text-white transition-colors">
                               {ep.episode || (detailData.episodes.length - i)}
                             </div>
                             <span className="text-sm font-bold font-headline">Episode {ep.episode}</span>
                          </div>
                          <div className="flex items-center gap-3">
                             <span className="text-[10px] text-muted-foreground opacity-60 font-medium">{ep.date}</span>
                             <ExternalLink className="w-4 h-4 text-orange-600 opacity-20 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </a>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
