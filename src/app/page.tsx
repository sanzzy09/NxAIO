
"use client"

import React, { useState, useMemo, useEffect } from 'react';
import { ToolHub } from '@/components/dashboard/ToolHub';
import { AIAssistant } from '@/components/dashboard/AIAssistant';
import { SnippetManager } from '@/components/dashboard/SnippetManager';
import { AIODownloader } from '@/components/dashboard/AIODownloader';
import { AnimeExplorer } from '@/components/dashboard/AnimeExplorer';
import { Lk21Explorer } from '@/components/dashboard/Lk21Explorer';
import { DonghuaExplorer } from '@/components/dashboard/DonghuaExplorer';
import { TranscribeTool } from '@/components/dashboard/TranscribeTool';
import { OCRTool } from '@/components/dashboard/OCRTool';
import { AnichinExplorer } from '@/components/dashboard/AnichinExplorer';
import { AdlinkBypasser } from '@/components/dashboard/AdlinkBypasser';
import { FileHosting } from '@/components/dashboard/FileHosting';
import { BackgroundRemover } from '@/components/dashboard/BackgroundRemover';
import { NimegamiExplorer } from '@/components/dashboard/NimegamiExplorer';
import { MusicGenerator } from '@/components/dashboard/MusicGenerator';
import { VidboxExplorer } from '@/components/dashboard/VidboxExplorer';
import { MoviekuExplorer } from '@/components/dashboard/MoviekuExplorer';
import { TempMailTool } from '@/components/dashboard/TempMailTool';
import { NexAgent } from '@/components/dashboard/NexAgent';
import { LayoutGrid, ChevronLeft, Users, MousePointer2, UserPlus, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { StaggeredFadeUp } from '@/components/ui/staggered-fade-up';
import { SkeletonStats } from '@/components/ui/skeleton-stats';
import Link from 'next/link';
import { useFirestore, useDoc } from '@/firebase';
import { doc, increment, setDoc, updateDoc } from 'firebase/firestore';

export default function Home() {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const db = useFirestore();

  // Real-time statistics from Firestore
  const statsRef = useMemo(() => doc(db, 'system', 'stats'), [db]);
  const { data: stats, loading: statsLoading } = useDoc(statsRef);

  // Track real-time visitors
  useEffect(() => {
    if (!db) return;
    
    const trackVisitor = async () => {
      const hasVisited = sessionStorage.getItem('nx_visitor_logged');
      if (!hasVisited) {
        const sRef = doc(db, 'system', 'stats');
        updateDoc(sRef, {
          totalVisitors: increment(1)
        }).catch(() => {
          // Initialize if it doesn't exist
          setDoc(sRef, {
            totalVisitors: 1,
            totalUsers: 0,
            registrationsToday: 0
          }, { merge: true });
        });
        sessionStorage.setItem('nx_visitor_logged', 'true');
      }
    };
    
    trackVisitor();
  }, [db]);

  const renderTool = () => {
    switch (activeTool) {
      case "nexagent": return <NexAgent />;
      case "tempmail": return <TempMailTool />;
      case "movieku": return <MoviekuExplorer />;
      case "vidbox": return <VidboxExplorer />;
      case "music": return <MusicGenerator />;
      case "nimegami": return <NimegamiExplorer />;
      case "remover": return <BackgroundRemover />;
      case "hosting": return <FileHosting />;
      case "bypass": return <AdlinkBypasser />;
      case "anichin": return <AnichinExplorer />;
      case "snippets": return <SnippetManager />;
      case "downloader": return <AIODownloader />;
      case "anime": return <AnimeExplorer />;
      case "lk21": return <Lk21Explorer />;
      case "donghua": return <DonghuaExplorer />;
      case "transcribe": return <TranscribeTool />;
      case "ocr": return <OCRTool />;
      case "logic": return <AIAssistant />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/10 overflow-x-hidden">
      <Navbar onDashboardClick={() => setActiveTool(null)} />

      <main className="flex-1 container mx-auto px-4 pt-32 pb-8 lg:pb-12">
        {!activeTool ? (
          <div className="space-y-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <StaggeredFadeUp className="space-y-8" delayStep={100}>
                <h1 className="text-5xl lg:text-8xl font-bold font-headline leading-[0.9] tracking-tighter">
                  Intelligent <br />
                  <span className="text-muted-foreground/40">Logic Hub.</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                  The minimalist control center for creative developers. Chain AI logic, optimize assets, and preview content in one snappy interface.
                </p>
                
                <div className="flex flex-wrap gap-4 pt-2">
                  <Button size="lg" className="rounded-full px-10 h-14 text-base font-bold shadow-2xl shadow-primary/20" asChild>
                    <Link href="/signup">Get Started Now</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="rounded-full px-10 h-14 text-base font-bold border-primary/10 hover:bg-secondary/50" asChild>
                    <Link href="/faq">How it works</Link>
                  </Button>
                </div>
              </StaggeredFadeUp>

              {/* Real-time Stats Section */}
              {statsLoading ? (
                <div className="animate-fade-in-up [animation-delay:300ms]">
                  <SkeletonStats />
                </div>
              ) : (
                <StaggeredFadeUp className="grid grid-cols-1 sm:grid-cols-2 gap-4" delayStep={120} initialDelay={300}>
                  <div className="bg-card/40 backdrop-blur-xl border border-primary/5 p-8 rounded-[2rem] shadow-sm space-y-3 group hover:border-primary/20 transition-all duration-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-blue-500">
                        <div className="p-2 bg-blue-500/10 rounded-xl">
                          <Users className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">Total Users</span>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    </div>
                    <div className="text-5xl font-headline font-bold tracking-tighter min-h-[3.75rem] flex items-center">
                      {stats?.totalUsers?.toLocaleString() ?? "0"}
                    </div>
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                      <TrendingUp className="w-3 h-3 text-emerald-500" /> <span className="text-emerald-500">+12%</span> from last week
                    </div>
                  </div>

                  <div className="bg-card/40 backdrop-blur-xl border border-primary/5 p-8 rounded-[2rem] shadow-sm space-y-3 group hover:border-primary/20 transition-all duration-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-purple-500">
                        <div className="p-2 bg-purple-500/10 rounded-xl">
                          <MousePointer2 className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] font-medium opacity-50">Visitors</span>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                    </div>
                    <div className="text-5xl font-headline font-bold tracking-tighter min-h-[3.75rem] flex items-center">
                      {stats?.totalVisitors?.toLocaleString() ?? "0"}
                    </div>
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                      <TrendingUp className="w-3 h-3 text-emerald-500" /> <span className="text-emerald-500">+5%</span> in last 24h
                    </div>
                  </div>

                  <div className="bg-card/40 backdrop-blur-xl border border-primary/5 p-8 rounded-[2rem] shadow-sm space-y-3 sm:col-span-2 group hover:border-primary/20 transition-all duration-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-orange-500">
                        <div className="p-2 bg-orange-500/10 rounded-xl">
                          <UserPlus className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] font-medium opacity-50">Registrations Today</span>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                    </div>
                    <div className="flex items-baseline gap-3 min-h-[3.75rem] items-center">
                      <span className="text-5xl font-headline font-bold tracking-tighter">
                        {stats?.registrationsToday?.toLocaleString() ?? "0"}
                      </span>
                      <span className="text-sm text-muted-foreground font-medium uppercase tracking-widest opacity-40">New Accounts</span>
                    </div>
                  </div>
                </StaggeredFadeUp>
              )}
            </div>

            <div className="space-y-8 animate-fade-in-up [animation-delay:600ms]">
              <div className="flex items-center justify-between">
                <h2 className="font-headline text-2xl font-bold flex items-center gap-3">
                  <div className="p-2 bg-primary/5 rounded-xl">
                    <LayoutGrid className="w-6 h-6 text-primary/40" />
                  </div> 
                  Intelligent Tool Hub
                </h2>
              </div>
              <ToolHub onSelect={setActiveTool} />
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up">
            <button 
              onClick={() => setActiveTool(null)}
              className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-all group px-4 py-2 rounded-full hover:bg-secondary/50 w-fit"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
            </button>
            
            <div className="space-y-8">
              {renderTool()}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
