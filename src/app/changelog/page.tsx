
"use client";

import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Boxes, Zap, Wrench, TrendingUp, ChevronLeft } from "lucide-react";
import Link from 'next/link';

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-primary/30">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full bg-black/50 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-black group-hover:rotate-12 transition-transform">
              <Boxes className="w-5 h-5" />
            </div>
            <span className="font-headline font-bold text-xl tracking-tight">NxAIO</span>
          </Link>
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="sm" asChild className="text-white/60 hover:text-white hover:bg-white/5">
               <Link href="/">Back to Home</Link>
             </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 lg:py-24 max-w-6xl">
        {/* Header Section */}
        <div className="space-y-6 mb-20 animate-fade-in-up">
          <Badge variant="outline" className="bg-white/5 border-white/10 text-white/60 rounded-full px-3 py-1 text-xs font-medium uppercase tracking-widest">
            Changelog
          </Badge>
          <h1 className="text-5xl lg:text-7xl font-bold font-headline tracking-tight">
            What's new
          </h1>
          <p className="text-xl text-white/40 max-w-2xl leading-relaxed">
            Follow our product journey. We ship fast and document every step.
          </p>
        </div>

        {/* Changelog Item */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 animate-fade-in-up [animation-delay:200ms]">
          {/* Left Column: Version & Intro */}
          <div className="lg:col-span-5 space-y-8">
            <div className="flex items-center gap-3 text-white/40 font-mono text-sm">
              <span className="text-white font-bold">v3.0.0</span>
              <span>·</span>
              <span>March 2025</span>
            </div>
            
            <div className="space-y-6">
              <Badge className="bg-[#f5f5f3] text-black hover:bg-[#f5f5f3]/90 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
                Major Release
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold font-headline">
                Platform v3 — Rebuilt from the Ground Up
              </h2>
              <p className="text-white/50 text-lg leading-relaxed">
                A complete rearchitecture of our core engine with a new rendering pipeline, redesigned APIs, and dramatically improved performance across all workloads.
              </p>
            </div>
          </div>

          {/* Right Column: Features & CTA */}
          <div className="lg:col-span-7 space-y-10">
            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">What's included</h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-4 group">
                  <div className="mt-1 p-1 rounded bg-white/5 text-white/80 group-hover:text-white transition-colors">
                    <Zap className="w-4 h-4" />
                  </div>
                  <span className="text-white/70 text-lg group-hover:text-white transition-colors">New rendering engine with 3x throughput</span>
                </li>
                <li className="flex items-start gap-4 group">
                  <div className="mt-1 p-1 rounded bg-white/5 text-white/80 group-hover:text-white transition-colors">
                    <Zap className="w-4 h-4" />
                  </div>
                  <span className="text-white/70 text-lg group-hover:text-white transition-colors">Redesigned REST & GraphQL APIs</span>
                </li>
                <li className="flex items-start gap-4 group">
                  <div className="mt-1 p-1 rounded bg-white/5 text-white/80 group-hover:text-white transition-colors">
                    <Zap className="w-4 h-4" />
                  </div>
                  <span className="text-white/70 text-lg group-hover:text-white transition-colors">Real-time collaboration layer</span>
                </li>
                <li className="flex items-start gap-4 group">
                  <div className="mt-1 p-1 rounded bg-white/5 text-blue-400 group-hover:text-blue-300 transition-colors">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <span className="text-white/70 text-lg group-hover:text-white transition-colors">Resolved 40+ long-standing edge cases</span>
                </li>
                <li className="flex items-start gap-4 group">
                  <div className="mt-1 p-1 rounded bg-white/5 text-emerald-400 group-hover:text-emerald-300 transition-colors">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <span className="text-white/70 text-lg group-hover:text-white transition-colors">Reduced bundle size by 60%</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <Button size="lg" className="bg-[#f5f5f3] text-black hover:bg-[#f5f5f3]/90 rounded-xl px-8 h-12 text-sm font-bold">
                Read release notes
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-white/10 hover:bg-white/5 text-white rounded-xl px-8 h-12 text-sm font-bold">
                Migration guide
              </Button>
            </div>
          </div>
        </div>

        {/* Spacer / Divider */}
        <div className="my-32 border-t border-white/5 w-full" />

        {/* Older versions placeholder */}
        <div className="opacity-20 flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/10 rounded-3xl">
           <p className="text-sm font-mono">Older versions available in the archives.</p>
        </div>
      </main>

      <footer className="border-t border-white/5 py-12 bg-black">
        <div className="container mx-auto px-4 flex justify-between items-center text-white/30 text-xs">
          <p>© 2025 NxAIO Engineering.</p>
          <div className="flex gap-6 font-medium">
             <Link href="/" className="hover:text-white transition-colors">Home</Link>
             <Link href="/changelog" className="text-white">Changelog</Link>
             <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
