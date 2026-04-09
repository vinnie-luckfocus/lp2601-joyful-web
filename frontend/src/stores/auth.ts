import { create } from 'zustand';
import api from '../utils/axios';

interface User {
  id: number;
  username: string;
  name: string;
  role: string;
  team_id: number | null;
  is_first_login: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  changePassword: (old_password: string, new_password: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { username, password });
      localStorage.setItem('token', data.token);
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      set({
        error: axiosError.response?.data?.error || 'Login failed',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isLoading: false });
      return;
    }
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data, isAuthenticated: true, isLoading: false });
    } catch (error) {
      localStorage.removeItem('token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  changePassword: async (old_password, new_password) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/auth/change-password', { old_password, new_password });
      localStorage.removeItem('token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error) {
      const axiosError = error as { response?: { status?: number; data?: { error?: string } } };
      const message = axiosError.response?.data?.error || 'Password change failed';
      set({ error: message, isLoading: false });

      if (axiosError.response?.status === 401) {
        localStorage.removeItem('token');
        set({ user: null, isAuthenticated: false });
      }

      throw error;
    }
  },
}));
