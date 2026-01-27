import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTrashedTickets, useRestoreTicket, useForceDeleteTicket } from '@/hooks/useTrashedTickets';
import { Layout } from '@/components/Layout';
import { TicketStatusBadge } from '@/components/TicketStatusBadge';
import { TicketPriorityBadge } from '@/components/TicketPriorityBadge';
import { TicketListSkeleton } from '@/components/LoadingSkeleton';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Trash2,
  RotateCcw,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import type { TicketFilters, Ticket } from '@/types';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const TrashedTickets = () => {
  const [filters, setFilters] = useState<TicketFilters>({
    page: 1,
    per_page: 15,
    q: '',
    sort: '-created_at',
  });
  const [searchInput, setSearchInput] = useState('');
  const [restoreTicket, setRestoreTicket] = useState<Ticket | null>(null);
  const [forceDeleteTicket, setForceDeleteTicket] = useState<Ticket | null>(null);

  const { data, isLoading, isError, refetch, isFetching } = useTrashedTickets(filters);
  const restoreMutation = useRestoreTicket();
  const forceDeleteMutation = useForceDeleteTicket();

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, q: searchInput, page: 1 }));
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleRestoreConfirm = () => {
    if (restoreTicket) {
      restoreMutation.mutate(restoreTicket.id, {
        onSuccess: () => setRestoreTicket(null),
      });
    }
  };

  const handleForceDeleteConfirm = () => {
    if (forceDeleteTicket) {
      forceDeleteMutation.mutate(forceDeleteTicket.id, {
        onSuccess: () => setForceDeleteTicket(null),
      });
    }
  };

  const tickets = data?.data || [];
  const meta = data?.meta;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link to="/tickets">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Trash2 className="w-6 h-6 text-muted-foreground" />
                Lixeira
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Tickets excluídos podem ser restaurados ou removidos permanentemente
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar tickets excluídos..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="pl-10 bg-background border-border"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSearch}>
              <Search className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={cn('w-4 h-4', isFetching && 'animate-spin')} />
            </Button>
          </div>
        </div>

        {/* Ticket list */}
        {isLoading ? (
          <TicketListSkeleton />
        ) : isError ? (
          <div className="text-center py-12">
            <p className="text-destructive">Erro ao carregar tickets excluídos.</p>
            <Button variant="outline" onClick={() => refetch()} className="mt-4">
              Tentar novamente
            </Button>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Trash2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <p className="text-foreground font-medium">Lixeira vazia</p>
              <p className="text-muted-foreground text-sm mt-1">
                Nenhum ticket excluído encontrado
              </p>
            </div>
            <Link to="/tickets">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4" />
                Voltar para tickets
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket, index) => (
              <div
                key={ticket.id}
                className="p-4 rounded-lg bg-card border border-border opacity-75 hover:opacity-100 transition-all duration-200 animate-fade-in"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">
                      {ticket.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {ticket.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          Criado {formatDistanceToNow(new Date(ticket.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                      {ticket.deleted_at && (
                        <div className="flex items-center gap-1 text-destructive">
                          <Trash2 className="w-3 h-3" />
                          <span>
                            Excluído em {format(new Date(ticket.deleted_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <TicketStatusBadge status={ticket.status} />
                    <TicketPriorityBadge priority={ticket.priority} />
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={() => setRestoreTicket(ticket)}
                      >
                        <RotateCcw className="w-3 h-3" />
                        Restaurar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-8"
                        onClick={() => setForceDeleteTicket(ticket)}
                      >
                        <Trash2 className="w-3 h-3" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Mostrando {meta.from || 0} - {meta.to || 0} de {meta.total} tickets
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))}
                disabled={meta.current_page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground px-3">
                {meta.current_page} / {meta.last_page}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))}
                disabled={meta.current_page === meta.last_page}
              >
                Próxima
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <ConfirmDialog
        open={!!restoreTicket}
        onOpenChange={(open) => !open && setRestoreTicket(null)}
        title="Restaurar Ticket"
        description={`Deseja restaurar o ticket "${restoreTicket?.title}"? Ele voltará a aparecer na lista de tickets.`}
        confirmLabel="Restaurar"
        variant="default"
        onConfirm={handleRestoreConfirm}
        isLoading={restoreMutation.isPending}
      />

      <ConfirmDialog
        open={!!forceDeleteTicket}
        onOpenChange={(open) => !open && setForceDeleteTicket(null)}
        title="Excluir Permanentemente"
        description={
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">Atenção: Esta ação é irreversível!</span>
            </div>
            <p>
              O ticket "{forceDeleteTicket?.title}" será removido permanentemente e não poderá ser recuperado.
            </p>
          </div>
        }
        confirmLabel="Excluir Permanentemente"
        variant="destructive"
        onConfirm={handleForceDeleteConfirm}
        isLoading={forceDeleteMutation.isPending}
      />
    </Layout>
  );
};

export default TrashedTickets;
