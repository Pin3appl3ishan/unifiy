import { create } from 'zustand';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// Profile type matching Supabase profiles table
export interface Profile {
  id: string;
  tier: 'free' | 'premium';
  currentWorkspaceId: string | null;
  onboardingComplete: boolean;
}

// Supabase row type
interface SupabaseProfile {
  id: string;
  tier: 'free' | 'premium';
  current_workspace_id: string | null;
  onboarding_complete: boolean;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  profileLoading: boolean;
  error: string | null;

  // Auth actions
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;

  // Profile actions
  fetchProfile: () => Promise<Profile | null>;
  updateProfile: (updates: Partial<Pick<Profile, 'currentWorkspaceId' | 'onboardingComplete'>>) => Promise<void>;

  clearError: () => void;
}

// Convert Supabase row to Profile
const toProfile = (row: SupabaseProfile): Profile => ({
  id: row.id,
  tier: row.tier,
  currentWorkspaceId: row.current_workspace_id,
  onboardingComplete: row.onboarding_complete,
});

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  loading: true,
  profileLoading: false,
  error: null,

  signUp: async (email: string, password: string) => {
    set({ loading: true, error: null });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      set({ loading: false, error: error.message });
      return { error };
    }

    set({
      user: data.user,
      session: data.session,
      loading: false,
      error: null,
    });

    // Fetch profile after signup (profile is created via Supabase trigger)
    if (data.user) {
      await get().fetchProfile();
    }

    return { error: null };
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true, error: null });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      set({ loading: false, error: error.message });
      return { error };
    }

    set({
      user: data.user,
      session: data.session,
      loading: false,
      error: null,
    });

    // Fetch profile after sign in
    if (data.user) {
      await get().fetchProfile();
    }

    return { error: null };
  },

  signOut: async () => {
    set({ loading: true });

    await supabase.auth.signOut();

    set({
      user: null,
      session: null,
      profile: null,
      loading: false,
      error: null,
    });
  },

  initialize: async () => {
    set({ loading: true });

    // Get current session
    const { data: { session } } = await supabase.auth.getSession();

    set({
      user: session?.user ?? null,
      session,
      loading: false,
    });

    // Fetch profile if user exists
    if (session?.user) {
      await get().fetchProfile();
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentProfile = get().profile;
      const currentUserId = get().user?.id;
      const newUserId = session?.user?.id;

      set({
        user: session?.user ?? null,
        session,
      });

      if (session?.user) {
        // Only fetch profile if:
        // 1. We don't have one yet, OR
        // 2. User ID changed (different user logged in)
        // This prevents re-fetching on tab switches which trigger auth state changes
        const userChanged = currentUserId !== newUserId;
        const needsProfile = !currentProfile || userChanged;

        if (needsProfile) {
          await get().fetchProfile();
        }
      } else {
        set({ profile: null });
      }
    });
  },

  fetchProfile: async () => {
    const user = get().user;
    if (!user) return null;

    set({ profileLoading: true });

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        // Profile might not exist yet (new user)
        if (error.code === 'PGRST116') {
          console.log('[AuthStore] Profile not found, may need to create one');
          set({ profileLoading: false });
          return null;
        }
        throw error;
      }

      const profile = toProfile(data);
      set({ profile, profileLoading: false });
      return profile;
    } catch (error: any) {
      console.error('[AuthStore] fetchProfile error:', error);
      set({ profileLoading: false, error: error.message });
      return null;
    }
  },

  updateProfile: async (updates) => {
    const user = get().user;
    if (!user) return;

    try {
      const updatePayload: any = {};

      if (updates.currentWorkspaceId !== undefined) {
        updatePayload.current_workspace_id = updates.currentWorkspaceId;
      }
      if (updates.onboardingComplete !== undefined) {
        updatePayload.onboarding_complete = updates.onboardingComplete;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', user.id);

      if (error) throw error;

      set((state) => ({
        profile: state.profile
          ? { ...state.profile, ...updates }
          : null,
      }));
    } catch (error: any) {
      console.error('[AuthStore] updateProfile error:', error);
      set({ error: error.message });
    }
  },

  clearError: () => set({ error: null }),
}));
