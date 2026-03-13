import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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

      login: async (credentials) => {
        set({ isLoading: true });
        try {
          // API call yahan karo ya hook se call karo
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
          });
          const data = await response.json();
          
          set({ 
            user: data.user, 
            token: data.token, 
            isAuthenticated: true,
            isLoading: false 
          });
          
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: error.message };
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        // Clear localStorage bhi
        localStorage.removeItem('auth-storage');
      },

      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData }
        }));
      },

      // Getters
      getUser: () => get().user,
      isLoggedIn: () => get().isAuthenticated,
    }),
    {
      name: 'auth-storage', // localStorage mein key name
      storage: createJSONStorage(() => localStorage), // localStorage use karo
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token,
        isAuthenticated: state.isAuthenticated 
      }), // Sirf ye fields persist hongi
    }
  )
);

export default useAuthStore;