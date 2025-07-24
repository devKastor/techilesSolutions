'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getAllClients } from '@/lib/services/clients';
import { createTicket } from '@/lib/services/tickets';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Phone, 
  Plus, 
  Search, 
  Clock,
  CheckCircle,
  User,
  Calendar,
  FileText,
  PhoneCall,
  Mail,
  MessageSquare
} from 'lucide-react';

interface ServiceCall {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  callType: 'incoming' | 'outgoing';
  subject: string;
  description: string;
  status: 'new' | 'in_progress' | 'resolved' | 'requires_ticket';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  duration: number; // in minutes
  resolution?: string;
  followUpRequired: boolean;
  ticketCreated?: string; // ticket ID if created
  createdAt: Date;
  resolvedAt?: Date;
  handledBy: string;
}

export default function AdminCallsPage() {
  const [calls, setCalls] = useState<ServiceCall[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const [newCall, setNewCall] = useState({
    clientId: '',
    callType: 'incoming' as const,
    subject: '',
    description: '',
    priority: 'normal' as const,
    duration: 5,
    followUpRequired: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch clients
        const { clients } = await getAllClients();
        setClients(clients);

        // Fetch calls (simulation - en production utiliser Firestore)
        const mockCalls: ServiceCall[] = [
          {
            id: '1',
            clientId: clients[0]?.id || 'client1',
            clientName: clients[0] ? `${clients[0].firstName} ${clients[0].lastName}` : 'Client Test',
            clientPhone: clients[0]?.phone || '(418) 555-0123',
            clientEmail: clients[0]?.email || 'client@test.com',
            callType: 'incoming',
            subject: 'Problème connexion internet',
            description: 'Client signale des coupures internet fréquentes depuis ce matin',
            status: 'requires_ticket',
            priority: 'high',
            duration: 8,
            followUpRequired: true,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            handledBy: 'dev@kastor.ca'
          },
          {
            id: '2',
            clientId: clients[1]?.id || 'client2',
            clientName: clients[1] ? `${clients[1].firstName} ${clients[1].lastName}` : 'Client Test 2',
            clientPhone: clients[1]?.phone || '(418) 555-0124',
            clientEmail: clients[1]?.email || 'client2@test.com',
            callType: 'outgoing',
            subject: 'Suivi intervention',
            description: 'Appel de suivi post-intervention pour vérifier bon fonctionnement',
            status: 'resolved',
            priority: 'normal',
            duration: 5,
            resolution: 'Client confirme que tout fonctionne correctement',
            followUpRequired: false,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
            resolvedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
            handledBy: 'dev@kastor.ca'
          }
        ];
        setCalls(mockCalls);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateCall = async () => {
    const client = clients.find(c => c.id === newCall.clientId);
    if (!client) return;

    const callData: Omit<ServiceCall, 'id'> = {
      ...newCall,
      clientName: `${client.firstName} ${client.lastName}`,
      clientPhone: client.phone || '',
      clientEmail: client.email,
      status: 'new',
      createdAt: new Date(),
      handledBy: 'dev@kastor.ca'
    };

    // En production, sauvegarder dans Firestore
    const newCallWithId = {
      id: Date.now().toString(),
      ...callData
    };

    setCalls(prev => [newCallWithId, ...prev]);
    setIsCreateDialogOpen(false);
    setNewCall({
      clientId: '',
      callType: 'incoming',
      subject: '',
      description: '',
      priority: 'normal',
      duration: 5,
      followUpRequired: false,
    });
  };

  const handleCreateTicketFromCall = async (call: ServiceCall) => {
    try {
      const ticketData = {
        clientId: call.clientId,
        title: `Appel: ${call.subject}`,
        description: `Ticket créé suite à appel téléphonique du ${call.createdAt.toLocaleString('fr-CA')}

Durée appel: ${call.duration} minutes
Description: ${call.description}

--- Informations appel ---
Type: ${call.callType === 'incoming' ? 'Appel entrant' : 'Appel sortant'}
Priorité: ${call.priority}
Suivi requis: ${call.followUpRequired ? 'Oui' : 'Non'}`,
        type: 'support' as const,
        priority: call.priority as any,
        status: 'open' as const,
      };

      const { id, error } = await createTicket(ticketData);
      
      if (!error && id) {
        // Mettre à jour l'appel
        setCalls(prev => prev.map(c => 
          c.id === call.id 
            ? { ...c, status: 'resolved', ticketCreated: id, resolvedAt: new Date() }
            : c
        ));
      }
    } catch (error) {
      console.error('Error creating ticket from call:', error);
    }
  };

  const handleResolveCall = async (callId: string, resolution: string) => {
    setCalls(prev => prev.map(call => 
      call.id === callId 
        ? { ...call, status: 'resolved', resolution, resolvedAt: new Date() }
        : call
    ));
  };

  const filteredCalls = calls.filter(call => {
    const matchesSearch = call.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         call.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         call.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || call.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'requires_ticket':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
      case 'requires_ticket':
        return <FileText className="h-4 w-4" />;
      case 'in_progress':
        return <Clock className="h-4 w-4" />;
      default:
        return <Phone className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
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
            <h1 className="text-3xl font-bold text-gray-900">Appels de service</h1>
            <p className="text-gray-600">Gestion des appels téléphoniques et demandes</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouvel appel
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Enregistrer un appel de service</DialogTitle>
                <DialogDescription>
                  Documentez un appel téléphonique reçu ou effectué
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="clientId">Client</Label>
                  <Select value={newCall.clientId} onValueChange={(value) => 
                    setNewCall({...newCall, clientId: value})
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.firstName} {client.lastName} - {client.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="callType">Type d'appel</Label>
                    <Select value={newCall.callType} onValueChange={(value: any) => 
                      setNewCall({...newCall, callType: value})
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="incoming">Appel entrant</SelectItem>
                        <SelectItem value="outgoing">Appel sortant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="duration">Durée (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={newCall.duration}
                      onChange={(e) => setNewCall({...newCall, duration: parseInt(e.target.value) || 5})}
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject">Sujet de l'appel</Label>
                  <Input
                    id="subject"
                    value={newCall.subject}
                    onChange={(e) => setNewCall({...newCall, subject: e.target.value})}
                    placeholder="Résumé du motif d'appel"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newCall.description}
                    onChange={(e) => setNewCall({...newCall, description: e.target.value})}
                    placeholder="Détails de la conversation, problème signalé..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="priority">Priorité</Label>
                  <Select value={newCall.priority} onValueChange={(value: any) => 
                    setNewCall({...newCall, priority: value})
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Basse</SelectItem>
                      <SelectItem value="normal">Normale</SelectItem>
                      <SelectItem value="high">Haute</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="followUp"
                    checked={newCall.followUpRequired}
                    onCheckedChange={(checked) => 
                      setNewCall({...newCall, followUpRequired: checked as boolean})
                    }
                  />
                  <Label htmlFor="followUp">Suivi requis</Label>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateCall}>
                  Enregistrer l'appel
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center space-x-2 flex-1">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher un appel..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="new">Nouveaux</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="requires_ticket">Ticket requis</SelectItem>
                  <SelectItem value="resolved">Résolus</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total appels</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{calls.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En attente</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {calls.filter(c => c.status === 'new' || c.status === 'in_progress').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tickets requis</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {calls.filter(c => c.status === 'requires_ticket').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Temps total</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {calls.reduce((sum, call) => sum + call.duration, 0)} min
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calls List */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des appels</CardTitle>
            <CardDescription>
              {filteredCalls.length} appel{filteredCalls.length > 1 ? 's' : ''} trouvé{filteredCalls.length > 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredCalls.length === 0 ? (
                <div className="text-center py-8">
                  <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun appel trouvé</h3>
                  <p className="text-gray-600">
                    {searchTerm || statusFilter !== 'all' ? 'Aucun appel ne correspond à vos critères.' : 'Aucun appel enregistré pour le moment.'}
                  </p>
                </div>
              ) : (
                filteredCalls.map((call) => (
                  <div key={call.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-start space-x-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {call.callType === 'incoming' ? (
                              <PhoneCall className="h-4 w-4 text-green-600" />
                            ) : (
                              <Phone className="h-4 w-4 text-blue-600" />
                            )}
                            <h3 className="font-semibold">{call.subject}</h3>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{call.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              {call.clientName}
                            </span>
                            <span className="flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {call.clientPhone}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {call.createdAt.toLocaleString('fr-CA')}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {call.duration} min
                            </span>
                          </div>
                          {call.resolution && (
                            <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-700">
                              <strong>Résolution:</strong> {call.resolution}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col space-y-1">
                        <Badge className={`${getStatusColor(call.status)} flex items-center`}>
                          {getStatusIcon(call.status)}
                          <span className="ml-1">
                            {call.status === 'new' ? 'Nouveau' :
                             call.status === 'in_progress' ? 'En cours' :
                             call.status === 'resolved' ? 'Résolu' :
                             call.status === 'requires_ticket' ? 'Ticket requis' : call.status}
                          </span>
                        </Badge>
                        <Badge className={getPriorityColor(call.priority)}>
                          {call.priority}
                        </Badge>
                      </div>
                      <div className="flex space-x-1">
                        {call.status === 'requires_ticket' && !call.ticketCreated && (
                          <Button
                            size="sm"
                            onClick={() => handleCreateTicketFromCall(call)}
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            Créer ticket
                          </Button>
                        )}
                        {call.status !== 'resolved' && call.status !== 'requires_ticket' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const resolution = prompt('Résolution de l\'appel:');
                              if (resolution) {
                                handleResolveCall(call.id, resolution);
                              }
                            }}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Résoudre
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Phone className="h-3 w-3 mr-1" />
                          Rappeler
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}