import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore'; // Zustand store
import { authApi } from '../../lib/api';

export const useLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      // Zustand store update
      setUser(data.user);
      // Token save
      localStorage.setItem('token', data.token);
      // Queries clear (optional)
      queryClient.clear();
      // Redirect
      router.push('/dashboard');
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });
};

export const useSignup = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.signup,
    onSuccess: () => {
      router.push('/login?registered=true');
    },
  });
};

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Clear all state
      logout();
      localStorage.removeItem('token');
      queryClient.clear();
      router.push('/login');
    },
  });
};