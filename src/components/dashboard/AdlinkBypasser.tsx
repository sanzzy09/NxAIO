"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Link as LinkIcon, 
  Loader2, 
  ExternalLink,
  Copy,
  Info,
  ShieldCheck,
  Globe,
  Trash2
} from "lucide-react";
import { bypassAdlink } from "@/app/actions/bypass";
import { useToast } from "@/hooks/use-toast";

export function AdlinkBypasser() {
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
      const res = await bypassAdlink(url);
      if (!res.status) throw new Error(res.error);
      setResult(res.data);
      toast({
        title: "Bypass complete",
        description: "Destination URL extracted successfully.",
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyResult = () => {
    const finalUrl = result?.result || result?.url || "";
    if (!finalUrl) return;
    navigator.clipboard.writeText(finalUrl);
    toast({
      title: "URL Copied",
      description: "Direct link copied to clipboard.",
    });
  };

  const clear = () => {
    setUrl("");
    setResult(null);
    setError(null);
  };

  return (
    <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md overflow-hidden rounded-[2.5rem]">
      <CardHeader className="p-8 sm:p-10 pb-6">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 text-yellow-600 rounded-xl">
              <Zap className="size-6" />
            </div>
            <div>
              <CardTitle className="font-headline text-2xl">Adlink Bypasser</CardTitle>
              <CardDescription>Bypass annoying shortlinks and ad-heavy redirects instantly.</CardDescription>
            </div>
          </div>
          {(url || result) && (
            <Button variant="ghost" size="icon" onClick={clear} className="rounded-full hover:bg-destructive/5 hover:text-destructive">
              <Trash2 className="size-5" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-8 sm:p-10 pt-0 space-y-8">
        <div className="space-y-6">
          <form onSubmit={handleProcess} className="space-y-4">
            <div className="relative group">
              <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-40 group-focus-within:text-yellow-600 transition-colors" />
              <Input 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste adlink (e.g., bitly, adfly, ouo, etc)..." 
                className="h-14 pl-12 rounded-2xl bg-secondary/30 border-primary/5 focus-visible:ring-yellow-500/20"
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading || !url.trim()} 
              className="w-full h-14 rounded-2xl bg-yellow-600 hover:bg-yellow-700 text-white font-bold shadow-xl shadow-yellow-500/10 transition-all active:scale-95"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="size-5 animate-spin" />
                  <span>Solving Challenge & Bypassing...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Zap className="size-5" />
                  <span>Bypass Adlink</span>
                </div>
              )}
            </Button>
          </form>

          {/* Supported Platforms Notice */}
          <div className="p-6 rounded-[2rem] bg-secondary/20 border border-primary/5 space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 flex items-center gap-2">
              <Globe className="w-3 h-3" /> Compatible Links
            </h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
              Supports 100+ popular link shorteners. Use this to skip timers, captcha redirects, and intrusive pop-up ads from external hosts.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-5 rounded-[1.5rem] bg-destructive/5 border border-destructive/10 flex items-start gap-3 animate-fade-in-up">
            <Info className="size-5 text-destructive mt-0.5" />
            <div className="space-y-1">
               <p className="text-sm text-destructive font-bold">Bypass Failed</p>
               <p className="text-xs text-destructive/80 font-medium leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="p-8 rounded-[2rem] bg-secondary/30 border border-primary/10 space-y-6">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-none px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  <ShieldCheck className="size-3 mr-1" /> Success
                </Badge>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Destination Ready</span>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">Direct Link</p>
                <div className="p-5 rounded-2xl bg-background border border-primary/5 font-mono text-xs break-all leading-relaxed shadow-inner">
                  {result.result || result.url || "Extracted URL"}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={copyResult} className="flex-1 h-12 rounded-xl bg-yellow-600 hover:bg-yellow-700 text-white font-bold gap-2 shadow-lg shadow-yellow-500/10">
                  <Copy className="size-4" /> Copy Link
                </Button>
                <Button asChild variant="outline" className="flex-1 h-12 rounded-xl border-primary/10 font-bold gap-2 hover:bg-secondary/50 transition-all">
                  <a href={result.result || result.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="size-4" /> Open Site
                  </a>
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
