import { create } from 'zustand';
import { User as AppUser } from '../types'; // Rename imported User to avoid conflict
import { createClient, SupabaseClient, User as SupabaseUser, Session } from '@supabase/supabase-js';

// Initialize Supabase client (ensure this is the same instance used elsewhere or refactor to a singleton)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or Anon Key is missing in environment variables.");
}

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Function to map Supabase user to our AppUser type
// TODO: Define how isAdmin is determined (e.g., custom claims, separate table, specific email)
const mapSupabaseUser = (supabaseUser: SupabaseUser | null): AppUser | null => {
  if (!supabaseUser) return null;
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    // name: supabaseUser.user_metadata?.full_name || supabaseUser.email, // Example: get name from metadata
    isAdmin: supabaseUser.email === 'admin@grandtour.com', // TEMPORARY: Determine admin status based on email - **REPLACE with a secure method**
    purchasedTours: [], // TODO: Fetch purchased tours from DB based on user ID
  };
};

interface AuthState {
  user: AppUser | null;
  session: Session | null; // Store the session
  isLoading: boolean;
  error: string | null;
  initializeAuthListener: () => () => void; // Function to set up the listener
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  // purchaseTour: (tourId: string) => Promise<void>; // Removed mock purchase logic
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true, // Start as true until listener confirms auth state
  error: null,

  // Listener for auth changes
  initializeAuthListener: () => {
    set({ isLoading: true });
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
      const currentUser = mapSupabaseUser(session?.user ?? null);
      set({ user: currentUser, session, isLoading: false, error: null });
    });

    // Initial check in case the listener doesn't fire immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (!get().session) { // Only set if not already set by listener
            const currentUser = mapSupabaseUser(session?.user ?? null);
            set({ user: currentUser, session, isLoading: false });
        }
    });

    // Return the unsubscribe function
    return () => {
      authListener?.subscription.unsubscribe();
    };
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.session || !data.user) throw new Error('Login successful but no session/user data received.');

      // State update will be handled by onAuthStateChange listener
      // set({ user: mapSupabaseUser(data.user), session: data.session, isLoading: false });

    } catch (error) {
      console.error("Login error:", error);
      set({
        error: error instanceof Error ? error.message : 'Erro ao fazer login',
        isLoading: false,
        user: null, // Ensure user is null on error
        session: null,
      });
    }
  },

  register: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        // options: { data: { full_name: 'Optional Name' } } // Example: add metadata on signup
      });

      if (error) throw error;
      if (!data.user) throw new Error('Signup successful but no user data received.');
      if (data.user && data.session) {
          // User is automatically logged in after signup with email/password
          console.log('Signup successful and logged in:', data.user);
          // State update handled by listener
      } else {
          // User signed up but needs email confirmation (if enabled in Supabase)
          console.log('Signup successful, please check your email for confirmation.');
          alert('Registo bem-sucedido! Por favor, verifique o seu email para confirmar a conta.');
          set({ isLoading: false }); // Stop loading, user is not logged in yet
      }

    } catch (error) {
      console.error("Register error:", error);
      set({
        error: error instanceof Error ? error.message : 'Erro ao registar',
        isLoading: false,
        user: null,
        session: null,
      });
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // State update will be handled by onAuthStateChange listener
      // set({ user: null, session: null, isLoading: false });
    } catch (error) {
      console.error("Logout error:", error);
      set({
        error: error instanceof Error ? error.message : 'Erro ao fazer logout',
        isLoading: false
        // Keep user/session as they are until listener confirms logout
      });
    }
  },

  // Removed mock purchaseTour logic
}));

