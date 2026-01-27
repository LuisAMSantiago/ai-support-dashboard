import { useTicketActivity } from '@/hooks/useTicketActivity';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  Edit,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Clock,
  AlertCircle,
  RefreshCw,
  Activity,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { ActivityType, ActivitySubtype, AiType } from '@/types';
import { cn } from '@/lib/utils';

const ActivitySkeleton = () => (
  <Layout>
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="space-y-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    </div>
  </Layout>
);

const getActivityIcon = (
  type: ActivityType,
  subtype?: ActivitySubtype,
  _aiType?: AiType
) => {
  switch (type) {
    case 'created':
      return <Plus className="w-4 h-4" />;
    case 'updated':
      return <Edit className="w-4 h-4" />;
    case 'status_changed':
      return subtype === 'closed' ? (
        <CheckCircle2 className="w-4 h-4" />
      ) : (
        <RotateCcw className="w-4 h-4" />
      );
    case 'ai_done':
      return <Sparkles className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
};

const getActivityColor = (type: ActivityType, subtype?: ActivitySubtype) => {
  switch (type) {
    case 'created':
      return 'bg-green-500/10 text-green-500 border-green-500/30';
    case 'updated':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
    case 'status_changed':
      return subtype === 'closed'
        ? 'bg-gray-500/10 text-gray-500 border-gray-500/30'
        : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
    case 'ai_done':
      return 'bg-purple-500/10 text-purple-500 border-purple-500/30';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};

const getActivityLabel = (
  type: ActivityType,
  subtype?: ActivitySubtype,
  aiType?: AiType
) => {
  switch (type) {
    case 'created':
      return 'Ticket criado';
    case 'updated':
      return 'Ticket atualizado';
    case 'status_changed':
      return subtype === 'closed' ? 'Ticket fechado' : 'Ticket reaberto';
    case 'ai_done':
      const aiLabels: Record<string, string> = {
        summary: 'Resumo AI',
        reply: 'Resposta AI',
        priority: 'Prioridade AI',
      };
      return aiType ? aiLabels[aiType] || 'AI concluído' : 'AI concluído';
    default:
      return 'Evento';
  }
};

const TicketActivity = () => {
  const { data, isLoading, refetch, isFetching } = useTicketActivity(50);

  if (isLoading) {
    return <ActivitySkeleton />;
  }

  if (!data) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-lg text-muted-foreground">
            Não foi possível carregar as atividades
          </p>
          <Button onClick={() => refetch()} className="mt-4">
            Tentar novamente
          </Button>
        </div>
      </Layout>
    );
  }

  if (data.length === 0) {
    return (
      <Layout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-foreground">
            Feed de Atividades
          </h1>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="p-4 rounded-full bg-muted mb-4">
              <Activity className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium text-foreground">
              Nenhuma atividade encontrada
            </p>
            <p className="text-muted-foreground">
              As atividades aparecerão aqui conforme você usa o sistema.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Feed de Atividades
            </h1>
            <p className="text-muted-foreground">
              Últimas atividades nos seus tickets
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`}
            />
            Atualizar
          </Button>
        </div>

        {/* Activity Timeline */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Últimas 50 Atividades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {data.map((event, index) => (
                <div
                  key={`${event.ticket_id}-${event.timestamp}-${index}`}
                  className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div
                    className={cn(
                      'p-2 rounded-full border',
                      getActivityColor(event.type, event.subtype)
                    )}
                  >
                    {getActivityIcon(event.type, event.subtype, event.ai_type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-foreground">
                        {getActivityLabel(
                          event.type,
                          event.subtype,
                          event.ai_type
                        )}
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <Link
                        to={`/tickets/${event.ticket_id}`}
                        className="text-primary hover:underline truncate max-w-xs"
                      >
                        {event.ticket_title}
                      </Link>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(event.timestamp), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TicketActivity;
