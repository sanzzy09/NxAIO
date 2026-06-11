"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { updateProfile, deleteUser } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  User, 
  Shield, 
  Camera, 
  Save, 
  ChevronLeft, 
  Sparkles, 
  Bell, 
  CreditCard, 
  Layout,
  TriangleAlert,
  Trash2,
  Lock,
  Crown
} from "lucide-react";
import { useRouter } from "next/navigation";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { AvatarFrame, FrameId } from '@/components/profile/AvatarFrame';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import Link from 'next/link';
import { logActivity } from '@/lib/activity';

const AVAILABLE_FRAMES: { id: FrameId; name: string; color: string }[] = [
  { id: 'none', name: 'None', color: 'bg-muted' },
  { id: 'tech', name: 'Tech Core', color: 'bg-blue-500' },
  { id: 'royal', name: 'Royal Guard', color: 'bg-yellow-500' },
  { id: 'mystic', name: 'Mystic Void', color: 'bg-purple-500' },
  { id: 'emerald', name: 'Emerald', color: 'bg-emerald-500' },
  { id: 'crimson', name: 'Crimson', color: 'bg-red-600' },
];

const CONFIRM_WORD = 'DELETE';

export default function SettingsPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const userRef = useMemo(() => user ? doc(db, "users", user.uid) : null, [db, user]);
  const { data: profileData, loading: profileLoading } = useDoc(userRef);

  // Subscription Logic
  const role = profileData?.role || 'free';
  const subEnd = profileData?.subscriptionEnd ? new Date(profileData.subscriptionEnd) : null;
  const isSubActive = !subEnd || subEnd > new Date();
  const isPro = role !== 'free' && isSubActive;

  const [formData, setFormData] = useState({
    displayName: "",
    photoURL: "",
    bannerURL: "",
    frameId: "none" as FrameId,
    isPrivate: false,
    productUpdates: true,
    weeklyDigest: false,
    timezone: "Asia/Jakarta"
  });

  useEffect(() => {
    if (profileData) {
      setFormData({
        displayName: profileData.displayName || "",
        photoURL: profileData.photoURL || "",
        bannerURL: profileData.bannerURL || "",
        frameId: (profileData.frameId as FrameId) || "none",
        isPrivate: profileData.isPrivate ?? false,
        productUpdates: profileData.preferences?.productUpdates ?? true,
        weeklyDigest: profileData.preferences?.weeklyDigest ?? false,
        timezone: profileData.preferences?.timezone || "Asia/Jakarta"
      });
    }
  }, [profileData]);

  // Auth Guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userRef) return;

    // Validation
    if (!isPro) {
      if (formData.photoURL?.toLowerCase().endsWith('.gif')) {
        toast({
          variant: "destructive",
          title: "Identity restriction",
          description: "Pro required for GIF avatars.",
        });
        return;
      }
      if (formData.bannerURL) {
        toast({
          variant: "destructive",
          title: "Identity restriction",
          description: "Pro required for Profile banners.",
        });
        return;
      }
    }

    setSaving(true);
    try {
      await updateProfile(user, {
        displayName: formData.displayName,
        photoURL: formData.photoURL
      });

      await setDoc(userRef, {
        displayName: formData.displayName,
        photoURL: formData.photoURL,
        bannerURL: formData.bannerURL,
        frameId: formData.frameId,
        isPrivate: formData.isPrivate,
        preferences: {
          productUpdates: formData.productUpdates,
          weeklyDigest: formData.weeklyDigest,
          timezone: formData.timezone
        },
        updatedAt: new Date().toISOString()
      }, { merge: true }).catch(async (error) => {
        errorEmitter.emit("permission-error", new FirestorePermissionError({
          path: userRef.path,
          operation: "write",
          requestResourceData: formData
        }));
      });

      logActivity(db, user.uid, 'profile_update', 'Updated profile configuration and preferences.');

      toast({
        title: "Settings synchronized",
        description: "Your platform preferences have been updated.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message || "Could not save settings.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || deleteConfirm !== CONFIRM_WORD) return;

    setDeleting(true);
    try {
      // 1. Delete Firestore User Document
      if (userRef) {
        await deleteDoc(userRef);
      }
      
      // 2. Delete Auth User
      await deleteUser(user);
      
      logActivity(db, user.uid, 'profile_update', 'Account deletion completed.');
      
      toast({
        title: "Account purged",
        description: "Your profile and data have been removed. Redirecting...",
      });
      
      router.push("/login");
    } catch (error: any) {
      // Handle Firebase sensitive operation error
      if (error.code === 'auth/requires-recent-login') {
        toast({
          variant: "destructive",
          title: "Security Timeout",
          description: "For security, please sign out and sign back in to delete your account.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Deletion failed",
          description: error.message || "Please re-authenticate and try again.",
        });
      }
    } finally {
      setDeleting(false);
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary/20" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/10">
      <Navbar />

      <main className="container mx-auto px-4 pt-32 pb-16 lg:pb-24 max-w-4xl">
        <div className="space-y-8 animate-fade-in-up">
          <Link 
            href="/profile" 
            className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-all group px-4 py-2 rounded-full hover:bg-secondary/50 w-fit"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Profile
          </Link>

          <Card className="border-primary/5 shadow-2xl rounded-[2.5rem] overflow-hidden bg-card/80 backdrop-blur-md">
            <CardHeader className="p-8 sm:p-12 pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/5 rounded-xl">
                  <Shield className="w-5 h-5 text-primary/40" />
                </div>
                <CardTitle className="text-3xl font-bold font-headline tracking-tight leading-none">Settings</CardTitle>
              </div>
              <CardDescription>Manage your profile, notifications, and platform preferences.</CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              <Tabs defaultValue="profile" className="w-full">
                <div className="px-8 sm:px-12 mb-8">
                  <TabsList className="bg-secondary/20 p-1.5 h-14 rounded-full border border-primary/5 w-full grid grid-cols-3">
                    <TabsTrigger value="profile" className="rounded-full gap-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-sm transition-all duration-300">
                      <User className="size-4" /> Profile
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="rounded-full gap-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-sm transition-all duration-300">
                      <Bell className="size-4" /> Preferences
                    </TabsTrigger>
                    <TabsTrigger value="billing" className="rounded-full gap-2 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-sm transition-all duration-300">
                      <CreditCard className="size-4" /> Billing
                    </TabsTrigger>
                  </TabsList>
                </div>

                <form onSubmit={handleUpdate}>
                  <TabsContent value="profile" className="p-8 sm:p-12 pt-0 space-y-12">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                         <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">
                           <Sparkles className="w-3 h-3" /> Avatar Frame
                         </label>
                         {!isPro && (
                           <Badge variant="outline" className="border-indigo-500/20 text-indigo-600 bg-indigo-500/5 text-[9px] font-bold gap-1 rounded-lg">
                             <Crown className="size-2" /> Pro Feature
                           </Badge>
                         )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {AVAILABLE_FRAMES.map((frame) => (
                          <button
                            key={frame.id}
                            type="button"
                            disabled={!isPro && frame.id !== 'none'}
                            onClick={() => setFormData(prev => ({ ...prev, frameId: frame.id }))}
                            className={cn(
                              "relative group p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3",
                              formData.frameId === frame.id 
                                ? "border-primary bg-primary/5 shadow-lg scale-[1.02]" 
                                : "border-primary/5 bg-secondary/20 hover:border-primary/10 hover:bg-secondary/40",
                              (!isPro && frame.id !== 'none') && "opacity-40 grayscale cursor-not-allowed border-dashed"
                            )}
                          >
                            <AvatarFrame 
                              src={formData.photoURL || user.photoURL}
                              fallback={formData.displayName?.charAt(0) || "U"}
                              frameId={frame.id}
                              size="md"
                            />
                            <span className="text-[10px] font-bold uppercase tracking-wider">{frame.name}</span>
                            {formData.frameId === frame.id && (
                              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                            )}
                            {(!isPro && frame.id !== 'none') && (
                               <Lock className="absolute top-2 left-2 size-3 text-muted-foreground/50" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Full Name</Label>
                        <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/20 group-focus-within:text-primary transition-colors" />
                          <Input 
                            value={formData.displayName}
                            onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                            placeholder="Your Name" 
                            className="h-14 pl-12 rounded-2xl bg-secondary/30 border-primary/5 focus-visible:ring-primary/20"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Timezone</Label>
                        <Select 
                          value={formData.timezone} 
                          onValueChange={(val) => setFormData(prev => ({ ...prev, timezone: val }))}
                        >
                          <SelectTrigger className="h-14 rounded-2xl bg-secondary/30 border-primary/5 focus:ring-primary/20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl bg-card border-primary/5">
                            <SelectGroup>
                              <SelectLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/40">Asia</SelectLabel>
                              <SelectItem value="Asia/Jakarta">Jakarta (GMT+7)</SelectItem>
                              <SelectItem value="Asia/Tokyo">Tokyo (GMT+9)</SelectItem>
                            </SelectGroup>
                            <SelectGroup>
                              <SelectLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/40">Americas</SelectLabel>
                              <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                              <SelectItem value="America/Sao_Paulo">Sao Paulo (GMT-3)</SelectItem>
                            </SelectGroup>
                            <SelectGroup>
                              <SelectLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/40">Europe</SelectLabel>
                              <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
                              <SelectItem value="Europe/Berlin">Berlin (GMT+1)</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1 flex items-center justify-between">
                        <span>Avatar Image URL</span>
                        {!isPro && <span className="text-[8px] text-indigo-600/60 uppercase font-bold tracking-widest">No GIFs allowed</span>}
                      </Label>
                      <div className="relative group">
                        <Camera className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/20 group-focus-within:text-primary transition-colors" />
                        <Input 
                          value={formData.photoURL}
                          onChange={(e) => setFormData(prev => ({ ...prev, photoURL: e.target.value }))}
                          placeholder="https://images.unsplash.com/..." 
                          className="h-14 pl-12 rounded-2xl bg-secondary/30 border-primary/5 focus-visible:ring-primary/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1 flex items-center justify-between">
                        <span>Profile Banner URL</span>
                        {!isPro && (
                           <Badge variant="outline" className="border-indigo-500/20 text-indigo-600 bg-indigo-500/5 text-[9px] font-bold gap-1 rounded-lg">
                             <Lock className="size-2" /> Locked for Pro
                           </Badge>
                         )}
                      </Label>
                      <div className="relative group">
                        <Layout className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/20 group-focus-within:text-primary transition-colors" />
                        <Input 
                          value={formData.bannerURL}
                          disabled={!isPro}
                          onChange={(e) => setFormData(prev => ({ ...prev, bannerURL: e.target.value }))}
                          placeholder={isPro ? "https://images.unsplash.com/..." : "Unlock with Pro Identity"} 
                          className={cn(
                            "h-14 pl-12 rounded-2xl bg-secondary/30 border-primary/5 focus-visible:ring-primary/20",
                            !isPro && "opacity-50 cursor-not-allowed bg-muted/50 border-dashed"
                          )}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 gap-4 items-center">
                      <Button 
                        type="submit" 
                        disabled={saving}
                        className="h-14 px-10 rounded-2xl font-bold shadow-xl shadow-primary/10 gap-2 transition-all hover:scale-[1.02]"
                      >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Save Settings
                      </Button>
                    </div>

                    <div className="pt-12 border-t border-destructive/10">
                      <div className="bg-destructive/5 rounded-[2.5rem] border border-destructive/10 p-8 sm:p-12 space-y-6">
                        <div className="space-y-1">
                          <h3 className="text-xl font-bold font-headline text-destructive flex items-center gap-2">
                            <Trash2 className="w-5 h-5" /> Danger Zone
                          </h3>
                          <p className="text-sm text-muted-foreground">Permanently remove your account and all of its data. This cannot be undone.</p>
                        </div>

                        <Dialog onOpenChange={() => setDeleteConfirm('')}>
                          <DialogTrigger asChild>
                            <Button variant="destructive" className="h-14 w-full sm:w-auto px-10 rounded-2xl font-bold shadow-xl shadow-destructive/10">
                              Delete Account
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md rounded-[2.5rem] border-none shadow-2xl">
                            <DialogHeader className="space-y-4">
                              <div className="bg-destructive/10 text-destructive mb-2 flex size-12 items-center justify-center rounded-2xl">
                                <TriangleAlert className="size-6" />
                              </div>
                              <DialogTitle className="text-2xl font-bold font-headline">Are you absolutely sure?</DialogTitle>
                              <DialogDescription className="text-muted-foreground leading-relaxed">
                                This deletes your profile, activity history, and following data. To confirm, type <span className="font-bold text-foreground">"{CONFIRM_WORD}"</span> below.
                              </DialogDescription>
                            </DialogHeader>

                            <div className="flex flex-col gap-3 py-4">
                              <Label htmlFor="confirm-delete" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">
                                Confirm by typing {CONFIRM_WORD}
                              </Label>
                              <Input
                                id="confirm-delete"
                                value={deleteConfirm}
                                onChange={(e) => setDeleteConfirm(e.target.value)}
                                placeholder={CONFIRM_WORD}
                                autoComplete="off"
                                className="h-14 rounded-2xl bg-secondary/30 border-primary/5 focus-visible:ring-destructive/20 text-center font-bold tracking-widest uppercase"
                              />
                            </div>

                            <DialogFooter>
                              <Button
                                variant="destructive"
                                className="w-full h-14 rounded-2xl font-bold text-base shadow-xl shadow-destructive/10"
                                disabled={deleteConfirm !== CONFIRM_WORD || deleting}
                                onClick={handleDeleteAccount}
                              >
                                {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Delete this account"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="notifications" className="p-8 sm:p-12 pt-0 space-y-6">
                    <div className="space-y-4">
                       <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/40 ml-1 flex items-center gap-2">
                         <Shield className="w-3 h-3" /> Account Privacy
                       </h3>
                       <div className="flex items-center justify-between rounded-[2rem] border border-primary/5 bg-secondary/20 p-6 md:p-8 hover:bg-secondary/30 transition-all">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold font-headline uppercase tracking-wider flex items-center gap-2">
                            <Lock className="w-3.5 h-3.5" /> Private Account
                          </span>
                          <span className="text-muted-foreground text-xs">When active, only you can see your profile details.</span>
                        </div>
                        <Switch 
                          checked={formData.isPrivate} 
                          onCheckedChange={(val) => setFormData(prev => ({ ...prev, isPrivate: val }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-4 pt-6">
                      <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/40 ml-1 flex items-center gap-2">
                        <Bell className="w-3 h-3" /> Communication
                      </h3>
                      <div className="flex items-center justify-between rounded-[2rem] border border-primary/5 bg-secondary/20 p-6 md:p-8">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold font-headline uppercase tracking-wider">Product updates</span>
                          <span className="text-muted-foreground text-xs">News about features and releases.</span>
                        </div>
                        <Switch 
                          checked={formData.productUpdates} 
                          onCheckedChange={(val) => setFormData(prev => ({ ...prev, productUpdates: val }))}
                        />
                      </div>

                      <div className="flex items-center justify-between rounded-[2rem] border border-primary/5 bg-secondary/20 p-6 md:p-8">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold font-headline uppercase tracking-wider">Weekly digest</span>
                          <span className="text-muted-foreground text-xs">A summary of activity every Monday morning.</span>
                        </div>
                        <Switch 
                          checked={formData.weeklyDigest} 
                          onCheckedChange={(val) => setFormData(prev => ({ ...prev, weeklyDigest: val }))}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button 
                        type="submit" 
                        disabled={saving}
                        className="h-14 px-10 rounded-2xl font-bold shadow-xl shadow-primary/10 gap-2 transition-all hover:scale-[1.02]"
                      >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Save Preferences
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="billing" className="p-8 sm:p-12 pt-0 space-y-6">
                    <div className={cn(
                      "flex items-center justify-between rounded-[2rem] border p-8 transition-all",
                      role === 'free' ? "bg-secondary/20 border-primary/5" : "bg-primary text-primary-foreground border-primary/20"
                    )}>
                      <div className="flex flex-col gap-2">
                        <span className="text-lg font-bold font-headline capitalize">{role} Identity</span>
                        <span className={cn(
                          "text-xs uppercase tracking-widest font-medium opacity-60",
                          role === 'free' ? "text-muted-foreground" : "text-primary-foreground"
                        )}>
                          {isPro ? `Active Subscription · Expires Oct 2025` : 'Standard Identity · Free Forever'}
                        </span>
                      </div>
                      <Button variant={role === 'free' ? "default" : "outline"} asChild className={cn(
                        "rounded-full px-8 font-bold",
                        role !== 'free' && "bg-white/10 border-white/20 text-white hover:bg-white/20"
                      )}>
                        <Link href="/pricing">{role === 'free' ? "Upgrade" : "Manage"}</Link>
                      </Button>
                    </div>
                    
                    {isPro && (
                      <div className="p-8 rounded-[2rem] border border-primary/5 bg-secondary/10 space-y-4">
                         <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">Recent Transactions</h4>
                         <div className="flex justify-between items-center text-sm py-2 border-b border-primary/5">
                            <span className="text-muted-foreground font-medium">Identity Upgrade: {role}</span>
                            <span className="font-mono text-xs opacity-60">Just now</span>
                         </div>
                      </div>
                    )}
                  </TabsContent>
                </form>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
