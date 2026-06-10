"use client"

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Command, Send, Loader2 } from "lucide-react";
import { aiLogicCommandAssistant } from "@/ai/flows/ai-logic-command-assistant-flow";

export function AIAssistant() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setResponse(null);
    try {
      const result = await aiLogicCommandAssistant(input);
      setResponse(result);
    } catch (error) {
      setResponse("I encountered an error processing that request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full border-none shadow-sm bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-primary rounded-lg text-primary-foreground">
            <Sparkles className="w-4 h-4" />
          </div>
          <CardTitle className="font-headline">Command Assistant</CardTitle>
        </div>
        <CardDescription>
          Tell NxAIO what you need to do, and I'll handle the logic.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g., 'Optimize this photo for Instagram and show me a preview'"
              className="bg-background border-none pr-10 h-12 shadow-inner"
            />
            <Command className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-50" />
          </div>
          <Button type="submit" size="icon" className="h-12 w-12" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>

        {response && (
          <div className="p-4 rounded-xl bg-muted/30 border border-primary/5 animate-fade-in-up">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{response}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
