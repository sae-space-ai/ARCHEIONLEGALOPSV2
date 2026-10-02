// Hook de autenticación — restaurado para modo privado

import { useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/client';
import type { User } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkSession = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { user } = await authApi.getSession();
      setUser(user);
    } catch (err) {
      setUser(null);
      setError(err instanceof Error ? err.message : 'Error al verificar sesión');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const response = await authApi.login({ email, password });
      if (response.success && response.user) {
        setUser(response.user);
        return { success: true as const };
      }
      const errorMsg = response.error || 'Credenciales inválidas';
      setError(errorMsg);
      return { success: false as const, error: errorMsg };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error de conexión';
      setError(errorMsg);
      return { success: false as const, error: errorMsg };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignorar errores de logout
    } finally {
      setUser(null);
    }
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
    checkSession,
    isAuthenticated: !!user,
  };
}
