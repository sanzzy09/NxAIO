"use client";

import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  Sparkles,
  Code2,
  Cpu
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
            Platform Updates
          </Badge>
          <h1 className="text-5xl lg:text-7xl font-bold font-headline tracking-tight leading-[0.9]">
            The Next <br /> 
            <span className="text-muted-foreground/60">Generation.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
            We're building the fastest tool hub for creative engineers. Here's what's been shipping lately.
          </p>
        </div>

        {/* Current Version */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 animate-fade-in-up [animation-delay:200ms]">
          {/* Left Column: Version & Intro */}
          <div className="lg:col-span-5 space-y-8">
            <div className="flex items-center gap-3 text-muted-foreground font-mono text-sm bg-secondary/50 w-fit px-3 py-1 rounded-full border border-primary/5">
              <span className="text-primary font-bold">v3.1.0</span>
              <span>·</span>
              <span>March 2025</span>
            </div>
            
            <div className="space-y-6">
              <Badge className="bg-primary text-primary-foreground rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
                Stable Release
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold font-headline">
                Intelligent Logic <br />Chaining
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                The Logic Command Center now supports multi-step tool execution. You can now tell NxAIO to "Optimize this image, then generate a snippet for a blog post header using it."
              </p>
            </div>
          </div>

          {/* Right Column: Features & CTA */}
          <div className="lg:col-span-7">
            <div className="bg-card border border-primary/5 rounded-3xl p-8 lg:p-12 shadow-sm space-y-10">
              <div className="space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/40">New Capabilities</h3>
                <ul className="space-y-6">
                  <li className="flex items-start gap-4 group">
                    <div className="mt-1 p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-foreground font-semibold block">Enhanced AI Tool Inference</span>
                      <p className="text-sm text-muted-foreground">Improved natural language understanding for more complex task routing.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4 group">
                    <div className="mt-1 p-2 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-foreground font-semibold block">GPU Accelerated Optimization</span>
                      <p className="text-sm text-muted-foreground">Image compression is now 40% faster using our new server-side processing layer.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4 group">
                    <div className="mt-1 p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
                      <Code2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-foreground font-semibold block">Interactive Snippet Previews</span>
                      <p className="text-sm text-muted-foreground">Instantly see the rendered output of generated HTML/CSS snippets.</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="flex flex-wrap gap-4 pt-4 border-t border-primary/5">
                <Button size="lg" className="rounded-full px-8 h-12 text-sm font-bold">
                  View Docs
                </Button>
                <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-sm font-bold">
                  Migration Guide
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Older Versions */}
        <div className="mt-32 space-y-12">
           <h3 className="font-headline text-2xl font-bold">Previous Shipments</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-80">
              <div className="p-8 rounded-2xl border border-primary/5 bg-secondary/20 hover:bg-secondary/40 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <span className="font-mono text-xs text-muted-foreground font-bold">v3.0.0</span>
                  <span className="text-xs text-muted-foreground">Feb 2025</span>
                </div>
                <h4 className="font-headline font-bold mb-2">The Hub Relaunch</h4>
                <p className="text-sm text-muted-foreground">Introduction of the unified Tool Hub interface and Bone White design system.</p>
              </div>
              <div className="p-8 rounded-2xl border border-primary/5 bg-secondary/20 hover:bg-secondary/40 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <span className="font-mono text-xs text-muted-foreground font-bold">v2.8.0</span>
                  <span className="text-xs text-muted-foreground">Jan 2025</span>
                </div>
                <h4 className="font-headline font-bold mb-2">Genkit Integration</h4>
                <p className="text-sm text-muted-foreground">Switched to Genkit for more reliable AI logic flows and better error handling.</p>
              </div>
           </div>
        </div>

        {/* Footer Archive CTA */}
        <div className="mt-32 p-12 text-center border-2 border-dashed border-primary/10 rounded-[3rem] space-y-4">
           <h3 className="font-headline text-xl font-bold">Looking for something older?</h3>
           <p className="text-muted-foreground text-sm">Full version history is available in our engineering archives.</p>
           <Button variant="link" className="text-primary font-bold">Explore Archive</Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
