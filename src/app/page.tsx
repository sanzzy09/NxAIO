"use client"

import React, { useState } from 'react';
import { ToolHub } from '@/components/dashboard/ToolHub';
import { AIAssistant } from '@/components/dashboard/AIAssistant';
import { ImageOptimizer } from '@/components/dashboard/ImageOptimizer';
import { SnippetManager } from '@/components/dashboard/SnippetManager';
import { LivePreviewer } from '@/components/dashboard/LivePreviewer';
import { LayoutGrid, Boxes, ChevronLeft, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';

export default function Home() {
  const [activeTool, setActiveTool] = useState<string | null>(null);

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
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-primary/5">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => setActiveTool(null)}
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground group-hover:rotate-12 transition-transform">
              <Boxes className="w-5 h-5" />
            </div>
            <span className="font-headline font-bold text-xl tracking-tight">NxAIO</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <button 
              className="text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setActiveTool(null)}
            >
              Dashboard
            </button>
            <Link href="/faq" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">FAQ</Link>
            <Link href="/changelog" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Changelog</Link>
            <button className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Enterprise</button>
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Github className="w-5 h-5" />
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" asChild className="rounded-full px-5 text-muted-foreground hover:text-primary">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild className="rounded-full px-5 shadow-lg shadow-primary/10">
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero / Main Area */}
      <main className="flex-1 container mx-auto px-4 py-8 lg:py-12">
        {!activeTool ? (
          <div className="space-y-12">
            <div className="max-w-2xl animate-fade-in-up">
              <h1 className="text-5xl lg:text-7xl font-bold font-headline leading-none mb-6">
                Intelligent <span className="text-muted-foreground">Logic</span> <br /> 
                Tool Hub.
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg mb-8">
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
