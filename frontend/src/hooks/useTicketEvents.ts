import { useQuery } from '@tanstack/react-query';
import { ticketService } from '@/services/ticketService';

interface UseTicketEventsParams {
  perPage?: number;
  page?: number;
}

export function useTicketEvents(
  ticketId: number,
  params: UseTicketEventsParams = {}
) {
  return useQuery({
    queryKey: ['ticket-events', ticketId, params],
    queryFn: () =>
      ticketService.getTicketEvents(ticketId, {
        per_page: params.perPage || 20,
        page: params.page || 1,
      }),
    staleTime: 10000,
    refetchOnWindowFocus: true,
    enabled: ticketId > 0,
  });
}
