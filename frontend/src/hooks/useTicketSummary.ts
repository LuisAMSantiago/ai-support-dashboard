import { useQuery } from '@tanstack/react-query';
import { ticketService } from '@/services/ticketService';

export function useTicketSummary() {
  return useQuery({
    queryKey: ['ticket-summary'],
    queryFn: () => ticketService.getTicketSummary(),
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });
}
