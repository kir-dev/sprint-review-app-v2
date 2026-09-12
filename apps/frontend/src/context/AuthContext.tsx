'use client';

import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Position } from '../../app/logs/types';
import { authErrorMessage, SESSION_REJECTED_EVENT } from '@/lib/api-fetch';

interface User {
  id: number;
  email: string;
  simonyiEmail?: string;
  fullName: string;
  authschId: string;
  githubUsername?: string;
  profileImage?: string;
  position: Position;
  positionDetails?: {
    id: number;
    name: string;
    label: string;
    color: string;
    canManageSettings: boolean;
    canExportLogs: boolean;
    canManageEvents: boolean;
    canManageProjects: boolean;
    isLeader: boolean;
  };
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
  isAuthenticated: boolean | null;
  logout: () => Promise<boolean>;
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
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestGeneration = useRef(0);
  const queryClient = useQueryClient();

  const clearClientSession = useCallback(
    (message: string | null = null) => {
      requestGeneration.current += 1;
      setUser(null);
      setIsAuthenticated(false);
      setError(message);
      setIsLoading(false);
      queryClient.clear();
    },
    [queryClient],
  );

  const fetchUser = useCallback(async () => {
    const generation = ++requestGeneration.current;
    try {
      const response = await fetch('/api/auth/me', { cache: 'no-store' });
      if (!response.ok) {
        let code = '';
        try {
          const body: unknown = await response.json();
          if (
            typeof body === 'object' &&
            body !== null &&
            'code' in body &&
            typeof body.code === 'string'
          ) {
            code = body.code;
          }
        } catch {
          /* An empty 401 means there is no active application session. */
        }
        if (
          generation === requestGeneration.current &&
          (response.status === 401 || response.status === 403)
        ) {
          clearClientSession(code ? authErrorMessage(code) : null);
        } else if (generation === requestGeneration.current) {
          setError('A munkamenet ellenőrzése átmenetileg nem sikerült.');
        }
        return;
      }
      const userData: User = await response.json();
      if (generation === requestGeneration.current) {
        setUser(userData);
        setIsAuthenticated(true);
        setError(null);
      }
    } catch (cause) {
      if (generation === requestGeneration.current) {
        setError(
          cause instanceof Error
            ? cause.message
            : 'A munkamenet ellenőrzése átmenetileg nem sikerült.',
        );
      }
    } finally {
      if (generation === requestGeneration.current) setIsLoading(false);
    }
  }, [clearClientSession]);

  useEffect(() => {
    const onRejected = (event: Event) => {
      const { code } = (event as CustomEvent<{ code: string }>).detail;
      clearClientSession(authErrorMessage(code));
      void fetch('/api/auth/logout', { method: 'POST' });
    };
    window.addEventListener(SESSION_REJECTED_EVENT, onRejected);
    return () => window.removeEventListener(SESSION_REJECTED_EVENT, onRejected);
  }, [clearClientSession]);

  useEffect(() => {
    void fetchUser();
  }, [fetchUser]);

  const logout = useCallback(async () => {
    requestGeneration.current += 1;
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok) throw new Error('Logout request failed');
      clearClientSession();
      return true;
    } catch {
      setError('A kijelentkezés nem sikerült. Próbáld újra.');
      return false;
    }
  }, [clearClientSession]);

  const refreshUser = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, logout, refreshUser, isLoading, error }}
    >
      {children}
    </AuthContext.Provider>
  );
};
