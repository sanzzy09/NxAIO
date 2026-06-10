"use client"

import React, { useState, useMemo } from 'react';
import { ToolHub } from '@/components/dashboard/ToolHub';
import { AIAssistant } from '@/components/dashboard/AIAssistant';
import { ImageOptimizer } from '@/components/dashboard/ImageOptimizer';
import { SnippetManager } from '@/components/dashboard/SnippetManager';
import { LivePreviewer } from '@/components/dashboard/LivePreviewer';
import { LayoutGrid, ChevronLeft, Users, MousePointer2, UserPlus, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import Link from 'next/link';
import { useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';

export default function Home() {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const db = useFirestore();

  // Real-time statistics from Firestore
  const statsRef = useMemo(() => doc(db, 'system', 'stats'), [db]);
  const { data: stats, loading: statsLoading } = useDoc(statsRef);

  const renderTool = () => {
    switch (activeTool) {
      case "optimizer": return <ImageOptimizer />;
      case "previewer": return <LivePreviewer />;
      case "snippets": return <SnippetManager />;
      case "logic": return <AIAssistant />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onDashboardClick={() => setActiveTool(null)} />

      {/* Hero / Main Area */}
      <main className="flex-1 container mx-auto px-4 pt-32 pb-8 lg:pb-12">
        {!activeTool ? (
          <div className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center animate-fade-in-up">
              <div className="space-y-8">
                <h1 className="text-5xl lg:text-7xl font-bold font-headline leading-none">
                  Intelligent <span className="text-muted-foreground">Logic</span> <br /> 
                  Tool Hub.
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                  The minimalist control center for creative developers. Chain AI logic, optimize assets, and preview content in one snappy interface.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Button size="lg" className="rounded-full px-8 h-12 text-base shadow-lg shadow-primary/10" asChild>
                    <Link href="/signup">Get Started Now</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base" asChild>
                    <Link href="/faq">How it works</Link>
                  </Button>
                </div>
              </div>

              {/* Real-time Stats Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-card/50 backdrop-blur-sm border border-primary/5 p-6 rounded-3xl shadow-sm space-y-2">
                  <div className="flex items-center gap-3 text-blue-500">
                    <Users className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-widest opacity-60">Total Users</span>
                  </div>
                  <div className="text-4xl font-headline font-bold">
                    {statsLoading ? "..." : (stats?.totalUsers || "1,240")}
                  </div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-green-500" /> +12% from last week
                  </div>
                </div>

                <div className="bg-card/50 backdrop-blur-sm border border-primary/5 p-6 rounded-3xl shadow-sm space-y-2">
                  <div className="flex items-center gap-3 text-purple-500">
                    <MousePointer2 className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-widest opacity-60">Visitors</span>
                  </div>
                  <div className="text-4xl font-headline font-bold">
                    {statsLoading ? "..." : (stats?.totalVisitors || "45,821")}
                  </div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-green-500" /> +5% in last 24h
                  </div>
                </div>

                <div className="bg-card/50 backdrop-blur-sm border border-primary/5 p-6 rounded-3xl shadow-sm space-y-2 sm:col-span-2">
                  <div className="flex items-center gap-3 text-orange-500">
                    <UserPlus className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-widest opacity-60">Registrations Today</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-headline font-bold">
                      {statsLoading ? "..." : (stats?.registrationsToday || "86")}
                    </span>
                    <span className="text-sm text-muted-foreground">new accounts</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="font-headline text-2xl font-semibold flex items-center gap-2">
                  <LayoutGrid className="w-6 h-6" /> Intelligent Tool Hub
                </h2>
              </div>
              <ToolHub onSelect={setActiveTool} />
            </div>

            <div className="pt-8 animate-fade-in-up [animation-delay:200ms]">
               <AIAssistant />
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-6">
            <button 
              onClick={() => setActiveTool(null)}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-all group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
            </button>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up">
              <div className="lg:col-span-2 space-y-6">
                {renderTool()}
              </div>
              <div className="space-y-6">
                <div className={`bg-card rounded-2xl border border-primary/5 shadow-sm p-6 bg-card/50`}>
                   <h3 className="font-headline font-semibold mb-4">Quick Insights</h3>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Status</span>
                        <span className="flex items-center gap-1.5 text-green-500">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Live
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">AI Token Use</span>
                        <span>12.4k</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Session ID</span>
                        <span className="font-mono">nx-7721</span>
                      </div>
                   </div>
                </div>
                <AIAssistant />
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
