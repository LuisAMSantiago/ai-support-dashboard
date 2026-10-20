import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Login from './Login';
import { authService } from '@/services/authService';
import { toast } from 'sonner';

const { login } = vi.hoisted(() => ({ login: vi.fn() }));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ login, isLoggingIn: false, isAuthenticated: false, isLoading: false }) }));
vi.mock('@/services/authService', () => ({ authService: { register: vi.fn() } }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

beforeEach(() => vi.mocked(authService.register).mockReset());

function renderLogin() {
  return render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <Routes><Route path="/" element={<Login />} /></Routes>
  </MemoryRouter>);
}

describe('login and registration form', () => {
  it('validates required credentials before calling login', async () => {
    renderLogin();
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(await screen.findByText('Senha é obrigatória')).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it('submits the entered login credentials', async () => {
    renderLogin();
    await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Senha'), 'password');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    await waitFor(() => expect(login).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password' }));
  });

  it('rejects mismatched registration passwords', async () => {
    renderLogin();
    await userEvent.click(screen.getByRole('button', { name: /Cadastre-se/ }));
    await userEvent.type(screen.getByLabelText('Nome'), 'Test User');
    await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Senha', { exact: true }), 'password');
    await userEvent.type(screen.getByLabelText('Confirmar Senha'), 'different');
    await userEvent.click(screen.getByRole('button', { name: 'Criar Conta' }));
    expect(await screen.findByText('As senhas não coincidem')).toBeInTheDocument();
    expect(authService.register).not.toHaveBeenCalled();
  });

  it('creates an account and returns to login', async () => {
    vi.mocked(authService.register).mockResolvedValue({ id: 1, name: 'Test User', email: 'test@example.com', is_admin: false, created_at: '', updated_at: '' });
    renderLogin();
    await userEvent.click(screen.getByRole('button', { name: /Cadastre-se/ }));
    await userEvent.type(screen.getByLabelText('Nome'), 'Test User');
    await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Senha', { exact: true }), 'password');
    await userEvent.type(screen.getByLabelText('Confirmar Senha'), 'password');
    await userEvent.click(screen.getByRole('button', { name: 'Criar Conta' }));
    await waitFor(() => expect(authService.register).toHaveBeenCalledWith({ name: 'Test User', email: 'test@example.com', password: 'password', password_confirmation: 'password' }));
    expect(await screen.findByRole('button', { name: 'Entrar' })).toBeInTheDocument();
    expect(toast.success).toHaveBeenCalled();
  });
});
