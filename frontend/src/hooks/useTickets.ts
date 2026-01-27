import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketService } from '@/services/ticketService';
import type { TicketFilters, CreateTicketData, UpdateTicketData, AiJobStatus } from '@/types';
import { toast } from 'sonner';
import { useEffect, useRef } from 'react';

export const useTickets = (filters: TicketFilters = {}) => {
  return useQuery({
    queryKey: ['tickets', filters],
    queryFn: () => ticketService.getTickets(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useTicket = (id: number) => {
  return useQuery({
    queryKey: ['tickets', id],
    queryFn: () => ticketService.getTicket(id),
    enabled: !!id,
  });
};

export const useTicketPolling = (id: number, shouldPoll: boolean) => {
  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (shouldPoll && id) {
      intervalRef.current = setInterval(() => {
        queryClient.invalidateQueries({ queryKey: ['tickets', id] });
      }, 1500);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [id, shouldPoll, queryClient]);
};

export const useCreateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTicketData) => ticketService.createTicket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Ticket criado com sucesso!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erro ao criar ticket';
      toast.error(message);
    },
  });
};

export const useUpdateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTicketData }) =>
      ticketService.updateTicket(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['tickets', id] });
      toast.success('Ticket atualizado com sucesso!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erro ao atualizar ticket';
      toast.error(message);
    },
  });
};

export const useDeleteTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ticketService.deleteTicket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Ticket excluído com sucesso!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erro ao excluir ticket';
      toast.error(message);
    },
  });
};

// AI Mutations
export const useEnqueueSummary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ticketService.enqueueSummary(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['tickets', id] });
      toast.success('Resumo IA solicitado!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erro ao solicitar resumo';
      toast.error(message);
    },
  });
};

export const useEnqueueReply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ticketService.enqueueReply(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['tickets', id] });
      toast.success('Resposta IA solicitada!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erro ao solicitar resposta';
      toast.error(message);
    },
  });
};

export const useEnqueuePriority = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ticketService.enqueuePriority(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['tickets', id] });
      toast.success('Classificação IA solicitada!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erro ao solicitar classificação';
      toast.error(message);
    },
  });
};

// Helper to check if any AI job is processing
export const isAnyAiJobProcessing = (
  summaryStatus: AiJobStatus,
  replyStatus: AiJobStatus,
  priorityStatus: AiJobStatus
): boolean => {
  const processingStates: AiJobStatus[] = ['queued', 'processing'];
  return (
    processingStates.includes(summaryStatus) ||
    processingStates.includes(replyStatus) ||
    processingStates.includes(priorityStatus)
  );
};
