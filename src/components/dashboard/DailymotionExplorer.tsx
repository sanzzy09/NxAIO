"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Video, 
  Search, 
  Loader2, 
  Info, 
  Download, 
  ExternalLink,
  PlayCircle,
  Globe,
  User,
  Clock,
  CheckCircle2,
  Trash2,
  Type
} from "lucide-react";
import Image from 'next/image';
import { cn } from "@/lib/utils";
import { fetchDailymotion } from "@/app/actions/dailymotion";
import { useToast } from "@/hooks/use-toast";

export function DailymotionExplorer() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetchDailymotion(url);
      if (!res.status) throw new Error(res.error);
      setResult(res.data);
      toast({
        title: "Extraction complete",
        description: "Video metadata and mirrors retrieved successfully.",
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setUrl("");
    setResult(null);
    setError(null);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md overflow-hidden rounded-[2.5rem]">
      <CardHeader className="p-8 sm:p-10 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-600 rounded-xl">
              <Video className="size-6" />
            </div>
            <div>
              <CardTitle className="font-headline text-2xl">Dailymotion Explorer</CardTitle>
              <CardDescription>Extract metadata, download mirrors, and subtitles from Dailymotion links.</CardDescription>
            </div>
          </div>
          {result && (
            <Button variant="ghost" size="icon" onClick={clear} className="rounded-full hover:bg-destructive/5 hover:text-destructive">
              <Trash2 className="size-5" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-8 sm:p-10 pt-0 space-y-8">
        <form onSubmit={handleProcess} className="flex gap-2">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground opacity-40 group-focus-within:text-indigo-600 transition-colors" />
            <Input 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste Dailymotion URL (dai.ly or dailymotion.com)..." 
              className="h-14 pl-12 rounded-2xl bg-secondary/30 border-primary/5 focus-visible:ring-indigo-500/20"
            />
          </div>
          <Button 
            type="submit" 
            disabled={loading || !url.trim()} 
            className="h-14 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xl shadow-indigo-500/10 transition-all active:scale-95"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : "Extract"}
          </Button>
        </form>

        {error && (
          <div className="p-5 rounded-[1.5rem] bg-destructive/5 border border-destructive/10 flex items-start gap-3 animate-fade-in-up">
            <Info className="size-5 text-destructive mt-0.5" />
            <div className="space-y-1">
               <p className="text-sm text-destructive font-bold">Extraction Failed</p>
               <p className="text-xs text-destructive/80 font-medium leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-10 animate-fade-in-up">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Preview Column */}
              <div className="lg:col-span-5 space-y-6">
                <div className="relative aspect-video w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-primary/5 bg-black">
                  {result.thumbnails?.['720'] ? (
                    <Image src={result.thumbnails['720']} alt={result.title} fill className="object-cover opacity-80" unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                       <PlayCircle className="size-12 text-white/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
                     <span className="text-white text-xs font-bold uppercase tracking-widest bg-black/40 backdrop-blur-md w-fit px-3 py-1 rounded-lg">
                       {formatDuration(result.duration)}
                     </span>
                  </div>
                </div>

                <div className="p-6 rounded-[2rem] bg-secondary/20 border border-primary/5 space-y-6">
                   <div className="flex items-center gap-4">
                      <div className="size-12 rounded-2xl overflow-hidden border border-primary/5">
                         {result.owner?.avatar ? (
                           <img src={result.owner.avatar} alt={result.owner.username} className="w-full h-full object-cover" />
                         ) : (
                           <div className="w-full h-full bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                              <User className="size-6" />
                           </div>
                         )}
                      </div>
                      <div className="space-y-0.5">
                         <p className="text-sm font-bold font-headline">{result.owner?.username || "Dailymotion Creator"}</p>
                         <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">{result.owner?.type || "Standard Account"}</p>
                      </div>
                   </div>
                   <div className="pt-4 border-t border-primary/5 grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                         <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Country</span>
                         <div className="flex items-center gap-2 text-sm font-bold"><Globe className="size-3 text-indigo-600" /> {result.country || "Global"}</div>
                      </div>
                      <div className="space-y-1">
                         <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Language</span>
                         <div className="flex items-center gap-2 text-sm font-bold capitalize">{result.language || "English"}</div>
                      </div>
                   </div>
                </div>
              </div>

              {/* Links Column */}
              <div className="lg:col-span-7 space-y-8">
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold font-headline leading-tight tracking-tight">{result.title}</h2>
                  <div className="flex flex-wrap gap-2">
                    {result.tags?.slice(0, 5).map((tag: string, i: number) => (
                      <Badge key={i} variant="secondary" className="bg-primary/5 text-primary/60 border-none px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                   <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2 ml-1">
                     <Download className="size-3" /> Available Mirrors
                   </h4>
                   <div className="grid grid-cols-1 gap-2">
                      {Object.entries(result.video_url || {}).map(([quality, links]: [string, any]) => (
                        <div key={quality} className="p-4 rounded-2xl bg-secondary/30 border border-primary/5 flex items-center justify-between gap-4">
                           <div className="flex items-center gap-4">
                              <Badge className="bg-indigo-600 text-white border-none rounded-xl px-3 py-1 font-bold text-xs shadow-lg">
                                {quality}
                              </Badge>
                              <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">MP4 Container</span>
                           </div>
                           <div className="flex gap-2">
                              {links.map((link: any, idx: number) => (
                                <Button key={idx} asChild variant="outline" size="sm" className="h-9 px-4 rounded-xl text-[9px] font-bold gap-2 border-primary/10 hover:bg-indigo-500/5 hover:text-indigo-600 transition-all">
                                   <a href={link.url} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="size-3" /> Mirror {idx + 1}
                                   </a>
                                </Button>
                              ))}
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                {result.subtitles && (
                  <div className="space-y-6 pt-4">
                     <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2 ml-1">
                       <Type className="size-3" /> Synchronized Subtitles
                     </h4>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Object.entries(result.subtitles).map(([lang, info]: [string, any]) => (
                          <div key={lang} className="p-4 rounded-2xl bg-secondary/10 border border-primary/5 flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <CheckCircle2 className="size-4 text-emerald-500" />
                                <span className="text-xs font-bold font-headline">{info.label}</span>
                             </div>
                             <Badge variant="outline" className="text-[8px] uppercase tracking-widest opacity-40">{info.subtitles.length} Lines</Badge>
                          </div>
                        ))}
                     </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

