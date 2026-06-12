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
  BarChart3,
  Clock,
  History,
  CheckCircle2,
  Cpu,
  Globe,
  Palette,
  CreditCard
} from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { GradualSpacingText } from "@/components/ui/gradual-spacing-text";
import Link from 'next/link';
import { cn } from '@/lib/utils';

const updates = [
  {
    version: "1.2.0",
    date: "Nov 07, 2026",
    title: "Identity & Branding Sync",
    status: "Stable",
    description: "A comprehensive update to our brand identity and financial orchestration layer. This release focuses on visual fidelity and real-time billing transparency.",
    features: [
      {
        icon: <Sparkles className="size-4" />,
        name: "Official Brand Orchestration",
        desc: "Integrated the new official NxAIO emblem across the core shell with precision scaling and positioning.",
        color: "bg-indigo-500/10 text-indigo-600"
      },
      {
        icon: <CreditCard className="size-4" />,
        name: "Secure Billing Node",
        desc: "Tier upgrades are now routed through a verified WhatsApp engineering node for high-fidelity manual provisioning.",
        color: "bg-emerald-500/10 text-emerald-600"
      },
      {
        icon: <Clock className="size-4" />,
        name: "Real-time Billing Ticker",
        desc: "Implemented a live, high-precision countdown for subscription expirations in the billing settings.",
        color: "bg-blue-500/10 text-blue-600"
      },
      {
        icon: <Palette className="size-4" />,
        name: "Luminance Optimization",
        desc: "Optimized Dark Mode HSL variables to reduce eye strain and eliminate high-contrast 'blinding' white surfaces.",
        color: "bg-orange-500/10 text-orange-600"
      }
    ]
  },
  {
    version: "1.1.0",
    date: "Nov 06, 2026",
    title: "Intelligence & Analytics",
    status: "Stable",
    description: "Our first major logic update focused on user transparency and regional synchronization. We've introduced high-fidelity usage tracking and precision timing.",
    features: [
      {
        icon: <BarChart3 className="size-4" />,
        name: "EvilRadial Quota Analytics",
        desc: "Visualized tool consumption with glowing radial charts on user profiles.",
        color: "bg-indigo-500/10 text-indigo-600"
      },
      {
        icon: <Clock className="size-4" />,
        name: "00:00 WIB Reset Sync",
        desc: "All daily tool limits now synchronize with Western Indonesia Time (Asia/Jakarta).",
        color: "bg-emerald-500/10 text-emerald-600"
      },
      {
        icon: <Sparkles className="size-4" />,
        name: "Infinite Motion Logo Cloud",
        desc: "Added a hardware-accelerated, infinite-scrolling brand showcase with gradient masking.",
        color: "bg-blue-500/10 text-blue-600"
      },
      {
        icon: <Zap className="size-4" />,
        name: "Technical Blueprint Grids",
        desc: "Implemented Features-4 and Features-6 blocks for a more industrial UI feel.",
        color: "bg-orange-500/10 text-orange-600"
      }
    ]
  },
  {
    version: "1.0.0",
    date: "Nov 05, 2026",
    title: "Genesis Release",
    status: "Legacy",
    description: "The foundational shipment of NxAIO. Established the primary AI orchestration layer and tiered identity infrastructure.",
    features: [
      {
        icon: <Music className="size-4" />,
        name: "AI Music Orchestration",
        desc: "Launched the Remusic-powered generator for high-fidelity audio tracks.",
        color: "bg-purple-500/10 text-purple-600"
      },
      {
        icon: <Eraser className="size-4" />,
        name: "Background Isolation Engine",
        desc: "High-precision edge detection for subject removal on any image source.",
        color: "bg-pink-500/10 text-pink-600"
      },
      {
        icon: <Mail className="size-4" />,
        name: "Temp-Mail Infrastructure",
        desc: "Disposable identity system with automatic OTP detection and session persistence.",
        color: "bg-indigo-500/10 text-indigo-600"
      },
      {
        icon: <Globe className="size-4" />,
        name: "Global Media Explorers",
        desc: "Integrated Anime, Movieku, and Vidbox databases with multi-CDN mirrors.",
        color: "bg-cyan-500/10 text-cyan-600"
      }
    ]
  }
];

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/10">
      <Navbar />

      <main className="container mx-auto px-4 pt-32 pb-24 max-w-6xl">
        {/* Header Section */}
        <div className="space-y-6 mb-20">
          <Badge variant="outline" className="bg-primary/5 border-primary/10 text-primary/60 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest">
            Engineering Logs
          </Badge>
          <h1 className="text-5xl lg:text-7xl font-bold font-headline tracking-tight leading-[0.9] flex flex-col items-start">
            <GradualSpacingText text="The Utility" className="justify-start" /> 
            <span className="text-muted-foreground/60">
              <GradualSpacingText text="Revolution." className="justify-start" />
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed animate-fade-in-up [animation-delay:400ms]">
            From zero to intelligence. We're evolving NxAIO into the definitive AI Utility Suite for modern developers.
          </p>
        </div>

        {/* Current Version Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 animate-fade-in-up [animation-delay:600ms] mb-32">
          {/* Left Column: Top Version Info */}
          <div className="lg:col-span-5 space-y-8">
            <div className="flex items-center gap-3 text-muted-foreground font-mono text-sm bg-secondary/50 w-fit px-4 py-1.5 rounded-full border border-primary/5">
              <span className="text-primary font-bold">v{updates[0].version}</span>
              <span>·</span>
              <span>{updates[0].date}</span>
            </div>
            
            <div className="space-y-6">
              <Badge className="bg-indigo-600 text-white rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider">
                Current Release
              </Badge>
              <h2 className="text-4xl font-bold font-headline leading-tight">
                {updates[0].title}
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {updates[0].description}
              </p>
              <div className="flex items-center gap-4 pt-4 border-t border-primary/5">
                 <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">Build Type</span>
                    <span className="text-sm font-bold font-headline">Production Stable</span>
                 </div>
                 <div className="w-px h-10 bg-primary/5" />
                 <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">Architect</span>
                    <span className="text-sm font-bold font-headline">NxAIO Labs</span>
                 </div>
              </div>
            </div>
          </div>

          {/* Right Column: Features List */}
          <div className="lg:col-span-7">
            <div className="bg-card border border-primary/5 rounded-[3rem] p-8 lg:p-12 shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-24 -right-24 size-64 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors duration-700" />
              
              <div className="space-y-10 relative z-10">
                <div className="space-y-6">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">New Capabilities</h3>
                  <ul className="space-y-8">
                    {updates[0].features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-5 group/item">
                        <div className={cn("mt-1 p-3 rounded-2xl group-hover/item:scale-110 transition-transform shadow-inner", feature.color)}>
                          {feature.icon}
                        </div>
                        <div className="space-y-1">
                          <span className="text-foreground font-bold font-headline block">{feature.name}</span>
                          <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap gap-4 pt-4 border-t border-primary/5">
                  <Button size="lg" className="rounded-2xl px-8 h-14 text-sm font-bold shadow-xl shadow-primary/10" asChild>
                    <Link href="/tools">Explore Tools</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="rounded-2xl px-8 h-14 text-sm font-bold border-primary/5">
                    View Roadmap
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Historical Timeline */}
        <div className="space-y-16 animate-fade-in-up [animation-delay:800ms]">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary rounded-2xl">
                 <History className="size-6 text-muted-foreground/40" />
              </div>
              <h3 className="font-headline text-3xl font-bold">Protocol History</h3>
           </div>

           <div className="space-y-8 relative">
              {/* Vertical Line Decorator */}
              <div className="absolute left-6 top-10 bottom-10 w-px bg-primary/5 hidden md:block" />

              {updates.slice(1).map((update, idx) => (
                <div key={idx} className="relative pl-0 md:pl-16 group">
                   {/* Marker */}
                   <div className="absolute left-4 top-8 size-4 rounded-full bg-background border-4 border-primary/20 hidden md:block group-hover:border-primary transition-colors z-10" />

                   <div className="p-8 lg:p-12 rounded-[2.5rem] border border-primary/5 bg-secondary/20 hover:bg-secondary/30 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                         <div className="space-y-1">
                            <div className="flex items-center gap-3">
                               <span className="text-xs font-mono font-bold text-muted-foreground/40">v{update.version}</span>
                               <Badge variant="outline" className="bg-background border-primary/5 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5">{update.status}</Badge>
                            </div>
                            <h4 className="text-2xl font-bold font-headline">{update.title}</h4>
                         </div>
                         <div className="flex items-center gap-2 text-muted-foreground/60 font-medium text-sm">
                            <Clock className="size-4" /> {update.date}
                         </div>
                      </div>

                      <p className="text-muted-foreground mb-10 max-w-3xl leading-relaxed">
                         {update.description}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {update.features.map((f, i) => (
                           <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-background/50 border border-primary/5">
                              <div className={cn("p-2 rounded-xl shrink-0", f.color)}>
                                 {f.icon}
                              </div>
                              <div className="space-y-0.5">
                                 <span className="text-xs font-bold font-headline block">{f.name}</span>
                                 <p className="text-[10px] text-muted-foreground font-medium">{f.desc}</p>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Technical Footer Archive */}
        <div className="mt-32 p-12 text-center border-2 border-dashed border-primary/10 rounded-[3.5rem] space-y-6 bg-secondary/10">
           <div className="size-16 bg-background rounded-3xl flex items-center justify-center mx-auto shadow-sm border border-primary/5">
              <CheckCircle2 className="size-8 text-emerald-500" />
           </div>
           <div className="space-y-2">
             <h3 className="font-headline text-2xl font-bold">System integrity verified.</h3>
             <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">Detailed technical breakdowns for every minor patch and edge deployment are available in our engineering archives.</p>
           </div>
           <div className="flex items-center justify-center gap-3 pt-2">
             <Button variant="link" className="text-primary font-bold uppercase tracking-widest text-[10px] gap-2">
                <Cpu className="size-3" /> Hardware Specs
             </Button>
             <span className="text-primary/10 text-xs">•</span>
             <Button variant="link" className="text-primary font-bold uppercase tracking-widest text-[10px] gap-2">
                <Globe className="size-3" /> Node Network
             </Button>
           </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
