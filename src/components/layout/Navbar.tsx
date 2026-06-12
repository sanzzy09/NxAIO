"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Github, Menu, X, User as UserIcon, LogOut, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUser, useAuth, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';
import { siteConfig } from '@/config/site';
import Image from 'next/image';

export function Navbar({ onDashboardClick }: { onDashboardClick?: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, loading: authLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();

  const userDocRef = useMemo(() => user ? doc(db, 'users', user.uid) : null, [db, user]);
  const { data: profileData } = useDoc(userDocRef);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await auth.signOut();
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4 md:p-6 transition-all duration-300">
      <nav className={cn(
        "w-full max-w-5xl flex items-center justify-between px-4 md:px-6 h-14 md:h-16 rounded-full transition-all duration-500",
        "bg-primary text-primary-foreground shadow-2xl shadow-primary/20 border border-white/10 backdrop-blur-md",
        scrolled ? "scale-[0.98] md:scale-100" : "scale-100"
      )}>
        <Link 
          href="/" 
          className="flex items-center group"
          onClick={onDashboardClick}
        >
          <div className="w-48 h-12 md:w-64 md:h-16 relative group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
            <Image 
              src={siteConfig.logo} 
              alt={siteConfig.name} 
              width={256} 
              height={64} 
              className="object-contain"
              priority
              unoptimized
            />
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {siteConfig.navigation.map((link) => (
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

        <div className="flex items-center gap-1 md:gap-3">
          <AnimatedThemeToggler 
            variant="circle" 
            className="text-primary-foreground/60 hover:text-primary-foreground"
          />

          <Button variant="ghost" size="icon" asChild className="hidden sm:flex rounded-full text-primary-foreground/60 hover:text-primary-foreground hover:bg-white/10">
            <Link href={siteConfig.links.github} target="_blank" rel="noopener noreferrer">
              <Github className="w-5 h-5" />
            </Link>
          </Button>
          
          <div className="flex items-center gap-2">
            {!authLoading && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative flex items-center justify-center h-10 w-10 rounded-full hover:bg-white/10 p-0">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={profileData?.photoURL || user.photoURL || undefined} className="object-cover" />
                      <AvatarFallback className="bg-white/10 text-xs font-bold">
                        {(profileData?.displayName || user.displayName || user.email || "?").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mt-4 rounded-2xl bg-primary text-primary-foreground border-white/10 shadow-2xl" align="end" forceMount>
                  <DropdownMenuLabel className="font-headline font-bold py-4 px-6">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-bold leading-none">{profileData?.displayName || user.displayName || 'Account User'}</p>
                      <p className="text-xs leading-none text-primary-foreground/40">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-primary-foreground py-3 px-6 cursor-pointer rounded-none">
                    <Link href="/tools" className="flex items-center w-full">
                      <LayoutGrid className="mr-3 h-4 w-4 opacity-40" />
                      <span className="font-bold text-xs uppercase tracking-widest">Tool Hub</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-primary-foreground py-3 px-6 cursor-pointer rounded-none">
                    <Link href="/profile" className="flex items-center w-full">
                      <UserIcon className="mr-3 h-4 w-4 opacity-40" />
                      <span className="font-bold text-xs uppercase tracking-widest">Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="focus:bg-destructive/20 focus:text-destructive-foreground py-3 px-6 cursor-pointer text-red-400 rounded-b-2xl"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    <span className="font-bold text-xs uppercase tracking-widest">Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild className="hidden md:flex rounded-full px-5 text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 rounded-full px-4 md:px-6 shadow-lg shadow-black/10 font-bold text-xs">
                  <Link href="/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          <button 
            className="md:hidden p-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="absolute top-full left-4 right-4 mt-2 p-8 rounded-[2.5rem] bg-primary border border-white/10 shadow-2xl animate-fade-in-up md:hidden z-50">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-6">
              {siteConfig.navigation.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => {
                    link.onClick?.();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xl font-headline font-bold text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              {user && (
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xl font-headline font-bold text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  Profile
                </Link>
              )}
            </div>
            
            <div className="h-px bg-white/10" />
            
            <div className="flex flex-col gap-4">
              {user ? (
                <Button 
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full h-14 rounded-full bg-destructive/10 text-red-400 hover:bg-destructive/20 font-bold text-lg"
                >
                  Sign Out
                </Button>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    asChild 
                    className="w-full h-14 rounded-full border border-white/10 text-primary-foreground/90 hover:text-primary-foreground hover:bg-white/10 text-lg font-bold"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button 
                    asChild 
                    className="w-full h-14 rounded-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-bold text-lg shadow-xl shadow-black/20"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link href="/signup">Create Account</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
