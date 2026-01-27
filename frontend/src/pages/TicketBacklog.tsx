import { useTicketBacklog } from '@/hooks/useTicketBacklog';
import { Layout } from '@/components/Layout';
import { AlertCard } from '@/components/AlertCard';
import { TicketStatusBadge } from '@/components/TicketStatusBadge';
import { TicketPriorityBadge } from '@/components/TicketPriorityBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertTriangle, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const BacklogSkeleton = () => (
  <Layout>
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-96" />
    </div>
  </Layout>
);

const TicketBacklog = () => {
  const { data, isLoading, refetch, isFetching } = useTicketBacklog();

  if (isLoading) {
    return <BacklogSkeleton />;
  }

  if (!data) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-lg text-muted-foreground">
            Não foi possível carregar o backlog
          </p>
          <Button onClick={() => refetch()} className="mt-4">
            Tentar novamente
          </Button>
        </div>
      </Layout>
    );
  }

  const hasBacklog =
    data.counts.older_than_2_days > 0 ||
    data.counts.older_than_7_days > 0 ||
    data.counts.older_than_14_days > 0;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Backlog de Tickets
            </h1>
            <p className="text-muted-foreground">
              Tickets abertos que precisam de atenção
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

        {/* Alert Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <AlertCard
            title="Abertos há mais de 2 dias"
            count={data.counts.older_than_2_days}
            severity="warning"
            icon={Clock}
          />
          <AlertCard
            title="Abertos há mais de 7 dias"
            count={data.counts.older_than_7_days}
            severity="error"
            icon={AlertTriangle}
          />
          <AlertCard
            title="Abertos há mais de 14 dias"
            count={data.counts.older_than_14_days}
            severity="critical"
            icon={AlertTriangle}
          />
        </div>

        {/* Oldest Tickets Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Top 10 Tickets Mais Antigos Abertos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!hasBacklog && data.oldest_open.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="p-4 rounded-full bg-green-500/10 mb-4">
                  <AlertCircle className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-lg font-medium text-foreground">
                  Nenhum backlog!
                </p>
                <p className="text-muted-foreground">
                  Todos os tickets estão em dia.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">ID</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead className="w-32">Status</TableHead>
                      <TableHead className="w-28">Prioridade</TableHead>
                      <TableHead className="w-32">Tempo Aberto</TableHead>
                      <TableHead className="w-32">Criado em</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.oldest_open.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-mono text-muted-foreground">
                          #{ticket.id}
                        </TableCell>
                        <TableCell>
                          <Link
                            to={`/tickets/${ticket.id}`}
                            className="text-primary hover:underline font-medium"
                          >
                            {ticket.title}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <TicketStatusBadge status={ticket.status} />
                        </TableCell>
                        <TableCell>
                          {ticket.priority && (
                            <TicketPriorityBadge priority={ticket.priority} />
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDistanceToNow(new Date(ticket.created_at), {
                            addSuffix: false,
                            locale: ptBR,
                          })}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(ticket.created_at).toLocaleDateString(
                            'pt-BR'
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TicketBacklog;
