'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ScanText, 
  Upload, 
  Loader2, 
  Copy, 
  CheckCircle2, 
  FileText, 
  Info,
  X,
  FileSearch,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { extractText } from "@/app/actions/ocr";
import { cn } from "@/lib/utils";

export function OCRTool() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      setResult(null);
      setError(null);
    }
  };

  const handleProcess = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setStatus("Uploading asset...");

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Small delay for UI simulation
      setTimeout(() => setStatus("Analyzing characters..."), 2000);
      setTimeout(() => setStatus("Synthesizing text layers..."), 8000);

      const res = await extractText(formData);
      if (!res.status) throw new Error(res.error);

      setResult(res.data?.text || "");
      toast({
        title: "Extraction complete",
        description: "Text successfully extracted from the file.",
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setStatus("");
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    toast({
      title: "Text Copied",
      description: "Extracted content copied to clipboard.",
    });
  };

  const clear = () => {
    setFile(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md overflow-hidden rounded-[2.5rem]">
      <CardHeader className="p-8 sm:p-10 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 text-cyan-600 rounded-xl">
              <ScanText className="size-6" />
            </div>
            <div>
              <CardTitle className="font-headline text-2xl">AI OCR Extractor</CardTitle>
              <CardDescription>Extract text from screenshots, photos, and PDF files.</CardDescription>
            </div>
          </div>
          {file && (
            <Button variant="ghost" size="icon" onClick={clear} className="rounded-full hover:bg-destructive/5 hover:text-destructive">
              <X className="size-5" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-8 sm:p-10 pt-0 space-y-8">
        {!result ? (
          <div className="space-y-6">
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={cn(
                "group relative border-2 border-dashed rounded-[2rem] p-12 flex flex-col items-center justify-center transition-all duration-300",
                file ? "border-cyan-500/50 bg-cyan-500/5" : "border-primary/5 bg-secondary/10 hover:border-cyan-500/20 hover:bg-secondary/20"
              )}
            >
              {file ? (
                <div className="text-center space-y-4 animate-fade-in-up">
                  <div className="p-4 bg-cyan-500/10 rounded-2xl mx-auto w-fit">
                    <FileText className="size-10 text-cyan-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-sm truncate max-w-[200px]">{file.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="p-4 bg-secondary rounded-full mx-auto w-fit group-hover:scale-110 transition-transform duration-500">
                    <Upload className="size-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-sm">Drop your scan here</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, PDF up to 10MB</p>
                  </div>
                  <Button 
                    variant="link" 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-cyan-600 font-bold text-xs uppercase tracking-widest"
                  >
                    Browse Files
                  </Button>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,application/pdf"
                className="hidden"
              />
            </div>

            <Button 
              disabled={!file || loading}
              onClick={handleProcess}
              className="w-full h-14 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold shadow-xl shadow-cyan-500/10 transition-all active:scale-95"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="size-5 animate-spin" />
                  <span>{status}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Zap className="size-5" />
                  <span>Start Extraction</span>
                </div>
              )}
            </Button>

            <div className="p-6 rounded-[2rem] bg-blue-500/5 border border-blue-500/10 flex items-start gap-4">
              <Info className="size-5 text-blue-500 mt-0.5 opacity-60" />
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600/60">Pro Tip</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Higher resolution images provide more accurate results. Clear screenshots of code work best for developers.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-none px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  <CheckCircle2 className="size-3 mr-1" /> Extraction Successful
                </Badge>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Source: {file?.name}</span>
              </div>
              <div className="flex gap-2">
                <Button onClick={copyToClipboard} size="sm" variant="outline" className="rounded-full h-9 px-4 gap-2 border-primary/5 hover:bg-cyan-500/5 hover:text-cyan-600 font-bold text-[10px] uppercase tracking-widest transition-all">
                  <Copy className="size-3.5" /> Copy Text
                </Button>
                <Button onClick={clear} size="sm" variant="ghost" className="rounded-full h-9 px-4 font-bold text-[10px] uppercase tracking-widest">
                  New Scan
                </Button>
              </div>
            </div>

            <div className="group relative">
               <div className="absolute inset-0 bg-cyan-500/5 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
               <div className="relative p-8 rounded-[2rem] bg-[#1e1e1e] border border-white/5 min-h-[200px] max-h-[500px] overflow-y-auto custom-scrollbar">
                <pre className="text-sm text-cyan-50/90 leading-relaxed whitespace-pre-wrap font-mono">
                  {result}
                </pre>
              </div>
            </div>

            <div className="text-center pt-4">
               <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-[0.2em] opacity-40">
                 Synthesized by NxAIO OCR Engine
               </p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-5 rounded-[1.5rem] bg-destructive/5 border border-destructive/10 flex items-start gap-3 animate-fade-in-up">
            <X className="size-5 text-destructive mt-0.5" />
            <div className="space-y-1">
               <p className="text-sm text-destructive font-bold">Extraction Failed</p>
               <p className="text-xs text-destructive/80 font-medium leading-relaxed">{error}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
