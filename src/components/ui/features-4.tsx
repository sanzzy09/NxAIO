"use client"

import React from "react"
import { 
  LayoutGrid, 
  Terminal, 
  ShieldCheck, 
  FileText,
  Plus
} from "lucide-react"
import { cn } from "@/lib/utils"

const features = [
  {
    title: "Interactive Dashboard",
    description: "Visualize your data with drag-and-drop widgets and real-time state synchronization.",
    icon: <LayoutGrid className="size-5" />,
  },
  {
    title: "Instant API",
    description: "Auto-generate REST and GraphQL endpoints from your schema definitions instantly.",
    icon: <Terminal className="size-5" />,
  },
  {
    title: "Role-Based Access",
    description: "Secure resources with granular permission controls and identity-aware security layers.",
    icon: <ShieldCheck className="size-5" />,
  },
  {
    title: "Audit Trails",
    description: "Track every logic execution and identity rotation with comprehensive, immutable logs.",
    icon: <FileText className="size-5" />,
  },
]

export function Features4() {
  return (
    <section className="w-full py-24 bg-black text-white overflow-hidden">
      <div className="container px-4 md:px-6">
        {/* Header */}
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-20">
          <h2 className="text-4xl font-bold font-headline tracking-tight sm:text-6xl text-[#edeffd]">
            Build tools faster.
          </h2>
          <p className="max-w-[600px] text-muted-foreground/60 text-lg md:text-xl font-medium">
            The complete platform for secure, scalable logic. You define the flow, we handle the orchestration.
          </p>
        </div>

        {/* Technical Grid */}
        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 group">
          {/* Extended Border Lines */}
          <div className="absolute inset-0 pointer-events-none">
             {/* Horizontal lines */}
             <div className="absolute top-0 left-[-10%] right-[-10%] h-[1px] bg-white/10" />
             <div className="absolute bottom-0 left-[-10%] right-[-10%] h-[1px] bg-white/10" />
             
             {/* Vertical lines */}
             <div className="absolute left-0 top-[-10%] bottom-[-10%] w-[1px] bg-white/10" />
             <div className="absolute right-0 top-[-10%] bottom-[-10%] w-[1px] bg-white/10" />
             <div className="absolute left-1/4 top-[-10%] bottom-[-10%] w-[1px] bg-white/10 hidden lg:block" />
             <div className="absolute left-2/4 top-[-10%] bottom-[-10%] w-[1px] bg-white/10 hidden md:block" />
             <div className="absolute left-3/4 top-[-10%] bottom-[-10%] w-[1px] bg-white/10 hidden lg:block" />
          </div>

          {features.map((feature, index) => (
            <div 
              key={index}
              className={cn(
                "relative p-10 lg:p-12 transition-all duration-500 hover:bg-white/[0.02] border-white/10 overflow-hidden",
                // Internal borders for the grid feel
                index !== features.length - 1 && "md:border-r border-b lg:border-b-0",
                index === 1 && "lg:border-r"
              )}
            >
              {/* Corner Pulsing Markers (+) */}
              <Plus className="absolute -top-2.5 -left-2.5 size-5 text-white/20" />
              {index === features.length - 1 && <Plus className="absolute -top-2.5 -right-2.5 size-5 text-white/20" />}
              <Plus className="absolute -bottom-2.5 -left-2.5 size-5 text-white/20" />
              {index === features.length - 1 && <Plus className="absolute -bottom-2.5 -right-2.5 size-5 text-white/20" />}

              {/* Top-Left Hover Glow */}
              <div className="absolute top-0 left-0 size-48 bg-primary/20 blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

              <div className="relative z-10 space-y-6">
                <div className="inline-flex p-3 rounded-xl bg-white/5 border border-white/10 text-white shadow-2xl">
                  {feature.icon}
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-xl font-bold font-headline tracking-tight text-[#edeffd]">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground/60 leading-relaxed font-medium">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
