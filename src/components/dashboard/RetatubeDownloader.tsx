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
  Download,
  Info,
  CheckCircle2,
  Trash2,
  User,
  Music,
  Video,
  ShieldCheck
} from "lucide-react";
import Image from 'next/image';
import { cn } from "@/lib/utils";
import { fetchRetatube } from "@/app/actions/retatube";
import { useToast } from "@/hooks/use-toast";

export function RetatubeDownloader() {
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
      const res = await fetchRetatube(url);
      if (!res.status) throw new Error(res.error);
      
      setResult(res.data);
      toast({
        title: "Extraction complete",
        description: "Media links orchestrated successfully.",
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

  return (
    <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md overflow-hidden rounded-[2.5rem]">
      <CardHeader className="p-8 sm:p-10 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl">
              <DownloadCloud className="size-6" />
            </div>
            <div>
              <CardTitle className="font-headline text-2xl">Retatube Downloader</CardTitle>
              <CardDescription>AIO extraction logic for TikTok, YouTube, and more.</CardDescription>
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
            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground opacity-40 group-focus-within:text-emerald-600 transition-colors" />
            <Input 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste social link (TikTok, YT, Twitter)..." 
              className="h-14 pl-12 rounded-2xl bg-secondary/30 border-primary/5 focus-visible:ring-emerald-500/20"
            />
          </div>
          <Button 
            type="submit" 
            disabled={loading || !url.trim()} 
            className="h-14 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xl shadow-emerald-500/10 transition-all active:scale-95"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : "Fetch"}
          </Button>
        </form>

        {error && (
          <div className="p-5 rounded-[1.5rem] bg-destructive/5 border border-destructive/10 flex items-start gap-3 animate-fade-in-up">
            <Info className="size-5 text-destructive mt-0.5" />
            <p className="text-sm text-destructive font-medium">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-8 animate-fade-in-up">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Preview Column */}
              <div className="lg:col-span-5">
                <div className="relative aspect-[9/16] max-h-[500px] w-full bg-black rounded-[2rem] overflow-hidden shadow-2xl border border-primary/5 group">
                  {result.thumbnail && (
                    <Image 
                      src={result.thumbnail} 
                      alt="Preview" 
                      fill 
                      className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                      unoptimized
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                        <User className="size-4 text-white" />
                      </div>
                      <span className="text-white text-xs font-bold uppercase tracking-widest">{result.owner || "Creator"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Downloads Column */}
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold font-headline leading-tight">{result.title}</h3>
                  <div className="flex items-center gap-3">
                     <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-none px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest">
                       <ShieldCheck className="size-3 mr-1.5" /> Verified Link
                     </Badge>
                     {result.credit && (
                       <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/30">Logic: {result.credit}</span>
                     )}
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                   <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2 ml-1">
                     <Download className="size-3" /> Available Directory
                   </h4>
                   
                   <div className="grid grid-cols-1 gap-2">
                      {result.downloads.map((dl: any, idx: number) => {
                        const isAudio = dl.label.toLowerCase().includes('mp3') || dl.label.toLowerCase().includes('audio');
                        
                        return (
                          <Button 
                            key={idx} 
                            asChild
                            variant="outline"
                            className="h-16 rounded-[1.5rem] justify-between px-6 border-primary/5 bg-secondary/10 hover:bg-emerald-500/5 hover:text-emerald-600 transition-all font-bold group shadow-sm"
                          >
                            <a href={dl.url} target="_blank" rel="noopener noreferrer" download>
                              <div className="flex items-center gap-4">
                                <div className={cn(
                                  "p-2.5 rounded-xl transition-colors",
                                  isAudio ? "bg-purple-500/10 text-purple-500" : "bg-emerald-500/10 text-emerald-600"
                                )}>
                                  {isAudio ? <Music className="size-4" /> : <Video className="size-4" />}
                                </div>
                                <span className="text-xs uppercase tracking-wide">{dl.label}</span>
                              </div>
                              <Download className="size-4 opacity-20 group-hover:opacity-100 transition-opacity" />
                            </a>
                          </Button>
                        );
                      })}
                   </div>
                </div>

                <div className="p-6 rounded-[2rem] bg-blue-500/5 border border-blue-500/10 flex items-start gap-4">
                   <Info className="size-5 text-blue-500 opacity-60 mt-0.5" />
                   <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                     Direct links are orchestrated via Retatube endpoints. No watermarks are applied to HD video exports.
                   </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
