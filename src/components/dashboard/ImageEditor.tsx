"use client"

import React, { useState, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Upload, 
  Loader2, 
  Download, 
  Image as ImageIcon, 
  CheckCircle2, 
  Info,
  X,
  Zap,
  History,
  Trash2,
  Brush,
  ChevronRight
} from "lucide-react";
import Image from 'next/image';
import { editImageAI } from "@/app/actions/image-editor";
import { useToast } from "@/hooks/use-toast";
import { cn, getWIBDate } from "@/lib/utils";
import { useUser, useFirestore, useDoc, useCollection } from "@/firebase";
import { doc, setDoc, collection, query, orderBy, serverTimestamp, deleteDoc } from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { siteConfig, type TierId } from "@/config/site";

export function ImageEditor() {
  const { user } = useUser();
  const db = useFirestore();
  const userRef = useMemo(() => user ? doc(db, "users", user.uid) : null, [db, user]);
  const { data: profile } = useDoc(userRef);

  const [activeTab, setActiveTab] = useState<'editor' | 'history'>('editor');
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const role = (profile?.role as TierId) || 'free';
  const tierConfig = siteConfig.tiers[role];
  const limit = tierConfig.limits.remover; // Using same limit as remover for now
  const usage = profile?.editorUsage || { count: 0, lastReset: getWIBDate() };

  const isResetNeeded = usage.lastReset !== getWIBDate();
  const remainingCredits = Math.max(0, limit - (isResetNeeded ? 0 : (usage.count || 0)));

  const historyQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, "users", user.uid, "editor_history"), orderBy("timestamp", "desc"));
  }, [db, user]);

  const { data: historyItems, loading: historyLoading } = useCollection(historyQuery);

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

  const saveToHistory = async (resData: string) => {
    if (!user || !db) return;
    const id = `edit_${Date.now()}`;
    const ref = doc(db, "users", user.uid, "editor_history", id);
    const data = {
      id,
      prompt,
      resultUrl: resData,
      timestamp: serverTimestamp()
    };

    setDoc(ref, data).catch(e => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: ref.path,
        operation: 'write',
        requestResourceData: data
      }));
    });
  };

  const handleProcess = async () => {
    if (!user) {
      toast({ variant: "destructive", title: "Session required", description: "Please sign in to use AI tools." });
      return;
    }

    if (!file || !prompt.trim()) return;

    if (remainingCredits <= 0) {
      toast({ variant: "warning", title: "Daily Limit Reached", description: `You have used your daily allocation for the ${tierConfig.name} plan.` });
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setStatus("Handshaking with DeepAI Engine...");

    try {
      setTimeout(() => setStatus("Synthesizing neural layers..."), 3000);
      
      const res = await editImageAI({ file, prompt });

      if (!res.status) throw new Error(res.error);

      if (userRef) {
        const todayWIB = getWIBDate();
        const newCount = isResetNeeded ? 1 : (usage.count || 0) + 1;
        setDoc(userRef, {
          editorUsage: { count: newCount, lastReset: todayWIB }
        }, { merge: true });
      }

      setResult(res.data || null);
      if (res.data) await saveToHistory(res.data);

      toast({ title: "Image Transformed", description: "Your creative vision has been rendered." });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setStatus("");
    }
  };

  const handleDeleteHistory = async (id: string) => {
    if (!user || !db) return;
    await deleteDoc(doc(db, "users", user.uid, "editor_history", id));
    toast({ title: "Record removed" });
  };

  const clear = () => {
    setFile(null);
    setPrompt("");
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md overflow-hidden rounded-[2.5rem]">
      <CardHeader className="p-8 sm:p-10 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-600 rounded-xl">
              <Brush className="size-6" />
            </div>
            <div>
              <CardTitle className="font-headline text-2xl">AI Image Editor</CardTitle>
              <CardDescription>DeepAI-powered creative transformations via natural language.</CardDescription>
            </div>
          </div>

          <div className={cn(
            "flex items-center gap-3 px-6 py-3 rounded-2xl border border-primary/5",
            role === 'sultan' ? "bg-yellow-500/5 text-yellow-600" : "bg-secondary/30"
          )}>
             <div className="p-2 bg-white/20 rounded-lg">
                <Zap className="size-4" />
             </div>
             <div className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Daily Quota</p>
                <p className="text-sm font-bold font-headline">{remainingCredits} transformations left</p>
             </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-8 sm:p-10 pt-0 space-y-8">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
           <TabsList className="bg-secondary/20 p-1 rounded-full border border-primary/5 mb-8 grid grid-cols-2 max-w-[300px]">
             <TabsTrigger value="editor" className="rounded-full gap-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">
               <Sparkles className="size-3" /> Editor
             </TabsTrigger>
             <TabsTrigger value="history" className="rounded-full gap-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">
               <History className="size-3" /> History
             </TabsTrigger>
           </TabsList>

           <TabsContent value="editor" className="space-y-8 mt-0 animate-fade-in-up">
              {!result ? (
                <div className="space-y-6">
                  <div 
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className={cn(
                      "group relative border-2 border-dashed rounded-[2rem] p-12 flex flex-col items-center justify-center transition-all duration-300",
                      file ? "border-indigo-500/50 bg-indigo-500/5" : "border-primary/5 bg-secondary/10 hover:border-indigo-500/20"
                    )}
                  >
                    {file ? (
                      <div className="text-center space-y-4">
                        <div className="p-4 bg-indigo-500/10 rounded-2xl mx-auto w-fit">
                          <ImageIcon className="size-10 text-indigo-600" />
                        </div>
                        <p className="font-bold text-sm truncate max-w-[200px]">{file.name}</p>
                      </div>
                    ) : (
                      <div className="text-center space-y-4">
                        <Upload className="size-8 text-muted-foreground mx-auto" />
                        <p className="font-bold text-sm">Drop source image</p>
                        <Button variant="link" onClick={() => fileInputRef.current?.click()} className="text-indigo-600 font-bold text-xs uppercase">Browse Files</Button>
                      </div>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">Transformation Prompt</label>
                    <Input 
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g., 'Add a sunset', 'Turn into an oil painting', 'Make it cinematic'..." 
                      className="h-14 px-6 rounded-2xl bg-secondary/30 border-primary/5 focus-visible:ring-indigo-500/20"
                    />
                  </div>

                  <Button 
                    disabled={!file || !prompt.trim() || loading || remainingCredits <= 0}
                    onClick={handleProcess}
                    className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xl shadow-indigo-500/10 transition-all"
                  >
                    {loading ? <><Loader2 className="size-5 animate-spin mr-2" /> {status}</> : <><Sparkles className="size-5 mr-2" /> Transform Image</>}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6 animate-fade-in-up">
                  <div className="relative w-full aspect-video bg-black/5 rounded-[2.5rem] overflow-hidden shadow-2xl border border-primary/5">
                    <Image src={result} alt="Edited result" fill className="object-contain" unoptimized />
                  </div>
                  <div className="flex gap-3 justify-center">
                    <Button onClick={clear} variant="outline" className="h-12 rounded-xl px-8 font-bold uppercase text-[10px] tracking-widest">Reset Editor</Button>
                    <Button asChild className="h-12 rounded-xl px-8 bg-indigo-600 text-white font-bold uppercase text-[10px] tracking-widest shadow-xl">
                       <a href={result} download="nx-edit.png"><Download className="size-4 mr-2" /> Download</a>
                    </Button>
                  </div>
                </div>
              )}
           </TabsContent>

           <TabsContent value="history" className="mt-0 animate-fade-in-up">
              {historyLoading ? (
                 <div className="flex justify-center py-20"><Loader2 className="size-10 animate-spin text-indigo-500/20" /></div>
              ) : !historyItems?.length ? (
                <div className="py-20 text-center space-y-4 bg-secondary/10 rounded-[2.5rem] border-2 border-dashed border-primary/5">
                   <ImageIcon className="size-12 text-muted-foreground/20 mx-auto" />
                   <p className="text-sm text-muted-foreground italic">No transformation history found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {historyItems.map((item: any) => (
                    <div key={item.id} className="p-4 rounded-3xl bg-secondary/20 border border-primary/5 hover:border-indigo-500/20 transition-all">
                       <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/5 mb-4">
                          <Image src={item.resultUrl} alt="History Result" fill className="object-contain" unoptimized />
                       </div>
                       <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                             <p className="text-[10px] font-bold text-muted-foreground uppercase truncate max-w-[120px]">{item.prompt}</p>
                             <p className="text-[8px] text-muted-foreground/40 font-mono">{item.timestamp?.toDate().toLocaleString() || 'just now'}</p>
                          </div>
                          <div className="flex gap-1">
                             <Button size="icon" variant="ghost" asChild className="size-8 rounded-lg">
                                <a href={item.resultUrl} download="nx-edit.png"><Download className="size-3.5" /></a>
                             </Button>
                             <Button size="icon" variant="ghost" onClick={() => handleDeleteHistory(item.id)} className="size-8 rounded-lg text-destructive/40 hover:text-destructive">
                                <Trash2 className="size-3.5" />
                             </Button>
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
              )}
           </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
