import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TicketFormModal } from './TicketFormModal';
import { ticket } from '@/test/fixtures';

describe('TicketFormModal', () => {
  it('rejects an empty ticket', async () => {
    const onSubmit = vi.fn();
    render(<TicketFormModal open onOpenChange={vi.fn()} onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole('button', { name: 'Criar Ticket' }));
    expect(await screen.findByText('Título é obrigatório')).toBeInTheDocument();
    expect(screen.getByText('Descrição é obrigatória')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits a new ticket without sending a null priority', async () => {
    const onSubmit = vi.fn();
    render(<TicketFormModal open onOpenChange={vi.fn()} onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText('Título'), ticket.title);
    await userEvent.type(screen.getByLabelText('Descrição'), ticket.description);
    await userEvent.click(screen.getByRole('button', { name: 'Criar Ticket' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({
      title: ticket.title, description: ticket.description, priority: undefined,
    }));
  });

  it('loads and submits an existing ticket for editing', async () => {
    const onSubmit = vi.fn();
    render(<TicketFormModal open ticket={ticket} onOpenChange={vi.fn()} onSubmit={onSubmit} />);
    expect(screen.getByLabelText('Título')).toHaveValue(ticket.title);
    await userEvent.clear(screen.getByLabelText('Título'));
    await userEvent.type(screen.getByLabelText('Título'), 'Novo título do ticket');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({
      title: 'Novo título do ticket', description: ticket.description, priority: 'medium', status: 'open',
    }));
  });

  it('disables submission while saving', () => {
    render(<TicketFormModal open isLoading onOpenChange={vi.fn()} onSubmit={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Salvando...' })).toBeDisabled();
  });

  it('cancels without submitting', async () => {
    const onOpenChange = vi.fn();
    const onSubmit = vi.fn();
    render(<TicketFormModal open onOpenChange={onOpenChange} onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
