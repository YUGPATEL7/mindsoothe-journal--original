import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/apiClient';

interface User {
  id: string;
  email: string;
  full_name: string | null;
}

interface AuthContextType {
  user: User | null;
  session: { token: string } | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<{ token: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const token = localStorage.getItem('auth_token');
    if (token) {
      apiClient.setToken(token);
      // Verify token and get user
      apiClient.get<{ user: User }>('/auth/me')
        .then((response) => {
          setUser(response.user);
          setSession({ token });
          setLoading(false);
        })
        .catch(() => {
          // Invalid token, clear it
          localStorage.removeItem('auth_token');
          apiClient.setToken(null);
          setUser(null);
          setSession(null);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const response = await apiClient.post<{ user: User; token: string }>('/auth/signup', {
        email,
        password,
        full_name: name,
      });
      
      apiClient.setToken(response.token);
      setUser(response.user);
      setSession({ token: response.token });
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await apiClient.post<{ user: User; token: string }>('/auth/signin', {
        email,
        password,
      });
      
      apiClient.setToken(response.token);
      setUser(response.user);
      setSession({ token: response.token });
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    apiClient.setToken(null);
    setUser(null);
    setSession(null);
    localStorage.removeItem('auth_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
