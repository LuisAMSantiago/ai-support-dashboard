import { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import apiClient from './apiClient';
import { ticketService } from './ticketService';
import { authService } from './authService';
import { ticket } from '@/test/fixtures';

const requests: InternalAxiosRequestConfig[] = [];
let responseData: unknown;
const originalAdapter = apiClient.defaults.adapter;

afterEach(() => { apiClient.defaults.adapter = originalAdapter; });

beforeEach(() => {
  requests.length = 0;
  responseData = { data: ticket };
  document.cookie = 'XSRF-TOKEN=; Max-Age=0; path=/';
  apiClient.defaults.adapter = async (config) => {
    requests.push(config);
    return { data: responseData, status: 200, statusText: 'OK', headers: {}, config };
  };
});

describe('API client and ticket service', () => {
  it('sends credentials and decodes the CSRF cookie', async () => {
    document.cookie = 'XSRF-TOKEN=token%3Dvalue; path=/';
    await ticketService.getTicket(7);
    expect(requests[0].withCredentials).toBe(true);
    expect(requests[0].headers.get('X-XSRF-TOKEN')).toBe('token=value');
  });

  it('encodes search, pagination, status, priority and sorting', async () => {
    responseData = { data: [ticket], meta: { total: 1 } };
    const result = await ticketService.getTickets({ page: 2, per_page: 15, q: 'erro & login', status: 'open', priority: 'high', sort: '-created_at' });
    const query = new URL(requests[0].url!, 'http://example.test').searchParams;
    expect(Object.fromEntries(query)).toEqual({ page: '2', per_page: '15', q: 'erro & login', status: 'open', priority: 'high', sort: '-created_at' });
    expect(result).toEqual(responseData);
  });

  it('creates and updates ticket data', async () => {
    const data = { title: ticket.title, description: ticket.description, priority: 'medium' as const };
    expect(await ticketService.createTicket(data)).toEqual(ticket);
    await ticketService.updateTicket(7, { ...data, status: 'closed' });
    expect(requests.map(({ method, url, data: body }) => [method, url, JSON.parse(body)])).toEqual([
      ['post', '/api/tickets', data], ['patch', '/api/tickets/7', { ...data, status: 'closed' }],
    ]);
  });

  it('deletes, restores and permanently deletes a ticket', async () => {
    await ticketService.deleteTicket(7);
    expect(await ticketService.restoreTicket(7)).toEqual(ticket);
    await ticketService.forceDeleteTicket(7);
    expect(requests.map(({ method, url }) => [method, url])).toEqual([
      ['delete', '/api/tickets/7'], ['post', '/api/tickets/7/restore'], ['delete', '/api/tickets/7/force'],
    ]);
  });

  it.each([
    ['enqueueSummary', 'summary'], ['enqueueReply', 'reply'], ['enqueuePriority', 'priority'],
  ] as const)('enqueues %s and preserves the job metadata', async (method, job) => {
    responseData = { data: ticket, meta: { status: 'queued', job } };
    expect(await ticketService[method](7)).toEqual(responseData);
    expect(requests[0].url).toBe(`/api/tickets/7/ai-${job}`);
  });

  it.each([
    ['getTicketSummary', '/api/tickets/summary'], ['getTicketBacklog', '/api/tickets/backlog'],
    ['getTicketActivity', '/api/tickets/activity?per_page=50'],
  ] as const)('unwraps analytics from %s', async (method, url) => {
    responseData = { data: { marker: method } };
    expect(await ticketService[method]()).toEqual({ marker: method });
    expect(requests[0].url).toBe(url);
  });

  it('loads paginated ticket history and trash', async () => {
    await ticketService.getTicketEvents(7, { page: 2, per_page: 20 });
    await ticketService.getTrashedTickets({ page: 1, q: 'excluído' });
    expect(requests[0].url).toBe('/api/tickets/7/activity?per_page=20&page=2');
    const url = new URL(requests[1].url!, 'http://example.test');
    expect(url.pathname).toBe('/api/tickets/trashed');
    expect(url.searchParams.get('q')).toBe('excluído');
  });

  it('propagates request failures so the UI can handle them', async () => {
    const failure = new AxiosError('Unauthorized', 'ERR_BAD_REQUEST');
    apiClient.defaults.adapter = async () => { throw failure; };
    await expect(ticketService.getTicket(7)).rejects.toBe(failure);
  });
});

describe('authentication service', () => {
  it.each(['login', 'register'] as const)('fetches CSRF before %s', async (method) => {
    const user = { id: 1, name: 'Pessoa', email: 'test@example.com' };
    responseData = { data: user };
    const credentials = { name: user.name, email: user.email, password: 'password', password_confirmation: 'password' };
    expect(await authService[method](credentials)).toEqual(user);
    expect(requests.map(({ url }) => url)).toEqual(['/sanctum/csrf-cookie', `/api/auth/${method}`]);
    expect(JSON.parse(requests[1].data)).toEqual(credentials);
  });

  it('fetches the current session without caching and logs out', async () => {
    await authService.getMe();
    await authService.logout();
    expect(requests[0].url).toBe('/api/auth/me');
    expect(AxiosHeaders.from(requests[0].headers).get('Cache-Control')).toContain('no-store');
    expect(requests[1].url).toBe('/api/auth/logout');
    expect(requests[1].method).toBe('post');
  });
});
