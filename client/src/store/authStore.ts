import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User, LoginRequest, RegisterRequest } from '@/types';
import { authAPI } from '@/utils/api';
import toast from 'react-hot-toast';
import { socketService } from '@/services/socketService';

interface AuthStore extends AuthState {
  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  checkAuth: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,

      // Actions
      login: async (credentials: LoginRequest) => {
        try {
          set({ isLoading: true });
          const { user, accessToken, refreshToken } = await authAPI.login(credentials);

          // Store access token in memory (and localStorage as backup)
          localStorage.setItem('accessToken', accessToken);

          set({
            user,
            accessToken,
            isAuthenticated: true,
            isLoading: false,
          });

          // Connect to WebSocket
          await socketService.connect(accessToken);

          toast.success('Logged in successfully');
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (userData: RegisterRequest) => {
        try {
          set({ isLoading: true });
          const { user, accessToken, refreshToken } = await authAPI.register(userData);

          localStorage.setItem('accessToken', accessToken);

          set({
            user,
            accessToken,
            isAuthenticated: true,
            isLoading: false,
          });

          // Connect to WebSocket
          await socketService.connect(accessToken);

          toast.success('Account created successfully');
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authAPI.logout();
        } catch (error) {
          // Continue with logout even if API call fails
          console.error('Logout API call failed:', error);
        }

        // Disconnect from WebSocket
        socketService.disconnect();

        // Clear local storage
        localStorage.removeItem('accessToken');

        // Reset state
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        });

        toast.success('Logged out successfully');
      },

      refreshToken: async () => {
        try {
          const { accessToken } = await authAPI.refreshToken();

          localStorage.setItem('accessToken', accessToken);
          set({ accessToken });

          // Reconnect WebSocket with new token
          if (socketService.isConnected()) {
            socketService.disconnect();
            await socketService.connect(accessToken);
          }
        } catch (error) {
          // Refresh failed, logout user
          get().logout();
          throw error;
        }
      },

      updateProfile: async (updates: Partial<User>) => {
        try {
          const updatedUser = await authAPI.updateProfile(updates);
          set({ user: updatedUser });
          toast.success('Profile updated successfully');
        } catch (error) {
          throw error;
        }
      },

      checkAuth: async () => {
        try {
          const accessToken = localStorage.getItem('accessToken');

          if (!accessToken) {
            set({ isLoading: false, isAuthenticated: false });
            return;
          }

          // Try to get user profile to validate token
          const user = await authAPI.getProfile();

          set({
            user,
            accessToken,
            isAuthenticated: true,
            isLoading: false,
          });

          // Connect to WebSocket
          await socketService.connect(accessToken);
        } catch (error) {
          // Token is invalid, clear it
          localStorage.removeItem('accessToken');
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);