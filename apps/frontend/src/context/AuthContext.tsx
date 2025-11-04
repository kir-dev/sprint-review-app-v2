'use client';

import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

interface User {
  id: number;
  email: string;
  fullName: string;
  authschId: string;
  githubUsername?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
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

  const fetchUser = async (authToken: string) => {
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
      } else {
        console.error('❌ Token invalid, status:', response.status);
        // Token invalid, clear it
        localStorage.removeItem('jwt');
        setToken(null);
      }
    } catch (error) {
      console.error('❌ Error fetching user:', error);
      localStorage.removeItem('jwt');
      setToken(null);
    } finally {
      setIsLoading(false);
      console.log('✓ isLoading set to false');
    }
  };

  const login = (newToken: string) => {
    localStorage.setItem('jwt', newToken);
    setToken(newToken);
    fetchUser(newToken);
  };

  const logout = () => {
    localStorage.removeItem('jwt');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
