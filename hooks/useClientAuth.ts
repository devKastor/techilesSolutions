'use client';

import { useEffect, useState } from 'react';
import { User } from '@/lib/types';
import { onAuthStateChange, signOut as firebaseSignOut } from '@/lib/auth';

export function useClientAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    await firebaseSignOut();
    setUser(null);
  };

  return { user, isLoading, signOut };
}
