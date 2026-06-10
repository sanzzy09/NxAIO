"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Code2, Copy, Search, Terminal, Plus, Loader2 } from "lucide-react";
import { generateSnippet } from "@/ai/flows/interactive-snippet-generator-flow";

export function SnippetManager() {
  const [prompt, setPrompt] = useState("");
  const [snippet, setSnippet] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const res = await generateSnippet({ promptDescription: prompt });
      setSnippet(res.snippet);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-sm bg-card/50">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="font-headline">Interactive Snippet Manager</CardTitle>
            <CardDescription>Quick code storage and AI generation.</CardDescription>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input 
            placeholder="Search or describe a new snippet..." 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="bg-background/50 border-none h-11"
          />
          <Button onClick={handleGenerate} disabled={loading} className="h-11 px-6">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Gen"}
          </Button>
        </div>

        <div className="rounded-xl overflow-hidden bg-[#1e1e1e] text-white p-4 font-code text-xs relative group min-h-[160px]">
          <div className="absolute top-3 left-3 flex gap-1.5 opacity-50">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 right-2 text-white/40 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => snippet && navigator.clipboard.writeText(snippet)}
          >
            <Copy className="w-3.5 h-3.5" />
          </Button>

          <div className="mt-6">
            {snippet ? (
              <pre className="whitespace-pre-wrap animate-fade-in-up">{snippet}</pre>
            ) : (
              <div className="h-24 flex items-center justify-center text-white/20 italic">
                {loading ? "Synthesizing logic..." : "No snippet active. Describe one above."}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
