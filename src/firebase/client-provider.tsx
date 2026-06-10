'use client';

import React, { useEffect, useState } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const [firebase, setFirebase] = useState<ReturnType<typeof initializeFirebase> | null>(null);

  useEffect(() => {
    setFirebase(initializeFirebase());
  }, []);

  if (!firebase) {
    return null; // Or a loading spinner
  }

  return (
    <FirebaseProvider
      app={firebase.app}
      firestore={firebase.firestore}
      auth={firebase.auth}
    >
      <FirebaseErrorListener />
      {children}
    </FirebaseProvider>
  );
}
