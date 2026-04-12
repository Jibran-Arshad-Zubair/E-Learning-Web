"use client";


import { useMutation } from '@tanstack/react-query';
import { authApi } from '../../lib/api/auth.js';
import { useRouter } from 'next/navigation';
import useAuthStore from '../../src/store/useAuthStore.js';
import toast from 'react-hot-toast';

// Register Hook
export const useRegister = () => {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (userData) => authApi.register(userData),
    onSuccess: (data) => {
      // Success toast
      toast.success('Account created successfully!', {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#10B981',
          color: '#fff',
        },
      });

      // Agar backend se token aur user data return ho raha hai
      if (data.token) {
        if (typeof window !== 'undefined') localStorage.setItem('token', data.token);
        setUser(data.user);
        router.push('/dashboard');
      } else {
        // Agar email verification required hai
        router.push('/verify-email');
      }
    },
    onError: (error) => {
      // Error handling
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      
      toast.error(errorMessage, {
        duration: 5000,
        position: 'top-center',
        style: {
          background: '#EF4444',
          color: '#fff',
        },
      });

      // Field-specific errors handle karo
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach((field) => {
          toast.error(`${field}: ${errors[field]}`, {
            duration: 3000,
          });
        });
      }
    },
  });
};

// Login Hook
export const useLogin = () => {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (credentials) => authApi.login(credentials),
    onSuccess: (data) => {
      if (typeof window !== 'undefined') localStorage.setItem('token', data.token);
      setUser(data.user);
      toast.success('Logged in successfully!');
      router.push('/dashboard');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Login failed');
    },
  });
};

// Google Login Hook
export const useGoogleLogin = () => {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (token) => authApi.googleLogin(token),
    onSuccess: (data) => {
      if (typeof window !== 'undefined') localStorage.setItem('token', data.token);
      setUser(data.user);
      toast.success('Google login successful!');
      router.push('/dashboard');
    },
    onError: (error) => {
      toast.error('Google login failed');
    },
  });
};