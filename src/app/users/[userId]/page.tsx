
'use client';

import React, { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useFirestore, useDoc } from "@/firebase";
import { doc } from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FollowButton } from "@/components/profile/FollowButton";
import { Loader2, Calendar } from "lucide-react";
import Image from 'next/image';

export default function PublicProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const db = useFirestore();

  const userRef = useMemo(() => doc(db, "users", userId), [db, userId]);
  const { data: profile, loading } = useDoc(userRef);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary/20" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <h1 className="text-4xl font-bold font-headline">User not found</h1>
        <p className="text-muted-foreground mt-2">The user you are looking for does not exist.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/10">
      <Navbar />

      <main className="container mx-auto px-4 pt-32 pb-16 lg:pb-24 max-w-4xl">
        <div className="bg-card border border-primary/5 rounded-[2.5rem] shadow-2xl overflow-hidden">
          {/* Profile Banner */}
          <div className="relative h-48 md:h-64 bg-secondary/30">
            {profile.bannerURL ? (
              <Image 
                src={profile.bannerURL} 
                alt="Profile Banner" 
                fill 
                className="object-cover"
                unoptimized // GIFs support
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-primary/5 to-primary/10" />
            )}
          </div>

          <div className="px-8 pb-12 relative">
            {/* Avatar - overlapping the banner */}
            <div className="absolute -top-16 left-8">
              <Avatar className="w-32 h-32 border-4 border-card shadow-2xl">
                <AvatarImage src={profile.photoURL || undefined} />
                <AvatarFallback className="text-3xl bg-primary/5">
                  {profile.displayName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="pt-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold font-headline tracking-tight">{profile.displayName || "Anonymous User"}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 opacity-40" />
                    Joined {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'recently'}
                  </div>
                  <Badge variant="secondary" className="bg-primary/5 text-primary/60 rounded-full text-[10px] font-bold uppercase tracking-widest border-none">
                    NxAIO Member
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FollowButton targetUserId={userId} className="h-11 px-8 rounded-full shadow-lg shadow-primary/10" />
              </div>
            </div>

            <div className="mt-8 flex gap-8 border-t border-primary/5 pt-8">
              <div className="text-center">
                <p className="text-2xl font-bold font-headline">{profile.followersCount || 0}</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold font-headline">{profile.followingCount || 0}</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Following</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
