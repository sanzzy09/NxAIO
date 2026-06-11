"use client";

import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  Sparkles,
  Music,
  Eraser,
  ShieldCheck,
  Mail,
  CloudUpload
} from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import Link from 'next/link';

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/10">
      <Navbar />

      <main className="container mx-auto px-4 pt-32 pb-16 lg:py-24 max-w-6xl">
        {/* Header Section */}
        <div className="space-y-6 mb-20 animate-fade-in-up">
          <Badge variant="outline" className="bg-primary/5 border-primary/10 text-primary/60 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest">
            Engineering Logs
          </Badge>
          <h1 className="text-5xl lg:text-7xl font-bold font-headline tracking-tight leading-[0.9]">
            The Utility <br /> 
            <span className="text-muted-foreground/60">Revolution.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
            We've evolved from a simple hub into a powerful AI Utility Suite. Here is the latest from the NxAIO lab.
          </p>
        </div>

        {/* Current Version */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 animate-fade-in-up [animation-delay:200ms]">
          {/* Left Column: Version & Intro */}
          <div className="lg:col-span-5 space-y-8">
            <div className="flex items-center gap-3 text-muted-foreground font-mono text-sm bg-secondary/50 w-fit px-4 py-1.5 rounded-full border border-primary/5">
              <span className="text-primary font-bold">v3.5.0</span>
              <span>·</span>
              <span>March 2025</span>
            </div>
            
            <div className="space-y-6">
              <Badge className="bg-indigo-600 text-white rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider">
                Major Update
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold font-headline">
                The AI Utility <br />Suite Launch
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                This version introduces our core AI engines: Background Isolation, Music Orchestration, and Temporary Identity Rotation. We've also finalized our tiered identity limits.
              </p>
            </div>
          </div>

          {/* Right Column: Features & CTA */}
          <div className="lg:col-span-7">
            <div className="bg-card border border-primary/5 rounded-[3rem] p-8 lg:p-12 shadow-sm space-y-10">
              <div className="space-y-6">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">New Capabilities</h3>
                <ul className="space-y-6">
                  <li className="flex items-start gap-4 group">
                    <div className="mt-1 p-3 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
                      <Music className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-foreground font-bold block">AI Music Orchestrator</span>
                      <p className="text-sm text-muted-foreground">Generate high-fidelity tracks from lyrics or descriptions with real-time session tracking.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4 group">
                    <div className="mt-1 p-3 rounded-xl bg-pink-50 text-pink-600 group-hover:scale-110 transition-transform">
                      <Eraser className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-foreground font-bold block">High-Precision BG Remover</span>
                      <p className="text-sm text-muted-foreground">GPU-accelerated background isolation with tiered daily quotas for all users.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4 group">
                    <div className="mt-1 p-3 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-foreground font-bold block">Tiered Identity System</span>
                      <p className="text-sm text-muted-foreground">Introduction of Starter, Pro, and Sultan tiers with specific daily/weekly utility limits.</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="flex flex-wrap gap-4 pt-4 border-t border-primary/5">
                <Button size="lg" className="rounded-2xl px-8 h-14 text-sm font-bold shadow-xl shadow-primary/10">
                  Explore Hub
                </Button>
                <Button size="lg" variant="outline" className="rounded-2xl px-8 h-14 text-sm font-bold border-primary/5">
                  View Roadmap
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Older Versions */}
        <div className="mt-32 space-y-12">
           <h3 className="font-headline text-2xl font-bold">Previous Shipments</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-80">
              <div className="p-8 rounded-[2rem] border border-primary/5 bg-secondary/20 hover:bg-secondary/40 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <span className="font-mono text-[10px] text-muted-foreground font-bold uppercase">v3.2.0</span>
                  <span className="text-[10px] text-muted-foreground font-bold">Feb 2025</span>
                </div>
                <h4 className="font-headline font-bold text-lg mb-2">Temp-Mail Revolution</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">Launched real-time temporary mailbox system with automatic OTP code extraction and session persistence.</p>
              </div>
              <div className="p-8 rounded-[2rem] border border-primary/5 bg-secondary/20 hover:bg-secondary/40 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <span className="font-mono text-[10px] text-muted-foreground font-bold uppercase">v3.0.0</span>
                  <span className="text-[10px] text-muted-foreground font-bold">Jan 2025</span>
                </div>
                <h4 className="font-headline font-bold text-lg mb-2">The Bone White System</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">Full redesign of the UI system to our signature Bone White aesthetic with glassmorphic dashboards.</p>
              </div>
           </div>
        </div>

        {/* Footer Archive CTA */}
        <div className="mt-32 p-12 text-center border-2 border-dashed border-primary/10 rounded-[3.5rem] space-y-4">
           <h3 className="font-headline text-2xl font-bold">Looking for historical data?</h3>
           <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">Detailed technical breakdowns for every minor patch are available in our engineering archives.</p>
           <Button variant="link" className="text-primary font-bold uppercase tracking-widest text-xs">Explore Archive</Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
