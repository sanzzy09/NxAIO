"use client"

import React, { useState, useMemo, useEffect } from 'react';
import { ToolHub } from '@/components/dashboard/ToolHub';
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
import { KomikuExplorer } from '@/components/dashboard/KomikuExplorer';
import { LayoutGrid, ChevronLeft, Loader2 } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { useFirestore, useDoc, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { UsageAnalytics } from '@/components/profile/UsageAnalytics';

export default function ToolsPage() {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();

  const userRef = useMemo(() => user ? doc(db, "users", user.uid) : null, [db, user]);
  const { data: profileData, loading: profileLoading } = useDoc(userRef);

  // Auth Guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const renderTool = () => {
    switch (activeTool) {
      case "nexagent": return <NexAgent />;
      case "komiku": return <KomikuExplorer />;
      case "tempmail": return <TempMailTool />;
      case "movieku": return <MoviekuExplorer />;
      case "vidbox": return <VidboxExplorer />;
      case "music": return <MusicGenerator />;
      case "nimegami": return <NimegamiExplorer />;
      case "remover": return <BackgroundRemover />;
      case "hosting": return <FileHosting />;
      case "bypass": return <AdlinkBypasser />;
      case "anichin": return <AnichinExplorer />;
      case "downloader": return <AIODownloader />;
      case "anime": return <AnimeExplorer />;
      case "lk21": return <Lk21Explorer />;
      case "donghua": return <DonghuaExplorer />;
      case "transcribe": return <TranscribeTool />;
      case "ocr": return <OCRTool />;
      default: return null;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary/20" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/10 overflow-x-hidden">
      <Navbar onDashboardClick={() => setActiveTool(null)} />

      <main className="flex-1 container mx-auto px-4 pt-32 pb-8 lg:pb-12">
        {!activeTool ? (
          <div className="space-y-16 animate-fade-in-up">
            <div className="space-y-12">
              <UsageAnalytics profile={profileData} />
              
              <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-primary/5 pb-4">
                  <h2 className="font-headline text-3xl font-bold flex items-center gap-3">
                    <div className="p-2 bg-primary/5 rounded-xl text-primary/40">
                      <LayoutGrid className="w-8 h-8" />
                    </div> 
                    Intelligent Tool Hub
                  </h2>
                </div>
                <ToolHub onSelect={setActiveTool} />
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up">
            <button 
              onClick={() => setActiveTool(null)}
              className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-all group px-4 py-2 rounded-full hover:bg-secondary/50 w-fit"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Tool Hub
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
