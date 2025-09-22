import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase } from '../database/supabase/client';
import { SessionManager } from '../database/auth/sessionManager';

// Helper functions to extract names from Google OAuth metadata
const extractFirstName = (metadata: any): string => {
  if (!metadata) return '';
  
  // Try different possible fields from Google OAuth
  const fullName = metadata.full_name || metadata.name || metadata.display_name || '';
  const givenName = metadata.given_name || metadata.first_name || '';
  
  if (fullName) {
    return fullName.split(' ')[0] || '';
  }
  
  return givenName || '';
};

const extractLastName = (metadata: any): string => {
  if (!metadata) return '';
  
  // Try different possible fields from Google OAuth
  const fullName = metadata.full_name || metadata.name || metadata.display_name || '';
  const familyName = metadata.family_name || metadata.last_name || '';
  
  if (fullName) {
    const parts = fullName.split(' ');
    return parts.slice(1).join(' ') || '';
  }
  
  return familyName || '';
};

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'UPDATE_USER'; payload: User };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload
      };
    default:
      return state;
  }
};

interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  verifyAuthentication: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true
  });

  // Check for stored auth data on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('🔍 Checking existing session...');
        
        // First check localStorage session
        const storedSession = SessionManager.getSession();
        if (storedSession) {
          console.log('✅ Valid stored session found:', storedSession.user.email);
          dispatch({ type: 'LOGIN_SUCCESS', payload: { user: storedSession.user, token: storedSession.token } });
          return;
        }
        
        console.log('Supabase client initialized');
        
        // Then try to get the current session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('Session data:', session);
        console.log('Session error:', error);
        
        if (error) {
          console.error('❌ Session check error:', error);
          dispatch({ type: 'SET_LOADING', payload: false });
          return;
        }
        
        if (session?.access_token && session?.user) {
          console.log('✅ Valid Supabase session found, fetching profile...');
          console.log('User ID:', session.user.id);
          console.log('User email:', session.user.email);
          
          // Get user profile from profiles table
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          console.log('Profile data:', profile);
          console.log('Profile error:', profileError);
          
          const user = {
            id: session.user.id,
            email: session.user.email || '',
            firstName: profile?.first_name || extractFirstName(session.user.user_metadata),
            lastName: profile?.last_name || extractLastName(session.user.user_metadata),
            role: profile?.role || 'user'
          };
          
          console.log('✅ User object created:', user);
          
          // Save session to localStorage
          SessionManager.saveSession({
            user,
            token: session.access_token,
            expiresAt: 0 // Will be set by SessionManager
          });
          
          dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token: session.access_token } });
        } else {
          console.log('❌ No valid session found');
          console.log('Session exists:', !!session);
          console.log('Access token exists:', !!session?.access_token);
          console.log('User exists:', !!session?.user);
          
          // Clear any stored session if Supabase session is invalid
          SessionManager.clearSession();
          
          // Try to refresh the session if it exists but is expired
          if (session?.refresh_token) {
            console.log('🔄 Attempting to refresh expired session...');
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
            
            if (refreshError) {
              console.error('❌ Session refresh failed:', refreshError);
              SessionManager.clearSession();
            } else if (refreshData.session) {
              console.log('✅ Session refreshed successfully');
              // Recursively call checkSession to process the refreshed session
              setTimeout(checkSession, 100);
              return;
            }
          }
        }
      } catch (error) {
        console.error('❌ Error checking session:', error);
        SessionManager.clearSession();
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    // Add a small delay to ensure Supabase is fully initialized
    const timeoutId = setTimeout(checkSession, 100);
    
    return () => clearTimeout(timeoutId);

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' && session) {
        try {
          console.log('User signed in, fetching profile...');
          
          // Get user profile from profiles table
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          console.log('Profile data:', profile);
          console.log('Profile error:', profileError);
          
          // If profile doesn't exist, create one
          if (profileError && profileError.code === 'PGRST116') {
            console.log('Creating new profile for Google user...');
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: session.user.id,
                first_name: extractFirstName(session.user.user_metadata) || 'User',
                last_name: extractLastName(session.user.user_metadata) || '',
                phone: null,
                role: 'user',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
            
            if (insertError) {
              console.error('Error creating profile:', insertError);
            } else {
              console.log('Profile created successfully');
            }
          }
          
          const user = {
            id: session.user.id,
            email: session.user.email || '',
            firstName: profile?.first_name || extractFirstName(session.user.user_metadata) || 'User',
            lastName: profile?.last_name || extractLastName(session.user.user_metadata) || '',
            role: profile?.role || 'user'
          };
          
          console.log('Final user object:', user);
          
          // Save session to localStorage
          SessionManager.saveSession({
            user,
            token: session.access_token,
            expiresAt: 0 // Will be set by SessionManager
          });
          
          dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token: session.access_token } });
        } catch (error) {
          console.error('Error handling sign in:', error);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        SessionManager.clearSession();
        dispatch({ type: 'LOGOUT' });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      console.log('Attempting login with:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
        throw new Error(error.message);
      }

      console.log('Login successful, user data:', data.user);
      
      if (data.user) {
        // Get user profile from profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        console.log('Profile data:', profile);
        console.log('Profile error:', profileError);
        
        if (profileError && profileError.code === 'PGRST116') {
          // Profile doesn't exist, create one
          console.log('Creating new profile for user');
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              first_name: extractFirstName(data.user.user_metadata) || 'User',
              last_name: extractLastName(data.user.user_metadata) || '',
              phone: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          
          if (insertError) {
            console.error('Error creating profile:', insertError);
          }
        }

        const user = {
          id: data.user.id,
          email: data.user.email || '',
          firstName: profile?.first_name || extractFirstName(data.user.user_metadata) || 'User',
          lastName: profile?.last_name || extractLastName(data.user.user_metadata) || '',
          role: profile?.role || 'user'
        };
        
        console.log('Final user object:', user);
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token: data.session?.access_token || '' } });
      }
    } catch (error) {
      console.error('Login catch error:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Create user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            role: 'user'
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      // Auth state will be handled by the auth state change listener
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

      const logout = async () => {
        try {
          console.log('Starting logout process...');
          
          // Clear session using SessionManager
          SessionManager.clearSession();
          
          // Clear cart from localStorage
          localStorage.removeItem('cart_items');
          
          // Sign out from Supabase
          const { error } = await supabase.auth.signOut();
          
          if (error) {
            console.error('Supabase logout error:', error);
          }
          
          // Force logout in state regardless of Supabase response
          dispatch({ type: 'LOGOUT' });
          
          console.log('Logout completed successfully');
        } catch (error) {
          console.error('Logout error:', error);
          // Force logout even if there's an error
          dispatch({ type: 'LOGOUT' });
        }
      };

  const updateUser = (user: User) => {
    localStorage.setItem('auth_user', JSON.stringify(user));
    dispatch({ type: 'UPDATE_USER', payload: user });
  };

  const verifyAuthentication = async (): Promise<boolean> => {
    try {
      console.log('🔍 Verifying authentication...');
      
      // Check if we have a stored session
      const storedSession = SessionManager.getSession();
      if (storedSession && storedSession.user && storedSession.token) {
        console.log('✅ Valid stored session found');
        return true;
      }
      
      // Check Supabase session
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('❌ Session verification error:', error);
        return false;
      }
      
      if (session?.access_token && session?.user) {
        console.log('✅ Valid Supabase session found');
        return true;
      }
      
      console.log('❌ No valid session found');
      return false;
    } catch (error) {
      console.error('❌ Authentication verification failed:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ state, login, register, logout, updateUser, verifyAuthentication }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};