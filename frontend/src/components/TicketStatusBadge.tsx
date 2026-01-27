import { cn } from '@/lib/utils';
import type { TicketStatus } from '@/types';

interface TicketStatusBadgeProps {
  status: TicketStatus;
  className?: string;
}

const statusConfig: Record<TicketStatus, { label: string; className: string }> = {
  open: {
    label: 'Aberto',
    className: 'bg-status-open/20 text-status-open border-status-open/30',
  },
  in_progress: {
    label: 'Em Progresso',
    className: 'bg-status-in-progress/20 text-status-in-progress border-status-in-progress/30',
  },
  waiting: {
    label: 'Aguardando',
    className: 'bg-status-waiting/20 text-status-waiting border-status-waiting/30',
  },
  resolved: {
    label: 'Resolvido',
    className: 'bg-status-resolved/20 text-status-resolved border-status-resolved/30',
  },
  closed: {
    label: 'Fechado',
    className: 'bg-status-closed/20 text-status-closed border-status-closed/30',
  },
};

export const TicketStatusBadge = ({ status, className }: TicketStatusBadgeProps) => {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
};
