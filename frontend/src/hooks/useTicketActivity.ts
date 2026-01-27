import { useQuery } from '@tanstack/react-query';
import { ticketService } from '@/services/ticketService';

export function useTicketActivity(perPage: number = 50) {
  return useQuery({
    queryKey: ['ticket-activity', perPage],
    queryFn: () => ticketService.getTicketActivity(perPage),
    staleTime: 10000,
    refetchOnWindowFocus: true,
  });
}
