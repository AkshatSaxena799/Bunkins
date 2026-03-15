import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('bunkins_token');
    if (token) {
      api.setToken(token);
      api.getMe()
        .then(userData => {
          setUser(userData);
        })
        .catch(() => {
          api.setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const result = await api.login(email, password);
    api.setToken(result.token);
    setUser(result.user);
    if (result.is_first_login) {
      setShowWelcome(true);
    }
    return result;
  };

  const register = async (email, password, fullName) => {
    const result = await api.register(email, password, fullName);
    api.setToken(result.token);
    setUser(result.user);
    if (result.is_first_login) {
      setShowWelcome(true);
    }
    return result;
  };

  const logout = () => {
    api.setToken(null);
    setUser(null);
    localStorage.removeItem('bunkins_token');
    localStorage.removeItem('bunkins_cart');
    localStorage.removeItem('bunkins_wishlist');
    window.location.href = '/';
  };

  const updateUser = (updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
  };

  const dismissWelcome = () => setShowWelcome(false);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isOwner: user?.role === 'owner',
    showWelcome,
    dismissWelcome,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
