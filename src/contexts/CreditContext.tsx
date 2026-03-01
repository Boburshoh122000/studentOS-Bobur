import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { creditsApi } from '../services/api';
import { useAuth } from './AuthContext';

interface CreditContextValue {
  balance: number;
  isLoading: boolean;
  error: string | null;
  refreshBalance: () => Promise<void>;
  deductCredits: (amount: number) => void;
}

const CreditContext = createContext<CreditContextValue | undefined>(undefined);

interface CreditProviderProps {
  children: ReactNode;
}

export function CreditProvider({ children }: CreditProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshBalance = useCallback(async () => {
    if (!isAuthenticated) {
      setBalance(0);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await creditsApi.getBalance();
      if (response.data?.data) {
        setBalance(response.data.data.balance);
      }
    } catch (err) {
      console.error('Failed to fetch credit balance:', err);
      setError('Failed to load credit balance');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Optimistic update for balance after deduction
  const deductCredits = useCallback((amount: number) => {
    setBalance((prev) => Math.max(0, prev - amount));
  }, []);

  // Fetch balance on mount and when auth changes
  useEffect(() => {
    if (isAuthenticated && user) {
      refreshBalance();
    } else {
      setBalance(0);
      setIsLoading(false);
    }
  }, [isAuthenticated, user, refreshBalance]);

  return (
    <CreditContext.Provider
      value={{
        balance,
        isLoading,
        error,
        refreshBalance,
        deductCredits,
      }}
    >
      {children}
    </CreditContext.Provider>
  );
}

export function useCredits() {
  const context = useContext(CreditContext);
  if (context === undefined) {
    throw new Error('useCredits must be used within a CreditProvider');
  }
  return context;
}

export { CreditContext };
