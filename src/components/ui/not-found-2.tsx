"use client"

import React from "react"
import { Home, Compass, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GradualSpacingText } from "@/components/ui/gradual-spacing-text"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function NotFound2() {
  return (
    <main className="h-screen w-full flex flex-col items-center justify-center bg-primary text-primary-foreground selection:bg-primary-foreground/10 px-4">
      <div className="relative flex flex-col items-center space-y-8 animate-fade-in-up">
        {/* Large Masked Typography */}
        <h1 className="text-[12rem] md:text-[16rem] font-bold font-headline leading-none tracking-tighter bg-gradient-to-b from-primary-foreground via-primary-foreground/40 to-transparent bg-clip-text text-transparent opacity-90 select-none">
          <GradualSpacingText text="404" />
        </h1>

        <div className="text-center space-y-6 -mt-8 md:-mt-12 relative z-10">
          <p className="max-w-[280px] md:max-w-sm mx-auto text-sm md:text-base text-primary-foreground/60 font-medium leading-relaxed animate-fade-in-up [animation-delay:400ms]">
            The page you're looking for might have been moved or doesn't exist.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up [animation-delay:600ms]">
            <Button 
              asChild
              className="h-12 px-8 rounded-xl bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-bold transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-black/20 gap-2"
            >
              <Link href="/">
                <Home className="size-4" /> Go Home
              </Link>
            </Button>
            
            <Button 
              asChild
              variant="outline"
              className="h-12 px-8 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-primary-foreground font-bold transition-all hover:scale-105 active:scale-95 gap-2"
            >
              <Link href="/faq">
                <Compass className="size-4" /> Explore
              </Link>
            </Button>
          </div>
        </div>

        {/* Technical Detail Decorator */}
        <div className="pt-12 animate-fade-in-up [animation-delay:800ms]">
           <Link 
            href="/" 
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-primary-foreground/20 hover:text-primary-foreground/60 transition-colors"
           >
             <ArrowLeft className="size-3" /> Return to Previous Logic
           </Link>
        </div>
      </div>

      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl aspect-square bg-primary-foreground/[0.02] blur-[120px] rounded-full" />
      </div>
    </main>
  )
}