import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useTicket,
  useTicketPolling,
  useUpdateTicket,
  useDeleteTicket,
  useEnqueueSummary,
  useEnqueueReply,
  useEnqueuePriority,
  isAnyAiJobProcessing,
} from '@/hooks/useTickets';
import { usePermissions } from '@/hooks/usePermissions';
import { Layout } from '@/components/Layout';
import { TicketStatusBadge } from '@/components/TicketStatusBadge';
import { TicketPriorityBadge } from '@/components/TicketPriorityBadge';
import { AiStatusIndicator } from '@/components/AiStatusIndicator';
import { TicketDetailSkeleton } from '@/components/LoadingSkeleton';
import { TicketFormModal } from '@/components/TicketFormModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { TicketActivityTimeline } from '@/components/TicketActivityTimeline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Sparkles,
  MessageSquare,
  AlertTriangle,
  RefreshCw,
  Calendar,
  Clock,
  Copy,
  Check,
  User,
  UserCheck,
  XCircle,
  RotateCcw,
  Activity,
  FileText,
} from 'lucide-react';
import type { UpdateTicketData } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const TicketDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const ticketId = parseInt(id || '0', 10);

  const { data: ticket, isLoading, isError, refetch } = useTicket(ticketId);
  const updateMutation = useUpdateTicket();
  const deleteMutation = useDeleteTicket();
  const enqueueSummaryMutation = useEnqueueSummary();
  const enqueueReplyMutation = useEnqueueReply();
  const enqueuePriorityMutation = useEnqueuePriority();
  const { canEditTicket, canDeleteTicket } = usePermissions();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const hasPermissionToEdit = ticket ? canEditTicket(ticket) : false;
  const hasPermissionToDelete = ticket ? canDeleteTicket(ticket) : false;

  // Polling for AI job status
  const shouldPoll = useMemo(() => {
    if (!ticket) return false;
    return isAnyAiJobProcessing(
      ticket.ai_summary_status,
      ticket.ai_reply_status,
      ticket.ai_priority_status
    );
  }, [ticket]);

  useTicketPolling(ticketId, shouldPoll);

  const handleUpdate = (data: UpdateTicketData) => {
    updateMutation.mutate(
      { id: ticketId, data },
      {
        onSuccess: () => setEditModalOpen(false),
      }
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(ticketId, {
      onSuccess: () => navigate('/tickets'),
    });
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Copiado para a área de transferência!');
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (isLoading) {
    return (
      <Layout>
        <TicketDetailSkeleton />
      </Layout>
    );
  }

  if (isError || !ticket) {
    return (
      <Layout>
        <div className="text-center py-12 space-y-4">
          <p className="text-destructive">Ticket não encontrado.</p>
          <Button variant="outline" onClick={() => navigate('/tickets')}>
            Voltar para tickets
          </Button>
        </div>
      </Layout>
    );
  }

  const isAnyAiLoading =
    enqueueSummaryMutation.isPending ||
    enqueueReplyMutation.isPending ||
    enqueuePriorityMutation.isPending;

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Back button and actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="ghost" onClick={() => navigate('/tickets')} className="w-fit">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          {(hasPermissionToEdit || hasPermissionToDelete) && (
            <div className="flex gap-2">
              {hasPermissionToEdit && (
                <Button variant="outline" onClick={() => setEditModalOpen(true)}>
                  <Edit className="w-4 h-4" />
                  Editar
                </Button>
              )}
              {hasPermissionToDelete && (
                <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                  <Trash2 className="w-4 h-4" />
                  Excluir
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Ticket header */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-foreground">{ticket.title}</h1>
          <div className="flex flex-wrap gap-2">
            <TicketStatusBadge status={ticket.status} />
            <TicketPriorityBadge priority={ticket.priority} />
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>
                Criado em {format(new Date(ticket.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>
                Atualizado em {format(new Date(ticket.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs: Details and Activity */}
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="details" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Detalhes
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Atividade
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            {/* Tracking Info */}
            {(ticket.created_by_user || ticket.updated_by_user || ticket.closed_by_user || ticket.reopened_by_user) && (
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    Rastreamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 sm:grid-cols-2 text-sm">
                    {ticket.created_by_user && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="w-3.5 h-3.5" />
                        <span>Criado por: <span className="text-foreground">{ticket.created_by_user.email}</span></span>
                      </div>
                    )}
                    {ticket.updated_by_user && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Atualizado por: <span className="text-foreground">{ticket.updated_by_user.email}</span></span>
                      </div>
                    )}
                    {ticket.closed_by_user && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Fechado por: <span className="text-foreground">{ticket.closed_by_user.email}</span></span>
                      </div>
                    )}
                    {ticket.reopened_by_user && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reaberto por: <span className="text-foreground">{ticket.reopened_by_user.email}</span></span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Descrição</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground whitespace-pre-wrap">{ticket.description}</p>
              </CardContent>
            </Card>

            {/* AI Features */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                Recursos de IA
              </h2>

              <div className="grid gap-4 md:grid-cols-3">
                {/* AI Summary */}
                <Card className={cn('bg-card border-border', ticket.ai_summary_status === 'done' && 'ai-glow')}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-accent" />
                        Resumo IA
                      </CardTitle>
                      <AiStatusIndicator status={ticket.ai_summary_status} size="sm" />
                    </div>
                    <CardDescription>Resumo automático do ticket</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {ticket.ai_summary ? (
                      <div className="p-3 rounded-md bg-muted/50 relative group">
                        <p className="text-sm text-foreground pr-8">{ticket.ai_summary}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => copyToClipboard(ticket.ai_summary!, 'summary')}
                        >
                          {copiedField === 'summary' ? (
                            <Check className="w-3 h-3 text-success" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    ) : ticket.ai_summary_status === 'failed' ? (
                      <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                        <p className="text-sm text-destructive">{ticket.ai_last_error || 'Erro ao gerar resumo'}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Nenhum resumo gerado ainda</p>
                    )}
                    <Button
                      variant="ai"
                      size="sm"
                      className="w-full"
                      onClick={() => enqueueSummaryMutation.mutate(ticketId)}
                      disabled={['queued', 'processing'].includes(ticket.ai_summary_status) || isAnyAiLoading}
                    >
                      {['queued', 'processing'].includes(ticket.ai_summary_status) ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          {ticket.ai_summary ? 'Gerar novamente' : 'Gerar resumo'}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* AI Reply */}
                <Card className={cn('bg-card border-border', ticket.ai_reply_status === 'done' && 'ai-glow')}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-accent" />
                        Resposta IA
                      </CardTitle>
                      <AiStatusIndicator status={ticket.ai_reply_status} size="sm" />
                    </div>
                    <CardDescription>Sugestão de resposta</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {ticket.ai_suggested_reply ? (
                      <div className="p-3 rounded-md bg-muted/50 relative group max-h-40 overflow-y-auto scrollbar-thin">
                        <p className="text-sm text-foreground whitespace-pre-wrap pr-8">
                          {ticket.ai_suggested_reply}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => copyToClipboard(ticket.ai_suggested_reply!, 'reply')}
                        >
                          {copiedField === 'reply' ? (
                            <Check className="w-3 h-3 text-success" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    ) : ticket.ai_reply_status === 'failed' ? (
                      <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                        <p className="text-sm text-destructive">{ticket.ai_last_error || 'Erro ao gerar resposta'}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Nenhuma resposta sugerida</p>
                    )}
                    <Button
                      variant="ai"
                      size="sm"
                      className="w-full"
                      onClick={() => enqueueReplyMutation.mutate(ticketId)}
                      disabled={['queued', 'processing'].includes(ticket.ai_reply_status) || isAnyAiLoading}
                    >
                      {['queued', 'processing'].includes(ticket.ai_reply_status) ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <MessageSquare className="w-4 h-4" />
                          {ticket.ai_suggested_reply ? 'Gerar novamente' : 'Gerar resposta'}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* AI Priority */}
                <Card className={cn('bg-card border-border', ticket.ai_priority_status === 'done' && 'ai-glow')}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-accent" />
                        Prioridade IA
                      </CardTitle>
                      <AiStatusIndicator status={ticket.ai_priority_status} size="sm" />
                    </div>
                    <CardDescription>Classificação automática</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {ticket.priority ? (
                      <div className="p-3 rounded-md bg-muted/50">
                        <TicketPriorityBadge priority={ticket.priority} />
                      </div>
                    ) : ticket.ai_priority_status === 'failed' ? (
                      <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                        <p className="text-sm text-destructive">{ticket.ai_last_error || 'Erro ao classificar'}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Prioridade não classificada pela IA</p>
                    )}
                    <Button
                      variant="ai"
                      size="sm"
                      className="w-full"
                      onClick={() => enqueuePriorityMutation.mutate(ticketId)}
                      disabled={['queued', 'processing'].includes(ticket.ai_priority_status) || isAnyAiLoading}
                    >
                      {['queued', 'processing'].includes(ticket.ai_priority_status) ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4" />
                          Classificar prioridade
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Histórico de Atividades
                </CardTitle>
                <CardDescription>
                  Timeline de eventos deste ticket
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TicketActivityTimeline ticketId={ticketId} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <TicketFormModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        ticket={ticket}
        onSubmit={handleUpdate}
        isLoading={updateMutation.isPending}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir Ticket"
        description={`Tem certeza que deseja excluir o ticket "${ticket.title}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </Layout>
  );
};

export default TicketDetail;
