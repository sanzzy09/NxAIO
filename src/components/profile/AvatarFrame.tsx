"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export type FrameId = 'none' | 'tech' | 'royal' | 'mystic' | 'emerald' | 'crimson';

interface AvatarFrameProps {
  src?: string | null;
  fallback?: string;
  frameId?: FrameId;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'w-10 h-10',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
  xl: 'w-32 h-32',
};

export function AvatarFrame({ src, fallback, frameId = 'none', className, size = 'md' }: AvatarFrameProps) {
  const containerSize = sizeClasses[size];

  const renderFrameOverlay = () => {
    if (frameId === 'none') return null;

    const svgProps = {
      className: "absolute inset-[-15%] w-[130%] h-[130%] pointer-events-none overflow-visible z-10",
      viewBox: "0 0 100 100",
      fill: "none",
      preserveAspectRatio: "xMidYMid meet"
    };

    switch (frameId) {
      case 'tech':
        return (
          <svg {...svgProps}>
            <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="2" className="text-blue-500/30" />
            <path d="M50 2L55 10H45L50 2Z" fill="currentColor" className="text-blue-500" />
            <path d="M50 98L45 90H55L50 98Z" fill="currentColor" className="text-blue-500" />
            <path d="M2 50L10 45V55L2 50Z" fill="currentColor" className="text-blue-500" />
            <path d="M98 50L90 55V45L98 50Z" fill="currentColor" className="text-blue-500" />
            <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="text-blue-400/50" />
          </svg>
        );
      case 'royal':
        return (
          <svg {...svgProps}>
            <circle cx="50" cy="50" r="47" stroke="#FFD700" strokeWidth="3" />
            <circle cx="50" cy="50" r="49" stroke="#B8860B" strokeWidth="1" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <rect
                key={deg}
                x="47.5"
                y="0"
                width="5"
                height="5"
                fill="#FF0000"
                transform={`rotate(${deg} 50 50)`}
                rx="1"
              />
            ))}
          </svg>
        );
      case 'mystic':
        return (
          <svg {...svgProps}>
            <defs>
              <linearGradient id="mysticGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8A2BE2" />
                <stop offset="100%" stopColor="#4B0082" />
              </linearGradient>
              <filter id="mysticGlow">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <circle cx="50" cy="50" r="48" stroke="url(#mysticGradient)" strokeWidth="3" filter="url(#mysticGlow)" />
            {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((deg) => (
              <path key={deg} d="M50 2 L53 10 L47 10 Z" fill="#8A2BE2" transform={`rotate(${deg} 50 50)`} />
            ))}
          </svg>
        );
      case 'emerald':
        return (
          <svg {...svgProps}>
            <circle cx="50" cy="50" r="47" stroke="#10B981" strokeWidth="4" fill="none" />
            <path d="M50 2L56 12H44L50 2Z" fill="#10B981" />
            <path d="M50 98L44 88H56L50 98Z" fill="#10B981" />
            <path d="M2 50L12 44V56L2 50Z" fill="#10B981" />
            <path d="M98 50L88 56V44L98 50Z" fill="#10B981" />
          </svg>
        );
      case 'crimson':
        return (
          <svg {...svgProps}>
            <circle cx="50" cy="50" r="48" stroke="#DC2626" strokeWidth="2" strokeDasharray="10 5" />
            <circle cx="50" cy="50" r="45" stroke="#7F1D1D" strokeWidth="1" />
            <path d="M50 3L54 12H46Z" fill="#DC2626" />
            <path d="M50 97L46 88H54Z" fill="#DC2626" />
            <path d="M3 50L12 46V54Z" fill="#DC2626" />
            <path d="M97 50L88 54V46Z" fill="#DC2626" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn('relative flex items-center justify-center shrink-0 isolate overflow-visible', containerSize, className)}>
      {renderFrameOverlay()}
      <Avatar className="w-full h-full z-0 overflow-hidden ring-offset-background">
        <AvatarImage src={src || undefined} className="object-cover" />
        <AvatarFallback className="bg-primary/5 text-primary/40 font-headline font-bold text-xs uppercase">
          {fallback || '?'}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}