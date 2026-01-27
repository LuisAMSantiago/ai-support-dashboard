import { cn } from '@/lib/utils';
import type { TicketPriority } from '@/types';
import { AlertTriangle, Minus, ArrowDown } from 'lucide-react';

interface TicketPriorityBadgeProps {
  priority: TicketPriority | null;
  className?: string;
}

const priorityConfig: Record<TicketPriority, { label: string; className: string; icon: typeof AlertTriangle }> = {
  low: {
    label: 'Baixa',
    className: 'bg-priority-low/20 text-priority-low border-priority-low/30',
    icon: ArrowDown,
  },
  medium: {
    label: 'Média',
    className: 'bg-priority-medium/20 text-priority-medium border-priority-medium/30',
    icon: Minus,
  },
  high: {
    label: 'Alta',
    className: 'bg-priority-high/20 text-priority-high border-priority-high/30',
    icon: AlertTriangle,
  },
};

export const TicketPriorityBadge = ({ priority, className }: TicketPriorityBadgeProps) => {
  if (!priority) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border bg-muted/50 text-muted-foreground border-border',
          className
        )}
      >
        <Minus className="w-3 h-3" />
        Sem prioridade
      </span>
    );
  }

  const config = priorityConfig[priority];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};
