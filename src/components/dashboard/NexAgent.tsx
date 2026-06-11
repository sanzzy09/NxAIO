'use client';

import React, { useState, useCallback, memo, useEffect, useRef } from 'react';
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
  BrainCircuit,
  CheckIcon,
  ChevronDown,
  Search,
  Database,
  Info,
  MessageSquare
} from "lucide-react";
import { nexAgentChat } from "@/app/actions/nexagent";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useUser, useFirestore } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorLogoGroup,
  ModelSelectorName,
  ModelSelectorTrigger,
} from "@/components/ai-elements/model-selector";
import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtSearchResult,
  ChainOfThoughtSearchResults,
  ChainOfThoughtStep,
} from "@/components/ai-elements/chain-of-thought";
import {
  Agent,
  AgentContent,
  AgentHeader,
  AgentInstructions,
  AgentOutput,
  AgentTool,
  AgentTools,
} from "@/components/ai-elements/agent";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: any[];
}

const models = [
  { chef: "NVIDIA", chefSlug: "nvidia", id: "nvidia/llama-nemotron-rerank-vl-1b-v2:free", name: "Llama Nemotron Rerank", providers: ["openrouter"] },
  { chef: "Nex AGI", chefSlug: "nex-agi", id: "nex-agi/nex-n2-pro:free", name: "Nex N2 Pro", providers: ["openrouter"] },
  { chef: "NVIDIA", chefSlug: "nvidia", id: "nvidia/nemotron-3.5-content-safety:free", name: "Nemotron 3.5 Safety", providers: ["openrouter"] },
  { chef: "NVIDIA", chefSlug: "nvidia", id: "nvidia/nemotron-3-ultra-550b-a55b:free", name: "Nemotron 3 Ultra", providers: ["openrouter"] },
  { chef: "OpenRouter", chefSlug: "openrouter", id: "openrouter/owl-alpha", name: "Owl Alpha", providers: ["openrouter"] },
  { chef: "Poolside", chefSlug: "poolside", id: "poolside/laguna-xs.2:free", name: "Laguna XS.2", providers: ["openrouter"] },
  { chef: "Poolside", chefSlug: "poolside", id: "poolside/laguna-m.1:free", name: "Laguna M.1", providers: ["openrouter"] },
  { chef: "Google", chefSlug: "google", id: "google/gemma-4-31b-it:free", name: "Gemma 4 31B", providers: ["openrouter"] },
  { chef: "NVIDIA", chefSlug: "nvidia", id: "nvidia/nemotron-3-super-120b-a12b:free", name: "Nemotron 3 Super", providers: ["openrouter"] },
  { chef: "OpenAI", chefSlug: "openai", id: "openai/gpt-oss-120b:free", name: "GPT OSS 120B", providers: ["openrouter"] }
];

const SUGGESTIONS = [
  "Cari film action terbaru",
  "Buat email sementara baru",
  "Rekomendasi anime isekai",
  "Generate lagu lo-fi santai",
  "Hapus background foto saya",
  "Cari series horor terbaik"
];

const agentToolsConfig = {
  generate_temp_mail: { description: 'Provision a disposable identity session with real-time mailbox monitoring.', parameters: { type: 'object', properties: {} } },
  generate_music: {
    description: 'Trigger a high-fidelity AI music composition job with custom styles.',
    parameters: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'Musical style and vibe description' },
        title: { type: 'string', description: 'Title for the track' }
      },
      required: ['prompt']
    }
  },
  search_media: { description: 'Scrape Vidbox/TMDB archives for cinematic metadata and mirrors.', parameters: { type: 'object', properties: { query: { type: 'string', description: 'Movie title' } } } }
};

export function NexAgent() {
  const { user } = useUser();
  const db = useFirestore();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I am NexAgent. I can generate mailboxes, compose music, or explore movie databases. How can I help you?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(models[0].id);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [view, setView] = useState<'chat' | 'config'>('chat');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const selectedModelData = models.find((m) => m.id === selectedModel);
  const chefs = Array.from(new Set(models.map((m) => m.chef)));

  const handleSend = async (e?: React.FormEvent, customInput?: string) => {
    e?.preventDefault();
    const finalInput = customInput || input;
    if (!finalInput.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: finalInput };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await nexAgentChat(newMessages, selectedModel);
      setMessages(prev => [...prev, response as Message]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSend(undefined, suggestion);
  };

  return (
    <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md overflow-hidden rounded-[2.5rem] flex flex-col h-[750px]">
      <CardHeader className="p-8 pb-6 border-b border-primary/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
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
          
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-secondary/30 p-1 rounded-full border border-primary/5">
              <Button variant="ghost" size="sm" onClick={() => setView('chat')} className={cn("rounded-full h-8 px-4 gap-2 text-[10px] font-bold uppercase", view === 'chat' ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
                <MessageSquare className="size-3" /> Chat
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setView('config')} className={cn("rounded-full h-8 px-4 gap-2 text-[10px] font-bold uppercase", view === 'config' ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
                <Info className="size-3" /> Intel
              </Button>
            </div>
            <ModelSelector open={selectorOpen} onOpenChange={setSelectorOpen}>
              <ModelSelectorTrigger asChild>
                <Button variant="outline" className="h-10 rounded-full border-primary/5 bg-background/50 hover:bg-indigo-500/5 px-4 min-w-[200px] justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider">{selectedModelData?.name || "Select Engine"}</span>
                  <ChevronDown className="size-3 opacity-40" />
                </Button>
              </ModelSelectorTrigger>
              <ModelSelectorContent title="Select Engine">
                <ModelSelectorInput placeholder="Filter engines..." />
                <ModelSelectorList>
                  <ModelSelectorEmpty>No engines found.</ModelSelectorEmpty>
                  {chefs.map((chef) => (
                    <ModelSelectorGroup heading={chef} key={chef}>
                      {models
                        .filter((m) => m.chef === chef)
                        .map((m) => (
                          <ModelSelectorItem 
                            key={m.id} 
                            onSelect={() => { setSelectedModel(m.id); setSelectorOpen(false); }} 
                            value={m.id}
                            className="group"
                          >
                            <ModelSelectorLogo provider={m.chefSlug} />
                            <ModelSelectorName>{m.name}</ModelSelectorName>
                            {selectedModel === m.id && <CheckIcon className="ml-auto size-4" />}
                          </ModelSelectorItem>
                        ))}
                    </ModelSelectorGroup>
                  ))}
                </ModelSelectorList>
              </ModelSelectorContent>
            </ModelSelector>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 flex flex-col overflow-hidden bg-secondary/[0.02]">
        {view === 'chat' ? (
          <>
            <ScrollArea className="flex-1 p-8 h-full">
              <div className="space-y-6 max-w-3xl mx-auto pb-8">
                {messages.map((msg, i) => (
                  <div key={i} className={cn("flex gap-4 animate-fade-in-up", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                    <div className={cn("size-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm", msg.role === 'user' ? "bg-indigo-600 text-white" : "bg-secondary text-primary")}>
                      {msg.role === 'user' ? <User className="size-5" /> : <Bot className="size-5" />}
                    </div>
                    <div className="space-y-3 max-w-[90%] md:max-w-[85%]">
                      {msg.role === 'assistant' && msg.toolCalls && msg.toolCalls.length > 0 && (
                        <ChainOfThought defaultOpen>
                          <ChainOfThoughtHeader />
                          <ChainOfThoughtContent>
                            <ChainOfThoughtStep label="Analyzing Natural Language Input" status="complete" />
                            {msg.toolCalls.map((tool: any, idx: number) => (
                              <ChainOfThoughtStep 
                                key={idx} 
                                label={`Executing: ${tool.function.name.replace(/_/g, ' ')}`} 
                                description={`Provisioning underlying utility logic for ${tool.function.name}...`}
                                status="complete" 
                              />
                            ))}
                            <ChainOfThoughtStep label="Synthesizing Neural Response" status="complete" />
                          </ChainOfThoughtContent>
                        </ChainOfThought>
                      )}
                      <div className={cn("p-6 rounded-[1.5rem] shadow-sm", msg.role === 'user' ? "bg-indigo-600 text-white rounded-tr-none" : "bg-background border border-primary/5 rounded-tl-none")}>
                        <div className="prose prose-sm dark:prose-invert max-w-none 
                          prose-img:rounded-[1.5rem] prose-img:shadow-2xl prose-img:border prose-img:border-primary/5 prose-img:mx-auto prose-img:max-h-[350px] prose-img:object-cover
                          prose-h3:text-xl prose-h3:font-bold prose-h3:font-headline prose-h3:mb-2 prose-h3:tracking-tight
                          prose-li:text-[11px] prose-li:font-medium prose-li:text-muted-foreground/80
                          prose-table:border-collapse prose-th:border-primary/5 prose-td:border-primary/5 prose-hr:border-primary/10">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              table: ({ children }) => (
                                <div className="w-full overflow-x-auto my-6 rounded-2xl border border-primary/5 bg-secondary/10 shadow-inner">
                                  <table className="w-full text-left border-collapse min-w-[500px]">
                                    {children}
                                  </table>
                                </div>
                              ),
                              thead: ({ children }) => (
                                <thead className="bg-secondary/30 border-b border-primary/5">
                                  {children}
                                </thead>
                              ),
                              th: ({ children }) => (
                                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                                  {children}
                                </th>
                              ),
                              td: ({ children }) => (
                                <td className="px-5 py-3 text-xs font-medium border-t border-primary/5 align-top">
                                  {children}
                                </td>
                              ),
                              tr: ({ children }) => (
                                <tr className="hover:bg-primary/[0.02] transition-colors">
                                  {children}
                                </tr>
                              ),
                              h3: ({ children }) => (
                                <h3 className="mt-4 border-l-4 border-indigo-500 pl-4 py-1 bg-indigo-500/5 rounded-r-xl">
                                  {children}
                                </h3>
                              )
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-4 animate-fade-in-up">
                    <div className="size-10 rounded-2xl bg-secondary text-primary flex items-center justify-center animate-pulse"><Bot className="size-5" /></div>
                    <div className="space-y-3 max-w-[80%]">
                      <div className="bg-background border border-primary/5 p-4 rounded-[1.5rem] flex items-center gap-3">
                         <Loader2 className="size-4 animate-spin text-indigo-600" />
                         <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">NexAgent is Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="p-8 border-t border-primary/5 bg-secondary/10 backdrop-blur-md space-y-4">
               <div className="max-w-3xl mx-auto">
                 <Suggestions>
                   {SUGGESTIONS.map((s) => (
                     <Suggestion key={s} suggestion={s} onClick={handleSuggestionClick} disabled={loading} />
                   ))}
                 </Suggestions>
               </div>
               <form onSubmit={handleSend} className="max-w-3xl mx-auto flex gap-3">
                  <input 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    disabled={loading} 
                    placeholder="Command NexAgent..." 
                    className="w-full h-14 pl-6 pr-12 rounded-2xl bg-background border border-primary/5 focus:outline-none shadow-inner" 
                  />
                  <Button type="submit" disabled={loading || !input.trim()} className="size-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl transition-transform active:scale-95">
                    <Send className="size-5" />
                  </Button>
               </form>
            </div>
          </>
        ) : (
          <ScrollArea className="flex-1 p-8">
            <div className="max-w-3xl mx-auto">
              <Agent>
                <AgentHeader name="NexAgent Utility Orchestrator" model={selectedModelData?.name} />
                <AgentContent>
                  <AgentInstructions>You are NexAgent, the premium orchestrator of NxAIO. Your goal is to deliver high-fidelity, visual, Indonesian-optimized utility responses using Markdown. prioritized Card Layouts for media search results.</AgentInstructions>
                  <AgentTools defaultValue={["generate_music"]}>
                    <AgentTool value="generate_temp_mail" tool={agentToolsConfig.generate_temp_mail} />
                    <AgentTool value="generate_music" tool={agentToolsConfig.generate_music} />
                    <AgentTool value="search_media" tool={agentToolsConfig.search_media} />
                  </AgentTools>
                  <AgentOutput schema={`{
  role: "assistant",
  content: "Markdown string with Visual Cards or Data Tables",
  toolCalls: Array<ToolCall>
}`} />
                </AgentContent>
              </Agent>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
