export enum UserRole {
  ADMIN = 'ADMIN',
  RESIDENT = 'RESIDENT'
}

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED'
}

export enum PaymentStatus {
  PAID = 'PAID',
  PENDING = 'PENDING',
  OVERDUE = 'OVERDUE'
}

export interface Room {
  room_id: number;
  room_number: string;
  max_capacity: number;
  current_occupancy: number;
}

export interface Resident {
  resident_id: number;
  room_id: number;
  name: string;
  phone: string;
  email: string;
  join_date: string;
  state: string;
}

export interface FeeRecord {
  fee_id: number;
  resident_id: number;
  amount: number;
  due_date: string;
  payment_date?: string;
  status: PaymentStatus;
}

export interface SupportTicket {
  ticket_id: number;
  resident_id: number;
  category: string;
  description: string;
  status: TicketStatus;
  created_at: string;
}

export interface StatData {
  name: string;
  value: number;
}