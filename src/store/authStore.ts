import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: any | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: any | null) => void;
  setLoading: (isLoading: boolean) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isLoading: true,
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setLoading: (isLoading) => set({ isLoading }),
      signOut: () => set({ user: null, session: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, session: state.session }),
    }
  )
); 