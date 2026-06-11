"use client"

import React from "react"
import { cn } from "@/lib/utils"

const TailwindIcon = () => (
  <svg viewBox="0 0 24 24" className="h-10 w-10 fill-[#38BDF8] drop-shadow-sm" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8 0.913 0.228 1.565 0.921 2.288 1.664 1.177 1.211 2.538 2.611 5.512 2.611 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-0.913-0.228-1.565-0.921-2.288-1.664-1.177-1.211-2.538-2.611-5.512-2.611zM6.001 12c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8 0.913 0.228 1.565 0.921 2.288 1.664 1.177 1.211 2.538 2.611 5.512 2.611 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-0.913-0.228-1.565-0.921-2.288-1.664-1.177-1.211-2.538-2.611-5.512-2.611z" />
  </svg>
)

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
    icon: <TailwindIcon />,
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
    <section className="w-full py-20 overflow-hidden relative">
      <div className="container px-4 md:px-6 mb-12 text-center">
        <h3 className="text-xs font-bold uppercase tracking-[0.4em] text-muted-foreground/30">
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
              className="flex items-center gap-4 px-14 group cursor-default transition-all duration-500 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 scale-95 hover:scale-105"
            >
              {logo.icon ? (
                <div className="transition-transform group-hover:rotate-6">
                  {logo.icon}
                </div>
              ) : (
                <img
                  src={logo.logo}
                  alt={logo.name}
                  className="h-10 w-10 object-contain drop-shadow-sm transition-transform group-hover:rotate-6"
                />
              )}
              <span className="font-headline font-bold text-lg tracking-tighter text-foreground">
                {logo.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
