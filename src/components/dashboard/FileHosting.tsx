
"use client"

import React, { useState, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  CloudUpload, 
  Loader2, 
  FileIcon, 
  ExternalLink,
  Copy,
  Info,
  Clock,
  Trash2,
  Download,
  Link as LinkIcon,
  ShieldCheck,
  Zap,
  FolderOpen,
  Search,
  History,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadToHosting, getBucket } from "@/app/actions/filegoat";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { doc, setDoc, collection, query, orderBy, serverTimestamp } from "firebase/firestore";
import { logActivity } from "@/lib/activity";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface FileDetail {
  name: string;
  size: number;
  direct: string;
  download: string;
  downloads?: number;
}

export function FileHosting() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [files, setFiles] = useState<File[]>([]);
  const [days, setDays] = useState("7");
  const [extendOnView, setExtendOnView] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch History from Firestore
  const historyQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "users", user.uid, "uploads"),
      orderBy("timestamp", "desc")
    );
  }, [db, user]);

  const { data: history, loading: historyLoading } = useCollection(historyQuery);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      setError(null);
      setResult(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setFiles(Array.from(e.dataTransfer.files));
      setError(null);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!files.length) return;

    setLoading(true);
    setError(null);
    setStatus("Initiating encrypted stream...");

    const formData = new FormData();
    files.forEach(f => formData.append('files', f));

    try {
      const res = await uploadToHosting(formData, { days: parseInt(days), extendOnView });
      if (!res.status) throw new Error(res.error);

      setResult(res.data);
      
      // Save to history if logged in
      if (user) {
        const uploadId = res.data.slug;
        const uploadRef = doc(db, "users", user.uid, "uploads", uploadId);
        const record = {
          slug: res.data.slug,
          url: res.data.url,
          expires: parseInt(days),
          timestamp: serverTimestamp(),
          fileCount: res.data.files.length,
          totalSize: files.reduce((acc, f) => acc + f.size, 0),
          status: "active"
        };

        setDoc(uploadRef, record).catch(e => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: uploadRef.path,
            operation: 'write',
            requestResourceData: record
          }));
        });

        logActivity(db, user.uid, 'file_upload', `Uploaded ${res.data.files.length} files to bucket ${res.data.slug}.`, { slug: res.data.slug });
      }

      toast({
        title: "Bucket Created",
        description: "Your files are now live and accessible.",
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setStatus("");
    }
  };

  const handleFetchFromHistory = async (slug: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getBucket(slug);
      if (!res.status) throw new Error(res.error);
      setResult(res.data);
    } catch (err: any) {
      setError("Failed to retrieve bucket data. It may have expired.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${label} Copied`,
      description: "Link added to your clipboard.",
    });
  };

  const clear = () => {
    setFiles([]);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md overflow-hidden rounded-[2.5rem]">
      <CardHeader className="p-8 sm:p-10 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-600 rounded-xl">
              <CloudUpload className="size-6" />
            </div>
            <div>
              <CardTitle className="font-headline text-2xl">FileGoat Hosting</CardTitle>
              <CardDescription>Premium decentralized storage with auto-expiry buckets.</CardDescription>
            </div>
          </div>
          {(files.length > 0 || result) && (
            <Button variant="ghost" size="icon" onClick={clear} className="rounded-full hover:bg-destructive/5 hover:text-destructive">
              <Trash2 className="size-5" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-8 sm:p-10 pt-0 space-y-8">
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="bg-secondary/30 p-1 rounded-full border border-primary/5 mb-8 grid grid-cols-2 max-w-[400px]">
            <TabsTrigger value="upload" className="rounded-full gap-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">
              <CloudUpload className="size-3" /> New Upload
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-full gap-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">
              <History className="size-3" /> My History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-8 mt-0 animate-fade-in-up">
            {!result ? (
              <div className="space-y-8">
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className={cn(
                    "group relative border-2 border-dashed rounded-[2rem] p-12 flex flex-col items-center justify-center transition-all duration-300",
                    files.length > 0 ? "border-indigo-500/50 bg-indigo-500/5" : "border-primary/5 bg-secondary/10 hover:border-indigo-500/20 hover:bg-secondary/20"
                  )}
                >
                  {files.length > 0 ? (
                    <div className="text-center space-y-4">
                      <div className="p-4 bg-indigo-500/10 rounded-2xl mx-auto w-fit">
                        <FolderOpen className="size-10 text-indigo-600" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-sm">{files.length} file(s) selected</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                          Total: {formatSize(files.reduce((acc, f) => acc + f.size, 0))}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="p-4 bg-secondary rounded-full mx-auto w-fit group-hover:scale-110 transition-transform duration-500">
                        <CloudUpload className="size-8 text-muted-foreground" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-sm">Drop your files here</p>
                        <p className="text-xs text-muted-foreground">Any format up to 100MB per file</p>
                      </div>
                      <Button 
                        variant="link" 
                        onClick={() => fileInputRef.current?.click()}
                        className="text-indigo-600 font-bold text-xs uppercase tracking-widest"
                      >
                        Browse Files
                      </Button>
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    className="hidden"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4 p-6 rounded-[2rem] bg-secondary/20 border border-primary/5">
                    <div className="flex items-center gap-2 mb-2">
                       <Clock className="size-3 text-indigo-600" />
                       <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Expiration Rules</span>
                    </div>
                    <Select value={days} onValueChange={setDays}>
                      <SelectTrigger className="h-12 rounded-xl bg-background border-primary/5">
                        <SelectValue placeholder="Storage Duration" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-primary/5 bg-card">
                        <SelectItem value="1">1 Day</SelectItem>
                        <SelectItem value="3">3 Days</SelectItem>
                        <SelectItem value="7">7 Days (Default)</SelectItem>
                        <SelectItem value="30">30 Days</SelectItem>
                        <SelectItem value="90">90 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4 p-6 rounded-[2rem] bg-secondary/20 border border-primary/5">
                    <div className="flex items-center justify-between">
                       <div className="space-y-1">
                         <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                           <Zap className="size-3 text-indigo-600" /> Extend on View
                         </span>
                         <p className="text-[10px] text-muted-foreground/60 leading-tight">Lifetime resets every time the link is visited.</p>
                       </div>
                       <Switch checked={extendOnView} onCheckedChange={setExtendOnView} />
                    </div>
                  </div>
                </div>

                <Button 
                  disabled={!files.length || loading}
                  onClick={handleUpload}
                  className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xl shadow-indigo-500/10 transition-all active:scale-95"
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="size-5 animate-spin" />
                      <span>{status}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Zap className="size-5" />
                      <span>Create Bucket</span>
                    </div>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-8 animate-fade-in-up">
                <div className="p-8 rounded-[2.5rem] bg-secondary/30 border border-indigo-500/10 space-y-6">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-indigo-600/10 text-indigo-600 border-none px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                          <ShieldCheck className="size-3 mr-2" /> Bucket Live
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Slug: {result.slug}</span>
                      </div>
                      <Button onClick={() => copyToClipboard(result.url, "Bucket URL")} variant="ghost" size="sm" className="rounded-full gap-2 text-[10px] uppercase font-bold">
                        <LinkIcon className="size-3" /> Share Bucket
                      </Button>
                   </div>

                   <div className="space-y-4">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">Asset Directory</h4>
                      <div className="grid grid-cols-1 gap-3">
                         {result.files.map((file: FileDetail, i: number) => (
                           <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-background border border-primary/5 hover:border-indigo-500/20 transition-all gap-4">
                              <div className="flex items-center gap-4">
                                 <div className="p-3 bg-indigo-500/5 text-indigo-600 rounded-xl">
                                    <FileIcon className="size-5" />
                                 </div>
                                 <div className="space-y-1">
                                    <p className="text-sm font-bold truncate max-w-[200px]">{file.name}</p>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase opacity-50">{formatSize(file.size)}</p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-2">
                                 <Button variant="ghost" size="sm" onClick={() => copyToClipboard(file.direct, "Direct Link")} className="h-10 rounded-xl gap-2 font-bold text-[10px] uppercase">
                                    <Copy className="size-3.5" />
                                 </Button>
                                 <Button asChild variant="outline" size="sm" className="h-10 px-4 rounded-xl gap-2 font-bold text-[10px] uppercase border-primary/5 hover:bg-secondary/50">
                                    <a href={file.direct} target="_blank" rel="noopener noreferrer">
                                       <ExternalLink className="size-3.5" /> View
                                    </a>
                                 </Button>
                                 <Button asChild size="sm" className="h-10 px-6 rounded-xl gap-2 font-bold text-[10px] uppercase bg-indigo-600 hover:bg-indigo-700 text-white">
                                    <a href={file.download} target="_blank" rel="noopener noreferrer">
                                       <Download className="size-3.5" /> Get
                                    </a>
                                 </Button>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>

                   <div className="flex items-center gap-4 p-5 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                      <Info className="size-4 text-indigo-600" />
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        This bucket will expire in <span className="font-bold text-indigo-600">{result.expires} days</span>. Check "My History" to access this bucket later.
                      </p>
                   </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-6 mt-0 animate-fade-in-up">
            {historyLoading ? (
               <div className="flex flex-col items-center justify-center py-20 space-y-4">
                 <Loader2 className="size-10 animate-spin text-indigo-500/20" />
                 <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Synchronizing History...</p>
               </div>
            ) : !user ? (
              <div className="p-12 text-center bg-secondary/10 rounded-[2.5rem] border border-dashed border-primary/5 space-y-4">
                 <ShieldCheck className="size-10 text-muted-foreground/20 mx-auto" />
                 <p className="text-sm text-muted-foreground font-medium">History requires an active account session.</p>
              </div>
            ) : history && history.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {history.map((record: any) => (
                  <button 
                    key={record.id}
                    onClick={() => handleFetchFromHistory(record.slug)}
                    disabled={loading}
                    className="flex items-center justify-between p-6 rounded-2xl bg-secondary/20 border border-primary/5 hover:border-indigo-500/30 hover:bg-secondary/40 transition-all text-left group"
                  >
                    <div className="flex items-center gap-5">
                      <div className="size-12 rounded-xl bg-indigo-500/5 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FolderOpen className="size-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold uppercase tracking-wider">{record.slug}</p>
                        <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                          <span>{record.fileCount} Files</span>
                          <span>·</span>
                          <span>{formatSize(record.totalSize || 0)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className="text-[9px] font-bold uppercase text-muted-foreground/40 bg-background/50 px-2 py-1 rounded-lg">
                         Expires in {record.expires}d
                       </span>
                       <ChevronRight className="size-4 text-muted-foreground opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center bg-secondary/10 rounded-[2.5rem] border border-dashed border-primary/5 space-y-4">
                 <FolderOpen className="size-10 text-muted-foreground/20 mx-auto" />
                 <p className="text-sm text-muted-foreground font-medium italic">No uploads found in your history.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {error && (
          <div className="p-5 rounded-[1.5rem] bg-destructive/5 border border-destructive/10 flex items-start gap-3 animate-fade-in-up">
            <Info className="size-5 text-destructive mt-0.5" />
            <div className="space-y-1">
               <p className="text-sm text-destructive font-bold">Operation Failed</p>
               <p className="text-xs text-destructive/80 font-medium leading-relaxed">{error}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
