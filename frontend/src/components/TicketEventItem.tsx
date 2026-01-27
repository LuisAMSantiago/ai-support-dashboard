import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { EventMetaViewer } from '@/components/EventMetaViewer';
import { formatTicketEvent } from '@/lib/formatTicketEvent';
import { cn } from '@/lib/utils';
import type { TicketEvent } from '@/types';

interface TicketEventItemProps {
  event: TicketEvent;
  isLast?: boolean;
}

export function TicketEventItem({ event, isLast }: TicketEventItemProps) {
  const formatted = formatTicketEvent(event.type, event.meta);
  const Icon = formatted.icon;
  
  const authorName = event.user?.name || event.user?.email || 'Sistema';

  return (
    <div className="flex gap-4">
      {/* Timeline line */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'p-2 rounded-full border',
            formatted.colorClass
          )}
        >
          <Icon className="w-4 h-4" />
        </div>
        {!isLast && (
          <div className="w-px flex-1 bg-border my-2" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-foreground">
            {formatted.label}
          </span>
          {formatted.isAi && (
            <Badge variant="secondary" className="text-xs bg-purple-500/20 text-purple-400 border-purple-500/30">
              AI
            </Badge>
          )}
        </div>

        {/* Status change details */}
        {formatted.details && (
          <p className="text-sm text-muted-foreground mt-1">
            {formatted.details}
          </p>
        )}

        {/* Author and timestamp */}
        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
          <span>{authorName}</span>
          <span>•</span>
          <span>
            {format(new Date(event.created_at), "dd 'de' MMM 'de' yyyy 'às' HH:mm", {
              locale: ptBR,
            })}
          </span>
        </div>

        {/* Meta viewer for extra details */}
        {event.meta && Object.keys(event.meta).length > 0 && (
          <EventMetaViewer meta={event.meta} eventType={event.type} />
        )}
      </div>
    </div>
  );
}
