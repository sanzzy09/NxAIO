
import { Firestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export type ActivityType = 'login' | 'logout' | 'signup' | 'profile_update' | 'follow' | 'unfollow';

export function logActivity(
  db: Firestore,
  userId: string,
  type: ActivityType,
  description: string,
  metadata?: Record<string, any>
) {
  const activitiesRef = collection(db, 'users', userId, 'activities');
  
  const activityData = {
    type,
    description,
    timestamp: serverTimestamp(),
    metadata: metadata || {},
  };

  addDoc(activitiesRef, activityData).catch(async (error) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: activitiesRef.path,
      operation: 'create',
      requestResourceData: activityData,
    }));
  });
}
