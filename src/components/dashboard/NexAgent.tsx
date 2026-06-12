'use client';

import React, { useState, useCallback, memo, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  Bot, 
  Loader2, 
  User, 
  Zap, 
  Terminal,
  BrainCircuit,
  CheckIcon,
  Search,
  Settings2,
  MessageSquare,
  GlobeIcon,
  AlertCircle,
  Trash2,
  Keyboard
} from "lucide-react";
import { nexAgentChat } from "@/app/actions/nexagent";
import { cn, getWIBDate } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useUser, useFirestore, useDoc, useCollection } from "@/firebase";
import { doc, updateDoc, increment, collection, query, orderBy, addDoc, serverTimestamp, getDocs, deleteDoc, writeBatch } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { siteConfig, type TierId } from "@/config/site";
import { Kbd } from "@/components/ui/kbd";
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
  usePromptInputAttachments,
} from "@/components/ai-elements/prompt-input";
import {
  Attachments,
  Attachment,
  AttachmentPreview,
  AttachmentRemove,
} from "@/components/ai-elements/attachments";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: any[];
  toolResults?: any[];
  usage?: any;
}

const models = [
  { 
    chef: "Google", 
    chefSlug: "google", 
    id: "google/gemini-2.0-flash-exp:free", 
    name: "Gemini 2.0 Flash", 
    providers: ["openrouter"],
    supportsImage: true,
    description: "Ultra-fast multimodal model with strong reasoning."
  },
  { 
    chef: "NVIDIA", 
    chefSlug: "nvidia", 
    id: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free", 
    name: "Nemotron Omni Reasoning", 
    providers: ["openrouter"],
    supportsImage: true,
    description: "Support text, voice, img and video to text + tools."
  },
  { 
    chef: "Meta", 
    chefSlug: "meta", 
    id: "meta-llama/llama-3.3-70b-instruct:free", 
    name: "Llama 3.3 70B", 
    providers: ["openrouter"],
    supportsImage: false,
    description: "Highly capable instruction-following model."
  },
  { 
    chef: "Sourceful", 
    chefSlug: "sourceful", 
    id: "sourceful/riverflow-v2.5-pro", 
    name: "Riverflow v2.5 Pro", 
    providers: ["openrouter"],
    supportsImage: true,
    description: "Image generator: support img2img or txt2img."
  }
];

const SUGGESTIONS = [
  "Cek status musik saya",
  "Cek inbox email sementara",
  "Cari film action terbaru",
  "Generate lagu lo-fi santai",
  "Rekomendasi anime isekai"
];

const agentToolsConfig = {
  generate_temp_mail: { description: 'Provision a disposable identity session with real-time mailbox monitoring.', parameters: { type: 'object', properties: {} } },
  check_mailbox: { description: 'Check for new incoming messages in an existing temporary mailbox session.', parameters: { type: 'object', properties: { token: { type: 'string' }, cookies: { type: 'object' } } } },
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
  check_music_status: { description: 'Check the real-time progress and final result of a music generation job.', parameters: { type: 'object', properties: { song_id: { type: 'string' } } } },
  remove_background: { description: 'Remove the background from an image URL using AI edge detection.', parameters: { type: 'object', properties: { image_url: { type: 'string' } } } },
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

const PromptInputAttachmentsDisplay = () => {
  const attachments = usePromptInputAttachments();
  const handleRemove = useCallback((id: string) => attachments.remove(id), [attachments]);
  if (attachments.files.length === 0) return null;
  return (
    <Attachments variant="inline">
      {attachments.files.map((attachment) => (
        <Attachment data={attachment} key={attachment.id} onRemove={() => handleRemove(attachment.id)}>
          <AttachmentPreview />
          <AttachmentRemove />
        </Attachment>
      ))}
    </Attachments>
  );
};

export function NexAgent() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const userRef = useMemo(() => user ? doc(db, "users", user.uid) : null, [db, user]);
  const { data: profile } = useDoc(userRef);

  // Firestore Chat History Sync
  const messagesQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "users", user.uid, "agent_messages"),
      orderBy("timestamp", "asc")
    );
  }, [db, user]);

  const { data: syncedMessages, loading: historyLoading } = useCollection<Message>(messagesQuery);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(models[0].id);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [view, setView] = useState<'chat' | 'config'>('chat');
  
  const role = (profile?.role as TierId) || 'free';
  const tierConfig = siteConfig.tiers[role];
  const limit = tierConfig.limits.aiTokens;
  const aiUsage = profile?.aiUsage || { tokens: 0, lastReset: getWIBDate() };
  
  const isResetNeeded = aiUsage.lastReset !== getWIBDate();
  const currentTokens = isResetNeeded ? 0 : (aiUsage.tokens || 0);
  const isLimitReached = currentTokens >= limit;

  const selectedModelData = models.find((m) => m.id === selectedModel);
  const chefs = Array.from(new Set(models.map((m) => m.chef)));

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [syncedMessages, loading]);

  const saveMessage = async (msg: Message) => {
    if (!user || !db) return;
    const msgRef = collection(db, "users", user.uid, "agent_messages");
    await addDoc(msgRef, {
      ...msg,
      timestamp: serverTimestamp()
    });
  };

  const handleClearHistory = async () => {
    if (!user || !db) return;
    setLoading(true);
    try {
      const q = collection(db, "users", user.uid, "agent_messages");
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      toast({ title: "Nexus Purged", description: "Conversation history cleared successfully." });
    } catch (err) {
      toast({ variant: "destructive", title: "Purge Failed", description: "Could not clear memory banks." });
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (customInput?: string) => {
    const finalInput = customInput || input;
    if (!finalInput.trim() || loading) return;

    if (isLimitReached) {
      toast({
        variant: "destructive",
        title: "Daily Limit Reached",
        description: `You have consumed your daily quota of ${limit.toLocaleString()} tokens for the ${tierConfig.name} plan.`,
      });
      return;
    }

    const userMsg: Message = { role: 'user', content: finalInput };
    await saveMessage(userMsg);
    setInput("");
    setLoading(true);

    try {
      const historyForContext = syncedMessages.map(m => ({ 
        role: m.role, 
        content: m.content,
        toolCalls: m.toolCalls,
        toolResults: m.toolResults
      }));
      const fullContext = [...historyForContext, userMsg];

      const response = await nexAgentChat(fullContext, selectedModel);
      await saveMessage(response as Message);
      
      if ((response as any).usage && userRef) {
        const u = (response as any).usage;
        const totalUsed = (u.total_tokens || 0);
        
        await updateDoc(userRef, {
          aiUsage: {
            tokens: (isResetNeeded ? 0 : aiUsage.tokens) + totalUsed,
            lastReset: getWIBDate()
          }
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Nexus Failure",
        description: "Encountered a neural transmission error. Please retry.",
      });
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

  const displayMessages = syncedMessages.length > 0 ? syncedMessages : [
    { role: 'assistant', content: "Hello! I am NexAgent. My neural memory is active. I can generate mailboxes, compose music, and monitor your utility sessions. How can I help you today?" }
  ] as Message[];

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
              <Button variant="ghost" size="icon" onClick={handleClearHistory} disabled={loading || historyLoading} className="rounded-full hover:bg-destructive/5 hover:text-destructive transition-all" title="Clear History">
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 p-0 flex flex-col overflow-hidden bg-secondary/[0.01]">
          {view === 'chat' ? (
            <>
              <ScrollArea ref={scrollAreaRef} className="flex-1 p-8 h-full">
                <div className="space-y-8 max-w-3xl mx-auto pb-12">
                  {historyLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <Loader2 className="size-8 animate-spin text-indigo-600/20" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Synchronizing Memory banks...</p>
                    </div>
                  ) : displayMessages.map((msg, i) => (
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
                          <div className={cn(
                            "prose prose-sm max-w-none",
                            msg.role === 'user' ? "prose-invert text-white" : "dark:prose-invert text-foreground",
                            "prose-img:rounded-3xl prose-img:shadow-2xl prose-img:border prose-img:border-primary/5 prose-img:mx-auto prose-img:max-h-[380px] prose-img:object-cover prose-h3:text-2xl prose-h3:font-bold prose-h3:font-headline prose-h3:mb-4 prose-h3:tracking-tighter prose-p:leading-relaxed prose-p:font-medium prose-p:opacity-90 prose-li:text-[12px] prose-li:font-medium prose-li:text-muted-foreground/90 prose-table:border-collapse prose-th:border-primary/5 prose-td:border-primary/5 prose-hr:border-primary/10"
                          )}>
                            
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
                 {isLimitReached && (
                   <div className="max-w-3xl mx-auto p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-center gap-3 animate-fade-in-up">
                      <AlertCircle className="size-5 text-destructive" />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-destructive">Quota Exhausted</p>
                        <p className="text-[10px] text-destructive/60 font-medium leading-relaxed">Daily token limit reached. Access will restore at 00:00 WIB.</p>
                      </div>
                      <Button variant="outline" size="sm" asChild className="h-8 rounded-lg border-destructive/20 text-destructive hover:bg-destructive/10 font-bold text-[9px] uppercase tracking-widest">
                        <a href="/pricing">Upgrade Plan</a>
                      </Button>
                   </div>
                 )}
                 <div className="max-w-3xl mx-auto space-y-4">
                   <Suggestions>
                     {SUGGESTIONS.map((s) => (
                       <Suggestion key={s} suggestion={s} onClick={(v) => handleSend(v)} disabled={loading || isLimitReached || historyLoading} />
                     ))}
                   </Suggestions>

                   <PromptInput onSubmit={(m) => handleSend(m.text)}>
                      <PromptInputAttachmentsDisplay />
                      <PromptInputBody>
                        <PromptInputTextarea 
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          disabled={loading || isLimitReached || historyLoading}
                          placeholder={isLimitReached ? "Daily limit reached..." : (selectedModelData?.chefSlug === 'sourceful' ? "Describe the image you want to generate..." : "What would you like to know?")}
                        />
                      </PromptInputBody>
                      <PromptInputFooter>
                        <PromptInputTools>
                          {selectedModelData?.supportsImage && (
                            <PromptInputActionMenu>
                              <PromptInputActionMenuTrigger />
                              <PromptInputActionMenuContent>
                                <PromptInputActionAddAttachments />
                                <PromptInputActionAddScreenshot />
                              </PromptInputActionMenuContent>
                            </PromptInputActionMenu>
                          )}
                          
                          <PromptInputButton disabled={isLimitReached}>
                            <GlobeIcon className="size-4" />
                            <span>Search</span>
                          </PromptInputButton>

                          <ModelSelector open={selectorOpen} onOpenChange={setSelectorOpen}>
                            <ModelSelectorTrigger asChild>
                              <PromptInputButton disabled={isLimitReached}>
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
                                          <ModelSelectorLogoGroup>
                                            {m.providers.map((p) => (
                                              <ModelSelectorLogo key={p} provider={p} />
                                            ))}
                                          </ModelSelectorLogoGroup>
                                          {selectedModel === m.id && <CheckIcon className="ml-auto size-4" />}
                                        </ModelSelectorItem>
                                      ))}
                                  </ModelSelectorGroup>
                                ))}
                              </ModelSelectorList>
                            </ModelSelectorContent>
                          </ModelSelector>

                          <Context
                            maxTokens={limit}
                            modelId={selectedModel}
                            usedTokens={currentTokens}
                            usage={{
                              inputTokens: currentTokens,
                              outputTokens: 0,
                              totalTokens: currentTokens,
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

                        <div className="hidden sm:flex items-center gap-2 mr-2">
                           <span className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em]">Send</span>
                           <Kbd variant="light">
                              <Kbd.Abbr keyValue="enter" />
                           </Kbd>
                        </div>

                        <PromptInputSubmit 
                          onClick={() => handleSend()}
                          status={loading ? "streaming" : "ready"} 
                          disabled={isLimitReached || historyLoading}
                        />
                      </PromptInputFooter>
                   </PromptInput>
                 </div>
              </div>
            </>
          ) : (
            <ScrollArea className="flex-1 p-8">
              <div className="max-w-3xl mx-auto space-y-8">
                <Agent>
                  <AgentHeader name="NexAgent Neural Orchestrator" model={selectedModelData?.name} />
                  <AgentContent>
                    <AgentInstructions>You are NexAgent, the premium orchestrator of NxAIO. Your goal is to deliver high-fidelity, visual, Indonesian-optimized utility responses using Markdown. prioritized Card Layouts for media search results. If you trigger a tool, provide clear reasoning in the thinking chain. Now with multi-turn persistent memory enabled.</AgentInstructions>
                    <AgentTools defaultValue={["shortcuts", "generate_music", "check_music_status", "search_anime"]}>
                      <AgentTool value="shortcuts" tool={{ description: "Rapid orchestration logic via keyboard input." }}>
                         <div className="space-y-3 pt-4 px-2">
                            <div className="flex items-center justify-between">
                               <div className="flex items-center gap-3">
                                  <div className="p-1.5 bg-background rounded-lg border border-primary/5">
                                     <Keyboard className="size-3 text-muted-foreground/60" />
                                  </div>
                                  <span className="text-xs font-bold text-muted-foreground/80">Send Message</span>
                               </div>
                               <Kbd variant="light"><Kbd.Abbr keyValue="enter" /></Kbd>
                            </div>
                            <div className="flex items-center justify-between">
                               <div className="flex items-center gap-3">
                                  <div className="p-1.5 bg-background rounded-lg border border-primary/5">
                                     <Keyboard className="size-3 text-muted-foreground/60" />
                                  </div>
                                  <span className="text-xs font-bold text-muted-foreground/80">New Line</span>
                               </div>
                               <div className="flex gap-1.5">
                                  <Kbd variant="light"><Kbd.Abbr keyValue="shift" /></Kbd>
                                  <Kbd variant="light"><Kbd.Abbr keyValue="enter" /></Kbd>
                               </div>
                            </div>
                         </div>
                      </AgentTool>
                      <AgentTool value="generate_temp_mail" tool={agentToolsConfig.generate_temp_mail} />
                      <AgentTool value="check_mailbox" tool={agentToolsConfig.check_mailbox} />
                      <AgentTool value="generate_music" tool={agentToolsConfig.generate_music} />
                      <AgentTool value="check_music_status" tool={agentToolsConfig.check_music_status} />
                      <AgentTool value="remove_background" tool={agentToolsConfig.remove_background} />
                      <AgentTool value="search_media" tool={agentToolsConfig.search_media} />
                      <AgentTool value="search_anime" tool={agentToolsConfig.search_anime} />
                    </AgentTools>
                    <AgentOutput schema={`{
  role: "assistant",
  content: "Markdown visual components (Cards/Tables/Text)",
  toolCalls: Array<{
    id: string,
    function: { name: string, arguments: string }
  }>,
  toolResults: Array<{
    id: string,
    name: string,
    result: any
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
