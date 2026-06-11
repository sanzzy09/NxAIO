'use client';

import React, { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useFirestore, useDoc, useUser } from "@/firebase";
import { doc } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { FollowButton } from "@/components/profile/FollowButton";
import { Loader2, Calendar, Lock, ShieldAlert } from "lucide-react";
import { GradualSpacingText } from "@/components/ui/gradual-spacing-text";
import Image from 'next/image';
import { AvatarFrame, FrameId } from '@/components/profile/AvatarFrame';

export default function PublicProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const { user: currentUser } = useUser();
  const db = useFirestore();

  const userRef = useMemo(() => doc(db, "users", userId), [db, userId]);
  const { data: profile, loading, error } = useDoc(userRef);

  const isOwner = currentUser?.uid === userId;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary/20" />
      </div>
    );
  }

  // Handle case where profile is private or not found (blocked by rules or doesn't exist)
  if (!profile || (profile.isPrivate && !isOwner)) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-8 animate-fade-in-up">
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-secondary/50 flex items-center justify-center border-4 border-primary/5 shadow-2xl">
                <Lock className="w-10 h-10 text-primary/40" />
              </div>
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-bold font-headline tracking-tight flex justify-center">
                <GradualSpacingText text="This account is private" />
              </h1>
              <p className="text-muted-foreground leading-relaxed animate-fade-in-up [animation-delay:400ms]">
                The owner of this profile has chosen to keep their identity and activity restricted to their own view.
              </p>
            </div>
            <div className="pt-4 animate-fade-in-up [animation-delay:600ms]">
              <Badge variant="outline" className="rounded-full px-6 py-1.5 border-primary/10 text-primary/40 font-bold uppercase tracking-widest text-[10px]">
                Restricted Access
              </Badge>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/10">
      <Navbar />

      <main className="pb-16 lg:pb-24">
        <div className="relative w-full h-64 md:h-80 lg:h-[450px] bg-secondary/30 overflow-hidden shadow-inner">
          {profile.bannerURL ? (
            <Image 
              src={profile.bannerURL} 
              alt="Profile Banner" 
              fill 
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-primary/5 to-primary/10" />
          )}
        </div>

        <div className="container mx-auto px-4 max-w-4xl -mt-24 relative z-10">
          <div className="bg-card border border-primary/5 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-xl overflow-hidden">
            <div className="px-8 pb-12 relative">
              <div className="absolute -top-16 left-8">
                <AvatarFrame 
                  src={profile.photoURL}
                  fallback={profile.displayName?.charAt(0) || "U"}
                  frameId={profile.frameId as FrameId}
                  size="xl"
                  className="bg-card rounded-full p-1"
                />
              </div>

              <div className="pt-24 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h1 className="text-4xl font-bold font-headline tracking-tight leading-none">
                      <GradualSpacingText text={profile.displayName || "Anonymous User"} className="justify-start" />
                    </h1>
                    {profile.isPrivate && (
                      <Badge variant="outline" className="border-primary/20 text-primary/40">
                        <Lock className="w-3 h-3 mr-1" /> Private
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground animate-fade-in-up [animation-delay:400ms]">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 opacity-40" />
                      Joined {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'recently'}
                    </div>
                    <Badge variant="secondary" className="bg-primary/5 text-primary/60 rounded-full text-[10px] font-bold uppercase tracking-widest border-none">
                      Verified Member
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3 animate-fade-in-up [animation-delay:600ms]">
                  <FollowButton targetUserId={userId} className="h-12 px-10 rounded-full shadow-xl shadow-primary/10 font-bold" />
                </div>
              </div>

              <div className="mt-10 flex gap-10 border-t border-primary/5 pt-10 animate-fade-in-up [animation-delay:800ms]">
                <div className="text-left group cursor-pointer">
                  <p className="text-3xl font-bold font-headline group-hover:text-primary transition-colors">{profile.followersCount || 0}</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 group-hover:text-muted-foreground transition-colors">Followers</p>
                </div>
                <div className="text-left group cursor-pointer">
                  <p className="text-3xl font-bold font-headline group-hover:text-primary transition-colors">{profile.followingCount || 0}</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 group-hover:text-muted-foreground transition-colors">Following</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}