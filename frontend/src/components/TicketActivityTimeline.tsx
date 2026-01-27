import { useState } from 'react';
import { useTicketEvents } from '@/hooks/useTicketEvents';
import { TicketEventItem } from '@/components/TicketEventItem';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  RefreshCw,
  AlertCircle,
  Activity,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface TicketActivityTimelineProps {
  ticketId: number;
}

export function TicketActivityTimeline({ ticketId }: TicketActivityTimelineProps) {
  const [page, setPage] = useState(1);
  const [sortNewestFirst, setSortNewestFirst] = useState(true);
  
  const { data, isLoading, isError, refetch, isFetching } = useTicketEvents(ticketId, {
    perPage: 20,
    page,
  });
  const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-60" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <p className="text-muted-foreground mb-4">
          Erro ao carregar atividades
        </p>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  const events = data?.data || [];
  const meta = data?.meta;

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="p-4 rounded-full bg-muted mb-4">
          <Activity className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium text-foreground">
          Sem atividade ainda
        </p>
        <p className="text-muted-foreground text-sm">
          As atividades do ticket aparecerão aqui.
        </p>
      </div>
    );
  }

  const closedOrReopenedTimestamps = new Set(
    events
      .filter(
        (event) =>
          event.type === 'status_changed' &&
          (event.meta?.after === 'closed' || event.meta?.before === 'closed')
      )
      .map((event) => event.created_at)
  );

  const filteredEvents = events.filter((event) => {
    if (event.type !== 'updated') {
      return true;
    }

    if (!closedOrReopenedTimestamps.has(event.created_at)) {
      return true;
    }

    const changedFields = isRecord(event.meta?.changed_fields)
      ? event.meta?.changed_fields
      : null;

    if (!changedFields) {
      return true;
    }

    const statusChange = isRecord(changedFields.status)
      ? changedFields.status.before === 'closed' || changedFields.status.after === 'closed'
      : false;

    const hasClosedAt = Object.prototype.hasOwnProperty.call(changedFields, 'closed_at');
    const hasReopenedBy = Object.prototype.hasOwnProperty.call(changedFields, 'reopened_by');
    const hasClosedBy = Object.prototype.hasOwnProperty.call(changedFields, 'closed_by');

    return !(statusChange || hasClosedAt || hasReopenedBy || hasClosedBy);
  });

  // Sort events based on user preference
  const sortedEvents = sortNewestFirst
    ? [...filteredEvents].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    : [...filteredEvents].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSortNewestFirst(!sortNewestFirst)}
          className="text-muted-foreground"
        >
          <ArrowUpDown className="w-4 h-4 mr-2" />
          {sortNewestFirst ? 'Mais recentes primeiro' : 'Mais antigos primeiro'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Timeline */}
      <div className="space-y-0">
        {sortedEvents.map((event, index) => (
          <TicketEventItem
            key={event.id}
            event={event}
            isLast={index === sortedEvents.length - 1}
          />
        ))}
      </div>

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Página {meta.current_page} de {meta.last_page}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={meta.current_page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={meta.current_page === meta.last_page}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
