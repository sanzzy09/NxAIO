
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
    switch (frameId) {
      case 'tech':
        return (
          <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" viewBox="0 0 100 100" fill="none">
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
          <svg className="absolute inset-0 w-full h-full scale-[1.15] pointer-events-none overflow-visible" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="46" stroke="#FFD700" strokeWidth="4" />
            <circle cx="50" cy="50" r="48" stroke="#B8860B" strokeWidth="1" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <rect
                key={deg}
                x="47"
                y="0"
                width="6"
                height="6"
                fill="#FF0000"
                transform={`rotate(${deg} 50 50)`}
                rx="1"
              />
            ))}
          </svg>
        );
      case 'mystic':
        return (
          <svg className="absolute inset-0 w-full h-full scale-[1.1] pointer-events-none overflow-visible" viewBox="0 0 100 100" fill="none">
            <defs>
              <linearGradient id="mysticGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8A2BE2" />
                <stop offset="100%" stopColor="#4B0082" />
              </linearGradient>
              <filter id="mysticGlow">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <circle cx="50" cy="50" r="47" stroke="url(#mysticGradient)" strokeWidth="3" filter="url(#mysticGlow)" />
            <path d="M50 0 L53 10 L47 10 Z" fill="#8A2BE2" transform="rotate(22.5 50 50)" />
            <path d="M50 0 L53 10 L47 10 Z" fill="#8A2BE2" transform="rotate(67.5 50 50)" />
            <path d="M50 0 L53 10 L47 10 Z" fill="#8A2BE2" transform="rotate(112.5 50 50)" />
            <path d="M50 0 L53 10 L47 10 Z" fill="#8A2BE2" transform="rotate(157.5 50 50)" />
            <path d="M50 0 L53 10 L47 10 Z" fill="#8A2BE2" transform="rotate(202.5 50 50)" />
            <path d="M50 0 L53 10 L47 10 Z" fill="#8A2BE2" transform="rotate(247.5 50 50)" />
            <path d="M50 0 L53 10 L47 10 Z" fill="#8A2BE2" transform="rotate(292.5 50 50)" />
            <path d="M50 0 L53 10 L47 10 Z" fill="#8A2BE2" transform="rotate(337.5 50 50)" />
          </svg>
        );
      case 'emerald':
        return (
          <svg className="absolute inset-0 w-full h-full scale-[1.12] pointer-events-none overflow-visible" viewBox="0 0 100 100" fill="none">
            <rect x="10" y="10" width="80" height="80" rx="40" stroke="#10B981" strokeWidth="4" />
            <path d="M50 2L58 15H42L50 2Z" fill="#10B981" />
            <path d="M50 98L42 85H58L50 98Z" fill="#10B981" />
            <path d="M2 50L15 42V58L2 50Z" fill="#10B981" />
            <path d="M98 50L85 58V42L98 50Z" fill="#10B981" />
          </svg>
        );
      case 'crimson':
        return (
          <svg className="absolute inset-0 w-full h-full scale-[1.08] pointer-events-none overflow-visible" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="48" stroke="#DC2626" strokeWidth="2" strokeDasharray="10 5" />
            <circle cx="50" cy="50" r="44" stroke="#7F1D1D" strokeWidth="1" />
            <path d="M50 5L55 15H45Z" fill="#DC2626" />
            <path d="M50 95L45 85H55Z" fill="#DC2626" />
            <path d="M5 50L15 45V55Z" fill="#DC2626" />
            <path d="M95 50L85 55V45Z" fill="#DC2626" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn('relative flex items-center justify-center shrink-0', containerSize, className)}>
      {renderFrameOverlay()}
      <Avatar className={cn('w-full h-full', frameId !== 'none' && 'p-[4%]')}>
        <AvatarImage src={src || undefined} className="object-cover rounded-full" />
        <AvatarFallback className="bg-primary/5 text-primary/40 font-headline font-bold">
          {fallback || '?'}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}
