"use client"

import React from 'react';
import { Card } from "@/components/ui/card";
import { 
  Zap, 
  Eye, 
  Code2, 
  LayoutGrid, 
  Image as ImageIcon,
  MousePointer2,
  ArrowRight
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
    id: "optimizer",
    name: "Ultra-Fast Image Optimizer",
    description: "Drag-and-drop compression and social-ready cropping.",
    icon: <ImageIcon className="w-6 h-6" />,
    color: "bg-blue-50 text-blue-600"
  },
  {
    id: "previewer",
    name: "Live Creative Previewer",
    description: "Real-time mockups for your processed content.",
    icon: <Eye className="w-6 h-6" />,
    color: "bg-purple-50 text-purple-600"
  },
  {
    id: "snippets",
    name: "Interactive Snippet Manager",
    description: "Simplified storage with modern code highlighting.",
    icon: <Code2 className="w-6 h-6" />,
    color: "bg-green-50 text-green-600"
  },
  {
    id: "logic",
    name: "Logic Command Center",
    description: "Chain utilities with natural language commands.",
    icon: <Zap className="w-6 h-6" />,
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
          className="text-left group tool-grid-item h-full"
        >
          <Card className="p-6 h-full flex flex-col justify-between border-none shadow-sm hover:shadow-md transition-all">
            <div>
              <div className={`p-3 rounded-xl w-fit mb-4 ${tool.color}`}>
                {tool.icon}
              </div>
              <h3 className="font-headline text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                {tool.name}
              </h3>
              <p className="text-muted-foreground text-sm leading-snug">
                {tool.description}
              </p>
            </div>
            <div className="flex items-center gap-2 mt-6 text-xs font-medium uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
              Launch Tool <ArrowRight className="w-3 h-3" />
            </div>
          </Card>
        </button>
      ))}
    </div>
  );
}
