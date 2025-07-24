'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { auth, assertDb } from '@/lib/firebase';
import { Client, ServiceTicket, Invoice } from '@/lib/types';
import { validateClientProfile, getProfileCompletionPercentage } from '@/lib/utils/validation';
import ProfileCompletionBanner from '@/components/ProfileCompletionBanner';
import ClientLayout from '@/components/layout/ClientLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Cloud, 
  FileText, 
  Globe, 
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard,
  Plus
} from 'lucide-react';
import Link from 'next/link';

const db = assertDb();

export default function ClientDashboard() {
  const [client, setClient] = useState<Client | null>(null);
  const [recentTickets, setRecentTickets] = useState<ServiceTicket[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [profileValidation, setProfileValidation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientData = async () => {
      if (!auth.currentUser) return;

      try {
        // Fetch client data
        const clientQuery = query(
          collection(db, 'clients'),
          where('email', '==', auth.currentUser.email)
        );
        const clientSnapshot = await getDocs(clientQuery);
        
        if (!clientSnapshot.empty) {
          const clientDoc = clientSnapshot.docs[0];
          const clientData = {
            id: clientDoc.id,
            ...clientDoc.data(),
            createdAt: clientDoc.data().createdAt?.toDate(),
            lastActivity: clientDoc.data().lastActivity?.toDate(),
            subscription: {
              ...clientDoc.data().subscription,
              currentPeriodStart: clientDoc.data().subscription?.currentPeriodStart?.toDate(),
              currentPeriodEnd: clientDoc.data().subscription?.currentPeriodEnd?.toDate(),
            }
          } as Client;
          setClient(clientData);

          // Valider le profil client
          const validation = validateClientProfile(clientData);
          setProfileValidation(validation);

          // Fetch recent tickets
          const ticketsQuery = query(
            collection(db, 'tickets'),
            where('clientId', '==', clientData.id),
            orderBy('createdAt', 'desc'),
            limit(3)
          );
          const ticketsSnapshot = await getDocs(ticketsQuery);
          const ticketsData = ticketsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate(),
            scheduledDate: doc.data().scheduledDate?.toDate(),
            resolvedAt: doc.data().resolvedAt?.toDate(),
          })) as ServiceTicket[];
          setRecentTickets(ticketsData);

          // Fetch recent invoices
          const invoicesQuery = query(
            collection(db, 'invoices'),
            where('clientId', '==', clientData.id),
            orderBy('createdAt', 'desc'),
            limit(3)
          );
          const invoicesSnapshot = await getDocs(invoicesQuery);
          const invoicesData = invoicesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            dueDate: doc.data().dueDate?.toDate(),
            paidAt: doc.data().paidAt?.toDate(),
            createdAt: doc.data().createdAt?.toDate(),
            sentAt: doc.data().sentAt?.toDate(),
          })) as Invoice[];
          setRecentInvoices(invoicesData);
        }
      } catch (error) {
        console.error('Error fetching client data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'text-blue-600 bg-blue-100';
      case 'in_progress':
        return 'text-yellow-600 bg-yellow-100';
      case 'resolved':
        return 'text-green-600 bg-green-100';
      case 'closed':
        return 'text-gray-600 bg-gray-100';
      case 'paid':
        return 'text-green-600 bg-green-100';
      case 'overdue':
        return 'text-red-600 bg-red-100';
      case 'sent':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'paid':
        return <CheckCircle className="h-4 w-4" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </ClientLayout>
    );
  }

  if (!client) {
    return (
      <ClientLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Profil client non trouvé
          </h2>
          <p className="text-gray-600">
            Veuillez contacter le support pour configurer votre profil.
          </p>
        </div>
      </ClientLayout>
    );
  }

  const cloudUsagePercent = client.cloudQuota > 0 ? (client.cloudUsed / client.cloudQuota) * 100 : 0;

  return (
    <ClientLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Bonjour, {client.firstName} {client.lastName}
          </h1>
          <p className="text-gray-600">Bienvenue dans votre espace TechÎle Solutions</p>
        </div>

        {/* Profile Completion Banner */}
        {profileValidation && !profileValidation.isComplete && (
          <ProfileCompletionBanner
            completionPercentage={getProfileCompletionPercentage(client)}
            missingFields={profileValidation.missingFields}
          />
        )}

        {/* Subscription Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Forfait actuel</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                client.subscription.status === 'active' 
                  ? 'text-green-700 bg-green-100' 
                  : 'text-red-700 bg-red-100'
              }`}>
                {client.subscription.status === 'active' ? 'Actif' : 'Inactif'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Plan</p>
                <p className="font-semibold capitalize">{client.subscription.plan}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Prix</p>
                <p className="font-semibold">{client.subscription.price}$ / {client.subscription.billingCycle === 'monthly' ? 'mois' : 'an'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Prochaine facturation</p>
                <p className="font-semibold">
                  {client.subscription.currentPeriodEnd?.toLocaleDateString('fr-CA')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sauvegarde cloud</CardTitle>
              <Cloud className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{client.cloudUsed} Go</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${Math.min(cloudUsagePercent, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {client.cloudUsed} / {client.cloudQuota} Go utilisés
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tickets actifs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {recentTickets.filter(t => t.status === 'open' || t.status === 'in_progress').length}
              </div>
              <p className="text-xs text-muted-foreground">
                En cours de traitement
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Factures impayées</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {recentInvoices.filter(i => i.status === 'sent' || i.status === 'overdue').length}
              </div>
              <p className="text-xs text-muted-foreground">
                À régler
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>
              Accédez rapidement à vos services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/client/tickets/new">
                <Button className="w-full h-20 flex flex-col items-center justify-center">
                  <Plus className="h-6 w-6 mb-2" />
                  Nouveau ticket
                </Button>
              </Link>
              <Link href="/client/cloud">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                  <Cloud className="h-6 w-6 mb-2" />
                  Mes sauvegardes
                </Button>
              </Link>
              <Link href="/client/invoices">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                  <FileText className="h-6 w-6 mb-2" />
                  Mes factures
                </Button>
              </Link>
              <Link href="/client/website">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                  <Globe className="h-6 w-6 mb-2" />
                  Mon site web
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Tickets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Tickets récents
                </span>
                <Link href="/client/tickets">
                  <Button variant="ghost" size="sm">Voir tout</Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTickets.length === 0 ? (
                  <p className="text-sm text-gray-500">Aucun ticket récent</p>
                ) : (
                  recentTickets.map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{ticket.title}</p>
                        <p className="text-xs text-gray-500">
                          {ticket.createdAt?.toLocaleDateString('fr-CA')}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(ticket.status)}`}>
                          {getStatusIcon(ticket.status)}
                          <span className="ml-1">{ticket.status}</span>
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Invoices */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Factures récentes
                </span>
                <Link href="/client/invoices">
                  <Button variant="ghost" size="sm">Voir tout</Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentInvoices.length === 0 ? (
                  <p className="text-sm text-gray-500">Aucune facture récente</p>
                ) : (
                  recentInvoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{invoice.invoiceNumber}</p>
                        <p className="text-xs text-gray-500">
                          {invoice.createdAt?.toLocaleDateString('fr-CA')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{invoice.total.toFixed(2)}$</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(invoice.status)}`}>
                          {getStatusIcon(invoice.status)}
                          <span className="ml-1">{invoice.status}</span>
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ClientLayout>
  );
}