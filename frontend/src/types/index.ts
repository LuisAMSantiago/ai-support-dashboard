export type TicketStatus = 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high';
export type AiJobStatus = 'idle' | 'queued' | 'processing' | 'done' | 'failed';

export interface UserRelation {
  id: number;
  name: string;
  email: string;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  ai_summary: string | null;
  ai_suggested_reply: string | null;
  priority: TicketPriority | null;
  status: TicketStatus;
  assigned_to: number | null;
  closed_at: string | null;
  // Tracking fields (IDs)
  created_by: number | null;
  updated_by: number | null;
  closed_by: number | null;
  reopened_by: number | null;
  // Tracking relations (user objects from API)
  created_by_user?: UserRelation | null;
  updated_by_user?: UserRelation | null;
  closed_by_user?: UserRelation | null;
  reopened_by_user?: UserRelation | null;
  // AI status fields
  ai_summary_status: AiJobStatus;
  ai_reply_status: AiJobStatus;
  ai_priority_status: AiJobStatus;
  ai_last_error: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface User {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  path: string;
  per_page: number;
  to: number | null;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

export interface SingleResponse<T> {
  data: T;
}

export interface AiJobResponse {
  data: Ticket;
  meta: {
    status: 'queued';
    job: 'summary' | 'reply' | 'priority';
  };
}

export interface TicketFilters {
  page?: number;
  per_page?: number;
  status?: TicketStatus | '';
  priority?: TicketPriority | '';
  q?: string;
  sort?: string;
}

// Analytics types
export interface TicketSummary {
  total_active: number;
  by_status: Record<TicketStatus, number>;
  by_priority: Record<TicketPriority, number>;
  closed: {
    today: number;
    last_7_days: number;
    last_30_days: number;
  };
  average_time_to_close_hours: number | null;
}

export interface TicketBacklog {
  counts: {
    older_than_2_days: number;
    older_than_7_days: number;
    older_than_14_days: number;
  };
  oldest_open: Ticket[];
}

export type ActivityType = 'created' | 'updated' | 'status_changed' | 'ai_done';
export type ActivitySubtype = 'closed' | 'reopened';
export type AiType = 'summary' | 'reply' | 'priority';

export interface ActivityEvent {
  type: ActivityType;
  subtype?: ActivitySubtype;
  ai_type?: AiType;
  ticket_id: number;
  ticket_title: string;
  user_id?: number | null;
  status?: TicketStatus;
  timestamp: string;
}

// Ticket Event types (from ticket_events table)
export type TicketEventType =
  | 'created'
  | 'updated'
  | 'status_changed'
  | 'deleted'
  | 'restored'
  | 'ai_summary_done'
  | 'ai_reply_done'
  | 'ai_priority_done';

export interface TicketEventMeta {
  before?: TicketStatus;
  after?: TicketStatus;
  [key: string]: any;
}

export interface TicketEventUser {
  id: number;
  name: string;
  email: string;
}

export interface TicketEvent {
  id: number;
  ticket_id: number;
  type: TicketEventType;
  meta: TicketEventMeta | null;
  created_by: number | null;
  created_at: string;
  user?: TicketEventUser | null;
}

export interface CreateTicketData {
  title: string;
  description: string;
  priority?: TicketPriority;
}

export interface UpdateTicketData {
  title?: string;
  description?: string;
  priority?: TicketPriority;
  status?: TicketStatus;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface ValidationErrors {
  message: string;
  errors: Record<string, string[]>;
}
