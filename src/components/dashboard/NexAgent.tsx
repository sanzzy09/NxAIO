
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  Bot, 
  Send, 
  Loader2, 
  User, 
  Zap, 
  Terminal,
  Cpu,
  BrainCircuit
} from "lucide-react";
import { nexAgentChat } from "@/app/actions/nexagent";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: any[];
}

export function NexAgent() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: "Hello! I am NexAgent, your AI utility orchestrator. How can I help you today? I can generate temp mails, create music, or find movies for you." 
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await nexAgentChat(newMessages);
      setMessages(prev => [...prev, response as Message]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md overflow-hidden rounded-[2.5rem] flex flex-col h-[700px]">
      <CardHeader className="p-8 pb-6 border-b border-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-600 rounded-xl relative">
              <Sparkles className="size-6" />
              <div className="absolute -top-1 -right-1 size-3 bg-emerald-500 rounded-full border-2 border-background animate-pulse" />
            </div>
            <div>
              <CardTitle className="font-headline text-2xl">NexAgent Core</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <BrainCircuit className="size-3" /> Autonomous Utility Orchestrator
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-primary/5">
             <Cpu className="size-3 text-indigo-600" />
             <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Llama 3 Instruct</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 flex flex-col overflow-hidden relative">
        <ScrollArea className="flex-1 p-8 h-full">
          <div className="space-y-6 max-w-3xl mx-auto">
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={cn(
                  "flex gap-4 animate-fade-in-up",
                  msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={cn(
                  "size-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm",
                  msg.role === 'user' ? "bg-indigo-600 text-white" : "bg-secondary text-primary"
                )}>
                  {msg.role === 'user' ? <User className="size-5" /> : <Bot className="size-5" />}
                </div>
                
                <div className="space-y-3 max-w-[80%]">
                  <div className={cn(
                    "p-5 rounded-[1.5rem] text-sm leading-relaxed shadow-sm",
                    msg.role === 'user' 
                      ? "bg-indigo-600 text-white rounded-tr-none" 
                      : "bg-background border border-primary/5 text-foreground rounded-tl-none"
                  )}>
                    {msg.content}
                  </div>
                  
                  {msg.toolCalls && (
                    <div className="flex flex-wrap gap-2">
                      {msg.toolCalls.map((tool: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 px-3 py-1 rounded-lg bg-secondary/50 border border-primary/5 text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                          <Terminal className="size-3" /> Tool Executed: {tool.function.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-4 animate-fade-in-up">
                <div className="size-10 rounded-2xl bg-secondary text-primary flex items-center justify-center animate-pulse">
                  <Bot className="size-5" />
                </div>
                <div className="bg-background border border-primary/5 p-4 rounded-[1.5rem] rounded-tl-none flex items-center gap-3">
                   <div className="flex gap-1">
                      <div className="size-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="size-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="size-1.5 bg-indigo-600 rounded-full animate-bounce" />
                   </div>
                   <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Orchestrating...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-8 border-t border-primary/5 bg-secondary/10 backdrop-blur-md">
           <form onSubmit={handleSend} className="max-w-3xl mx-auto flex gap-3">
              <div className="relative flex-1 group">
                 <input 
                   value={input}
                   onChange={(e) => setInput(e.target.value)}
                   disabled={loading}
                   placeholder="Ask NexAgent to generate music, a temp mail, or find a movie..."
                   className="w-full h-14 pl-6 pr-12 rounded-2xl bg-background border border-primary/5 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all text-sm shadow-inner"
                 />
                 <div className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600/5 text-indigo-600 rounded-lg group-focus-within:bg-indigo-600/10 transition-colors">
                    <Zap className="size-4" />
                 </div>
              </div>
              <Button 
                type="submit" 
                disabled={loading || !input.trim()}
                className="size-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
              >
                {loading ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
              </Button>
           </form>
           <p className="mt-4 text-center text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-40">
             NexAgent Skill Integration v1.0 • Powered by OpenRouter
           </p>
        </div>
      </CardContent>
    </Card>
  );
}
