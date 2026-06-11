
"use client"

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  RefreshCw, 
  Copy, 
  Loader2, 
  ShieldCheck, 
  Inbox, 
  Trash2, 
  Clock, 
  ChevronRight, 
  User, 
  CheckCircle2, 
  ExternalLink,
  Search,
  KeyRound,
  MailQuestion,
  X,
  Lock,
  Zap,
  AlertTriangle
} from "lucide-react";
import { initMailbox, checkMessages } from "@/app/actions/temp-mail";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const ROLE_LIMITS = {
  free: 3,
  pro: 25,
  sultan: 50
};

export function TempMailTool() {
  const { user } = useUser();
  const db = useFirestore();
  const userRef = useMemo(() => user ? doc(db, "users", user.uid) : null, [db, user]);
  const { data: profile } = useDoc(userRef);

  const [address, setAddress] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [cookies, setCookies] = useState<any>(null);
  const [messages, setMessages] = useState<TempMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState<TempMessage | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const { toast } = useToast();
  
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const role = (profile?.role as keyof typeof ROLE_LIMITS) || 'free';
  const limit = ROLE_LIMITS[role];
  const usage = profile?.tempMailUsage || { count: 0, lastReset: new Date().toISOString().split('T')[0] };

  // Check if reset is needed (daily)
  const isResetNeeded = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return usage.lastReset !== today;
  }, [usage.lastReset]);

  const startNewSession = async (force = false) => {
    // 1. Check if we have a persisted session and aren't forcing a new one
    if (!force) {
      const savedAddress = sessionStorage.getItem('nx_temp_address');
      const savedToken = sessionStorage.getItem('nx_temp_token');
      const savedCookies = sessionStorage.getItem('nx_temp_cookies');
      
      if (savedAddress && savedToken && savedCookies) {
        setAddress(savedAddress);
        setToken(savedToken);
        setCookies(JSON.parse(savedCookies));
        setLastCheck(new Date());
        return;
      }
    }

    // 2. Limit Check for "New Identity"
    if (force && userRef) {
      const today = new Date().toISOString().split('T')[0];
      const currentCount = isResetNeeded ? 0 : usage.count;

      if (currentCount >= limit) {
        toast({
          variant: "warning",
          title: "Limit Reached",
          description: `You have used your ${limit} daily identities. Upgrade for more.`,
        });
        return;
      }

      // Update Usage in Firestore (Reliable)
      const newUsage = {
        count: currentCount + 1,
        lastReset: today
      };

      setDoc(userRef, { tempMailUsage: newUsage }, { merge: true }).catch(e => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: userRef.path,
          operation: 'write',
          requestResourceData: { tempMailUsage: newUsage }
        }));
      });
    }

    // 3. Provision Mailbox
    setLoading(true);
    setMessages([]);
    setLastCheck(null);
    try {
      const res = await initMailbox();
      if (!res.status) throw new Error(res.error);
      
      setAddress(res.data.mailbox);
      setToken(res.data.token);
      setCookies(res.data.cookies);
      setLastCheck(new Date());
      
      // Persist to session storage
      sessionStorage.setItem('nx_temp_address', res.data.mailbox);
      sessionStorage.setItem('nx_temp_token', res.data.token);
      sessionStorage.setItem('nx_temp_cookies', JSON.stringify(res.data.cookies));
      
      toast({
        title: "Mailbox Ready",
        description: force ? "Identity rotated successfully." : "Your temporary identity has been provisioned.",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Session Error",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const checkInbox = useCallback(async () => {
    if (!token || !cookies || polling) return;

    setPolling(true);
    try {
      const res = await checkMessages(token, cookies);
      if (res.status) {
        setMessages(res.data.messages);
        setCookies(res.data.cookies);
        sessionStorage.setItem('nx_temp_cookies', JSON.stringify(res.data.cookies));
        setLastCheck(new Date());
        
        if (res.data.messages.length > messages.length) {
          toast({
            title: "New Mail Received",
            description: `From: ${res.data.messages[0].from}`,
          });
        }
      }
    } catch (err) {
      console.error("Polling failed:", err);
    } finally {
      setPolling(false);
    }
  }, [token, cookies, polling, messages.length, toast]);

  useEffect(() => {
    startNewSession(false);
  }, []);

  useEffect(() => {
    if (address) {
      pollTimerRef.current = setInterval(() => {
        checkInbox();
      }, 8000);
    }
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [address, checkInbox]);

  const copyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    toast({
      title: "Address Copied",
      description: "You can now use this email to sign up for services.",
    });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Code Copied",
      description: `Verification code ${code} is on your clipboard.`,
    });
  };

  const remainingIdentities = limit - (isResetNeeded ? 0 : usage.count);

  return (
    <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md overflow-hidden rounded-[2.5rem]">
      <CardHeader className="p-8 sm:p-10 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-600 rounded-xl">
              <Mail className="size-6" />
            </div>
            <div>
              <CardTitle className="font-headline text-2xl">Disposable Temp-Mail</CardTitle>
              <CardDescription>Anonymous mailbox with real-time monitoring and tiered identity limits.</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => startNewSession(true)} 
              disabled={loading}
              className="rounded-full gap-2 border-primary/5 font-bold text-[10px] uppercase tracking-widest hover:bg-destructive/5 hover:text-destructive"
            >
              <Trash2 className="size-3" /> New Identity
            </Button>
            <Button 
              onClick={checkInbox} 
              disabled={loading || polling}
              className="rounded-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-500/10"
            >
              {polling ? <Loader2 className="size-3 animate-spin" /> : <RefreshCw className="size-3" />} 
              Refresh
            </Button>
          </div>
        </div>

        {/* Limit Tracker */}
        <div className="mt-6 flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border border-primary/5">
           <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg flex items-center justify-center",
                role === 'sultan' ? "bg-yellow-500/10 text-yellow-600" : role === 'pro' ? "bg-indigo-500/10 text-indigo-600" : "bg-muted text-muted-foreground"
              )}>
                 <Zap className="size-4" />
              </div>
              <div className="space-y-0.5">
                 <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Your Tier: {role}</p>
                 <p className="text-xs font-bold font-headline">{remainingIdentities} daily identities remaining</p>
              </div>
           </div>
           {role === 'free' && (
             <Button variant="link" asChild className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">
                <a href="/pricing">Upgrade to Pro</a>
             </Button>
           )}
        </div>
      </CardHeader>
      
      <CardContent className="p-8 sm:p-10 pt-0 space-y-10">
        <div className="p-8 rounded-[2.5rem] bg-secondary/30 border border-primary/5 space-y-6 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShieldCheck className="size-24 text-indigo-600" />
           </div>

           <div className="space-y-2 relative z-10">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 ml-1 flex items-center gap-2">
                <Mail className="size-3" /> Active Mailbox Address
              </h4>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                 {loading ? (
                    <div className="h-14 flex-1 bg-background/50 rounded-2xl animate-pulse" />
                 ) : (
                    <div className="h-14 flex-1 px-6 rounded-2xl bg-background border border-primary/5 flex items-center font-mono text-lg font-bold text-indigo-600 shadow-inner overflow-hidden truncate">
                       {address || "initializing..."}
                    </div>
                 )}
                 <Button 
                    onClick={copyAddress} 
                    disabled={!address}
                    className="h-14 w-full sm:w-auto px-8 rounded-2xl bg-indigo-600 text-white font-bold gap-3 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all"
                 >
                    <Copy className="size-4" /> Copy Address
                 </Button>
              </div>
           </div>

           <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 relative z-10">
              <div className="flex items-center gap-2">
                 <div className={cn("size-2 rounded-full", polling ? "bg-indigo-500 animate-pulse" : "bg-emerald-500")} />
                 {polling ? "Syncing..." : "Real-time Ready"}
              </div>
              <span>•</span>
              <div className="flex items-center gap-2">
                 <Clock className="size-3" />
                 Last checked: {lastCheck ? lastCheck.toLocaleTimeString() : 'never'}
              </div>
           </div>
        </div>

        <div className="space-y-6">
           <div className="flex items-center justify-between px-1">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2">
                <Inbox className="size-3" /> Received Messages ({messages.length})
              </h4>
           </div>

           <div className="grid grid-cols-1 gap-3">
              {messages.length > 0 ? (
                messages.map((msg, i) => (
                  <div 
                    key={msg.id}
                    onClick={() => setSelectedMsg(msg)}
                    className="group relative p-6 rounded-[2rem] bg-secondary/20 border border-primary/5 hover:border-indigo-500/30 hover:bg-secondary/40 transition-all cursor-pointer animate-fade-in-up"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                       <div className="flex items-center gap-4">
                          <div className="size-12 rounded-2xl bg-indigo-500/5 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                             <User className="size-6" />
                          </div>
                          <div className="space-y-1">
                             <p className="text-sm font-bold font-headline">{msg.subject}</p>
                             <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                                <span>{msg.from}</span>
                                <span>•</span>
                                <span>{msg.time}</span>
                             </div>
                          </div>
                       </div>

                       <div className="flex items-center gap-3">
                          {msg.code && (
                             <Badge 
                                variant="secondary" 
                                onClick={(e) => { e.stopPropagation(); copyCode(msg.code!); }}
                                className="bg-emerald-500/10 text-emerald-600 border-none px-3 py-1 rounded-lg text-[10px] font-bold hover:bg-emerald-500/20 gap-1.5 transition-all"
                             >
                                <KeyRound className="size-3" /> Code: {msg.code}
                             </Badge>
                          )}
                          <ChevronRight className="size-4 text-muted-foreground opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                       </div>
                    </div>
                    <div className="mt-4 pl-16">
                       <p className="text-xs text-muted-foreground leading-relaxed line-clamp-1 opacity-60">
                          {msg.preview}
                       </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 bg-secondary/10 rounded-[3rem] border-2 border-dashed border-primary/5">
                   <div className="p-6 bg-secondary rounded-full">
                      <MailQuestion className="size-12 text-muted-foreground/20" />
                   </div>
                   <div className="space-y-2">
                      <p className="text-sm font-bold font-headline">Awaiting first payload...</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium max-w-[240px] mx-auto leading-relaxed">
                        Waiting for messages to arrive. This inbox will refresh automatically every 8 seconds.
                      </p>
                   </div>
                </div>
              )}
           </div>
        </div>

        <div className="p-6 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-4">
           <ShieldCheck className="size-5 text-indigo-500 mt-0.5 opacity-60" />
           <div className="space-y-1">
             <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600/60">Privacy Protocol</p>
             <p className="text-[11px] text-muted-foreground leading-relaxed">
               Mailboxes are preserved for your session. Use <span className="font-bold text-indigo-600">New Identity</span> only when you need a fresh address. Identity rotations are limited by your daily quota.
             </p>
           </div>
        </div>
      </CardContent>

      <Dialog open={!!selectedMsg} onOpenChange={() => setSelectedMsg(null)}>
        <DialogContent className="sm:max-w-3xl rounded-[2.5rem] border-none shadow-[0_32px_64px_rgba(0,0,0,0.2)] bg-card/95 backdrop-blur-xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
          {selectedMsg && (
             <>
               <DialogHeader className="p-8 sm:p-10 pb-6 border-b border-primary/5">
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="space-y-2">
                       <div className="flex items-center gap-2">
                          <Badge className="bg-indigo-600 text-white border-none rounded-lg text-[10px] font-bold uppercase">Received</Badge>
                          <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">{selectedMsg.time}</span>
                       </div>
                       <DialogTitle className="text-2xl font-bold font-headline tracking-tight">{selectedMsg.subject}</DialogTitle>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedMsg(null)} className="rounded-full size-10 hover:bg-secondary/80 self-start sm:self-center">
                       <X className="size-5" />
                    </Button>
                 </div>
                 <div className="mt-6 flex items-center gap-3 p-4 bg-secondary/30 rounded-2xl border border-primary/5">
                    <div className="p-2 bg-indigo-500/10 text-indigo-600 rounded-xl">
                       <User className="size-4" />
                    </div>
                    <div className="space-y-0.5">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">From Sender</p>
                       <p className="text-xs font-bold font-headline">{selectedMsg.from}</p>
                    </div>
                 </div>
               </DialogHeader>
               
               <div className="flex-1 overflow-y-auto p-8 sm:p-10 custom-scrollbar bg-white/50">
                  <div 
                    className="prose prose-sm max-w-none text-foreground/80 leading-relaxed font-body"
                    dangerouslySetInnerHTML={{ __html: selectedMsg.content }} 
                  />
               </div>

               <div className="p-6 border-t border-primary/5 bg-secondary/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                     <CheckCircle2 className="size-4 text-emerald-500" />
                     <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">End-to-end Encrypted View</span>
                  </div>
                  {selectedMsg.code && (
                    <Button 
                       onClick={() => copyCode(selectedMsg.code!)}
                       className="w-full sm:w-auto h-11 px-8 rounded-xl bg-indigo-600 text-white font-bold gap-2 shadow-xl shadow-indigo-500/10"
                    >
                       <KeyRound className="size-4" /> Copy Verification Code
                    </Button>
                  )}
               </div>
             </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

interface TempMessage {
  id: string;
  from: string;
  subject: string;
  time: string;
  content: string;
  preview: string;
  code: string | null;
}
