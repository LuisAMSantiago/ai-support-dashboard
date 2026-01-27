import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TicketEventMeta } from '@/types';

interface EventMetaViewerProps {
  meta: TicketEventMeta;
  eventType?: string;
}

const statusLabels: Record<string, string> = {
  open: 'Aberto',
  in_progress: 'Em progresso',
  waiting: 'Aguardando',
  resolved: 'Resolvido',
  closed: 'Fechado',
};

const priorityLabels: Record<string, string> = {
  low: 'Baixa',
  medium: 'Media',
  high: 'Alta',
};

const fieldLabels: Record<string, string> = {
  title: 'Titulo',
  description: 'Descricao',
  priority: 'Prioridade',
  status: 'Status',
  assigned_to: 'Responsavel',
  created_by: 'Criado por',
  updated_by: 'Atualizado por',
  closed_by: 'Fechado por',
  reopened_by: 'Reaberto por',
  closed_at: 'Fechado em',
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const humanizeKey = (key: string) =>
  key
    .split('_')
    .map((word, index) =>
      index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word
    )
    .join(' ');

const formatValue = (field: string, value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return 'vazio';
  }

  if (field.endsWith('_at') && typeof value === 'string') {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const yyyy = date.getFullYear();
      const hh = String(date.getHours()).padStart(2, '0');
      const min = String(date.getMinutes()).padStart(2, '0');
      return `${hh}:${min} - ${dd}/${mm}/${yyyy}`;
    }
  }

  if (field === 'status' && typeof value === 'string') {
    return statusLabels[value] || value;
  }

  if (field === 'priority' && typeof value === 'string') {
    return priorityLabels[value] || value;
  }

  if (typeof value === 'boolean') {
    return value ? 'sim' : 'nao';
  }

  if (typeof value === 'number') {
    if (field.endsWith('_by') || field.endsWith('_id') || field === 'assigned_to') {
      return `ID ${value}`;
    }
    return String(value);
  }

  if (typeof value === 'string') {
    return value;
  }

  return JSON.stringify(value);
};

export function EventMetaViewer({ meta, eventType }: EventMetaViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (eventType === 'ai_summary_done') {
    return null;
  }

  // Filter out before/after since they're handled specially for status_changed
  const displayMeta = { ...meta };
  delete displayMeta.before;
  delete displayMeta.after;

  const changedFields = isRecord(displayMeta.changed_fields) ? displayMeta.changed_fields : null;
  if (changedFields) {
    delete displayMeta.changed_fields;
  }

  const extraEntries = Object.entries(displayMeta);

  // Don't render if no extra meta
  if (!changedFields && extraEntries.length === 0) {
    return null;
  }

  return (
    <div className="mt-2">
      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <ChevronDown className="w-3 h-3 mr-1" />
        ) : (
          <ChevronRight className="w-3 h-3 mr-1" />
        )}
        Ver detalhes
      </Button>
      
      {isOpen && (
        <div className="mt-2 space-y-3 text-xs">
          {changedFields && (
            <div className="rounded-md border bg-muted/30 overflow-hidden">
              <div className="grid grid-cols-[minmax(120px,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-2 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                <span>Campo</span>
                <span>Antes</span>
                <span>Depois</span>
              </div>
              <div className="divide-y divide-border">
                {Object.entries(changedFields)
                  .filter(([field]) =>
                    eventType === 'updated'
                      ? field !== 'reopened_by' && field !== 'closed_at'
                      : true
                  )
                  .map(([field, change]) => {
                  const label = fieldLabels[field] || humanizeKey(field);
                  const beforeValue = isRecord(change) ? change.before : undefined;
                  const afterValue = isRecord(change) ? change.after : undefined;

                  return (
                    <div
                      key={field}
                      className="grid grid-cols-[minmax(120px,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-2 px-3 py-2"
                    >
                      <span className="text-foreground">{label}</span>
                      <span className="text-muted-foreground">
                        {formatValue(field, beforeValue)}
                      </span>
                      <span className="text-foreground">
                        {formatValue(field, afterValue)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {extraEntries.length > 0 && (
            <div className="rounded-md border bg-muted/30 p-3 space-y-2">
              {extraEntries.map(([key, value]) => (
                <div key={key} className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">
                    {fieldLabels[key] || humanizeKey(key)}
                  </span>
                  <span className="text-foreground">{formatValue(key, value)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
