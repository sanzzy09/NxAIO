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
  MessageSquare,
  Code2,
  Settings2,
  Globe,
  CornerDownLeft,
  GlobeIcon
} from "lucide-react";
import { nexAgentChat } from "@/app/actions/nexagent";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useUser, useFirestore } from "@/firebase";
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
import {
  Context,
  ContextCacheUsage,
  ContextContent,
  ContextContentBody,
  ContextContentFooter,
  ContextContentHeader,
  ContextInputUsage,
  ContextOutputUsage,
  ContextReasoningUsage,
  ContextTrigger,
} from "@/components/ai-elements/context";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  PromptInputButton,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
  PromptInputActionAddAttachments,
  PromptInputActionAddScreenshot,
} from "@/components/ai-elements/prompt-input";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: any[];
}

const models = [
  { chef: "NVIDIA", chefSlug: "nvidia", id: "nvidia/llama-nemotron-rerank-vl-1b-v2:free", name: "Llama Nemotron Rerank", providers: ["openrouter"] },
  { chef: "Nex AGI", chefSlug: "nex-agi", id: "nex-agi/nex-n2-pro:free", name: "Nex N2 Pro", providers: ["openrouter"] },
  { chef: "OpenAI", chefSlug: "openai", id: "openai/gpt-4o-mini", name: "GPT-4o Mini", providers: ["openai"] },
  { chef: "Google", chefSlug: "google", id: "google/gemma-4-31b-it:free", name: "Gemma 4 31B", providers: ["openrouter"] },
  { chef: "OpenAI", chefSlug: "openai", id: "openai/gpt-oss-120b:free", name: "GPT OSS 120B", providers: ["openrouter"] }
];

const SUGGESTIONS = [
  "Cari film action terbaru",
  "Buat email sementara baru",
  "Rekomendasi anime isekai",
  "Generate lagu lo-fi santai",
  "Hapus background foto saya"
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
  search_media: { description: 'Scrape Vidbox/TMDB archives for cinematic metadata and mirrors.', parameters: { type: 'object', properties: { query: { type: 'string', description: 'Movie title' } } } },
  search_anime: { description: 'Searches for anime in the Anichin database.', parameters: { type: 'object', properties: { query: { type: 'string', description: 'Anime title' } } } }
};

const ToolCallVisualizer = ({ content }: { content: string }) => {
  if (!content.includes('<tool_call>')) return null;

  return (
    <div className="my-4 group relative">
      <div className="absolute inset-0 bg-indigo-500/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative bg-[#1a1b1e] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <div className="bg-white/[0.03] px-6 py-3 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="size-3.5 text-indigo-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Utility Protocol Orchestration</span>
          </div>
          <div className="flex gap-1.5">
            <div className="size-2 rounded-full bg-red-500/20" />
            <div className="size-2 rounded-full bg-yellow-500/20" />
            <div className="size-2 rounded-full bg-green-500/20" />
          </div>
        </div>
        <div className="p-6 font-mono text-[11px] leading-relaxed text-indigo-100/90 overflow-x-auto whitespace-pre-wrap">
          {content}
        </div>
      </div>
    </div>
  );
};

export function NexAgent() {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I am NexAgent. I can generate mailboxes, compose music, or explore movie databases. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(models[0].id);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [view, setView] = useState<'chat' | 'config'>('chat');
  
  const [usage, setUsage] = useState({
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0
  });

  const selectedModelData = models.find((m) => m.id === selectedModel);
  const chefs = Array.from(new Set(models.map((m) => m.chef)));

  const handleSend = async (customInput?: string) => {
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
      
      if ((response as any).usage) {
        const u = (response as any).usage;
        setUsage(prev => ({
          inputTokens: prev.inputTokens + (u.prompt_tokens || 0),
          outputTokens: prev.outputTokens + (u.completion_tokens || 0),
          totalTokens: prev.totalTokens + (u.total_tokens || 0)
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <PromptInputProvider>
      <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md overflow-hidden rounded-[2.5rem] flex flex-col h-[800px]">
        <CardHeader className="p-8 pb-6 border-b border-primary/5 bg-background/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/10 text-indigo-600 rounded-2xl relative border border-indigo-500/10">
                <Sparkles className="size-6" />
                <div className="absolute -top-1 -right-1 size-3 bg-emerald-500 rounded-full border-2 border-background shadow-sm" />
              </div>
              <div>
                <CardTitle className="font-headline text-2xl tracking-tight">NexAgent Intelligence</CardTitle>
                <CardDescription className="flex items-center gap-2 font-medium">
                  <BrainCircuit className="size-3 text-indigo-500" /> Neural Orchestration Hub
                </CardDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-secondary/30 p-1 rounded-full border border-primary/5 shadow-inner">
                <Button variant="ghost" size="sm" onClick={() => setView('chat')} className={cn("rounded-full h-8 px-4 gap-2 text-[10px] font-bold uppercase tracking-wider transition-all", view === 'chat' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground/60")}>
                  <MessageSquare className="size-3" /> Chat
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setView('config')} className={cn("rounded-full h-8 px-4 gap-2 text-[10px] font-bold uppercase tracking-wider transition-all", view === 'config' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground/60")}>
                  <Settings2 className="size-3" /> Intel
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 p-0 flex flex-col overflow-hidden bg-secondary/[0.01]">
          {view === 'chat' ? (
            <>
              <ScrollArea className="flex-1 p-8 h-full">
                <div className="space-y-8 max-w-3xl mx-auto pb-12">
                  {messages.map((msg, i) => (
                    <div key={i} className={cn("flex gap-5 animate-fade-in-up", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                      <div className={cn("size-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md border", msg.role === 'user' ? "bg-indigo-600 text-white border-indigo-500" : "bg-white text-primary border-primary/5")}>
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
                                  label={`Provisioning Utility: ${tool.function.name.replace(/_/g, ' ')}`} 
                                  description={`Orchestrating logic for ${tool.function.name} with parameters...`}
                                  status="complete" 
                                  icon={tool.function.name.includes('search') ? Search : tool.function.name.includes('mail') ? MessageSquare : Settings2}
                                />
                              ))}
                              <ChainOfThoughtStep label="Synthesizing Neural Response" status="complete" />
                            </ChainOfThoughtContent>
                          </ChainOfThought>
                        )}
                        <div className={cn(
                          "p-7 rounded-[2rem] shadow-sm relative group transition-all",
                          msg.role === 'user' ? "bg-indigo-600 text-white rounded-tr-none" : "bg-background border border-primary/5 rounded-tl-none hover:border-primary/10"
                        )}>
                          <div className="prose prose-sm dark:prose-invert max-w-none 
                            prose-img:rounded-3xl prose-img:shadow-2xl prose-img:border prose-img:border-primary/5 prose-img:mx-auto prose-img:max-h-[380px] prose-img:object-cover
                            prose-h3:text-2xl prose-h3:font-bold prose-h3:font-headline prose-h3:mb-4 prose-h3:tracking-tighter
                            prose-p:leading-relaxed prose-p:font-medium prose-p:opacity-90
                            prose-li:text-[12px] prose-li:font-medium prose-li:text-muted-foreground/90
                            prose-table:border-collapse prose-th:border-primary/5 prose-td:border-primary/5 prose-hr:border-primary/10">
                            
                            {msg.content.includes('<tool_call>') ? (
                              <div className="space-y-4">
                                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">Handshaking with Utility Logic...</p>
                                <ToolCallVisualizer content={msg.content} />
                              </div>
                            ) : (
                              <ReactMarkdown 
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  table: ({ children }) => (
                                    <div className="w-full overflow-x-auto my-6 rounded-[2rem] border border-primary/5 bg-secondary/10 shadow-inner">
                                      <table className="w-full text-left border-collapse min-w-[550px]">
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
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                                      {children}
                                    </th>
                                  ),
                                  td: ({ children }) => (
                                    <td className="px-6 py-4 text-xs font-medium border-t border-primary/5 align-top">
                                      {children}
                                    </td>
                                  ),
                                  tr: ({ children }) => (
                                    <tr className="hover:bg-primary/[0.02] transition-colors">
                                      {children}
                                    </tr>
                                  ),
                                  h3: ({ children }) => (
                                    <h3 className="mt-6 border-l-4 border-indigo-500 pl-5 py-1 bg-indigo-500/5 rounded-r-2xl">
                                      {children}
                                    </h3>
                                  )
                                }}
                              >
                                {msg.content}
                              </ReactMarkdown>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex gap-5 animate-fade-in-up">
                      <div className="size-10 rounded-2xl bg-secondary text-primary flex items-center justify-center animate-pulse border border-primary/5 shadow-sm"><Bot className="size-5" /></div>
                      <div className="space-y-3 max-w-[80%]">
                        <div className="bg-background border border-primary/5 p-5 rounded-[1.5rem] flex items-center gap-3 shadow-sm">
                           <Loader2 className="size-4 animate-spin text-indigo-600" />
                           <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">NexAgent Synthesis in Progress...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              <div className="p-8 border-t border-primary/5 bg-secondary/10 backdrop-blur-md space-y-4">
                 <div className="max-w-3xl mx-auto space-y-4">
                   <Suggestions>
                     {SUGGESTIONS.map((s) => (
                       <Suggestion key={s} suggestion={s} onClick={(v) => handleSend(v)} disabled={loading} />
                     ))}
                   </Suggestions>

                   <PromptInput>
                      <PromptInputBody>
                        <PromptInputTextarea 
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          disabled={loading}
                        />
                      </PromptInputBody>
                      <PromptInputFooter>
                        <PromptInputTools>
                          <PromptInputActionMenu>
                            <PromptInputActionMenuTrigger />
                            <PromptInputActionMenuContent>
                              <PromptInputActionAddAttachments />
                              <PromptInputActionAddScreenshot />
                            </PromptInputActionMenuContent>
                          </PromptInputActionMenu>
                          
                          <PromptInputButton>
                            <GlobeIcon className="size-4" />
                            <span>Search</span>
                          </PromptInputButton>

                          <ModelSelector open={selectorOpen} onOpenChange={setSelectorOpen}>
                            <ModelSelectorTrigger asChild>
                              <PromptInputButton>
                                {selectedModelData?.chefSlug && (
                                  <ModelSelectorLogo provider={selectedModelData.chefSlug} />
                                )}
                                {selectedModelData?.name && (
                                  <ModelSelectorName>{selectedModelData.name}</ModelSelectorName>
                                )}
                              </PromptInputButton>
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

                          <Context
                            maxTokens={128000}
                            modelId={selectedModel}
                            usedTokens={usage.totalTokens}
                            usage={{
                              inputTokens: usage.inputTokens,
                              outputTokens: usage.outputTokens,
                              totalTokens: usage.totalTokens,
                              cachedInputTokens: 0,
                              reasoningTokens: 0
                            }}
                          >
                            <ContextTrigger className="h-9 border-none bg-transparent hover:bg-background/50" />
                            <ContextContent>
                              <ContextContentHeader />
                              <ContextContentBody>
                                <ContextInputUsage />
                                <ContextOutputUsage />
                                <ContextReasoningUsage />
                                <ContextCacheUsage />
                              </ContextContentBody>
                              <ContextContentFooter />
                            </ContextContent>
                          </Context>
                        </PromptInputTools>

                        <PromptInputSubmit 
                          onClick={() => handleSend()}
                          status={loading ? "streaming" : "ready"} 
                        />
                      </PromptInputFooter>
                   </PromptInput>
                 </div>
              </div>
            </>
          ) : (
            <ScrollArea className="flex-1 p-8">
              <div className="max-w-3xl mx-auto">
                <Agent>
                  <AgentHeader name="NexAgent Neural Orchestrator" model={selectedModelData?.name} />
                  <AgentContent>
                    <AgentInstructions>You are NexAgent, the premium orchestrator of NxAIO. Your goal is to deliver high-fidelity, visual, Indonesian-optimized utility responses using Markdown. prioritized Card Layouts for media search results. If you trigger a tool, provide clear reasoning in the thinking chain.</AgentInstructions>
                    <AgentTools defaultValue={["generate_music", "search_anime"]}>
                      <AgentTool value="generate_temp_mail" tool={agentToolsConfig.generate_temp_mail} />
                      <AgentTool value="generate_music" tool={agentToolsConfig.generate_music} />
                      <AgentTool value="search_media" tool={agentToolsConfig.search_media} />
                      <AgentTool value="search_anime" tool={agentToolsConfig.search_anime} />
                    </AgentTools>
                    <AgentOutput schema={`{
  role: "assistant",
  content: "Markdown visual components (Cards/Tables/Text)",
  toolCalls: Array<{
    id: string,
    function: { name: string, arguments: string }
  }>
}`} />
                  </AgentContent>
                </Agent>
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </PromptInputProvider>
  );
}
