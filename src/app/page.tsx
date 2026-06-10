"use client"

import React, { useState } from 'react';
import { ToolHub } from '@/components/dashboard/ToolHub';
import { AIAssistant } from '@/components/dashboard/AIAssistant';
import { ImageOptimizer } from '@/components/dashboard/ImageOptimizer';
import { SnippetManager } from '@/components/dashboard/SnippetManager';
import { LivePreviewer } from '@/components/dashboard/LivePreviewer';
import { LayoutGrid, Boxes, ChevronLeft, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
            <button className="text-sm font-medium hover:text-primary transition-colors">Tools</button>
            <button className="text-sm font-medium hover:text-primary transition-colors">Enterprise</button>
            <button className="text-sm font-medium hover:text-primary transition-colors">Community</button>
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Github className="w-5 h-5" />
            </Button>
            <Button size="sm" className="rounded-full px-5">Sign In</Button>
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
                <Button size="lg" className="rounded-full px-8 h-12 text-base shadow-lg shadow-primary/10">Get Started</Button>
                <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base">View Utilities</Button>
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

            {/* Featured AI Assistant Section */}
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
                <Card className="p-6 border-none shadow-sm bg-card/50">
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
                        <span className="font-code">nx-7721</span>
                      </div>
                   </div>
                </Card>
                <AIAssistant />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-primary/5 py-12 mt-20 bg-card/30">
        <div className="container mx-auto px-4">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <Boxes className="w-6 h-6 text-primary" />
                  <span className="font-headline font-bold text-xl tracking-tight">NxAIO</span>
                </div>
                <p className="text-muted-foreground text-sm max-w-sm">
                  Premium tool hub designed for the next generation of creative technologists. Minimalist, fast, and AI-first.
                </p>
              </div>
              <div>
                <h4 className="font-headline font-bold mb-4 uppercase text-xs tracking-widest text-muted-foreground">Product</h4>
                <ul className="space-y-2 text-sm">
                  <li><button className="hover:text-primary transition-colors">Tool Hub</button></li>
                  <li><button className="hover:text-primary transition-colors">Pricing</button></li>
                  <li><button className="hover:text-primary transition-colors">Documentation</button></li>
                </ul>
              </div>
              <div>
                <h4 className="font-headline font-bold mb-4 uppercase text-xs tracking-widest text-muted-foreground">Social</h4>
                <ul className="space-y-2 text-sm">
                  <li><button className="hover:text-primary transition-colors">Twitter / X</button></li>
                  <li><button className="hover:text-primary transition-colors">GitHub</button></li>
                  <li><button className="hover:text-primary transition-colors">Discord</button></li>
                </ul>
              </div>
           </div>
           <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-primary/5 text-xs text-muted-foreground">
              <p>© 2024 NxAIO Studio. Built for speed.</p>
              <div className="flex gap-6 mt-4 md:mt-0">
                <button className="hover:text-primary transition-colors">Privacy Policy</button>
                <button className="hover:text-primary transition-colors">Terms of Service</button>
              </div>
           </div>
        </div>
      </footer>
    </div>
  );
}

function Card({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-card rounded-2xl border border-primary/5 shadow-sm p-1 ${className}`}>
      {children}
    </div>
  );
}
