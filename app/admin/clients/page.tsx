'use client';

import { useEffect, useState } from 'react';
import { getAllClients, createClient, updateClient } from '@/lib/services/clients';
import { Client } from '@/lib/types';
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
  Users, 
  Plus, 
  Search, 
  MapPin,
  Mail,
  Phone,
  Calendar,
  Edit,
  Cloud
} from 'lucide-react';

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [newClient, setNewClient] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    province: 'QC',
    postalCode: '',
    isInIslands: true,
    cloudQuota: 50,
    cloudUsed: 0,
    internalNotes: '',
    priority: 'normal' as const,
    status: 'active' as const,
    subscription: {
      plan: 'base' as const,
      price: 25,
      billingCycle: 'monthly' as const,
      status: 'active' as const,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    }
  });

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { clients, error } = await getAllClients();
        if (!error) {
          setClients(clients);
        }
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const handleCreateClient = async () => {
    try {
      const { id, error } = await createClient(newClient);
      if (!error && id) {
        const { clients } = await getAllClients();
        setClients(clients);
        setIsCreateDialogOpen(false);
        setNewClient({
          email: '',
          firstName: '',
          lastName: '',
          phone: '',
          address: '',
          city: '',
          province: 'QC',
          postalCode: '',
          isInIslands: true,
          cloudQuota: 50,
          cloudUsed: 0,
          internalNotes: '',
          priority: 'normal',
          status: 'active',
          subscription: {
            plan: 'base',
            price: 25,
            billingCycle: 'monthly',
            status: 'active',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          }
        });
      }
    } catch (error) {
      console.error('Error creating client:', error);
    }
  };

  const handleUpdateClient = async () => {
    if (!selectedClient) return;
    
    try {
      const { error } = await updateClient(selectedClient.id, selectedClient);
      if (!error) {
        const { clients } = await getAllClients();
        setClients(clients);
        setIsEditDialogOpen(false);
        setSelectedClient(null);
      }
    } catch (error) {
      console.error('Error updating client:', error);
    }
  };

  const filteredClients = clients.filter(client => {
    const firstName = client.firstName || '';
    const lastName = client.lastName || '';
    const email = client.email || '';
    
    return firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des clients</h1>
            <p className="text-gray-600">Gérez vos clients et leurs abonnements</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau client
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer un nouveau client</DialogTitle>
                <DialogDescription>
                  Ajoutez un nouveau client à votre base de données
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    value={newClient.firstName}
                    onChange={(e) => setNewClient({...newClient, firstName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    value={newClient.lastName}
                    onChange={(e) => setNewClient({...newClient, lastName: e.target.value})}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    value={newClient.city}
                    onChange={(e) => setNewClient({...newClient, city: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="plan">Forfait</Label>
                  <Select 
                    value={newClient.subscription.plan} 
                    onValueChange={(value: any) => 
                      setNewClient({
                        ...newClient, 
                        subscription: {
                          ...newClient.subscription,
                          plan: value,
                          price: value === 'base' ? 25 : value === 'standard' ? 45 : value === 'plus' ? 75 : 120
                        }
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="base">Base - 25$/mois</SelectItem>
                      <SelectItem value="standard">Standard - 45$/mois</SelectItem>
                      <SelectItem value="plus">Plus - 75$/mois</SelectItem>
                      <SelectItem value="prestige">Prestige - 120$/mois</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="cloudQuota">Quota cloud (Go)</Label>
                  <Input
                    id="cloudQuota"
                    type="number"
                    value={newClient.cloudQuota}
                    onChange={(e) => setNewClient({...newClient, cloudQuota: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="internalNotes">Notes internes</Label>
                  <Textarea
                    id="internalNotes"
                    value={newClient.internalNotes}
                    onChange={(e) => setNewClient({...newClient, internalNotes: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateClient}>
                  Créer le client
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
                placeholder="Rechercher un client..."
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
              <CardTitle className="text-sm font-medium">Total clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clients.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clients actifs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clients.filter(c => c.status === 'active').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Îles-de-la-Madeleine</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clients.filter(c => c.isInIslands).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisation cloud</CardTitle>
              <Cloud className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clients.reduce((sum, c) => sum + c.cloudUsed, 0)} Go
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Clients List */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des clients</CardTitle>
            <CardDescription>
              {filteredClients.length} client{filteredClients.length > 1 ? 's' : ''} trouvé{filteredClients.length > 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredClients.map((client) => (
                <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-semibold">
                          {client.firstName} {client.lastName}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {client.email}
                          </span>
                          {client.phone && (
                            <span className="flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {client.phone}
                            </span>
                          )}
                          <span className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {client.city}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {client.createdAt?.toLocaleDateString('fr-CA')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {client.subscription.plan} - {client.subscription.price}$/mois
                      </div>
                      <div className="text-xs text-gray-500">
                        Cloud: {client.cloudUsed}/{client.cloudQuota} Go
                      </div>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <Badge className={getStatusColor(client.status)}>
                        {client.status}
                      </Badge>
                      <Badge className={getPriorityColor(client.priority)}>
                        {client.priority}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedClient(client);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Modifier le client</DialogTitle>
              <DialogDescription>
                Modifiez les informations du client
              </DialogDescription>
            </DialogHeader>
            {selectedClient && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editFirstName">Prénom</Label>
                  <Input
                    id="editFirstName"
                    value={selectedClient.firstName}
                    onChange={(e) => setSelectedClient({...selectedClient, firstName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="editLastName">Nom</Label>
                  <Input
                    id="editLastName"
                    value={selectedClient.lastName}
                    onChange={(e) => setSelectedClient({...selectedClient, lastName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="editStatus">Statut</Label>
                  <Select 
                    value={selectedClient.status} 
                    onValueChange={(value: any) => 
                      setSelectedClient({...selectedClient, status: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="suspended">Suspendu</SelectItem>
                      <SelectItem value="cancelled">Annulé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editPriority">Priorité</Label>
                  <Select 
                    value={selectedClient.priority} 
                    onValueChange={(value: any) => 
                      setSelectedClient({...selectedClient, priority: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Basse</SelectItem>
                      <SelectItem value="normal">Normale</SelectItem>
                      <SelectItem value="high">Haute</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editPlan">Forfait</Label>
                  <Select 
                    value={selectedClient.subscription.plan} 
                    onValueChange={(value: any) => 
                      setSelectedClient({
                        ...selectedClient, 
                        subscription: {
                          ...selectedClient.subscription,
                          plan: value,
                          price: value === 'base' ? 25 : value === 'standard' ? 45 : value === 'plus' ? 75 : 120
                        }
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="base">Base - 25$/mois</SelectItem>
                      <SelectItem value="standard">Standard - 45$/mois</SelectItem>
                      <SelectItem value="plus">Plus - 75$/mois</SelectItem>
                      <SelectItem value="prestige">Prestige - 120$/mois</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editCloudQuota">Quota cloud (Go)</Label>
                  <Input
                    id="editCloudQuota"
                    type="number"
                    value={selectedClient.cloudQuota}
                    onChange={(e) => setSelectedClient({...selectedClient, cloudQuota: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="editInternalNotes">Notes internes</Label>
                  <Textarea
                    id="editInternalNotes"
                    value={selectedClient.internalNotes || ''}
                    onChange={(e) => setSelectedClient({...selectedClient, internalNotes: e.target.value})}
                  />
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleUpdateClient}>
                Sauvegarder
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}