'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/config/api';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setToken: (token: string) => void;
  setIsAuthenticated: (value: boolean) => void;
}

interface AuthResponse {
  expiry: string;
  token: string;
  user: {
    email: string;
  };
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    
    if (!isAuthenticated && pathname !== '/') {
      router.push('/');
    } else if (isAuthenticated && pathname === '/') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isInitialized, pathname, router]);

  const login = async (email: string, password: string) => {
    const response = await fetch(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        username: email,
        password 
      }),
    });

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    const data: AuthResponse = await response.json();
    setToken(data.token);
    setIsAuthenticated(true);
    localStorage.setItem('authToken', data.token);
  };

  const logout = () => {
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('authToken');
  };

  if (!isInitialized) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      token, 
      login, 
      logout,
      setToken,
      setIsAuthenticated 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}