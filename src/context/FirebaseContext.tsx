import React, { createContext, useContext, useEffect, useEffectEvent, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { createUserByAdmin, auth, logout, signInWithEmail } from '../firebase';
import { usersApi } from '../lib/api';
import { UserProfile } from '../types';

interface FirebaseContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAuthReady: boolean;
  refreshProfile: () => Promise<void>;
  signUp: (email: string, pass: string, role?: 'admin' | 'financial' | 'operational' | 'driver' | 'viewer') => Promise<unknown>;
  signIn: (email: string, pass: string) => Promise<unknown>;
  logout: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const loadProfile = useEffectEvent(async (targetUser?: User | null) => {
    const currentUser = targetUser ?? auth.currentUser;
    if (!currentUser) {
      setUserProfile(null);
      return;
    }

    const token = await currentUser.getIdToken(true);
    const profile = await usersApi.meWithToken(token);
    setUserProfile(profile);
  });

  const refreshProfile = async () => {
    await loadProfile(auth.currentUser);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          await loadProfile(currentUser);
        } catch (error) {
          console.error('Erro ao carregar perfil do usuario:', error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
      setIsAuthReady(true);
    });

    return unsubscribe;
  }, []);

  const normalizeEmail = (identifier: string) => {
    if (identifier.includes('@')) return identifier;
    return `${identifier.toLowerCase().trim()}@novalog.test`;
  };

  const signUp = async (identifier: string, pass: string, requestedRole?: 'admin' | 'financial' | 'operational' | 'driver' | 'viewer') => {
    const email = normalizeEmail(identifier);
    const result = await createUserByAdmin(email, pass);
    await usersApi.create({
      uid: result.user.uid,
      email: result.user.email || email,
      role: requestedRole || 'driver',
      name: identifier.includes('@') ? identifier.split('@')[0] : identifier,
    });
    return result;
  };

  const signIn = async (identifier: string, pass: string) => {
    const email = normalizeEmail(identifier);
    return signInWithEmail(email, pass);
  };

  return (
    <FirebaseContext.Provider value={{ user, userProfile, loading, isAuthReady, refreshProfile, signUp, signIn, logout }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}
