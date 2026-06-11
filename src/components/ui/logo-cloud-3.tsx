"use client"

import React from "react"
import { cn } from "@/lib/utils"

const logos = [
  {
    name: "OpenRouter",
    logo: "https://openrouter.ai/favicon.ico",
  },
  {
    name: "Firebase",
    logo: "https://www.gstatic.com/mobilesdk/160503_mobilesdk/logo/2x/firebase_28dp.png",
  },
  {
    name: "NextJS",
    logo: "https://assets.vercel.com/image/upload/v1662130559/nextjs/Icon_light_background.png",
  },
  {
    name: "OpenAI",
    logo: "https://openai.com/favicon.ico",
  },
  {
    name: "Tailwind",
    logo: "https://tailwindcss.com/favicon-32x32.png",
  },
  {
    name: "Shadcn",
    logo: "https://ui.shadcn.com/favicon.ico",
  },
  {
    name: "Vercel",
    logo: "https://assets.vercel.com/image/upload/v1588805858/repositories/vercel/logo.png",
  },
  {
    name: "GitHub",
    logo: "https://github.githubassets.com/favicons/favicon.svg",
  },
]

export function LogoCloud3() {
  // Duplicate logos for infinite scroll effect
  const duplicatedLogos = [...logos, ...logos, ...logos]

  return (
    <section className="w-full py-16 overflow-hidden relative">
      <div className="container px-4 md:px-6 mb-10 text-center">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/30">
          Integrated Tool Ecosystems
        </h3>
      </div>

      {/* Gradient Masks */}
      <div className="absolute left-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none" />

      <div className="relative flex items-center">
        <div className="flex animate-logo-cloud-scroll whitespace-nowrap">
          {duplicatedLogos.map((logo, index) => (
            <div 
              key={`${logo.name}-${index}`} 
              className="flex items-center gap-3 px-12 group cursor-default transition-all duration-500 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 scale-90 hover:scale-105"
            >
              <img
                src={logo.logo}
                alt={logo.name}
                className="h-7 w-7 object-contain drop-shadow-sm"
              />
              <span className="font-headline font-bold text-sm tracking-tight text-foreground">
                {logo.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
