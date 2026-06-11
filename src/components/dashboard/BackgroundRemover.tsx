
"use client"

import React, { useState, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Eraser, 
  Upload, 
  Loader2, 
  Download, 
  Image as ImageIcon, 
  CheckCircle2, 
  Info,
  X,
  Link as LinkIcon,
  Trash2,
  Sparkles,
  Zap
} from "lucide-react";
import Image from 'next/image';
import { removeImageBackground } from "@/app/actions/remove-bg";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const ROLE_LIMITS = {
  free: 3,
  pro: 10,
  sultan: 20
};

export function BackgroundRemover() {
  const { user } = useUser();
  const db = useFirestore();
  const userRef = useMemo(() => user ? doc(db, "users", user.uid) : null, [db, user]);
  const { data: profile } = useDoc(userRef);

  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const role = (profile?.role as keyof typeof ROLE_LIMITS) || 'free';
  const limit = ROLE_LIMITS[role];
  const usage = profile?.removerUsage || { count: 0, lastReset: new Date().toISOString().split('T')[0] };

  // Daily Reset Check
  const isResetNeeded = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return usage.lastReset !== today;
  }, [usage.lastReset]);

  const remainingCredits = useMemo(() => {
    const currentCount = isResetNeeded ? 0 : (usage.count || 0);
    return Math.max(0, limit - currentCount);
  }, [isResetNeeded, usage.count, limit]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setError(null);
      setUrl("");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      setResult(null);
      setError(null);
      setUrl("");
    }
  };

  const handleProcess = async () => {
    if (!user) {
      toast({ variant: "destructive", title: "Session required", description: "Please sign in to use AI tools." });
      return;
    }

    if (!file && !url.trim()) return;

    if (remainingCredits <= 0) {
      toast({
        variant: "warning",
        title: "Daily Limit Reached",
        description: `You have used all ${limit} removals for today. Upgrade for higher limits.`,
      });
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setStatus("Analyzing subject...");

    try {
      const res = await removeImageBackground({ 
        file: file || undefined, 
        url: url.trim() || undefined 
      });

      if (!res.status) throw new Error(res.error);

      // Increment usage in Firestore (Reliable)
      if (userRef) {
        const today = new Date().toISOString().split('T')[0];
        const newCount = isResetNeeded ? 1 : (usage.count || 0) + 1;
        setDoc(userRef, {
          removerUsage: {
            count: newCount,
            lastReset: today
          }
        }, { merge: true }).catch(e => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: userRef.path,
            operation: 'write',
            requestResourceData: { removerUsage: { count: newCount, lastReset: today } }
          }));
        });
      }

      setResult(res.data || null);
      toast({
        title: "Background Removed",
        description: "Your subject has been isolated successfully. Credits deducted.",
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setStatus("");
    }
  };

  const clear = () => {
    setFile(null);
    setUrl("");
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md overflow-hidden rounded-[2.5rem]">
      <CardHeader className="p-8 sm:p-10 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-500/10 text-pink-600 rounded-xl">
              <Eraser className="size-6" />
            </div>
            <div>
              <CardTitle className="font-headline text-2xl">AI Background Remover</CardTitle>
              <CardDescription>Instantly isolate subjects from any image with professional precision.</CardDescription>
            </div>
          </div>

          <div className={cn(
            "flex items-center gap-3 px-6 py-3 rounded-2xl border border-primary/5",
            role === 'sultan' ? "bg-yellow-500/5 text-yellow-600" : role === 'pro' ? "bg-pink-500/5 text-pink-600" : "bg-secondary/30"
          )}>
             <div className="p-2 bg-white/20 rounded-lg">
                <Zap className="size-4" />
             </div>
             <div className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Daily Credits ({role})</p>
                <p className="text-sm font-bold font-headline">{remainingCredits} removals left</p>
             </div>
             {role === 'free' && (
               <Button variant="link" asChild className="h-auto p-0 ml-4 text-[10px] font-bold uppercase text-pink-600">
                  <a href="/pricing">Upgrade</a>
               </Button>
             )}
          </div>
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
                file ? "border-pink-500/50 bg-pink-500/5" : "border-primary/5 bg-secondary/10 hover:border-pink-500/20 hover:bg-secondary/20"
              )}
            >
              {file ? (
                <div className="text-center space-y-4 animate-fade-in-up">
                  <div className="p-4 bg-pink-500/10 rounded-2xl mx-auto w-fit">
                    <ImageIcon className="size-10 text-pink-600" />
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
                    <p className="font-bold text-sm">Drop your photo here</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG or WEBP up to 10MB</p>
                  </div>
                  <Button 
                    variant="link" 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-pink-600 font-bold text-xs uppercase tracking-widest"
                  >
                    Browse Files
                  </Button>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-primary/5"></div>
              <span className="flex-shrink mx-4 text-[10px] uppercase text-muted-foreground font-bold tracking-[0.2em] opacity-40">OR USE URL</span>
              <div className="flex-grow border-t border-primary/5"></div>
            </div>

            <div className="relative group">
              <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground opacity-40 group-focus-within:text-pink-500 transition-colors" />
              <Input 
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setFile(null);
                }}
                placeholder="Paste remote image link..." 
                className="h-14 rounded-2xl bg-secondary/30 border-primary/5 focus-visible:ring-pink-500/20"
              />
            </div>

            <Button 
              disabled={(!file && !url.trim()) || loading || remainingCredits <= 0}
              onClick={handleProcess}
              className="w-full h-14 rounded-2xl bg-pink-600 hover:bg-pink-700 text-white font-bold shadow-xl shadow-pink-500/10 transition-all active:scale-95"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="size-5 animate-spin" />
                  <span>{status || "Initializing AI engine..."}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="size-5" />
                  <span>Remove Background</span>
                </div>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-12">
                <div className="relative w-full aspect-video bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-repeat rounded-[2.5rem] overflow-hidden shadow-2xl border border-primary/5 group">
                  <Image 
                    src={result} 
                    alt="Isolated result" 
                    fill 
                    className="object-contain p-4 group-hover:scale-[1.02] transition-transform duration-700"
                    unoptimized
                  />
                  <div className="absolute top-6 left-6">
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-none px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                      <CheckCircle2 className="size-3 mr-2" /> isolated subject
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="md:col-span-12 flex flex-col sm:flex-row gap-4 items-center justify-between p-8 bg-secondary/20 rounded-[2.5rem] border border-primary/5">
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="text-sm font-bold font-headline">Ready for Deployment</h4>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">High-Resolution Transparent PNG</p>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    onClick={clear}
                    variant="outline"
                    className="h-12 rounded-xl px-6 border-primary/10 hover:bg-secondary font-bold text-[11px] uppercase tracking-widest"
                  >
                    New Image
                  </Button>
                  <Button 
                    asChild
                    className="h-12 rounded-xl px-10 bg-pink-600 hover:bg-pink-700 text-white shadow-xl shadow-pink-500/10 font-bold text-[11px] uppercase tracking-widest"
                  >
                    <a href={result} download="nx-isolated-subject.png">
                      <Download className="size-4 mr-2" /> Download Result
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {(error || (remainingCredits <= 0 && !result)) && (
          <div className="p-5 rounded-[1.5rem] bg-destructive/5 border border-destructive/10 flex items-start gap-3 animate-fade-in-up">
            <X className="size-5 text-destructive mt-0.5" />
            <div className="space-y-1">
               <p className="text-sm text-destructive font-bold">{error ? "Removal Failed" : "Limit Reached"}</p>
               <p className="text-xs text-destructive/80 font-medium leading-relaxed">
                 {error || `You have exhausted your daily removals. Please upgrade your identity for higher quotas.`}
               </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
