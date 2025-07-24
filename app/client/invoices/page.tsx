'use client';

import { useEffect, useState } from 'react';
import { getClientInvoices } from '@/lib/services/invoices';
import { getClientByEmail } from '@/lib/services/clients';
import { Invoice } from '@/lib/types';
import { auth } from '@/lib/firebase';
import ClientLayout from '@/components/layout/ClientLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Search, 
  Download,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react';

export default function ClientInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [clientId, setClientId] = useState<string>('');

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!auth.currentUser?.email) return;

      try {
        // Get client data first
        const { client } = await getClientByEmail(auth.currentUser.email);
        if (client) {
          setClientId(client.id);
          const { invoices, error } = await getClientInvoices(client.id);
          if (!error) {
            setInvoices(invoices);
          }
        }
      } catch (error) {
        console.error('Error fetching invoices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const handlePayInvoice = async (invoiceId: string) => {
    // TODO: Integrate with Stripe payment
    console.log('Pay invoice:', invoiceId);
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    // TODO: Generate and download PDF
    console.log('Download invoice:', invoiceId);
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4" />;
      case 'sent':
        return <Clock className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const totalPaid = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0);

  const totalPending = invoices
    .filter(inv => inv.status === 'sent' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.total, 0);

  const overdueCount = invoices.filter(inv => inv.status === 'overdue').length;

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes factures</h1>
          <p className="text-gray-600">Consultez et payez vos factures</p>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher une facture..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total factures</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invoices.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total payé</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPaid.toFixed(2)}$</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">À payer</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPending.toFixed(2)}$</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En retard</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Invoices List */}
        <Card>
          <CardHeader>
            <CardTitle>Mes factures</CardTitle>
            <CardDescription>
              {filteredInvoices.length} facture{filteredInvoices.length > 1 ? 's' : ''} trouvée{filteredInvoices.length > 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredInvoices.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune facture trouvée</h3>
                  <p className="text-gray-600">
                    {searchTerm ? 'Aucune facture ne correspond à votre recherche.' : 'Vous n\'avez pas encore de facture.'}
                  </p>
                </div>
              ) : (
                filteredInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-start space-x-4">
                        <div className="flex-1">
                          <h3 className="font-semibold">{invoice.invoiceNumber}</h3>
                          <p className="text-sm text-gray-600 mt-1">{invoice.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>Créée: {invoice.createdAt?.toLocaleDateString('fr-CA')}</span>
                            <span>Échéance: {invoice.dueDate?.toLocaleDateString('fr-CA')}</span>
                            {invoice.paidAt && (
                              <span>Payée: {invoice.paidAt.toLocaleDateString('fr-CA')}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-lg font-semibold">{invoice.total.toFixed(2)}$</div>
                        <div className="text-sm text-gray-500">
                          Montant: {invoice.amount.toFixed(2)}$ + Taxes: {invoice.tax.toFixed(2)}$
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Badge className={`${getStatusColor(invoice.status)} flex items-center`}>
                          {getStatusIcon(invoice.status)}
                          <span className="ml-1">
                            {invoice.status === 'paid' ? 'Payée' : 
                             invoice.status === 'sent' ? 'Envoyée' :
                             invoice.status === 'overdue' ? 'En retard' : 'Brouillon'}
                          </span>
                        </Badge>
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadInvoice(invoice.id)}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            PDF
                          </Button>
                          {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                            <Button
                              size="sm"
                              onClick={() => handlePayInvoice(invoice.id)}
                            >
                              <CreditCard className="h-3 w-3 mr-1" />
                              Payer
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ClientLayout>
  );
}