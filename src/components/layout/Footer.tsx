"use client";

import React from 'react';
import { Boxes, Github, Twitter, Linkedin, MessageSquare } from 'lucide-react';
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
              Building the future of creative engineering. We help developers and designers chain logic and optimize assets with unparalleled speed.
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
              <Link href="#" className="text-primary-foreground/40 hover:text-primary-foreground transition-colors">
                <MessageSquare className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h4 className="font-headline font-bold text-xs uppercase tracking-[0.2em] text-primary-foreground/30">Product</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/60">
                <li><Link href="/" className="hover:text-primary-foreground transition-colors">Tool Hub</Link></li>
                <li><Link href="/faq" className="hover:text-primary-foreground transition-colors">FAQ</Link></li>
                <li><Link href="/changelog" className="hover:text-primary-foreground transition-colors">Changelog</Link></li>
                <li><Link href="#" className="hover:text-primary-foreground transition-colors">Enterprise</Link></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-headline font-bold text-xs uppercase tracking-[0.2em] text-primary-foreground/30">Company</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/60">
                <li><Link href="#" className="hover:text-primary-foreground transition-colors">About Us</Link></li>
                <li><Link href="#" className="hover:text-primary-foreground transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-primary-foreground transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-primary-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-headline font-bold text-xs uppercase tracking-[0.2em] text-primary-foreground/30">Resources</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/60">
                <li><Link href="#" className="hover:text-primary-foreground transition-colors">Documentation</Link></li>
                <li><Link href="#" className="hover:text-primary-foreground transition-colors">Community</Link></li>
                <li><Link href="#" className="hover:text-primary-foreground transition-colors">Guides</Link></li>
                <li><Link href="#" className="hover:text-primary-foreground transition-colors">API Reference</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-headline font-bold text-xs uppercase tracking-[0.2em] text-primary-foreground/30">Support</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/60">
                <li><Link href="#" className="hover:text-primary-foreground transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-primary-foreground transition-colors">Status</Link></li>
                <li><Link href="#" className="hover:text-primary-foreground transition-colors">Security</Link></li>
                <li><Link href="#" className="hover:text-primary-foreground transition-colors">Legal</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-medium uppercase tracking-widest text-primary-foreground/40">
          <p>© {currentYear} NxAIO Studio. All rights reserved.</p>
          <div className="flex gap-8">
            <Link href="/privacy" className="hover:text-primary-foreground transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary-foreground transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-primary-foreground transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
