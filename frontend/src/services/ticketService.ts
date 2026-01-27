import apiClient from './apiClient';
import type {
  Ticket,
  TicketFilters,
  CreateTicketData,
  UpdateTicketData,
  PaginatedResponse,
  SingleResponse,
  AiJobResponse,
  TicketSummary,
  TicketBacklog,
  ActivityEvent,
  TicketEvent,
} from '@/types';

export const ticketService = {
  async getTickets(filters: TicketFilters = {}): Promise<PaginatedResponse<Ticket>> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', String(filters.page));
    if (filters.per_page) params.append('per_page', String(filters.per_page));
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.q) params.append('q', filters.q);
    if (filters.sort) params.append('sort', filters.sort);
    
    const response = await apiClient.get<PaginatedResponse<Ticket>>(`/api/tickets?${params.toString()}`);
    return response.data;
  },

  async getTicket(id: number): Promise<Ticket> {
    const response = await apiClient.get<SingleResponse<Ticket>>(`/api/tickets/${id}`);
    return response.data.data;
  },

  async createTicket(data: CreateTicketData): Promise<Ticket> {
    const response = await apiClient.post<SingleResponse<Ticket>>('/api/tickets', data);
    return response.data.data;
  },

  async updateTicket(id: number, data: UpdateTicketData): Promise<Ticket> {
    const response = await apiClient.patch<SingleResponse<Ticket>>(`/api/tickets/${id}`, data);
    return response.data.data;
  },

  async deleteTicket(id: number): Promise<void> {
    await apiClient.delete(`/api/tickets/${id}`);
  },

  // Trashed tickets endpoints
  async getTrashedTickets(filters: TicketFilters = {}): Promise<PaginatedResponse<Ticket>> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', String(filters.page));
    if (filters.per_page) params.append('per_page', String(filters.per_page));
    if (filters.q) params.append('q', filters.q);
    if (filters.sort) params.append('sort', filters.sort);
    
    const response = await apiClient.get<PaginatedResponse<Ticket>>(`/api/tickets/trashed?${params.toString()}`);
    return response.data;
  },

  async restoreTicket(id: number): Promise<Ticket> {
    const response = await apiClient.post<SingleResponse<Ticket>>(`/api/tickets/${id}/restore`);
    return response.data.data;
  },

  async forceDeleteTicket(id: number): Promise<void> {
    await apiClient.delete(`/api/tickets/${id}/force`);
  },

  // AI endpoints
  async enqueueSummary(id: number): Promise<AiJobResponse> {
    const response = await apiClient.post<AiJobResponse>(`/api/tickets/${id}/ai-summary`);
    return response.data;
  },

  async enqueueReply(id: number): Promise<AiJobResponse> {
    const response = await apiClient.post<AiJobResponse>(`/api/tickets/${id}/ai-reply`);
    return response.data;
  },

  async enqueuePriority(id: number): Promise<AiJobResponse> {
    const response = await apiClient.post<AiJobResponse>(`/api/tickets/${id}/ai-priority`);
    return response.data;
  },

  // Analytics endpoints
  async getTicketSummary(): Promise<TicketSummary> {
    const response = await apiClient.get<SingleResponse<TicketSummary>>('/api/tickets/summary');
    return response.data.data;
  },

  async getTicketBacklog(): Promise<TicketBacklog> {
    const response = await apiClient.get<SingleResponse<TicketBacklog>>('/api/tickets/backlog');
    return response.data.data;
  },

  async getTicketActivity(perPage: number = 50): Promise<ActivityEvent[]> {
    const params = new URLSearchParams();
    if (perPage) params.append('per_page', String(perPage));
    
    const response = await apiClient.get<SingleResponse<ActivityEvent[]>>(
      `/api/tickets/activity?${params.toString()}`
    );
    return response.data.data;
  },

  // Ticket Events (per ticket timeline)
  async getTicketEvents(
    ticketId: number,
    params: { per_page?: number; page?: number } = {}
  ): Promise<PaginatedResponse<TicketEvent>> {
    const searchParams = new URLSearchParams();
    if (params.per_page) searchParams.append('per_page', String(params.per_page));
    if (params.page) searchParams.append('page', String(params.page));
    
    const response = await apiClient.get<PaginatedResponse<TicketEvent>>(
      `/api/tickets/${ticketId}/activity?${searchParams.toString()}`
    );
    return response.data;
  },
};

export default ticketService;
