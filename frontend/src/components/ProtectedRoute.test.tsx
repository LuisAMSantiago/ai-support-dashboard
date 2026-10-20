import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProtectedRoute } from './ProtectedRoute';

const { auth } = vi.hoisted(() => ({ auth: { isAuthenticated: false, isLoading: false, isError: false } }));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => auth }));

function renderRoute() {
  return render(
    <MemoryRouter initialEntries={['/tickets']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/login" element={<p>Login público</p>} />
        <Route path="/tickets" element={<ProtectedRoute><p>Tickets privados</p></ProtectedRoute>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => Object.assign(auth, { isAuthenticated: false, isLoading: false, isError: false }));

  it('waits for the session without exposing private content', () => {
    auth.isLoading = true;
    renderRoute();
    expect(screen.getByText('Verificando sessão...')).toBeInTheDocument();
    expect(screen.queryByText('Tickets privados')).not.toBeInTheDocument();
  });

  it('redirects a guest to login', () => {
    renderRoute();
    expect(screen.getByText('Login público')).toBeInTheDocument();
  });

  it('renders private content after authentication', () => {
    auth.isAuthenticated = true;
    renderRoute();
    expect(screen.getByText('Tickets privados')).toBeInTheDocument();
  });

  it('redirects when checking the session fails', () => {
    Object.assign(auth, { isAuthenticated: true, isError: true });
    renderRoute();
    expect(screen.getByText('Login público')).toBeInTheDocument();
    expect(screen.queryByText('Tickets privados')).not.toBeInTheDocument();
  });
});
