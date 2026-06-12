
"use client"

import React, { useMemo, useEffect, useState } from 'react';
import { Users, MousePointer2, UserPlus, TrendingUp, Sparkles, Activity, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { StaggeredFadeUp } from '@/components/ui/staggered-fade-up';
import { SkeletonStats } from '@/components/ui/skeleton-stats';
import { LogoCloud3 } from '@/components/ui/logo-cloud-3';
import { Features6 } from '@/components/ui/features-6';
import { Features4 } from '@/components/ui/features-4';
import { GradualSpacingText } from '@/components/ui/gradual-spacing-text';
import Link from 'next/link';
import { useFirestore, useDoc } from '@/firebase';
import { doc, increment, setDoc, updateDoc } from 'firebase/firestore';
import { siteConfig } from '@/config/site';

export default function Home() {
  const db = useFirestore();

  // Real-time statistics from Firestore
  const statsRef = useMemo(() => doc(db, 'system', 'stats'), [db]);
  const { data: stats, loading: statsLoading } = useDoc(statsRef);

  // Live Runtime Logic
  const [runtime, setRuntime] = useState({ d: 124, h: 0, m: 0, s: 0 });
  
  useEffect(() => {
    // Start date set to 124 days ago to maintain continuity with existing UI
    const start = new Date();
    start.setDate(start.getDate() - 124);
    
    const timer = setInterval(() => {
      const now = new Date();
      const diff = now.getTime() - start.getTime();
      
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      
      setRuntime({ d, h, m, s });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

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

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/10 overflow-x-hidden">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 pt-32 pb-8 lg:pb-12">
        <div className="space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 flex flex-col items-center text-center lg:items-start lg:text-left">
              <h1 className="text-5xl lg:text-8xl font-bold font-headline leading-[0.9] tracking-tighter">
                <GradualSpacingText text="Intelligent" className="justify-center lg:justify-start" /> <br />
                <span className="text-muted-foreground/40">
                  <GradualSpacingText text="Logic Hub." className="justify-center lg:justify-start" />
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg mx-auto lg:mx-0 animate-fade-in-up [animation-delay:400ms]">
                {siteConfig.description}
              </p>
              
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-2 animate-fade-in-up [animation-delay:600ms]">
                <Button size="lg" className="rounded-full px-10 h-14 text-base font-bold shadow-2xl shadow-primary/20" asChild>
                  <Link href="/tools">
                    <Sparkles className="mr-2 h-5 w-5" /> Launch Tool Hub
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-full px-10 h-14 text-base font-bold border-primary/10 hover:bg-secondary/50" asChild>
                  <Link href="/faq">How it works</Link>
                </Button>
              </div>
            </div>

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

                <div className="bg-card/40 backdrop-blur-xl border border-primary/5 p-8 rounded-[2rem] shadow-sm space-y-3 group hover:border-primary/20 transition-all duration-500">
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
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest opacity-40 ml-2">New Accounts</span>
                  </div>
                </div>

                <div className="bg-card/40 backdrop-blur-xl border border-primary/5 p-8 rounded-[2rem] shadow-sm space-y-3 group hover:border-primary/20 transition-all duration-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-emerald-500">
                      <div className="p-2 bg-emerald-500/10 rounded-xl">
                        <Activity className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] font-medium opacity-50">System Runtime</span>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="text-5xl font-headline font-bold tracking-tighter min-h-[3.75rem] flex items-center">
                    99.9%
                  </div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3 text-primary/40" /> 
                    Active for <span className="text-primary/60 font-mono font-bold">
                      {runtime.d}d {runtime.h}h {runtime.m}m {runtime.s}s
                    </span>
                  </div>
                </div>
              </StaggeredFadeUp>
            )}
          </div>

          <LogoCloud3 />

          <div className="animate-fade-in-up [animation-delay:500ms]">
             <Features6 />
          </div>

          <div className="full-bleed-technical-section -mx-4 lg:-mx-24 bg-background">
             <Features4 />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
