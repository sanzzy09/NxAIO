
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Mail, Shield, Camera, Save, LogOut, Layout, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import Image from 'next/image';
import { AvatarFrame, FrameId } from '@/components/profile/AvatarFrame';
import { cn } from '@/lib/utils';

const AVAILABLE_FRAMES: { id: FrameId; name: string; color: string }[] = [
  { id: 'none', name: 'None', color: 'bg-muted' },
  { id: 'tech', name: 'Tech Core', color: 'bg-blue-500' },
  { id: 'royal', name: 'Royal Guard', color: 'bg-yellow-500' },
  { id: 'mystic', name: 'Mystic Void', color: 'bg-purple-500' },
  { id: 'emerald', name: 'Emerald', color: 'bg-emerald-500' },
  { id: 'crimson', name: 'Crimson', color: 'bg-red-600' },
];

export default function ProfilePage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const userRef = useMemo(() => user ? doc(db, "users", user.uid) : null, [db, user]);
  const { data: profileData, loading: profileLoading } = useDoc(userRef);

  const [formData, setFormData] = useState({
    displayName: "",
    photoURL: "",
    bannerURL: "",
    frameId: "none" as FrameId
  });

  useEffect(() => {
    if (profileData) {
      setFormData({
        displayName: profileData.displayName || "",
        photoURL: profileData.photoURL || "",
        bannerURL: profileData.bannerURL || "",
        frameId: (profileData.frameId as FrameId) || "none"
      });
    }
  }, [profileData]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userRef) return;

    setSaving(true);
    try {
      await updateProfile(user, {
        displayName: formData.displayName,
        photoURL: formData.photoURL
      });

      setDoc(userRef, {
        displayName: formData.displayName,
        photoURL: formData.photoURL,
        bannerURL: formData.bannerURL,
        frameId: formData.frameId,
        updatedAt: new Date().toISOString()
      }, { merge: true }).catch(async (error) => {
        errorEmitter.emit("permission-error", new FirestorePermissionError({
          path: userRef.path,
          operation: "write",
          requestResourceData: formData
        }));
      });

      toast({
        title: "Profile updated",
        description: "Your changes have been saved successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message || "Could not update profile.",
      });
    } finally {
      setSaving(false);
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
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/10">
      <Navbar />

      <main className="pb-16 lg:pb-24">
        <div className="w-full h-64 md:h-80 lg:h-[400px] bg-secondary/30 relative overflow-hidden group shadow-inner">
          {formData.bannerURL ? (
            <Image 
              src={formData.bannerURL} 
              alt="Banner Preview" 
              fill 
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-primary/5 to-primary/10 flex items-center justify-center">
              <Layout className="w-12 h-12 text-primary/10" />
            </div>
          )}
          <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
            <Badge variant="outline" className="bg-card/80 backdrop-blur-sm border-none px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest text-primary">
              Live Banner Preview
            </Badge>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-5xl -mt-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4 space-y-6">
              <div className="flex flex-col items-center text-center space-y-4 p-8 bg-card border border-primary/5 rounded-[2.5rem] shadow-2xl backdrop-blur-xl">
                <div className="relative group">
                  <AvatarFrame 
                    src={formData.photoURL || user.photoURL}
                    fallback={formData.displayName?.charAt(0) || user.email?.charAt(0)}
                    frameId={formData.frameId}
                    size="xl"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="text-white w-6 h-6" />
                  </div>
                </div>
                <div className="space-y-1 pt-4">
                  <h2 className="text-2xl font-bold font-headline">{formData.displayName || "Account User"}</h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                
                <div className="flex gap-4 w-full justify-center py-2">
                  <div className="text-center">
                    <p className="text-lg font-bold font-headline">{profileData?.followersCount || 0}</p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground opacity-60">Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold font-headline">{profileData?.followingCount || 0}</p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground opacity-60">Following</p>
                  </div>
                </div>

                <Badge variant="secondary" className="bg-primary/5 text-primary/60 border-none px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  Professional Plan
                </Badge>
              </div>

              <Button 
                variant="outline" 
                className="w-full h-14 rounded-2xl border-primary/5 hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20 transition-all font-bold gap-3 shadow-sm bg-card"
                onClick={async () => {
                  const { auth } = require('@/firebase');
                  await auth.signOut();
                  router.push('/');
                }}
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </Button>
            </div>

            <div className="lg:col-span-8 space-y-8">
              <Card className="border-primary/5 shadow-2xl rounded-[2.5rem] overflow-hidden bg-card/80 backdrop-blur-md">
                <CardHeader className="p-8 sm:p-12 pb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/5 rounded-xl">
                      <Shield className="w-5 h-5 text-primary/40" />
                    </div>
                    <CardTitle className="text-3xl font-bold font-headline">Profile Configuration</CardTitle>
                  </div>
                  <CardDescription>Manage your visual identity and public profile metadata.</CardDescription>
                </CardHeader>

                <form onSubmit={handleUpdate}>
                  <CardContent className="p-8 sm:p-12 pt-0 space-y-10">
                    <div className="space-y-4">
                      <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">
                        <Sparkles className="w-3 h-3" /> Select Avatar Frame
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {AVAILABLE_FRAMES.map((frame) => (
                          <button
                            key={frame.id}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, frameId: frame.id }))}
                            className={cn(
                              "relative group p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3",
                              formData.frameId === frame.id 
                                ? "border-primary bg-primary/5 shadow-lg scale-[1.02]" 
                                : "border-primary/5 bg-secondary/20 hover:border-primary/10 hover:bg-secondary/40"
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
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Full Name</label>
                        <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/20 group-focus-within:text-primary transition-colors" />
                          <Input 
                            value={formData.displayName}
                            onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                            placeholder="Your Name" 
                            className="h-14 pl-12 rounded-2xl bg-secondary/30 border-primary/5 focus-visible:ring-primary/20 placeholder:text-muted-foreground/30"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Email Address</label>
                        <div className="relative opacity-50">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/20" />
                          <Input 
                            value={user.email || ""}
                            disabled
                            className="h-14 pl-12 rounded-2xl bg-secondary/30 border-primary/5 cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Avatar Image URL (Supports GIFs)</label>
                      <div className="relative group">
                        <Camera className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/20 group-focus-within:text-primary transition-colors" />
                        <Input 
                          value={formData.photoURL}
                          onChange={(e) => setFormData(prev => ({ ...prev, photoURL: e.target.value }))}
                          placeholder="https://images.unsplash.com/..." 
                          className="h-14 pl-12 rounded-2xl bg-secondary/30 border-primary/5 focus-visible:ring-primary/20 placeholder:text-muted-foreground/30"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Profile Banner URL</label>
                      <div className="relative group">
                        <Layout className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/20 group-focus-within:text-primary transition-colors" />
                        <Input 
                          value={formData.bannerURL}
                          onChange={(e) => setFormData(prev => ({ ...prev, bannerURL: e.target.value }))}
                          placeholder="https://images.unsplash.com/..." 
                          className="h-14 pl-12 rounded-2xl bg-secondary/30 border-primary/5 focus-visible:ring-primary/20 placeholder:text-muted-foreground/30"
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground/40 ml-1 italic">Provide a high-quality landscape image for your profile background.</p>
                    </div>
                  </CardContent>

                  <CardFooter className="p-8 sm:p-12 bg-secondary/20 border-t border-primary/5 flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={saving}
                      className="h-14 px-10 rounded-2xl font-bold shadow-xl shadow-primary/10 gap-2 transition-all hover:scale-[1.02]"
                    >
                      {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      Save Changes
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
