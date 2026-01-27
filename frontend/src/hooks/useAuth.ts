import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import type { LoginCredentials, User } from '@/types';
import { toast } from 'sonner';
import { useEffect } from 'react';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const meQuery = useQuery<User, Error>({
    queryKey: ['auth', 'me'],
    queryFn: authService.getMe,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle 401 errors - redirect to login if not already there
  useEffect(() => {
    if (meQuery.isError) {
      const error = meQuery.error as any;
      if (error?.response?.status === 401) {
        const isLoginPage = window.location.pathname === '/login';
        if (!isLoginPage) {
          // Clear cache and redirect
          queryClient.clear();
          navigate('/login', { replace: true });
        }
      }
    }
  }, [meQuery.isError, meQuery.error, navigate, queryClient]);

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (user) => {
      // Atualizar dados do usuário no cache
      queryClient.setQueryData(['auth', 'me'], user);
      // Invalidar queries de tickets para carregar com novo contexto
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Login realizado com sucesso!');
      navigate('/tickets', { replace: true });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erro ao realizar login';
      toast.error(message);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      // Limpar todo o cache, incluindo dados do usuário
      queryClient.clear();
      toast.success('Logout realizado com sucesso!');
      navigate('/login', { replace: true });
    },
    onError: () => {
      // Even on error, clear the cache and redirect
      queryClient.clear();
      toast.error('Erro ao fazer logout, mas a sessão foi encerrada');
      navigate('/login', { replace: true });
    },
  });

  return {
    user: meQuery.data,
    isLoading: meQuery.isLoading,
    isAuthenticated: !!meQuery.data,
    isError: meQuery.isError,
    authError: meQuery.error?.message,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
};

export const useRequireAuth = () => {
  const { isAuthenticated, isLoading, isError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && (isError || !isAuthenticated)) {
      navigate('/login', { replace: true });
    }
  }, [isLoading, isError, isAuthenticated, navigate]);

  return { isAuthenticated, isLoading };
};
