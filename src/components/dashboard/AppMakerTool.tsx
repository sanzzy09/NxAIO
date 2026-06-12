"use client"

import React, { useState, useRef, useEffect } from 'react';
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
  Settings2,
  FileCode,
  Key,
  ExternalLink,
  Plus,
  UploadCloud,
  Box,
  Palette
} from "lucide-react";
import { initiateAppBuild, checkBuildStatus, getAppDownloadLinks } from "@/app/actions/appmaker";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import Image from 'next/image';

export function AppMakerTool() {
  const [formData, setFormData] = useState({
    url: "",
    email: "",
    appName: "",
    toolbarColor: "#2563eb",
    toolbarTitleColor: "#ffffff",
    enableToolbar: true
  });
  
  const [icon, setIcon] = useState<File | null>(null);
  const [splash, setSplash] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [appId, setAppId] = useState<string | null>(null);
  const [buildResult, setBuildResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const iconInputRef = useRef<HTMLInputElement>(null);
  const splashInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleBuild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!icon || !splash) {
      toast({ variant: "destructive", title: "Assets missing", description: "Please upload both an app icon and a splash screen." });
      return;
    }

    setLoading(true);
    setError(null);
    setBuildResult(null);
    setStatus("Initiating cloud build environment...");

    try {
      const res = await initiateAppBuild({
        ...formData,
        icon,
        splash
      });

      if (!res.status) throw new Error(res.error);
      
      setAppId(res.data.appId);
      setStatus("Compiler active. Waiting for asset synchronization...");
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Polling Effect
  useEffect(() => {
    if (!appId || buildResult) return;

    const interval = setInterval(async () => {
      const res = await checkBuildStatus(appId);
      if (res.status) {
        const buildStatus = res.data?.status;
        setStatus(`Building: ${buildStatus.toUpperCase()}...`);
        
        if (buildStatus === 'success') {
          clearInterval(interval);
          const downloadRes = await getAppDownloadLinks(appId);
          if (downloadRes.status) {
            setBuildResult(downloadRes.data);
            setLoading(false);
            setAppId(null);
            toast({ title: "Build Complete", description: "Your Android application is ready for download." });
          }
        } else if (buildStatus === 'failed') {
          clearInterval(interval);
          setError("The build server encountered an internal error. Please check your URL and try again.");
          setLoading(false);
          setAppId(null);
        }
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [appId, buildResult, toast]);

  const clear = () => {
    setFormData({
      url: "",
      email: "",
      appName: "",
      toolbarColor: "#2563eb",
      toolbarTitleColor: "#ffffff",
      enableToolbar: true
    });
    setIcon(null);
    setSplash(null);
    setBuildResult(null);
    setError(null);
    setAppId(null);
  };

  return (
    <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md overflow-hidden rounded-[2.5rem]">
      <CardHeader className="p-8 sm:p-10 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/10 text-blue-600 rounded-xl">
              <Smartphone className="size-6" />
            </div>
            <div>
              <CardTitle className="font-headline text-2xl">App Maker Studio</CardTitle>
              <CardDescription>Convert any website URL into a native Android APK.</CardDescription>
            </div>
          </div>
          {(appId || buildResult || formData.url) && (
            <Button variant="ghost" size="icon" onClick={clear} className="rounded-full hover:bg-destructive/5 hover:text-destructive">
              <Trash2 className="size-5" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-8 sm:p-10 pt-0 space-y-10">
        {!buildResult && !appId && (
          <form onSubmit={handleBuild} className="space-y-8 animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">Website URL</label>
                  <div className="relative group">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground opacity-40 group-focus-within:text-blue-600 transition-colors" />
                    <Input 
                      required
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="https://your-site.com" 
                      className="h-14 pl-12 rounded-2xl bg-secondary/30 border-primary/5 focus-visible:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">App Name</label>
                  <div className="relative group">
                    <Box className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground opacity-40 group-focus-within:text-blue-600 transition-colors" />
                    <Input 
                      required
                      value={formData.appName}
                      onChange={(e) => setFormData(prev => ({ ...prev, appName: e.target.value }))}
                      placeholder="My Great App" 
                      className="h-14 pl-12 rounded-2xl bg-secondary/30 border-primary/5 focus-visible:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">Build Notifications Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground opacity-40 group-focus-within:text-blue-600 transition-colors" />
                    <Input 
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="you@example.com" 
                      className="h-14 pl-12 rounded-2xl bg-secondary/30 border-primary/5 focus-visible:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                 <div className="p-6 rounded-[2rem] bg-secondary/20 border border-primary/5 space-y-6">
                    <div className="flex items-center justify-between">
                       <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 flex items-center gap-2">
                         <Palette className="size-3" /> UI Configuration
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
                          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 ml-1">Toolbar Color</span>
                          <div className="flex gap-2">
                            <div className="size-10 rounded-lg border border-primary/10 shrink-0" style={{ backgroundColor: formData.toolbarColor }} />
                            <Input 
                              type="text"
                              value={formData.toolbarColor}
                              onChange={(e) => setFormData(prev => ({ ...prev, toolbarColor: e.target.value }))}
                              className="h-10 rounded-lg bg-background text-[10px] font-mono"
                            />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 ml-1">Title Color</span>
                          <div className="flex gap-2">
                            <div className="size-10 rounded-lg border border-primary/10 shrink-0" style={{ backgroundColor: formData.toolbarTitleColor }} />
                            <Input 
                              type="text"
                              value={formData.toolbarTitleColor}
                              onChange={(e) => setFormData(prev => ({ ...prev, toolbarTitleColor: e.target.value }))}
                              className="h-10 rounded-lg bg-background text-[10px] font-mono"
                            />
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <button 
                      type="button"
                      onClick={() => iconInputRef.current?.click()}
                      className={cn(
                        "relative h-32 rounded-[1.5rem] border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all",
                        icon ? "border-blue-500/40 bg-blue-500/5" : "border-primary/5 bg-secondary/10 hover:border-blue-500/20"
                      )}
                    >
                       <UploadCloud className={cn("size-6", icon ? "text-blue-600" : "text-muted-foreground/40")} />
                       <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{icon ? "Icon Loaded" : "App Icon"}</span>
                       <input type="file" ref={iconInputRef} onChange={(e) => setIcon(e.target.files?.[0] || null)} className="hidden" accept="image/*" />
                    </button>

                    <button 
                      type="button"
                      onClick={() => splashInputRef.current?.click()}
                      className={cn(
                        "relative h-32 rounded-[1.5rem] border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all",
                        splash ? "border-blue-500/40 bg-blue-500/5" : "border-primary/5 bg-secondary/10 hover:border-blue-500/20"
                      )}
                    >
                       <UploadCloud className={cn("size-6", splash ? "text-blue-600" : "text-muted-foreground/40")} />
                       <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{splash ? "Splash Loaded" : "Splash Screen"}</span>
                       <input type="file" ref={splashInputRef} onChange={(e) => setSplash(e.target.files?.[0] || null)} className="hidden" accept="image/*" />
                    </button>
                 </div>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading || !formData.url} 
              className="w-full h-16 rounded-[2rem] bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-2xl shadow-blue-500/20 transition-all active:scale-95"
            >
              {loading ? <><Loader2 className="w-6 h-6 animate-spin mr-3" /> Initializing Handshake...</> : <><Zap className="w-6 h-6 mr-3" /> Compile Android Application</>}
            </Button>
          </form>
        )}

        {appId && !buildResult && (
          <div className="flex flex-col items-center justify-center py-24 space-y-8 animate-fade-in-up">
            <div className="relative size-24">
               <div className="absolute inset-0 rounded-full border-4 border-blue-500/10" />
               <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <Smartphone className="size-8 text-blue-600" />
               </div>
            </div>
            <div className="text-center space-y-2">
               <h3 className="text-xl font-bold font-headline">Cloud Compiler Active</h3>
               <p className="text-sm text-muted-foreground animate-pulse">{status}</p>
            </div>
            <div className="w-full max-w-sm h-1.5 bg-secondary rounded-full overflow-hidden">
               <div className="h-full bg-blue-600 w-1/2 animate-shimmer" />
            </div>
          </div>
        )}

        {error && (
          <div className="p-6 rounded-[2rem] bg-destructive/5 border border-destructive/10 flex items-start gap-4 animate-fade-in-up">
            <Info className="size-6 text-destructive mt-0.5" />
            <div className="space-y-1">
               <p className="text-sm font-bold text-destructive">Build Protocol Failure</p>
               <p className="text-xs text-destructive/80 font-medium leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {buildResult && (
          <div className="space-y-8 animate-fade-in-up">
            <div className="p-10 rounded-[3rem] bg-secondary/30 border border-blue-500/10 space-y-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                   <div className="size-20 rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative">
                      <Image src={buildResult.appIcon || "https://picsum.photos/seed/app/200/200"} alt="App Icon" fill className="object-cover" unoptimized />
                   </div>
                   <div className="space-y-1">
                      <h3 className="text-3xl font-bold font-headline leading-tight">{buildResult.appName}</h3>
                      <p className="text-xs font-mono font-bold text-muted-foreground/60 uppercase tracking-widest">{buildResult.packageName}</p>
                   </div>
                </div>
                <Badge className="bg-emerald-600 text-white border-none px-6 py-2 rounded-full text-xs font-bold shadow-xl shadow-emerald-500/20">
                  <ShieldCheck className="size-4 mr-2" /> Compiled & Signed
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">Distribution Assets</h4>
                    <div className="space-y-3">
                       <Button asChild className="w-full h-16 rounded-[1.5rem] bg-blue-600 hover:bg-blue-700 text-white font-bold gap-3 shadow-xl">
                          <a href={buildResult.downloadUrl} target="_blank" rel="noopener noreferrer">
                             <Download className="size-5" /> Download APK (Direct)
                          </a>
                       </Button>
                       <Button asChild variant="outline" className="w-full h-14 rounded-[1.5rem] border-primary/5 bg-background font-bold gap-3 hover:bg-secondary/50">
                          <a href={buildResult.aabFile} target="_blank" rel="noopener noreferrer">
                             <Box className="size-5" /> Android App Bundle (.aab)
                          </a>
                       </Button>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">Signing Credentials</h4>
                    <div className="p-6 rounded-[2rem] bg-background/50 border border-primary/5 space-y-4 shadow-inner">
                       <div className="flex items-center justify-between py-2 border-b border-primary/5">
                          <span className="text-[10px] font-bold text-muted-foreground/60 uppercase">Store Pass</span>
                          <span className="text-xs font-mono font-bold">{buildResult.storePass}</span>
                       </div>
                       <div className="flex items-center justify-between py-2 border-b border-primary/5">
                          <span className="text-[10px] font-bold text-muted-foreground/60 uppercase">Key Pass</span>
                          <span className="text-xs font-mono font-bold">{buildResult.keyPass}</span>
                       </div>
                       <div className="space-y-1">
                          <span className="text-[10px] font-bold text-muted-foreground/60 uppercase">SHA Fingerprint</span>
                          <p className="text-[9px] font-mono break-all opacity-40">{buildResult.keySha}</p>
                       </div>
                       <Button asChild variant="link" className="h-auto p-0 text-blue-600 font-bold text-[10px] uppercase gap-2">
                          <a href={buildResult.keyFile} target="_blank" rel="noopener noreferrer">
                             <Key className="size-3" /> Download Keystore File
                          </a>
                       </Button>
                    </div>
                 </div>
              </div>

              <div className="pt-6 border-t border-primary/5 flex items-center gap-4">
                 <Info className="size-5 text-blue-500 opacity-40" />
                 <p className="text-[11px] text-muted-foreground leading-relaxed">
                   These assets will remain available in our cloud vault for 24 hours. Please secure your keystore file and passwords for future Play Store updates.
                 </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

