import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authApi } from '../services/api';

interface User {
  id: string;
  email: string;
  role: 'STUDENT' | 'EMPLOYER' | 'EDUCATOR' | 'ADMIN';
  profile: {
    fullName?: string;
    avatarUrl?: string;
    companyName?: string;
    [key: string]: any;
  } | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{
    success: boolean;
    error?: string;
    blocked?: boolean;
    retryAfterMinutes?: number;
    email?: string;
  }>;
  register: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  refreshUser: (preloadedUser?: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount — cookies are sent automatically
  useEffect(() => {
    const checkAuth = async () => {
      const { data, error } = await authApi.me();
      if (data && !error) {
        setUser(data as User);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await authApi.login({ email, password });

    if (error) {
      const extra = data as any;
      return {
        success: false,
        error,
        blocked: extra?.blocked as boolean | undefined,
        retryAfterMinutes: extra?.retryAfterMinutes as number | undefined,
        email: extra?.email as string | undefined,
      };
    }

    if (data) {
      // Cookies set by backend automatically — just sync user state
      localStorage.setItem('wasAuthenticated', '1');
      setUser(data.user);
      return { success: true as const, user: data.user };
    }

    return { success: false, error: 'Login failed' };
  }, []);

  const register = useCallback(async (email: string, password: string, fullName: string) => {
    const { data, error } = await authApi.register({ email, password, fullName });

    if (error) {
      return { success: false, error };
    }

    if (data) {
      // Cookies set by backend automatically
      localStorage.setItem('wasAuthenticated', '1');
      setUser(data.user);
      return { success: true };
    }

    return { success: false, error: 'Registration failed' };
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout(); // backend clears cookies server-side
    } catch {
      // Best-effort server-side logout — always clear local state below
    } finally {
      localStorage.removeItem('wasAuthenticated');
      setUser(null);
    }
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  const refreshUser = useCallback(async (preloadedUser?: User) => {
    // If caller already has the user object (e.g. from OAuth callback response),
    // set it directly to avoid a /me round-trip that may fail on mobile cross-origin.
    if (preloadedUser) {
      setUser(preloadedUser);
      return;
    }
    const { data, error } = await authApi.me();
    if (data && !error) {
      setUser(data as User);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
