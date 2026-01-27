import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTickets, useCreateTicket, useDeleteTicket } from '@/hooks/useTickets';
import { Layout } from '@/components/Layout';
import { TicketStatusBadge } from '@/components/TicketStatusBadge';
import { TicketPriorityBadge } from '@/components/TicketPriorityBadge';
import { CombinedAiStatus } from '@/components/AiStatusIndicator';
import { TicketListSkeleton } from '@/components/LoadingSkeleton';
import { TicketFormModal } from '@/components/TicketFormModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  SortDesc,
  Trash2,
  Calendar,
  RefreshCw,
  Activity,
} from 'lucide-react';
import type { TicketFilters, TicketStatus, TicketPriority, CreateTicketData, Ticket } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const TicketList = () => {
  const [filters, setFilters] = useState<TicketFilters>({
    page: 1,
    per_page: 15,
    status: '',
    priority: '',
    q: '',
    sort: '-created_at',
  });
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteTicket, setDeleteTicket] = useState<Ticket | null>(null);

  const { data, isLoading, isError, refetch, isFetching } = useTickets(filters);
  const createMutation = useCreateTicket();
  const deleteMutation = useDeleteTicket();

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, q: searchInput, page: 1 }));
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleCreateTicket = (formData: CreateTicketData) => {
    createMutation.mutate(formData, {
      onSuccess: () => setCreateModalOpen(false),
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteTicket) {
      deleteMutation.mutate(deleteTicket.id, {
        onSuccess: () => setDeleteTicket(null),
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
          <div>
            <h1 className="text-2xl font-bold text-foreground">Tickets</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Gerencie tickets de suporte com inteligência artificial
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/tickets/trashed">
              <Button variant="outline">
                <Trash2 className="w-4 h-4" />
                Lixeira
              </Button>
            </Link>
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className="w-4 h-4" />
              Novo Ticket
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar tickets..."
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
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(showFilters && 'bg-secondary')}
              >
                <Filter className="w-4 h-4" />
                Filtros
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

          {/* Filter options */}
          {showFilters && (
            <div className="grid gap-3 p-4 rounded-lg bg-card border border-border sm:grid-cols-3 animate-fade-in">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Status</label>
                <Select
                  value={filters.status || 'all'}
                  onValueChange={(value) =>
                    setFilters((prev) => ({
                      ...prev,
                      status: value === 'all' ? '' : (value as TicketStatus),
                      page: 1,
                    }))
                  }
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="open">Aberto</SelectItem>
                    <SelectItem value="in_progress">Em Progresso</SelectItem>
                    <SelectItem value="waiting">Aguardando</SelectItem>
                    <SelectItem value="resolved">Resolvido</SelectItem>
                    <SelectItem value="closed">Fechado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Prioridade</label>
                <Select
                  value={filters.priority || 'all'}
                  onValueChange={(value) =>
                    setFilters((prev) => ({
                      ...prev,
                      priority: value === 'all' ? '' : (value as TicketPriority),
                      page: 1,
                    }))
                  }
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Ordenar por</label>
                <Select
                  value={filters.sort || '-created_at'}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, sort: value, page: 1 }))
                  }
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="-created_at">Mais recentes</SelectItem>
                    <SelectItem value="created_at">Mais antigos</SelectItem>
                    <SelectItem value="-priority">Prioridade (alta primeiro)</SelectItem>
                    <SelectItem value="priority">Prioridade (baixa primeiro)</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* Ticket list */}
        {isLoading ? (
          <TicketListSkeleton />
        ) : isError ? (
          <div className="text-center py-12">
            <p className="text-destructive">Erro ao carregar tickets.</p>
            <Button variant="outline" onClick={() => refetch()} className="mt-4">
              Tentar novamente
            </Button>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <p className="text-foreground font-medium">Nenhum ticket encontrado</p>
              <p className="text-muted-foreground text-sm mt-1">
                {filters.q || filters.status || filters.priority
                  ? 'Tente ajustar os filtros'
                  : 'Crie um novo ticket para começar'}
              </p>
            </div>
            {!filters.q && !filters.status && !filters.priority && (
              <Button onClick={() => setCreateModalOpen(true)}>
                <Plus className="w-4 h-4" />
                Criar primeiro ticket
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket, index) => (
              <div
                key={ticket.id}
                className="block p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all duration-200 group animate-fade-in"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <Link
                    to={`/tickets/${ticket.id}`}
                    className="flex-1 min-w-0"
                  >
                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                      {ticket.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {ticket.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {formatDistanceToNow(new Date(ticket.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                  </Link>

                  <div className="flex flex-wrap items-center gap-2">
                    <TicketStatusBadge status={ticket.status} />
                    <TicketPriorityBadge priority={ticket.priority} />
                    <CombinedAiStatus
                      summaryStatus={ticket.ai_summary_status}
                      replyStatus={ticket.ai_reply_status}
                      priorityStatus={ticket.ai_priority_status}
                    />
                    <Link
                      to={`/tickets/${ticket.id}?tab=activity`}
                      className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
                      title="Ver atividade"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Activity className="w-4 h-4 text-muted-foreground" />
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.preventDefault();
                        setDeleteTicket(ticket);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
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

      {/* Modals */}
      <TicketFormModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSubmit={handleCreateTicket}
        isLoading={createMutation.isPending}
      />

      <ConfirmDialog
        open={!!deleteTicket}
        onOpenChange={(open) => !open && setDeleteTicket(null)}
        title="Excluir Ticket"
        description={`Tem certeza que deseja excluir o ticket "${deleteTicket?.title}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </Layout>
  );
};

export default TicketList;
