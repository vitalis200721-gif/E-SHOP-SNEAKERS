'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/utils/api';
import { useToast } from '@/context/ToastContext';

const AuthContext = createContext();

const AUTH_ERROR_MESSAGES = {
  google_not_configured:
    'Google Sign In is not yet configured on this server. Please use email & password instead, or contact the administrator.',
  google_failed: 'Google authentication failed. Please try again or use email instead.',
};

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          const urlToken = params.get('token');
          const authError = params.get('auth_error');

          if (urlToken) {
            localStorage.setItem('token', urlToken);
            params.delete('token');
            const cleanUrl =
              window.location.pathname +
              (params.toString() ? `?${params.toString()}` : '') +
              window.location.hash;
            window.history.replaceState({}, '', cleanUrl);
            toast('Signed in successfully. Welcome back!', 'success');
          }

          if (authError) {
            const message = AUTH_ERROR_MESSAGES[authError] || `Authentication error: ${authError}`;
            toast(message, 'error', 8000);
            params.delete('auth_error');
            const cleanUrl =
              window.location.pathname +
              (params.toString() ? `?${params.toString()}` : '');
            window.history.replaceState({}, '', cleanUrl);
            setAuthModalOpen(true);
          }
        }

        // Fetch which providers are enabled
        try {
          const cfg = await api.get('/auth/config');
          setGoogleEnabled(!!cfg.data.googleEnabled);
        } catch (_) {
          setGoogleEnabled(false);
        }

        const stored = localStorage.getItem('token');
        if (stored) {
          setToken(stored);
          const { data } = await api.get('/auth/me', {
            headers: { Authorization: `Bearer ${stored}` },
          });
          setUser(data.user);
        }
      } catch (err) {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    init();
    // toast is stable from useCallback; ignoring exhaustive-deps intentionally
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Attach token to every request via axios interceptor
  useEffect(() => {
    const id = api.interceptors.request.use((config) => {
      const t = localStorage.getItem('token');
      if (t) config.headers.Authorization = `Bearer ${t}`;
      return config;
    });
    return () => api.interceptors.request.eject(id);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const loginWithGoogle = useCallback(() => {
    if (!googleEnabled) {
      toast(AUTH_ERROR_MESSAGES.google_not_configured, 'error', 8000);
      return;
    }
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    window.location.href = `${apiBase}/auth/google`;
  }, [googleEnabled, toast]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  const openAuthModal = useCallback(() => setAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setAuthModalOpen(false), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        googleEnabled,
        login,
        register,
        loginWithGoogle,
        logout,
        authModalOpen,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
