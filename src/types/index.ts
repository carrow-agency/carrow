export type { PlanData, UserAccount, ClientUser } from '../lib/store';

export interface WorkImage {
  id: string;
  url: string;
  title: string;
  category: string;
  client?: string;
  published?: boolean;
}

export interface Order {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  plan: string;
  date: string;
  status: 'Pending' | 'Active' | 'Cancelled';
}