/**
 * src/context/AuthContext.tsx
 * ----------------------------
 * Manages authentication state: current user, login/logout, token persistence.
 * Wraps the entire app alongside SimulationProvider.
 *
 * Usage:
 *   const { user, login, logout, isLoading } = useAuth();
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { authApi, tokenStorage, ApiError } from '../utils/api';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginError: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearLoginError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true); // true on mount while we check token
  const [loginError, setLoginError] = useState<string | null>(null);

  // On mount — rehydrate session from stored token
  useEffect(() => {
    const token = tokenStorage.get();
    if (!token) {
      setIsLoading(false);
      return;
    }

    authApi.me()
      .then((userData) => {
        setUser(userData as AuthUser);
      })
      .catch(() => {
        // Token invalid or expired — clear it
        tokenStorage.clear();
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setLoginError(null);
    setIsLoading(true);

    try {
      const response = await authApi.login(email, password);
      tokenStorage.set(response.token);
      setUser(response.user as AuthUser);
      return true;
    } catch (err) {
      const message = err instanceof ApiError
        ? err.message
        : 'Login failed. Please try again.';
      setLoginError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    setLoginError(null);
    setIsLoading(true);

    try {
      const response = await authApi.register(name, email, password);
      tokenStorage.set(response.token);
      setUser(response.user as AuthUser);
      return true;
    } catch (err) {
      const message = err instanceof ApiError
        ? err.message
        : 'Registration failed. Please try again.';
      setLoginError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch {
      // Fire-and-forget — still clear token locally
    } finally {
      tokenStorage.clear();
      setUser(null);
    }
  }, []);

  const clearLoginError = useCallback(() => setLoginError(null), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        loginError,
        login,
        register,
        logout,
        clearLoginError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
