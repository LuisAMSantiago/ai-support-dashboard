import { useQuery } from '@tanstack/react-query';
import { ticketService } from '@/services/ticketService';

export function useTicketBacklog() {
  return useQuery({
    queryKey: ['ticket-backlog'],
    queryFn: () => ticketService.getTicketBacklog(),
    staleTime: 60000,
    refetchOnWindowFocus: true,
  });
}
