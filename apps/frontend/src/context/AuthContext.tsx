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
import { apiFetch, authErrorMessage, SESSION_REJECTED_EVENT } from '@/lib/api-fetch';

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
  const currentToken = useRef<string | null>(null);
  const queryClient = useQueryClient();

  const clearSession = useCallback(
    (message: string | null = null) => {
      currentToken.current = null;
      localStorage.removeItem('jwt');
      setToken(null);
      setUser(null);
      setError(message);
      setIsLoading(false);
      queryClient.clear();
    },
    [queryClient],
  );

  const fetchUser = useCallback(
    async (authToken: string) => {
      try {
        const response = await apiFetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (!response.ok) {
          throw new Error(
            response.status === 503
              ? authErrorMessage('GROUP_ACCESS_UNAVAILABLE')
              : 'A felhasználói adatok nem érhetők el. Jelentkezz be újra.',
          );
        }
        const userData: User = await response.json();
        if (currentToken.current === authToken) {
          setUser(userData);
          setError(null);
        }
      } catch (cause) {
        if (currentToken.current === authToken) {
          clearSession(cause instanceof Error ? cause.message : 'Hiba történt a belépés során.');
        }
      } finally {
        if (currentToken.current === authToken) setIsLoading(false);
      }
    },
    [clearSession],
  );

  useEffect(() => {
    const onRejected = (event: Event) => {
      const { token: rejectedToken, code } = (event as CustomEvent<{ token: string; code: string }>)
        .detail;
      if (rejectedToken === currentToken.current) clearSession(authErrorMessage(code));
    };
    window.addEventListener(SESSION_REJECTED_EVENT, onRejected);
    const params = new URLSearchParams(window.location.search);
    // The callback result takes precedence over a previously stored session.
    if (window.location.pathname === '/login' && (params.has('error') || params.has('jwt'))) {
      clearSession();
    } else {
      const storedToken = localStorage.getItem('jwt');
      currentToken.current = storedToken;
      if (storedToken) {
        setToken(storedToken);
        void fetchUser(storedToken);
      } else setIsLoading(false);
    }
    return () => window.removeEventListener(SESSION_REJECTED_EVENT, onRejected);
  }, [clearSession, fetchUser]);

  const login = useCallback(
    (newToken: string) => {
      queryClient.clear();
      currentToken.current = newToken;
      localStorage.setItem('jwt', newToken);
      setToken(newToken);
      setUser(null);
      setError(null);
      setIsLoading(true);
      void fetchUser(newToken);
    },
    [fetchUser, queryClient],
  );

  const logout = useCallback(() => clearSession(), [clearSession]);
  const refreshUser = useCallback(async () => {
    if (currentToken.current) await fetchUser(currentToken.current);
  }, [fetchUser]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshUser, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};
