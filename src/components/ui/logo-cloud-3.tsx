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
]

export function LogoCloud3() {
  return (
    <section className="w-full py-12">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-8 text-center">
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/40">
              Integrated Ecosystems
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 md:gap-12 items-center justify-items-center opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
            {logos.map((logo) => (
              <div 
                key={logo.name} 
                className="flex items-center gap-2 group cursor-default transition-all hover:opacity-100 hover:scale-110"
                title={logo.name}
              >
                <img
                  src={logo.logo}
                  alt={logo.name}
                  className="h-6 w-6 object-contain"
                />
                <span className="font-headline font-bold text-xs tracking-tight">
                  {logo.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
