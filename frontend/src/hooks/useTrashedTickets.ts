import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketService } from '@/services/ticketService';
import type { TicketFilters } from '@/types';
import { toast } from 'sonner';

export function useTrashedTickets(filters: TicketFilters = {}) {
  return useQuery({
    queryKey: ['trashed-tickets', filters],
    queryFn: () => ticketService.getTrashedTickets(filters),
    staleTime: 30 * 1000,
  });
}

export function useRestoreTicket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => ticketService.restoreTicket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trashed-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Ticket restaurado com sucesso!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.meta?.message || error.response?.data?.message || 'Erro ao restaurar ticket';
      toast.error(message);
    },
  });
}

export function useForceDeleteTicket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => ticketService.forceDeleteTicket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trashed-tickets'] });
      toast.success('Ticket excluído permanentemente!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.meta?.message || error.response?.data?.message || 'Erro ao excluir ticket permanentemente';
      toast.error(message);
    },
  });
}
