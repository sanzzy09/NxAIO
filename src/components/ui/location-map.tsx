"use client";

import React, { useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationMapProps {
  location: string;
  coordinates: string;
  className?: string;
}

/**
 * LocationMap
 * 
 * An interactive 3D-tilting location card with expandable animated map, 
 * live indicator, and motion-based hover effects.
 */
export function LocationMap({ location, coordinates, className }: LocationMapProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Sensitivity divisor - higher = more subtle tilt
    const rotateX = (y - centerY) / 15;
    const rotateY = (centerX - x) / 15;

    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => setIsHovered(true);
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div
      className={cn("perspective-1000", className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={cardRef}
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transition: isHovered ? "transform 0.05s linear" : "transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)",
          transformStyle: "preserve-3d",
        }}
        className="relative w-[340px] sm:w-[480px] h-[280px] sm:h-[320px] bg-[#0A0A0A] rounded-[2.5rem] border border-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.6)] overflow-hidden group select-none"
      >
        {/* Animated Grid Background */}
        <div className="absolute inset-0 opacity-[0.12]">
          <div className="h-full w-full bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        {/* Ambient Light/Blobs */}
        <div className="absolute top-1/4 left-1/4 size-48 bg-emerald-500/5 rounded-full blur-[80px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 size-64 bg-white/5 rounded-full blur-[100px] animate-pulse delay-1000" />
        
        {/* Z-Layered Perspective Blobs */}
        <div 
          className="absolute top-10 left-10 size-16 bg-white/[0.04] rounded-2xl blur-md transform -rotate-12 group-hover:scale-110 transition-transform duration-700" 
          style={{ transform: 'translateZ(30px)' }} 
        />
        <div 
          className="absolute bottom-20 right-12 size-24 bg-white/[0.02] rounded-3xl blur-xl transform rotate-45 group-hover:scale-125 transition-transform duration-1000" 
          style={{ transform: 'translateZ(50px)' }} 
        />

        {/* Live Indicator Badge */}
        <div 
          className="absolute top-8 right-10 flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/60 backdrop-blur-xl border border-white/5 shadow-2xl" 
          style={{ transform: 'translateZ(40px)' }}
        >
          <div className="relative flex h-2.5 w-2.5">
            <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
            <div className="relative rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">Live Indicator</span>
        </div>

        {/* Center Target & Glow */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'translateZ(60px)' }}>
          <div className="relative">
            {/* Pulsing Aura */}
            <div className="absolute inset-[-50px] bg-emerald-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            {/* Precision Pin */}
            <div className="relative p-3 bg-emerald-500 rounded-full shadow-[0_0_40px_rgba(16,185,129,0.6)] border-2 border-emerald-300/40 transform group-hover:scale-110 transition-transform duration-500">
              <MapPin className="size-6 text-black fill-black" />
            </div>
          </div>
        </div>

        {/* Bottom Location Panel */}
        <div className="absolute bottom-10 left-10 space-y-2.5" style={{ transform: 'translateZ(80px)' }}>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold font-headline text-white tracking-tight leading-none">{location}</h3>
            <p className="text-[11px] font-mono font-bold text-emerald-500/60 uppercase tracking-[0.15em]">{coordinates}</p>
          </div>
          <div className="w-56 h-[1.5px] bg-gradient-to-r from-emerald-500/60 via-emerald-500/10 to-transparent" />
        </div>
        
        {/* Glass Reflection Highlight */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.08] transition-opacity duration-700 pointer-events-none bg-gradient-to-br from-white via-transparent to-transparent" />
      </div>
    </div>
  );
}
