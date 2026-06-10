"use client";

import React, { useState, useEffect } from 'react';
import { Boxes, Github, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Navbar({ onDashboardClick }: { onDashboardClick?: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Dashboard', href: '/', onClick: onDashboardClick },
    { label: 'Pricing', href: '/pricing' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Changelog', href: '/changelog' },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4 md:p-6 transition-all duration-300">
      <nav className={cn(
        "w-full max-w-5xl flex items-center justify-between px-4 md:px-6 h-14 md:h-16 rounded-full transition-all duration-500",
        "bg-primary text-primary-foreground shadow-2xl shadow-primary/20 border border-white/10 backdrop-blur-md",
        scrolled ? "scale-[0.98] md:scale-100" : "scale-100"
      )}>
        {/* Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-2 group"
          onClick={onDashboardClick}
        >
          <div className="w-8 h-8 bg-primary-foreground rounded-lg flex items-center justify-center text-primary group-hover:rotate-12 transition-transform duration-300">
            <Boxes className="w-5 h-5" />
          </div>
          <span className="font-headline font-bold text-lg md:text-xl tracking-tight">NxAIO</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={link.onClick}
              className="text-xs lg:text-sm font-medium text-primary-foreground/60 hover:text-primary-foreground transition-colors tracking-wide"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="icon" className="hidden sm:flex rounded-full text-primary-foreground/60 hover:text-primary-foreground hover:bg-white/10">
            <Github className="w-5 h-5" />
          </Button>
          
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" asChild className="hidden md:flex rounded-full px-5 text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button size="sm" asChild className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 rounded-full px-4 md:px-6 shadow-lg shadow-black/10 font-bold text-xs">
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-primary-foreground/80 hover:text-primary-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-4 right-4 mt-2 p-6 rounded-3xl bg-primary border border-white/10 shadow-2xl animate-fade-in-up md:hidden">
          <div className="flex flex-col gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => {
                  link.onClick?.();
                  setMobileMenuOpen(false);
                }}
                className="text-lg font-headline font-semibold text-primary-foreground/80 hover:text-primary-foreground"
              >
                {link.label}
              </Link>
            ))}
            <div className="h-px bg-white/10" />
            <div className="flex flex-col gap-3">
              <Button variant="outline" asChild className="w-full rounded-full border-white/20 text-primary-foreground hover:bg-white/10">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild className="w-full rounded-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-bold">
                <Link href="/signup">Create Account</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
