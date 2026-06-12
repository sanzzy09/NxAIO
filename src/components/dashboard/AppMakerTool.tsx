
"use client"

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Smartphone, 
  Globe, 
  Mail, 
  Loader2, 
  Download, 
  CheckCircle2, 
  Info,
  ShieldCheck,
  Zap,
  Trash2,
  Box,
  Palette,
  History,
  Terminal,
  ChevronRight,
  ExternalLink,
  Plus,
  UploadCloud
} from "lucide-react";
import { initiateAppBuild, checkBuildStatus, getAppDownloadLinks } from "@/app/actions/appmaker";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import Image from 'next/image';
import { useUser, useFirestore, useCollection } from "@/firebase";
import { doc, setDoc, collection, query, orderBy, serverTimestamp, deleteDoc } from "firebase/firestore";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const LOG_MESSAGES = [
  "Provisioning cloud build node...",
  "Injecting branding assets...",
  "Synchronizing Gradle dependencies...",
  "Synthesizing Android Manifest...",
  "Executing DEX compilation layers...",
  "Signing APK with private keystore...",
  "Validating bundle integrity...",
  "Finalizing distribution links..."
];

export function AppMakerTool() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'studio' | 'history'>('studio');
  const [formData, setFormData] = useState({
    url: "",
    email: "",
    appName: "",
    toolbarColor: "#2563eb",
    toolbarTitleColor: "#ffffff",
    enableToolbar: true
  });
  
  const [icon, setFileIcon] = useState<File | null>(null);
  const [splash, setFileSplash] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [activeAppId, setActiveAppId] = useState<string | null>(null);
  const [logIndex, setLogIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const iconInputRef = useRef<HTMLInputElement>(null);
  const splashInputRef = useRef<HTMLInputElement>(null);

  // Fetch History from Firestore
  const historyQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "users", user.uid, "app_builds"),
      orderBy("timestamp", "desc")
    );
  }, [db, user]);

  const { data: builds, loading: historyLoading } = useCollection(historyQuery);

  // Auto-detect pending builds on load
  useEffect(() => {
    if (builds && builds.length > 0 && !activeAppId && !loading) {
      const pending = builds.find(b => b.status === 'building' || b.status === 'pending');
      if (pending) {
        setActiveAppId(pending.appId);
        setLoading(true);
        setStatus(`Resuming: ${pending.appName} compilation...`);
        setActiveTab('studio');
      }
    }
  }, [builds, activeAppId, loading]);

  // Log Simulator Effect
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLogIndex(prev => (prev + 1) % LOG_MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [loading]);

  const handleBuild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!icon || !splash) {
      toast({ variant: "destructive", title: "Assets missing", description: "Please upload both an app icon and a splash screen." });
      return;
    }

    setLoading(true);
    setError(null);
    setStatus("Initiating cloud build sequence...");

    try {
      const res = await initiateAppBuild({
        ...formData,
        icon,
        splash
      });

      if (!res.status) throw new Error(res.error);
      
      const newAppId = res.data.appId;
      setActiveAppId(newAppId);

      // Save initial record to Firestore
      const buildRef = doc(db, "users", user.uid, "app_builds", newAppId);
      await setDoc(buildRef, {
        appId: newAppId,
        appName: formData.appName,
        url: formData.url,
        status: 'building',
        timestamp: serverTimestamp(),
      });

      toast({ title: "Build Started", description: "Nexus is now compiling your APK in the background." });
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Polling Effect for Active Build
  useEffect(() => {
    if (!activeAppId || !user) return;

    const interval = setInterval(async () => {
      const res = await checkBuildStatus(activeAppId);
      if (res.status) {
        const buildStatus = res.data?.status;
        
        if (buildStatus === 'success') {
          clearInterval(interval);
          const downloadRes = await getAppDownloadLinks(activeAppId);
          if (downloadRes.status) {
            // Update Firestore with final result
            const buildRef = doc(db, "users", user.uid, "app_builds", activeAppId);
            await setDoc(buildRef, {
              status: 'success',
              result: downloadRes.data,
              completedAt: serverTimestamp()
            }, { merge: true });

            setLoading(false);
            setActiveAppId(null);
            setActiveTab('history');
            toast({ title: "Build Success", description: `"${formData.appName}" is ready for distribution.` });
          }
        } else if (buildStatus === 'failed') {
          clearInterval(interval);
          const buildRef = doc(db, "users", user.uid, "app_builds", activeAppId);
          await setDoc(buildRef, { status: 'failed' }, { merge: true });
          setError("Cloud build failed. Please verify your URL and branding assets.");
          setLoading(false);
          setActiveAppId(null);
        }
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [activeAppId, user, toast, formData.appName]);

  const handleDeleteBuild = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "app_builds", id));
    toast({ title: "Build Purged", description: "Record removed from history." });
  };

  const clearStudio = () => {
    setFormData({
      url: "",
      email: user?.email || "",
      appName: "",
      toolbarColor: "#2563eb",
      toolbarTitleColor: "#ffffff",
      enableToolbar: true
    });
    setFileIcon(null);
    setFileSplash(null);
    setError(null);
    setLoading(false);
    setActiveAppId(null);
  };

  return (
    <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md overflow-hidden rounded-[2.5rem]">
      <CardHeader className="p-8 sm:p-10 pb-6 border-b border-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/10 text-blue-600 rounded-2xl shadow-inner">
              <Smartphone className="size-6" />
            </div>
            <div>
              <CardTitle className="font-headline text-2xl tracking-tight">App Maker Studio</CardTitle>
              <CardDescription>Convert website logic into production-grade Android binaries.</CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={clearStudio} className="rounded-full hover:bg-destructive/5 hover:text-destructive">
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
           <div className="px-8 sm:p-10 py-6 border-b border-primary/5">
              <TabsList className="bg-secondary/30 p-1 rounded-full border border-primary/5 max-w-[300px] grid grid-cols-2">
                <TabsTrigger value="studio" className="rounded-full gap-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
                  <Zap className="size-3" /> Studio
                </TabsTrigger>
                <TabsTrigger value="history" className="rounded-full gap-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
                  <History className="size-3" /> Builds
                </TabsTrigger>
              </TabsList>
           </div>

           <TabsContent value="studio" className="p-8 sm:p-10 pt-8 mt-0 space-y-10 animate-fade-in-up">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-10">
                   <div className="relative size-32">
                      <div className="absolute inset-0 rounded-full border-4 border-blue-500/10" />
                      <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                         <Smartphone className="size-10 text-blue-600 animate-pulse" />
                      </div>
                   </div>
                   
                   <div className="text-center space-y-3">
                      <h3 className="text-2xl font-bold font-headline">Compiling Binary Hub</h3>
                      <p className="text-sm text-muted-foreground font-medium animate-pulse">{status}</p>
                   </div>

                   <div className="w-full max-w-lg space-y-4">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 px-2">
                         <span>Orchestration Progress</span>
                         <span>Estimated 2-5m</span>
                      </div>
                      <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden border border-primary/5">
                         <div className="h-full bg-blue-600 w-2/3 animate-shimmer" />
                      </div>
                      
                      <div className="p-6 rounded-[2rem] bg-secondary/20 border border-primary/5 space-y-3 shadow-inner">
                         <div className="flex items-center gap-2 text-blue-600">
                            <Terminal className="size-3" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Build Node Logic</span>
                         </div>
                         <p className="text-[11px] font-mono text-muted-foreground/60 leading-relaxed italic">
                           > {LOG_MESSAGES[logIndex]}
                         </p>
                      </div>
                   </div>

                   <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-[0.2em]">
                     You can leave this page. We'll finalize the build in the background.
                   </p>
                </div>
              ) : (
                <form onSubmit={handleBuild} className="space-y-10">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">Logic Source URL</label>
                        <div className="relative group">
                          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground opacity-40 group-focus-within:text-blue-600 transition-colors" />
                          <Input 
                            required
                            type="url"
                            value={formData.url}
                            onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                            placeholder="https://your-site.com" 
                            className="h-14 pl-12 rounded-2xl bg-secondary/30 border-primary/5 focus-visible:ring-blue-500/20 shadow-inner"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">Application Name</label>
                        <div className="relative group">
                          <Box className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground opacity-40 group-focus-within:text-blue-600 transition-colors" />
                          <Input 
                            required
                            value={formData.appName}
                            onChange={(e) => setFormData(prev => ({ ...prev, appName: e.target.value }))}
                            placeholder="e.g., NxAIO Mobile" 
                            className="h-14 pl-12 rounded-2xl bg-secondary/30 border-primary/5 focus-visible:ring-blue-500/20 shadow-inner"
                          />
                        </div>
                      </div>

                      <div className="p-6 rounded-[2.5rem] bg-secondary/20 border border-primary/5 space-y-6">
                        <div className="flex items-center justify-between">
                           <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 flex items-center gap-2">
                             <Palette className="size-3" /> Branding Protocol
                           </h4>
                           <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-muted-foreground/40 uppercase">Toolbar</span>
                              <Switch 
                                checked={formData.enableToolbar} 
                                onCheckedChange={(v) => setFormData(prev => ({ ...prev, enableToolbar: v }))} 
                              />
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 ml-1">Chrome Color</span>
                              <div className="flex gap-2">
                                <div className="size-10 rounded-lg border border-primary/10 shrink-0 shadow-sm" style={{ backgroundColor: formData.toolbarColor }} />
                                <Input 
                                  type="text"
                                  value={formData.toolbarColor}
                                  onChange={(e) => setFormData(prev => ({ ...prev, toolbarColor: e.target.value }))}
                                  className="h-10 rounded-lg bg-background text-[10px] font-mono border-primary/5"
                                />
                              </div>
                           </div>
                           <div className="space-y-2">
                              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 ml-1">Title Color</span>
                              <div className="flex gap-2">
                                <div className="size-10 rounded-lg border border-primary/10 shrink-0 shadow-sm" style={{ backgroundColor: formData.toolbarTitleColor }} />
                                <Input 
                                  type="text"
                                  value={formData.toolbarTitleColor}
                                  onChange={(e) => setFormData(prev => ({ ...prev, toolbarTitleColor: e.target.value }))}
                                  className="h-10 rounded-lg bg-background text-[10px] font-mono border-primary/5"
                                />
                              </div>
                           </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8">
                       <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-3">
                             <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 ml-2">Identity Icon</span>
                             <button 
                                type="button"
                                onClick={() => iconInputRef.current?.click()}
                                className={cn(
                                  "relative aspect-square rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all group",
                                  icon ? "border-blue-500/40 bg-blue-500/5 shadow-inner" : "border-primary/5 bg-secondary/10 hover:border-blue-500/20"
                                )}
                              >
                                {icon ? (
                                   <Image src={URL.createObjectURL(icon)} alt="Icon" fill className="object-cover rounded-[2rem] p-2" />
                                ) : (
                                  <>
                                    <UploadCloud className="size-8 text-muted-foreground/40 group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Select JPG/PNG</span>
                                  </>
                                )}
                                <input type="file" ref={iconInputRef} onChange={(e) => setFileIcon(e.target.files?.[0] || null)} className="hidden" accept="image/*" />
                             </button>
                          </div>

                          <div className="space-y-3">
                             <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 ml-2">Splash Screen</span>
                             <button 
                                type="button"
                                onClick={() => splashInputRef.current?.click()}
                                className={cn(
                                  "relative aspect-square rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all group",
                                  splash ? "border-blue-500/40 bg-blue-500/5 shadow-inner" : "border-primary/5 bg-secondary/10 hover:border-blue-500/20"
                                )}
                              >
                                {splash ? (
                                   <Image src={URL.createObjectURL(splash)} alt="Splash" fill className="object-cover rounded-[2rem] p-2" />
                                ) : (
                                  <>
                                    <UploadCloud className="size-8 text-muted-foreground/40 group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Select JPG/PNG</span>
                                  </>
                                )}
                                <input type="file" ref={splashInputRef} onChange={(e) => setFileSplash(e.target.files?.[0] || null)} className="hidden" accept="image/*" />
                             </button>
                          </div>
                       </div>

                       <div className="space-y-4">
                          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">Distribution Contact</label>
                          <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground opacity-40 group-focus-within:text-blue-600 transition-colors" />
                            <Input 
                              required
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                              placeholder="you@example.com" 
                              className="h-14 pl-12 rounded-2xl bg-secondary/30 border-primary/5 focus-visible:ring-blue-500/20 shadow-inner"
                            />
                          </div>
                       </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading || !formData.url || !formData.appName} 
                    className="w-full h-16 rounded-[2rem] bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-2xl shadow-blue-500/20 transition-all active:scale-95"
                  >
                    {loading ? <><Loader2 className="w-6 h-6 animate-spin mr-3" /> Initializing Handshake...</> : <><Zap className="w-6 h-6 mr-3" /> Compile Android Application</>}
                  </Button>
                </form>
              )}
           </TabsContent>

           <TabsContent value="history" className="mt-0 p-8 sm:p-10 pt-8 animate-fade-in-up space-y-8">
              {historyLoading ? (
                 <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="size-10 animate-spin text-blue-600/20" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Syncing Build Vault...</p>
                 </div>
              ) : !builds?.length ? (
                 <div className="flex flex-col items-center justify-center py-24 bg-secondary/20 rounded-[3rem] border-2 border-dashed border-primary/5 space-y-6">
                    <div className="size-16 rounded-full bg-background flex items-center justify-center border border-primary/5 shadow-sm text-muted-foreground/20">
                       <History className="size-8" />
                    </div>
                    <p className="text-sm font-bold font-headline text-muted-foreground/60">No build history detected in your cloud logic.</p>
                    <Button variant="outline" onClick={() => setActiveTab('studio')} className="rounded-full font-bold uppercase text-[10px] tracking-widest px-8">Start First Build</Button>
                 </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                   {builds.map((build: any) => (
                     <div key={build.id} className="group relative p-8 rounded-[3rem] bg-secondary/30 border border-primary/5 hover:border-blue-600/20 transition-all shadow-sm">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                           <div className="flex items-center gap-6">
                              <div className="size-16 rounded-2xl bg-background border border-primary/5 flex items-center justify-center shadow-inner shrink-0 group-hover:scale-105 transition-transform overflow-hidden relative">
                                 {build.result?.appIcon ? (
                                   <Image src={build.result.appIcon} alt="App" fill className="object-cover" unoptimized />
                                 ) : (
                                   <Smartphone className="size-8 text-blue-600/20" />
                                 )}
                              </div>
                              <div className="space-y-1">
                                 <h4 className="text-xl font-bold font-headline tracking-tight">{build.appName}</h4>
                                 <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                                    <span className="flex items-center gap-1.5"><Globe className="size-3" /> {new URL(build.url).hostname}</span>
                                    <span>•</span>
                                    <span>{new Date(build.timestamp?.toDate()).toLocaleDateString()}</span>
                                 </div>
                              </div>
                           </div>

                           <div className="flex items-center gap-4">
                              {build.status === 'building' ? (
                                <Badge className="bg-blue-600/10 text-blue-600 border-none px-4 py-1.5 rounded-full text-[10px] font-bold gap-2">
                                   <Loader2 className="size-3 animate-spin" /> In Progress
                                </Badge>
                              ) : build.status === 'success' ? (
                                <div className="flex gap-2">
                                   <Button asChild size="sm" className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 shadow-xl shadow-blue-500/10">
                                      <a href={build.result.downloadUrl} target="_blank" rel="noopener noreferrer">
                                        <Download className="size-3.5" /> APK
                                      </a>
                                   </Button>
                                   <Button asChild variant="outline" size="sm" className="h-10 px-4 rounded-xl border-primary/5 bg-background font-bold gap-2">
                                      <a href={build.result.aabFile} target="_blank" rel="noopener noreferrer">
                                        <Box className="size-3.5" /> AAB
                                      </a>
                                   </Button>
                                </div>
                              ) : (
                                <Badge variant="destructive" className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase">Compilation Failed</Badge>
                              )}
                              
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteBuild(build.id)} className="size-10 rounded-xl text-destructive/40 hover:text-destructive hover:bg-destructive/5">
                                 <Trash2 className="size-4" />
                              </Button>
                           </div>
                        </div>

                        {build.status === 'success' && (
                           <div className="mt-8 pt-8 border-t border-primary/5 grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="space-y-1">
                                 <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Package Identity</p>
                                 <p className="text-[11px] font-mono font-bold text-blue-600/60 truncate">{build.result.packageName}</p>
                              </div>
                              <div className="space-y-1">
                                 <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Keystore Vault</p>
                                 <p className="text-[11px] font-bold font-headline text-emerald-600 flex items-center gap-1.5"><ShieldCheck className="size-3" /> Signed (AES-256)</p>
                              </div>
                              <div className="flex justify-end items-end">
                                 <Button variant="link" size="sm" className="h-auto p-0 text-blue-600 font-bold text-[10px] uppercase tracking-widest gap-2" asChild>
                                    <a href={build.result.keyFile} target="_blank" rel="noopener noreferrer">
                                       <ExternalLink className="size-3" /> Get Keys
                                    </a>
                                 </Button>
                              </div>
                           </div>
                        )}
                     </div>
                   ))}
                </div>
              )}
           </TabsContent>
        </Tabs>

        {error && (
          <div className="p-8 pt-0 animate-fade-in-up">
            <div className="p-6 rounded-[2.5rem] bg-destructive/5 border border-destructive/10 flex items-start gap-4">
              <div className="p-2 bg-destructive/10 rounded-xl">
                 <AlertCircle className="size-5 text-destructive" />
              </div>
              <div className="space-y-1">
                 <p className="text-sm font-bold text-destructive font-headline">Build Pipeline Interrupted</p>
                 <p className="text-xs text-destructive/80 font-medium leading-relaxed">{error}</p>
                 <Button variant="link" onClick={clearStudio} className="p-0 h-auto text-destructive font-bold text-[10px] uppercase mt-2">Re-initialize Environment</Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
