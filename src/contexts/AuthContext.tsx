import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/index.ts';
import { api } from '../services/api.ts';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { email: string; password: string; fullName: string; currency?: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateProfile: (payload: { fullName?: string; avatarUrl?: string; currency?: string }) => Promise<User>;
  changePassword: (payload: { currentPassword: string; newPassword: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      if (!api.getToken()) {
        // Auto-login to demo user on first visit if completely fresh
        const res = await api.login('yashwanth@smartfin.dev', 'smartfin123');
        setUser(res.user);
        return;
      }
      const res = await api.getMe();
      setUser(res.user);
    } catch (err) {
      console.warn('Auth check fallback to demo login:', err);
      try {
        const demoRes = await api.login('yashwanth@smartfin.dev', 'smartfin123');
        setUser(demoRes.user);
      } catch {
        setUser(null);
        api.setToken(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: { email: string; password: string; fullName: string; currency?: string }) => {
    setIsLoading(true);
    try {
      const res = await api.register(payload);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  const updateProfile = async (payload: { fullName?: string; avatarUrl?: string; currency?: string }): Promise<User> => {
    const res = await api.updateProfile(payload);
    setUser(res.user);
    return res.user;
  };

  const changePassword = async (payload: { currentPassword: string; newPassword: string }): Promise<void> => {
    await api.changePassword(payload);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        updateProfile,
        changePassword,
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
