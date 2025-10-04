import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import appwriteService, { User } from '../services/appwriteService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, onboardingData?: Record<string, any>) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = appwriteService.onAuthStateChange((user: User | null) => {
      setUser(user);
      setIsLoading(false);
      if (user) {
        console.log('✅ User is authenticated:', user.name);
      } else {
        console.log('❌ User is not authenticated');
      }
    });

    // Initial auth check
    checkAuthStatus();

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('🔍 Checking authentication status...');
      const currentUser = await appwriteService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        console.log('✅ User is authenticated:', currentUser.name);
      } else {
        console.log('❌ User is not authenticated');
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await appwriteService.login(email, password);
      const user = await appwriteService.getCurrentUser();
      if (user) {
        setUser(user);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string, onboardingData?: Record<string, any>) => {
    setIsLoading(true);
    try {
      await appwriteService.createAccount(email, password, name, onboardingData);
      await appwriteService.login(email, password);
      const user = await appwriteService.getCurrentUser();
      if (user) {
        setUser(user);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await appwriteService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
