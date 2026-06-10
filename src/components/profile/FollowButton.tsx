
'use client';

import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, setDoc, deleteDoc, serverTimestamp, increment, updateDoc } from 'firebase/firestore';
import { Loader2, UserPlus, UserMinus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface FollowButtonProps {
  targetUserId: string;
  className?: string;
}

export function FollowButton({ targetUserId, className }: FollowButtonProps) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  // Reference to check if current user is following the target user
  const followRef = useMemo(() => 
    user ? doc(db, 'users', user.uid, 'following', targetUserId) : null
  , [db, user, targetUserId]);

  const { data: followData, loading } = useDoc(followRef);
  const isFollowing = !!followData;

  const handleFollowAction = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to follow users.",
        variant: "destructive"
      });
      return;
    }

    if (user.uid === targetUserId) return;

    const myFollowingRef = doc(db, 'users', user.uid, 'following', targetUserId);
    const theirFollowerRef = doc(db, 'users', targetUserId, 'followers', user.uid);
    const myProfileRef = doc(db, 'users', user.uid);
    const theirProfileRef = doc(db, 'users', targetUserId);

    if (isFollowing) {
      // Unfollow
      deleteDoc(myFollowingRef).catch(e => emitError(myFollowingRef.path, 'delete'));
      deleteDoc(theirFollowerRef).catch(e => emitError(theirFollowerRef.path, 'delete'));
      
      // Decrement counts (Optimistic updates via increment)
      updateDoc(myProfileRef, { followingCount: increment(-1) });
      updateDoc(theirProfileRef, { followersCount: increment(-1) });
    } else {
      // Follow
      const timestamp = serverTimestamp();
      setDoc(myFollowingRef, { uid: targetUserId, timestamp }).catch(e => emitError(myFollowingRef.path, 'write'));
      setDoc(theirFollowerRef, { uid: user.uid, timestamp }).catch(e => emitError(theirFollowerRef.path, 'write'));
      
      // Increment counts
      updateDoc(myProfileRef, { followingCount: increment(1) });
      updateDoc(theirProfileRef, { followersCount: increment(1) });
    }
  };

  const emitError = (path: string, operation: 'write' | 'delete') => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path,
      operation,
    }));
  };

  if (loading) return <Button disabled size="sm" variant="outline" className={className}><Loader2 className="w-3 h-3 animate-spin" /></Button>;
  if (user?.uid === targetUserId) return null;

  return (
    <Button 
      onClick={handleFollowAction}
      variant={isFollowing ? "outline" : "default"}
      size="sm"
      className={className}
    >
      {isFollowing ? (
        <><UserMinus className="w-4 h-4 mr-2" /> Unfollow</>
      ) : (
        <><UserPlus className="w-4 h-4 mr-2" /> Follow</>
      )}
    </Button>
  );
}
