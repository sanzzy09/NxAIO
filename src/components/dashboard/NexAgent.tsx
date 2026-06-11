
'use client';

import React, { useState, useCallback, memo } from 'react';
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

interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: any[];
}

const models = [
  {
    chef: "Google",
    chefSlug: "google",
    id: "google/gemini-2.0-flash-exp:free",
    name: "Gemini 2.0 Flash Exp",
    providers: ["openrouter"],
  },
  {
    chef: "Google",
    chefSlug: "google",
    id: "google/gemma-4-31b-it:free",
    name: "Gemma 4 31B",
    providers: ["openrouter"],
  },
  {
    chef: "NVIDIA",
    chefSlug: "nvidia",
    id: "nvidia/llama-nemotron-rerank-vl-1b-v2:free",
    name: "Llama Nemotron Rerank",
    providers: ["openrouter"],
  },
  {
    chef: "NVIDIA",
    chefSlug: "nvidia",
    id: "nvidia/nemotron-3.5-content-safety:free",
    name: "Nemotron 3.5 Safety",
    providers: ["openrouter"],
  },
  {
    chef: "NVIDIA",
    chefSlug: "nvidia",
    id: "nvidia/nemotron-3-ultra-550b-a55b:free",
    name: "Nemotron 3 Ultra",
    providers: ["openrouter"],
  },
  {
    chef: "NVIDIA",
    chefSlug: "nvidia",
    id: "nvidia/nemotron-3-super-120b-a12b:free",
    name: "Nemotron 3 Super",
    providers: ["openrouter"],
  },
  {
    chef: "Nex AGI",
    chefSlug: "nex-agi",
    id: "nex-agi/nex-n2-pro:free",
    name: "Nex N2 Pro",
    providers: ["openrouter"],
  },
  {
    chef: "OpenRouter",
    chefSlug: "openrouter",
    id: "openrouter/owl-alpha",
    name: "Owl Alpha",
    providers: ["openrouter"],
  },
  {
    chef: "Poolside",
    chefSlug: "poolside",
    id: "poolside/laguna-xs.2:free",
    name: "Laguna XS.2",
    providers: ["openrouter"],
  },
  {
    chef: "Poolside",
    chefSlug: "poolside",
    id: "poolside/laguna-m.1:free",
    name: "Laguna M.1",
    providers: ["openrouter"],
  },
  {
    chef: "OpenAI",
    chefSlug: "openai",
    id: "openai/gpt-oss-120b:free",
    name: "GPT OSS 120B",
    providers: ["openrouter"],
  },
];

const agentToolsConfig = {
  generate_temp_mail: {
    description: 'Provision a disposable identity session with real-time mailbox monitoring.',
    parameters: { type: 'object', properties: {} }
  },
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
  search_media: {
    description: 'Scrape Vidbox/TMDB archives for cinematic metadata and mirrors.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Movie or series title' }
      },
      required: ['query']
    }
  },
  search_anime: {
    description: 'Query Anichin/AnimeXin archives for ongoing and completed series.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Anime title' }
      },
      required: ['query']
    }
  }
};

const agentOutputProtocol = `type AgentResponse = {
  content: string; // The primary natural language response (Markdown Supported)
  toolCalls?: Array<{
    id: string;
    function: {
      name: string;
      arguments: string; // JSON string encoded args
    }
  }>;
}`;

interface ModelItemProps {
  model: (typeof models)[0];
  selectedModel: string;
  onSelect: (id: string) => void;
}

const ModelItem = memo(({ model, selectedModel, onSelect }: ModelItemProps) => {
  const handleSelect = useCallback(
    () => onSelect(model.id),
    [onSelect, model.id]
  );
  return (
    <ModelSelectorItem key={model.id} onSelect={handleSelect} value={model.id} className="group">
      <ModelSelectorLogo provider={model.chefSlug} />
      <ModelSelectorName>{model.name}</ModelSelectorName>
      <ModelSelectorLogoGroup>
        {model.providers.map((provider) => (
          <div key={provider} className="size-4 rounded-full bg-indigo-500/10 flex items-center justify-center border border-background">
             <span className="text-[6px] font-bold uppercase">{provider[0]}</span>
          </div>
        ))}
      </ModelSelectorLogoGroup>
      {selectedModel === model.id ? (
        <CheckIcon className="ml-auto size-3" />
      ) : (
        <div className="ml-auto size-3" />
      )}
    </ModelSelectorItem>
  );
});

ModelItem.displayName = "ModelItem";

export function NexAgent() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: "Hello! I am NexAgent, your AI utility orchestrator. I can generate temporary mailboxes, compose music, or explore movie databases for you. Which neural engine should we use for today's tasks?" 
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(models[0].id);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [view, setView] = useState<'chat' | 'config'>('chat');

  const selectedModelData = models.find((m) => m.id === selectedModel);
  const chefs = [...new Set(models.map((m) => m.chef))];

  const handleModelSelect = useCallback((id: string) => {
    setSelectedModel(id);
    setSelectorOpen(false);
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: input };
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

  const getToolIcon = (name: string) => {
    switch (name) {
      case 'generate_temp_mail': return Database;
      case 'generate_music': return Sparkles;
      case 'search_media': return Search;
      case 'search_anime': return Search;
      default: return Terminal;
    }
  };

  const getToolLabel = (name: string) => {
    switch (name) {
      case 'generate_temp_mail': return "Provisioning Disposable Identity";
      case 'generate_music': return "Composing AI Music Track";
      case 'search_media': return "Searching Vidbox Database";
      case 'search_anime': return "Querying Anichin Archives";
      default: return `Executing Logic: ${name}`;
    }
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
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setView('chat')}
                className={cn(
                  "rounded-full h-8 px-4 gap-2 text-[10px] font-bold uppercase tracking-widest transition-all",
                  view === 'chat' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-secondary"
                )}
              >
                <MessageSquare className="size-3" /> Chat
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setView('config')}
                className={cn(
                  "rounded-full h-8 px-4 gap-2 text-[10px] font-bold uppercase tracking-widest transition-all",
                  view === 'config' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-secondary"
                )}
              >
                <Info className="size-3" /> Intel
              </Button>
            </div>

            <div className="h-6 w-px bg-primary/5 hidden md:block" />

            <ModelSelector open={selectorOpen} onOpenChange={setSelectorOpen}>
              <ModelSelectorTrigger asChild>
                <Button variant="outline" className="h-10 rounded-full border-primary/5 bg-background/50 hover:bg-indigo-500/5 hover:border-indigo-600/20 px-4 min-w-[220px] justify-between group shadow-sm transition-all">
                  <div className="flex items-center gap-2">
                    {selectedModelData?.chefSlug && (
                      <div className="size-5 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                        {selectedModelData.chefSlug === 'google' ? <BrainCircuit className="size-3" /> : <Cpu className="size-3" />}
                      </div>
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-wider">{selectedModelData?.name || "Select Model"}</span>
                  </div>
                  <ChevronDown className="size-3 text-muted-foreground opacity-40 group-hover:opacity-100 transition-opacity" />
                </Button>
              </ModelSelectorTrigger>
              <ModelSelectorContent title="Select Neural Engine">
                <ModelSelectorInput placeholder="Filter neural engines..." />
                <ModelSelectorList>
                  <ModelSelectorEmpty>No engines matching the criteria.</ModelSelectorEmpty>
                  {chefs.map((chef) => (
                    <ModelSelectorGroup heading={chef} key={chef}>
                      {models
                        .filter((m) => m.chef === chef)
                        .map((m) => (
                          <ModelItem
                            key={m.id}
                            model={m}
                            onSelect={handleModelSelect}
                            selectedModel={selectedModel}
                          />
                        ))}
                    </ModelSelectorGroup>
                  ))}
                </ModelSelectorList>
              </ModelSelectorContent>
            </ModelSelector>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 flex flex-col overflow-hidden relative bg-secondary/[0.02]">
        {view === 'chat' ? (
          <>
            <ScrollArea className="flex-1 p-8 h-full">
              <div className="space-y-6 max-w-3xl mx-auto pb-8">
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
                    
                    <div className="space-y-3 max-w-[85%]">
                      {msg.role === 'assistant' && msg.toolCalls && msg.toolCalls.length > 0 && (
                        <ChainOfThought defaultOpen>
                          <ChainOfThoughtHeader />
                          <ChainOfThoughtContent>
                            {msg.toolCalls.map((tool, idx) => (
                              <ChainOfThoughtStep
                                key={idx}
                                icon={getToolIcon(tool.function.name)}
                                label={getToolLabel(tool.function.name)}
                                status="complete"
                              >
                                <ChainOfThoughtSearchResults>
                                  <ChainOfThoughtSearchResult>
                                    ID: {tool.id.slice(0, 8)}
                                  </ChainOfThoughtSearchResult>
                                </ChainOfThoughtSearchResults>
                              </ChainOfThoughtStep>
                            ))}
                          </ChainOfThoughtContent>
                        </ChainOfThought>
                      )}
                      
                      <div className={cn(
                        "p-6 rounded-[1.5rem] shadow-sm",
                        msg.role === 'user' 
                          ? "bg-indigo-600 text-white rounded-tr-none" 
                          : "bg-background border border-primary/5 text-foreground rounded-tl-none"
                      )}>
                        {msg.role === 'user' ? (
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                        ) : (
                          <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-headline prose-headings:font-bold prose-headings:tracking-tight prose-a:text-indigo-600 prose-strong:text-foreground prose-table:border prose-table:border-primary/5 prose-th:bg-secondary/30 prose-th:p-3 prose-td:p-3 prose-td:border prose-td:border-primary/5 prose-li:marker:text-indigo-600 prose-img:rounded-3xl prose-img:shadow-2xl prose-img:border prose-img:border-primary/10 prose-img:max-h-[350px] prose-img:mx-auto">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {loading && (
                  <div className="flex gap-4 animate-fade-in-up">
                    <div className="size-10 rounded-2xl bg-secondary text-primary flex items-center justify-center animate-pulse">
                      <Bot className="size-5" />
                    </div>
                    <div className="space-y-3 max-w-[80%]">
                      <ChainOfThought defaultOpen>
                        <ChainOfThoughtHeader />
                        <ChainOfThoughtContent>
                          <ChainOfThoughtStep
                            icon={BrainCircuit}
                            label="Analyzing Natural Language Input"
                            status="complete"
                          />
                          <ChainOfThoughtStep
                            icon={Loader2}
                            label="Synthesizing Neural Response"
                            status="active"
                          />
                        </ChainOfThoughtContent>
                      </ChainOfThought>
                      
                      <div className="bg-background border border-primary/5 p-4 rounded-[1.5rem] rounded-tl-none flex items-center gap-3">
                         <div className="flex gap-1">
                            <div className="size-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <div className="size-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <div className="size-1.5 bg-indigo-600 rounded-full animate-bounce" />
                         </div>
                         <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Orchestrating...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-8 border-t border-primary/5 bg-secondary/10 backdrop-blur-md">
               <form onSubmit={handleSend} className="max-w-3xl mx-auto flex gap-3">
                  <div className="relative flex-1 group">
                     <input 
                       value={input}
                       onChange={(e) => setInput(e.target.value)}
                       disabled={loading}
                       placeholder="Ask NexAgent to manage your tools..."
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
                 NexAgent Intelligence v1.5 • Rich Markdown Enabled
               </p>
            </div>
          </>
        ) : (
          <ScrollArea className="flex-1 p-8">
            <div className="max-w-3xl mx-auto">
              <Agent>
                <AgentHeader 
                  name="NexAgent Utility Orchestrator" 
                  model={selectedModelData?.name} 
                />
                <AgentContent>
                  <AgentInstructions>
                    You are NexAgent, the intelligent orchestrator of NxAIO. You help users manage their utilities by understanding natural language tasks and chaining the most effective tools. You maintain a premium, helpful, and concise tone while prioritizing automation.
                  </AgentInstructions>
                  
                  <AgentTools defaultValue={["generate_music"]}>
                    <AgentTool 
                      value="generate_temp_mail" 
                      tool={agentToolsConfig.generate_temp_mail} 
                    />
                    <AgentTool 
                      value="generate_music" 
                      tool={agentToolsConfig.generate_music} 
                    />
                    <AgentTool 
                      value="search_media" 
                      tool={agentToolsConfig.search_media} 
                    />
                    <AgentTool 
                      value="search_anime" 
                      tool={agentToolsConfig.search_anime} 
                    />
                  </AgentTools>

                  <AgentOutput schema={agentOutputProtocol} />
                </AgentContent>
              </Agent>
              
              <div className="mt-8 p-6 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 flex items-center gap-4">
                 <Info className="size-5 text-indigo-600 opacity-40" />
                 <p className="text-[11px] text-muted-foreground leading-relaxed">
                   This configuration defines the core logic boundary for the current session. The agent is strictly bound to these response protocols to ensure system stability and rich formatting.
                 </p>
              </div>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
