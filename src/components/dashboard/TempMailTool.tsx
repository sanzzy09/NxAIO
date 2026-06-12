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
  X,
  Lock,
  Zap,
  KeyRound,
  MailQuestion
} from "lucide-react";
import { initMailbox, checkMessages } from "@/app/actions/temp-mail";
import { useToast } from "@/hooks/use-toast";
import { cn, getWIBDate } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUser, useFirestore, useDoc, useCollection } from "@/firebase";
import { doc, setDoc, collection, query, orderBy, limit, serverTimestamp, deleteDoc } from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { siteConfig, type TierId } from "@/config/site";

export function TempMailTool() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const userRef = useMemo(() => user ? doc(db, "users", user.uid) : null, [db, user]);
  const { data: profile } = useDoc(userRef);

  const [address, setAddress] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [cookies, setCookies] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState<any | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const role = (profile?.role as TierId) || 'free';
  const tierConfig = siteConfig.tiers[role];
  const limitCount = tierConfig.limits.tempMail;
  const usage = profile?.tempMailUsage || { count: 0, lastReset: getWIBDate() };

  // Fetch active session from Firestore
  const activeMailboxQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "users", user.uid, "mailboxes"),
      orderBy("timestamp", "desc"),
      limit(1)
    );
  }, [db, user]);

  const { data: activeSessions } = useCollection(activeMailboxQuery);

  const restoreSession = useCallback((session: any) => {
    if (session && !address) {
      setAddress(session.address);
      setToken(session.token);
      setCookies(session.cookies);
      setLastCheck(new Date());
    }
  }, [address]);

  useEffect(() => {
    if (activeSessions?.length > 0) {
      restoreSession(activeSessions[0]);
    }
  }, [activeSessions, restoreSession]);

  const saveMailboxToFirestore = async (addr: string, tkn: string, cookieJar: any) => {
    if (!user || !db) return;
    const mailboxId = addr.split('@')[0];
    const mailboxRef = doc(db, "users", user.uid, "mailboxes", mailboxId);
    
    const mailboxData = {
      address: addr,
      token: tkn,
      cookies: cookieJar,
      isActive: true,
      timestamp: serverTimestamp()
    };

    setDoc(mailboxRef, mailboxData).catch(e => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: mailboxRef.path,
        operation: 'write',
        requestResourceData: mailboxData
      }));
    });
  };

  const startNewSession = async (force = false) => {
    if (!user) return;

    if (force && userRef) {
      const todayWIB = getWIBDate();
      const currentCount = (usage.lastReset === todayWIB) ? (usage.count || 0) : 0;

      if (currentCount >= limitCount) {
        toast({ variant: "warning", title: "Limit Reached", description: `You have used your daily identity quota for the ${tierConfig.name} plan.` });
        return;
      }

      setDoc(userRef, { 
        tempMailUsage: { count: currentCount + 1, lastReset: todayWIB } 
      }, { merge: true });
    }

    setLoading(true);
    setMessages([]);
    try {
      const res = await initMailbox();
      if (!res.status) throw new Error(res.error);
      
      setAddress(res.data.mailbox);
      setToken(res.data.token);
      setCookies(res.data.cookies);
      setLastCheck(new Date());
      
      await saveMailboxToFirestore(res.data.mailbox, res.data.token, res.data.cookies);
      
      toast({ title: "Mailbox Ready", description: "Identity provisioned and synced to cloud." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Init Error", description: err.message });
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
        setLastCheck(new Date());
      }
    } catch (err) {
      console.error("Poll error:", err);
    } finally {
      setPolling(false);
    }
  }, [token, cookies, polling]);

  useEffect(() => {
    if (address) {
      pollTimerRef.current = setInterval(checkInbox, 8000);
    }
    return () => { if (pollTimerRef.current) clearInterval(pollTimerRef.current); };
  }, [address, checkInbox]);

  const copyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    toast({ title: "Address Copied" });
  };

  const remainingIdentities = limitCount - ((usage.lastReset === getWIBDate()) ? (usage.count || 0) : 0);

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
              <CardDescription>Synced mailbox history with real-time cloud tracking.</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => startNewSession(true)} disabled={loading} className="rounded-full gap-2 border-primary/5 font-bold text-[10px] uppercase">
              <Trash2 className="size-3" /> New Identity
            </Button>
            <Button onClick={checkInbox} disabled={loading || polling} className="rounded-full gap-2 bg-indigo-600 text-white font-bold text-[10px] uppercase shadow-xl">
              {polling ? <Loader2 className="size-3 animate-spin" /> : <RefreshCw className="size-3" />} Refresh
            </Button>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border border-primary/5">
           <div className="flex items-center gap-3">
              <Zap className={cn("size-4", role === 'sultan' ? "text-yellow-600" : "text-indigo-600")} />
              <p className="text-xs font-bold font-headline">{remainingIdentities} daily identities remaining ({tierConfig.name})</p>
           </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-8 sm:p-10 pt-0 space-y-10">
        <div className="p-8 rounded-[2.5rem] bg-secondary/30 border border-primary/5 space-y-6 relative group">
           <div className="space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">Active Cloud Identity</h4>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                 <div className="h-14 flex-1 px-6 rounded-2xl bg-background border border-primary/5 flex items-center font-mono text-lg font-bold text-indigo-600 shadow-inner overflow-hidden truncate">
                    {address || (loading ? "Provisioning..." : "No active session")}
                 </div>
                 <Button onClick={copyAddress} disabled={!address} className="h-14 w-full sm:w-auto px-8 rounded-2xl bg-indigo-600 text-white font-bold gap-3 shadow-xl">
                    <Copy className="size-4" /> Copy
                 </Button>
              </div>
           </div>
           <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
              <div className={cn("size-2 rounded-full", polling ? "bg-indigo-500 animate-pulse" : "bg-emerald-500")} />
              {polling ? "Syncing..." : "Synced to Cloud"}
              <span className="mx-2">•</span>
              <Clock className="size-3" /> Last check: {lastCheck?.toLocaleTimeString() || 'N/A'}
           </div>
        </div>

        <div className="space-y-6">
           <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 ml-1 flex items-center gap-2"><Inbox className="size-3" /> Received Messages ({messages.length})</h4>
           <div className="grid grid-cols-1 gap-3">
              {messages.length > 0 ? messages.map((msg, i) => (
                <div key={msg.id} onClick={() => setSelectedMsg(msg)} className="group p-6 rounded-[2rem] bg-secondary/20 border border-primary/5 hover:bg-secondary/30 cursor-pointer animate-fade-in-up">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                     <div className="flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-indigo-500/5 text-indigo-600 flex items-center justify-center"><User className="size-6" /></div>
                        <div className="space-y-1">
                           <p className="text-sm font-bold font-headline">{msg.subject}</p>
                           <p className="text-[10px] font-bold text-muted-foreground/50 uppercase">{msg.from} • {msg.time}</p>
                        </div>
                     </div>
                     <ChevronRight className="size-4 text-muted-foreground opacity-20 group-hover:opacity-100" />
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-20 bg-secondary/10 rounded-[3rem] border-2 border-dashed border-primary/5">
                   <MailQuestion className="size-12 text-muted-foreground/20" />
                   <p className="text-sm font-bold font-headline mt-4">Awaiting Payload...</p>
                </div>
              )}
           </div>
        </div>
      </CardContent>

      <Dialog open={!!selectedMsg} onOpenChange={() => setSelectedMsg(null)}>
        <DialogContent className="sm:max-w-3xl rounded-[2.5rem] bg-card/95 backdrop-blur-xl">
          {selectedMsg && (
             <>
               <DialogHeader className="p-4">
                 <DialogTitle className="text-2xl font-bold font-headline">{selectedMsg.subject}</DialogTitle>
                 <p className="text-xs font-bold text-muted-foreground/60 uppercase">From: {selectedMsg.from}</p>
               </DialogHeader>
               <div className="p-6 bg-white/50 rounded-2xl overflow-y-auto max-h-[400px]">
                  <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: selectedMsg.content }} />
               </div>
             </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
