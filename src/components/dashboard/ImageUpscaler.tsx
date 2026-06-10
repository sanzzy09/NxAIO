"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Sparkles, 
  ImageIcon, 
  Loader2, 
  Download, 
  Maximize, 
  ExternalLink,
  Info,
  CheckCircle2
} from "lucide-react";
import Image from 'next/image';
import { upscaleImage } from "@/app/actions/upscaler";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ImageUpscaler() {
  const [url, setUrl] = useState("");
  const [resolution, setResolution] = useState("16K");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ jobId: string; imageUrl: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await upscaleImage(url, resolution);
      
      if (!res.status) {
        throw new Error(res.error || "Failed to upscale image.");
      }

      setResult(res.data!);
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
          <div className="p-2 bg-purple-500/10 text-purple-500 rounded-xl">
            <Maximize className="w-6 h-6" />
          </div>
          <div>
            <CardTitle className="font-headline text-2xl">AI Image Upscaler</CardTitle>
            <CardDescription>Enhance and upscale images up to 16K resolution using AI.</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-8 sm:p-10 pt-0 space-y-8">
        <div className="space-y-6">
          <form onSubmit={handleProcess} className="space-y-4">
            <div className="space-y-2">
               <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">
                 Image Source URL
               </label>
               <div className="relative group">
                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-40 group-focus-within:text-purple-500 transition-colors" />
                <Input 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste direct image link (jpg, png, webp)..." 
                  className="h-14 pl-12 rounded-2xl bg-secondary/30 border-primary/5 focus-visible:ring-purple-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">
                  Target Resolution
                </label>
                <Select value={resolution} onValueChange={setResolution}>
                  <SelectTrigger className="h-14 rounded-2xl bg-secondary/30 border-primary/5 focus:ring-purple-500/20">
                    <SelectValue placeholder="Select resolution" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl bg-card border-primary/5">
                    <SelectItem value="2K">2K (2048p)</SelectItem>
                    <SelectItem value="4K">4K (4096p)</SelectItem>
                    <SelectItem value="8K">8K (8192p)</SelectItem>
                    <SelectItem value="16K">16K (16384p)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  type="submit" 
                  disabled={loading || !url.trim()} 
                  className="w-full h-14 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-xl shadow-purple-500/10 transition-all"
                >
                  {loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Enhancing...</>
                  ) : (
                    <><Sparkles className="w-5 h-5 mr-2" /> Upscale Image</>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-destructive/5 border border-destructive/10 flex items-start gap-3 animate-fade-in-up">
            <Info className="w-5 h-5 text-destructive mt-0.5" />
            <p className="text-sm text-destructive font-medium">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-8 animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-12">
                <div className="relative w-full aspect-video bg-black/5 rounded-[2.5rem] overflow-hidden shadow-2xl border border-primary/5">
                  <Image 
                    src={result.imageUrl} 
                    alt="Upscaled result" 
                    fill 
                    className="object-contain"
                    unoptimized
                  />
                </div>
              </div>

              <div className="md:col-span-12 flex flex-col sm:flex-row gap-4 items-center justify-between p-6 bg-secondary/20 rounded-[2rem] border border-primary/5">
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Image Enhanced successfully
                  </h4>
                  <p className="text-xs text-muted-foreground">Your image has been upscaled to {resolution}.</p>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    asChild
                    variant="outline"
                    className="h-12 rounded-full px-6 border-primary/5 hover:bg-secondary/50 font-bold"
                  >
                    <a href={result.imageUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" /> View Original
                    </a>
                  </Button>
                  <Button 
                    asChild
                    className="h-12 rounded-full px-8 bg-purple-600 hover:bg-purple-700 text-white shadow-xl shadow-purple-500/10 font-bold"
                  >
                    <a href={result.imageUrl} download={`upscaled-${result.jobId}.png`} target="_blank" rel="noopener noreferrer">
                      <Download className="w-4 h-4 mr-2" /> Download HD
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
