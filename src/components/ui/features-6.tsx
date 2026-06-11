"use client"

import React from "react"
import { 
  Zap, 
  ShieldCheck, 
  Cpu, 
  Boxes, 
  Orbit, 
  MousePointer2 
} from "lucide-react"
import { cn } from "@/lib/utils"

const features = [
  {
    title: "AI Logic Chaining",
    description: "Orchestrate complex workflows by chaining multiple AI utilities with natural language commands.",
    icon: <Zap className="size-6" />,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    title: "Disposable Identity",
    description: "Rotate through temporary email identities with real-time OTP extraction and session privacy.",
    icon: <ShieldCheck className="size-6" />,
    color: "text-indigo-600",
    bgColor: "bg-indigo-600/10",
  },
  {
    title: "GPU Accelerated",
    description: "Background removal and music generation powered by high-performance neural clusters.",
    icon: <Cpu className="size-6" />,
    color: "text-pink-600",
    bgColor: "bg-pink-600/10",
  },
  {
    title: "Decentralized Hosting",
    description: "Secure, auto-expiring file buckets with 'Extend on View' technology for Sultan tier users.",
    icon: <Boxes className="size-6" />,
    color: "text-blue-600",
    bgColor: "bg-blue-600/10",
  },
  {
    title: "NexAgent Intelligence",
    description: "A context-aware autonomous agent that manages your workspace and executes skills on your behalf.",
    icon: <Orbit className="size-6" />,
    color: "text-purple-600",
    bgColor: "bg-purple-600/10",
  },
  {
    title: "Precision Interface",
    description: "Designed for engineers who demand speed. Minimalist, glassmorphic UI with zero bloat.",
    icon: <MousePointer2 className="size-6" />,
    color: "text-emerald-600",
    bgColor: "bg-emerald-600/10",
  },
]

export function Features6() {
  return (
    <section className="w-full py-24">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
          <div className="inline-block rounded-full bg-primary/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60 border border-primary/10">
            Core Infrastructure
          </div>
          <h2 className="text-4xl font-bold font-headline tracking-tighter sm:text-5xl md:text-6xl">
            Built for <span className="text-muted-foreground/40">Performance.</span>
          </h2>
          <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
            The underlying engine of NxAIO is designed to provide high-fidelity utility services with zero latency.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group relative p-8 rounded-[2.5rem] bg-card border border-primary/5 hover:border-primary/20 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 overflow-hidden"
            >
              <div className="absolute -right-8 -top-8 size-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
              
              <div className={cn("inline-flex p-4 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-500", feature.bgColor, feature.color)}>
                {feature.icon}
              </div>
              
              <h3 className="text-xl font-bold font-headline mb-3 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
