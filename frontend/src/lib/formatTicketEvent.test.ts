import { describe, expect, it } from 'vitest';
import { formatTicketEvent } from './formatTicketEvent';

describe('ticket activity history', () => {
  it('labels status changes and handles missing metadata', () => {
    expect(formatTicketEvent('status_changed', { before: 'closed', after: 'open' }).details).toBe('Fechado → Aberto');
    expect(formatTicketEvent('status_changed', null).details).toBe('? → ?');
  });

  it('shows an AI summary only when the metadata contains text', () => {
    expect(formatTicketEvent('ai_summary_done', { summary: 'Falha de autenticação' })).toMatchObject({ isAi: true, details: 'Falha de autenticação' });
    expect(formatTicketEvent('ai_summary_done', { summary: { unexpected: true } }).details).toBeUndefined();
  });

  it.each(['deleted', 'restored'] as const)('identifies %s as a user event', (type) => {
    expect(formatTicketEvent(type, null).isAi).toBe(false);
    expect(formatTicketEvent(type, null).label).toContain(type === 'deleted' ? 'excluído' : 'restaurado');
  });
});
