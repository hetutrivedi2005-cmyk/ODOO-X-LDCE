import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || localStorage.getItem('globetrotter_token'));
  const [isLoading, setIsLoading] = useState(true);

  // Helper to persist auth data locally
  const saveAuthData = (userObj, tokenStr) => {
    setUser(userObj);
    setToken(tokenStr);
    if (tokenStr) {
      localStorage.setItem('token', tokenStr);
      localStorage.setItem('globetrotter_token', tokenStr);
    }
  };

  // Helper to clear auth data locally
  const clearAuthData = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('globetrotter_token');
  }, []);

  // Restore current user on initial application mount if token exists
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      const storedToken = localStorage.getItem('token') || localStorage.getItem('globetrotter_token');
      if (!storedToken) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const currentUser = await authService.getCurrentUser();
        if (isMounted) {
          setUser(currentUser);
          setToken(storedToken);
        }
      } catch (error) {
        console.warn('Failed to restore authentication session:', error.message);
        if (isMounted) {
          clearAuthData();
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, [clearAuthData]);

  // Login handler
  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const result = await authService.login(credentials);
      const authUser = result.user || result;
      const authToken = result.token;

      if (!authToken) {
        throw new Error('Authentication succeeded but no token was provided by the server.');
      }

      saveAuthData(authUser, authToken);
      return authUser;
    } finally {
      setIsLoading(false);
    }
  };

  // Register handler
  const register = async (data) => {
    setIsLoading(true);
    try {
      const result = await authService.register(data);
      const authUser = result.user || result;
      const authToken = result.token;

      if (!authToken) {
        throw new Error('Registration succeeded but no token was provided by the server.');
      }

      saveAuthData(authUser, authToken);
      return authUser;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout handler
  const logout = useCallback(() => {
    clearAuthData();
  }, [clearAuthData]);

  // Update user info handler
  const updateUser = useCallback((updatedUserObj) => {
    setUser(updatedUserObj);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
