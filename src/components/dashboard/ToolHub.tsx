'use client';

import React from 'react';
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { 
  Zap, 
  Eye, 
  Code2, 
  ArrowRight,
  DownloadCloud,
  Tv,
  Clapperboard,
  Waves,
  Mic,
  ScanText,
  Sparkles,
  CloudUpload,
  Eraser,
  Film
} from "lucide-react";

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const tools: Tool[] = [
  {
    id: "nimegami",
    name: "Nimegami Explorer",
    description: "Premium database for Anime, Live Action, and J-Dramas with Bluray support.",
    icon: <Film className="size-6" />,
    color: "bg-purple-50 text-purple-600"
  },
  {
    id: "bypass",
    name: "Adlink Bypasser",
    description: "Instantly skip annoying shortlinks, redirects, and timed ads.",
    icon: <Zap className="size-6" />,
    color: "bg-yellow-50 text-yellow-600"
  },
  {
    id: "hosting",
    name: "FileGoat Hosting",
    description: "Decentralized file storage with custom expiration buckets.",
    icon: <CloudUpload className="size-6" />,
    color: "bg-indigo-50 text-indigo-600"
  },
  {
    id: "remover",
    name: "AI Background Remover",
    description: "Isolate subjects with high precision using intelligent edge detection.",
    icon: <Eraser className="size-6" />,
    color: "bg-pink-50 text-pink-600"
  },
  {
    id: "anichin",
    name: "Anichin Explorer",
    description: "Premium anime database with high-speed streaming and downloads.",
    icon: <Sparkles className="size-6" />,
    color: "bg-orange-50 text-orange-600"
  },
  {
    id: "ocr",
    name: "AI OCR Extractor",
    description: "Extract clean text from screenshots, photos, and PDF files.",
    icon: <ScanText className="size-6" />,
    color: "bg-cyan-50 text-cyan-600"
  },
  {
    id: "transcribe",
    name: "AI Media Transcriber",
    description: "TikTok, Reels, and YouTube audio to text conversion.",
    icon: <Mic className="size-6" />,
    color: "bg-emerald-50 text-emerald-600"
  },
  {
    id: "donghua",
    name: "Donghua Stream Explorer",
    description: "Premium Chinese animation hub with multi-server streaming.",
    icon: <Waves className="size-6" />,
    color: "bg-blue-50 text-blue-600"
  },
  {
    id: "lk21",
    name: "LK21 & Drama Explorer",
    description: "Search and browse latest movies and series via LK21.",
    icon: <Clapperboard className="size-6" />,
    color: "bg-red-50 text-red-600"
  },
  {
    id: "previewer",
    name: "Live Creative Previewer",
    description: "Real-time mockups for your processed content.",
    icon: <Eye className="size-6" />,
    color: "bg-purple-50 text-purple-600"
  },
  {
    id: "downloader",
    name: "AIO Media Downloader",
    description: "Extract video and audio from TikTok, IG, and Twitter.",
    icon: <DownloadCloud className="size-6" />,
    color: "bg-emerald-50 text-emerald-600"
  },
  {
    id: "anime",
    name: "Anime Explorer (AnimeXin)",
    description: "Explore, search, and stream anime details via AnimeXin.",
    icon: <Tv className="size-6" />,
    color: "bg-orange-50 text-orange-600"
  },
  {
    id: "snippets",
    name: "Interactive Snippet Manager",
    description: "Simplified storage with modern code highlighting.",
    icon: <Code2 className="size-6" />,
    color: "bg-cyan-50 text-cyan-600"
  },
  {
    id: "logic",
    name: "Logic Command Center",
    description: "Chain utilities with natural language commands.",
    icon: <Zap className="size-6" />,
    color: "bg-orange-50 text-orange-600"
  }
];

export function ToolHub({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onSelect(tool.id)}
          className="text-left group outline-none h-full"
        >
          <SpotlightCard className="p-8 h-full flex flex-col justify-between border-primary/5 hover:border-primary/10 transition-all duration-300">
            <div>
              <div className={`p-3 rounded-2xl w-fit mb-6 transition-transform group-hover:scale-110 duration-500 ${tool.color}`}>
                {tool.icon}
              </div>
              <h3 className="font-headline text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                {tool.name}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {tool.description}
              </p>
            </div>
            <div className="flex items-center gap-2 mt-8 text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 duration-300">
              Launch Tool <ArrowRight className="size-3" />
            </div>
          </SpotlightCard>
        </button>
      ))}
    </div>
  );
}