import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User, AuthResponse, LoginCredentials, RegisterData } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<AuthResponse>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  getUserDisplayName: () => string;
  getRoleDisplay: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      if (response.success && response.user) {
        setUser(response.user);
      }
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const response = await authService.register(data);
      if (response.success && response.user) {
        setUser(response.user);
      }
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateProfile = async (updates: Partial<User>): Promise<AuthResponse> => {
    const response = await authService.updateProfile(updates);
    if (response.success && response.user) {
      setUser(response.user);
    }
    return response;
  };

  const updateUser = async (updates: Partial<User>) => {
    if (user) {
      // Update local state immediately
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);

      // Persist to localStorage through authService
      try {
        await authService.updateProfile(updates);
      } catch (error) {
        console.error('Failed to persist user updates:', error);
      }
    }
  };

  const getUserDisplayName = (): string => {
    return authService.getUserDisplayName();
  };

  const getRoleDisplay = (): string => {
    return authService.getRoleDisplay();
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    updateUser,
    getUserDisplayName,
    getRoleDisplay,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
