import { useAuth } from '@/hooks/useAuth';
import type { Ticket } from '@/types';

export function usePermissions() {
  const { user } = useAuth();
  
  const isAdmin = user?.is_admin ?? false;
  
  const canEditTicket = (ticket: Ticket) => {
    if (!user) return false;
    return isAdmin || ticket.created_by === user.id;
  };
  
  const canDeleteTicket = (ticket: Ticket) => {
    if (!user) return false;
    return isAdmin || ticket.created_by === user.id;
  };
  
  return {
    user,
    isAdmin,
    canEditTicket,
    canDeleteTicket,
  };
}
