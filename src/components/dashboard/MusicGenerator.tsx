"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Music, 
  Sparkles, 
  Loader2, 
  Play, 
  Download, 
  ListMusic, 
  Mic2, 
  Radio, 
  Info,
  CheckCircle2,
  AlertCircle,
  X,
  Plus,
  History,
  Trash2,
  Zap,
  Crown
} from "lucide-react";
import Image from 'next/image';
import { cn } from "@/lib/utils";
import { createMusicJob, pollMusicStatus } from "@/app/actions/remusic";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useCollection, useDoc } from "@/firebase";
import { doc, setDoc, collection, query, orderBy, serverTimestamp, deleteDoc, updateDoc } from "firebase/firestore";
import { logActivity } from "@/lib/activity";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const STYLES = {
  genre: ["Pop", "Rock", "Hip-Hop", "R&B", "Jazz", "Classical", "Electronic", "EDM", "Lo-fi", "Metal", "Soul", "Trap", "K-Pop", "Phonk", "Cinematic"],
  mood: ["Calm", "Happy", "Sad", "Energetic", "Epic", "Dark", "Dreamy", "Uplifting", "Melancholic", "Chill"],
  vocal: ["Male Vocal", "Female Vocal", "Duet", "Rap", "Whisper"],
  tempo: ["Slow", "Mid-tempo", "Upbeat", "Fast"]
};

const ROLE_LIMITS = {
  free: 5,
  pro: 15,
  sultan: 30
};

export function MusicGenerator() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const userRef = useMemo(() => user ? doc(db, "users", user.uid) : null, [db, user]);
  const { data: profile } = useDoc(userRef);

  const [activeTab, setActiveTab] = useState<'simple' | 'custom' | 'history'>('simple');
  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  
  const role = (profile?.role as keyof typeof ROLE_LIMITS) || 'free';
  const limit = ROLE_LIMITS[role];
  const usage = profile?.musicUsage || { count: 0, weekStart: new Date().toISOString() };

  // Rolling Weekly Reset Logic
  const isResetNeeded = useMemo(() => {
    if (!usage.weekStart) return true;
    const weekStart = new Date(usage.weekStart);
    const now = new Date();
    const diff = now.getTime() - weekStart.getTime();
    return diff > 7 * 24 * 60 * 60 * 1000; // 7 days
  }, [usage.weekStart]);

  const remainingCredits = useMemo(() => {
    const currentCount = isResetNeeded ? 0 : (usage.count || 0);
    return Math.max(0, limit - currentCount);
  }, [isResetNeeded, usage.count, limit]);

  // Fetch Music History from Firestore
  const musicQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "users", user.uid, "music"),
      orderBy("timestamp", "desc")
    );
  }, [db, user]);

  const { data: history, loading: historyLoading } = useCollection(musicQuery);

  const handleToggleStyle = (style: string) => {
    setSelectedStyles(prev => 
      prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
    );
  };

  const handleGenerate = async () => {
    if (!user) {
      toast({ variant: "destructive", title: "Authentication required", description: "Please sign in to generate music." });
      return;
    }

    if (!prompt.trim() && activeTab === 'simple') return;
    if (!title.trim() && activeTab === 'custom') return;

    if (remainingCredits <= 0) {
      toast({
        variant: "warning",
        title: "Weekly Limit Reached",
        description: `You've used all ${limit} generations for this week. Upgrade your tier for more credits.`,
      });
      return;
    }

    setLoading(true);
    try {
      const res = await createMusicJob({
        prompt,
        styles: selectedStyles,
        title: title || undefined,
        lyrics: lyrics || undefined,
        mode: activeTab === 'custom' ? 'custom' : 'simple'
      });

      if (!res.status) throw new Error(res.error);

      // Increment Usage Count in Firestore
      if (userRef) {
        const newCount = isResetNeeded ? 1 : (usage.count || 0) + 1;
        const newWeekStart = isResetNeeded ? new Date().toISOString() : usage.weekStart;
        
        updateDoc(userRef, {
          musicUsage: {
            count: newCount,
            weekStart: newWeekStart
          }
        }).catch(e => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: userRef.path,
            operation: 'write',
            requestResourceData: { musicUsage: { count: newCount, weekStart: newWeekStart } }
          }));
        });
      }

      // Start tracking jobs
      const newJobs = res.data.map((j: any) => ({
        id: j.song_id,
        status: 'pending',
        percentage: 0,
        originalPrompt: prompt,
        originalMode: activeTab
      }));
      
      setJobs(prev => [...newJobs, ...prev]);
      toast({
        title: "Composition Initiated",
        description: "NxAIO is orchestrating your track. Credits deducted.",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const saveToHistory = async (result: any, job: any) => {
    if (!user || !db) return;

    const musicRef = doc(db, "users", user.uid, "music", result.id);
    const musicData = {
      songId: result.id,
      title: result.title || "Untitled Masterpiece",
      audio: result.audio,
      image: result.image,
      duration: result.duration,
      tags: result.tags,
      lyrics: result.lyrics,
      prompt: job.originalPrompt,
      mode: job.originalMode,
      timestamp: serverTimestamp()
    };

    setDoc(musicRef, musicData).catch(e => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: musicRef.path,
        operation: 'write',
        requestResourceData: musicData
      }));
    });

    logActivity(db, user.uid, 'profile_update', `Generated AI track: "${result.title}"`, { songId: result.id });
  };

  const handleDelete = async (songId: string) => {
    if (!user || !db) return;
    const musicRef = doc(db, "users", user.uid, "music", songId);
    try {
      await deleteDoc(musicRef);
      toast({ title: "Track removed", description: "The track has been deleted from your library." });
    } catch (e) {
      toast({ variant: "destructive", title: "Deletion failed", description: "Could not remove track." });
    }
  };

  // Polling logic for pending jobs
  useEffect(() => {
    if (jobs.length === 0) return;

    const interval = setInterval(async () => {
      const pendingJobs = jobs.filter(j => j.status !== 'success' && j.status !== 'failed');
      if (pendingJobs.length === 0) {
        clearInterval(interval);
        return;
      }

      for (const job of pendingJobs) {
        const update = await pollMusicStatus(job.id);
        
        if (update.status === 'success') {
          setJobs(prev => prev.filter(j => j.id !== job.id));
          saveToHistory(update.result, job);
          toast({
            title: "Track Complete",
            description: `"${update.result.title}" is ready and saved to history.`,
          });
        } else if (update.status === 'failed') {
          setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'failed', error: update.error } : j));
        } else {
          setJobs(prev => prev.map(j => j.id === job.id ? { ...j, percentage: update.percentage, status: update.status } : j));
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [jobs, user, db, toast]);

  const renderTrackCard = (song: any, isHistory = false) => (
    <div key={song.songId || song.id} className="group relative p-6 rounded-[2.5rem] bg-secondary/30 border border-primary/5 hover:border-indigo-500/20 transition-all shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-3">
           <div className="relative aspect-square rounded-[2rem] overflow-hidden shadow-2xl bg-black/5">
              {song.image ? (
                <Image src={song.image} alt={song.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" unoptimized />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                   <Music className="size-8 text-muted-foreground/20" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <Play className="size-10 text-white fill-white drop-shadow-2xl" />
              </div>
           </div>
        </div>

        <div className="md:col-span-9 space-y-6">
           <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1">
                 <h3 className="text-xl font-bold font-headline leading-tight">{song.title}</h3>
                 <p className="text-[10px] font-bold uppercase text-muted-foreground/60 tracking-widest">
                   {song.duration}s · {song.mode || 'AI'} Render
                 </p>
              </div>
              <div className="flex gap-2">
                 <Button asChild size="sm" variant="outline" className="h-10 rounded-xl gap-2 font-bold text-[10px] uppercase border-primary/5 hover:bg-secondary/50">
                    <a href={song.audio} target="_blank" rel="noopener noreferrer">
                       <Download className="size-3.5" /> Save
                    </a>
                 </Button>
                 {isHistory && (
                   <Button variant="ghost" size="icon" onClick={() => handleDelete(song.songId)} className="h-10 w-10 rounded-xl text-destructive/40 hover:text-destructive hover:bg-destructive/5">
                      <Trash2 className="size-4" />
                   </Button>
                 )}
              </div>
           </div>

           <div className="space-y-3">
              <audio controls className="w-full h-10 rounded-xl [&::-webkit-media-controls-panel]:bg-secondary/50">
                 <source src={song.audio} type="audio/mpeg" />
              </audio>
              
              {song.tags && (
                <div className="flex flex-wrap gap-1.5">
                   {song.tags.split(',').map((tag: string, idx: number) => (
                     <span key={idx} className="text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 bg-background/50 rounded-lg text-muted-foreground/60">
                       {tag.trim()}
                     </span>
                   ))}
                </div>
              )}
           </div>

           {song.lyrics && (
             <div className="p-4 rounded-2xl bg-background/40 border border-primary/5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-2">Lyrics Snippet</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3 italic whitespace-pre-wrap">
                   {song.lyrics}
                </p>
             </div>
           )}
        </div>
      </div>
    </div>
  );

  return (
    <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md overflow-hidden rounded-[2.5rem]">
      <CardHeader className="p-8 sm:p-10 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-600 rounded-xl">
              <Music className="size-6" />
            </div>
            <div>
              <CardTitle className="font-headline text-2xl">AI Music Generator</CardTitle>
              <CardDescription>Compose high-fidelity songs with custom lyrics and styles.</CardDescription>
            </div>
          </div>

          <div className={cn(
            "flex items-center gap-3 px-6 py-3 rounded-2xl border border-primary/5",
            role === 'sultan' ? "bg-yellow-500/5 text-yellow-600" : role === 'pro' ? "bg-indigo-500/5 text-indigo-600" : "bg-secondary/30"
          )}>
             <div className="p-2 bg-white/20 rounded-lg">
                <Zap className="size-4" />
             </div>
             <div className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Weekly Credits ({role})</p>
                <p className="text-sm font-bold font-headline">{remainingCredits} generations left</p>
             </div>
             {role === 'free' && (
               <Button variant="link" asChild className="h-auto p-0 ml-4 text-[10px] font-bold uppercase text-indigo-600">
                  <a href="/pricing">Upgrade</a>
               </Button>
             )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-8 sm:p-10 pt-0 space-y-8">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="bg-secondary/20 p-1.5 h-12 rounded-full border border-primary/5 w-full grid grid-cols-3 max-w-[450px] mb-8 overflow-x-auto">
            <TabsTrigger value="simple" className="rounded-full gap-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">
              <Sparkles className="size-3" /> Simple Vibe
            </TabsTrigger>
            <TabsTrigger value="custom" className="rounded-full gap-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">
              <Mic2 className="size-3" /> Custom Lyrics
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-full gap-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">
              <History className="size-3" /> My Tracks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="simple" className="mt-0 space-y-8 animate-fade-in-up">
            <div className="space-y-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">Describe your sound</label>
                 <Input 
                   value={prompt}
                   onChange={(e) => setPrompt(e.target.value)}
                   placeholder="e.g., A futuristic synthwave track with heavy bass for a nighttime drive..." 
                   className="h-14 rounded-2xl bg-secondary/30 border-primary/5 focus-visible:ring-indigo-500/20"
                 />
               </div>

               <div className="space-y-4 p-6 rounded-[2.5rem] bg-secondary/20 border border-primary/5">
                 <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 flex items-center gap-2 mb-2">
                   <Radio className="size-3 text-indigo-600" /> Musical Palette
                 </h4>
                 <div className="flex flex-wrap gap-2">
                    {Object.values(STYLES).flat().map((style) => (
                      <button
                        key={style}
                        onClick={() => handleToggleStyle(style)}
                        className={cn(
                          "text-[9px] px-3 py-1.5 rounded-full font-bold uppercase tracking-widest transition-all",
                          selectedStyles.includes(style) 
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                            : "bg-background/50 text-muted-foreground border border-primary/5 hover:border-indigo-500/20"
                        )}
                      >
                        {style}
                      </button>
                    ))}
                 </div>
               </div>

               <Button 
                disabled={loading || !prompt.trim() || remainingCredits <= 0}
                onClick={handleGenerate}
                className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xl shadow-indigo-500/10 transition-all active:scale-95"
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="size-5 animate-spin" />
                    <span>Submitting to Composer...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Plus className="size-5" />
                    <span>Generate Track</span>
                  </div>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="custom" className="mt-0 space-y-8 animate-fade-in-up">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">Song Title</label>
                    <Input 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="My Masterpiece" 
                      className="h-14 rounded-2xl bg-secondary/30 border-primary/5 focus-visible:ring-indigo-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">Base Style Prompt</label>
                    <Input 
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g., Pop melody with acoustic guitar" 
                      className="h-14 rounded-2xl bg-secondary/30 border-primary/5 focus-visible:ring-indigo-500/20"
                    />
                  </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">Lyrics (AI can generate them if empty)</label>
                <Textarea 
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  placeholder="[Verse 1]..." 
                  className="min-h-[120px] rounded-[1.5rem] bg-secondary/30 border-primary/5 focus-visible:ring-indigo-500/20"
                />
              </div>

              <div className="space-y-4 p-6 rounded-[2.5rem] bg-secondary/20 border border-primary/5">
                 <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 flex items-center gap-2 mb-2">
                   <Radio className="size-3 text-indigo-600" /> Musical Palette
                 </h4>
                 <div className="flex flex-wrap gap-2">
                    {Object.values(STYLES).flat().map((style) => (
                      <button
                        key={style}
                        onClick={() => handleToggleStyle(style)}
                        className={cn(
                          "text-[9px] px-3 py-1.5 rounded-full font-bold uppercase tracking-widest transition-all",
                          selectedStyles.includes(style) 
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                            : "bg-background/50 text-muted-foreground border border-primary/5 hover:border-indigo-500/20"
                        )}
                      >
                        {style}
                      </button>
                    ))}
                 </div>
               </div>

              <Button 
                disabled={loading || !title.trim() || remainingCredits <= 0}
                onClick={handleGenerate}
                className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xl shadow-indigo-500/10 transition-all active:scale-95"
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="size-5 animate-spin" />
                    <span>Submitting to Composer...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Plus className="size-5" />
                    <span>Generate Track</span>
                  </div>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-0 space-y-6 animate-fade-in-up">
             {historyLoading ? (
               <div className="flex flex-col items-center justify-center py-20 space-y-4">
                 <Loader2 className="size-10 animate-spin text-indigo-500/20" />
                 <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Synchronizing Track Library...</p>
               </div>
             ) : !user ? (
               <div className="p-12 text-center bg-secondary/10 rounded-[2.5rem] border border-dashed border-primary/5 space-y-4">
                  <Info className="size-10 text-muted-foreground/20 mx-auto" />
                  <p className="text-sm text-muted-foreground font-medium">History requires an active account session.</p>
               </div>
             ) : history && history.length > 0 ? (
               <div className="grid grid-cols-1 gap-6">
                 {history.map((record) => renderTrackCard(record, true))}
               </div>
             ) : (
               <div className="p-12 text-center bg-secondary/10 rounded-[2.5rem] border border-dashed border-primary/5 space-y-4">
                  <Music className="size-10 text-muted-foreground/20 mx-auto" />
                  <p className="text-sm text-muted-foreground font-medium italic">Your music library is currently empty.</p>
               </div>
             )}
          </TabsContent>
        </Tabs>

        {/* Active Jobs Display - Always show if jobs exist */}
        {jobs.length > 0 && (
          <div className="space-y-4 animate-fade-in-up border-t border-primary/5 pt-8">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 ml-1 flex items-center gap-2">
              <Loader2 className="size-3 animate-spin" /> Live Composer Sessions
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {jobs.map((job) => (
                <div key={job.id} className="p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                      <Music className="size-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold uppercase tracking-widest">Compiling Session {job.id.slice(0, 8)}</p>
                      <p className="text-[10px] text-indigo-600/60 font-bold uppercase">{job.status} — {job.percentage}%</p>
                    </div>
                  </div>
                  <div className="flex-1 max-w-[300px] h-1.5 bg-background/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 transition-all duration-500" 
                      style={{ width: `${job.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
