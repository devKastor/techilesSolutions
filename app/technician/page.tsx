'use client';

import { useEffect, useState } from 'react';
import { technicianService } from '@/lib/services/technician';
import { getAllClients } from '@/lib/services/clients';
import { ServiceTicket, Client } from '@/lib/types';
import TechnicianLayout from '@/app/technician/layout';
import InterventionCard from '@/components/technician/InterventionCard';
import InterventionDetails from '@/components/technician/InterventionDetails';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  FileText, 
  Search,
  Wrench,
  MapPin,
  AlertTriangle,
  Wifi,
  WifiOff,
  Plus
} from 'lucide-react';

export default function TechnicianInterventions() {
  const [tickets, setTickets] = useState<ServiceTicket[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<ServiceTicket | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  useEffect(() => {
    loadData();
    
    // Monitor online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-hide notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ticketsData, clientsResult] = await Promise.all([
        technicianService.getAssignedTickets(),
        getAllClients()
      ]);
      
      setTickets(ticketsData);
      if (!clientsResult.error) {
        setClients(clientsResult.clients);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setNotification({
        type: 'error',
        message: 'Erreur lors du chargement des données'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartIntervention = async (ticket: ServiceTicket) => {
    try {
      await technicianService.startIntervention(ticket.id);
      setActiveTimer(ticket.id);
      
      // Update local state
      setTickets(prev => prev.map(t => 
        t.id === ticket.id 
          ? { ...t, status: 'in_progress' }
          : t
      ));
      
      setNotification({
        type: 'success',
        message: `Intervention démarrée pour "${ticket.title}"`
      });
    } catch (error) {
      console.error('Error starting intervention:', error);
      setNotification({
        type: 'error',
        message: 'Erreur lors du démarrage de l\'intervention'
      });
    }
  };

  const handleCompleteIntervention = async (ticketId: string, notes: string, timeSpent: number) => {
    try {
      await technicianService.completeIntervention(ticketId, notes, timeSpent);
      
      // Update local state
      setTickets(prev => prev.map(t => 
        t.id === ticketId 
          ? { 
              ...t, 
              status: 'resolved',
              resolvedAt: new Date(),
              completionNotes: notes,
              actualDuration: timeSpent
            }
          : t
      ));
      
      setActiveTimer(null);
      setNotification({
        type: 'success',
        message: 'Intervention complétée avec succès'
      });
    } catch (error) {
      console.error('Error completing intervention:', error);
      setNotification({
        type: 'error',
        message: 'Erreur lors de la finalisation'
      });
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const client = clients.find(c => c.id === ticket.clientId);
    const clientName = client ? `${client.firstName} ${client.lastName}` : '';
    
    return ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
           clientName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const todayTickets = filteredTickets.filter(ticket => {
    if (!ticket.scheduledDate) return false;
    const today = new Date();
    const ticketDate = new Date(ticket.scheduledDate);
    return ticketDate.toDateString() === today.toDateString();
  });

  const activeTickets = filteredTickets.filter(t => 
    t.status !== 'resolved' && t.status !== 'closed'
  );

  const completedTickets = filteredTickets.filter(t => 
    t.status === 'resolved' || t.status === 'closed'
  );

  if (loading) {
    return (
      <TechnicianLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </TechnicianLayout>
    );
  }

  return (
    <TechnicianLayout>
      <div className="space-y-8">
        {/* Notifications */}
        {notification && (
          <Alert className={`${notification.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            {notification.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <AlertDescription className={notification.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {notification.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Offline Warning */}
        {!isOnline && (
          <Alert className="border-amber-200 bg-amber-50">
            <WifiOff className="h-4 w-4" />
            <AlertDescription className="text-amber-800">
              Mode hors ligne - Les modifications seront synchronisées lorsque la connexion sera rétablie
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Interventions</h1>
            <p className="text-gray-600">
              {new Date().toLocaleDateString('fr-CA', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Link href="/technician/tickets/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau ticket
              </Button>
            </Link>
            {isOnline ? (
              <div className="flex items-center text-green-600">
                <Wifi className="h-4 w-4 mr-1" />
                <span className="text-sm">En ligne</span>
              </div>
            ) : (
              <div className="flex items-center text-amber-600">
                <WifiOff className="h-4 w-4 mr-1" />
                <span className="text-sm">Hors ligne</span>
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher une intervention..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aujourd'hui</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayTickets.length}</div>
              <p className="text-xs text-muted-foreground">Interventions programmées</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En cours</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activeTickets.filter(t => t.status === 'in_progress').length}
              </div>
              <p className="text-xs text-muted-foreground">Interventions actives</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Terminées</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedTickets.length}</div>
              <p className="text-xs text-muted-foreground">Cette semaine</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tickets.length}</div>
              <p className="text-xs text-muted-foreground">Toutes les interventions</p>
            </CardContent>
          </Card>
        </div>

        {/* Interventions Tabs */}
        <Tabs defaultValue="today" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="today">
              Aujourd'hui ({todayTickets.length})
            </TabsTrigger>
            <TabsTrigger value="active">
              Actives ({activeTickets.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Terminées ({completedTickets.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-4">
            {todayTickets.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Aucune intervention aujourd'hui
                    </h3>
                    <p className="text-gray-600">
                      Profitez de cette journée pour la maintenance préventive ou la formation.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              todayTickets.map((ticket) => (
                <InterventionCard
                  key={ticket.id}
                  ticket={ticket}
                  client={clients.find(c => c.id === ticket.clientId)}
                  onStartIntervention={handleStartIntervention}
                  onOpenDetails={(ticket) => {
                    setSelectedTicket(ticket);
                    setShowDetails(true);
                  }}
                  isTimerActive={activeTimer === ticket.id}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {activeTickets.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Aucune intervention active
                    </h3>
                    <p className="text-gray-600">
                      Toutes les interventions sont terminées ou programmées.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              activeTickets.map((ticket) => (
                <InterventionCard
                  key={ticket.id}
                  ticket={ticket}
                  client={clients.find(c => c.id === ticket.clientId)}
                  onStartIntervention={handleStartIntervention}
                  onOpenDetails={(ticket) => {
                    setSelectedTicket(ticket);
                    setShowDetails(true);
                  }}
                  isTimerActive={activeTimer === ticket.id}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedTickets.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Aucune intervention terminée
                    </h3>
                    <p className="text-gray-600">
                      Les interventions complétées apparaîtront ici.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              completedTickets.map((ticket) => (
                <InterventionCard
                  key={ticket.id}
                  ticket={ticket}
                  client={clients.find(c => c.id === ticket.clientId)}
                  onStartIntervention={handleStartIntervention}
                  onOpenDetails={(ticket) => {
                    setSelectedTicket(ticket);
                    setShowDetails(true);
                  }}
                  isTimerActive={false}
                />
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex flex-col">
                <MapPin className="h-6 w-6 mb-2" />
                Ma position
              </Button>
              <Button variant="outline" className="h-20 flex flex-col">
                <FileText className="h-6 w-6 mb-2" />
                Nouveau rapport
              </Button>
              <Button variant="outline" className="h-20 flex flex-col">
                <Clock className="h-6 w-6 mb-2" />
                Temps de trajet
              </Button>
              <Button variant="outline" className="h-20 flex flex-col">
                <AlertTriangle className="h-6 w-6 mb-2" />
                Support urgence
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Intervention Details Modal */}
      {showDetails && selectedTicket && (
        <InterventionDetails
          ticket={selectedTicket}
          client={clients.find(c => c.id === selectedTicket.clientId)}
          onClose={() => {
            setShowDetails(false);
            setSelectedTicket(null);
          }}
          onComplete={handleCompleteIntervention}
        />
      )}
    </TechnicianLayout>
  );
}