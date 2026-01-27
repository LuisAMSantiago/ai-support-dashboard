import { cn } from '@/lib/utils';
import type { AiJobStatus } from '@/types';
import { Sparkles, Loader2, Check, X, Circle } from 'lucide-react';

interface AiStatusIndicatorProps {
  status: AiJobStatus;
  label?: string;
  className?: string;
  size?: 'sm' | 'md';
}

const statusConfig: Record<AiJobStatus, { icon: typeof Sparkles; label: string; className: string }> = {
  idle: {
    icon: Circle,
    label: 'Não processado',
    className: 'text-muted-foreground',
  },
  queued: {
    icon: Sparkles,
    label: 'Na fila',
    className: 'text-accent ai-pulse',
  },
  processing: {
    icon: Loader2,
    label: 'Processando',
    className: 'text-ai-processing animate-spin-slow',
  },
  done: {
    icon: Check,
    label: 'Concluído',
    className: 'text-success',
  },
  failed: {
    icon: X,
    label: 'Falhou',
    className: 'text-destructive',
  },
};

export const AiStatusIndicator = ({ status, label, className, size = 'md' }: AiStatusIndicatorProps) => {
  const config = statusConfig[status] || statusConfig.idle;
  const Icon = config.icon;
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <Icon className={cn(iconSize, config.className)} />
      {label && (
        <span className={cn('text-xs font-medium', config.className)}>
          {label}
        </span>
      )}
    </div>
  );
};

// Combined AI status for ticket list
interface CombinedAiStatusProps {
  summaryStatus: AiJobStatus;
  replyStatus: AiJobStatus;
  priorityStatus: AiJobStatus;
}

export const CombinedAiStatus = ({ summaryStatus, replyStatus, priorityStatus }: CombinedAiStatusProps) => {
  const hasProcessing = ['queued', 'processing'].includes(summaryStatus) ||
    ['queued', 'processing'].includes(replyStatus) ||
    ['queued', 'processing'].includes(priorityStatus);
  
  const hasDone = summaryStatus === 'done' || replyStatus === 'done' || priorityStatus === 'done';
  const hasFailed = summaryStatus === 'failed' || replyStatus === 'failed' || priorityStatus === 'failed';

  if (hasProcessing) {
    return (
      <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-accent/10 border border-accent/20">
        <Loader2 className="w-3 h-3 text-accent animate-spin-slow" />
        <span className="text-xs text-accent font-medium">IA processando</span>
      </div>
    );
  }

  if (hasFailed) {
    return (
      <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-destructive/10 border border-destructive/20">
        <X className="w-3 h-3 text-destructive" />
        <span className="text-xs text-destructive font-medium">IA erro</span>
      </div>
    );
  }

  if (hasDone) {
    return (
      <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-success/10 border border-success/20">
        <Sparkles className="w-3 h-3 text-success" />
        <span className="text-xs text-success font-medium">IA pronta</span>
      </div>
    );
  }

  return null;
};
