import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useTheme } from 'next-themes';
import authService from '@/services/auth.service';
import userService from '@/services/user.service';
import { User } from '@/types/user';
import { UserPreferences } from '@/types/user';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, fullName?: string) => Promise<boolean>;
  updateProfile: (data: {
    fullName?: string;
    email?: string;
    preferences?: UserPreferences;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isInitializing: boolean;
}

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';
const USER_ROLE_KEY = 'user_role';

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const persistSession = (user: User, token?: string) => {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  localStorage.setItem(USER_ROLE_KEY, user.role);
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
};

const clearSession = () => {
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(USER_ROLE_KEY);
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(AUTH_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const { setTheme } = useTheme();

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      setIsInitializing(false);
      return;
    }

    if (user) {
      setIsInitializing(false);
      return;
    }

    authService.aboutMe()
      .then((profile) => {
        setUser(profile);
        persistSession(profile);
        if (profile.preferences?.theme) {
          setTheme(profile.preferences.theme);
        }
      })
      .catch(() => {
        clearSession();
        setUser(null);
      })
      .finally(() => {
        setIsInitializing(false);
      });
  }, [user]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      setUser(response.user);
      persistSession(response.user, response.token);
      if (response.user.preferences?.theme) {
        setTheme(response.user.preferences.theme);
      }
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setTheme]);

  const register = useCallback(async (email: string, password: string, fullName?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await authService.register(email, password, fullName);
      const response = await authService.login(email, password);
      setUser(response.user);
      persistSession(response.user, response.token);
      if (response.user.preferences?.theme) {
        setTheme(response.user.preferences.theme);
      }
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setTheme]);

  const updateProfile = useCallback(async (data: {
    fullName?: string;
    email?: string;
    preferences?: UserPreferences;
  }): Promise<boolean> => {
    if (!user?._id) {
      return false;
    }
    setIsLoading(true);
    try {
      const updatedUser = await userService.updateUser({
        ...data,
      }, user._id);
      setUser(updatedUser);
      persistSession(updatedUser);
      if (updatedUser.preferences?.theme) {
        setTheme(updatedUser.preferences.theme);
      }
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setTheme, user?._id]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch {
      // Ignoramos errores para asegurar limpieza local
    } finally {
      clearSession();
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      register,
      updateProfile,
      logout,
      isLoading,
      isInitializing
    }}>
      {children}
    </AuthContext.Provider>
  );
};
