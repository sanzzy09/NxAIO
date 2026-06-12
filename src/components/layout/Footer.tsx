"use client";

import React from 'react';
import { Github, Twitter, Linkedin, ShieldCheck, Cpu, Instagram } from 'lucide-react';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import Image from 'next/image';

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.375-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.131.57-.074 1.758-.717 2.006-1.412.248-.695.248-1.29.173-1.412-.074-.122-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.63 1.438h.004c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground pt-20 pb-10 mt-20">
      <div className="container mx-auto px-4">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="flex items-center group w-fit">
              <div className="w-52 h-20 relative group-hover:scale-105 transition-transform flex items-center justify-center">
                <Image 
                  src={siteConfig.logo} 
                  alt={siteConfig.name} 
                  width={208} 
                  height={80} 
                  className="object-contain"
                  unoptimized
                />
              </div>
            </Link>
            <p className="text-primary-foreground/60 text-sm leading-relaxed max-w-xs">
              {siteConfig.description}
            </p>
            <div className="flex gap-4">
              <Link href={siteConfig.links.twitter} target="_blank" rel="noopener noreferrer" className="text-primary-foreground/40 hover:text-primary-foreground transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href={siteConfig.links.github} target="_blank" rel="noopener noreferrer" className="text-primary-foreground/40 hover:text-primary-foreground transition-colors">
                <Github className="w-5 h-5" />
              </Link>
              <Link href={siteConfig.links.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary-foreground/40 hover:text-primary-foreground transition-colors">
                <Linkedin className="w-5 h-5" />
              </Link>
              <Link href={siteConfig.links.instagram} target="_blank" rel="noopener noreferrer" className="text-primary-foreground/40 hover:text-primary-foreground transition-colors">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href={siteConfig.links.whatsapp} target="_blank" rel="noopener noreferrer" className="text-primary-foreground/40 hover:text-primary-foreground transition-colors">
                <WhatsAppIcon className="w-5 h-5" />
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
          <p>© {currentYear} {siteConfig.author}. Engineered for performance.</p>
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
