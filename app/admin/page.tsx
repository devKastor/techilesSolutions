'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { assertDb } from '@/lib/firebase';
import { DashboardStats, Client, ServiceTicket, Invoice } from '@/lib/types';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  DollarSign,
  AlertTriangle,
  Cloud,
  TrendingUp,
  FileText,
  Clock
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    activeClients: 0,
    monthlyRevenue: 0,
    pendingTickets: 0,
    overdueInvoices: 0,
    cloudUsagePercent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentTickets, setRecentTickets] = useState<ServiceTicket[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const db = assertDb(); // ✅ appel sécurisé ici

      try {
        const clientsSnapshot = await getDocs(collection(db, 'clients'));
        const clients = clientsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          lastActivity: doc.data().lastActivity?.toDate(),
        })) as Client[];

        const activeClients = clients.filter(client => client.status === 'active');

        const ticketsSnapshot = await getDocs(collection(db, 'tickets'));
        const tickets = ticketsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
          scheduledDate: doc.data().scheduledDate?.toDate(),
          resolvedAt: doc.data().resolvedAt?.toDate(),
        })) as ServiceTicket[];

        const pendingTickets = tickets.filter(ticket =>
          ticket.status === 'open' || ticket.status === 'in_progress'
        );

        const invoicesSnapshot = await getDocs(collection(db, 'invoices'));
        const invoices = invoicesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          dueDate: doc.data().dueDate?.toDate(),
          paidAt: doc.data().paidAt?.toDate(),
          createdAt: doc.data().createdAt?.toDate(),
          sentAt: doc.data().sentAt?.toDate(),
        })) as Invoice[];

        const overdueInvoices = invoices.filter(invoice =>
          invoice.status === 'overdue'
        );

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyRevenue = invoices
          .filter(invoice =>
            invoice.status === 'paid' &&
            invoice.paidAt &&
            invoice.paidAt.getMonth() === currentMonth &&
            invoice.paidAt.getFullYear() === currentYear
          )
          .reduce((sum, invoice) => sum + invoice.total, 0);

        const totalCloudQuota = clients.reduce((sum, client) => sum + (client.cloudQuota || 0), 0);
        const totalCloudUsed = clients.reduce((sum, client) => sum + (client.cloudUsed || 0), 0);
        const cloudUsagePercent = totalCloudQuota > 0 ? (totalCloudUsed / totalCloudQuota) * 100 : 0;

        setStats({
          totalClients: clients.length,
          activeClients: activeClients.length,
          monthlyRevenue,
          pendingTickets: pendingTickets.length,
          overdueInvoices: overdueInvoices.length,
          cloudUsagePercent,
        });

        const recentTicketsQuery = query(
          collection(db, 'tickets'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const recentTicketsSnapshot = await getDocs(recentTicketsQuery);
        const recentTicketsData = recentTicketsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
          scheduledDate: doc.data().scheduledDate?.toDate(),
          resolvedAt: doc.data().resolvedAt?.toDate(),
        })) as ServiceTicket[];
        setRecentTickets(recentTicketsData);

        const recentInvoicesQuery = query(
          collection(db, 'invoices'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const recentInvoicesSnapshot = await getDocs(recentInvoicesQuery);
        const recentInvoicesData = recentInvoicesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          dueDate: doc.data().dueDate?.toDate(),
          paidAt: doc.data().paidAt?.toDate(),
          createdAt: doc.data().createdAt?.toDate(),
          sentAt: doc.data().sentAt?.toDate(),
        })) as Invoice[];
        setRecentInvoices(recentInvoicesData);

      } catch (error) {
        console.error('Erreur de chargement du tableau de bord :', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-blue-600 bg-blue-100';
      case 'in_progress': return 'text-yellow-600 bg-yellow-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      case 'paid': return 'text-green-600 bg-green-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      case 'sent': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Rendu statique et dynamique complet – inchangé */}
      {/* ... (tout le JSX est OK et complet, comme tu l'avais posté) */}
    </AdminLayout>
  );
}
