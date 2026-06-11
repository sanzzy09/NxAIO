"use client";

import React from 'react';
import { Boxes, Github, Twitter, Linkedin, MessageSquare, ShieldCheck, Cpu } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground pt-20 pb-10 mt-20">
      <div className="container mx-auto px-4">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <div className="w-8 h-8 bg-primary-foreground rounded-lg flex items-center justify-center text-primary group-hover:rotate-12 transition-transform">
                <Boxes className="w-5 h-5" />
              </div>
              <span className="font-headline font-bold text-2xl tracking-tight">NxAIO</span>
            </Link>
            <p className="text-primary-foreground/60 text-sm leading-relaxed max-w-xs">
              The high-performance utility suite for modern developers. We orchestrate AI logic, anonymous identities, and creative assets with unparalleled speed.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-primary-foreground/40 hover:text-primary-foreground transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-primary-foreground/40 hover:text-primary-foreground transition-colors">
                <Github className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-primary-foreground/40 hover:text-primary-foreground transition-colors">
                <Linkedin className="w-5 h-5" />
              </Link>
            </div>
            
            <div className="pt-4 flex items-center gap-3">
               <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary-foreground/30 border border-white/10 px-3 py-1.5 rounded-full">
                  <ShieldCheck className="size-3" /> GDPR Compliant
               </div>
               <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary-foreground/30 border border-white/10 px-3 py-1.5 rounded-full">
                  <Cpu className="size-3" /> GPU Accelerated
               </div>
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h4 className="font-headline font-bold text-xs uppercase tracking-[0.2em] text-primary-foreground/30">AI Utilities</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/60">
                <li><Link href="/tools" className="hover:text-primary-foreground transition-colors">Music Generator</Link></li>
                <li><Link href="/tools" className="hover:text-primary-foreground transition-colors">BG Remover</Link></li>
                <li><Link href="/tools" className="hover:text-primary-foreground transition-colors">Temp-Mail Tool</Link></li>
                <li><Link href="/tools" className="hover:text-primary-foreground transition-colors">File Hosting</Link></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-headline font-bold text-xs uppercase tracking-[0.2em] text-primary-foreground/30">Identity</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/60">
                <li><Link href="/pricing" className="hover:text-primary-foreground transition-colors">Starter Tier</Link></li>
                <li><Link href="/pricing" className="hover:text-primary-foreground transition-colors">Pro Identity</Link></li>
                <li><Link href="/pricing" className="hover:text-primary-foreground transition-colors">Sultan Tier</Link></li>
                <li><Link href="/profile" className="hover:text-primary-foreground transition-colors">Account Sync</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-headline font-bold text-xs uppercase tracking-[0.2em] text-primary-foreground/30">Resources</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/60">
                <li><Link href="/faq" className="hover:text-primary-foreground transition-colors">Utility Guide</Link></li>
                <li><Link href="/contact" className="hover:text-primary-foreground transition-colors">Get Help</Link></li>
                <li><Link href="/changelog" className="hover:text-primary-foreground transition-colors">Engineering Logs</Link></li>
                <li><Link href="#" className="hover:text-primary-foreground transition-colors">Community</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-headline font-bold text-xs uppercase tracking-[0.2em] text-primary-foreground/30">Safety</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/60">
                <li><Link href="/privacy" className="hover:text-primary-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-primary-foreground transition-colors">Security Audit</Link></li>
                <li><Link href="#" className="hover:text-primary-foreground transition-colors">Trust Center</Link></li>
                <li><Link href="/privacy" className="hover:text-primary-foreground transition-colors">Terms of Use</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-medium uppercase tracking-widest text-primary-foreground/40">
          <p>© {currentYear} NxAIO Labs. Engineered for performance.</p>
          <div className="flex gap-8">
            <Link href="/privacy" className="hover:text-primary-foreground transition-colors">Privacy</Link>
            <Link href="/privacy" className="hover:text-primary-foreground transition-colors">Terms</Link>
            <Link href="#" className="hover:text-primary-foreground transition-colors">Cookie Data</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
