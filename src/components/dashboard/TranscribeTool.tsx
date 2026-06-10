"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Mic, 
  Search, 
  Loader2, 
  Clock, 
  Copy, 
  CheckCircle2, 
  Info,
  Youtube,
  Music,
  Video,
  FileText,
  AlignLeft
} from "lucide-react";
import { transcribeMedia } from "@/app/actions/transcribe";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TranscriptSegment {
  text: string;
  start: number;
  end: number;
}

interface TranscribeResult {
  platform: string;
  segments: TranscriptSegment[];
  fullText: string;
  language: string;
}

export function TranscribeTool() {
  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState("auto");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TranscribeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await transcribeMedia(url, language);
      if (!res.status) throw new Error(res.error);
      setResult(res.data as TranscribeResult);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyTranscript = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.fullText);
    toast({
      title: "Transcript Copied",
      description: "Full text has been copied to your clipboard.",
    });
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return [h, m, s]
      .map(v => v < 10 ? "0" + v : v)
      .filter((v, i) => v !== "00" || i > 0)
      .join(":");
  };

  return (
    <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md overflow-hidden rounded-[2.5rem]">
      <CardHeader className="p-8 sm:p-10 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl">
            <Mic className="size-6" />
          </div>
          <div>
            <CardTitle className="font-headline text-2xl">AI Media Transcriber</CardTitle>
            <CardDescription>Convert TikTok, Reels, YouTube, and Audio URLs to text.</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-8 sm:p-10 pt-0 space-y-8">
        <form onSubmit={handleProcess} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-8 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground opacity-40 group-focus-within:text-emerald-500 transition-colors" />
              <Input 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste YouTube, TikTok, or direct MP3 link..." 
                className="h-14 pl-12 rounded-2xl bg-secondary/30 border-primary/5 focus-visible:ring-emerald-500/20"
              />
            </div>
            <div className="md:col-span-4">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="h-14 rounded-2xl bg-secondary/30 border-primary/5 focus:ring-emerald-500/20">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-primary/5 bg-card">
                  <SelectItem value="auto">Auto Detect</SelectItem>
                  <SelectItem value="id">Indonesian</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ja">Japanese</SelectItem>
                  <SelectItem value="ko">Korean</SelectItem>
                  <SelectItem value="zh">Chinese</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button 
            type="submit" 
            disabled={loading || !url.trim()} 
            className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xl shadow-emerald-500/10 transition-all hover:scale-[1.01]"
          >
            {loading ? (
              <><Loader2 className="size-5 animate-spin mr-2" /> Extracting Audio & Transcribing...</>
            ) : (
              <><FileText className="size-5 mr-2" /> Start Transcription</>
            )}
          </Button>
        </form>

        {error && (
          <div className="p-5 rounded-[1.5rem] bg-destructive/5 border border-destructive/10 flex items-start gap-3 animate-fade-in-up">
            <Info className="size-5 text-destructive mt-0.5" />
            <p className="text-sm text-destructive font-medium leading-relaxed">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-none px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  {result.platform} Source
                </Badge>
                <Badge variant="outline" className="border-primary/10 text-muted-foreground/60 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  Lang: {result.language}
                </Badge>
              </div>
              <Button onClick={copyTranscript} variant="outline" className="rounded-full h-10 px-6 gap-2 border-primary/5 hover:bg-emerald-500/5 hover:text-emerald-600 transition-all font-bold text-xs">
                <Copy className="size-3.5" /> Copy Full Text
              </Button>
            </div>

            <Tabs defaultValue="full" className="w-full">
              <TabsList className="bg-secondary/30 p-1 rounded-full border border-primary/5 mb-6">
                <TabsTrigger value="full" className="rounded-full gap-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all">
                  <AlignLeft className="size-3" /> Full Text
                </TabsTrigger>
                <TabsTrigger value="segments" className="rounded-full gap-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all">
                  <Clock className="size-3" /> Timestamps
                </TabsTrigger>
              </TabsList>

              <TabsContent value="full" className="mt-0">
                <div className="p-8 rounded-[2rem] bg-secondary/20 border border-primary/5 min-h-[200px] max-h-[500px] overflow-y-auto custom-scrollbar">
                  <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {result.fullText}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="segments" className="mt-0">
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-3 custom-scrollbar">
                  {result.segments.map((seg, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-2xl bg-secondary/20 border border-primary/5 group hover:border-emerald-500/20 transition-all">
                      <div className="flex-shrink-0">
                        <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-500/5 px-2 py-1 rounded-lg">
                          {formatTime(seg.start)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {seg.text}
                      </p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="p-6 rounded-[2rem] bg-blue-500/5 border border-blue-500/10 flex items-center gap-4">
              <Info className="size-5 text-blue-500 opacity-60" />
              <p className="text-[11px] text-muted-foreground font-medium">
                Note: Performance depends on FreeScribe API load. Transcription for long videos may take up to 60 seconds.
              </p>
            </div>
          </div>
        )}

        {!result && !loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="p-6 rounded-[2rem] border border-primary/5 bg-secondary/10 flex flex-col items-center text-center gap-3">
              <Youtube className="size-6 text-red-500 opacity-60" />
              <h4 className="text-[10px] font-bold uppercase tracking-widest">YouTube</h4>
              <p className="text-[10px] text-muted-foreground">Shorts & Videos</p>
            </div>
            <div className="p-6 rounded-[2rem] border border-primary/5 bg-secondary/10 flex flex-col items-center text-center gap-3">
              <Video className="size-6 text-pink-500 opacity-60" />
              <h4 className="text-[10px] font-bold uppercase tracking-widest">TikTok & Reels</h4>
              <p className="text-[10px] text-muted-foreground">Viral Media Clips</p>
            </div>
            <div className="p-6 rounded-[2rem] border border-primary/5 bg-secondary/10 flex flex-col items-center text-center gap-3">
              <Music className="size-6 text-blue-500 opacity-60" />
              <h4 className="text-[10px] font-bold uppercase tracking-widest">Audio Links</h4>
              <p className="text-[10px] text-muted-foreground">Direct MP3/WAV</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
