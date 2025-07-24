'use client';

import { useEffect, useState } from 'react';
import { getAllInvoices, createInvoice, updateInvoice } from '@/lib/services/invoices';
import { getAllClients } from '@/lib/services/clients';
import { Invoice, Client } from '@/lib/types';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  DollarSign, 
  Plus, 
  Search, 
  Send,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText
} from 'lucide-react';

export default function AdminBillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const [newInvoice, setNewInvoice] = useState({
    clientId: '',
    invoiceNumber: '',
    amount: 0,
    tax: 0,
    total: 0,
    description: '',
    items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
    status: 'draft' as const,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  useEffect(() => {
    const fetchData = async () => {
      const [invoicesResult, clientsResult] = await Promise.all([
        getAllInvoices(),
        getAllClients()
      ]);
      
      if (!invoicesResult.error) {
        setInvoices(invoicesResult.invoices);
      }
      if (!clientsResult.error) {
        setClients(clientsResult.clients);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleCreateInvoice = async () => {
    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}`;
    const invoiceData = {
      ...newInvoice,
      invoiceNumber,
      total: newInvoice.amount + newInvoice.tax,
    };

    const { id, error } = await createInvoice(invoiceData);
    if (!error && id) {
      const { invoices } = await getAllInvoices();
      setInvoices(invoices);
      setIsCreateDialogOpen(false);
      setNewInvoice({
        clientId: '',
        invoiceNumber: '',
        amount: 0,
        tax: 0,
        total: 0,
        description: '',
        items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
        status: 'draft',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
    }
  };

  const handleSendInvoice = async (invoiceId: string) => {
    const { error } = await updateInvoice(invoiceId, {
      status: 'sent',
      sentAt: new Date(),
    });
    
    if (!error) {
      const { invoices } = await getAllInvoices();
      setInvoices(invoices);
    }
  };

  const handleMarkAsPaid = async (invoiceId: string) => {
    const { error } = await updateInvoice(invoiceId, {
      status: 'paid',
      paidAt: new Date(),
    });
    
    if (!error) {
      const { invoices } = await getAllInvoices();
      setInvoices(invoices);
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const client = clients.find(c => c.id === invoice.clientId);
    const clientName = client ? `${client.firstName} ${client.lastName}` : '';
    return (
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

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
        return <Send className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const totalRevenue = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0);

  const pendingAmount = invoices
    .filter(inv => inv.status === 'sent')
    .reduce((sum, inv) => sum + inv.total, 0);

  const overdueAmount = invoices
    .filter(inv => inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.total, 0);

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
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Facturation</h1>
            <p className="text-gray-600">Gérez vos factures et paiements</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle facture
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer une nouvelle facture</DialogTitle>
                <DialogDescription>
                  Créez une facture pour un client
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="clientId">Client</Label>
                  <Select value={newInvoice.clientId} onValueChange={(value) => 
                    setNewInvoice({...newInvoice, clientId: value})
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.firstName} {client.lastName} - {client.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newInvoice.description}
                    onChange={(e) => setNewInvoice({...newInvoice, description: e.target.value})}
                    placeholder="Description des services facturés"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Montant (CAD)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={newInvoice.amount}
                      onChange={(e) => setNewInvoice({...newInvoice, amount: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tax">Taxes (CAD)</Label>
                    <Input
                      id="tax"
                      type="number"
                      step="0.01"
                      value={newInvoice.tax}
                      onChange={(e) => setNewInvoice({...newInvoice, tax: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="dueDate">Date d'échéance</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newInvoice.dueDate.toISOString().split('T')[0]}
                    onChange={(e) => setNewInvoice({...newInvoice, dueDate: new Date(e.target.value)})}
                  />
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total:</span>
                    <span>{(newInvoice.amount + newInvoice.tax).toFixed(2)} CAD</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateInvoice}>
                  Créer la facture
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
              <CardTitle className="text-sm font-medium">Revenus totaux</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRevenue.toFixed(2)}$</div>
              <p className="text-xs text-muted-foreground">Factures payées</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En attente</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingAmount.toFixed(2)}$</div>
              <p className="text-xs text-muted-foreground">Factures envoyées</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En retard</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{overdueAmount.toFixed(2)}$</div>
              <p className="text-xs text-muted-foreground">Factures échues</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total factures</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invoices.length}</div>
              <p className="text-xs text-muted-foreground">Toutes les factures</p>
            </CardContent>
          </Card>
        </div>

        {/* Invoices List */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des factures</CardTitle>
            <CardDescription>
              {filteredInvoices.length} facture{filteredInvoices.length > 1 ? 's' : ''} trouvée{filteredInvoices.length > 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredInvoices.map((invoice) => {
                const client = clients.find(c => c.id === invoice.clientId);
                return (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-semibold">{invoice.invoiceNumber}</h3>
                          <div className="text-sm text-gray-500">
                            <p>Client: {client ? `${client.firstName} ${client.lastName}` : 'Client inconnu'}</p>
                            <p>Créée: {invoice.createdAt?.toLocaleDateString('fr-CA')}</p>
                            <p>Échéance: {invoice.dueDate?.toLocaleDateString('fr-CA')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-lg font-semibold">{invoice.total.toFixed(2)}$</div>
                        <div className="text-sm text-gray-500">{invoice.description}</div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Badge className={`${getStatusColor(invoice.status)} flex items-center`}>
                          {getStatusIcon(invoice.status)}
                          <span className="ml-1">{invoice.status}</span>
                        </Badge>
                        <div className="flex space-x-1">
                          {invoice.status === 'draft' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSendInvoice(invoice.id)}
                            >
                              <Send className="h-3 w-3 mr-1" />
                              Envoyer
                            </Button>
                          )}
                          {invoice.status === 'sent' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkAsPaid(invoice.id)}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Payée
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}