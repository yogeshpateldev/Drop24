import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import api from '../api';

const AuthContext = createContext({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password, username) => {
    console.log('Starting signup process for:', email);
    
    // First, create the user account
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        },
        emailRedirectTo: window.location.origin,
      }
    });

    if (error) {
      console.error('Signup error:', error);
      return { data, error };
    }

    console.log('User created successfully:', data.user?.id);

    // Auto-confirm email via backend
    try {
      console.log('Attempting to auto-confirm email...');
      const confirmResponse = await api.post('/auth/confirm-email', { email });
      console.log('Email confirmation response:', confirmResponse.data);
    } catch (e) {
      console.error('Email confirmation failed:', e.response?.data || e.message);
      // Continue with signin attempt even if confirmation fails
    }

    // Try to sign in immediately
    console.log('Attempting to sign in...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (signInError) {
      console.error('Signin error:', signInError);
      return { data: signInData, error: signInError };
    }
    
    console.log('Signin successful:', signInData.user?.id);
    return { data: signInData, error: null };
  };

  const signIn = async (identifier, password, method = 'email') => {
    if (method === 'username') {
      // Use backend endpoint for username login
      try {
        const response = await api.post('/auth/login-username', {
          username: identifier,
          password: password
        });
        
        if (response.data.access_token) {
          // Set the session manually
          const { data, error } = await supabase.auth.setSession({
            access_token: response.data.access_token,
            refresh_token: response.data.refresh_token
          });
          
          return { data, error };
        }
      } catch (error) {
        return { 
          data: null, 
          error: { message: error.response?.data?.error || 'Login failed' } 
        };
      }
    } else {
      // Regular email login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: identifier,
        password,
      });
      
      // Handle email confirmation error
      if (error && error.message.includes('Email not confirmed')) {
        return { 
          data: null, 
          error: { 
            message: 'Please check your email and click the confirmation link before signing in.' 
          } 
        };
      }
      
      return { data, error };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const value = {
    user,
    signUp,
    signIn,
    signOut,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 