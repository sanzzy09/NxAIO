"use client"

import React from 'react'
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Contact4 } from "@/components/ui/contact-4"
import { LocationMap } from "@/components/ui/location-map"
import { Badge } from "@/components/ui/badge"
import { GradualSpacingText } from "@/components/ui/gradual-spacing-text"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/10">
      <Navbar />
      
      <main className="pt-32 pb-16 space-y-32">
        {/* Immersive Map Hero */}
        <section className="container mx-auto px-4 flex flex-col items-center gap-12 animate-fade-in-up">
           <div className="text-center space-y-6">
              <div className="flex justify-center">
                <Badge variant="outline" className="bg-primary/5 border-primary/10 text-primary/60 rounded-full px-5 py-1.5 text-[10px] font-bold uppercase tracking-[0.3em]">
                  Global Infrastructure Node
                </Badge>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tighter leading-[0.9] flex flex-col items-center">
                <GradualSpacingText text="Connecting Logic" />
                <span className="text-muted-foreground/40">
                  <GradualSpacingText text="Across the Globe." />
                </span>
              </h1>
           </div>
           
           <div className="relative flex flex-col items-center gap-8">
             <p className="text-[10px] font-bold tracking-[0.4em] text-muted-foreground/30 uppercase animate-fade-in-up [animation-delay:600ms]">
                Current Location
             </p>
             <div className="animate-fade-in-up [animation-delay:800ms]">
               <LocationMap 
                 location="Lampung, Indonesia" 
                 coordinates="5.3538° S, 105.3216° E"
               />
             </div>
           </div>
        </section>

        {/* Standard Contact Form */}
        <Contact4 />
      </main>

      <Footer />
    </div>
  )
}
