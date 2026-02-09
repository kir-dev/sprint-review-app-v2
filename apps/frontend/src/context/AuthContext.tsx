'use client';

import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Position } from '../../app/logs/types';

interface User {
  id: number;
  email: string;
  simonyiEmail?: string;
  fullName: string;
  authschId: string;
  githubUsername?: string;
  profileImage?: string;
  position: Position;
  positionHistory?: PositionHistory[];
}

export interface PositionHistory {
  id: number;
  userId: number;
  position: Position;
  startDate: string; // ISO Date
  endDate?: string | null; // ISO Date
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for token in localStorage
    const storedToken = localStorage.getItem('jwt');
    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUser = useCallback(async (authToken: string) => {
    if (!authToken) return;

    console.log('🔍 Fetching user with token:', authToken.substring(0, 20) + '...');
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('✅ User data loaded:', userData);
        setUser(userData);
        setError(null);
      } else {
        console.error('❌ Token invalid, status:', response.status);
        // Token invalid, clear it
        localStorage.removeItem('jwt');
        setToken(null);
        setError('A munkamenet lejárt vagy érvénytelen. Kérjük, jelentkezz be újra.');
      }
    } catch (error) {
      console.error('❌ Error fetching user:', error);
      localStorage.removeItem('jwt');
      setToken(null);
      setError('Hiba történt a felhasználói adatok lekérése közben.');
    } finally {
      setIsLoading(false);
      console.log('✓ isLoading set to false');
    }
  }, []);

  const login = useCallback((newToken: string) => {
    localStorage.setItem('jwt', newToken);
    setToken(newToken);
    setError(null);
    setIsLoading(true);
    fetchUser(newToken);
  }, [fetchUser]);

  const logout = useCallback(() => {
    localStorage.removeItem('jwt');
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (token) {
      await fetchUser(token);
    }
  }, [token, fetchUser]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshUser, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};
