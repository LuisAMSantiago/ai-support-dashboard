import type { TicketEventType, TicketEventMeta } from '@/types';
import {
  Plus,
  Edit,
  CheckCircle2,
  RotateCcw,
  Trash2,
  Undo2,
  Sparkles,
  MessageSquare,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  type LucideIcon,
} from 'lucide-react';

export interface FormattedEvent {
  label: string;
  icon: LucideIcon;
  isAi: boolean;
  colorClass: string;
  details?: string;
}

const statusLabels: Record<string, string> = {
  open: 'Aberto',
  in_progress: 'Em Progresso',
  waiting: 'Aguardando',
  resolved: 'Resolvido',
  closed: 'Fechado',
};

const statusOrder: Record<string, number> = {
  open: 0,
  in_progress: 1,
  waiting: 2,
  resolved: 3,
  closed: 4,
};

const iconColorClass = new Map<LucideIcon, string>([
  [Plus, 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'],
  [Edit, 'bg-blue-500/10 text-blue-500 border-blue-500/30'],
  [CheckCircle2, 'bg-slate-500/10 text-slate-500 border-slate-500/30'],
  [RotateCcw, 'bg-amber-500/10 text-amber-500 border-amber-500/30'],
  [ArrowUpRight, 'bg-teal-500/10 text-teal-500 border-teal-500/30'],
  [ArrowDownRight, 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30'],
  [Trash2, 'bg-red-500/10 text-red-500 border-red-500/30'],
  [Undo2, 'bg-orange-500/10 text-orange-500 border-orange-500/30'],
  [Sparkles, 'bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/30'],
  [MessageSquare, 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30'],
  [AlertTriangle, 'bg-rose-500/10 text-rose-500 border-rose-500/30'],
]);

export function formatTicketEvent(
  type: TicketEventType,
  meta: TicketEventMeta | null
): FormattedEvent {
  switch (type) {
    case 'created':
      return {
        label: 'Ticket criado',
        icon: Plus,
        isAi: false,
        colorClass: iconColorClass.get(Plus)!,
      };

    case 'updated':
      return {
        label: 'Ticket atualizado',
        icon: Edit,
        isAi: false,
        colorClass: iconColorClass.get(Edit)!,
      };

    case 'status_changed': {
      const before = meta?.before ? statusLabels[meta.before] || meta.before : '?';
      const after = meta?.after ? statusLabels[meta.after] || meta.after : '?';
      const isClosed = meta?.after === 'closed';
      const isReopened = meta?.before === 'closed' && meta?.after !== 'closed';
      const beforeOrder =
        meta?.before && statusOrder[meta.before] !== undefined ? statusOrder[meta.before] : null;
      const afterOrder =
        meta?.after && statusOrder[meta.after] !== undefined ? statusOrder[meta.after] : null;
      const isForward =
        !isClosed && !isReopened && beforeOrder !== null && afterOrder !== null && afterOrder > beforeOrder;
      const isBackward =
        !isClosed && !isReopened && beforeOrder !== null && afterOrder !== null && afterOrder < beforeOrder;
      const statusIcon = isClosed
        ? CheckCircle2
        : isReopened
        ? RotateCcw
        : isForward
        ? ArrowUpRight
        : isBackward
        ? ArrowDownRight
        : Edit;

      return {
        label: 'Status alterado',
        icon: statusIcon,
        isAi: false,
        colorClass: iconColorClass.get(statusIcon)!,
        details: `${before} → ${after}`,
      };
    }

    case 'deleted':
      return {
        label: 'Ticket excluído',
        icon: Trash2,
        isAi: false,
        colorClass: iconColorClass.get(Trash2)!,
      };

    case 'restored':
      return {
        label: 'Ticket restaurado',
        icon: Undo2,
        isAi: false,
        colorClass: iconColorClass.get(Undo2)!,
      };

    case 'ai_summary_done':
      return {
        label: 'Resumo',
        icon: Sparkles,
        isAi: true,
        colorClass: iconColorClass.get(Sparkles)!,
        details: typeof meta?.summary === 'string' ? meta.summary : undefined,
      };

    case 'ai_reply_done':
      return {
        label: 'AI: sugestão de resposta gerada',
        icon: MessageSquare,
        isAi: true,
        colorClass: iconColorClass.get(MessageSquare)!,
      };

    case 'ai_priority_done':
      return {
        label: 'AI: prioridade classificada',
        icon: AlertTriangle,
        isAi: true,
        colorClass: iconColorClass.get(AlertTriangle)!,
      };

    default:
      return {
        label: 'Evento',
        icon: Edit,
        isAi: false,
        colorClass: iconColorClass.get(Edit) || 'bg-muted text-muted-foreground border-border',
      };
  }
}
