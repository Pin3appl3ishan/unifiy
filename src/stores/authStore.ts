import { create } from 'zustand';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile, SupabaseProfile, ProfileUpdatePayload } from '../types';
import { getErrorMessage } from '../types';
import { SUPABASE_NOT_FOUND_CODE } from '../constants';

// Re-export types for backward compatibility
export type { Profile } from '../types';

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

/**
 * Converts a Supabase profile row (snake_case) to the app-level Profile model (camelCase).
 * @param row - The raw Supabase row
 * @returns A Profile object
 */
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

  /**
   * Registers a new user with email and password.
   * Automatically fetches the user profile after successful signup.
   * @param email - The user's email address
   * @param password - The user's password
   * @returns An object with `error` (null on success, AuthError on failure)
   */
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

  /**
   * Signs in an existing user with email and password.
   * Automatically fetches the user profile after successful login.
   * @param email - The user's email address
   * @param password - The user's password
   * @returns An object with `error` (null on success, AuthError on failure)
   */
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

  /**
   * Signs out the current user and clears all auth state.
   */
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

  /**
   * Initializes auth state by restoring the current session and
   * subscribing to auth state changes (e.g., tab switches, token refresh).
   */
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

  /**
   * Fetches the current user's profile from Supabase.
   * Handles the case where a profile may not yet exist for new users.
   * @returns The Profile, or null if not found or on error
   */
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
        if (error.code === SUPABASE_NOT_FOUND_CODE) {
          console.log('[AuthStore] Profile not found, may need to create one');
          set({ profileLoading: false });
          return null;
        }
        throw error;
      }

      const profile = toProfile(data as SupabaseProfile);
      set({ profile, profileLoading: false });
      return profile;
    } catch (error: unknown) {
      console.error('[AuthStore] fetchProfile error:', error);
      set({ profileLoading: false, error: getErrorMessage(error) });
      return null;
    }
  },

  /**
   * Updates the current user's profile fields in Supabase.
   * @param updates - Partial profile fields to update (currentWorkspaceId, onboardingComplete)
   */
  updateProfile: async (updates) => {
    const user = get().user;
    if (!user) return;

    try {
      const updatePayload: ProfileUpdatePayload = {};

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
    } catch (error: unknown) {
      console.error('[AuthStore] updateProfile error:', error);
      set({ error: getErrorMessage(error) });
    }
  },

  /** Clears the current error state. */
  clearError: () => set({ error: null }),
}));
