import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        token: user?.token || null 
      }),

      setToken: (token) => set({ token }),

      setLoading: (loading) => set({ isLoading: loading }),

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        localStorage.removeItem('token');
        localStorage.removeItem('auth-storage');
      },

      // Getters
      getUser: () => get().user,
      getToken: () => get().token,
      isLoggedIn: () => get().isAuthenticated,
    }),
    {
      name: 'auth-storage',
      storage: localStorage,
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

export default useAuthStore;