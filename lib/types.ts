import { Timestamp } from 'firebase/firestore';

export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';
export type WebsiteTypeProject = 'vitrine' | 'pme' | 'ecommerce';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'client' | 'technician' | 'admin_technician';
  createdAt: Date;
  lastLogin?: Date;
}

export interface Client {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city: string;
  province: string;
  postalCode?: string;
  isInIslands: boolean;
  subscription: Subscription;
  cloudQuota: number; // in GB
  cloudUsed: number; // in GB
  createdAt: Date;
  lastActivity?: Date;
  internalNotes?: string;
  priority: 'low' | 'normal' | 'high';
  status: 'active' | 'suspended' | 'cancelled';
}

export interface ClientFirestore {
  id: string;
  firstName: string;
  lastName: string;
  // …all your other Client fields except the Date ones…
  createdAt?: Timestamp;
  lastActivity?: Timestamp;
}

export interface Subscription {
  plan: 'base' | 'standard' | 'plus' | 'prestige';
  price: number;
  billingCycle: 'monthly' | 'annual';
  status: 'active' | 'past_due' | 'cancelled' | 'suspended';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  stripeSubscriptionId?: string;
}

export interface ServiceTicket {
  id: string;
  clientId: string;
  title: string;
  description: string;
  type: 'intervention' | 'support' | 'billing' | 'general';
  priority: TicketPriority;
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'cancelled';
  assignedTo?: string;
  scheduledDate?: Date;
  location?: string;
  estimatedDuration?: number;
  actualDuration?: number;
  internalNotes?: string;
  clientNotes?: string;
  attachments?: string[];
  workflowSteps?: WorkflowStep[];
  completionPercentage?: number;
  completionNotes?: string;
  interventionStarted?: Date;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  completedAt?: Date;
  notes?: string;
  required: boolean;
}

export interface Invoice {
  id: string;
  clientId: string;
  invoiceNumber: string;
  amount: number;
  tax: number;
  total: number;
  description: string;
  items: InvoiceItem[];
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: Date;
  paidAt?: Date;
  stripePaymentIntentId?: string;
  createdAt: Date;
  sentAt?: Date;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface WebsiteProject {
  id: string;
  clientId: string;
  type: WebsiteTypeProject;
  name: string;
  domain?: string;
  subdomain: string;
  status: 'planning' | 'development' | 'review' | 'live' | 'maintenance';
  content: {
    logo?: string;
    companyName: string;
    description: string;
    contact: {
      email: string;
      phone?: string;
      address?: string;
    };
    colors: {
      primary: string;
      secondary: string;
    };
    pages: WebsitePage[];
  };
  createdAt: Date;
  launchedAt?: Date;
}

export interface WebsitePage {
  name: string;
  slug: string;
  content: string;
  isPublished: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'annual';
  features: string[];
  interventionsIncluded: number;
  cloudStorage: number; // in GB
  isActive: boolean;
  stripePriceId?: string;
}

export interface ActivityLog {
  id: string;
  clientId: string;
  action: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface DashboardStats {
  totalClients: number;
  activeClients: number;
  monthlyRevenue: number;
  pendingTickets: number;
  overdueInvoices: number;
  cloudUsagePercent: number;
}