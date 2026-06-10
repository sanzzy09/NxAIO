
"use client";

import React, { useMemo } from 'react';
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useUser, useFirestore, useDoc, useCollection } from "@/firebase";
import { doc, collection, query, orderBy, limit } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  LogOut, 
  Layout, 
  Settings, 
  Activity, 
  ArrowUpRight, 
  Sparkles, 
  LogIn, 
  UserPlus, 
  Heart, 
  HeartOff,
  Crown
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import { AvatarFrame, FrameId } from '@/components/profile/AvatarFrame';
import Link from 'next/link';
import { logActivity } from '@/lib/activity';
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();

  const userRef = useMemo(() => user ? doc(db, "users", user.uid) : null, [db, user]);
  const { data: profileData, loading: profileLoading } = useDoc(userRef);

  // Subscription Logic
  const role = profileData?.role || 'free';
  const subEnd = profileData?.subscriptionEnd ? new Date(profileData.subscriptionEnd) : null;
  const isSubActive = !subEnd || subEnd > new Date();
  const isPro = role !== 'free' && isSubActive;

  // Real-time Activity Logs
  const activitiesQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "users", user.uid, "activities"),
      orderBy("timestamp", "desc"),
      limit(10)
    );
  }, [db, user]);

  const { data: activities, loading: activitiesLoading } = useCollection(activitiesQuery);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return <LogIn className="w-5 h-5" />;
      case 'signup': return <UserPlus className="w-5 h-5" />;
      case 'profile_update': return <Settings className="w-5 h-5" />;
      case 'follow': return <Heart className="w-5 h-5 text-emerald-500" />;
      case 'unfollow': return <HeartOff className="w-5 h-5 text-destructive" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'login': return 'bg-blue-500/10 text-blue-500';
      case 'signup': return 'bg-emerald-500/10 text-emerald-500';
      case 'profile_update': return 'bg-purple-500/10 text-purple-500';
      case 'follow': return 'bg-emerald-500/10 text-emerald-500';
      case 'unfollow': return 'bg-destructive/10 text-destructive';
      default: return 'bg-secondary text-muted-foreground';
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

  const handleSignOut = async () => {
    const { auth } = require('@/firebase');
    logActivity(db, user.uid, 'logout', 'Logged out of the session.');
    await auth.signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/10">
      <Navbar />

      <main className="pb-16 lg:pb-24">
        {/* Immersive Full-Width Banner - Only for Pro */}
        <div className="w-full h-64 md:h-80 lg:h-[400px] bg-secondary/30 relative overflow-hidden group shadow-inner">
          {isPro && profileData?.bannerURL ? (
            <Image 
              src={profileData.bannerURL} 
              alt="Banner" 
              fill 
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-primary/5 to-primary/10 flex items-center justify-center">
              {isPro ? (
                <Layout className="w-12 h-12 text-primary/10" />
              ) : (
                <div className="text-center space-y-2">
                   <Crown className="w-10 h-10 text-primary/5 mx-auto" />
                   <p className="text-[10px] font-bold uppercase tracking-widest text-primary/10">Banner restricted to Pro</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="container mx-auto px-4 max-w-5xl -mt-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Sidebar Info */}
            <div className="lg:col-span-4 space-y-6">
              <div className="flex flex-col items-center text-center space-y-4 p-8 bg-card border border-primary/5 rounded-[2.5rem] shadow-2xl backdrop-blur-xl">
                <AvatarFrame 
                  src={profileData?.photoURL || user.photoURL}
                  fallback={profileData?.displayName?.charAt(0) || user.email?.charAt(0)}
                  frameId={isPro ? ((profileData?.frameId as FrameId) || 'none') : 'none'}
                  size="xl"
                />
                
                <div className="space-y-1 pt-4">
                  <h2 className="text-2xl font-bold font-headline">{profileData?.displayName || "Account User"}</h2>
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

                <Badge variant="secondary" className={cn(
                  "border-none px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                  role === 'sultan' ? "bg-yellow-500/10 text-yellow-600" : role === 'pro' ? "bg-indigo-500/10 text-indigo-600" : "bg-primary/5 text-primary/60"
                )}>
                  {isPro ? `${role} Identity` : 'Free Identity'}
                </Badge>

                {!isPro && (
                  <p className="text-[9px] text-muted-foreground font-medium italic opacity-60 px-4">GIFs and Banners are locked for your identity.</p>
                )}

                <div className="w-full pt-4 space-y-3">
                  <Button asChild className="w-full h-12 rounded-2xl font-bold gap-2 shadow-lg shadow-primary/10">
                    <Link href="/settings">
                      <Settings className="w-4 h-4" /> Account Settings
                    </Link>
                  </Button>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full h-14 rounded-2xl border-primary/5 hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20 transition-all font-bold gap-3 shadow-sm bg-card"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </Button>
            </div>

            {/* Right Activity Column */}
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-card border border-primary/5 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl bg-card/80 backdrop-blur-md min-h-[400px]">
                <div className="flex items-center justify-between mb-8">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary/40" />
                      <h3 className="text-2xl font-bold font-headline">Recent Activity</h3>
                    </div>
                    <p className="text-muted-foreground text-sm">Real-time logs of your actions on the platform.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {activitiesLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/30">
                      <Loader2 className="w-8 h-8 animate-spin mb-4" />
                      <p className="text-xs font-bold uppercase tracking-widest">Synchronizing Logs...</p>
                    </div>
                  ) : (activities?.length || 0) > 0 ? (
                    activities?.map((activity: any) => (
                      <div key={activity.id} className="group flex items-center justify-between p-6 rounded-3xl border border-primary/5 hover:border-primary/10 hover:bg-secondary/30 transition-all animate-fade-in-up">
                        <div className="flex items-center gap-4">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", getActivityColor(activity.type))}>
                            {getActivityIcon(activity.type)}
                          </div>
                          <div>
                            <p className="text-sm font-bold font-headline">{activity.description}</p>
                            <p className="text-xs text-muted-foreground opacity-60">
                              {activity.type.replace('_', ' ')} event
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-40">
                          {activity.timestamp ? new Date(activity.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'just now'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/20 italic">
                      <p>No activity logs found.</p>
                    </div>
                  )}
                </div>

                {(activities?.length || 0) > 0 && (
                  <div className="mt-12 flex justify-center">
                    <Button variant="ghost" className="text-muted-foreground text-xs font-bold uppercase tracking-widest gap-2">
                      View full history <ArrowUpRight className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
