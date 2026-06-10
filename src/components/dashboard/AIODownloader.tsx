"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  DownloadCloud, 
  Link as LinkIcon, 
  Loader2, 
  PlayCircle, 
  Image as ImageIcon, 
  Music, 
  ExternalLink,
  Info,
  CheckCircle2,
  Download,
  Video
} from "lucide-react";
import Image from 'next/image';
import { cn } from "@/lib/utils";
import { fetchSnapVideo } from "@/app/actions/downloader";

interface MediaItem {
  url: string;
  quality?: string | null;
  type?: 'video' | 'audio' | 'image' | string;
  ext?: string;
}

interface SnapVideoResult {
  title?: string;
  thumbnail?: string;
  description?: string;
  author?: {
    name?: string;
    avatar?: string;
  };
  media?: MediaItem[];
  hashtags?: string[];
  platform?: string;
}

export function AIODownloader() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SnapVideoResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const body = await fetchSnapVideo(url);
      
      if (!body?.status) {
        throw new Error(body?.error ?? "Failed to extract media content.");
      }

      setResult(body.data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md overflow-hidden rounded-[2.5rem]">
      <CardHeader className="p-8 sm:p-10 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">
            <DownloadCloud className="w-6 h-6" />
          </div>
          <div>
            <CardTitle className="font-headline text-2xl">AIO Downloader</CardTitle>
            <CardDescription>Extract video, audio, and photos from any social link.</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-8 sm:p-10 pt-0 space-y-8">
        <form onSubmit={handleProcess} className="space-y-4">
          <div className="relative group">
            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-40 group-focus-within:text-blue-500 transition-colors" />
            <Input 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste link from TikTok, Instagram, Twitter..." 
              className="h-14 pl-12 rounded-2xl bg-secondary/30 border-primary/5 focus-visible:ring-blue-500/20"
            />
          </div>
          <Button 
            type="submit" 
            disabled={loading || !url.trim()} 
            className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xl shadow-blue-500/10 transition-all hover:scale-[1.01]"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Processing Asset...</>
            ) : (
              <><PlayCircle className="w-5 h-5 mr-2" /> Fetch Media Content</>
            )}
          </Button>
        </form>

        {error && (
          <div className="p-4 rounded-2xl bg-destructive/5 border border-destructive/10 flex items-start gap-3 animate-fade-in-up">
            <Info className="w-5 h-5 text-destructive mt-0.5" />
            <p className="text-sm text-destructive font-medium">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-8 animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Preview Column */}
              <div className="md:col-span-5">
                <div className="relative aspect-[9/16] max-h-[500px] w-full bg-black rounded-[2rem] overflow-hidden shadow-2xl border border-primary/5">
                  {result.thumbnail && (
                    <Image 
                      src={result.thumbnail} 
                      alt="Preview" 
                      fill 
                      className="object-cover opacity-80"
                      unoptimized
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md" />
                      <span className="text-white text-xs font-bold uppercase tracking-widest">{result.author?.name || result.platform || "Content Creator"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info & Downloads Column */}
              <div className="md:col-span-7 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold font-headline leading-tight">{result.title || "Untitled Media"}</h3>
                  {result.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {result.description}
                    </p>
                  )}
                </div>

                {result.hashtags && result.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {result.hashtags.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="bg-primary/5 text-primary/60 border-none px-3 py-1 rounded-full text-[10px] font-bold">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="pt-4 space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3" /> Available Downloads
                  </h4>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {result.media?.map((media, idx) => {
                      const isAudio = media.type === 'audio' || media.ext === 'mp3';
                      const isVideo = media.type === 'video' || media.ext === 'mp4';
                      const Icon = isAudio ? Music : isVideo ? Video : ImageIcon;
                      
                      return (
                        <div key={idx} className="flex gap-2">
                          <Button 
                            asChild
                            variant="outline"
                            className="h-14 flex-1 rounded-2xl justify-between px-6 border-primary/5 hover:bg-secondary/50 transition-all font-bold group"
                          >
                            <a href={media.url} target="_blank" rel="noopener noreferrer">
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  "p-2 rounded-xl transition-colors",
                                  isAudio ? "bg-purple-500/10 text-purple-500" : "bg-blue-500/10 text-blue-500"
                                )}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="text-left">
                                  <span className="block text-sm">
                                    {media.type?.toUpperCase()} {media.quality ? `- ${media.quality}` : ''}
                                  </span>
                                  <span className="block text-[10px] text-muted-foreground font-medium opacity-60">
                                    Format: {media.ext?.toUpperCase() || 'Unknown'}
                                  </span>
                                </div>
                              </div>
                              <ExternalLink className="w-4 h-4 opacity-20 group-hover:opacity-100 transition-opacity" />
                            </a>
                          </Button>
                          <Button 
                            asChild
                            className="h-14 w-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/10 flex-shrink-0 transition-transform hover:scale-105 active:scale-95"
                            title="Download Now"
                          >
                            <a href={media.url} download target="_blank" rel="noopener noreferrer">
                               <Download className="w-5 h-5" />
                            </a>
                          </Button>
                        </div>
                      );
                    })}
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
