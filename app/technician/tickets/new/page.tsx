'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createTicket } from '@/lib/services/tickets';
import { getAllClients } from '@/lib/services/clients';
import { Client } from '@/lib/types';
import TechnicianLayout from '@/app/technician/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FileText, 
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Wrench,
  Phone,
  User,
  MapPin,
  Clock,
  Camera,
  Navigation
} from 'lucide-react';
import Link from 'next/link';

export default function NewTechTicketPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [currentLocation, setCurrentLocation] = useState<string>('');

  const [ticketData, setTicketData] = useState({
    clientId: '',
    title: '',
    description: '',
    type: 'intervention' as const,
    priority: 'normal' as const,
    location: '',
    estimatedDuration: 60,
    internalNotes: '',
    equipmentInfo: '',
    issueObserved: '',
    immediateAction: false,
    onSiteCreation: true,
    clientPresent: true,
    accessGranted: true,
  });

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { clients } = await getAllClients();
        setClients(clients);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };

    fetchClients();
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        },
        (error) => {
          console.log('Géolocalisation non disponible');
        }
      );
    }
  };

  const handleClientChange = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setTicketData(prev => ({
        ...prev,
        clientId,
        location: client.address && client.city ? `${client.address}, ${client.city}` : '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!ticketData.clientId) {
      setError('Veuillez sélectionner un client');
      setLoading(false);
      return;
    }

    const timestamp = new Date().toLocaleString('fr-CA');
    const fullDescription = `
[TICKET CRÉÉ SUR SITE - ${timestamp}]

${ticketData.description}

--- Observations terrain ---
${ticketData.issueObserved ? `Problème observé: ${ticketData.issueObserved}` : ''}
${ticketData.equipmentInfo ? `Équipement: ${ticketData.equipmentInfo}` : ''}
Client présent: ${ticketData.clientPresent ? 'Oui' : 'Non'}
Accès accordé: ${ticketData.accessGranted ? 'Oui' : 'Non'}
${currentLocation ? `Position technicien: ${currentLocation}` : ''}
${ticketData.immediateAction ? 'ACTION IMMÉDIATE REQUISE' : ''}
    `.trim();

    const newTicket = {
      clientId: ticketData.clientId,
      title: ticketData.title,
      description: fullDescription,
      type: ticketData.type,
      priority: ticketData.immediateAction ? 'urgent' as const : ticketData.priority as any,
      status: 'open' as const,
      location: ticketData.location || undefined,
      estimatedDuration: ticketData.estimatedDuration,
      assignedTo: 'dev@kastor.ca', // Auto-assigné au technicien créateur
      internalNotes: ticketData.internalNotes || undefined,
    };

    const { id, error: createError } = await createTicket(newTicket);
    
    if (createError) {
      setError(createError);
      setLoading(false);
      return;
    }

    if (id) {
      setSuccess(true);
      setTimeout(() => {
        router.push('/technician');
      }, 2000);
    }
  };

  if (success) {
    return (
      <TechnicianLayout>
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Ticket créé avec succès !
                </h3>
                <p className="text-sm text-gray-600">
                  Le ticket a été créé et vous êtes automatiquement assigné.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </TechnicianLayout>
    );
  }

  return (
    <TechnicianLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href="/technician">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nouveau ticket terrain</h1>
            <p className="text-gray-600">Créer un ticket directement sur site</p>
          </div>
        </div>

        {/* Location Info */}
        {currentLocation && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-blue-800">
                  Position actuelle enregistrée: {currentLocation}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="flex items-center p-4 text-sm text-red-800 bg-red-50 rounded-lg">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}

          {/* Client Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Client sur site
              </CardTitle>
              <CardDescription>
                Identifiez le client pour lequel vous intervenez
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="clientId">Client *</Label>
                <Select value={ticketData.clientId} onValueChange={handleClientChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Rechercher et sélectionner le client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        <div className="flex flex-col">
                          <span>{client.firstName} {client.lastName}</span>
                          <span className="text-xs text-gray-500">
                            {client.email} • {client.phone}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {ticketData.clientId && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  {(() => {
                    const client = clients.find(c => c.id === ticketData.clientId);
                    return client ? (
                      <div className="text-sm">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p><strong>Client :</strong> {client.firstName} {client.lastName}</p>
                            <p><strong>Téléphone :</strong> {client.phone || 'Non renseigné'}</p>
                          </div>
                          <div>
                            <p><strong>Forfait :</strong> {client.subscription.plan}</p>
                            <p><strong>Priorité :</strong> {client.priority}</p>
                          </div>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="clientPresent"
                    checked={ticketData.clientPresent}
                    onCheckedChange={(checked) => 
                      setTicketData({...ticketData, clientPresent: checked as boolean})
                    }
                  />
                  <Label htmlFor="clientPresent">Client présent sur site</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="accessGranted"
                    checked={ticketData.accessGranted}
                    onCheckedChange={(checked) => 
                      setTicketData({...ticketData, accessGranted: checked as boolean})
                    }
                  />
                  <Label htmlFor="accessGranted">Accès autorisé</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Problème observé */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wrench className="h-5 w-5 mr-2" />
                Problème observé
              </CardTitle>
              <CardDescription>
                Décrivez ce que vous observez sur site
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Titre du problème *</Label>
                <Input
                  id="title"
                  value={ticketData.title}
                  onChange={(e) => setTicketData({...ticketData, title: e.target.value})}
                  placeholder="Ex: Ordinateur ne démarre plus"
                  required
                />
              </div>

              <div>
                <Label htmlFor="issueObserved">Observation initiale *</Label>
                <Textarea
                  id="issueObserved"
                  value={ticketData.issueObserved}
                  onChange={(e) => setTicketData({...ticketData, issueObserved: e.target.value})}
                  placeholder="Décrivez ce que vous observez: symptômes, erreurs, comportement anormal..."
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description détaillée</Label>
                <Textarea
                  id="description"
                  value={ticketData.description}
                  onChange={(e) => setTicketData({...ticketData, description: e.target.value})}
                  placeholder="Contexte, historique du problème selon le client..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="equipmentInfo">Équipement concerné</Label>
                  <Input
                    id="equipmentInfo"
                    value={ticketData.equipmentInfo}
                    onChange={(e) => setTicketData({...ticketData, equipmentInfo: e.target.value})}
                    placeholder="Marque, modèle, numéro de série..."
                  />
                </div>

                <div>
                  <Label htmlFor="estimatedDuration">Durée estimée (min)</Label>
                  <Select value={ticketData.estimatedDuration.toString()} onValueChange={(value) => 
                    setTicketData({...ticketData, estimatedDuration: parseInt(value)})
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 heure</SelectItem>
                      <SelectItem value="90">1h30</SelectItem>
                      <SelectItem value="120">2 heures</SelectItem>
                      <SelectItem value="180">3 heures</SelectItem>
                      <SelectItem value="240">4 heures</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="priority">Priorité</Label>
                <Select value={ticketData.priority} onValueChange={(value: any) => 
                  setTicketData({...ticketData, priority: value})
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Basse - Peut attendre</SelectItem>
                    <SelectItem value="normal">Normale - Traitement standard</SelectItem>
                    <SelectItem value="high">Haute - Prioritaire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Localisation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Localisation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="location">Adresse d'intervention</Label>
                <Input
                  id="location"
                  value={ticketData.location}
                  onChange={(e) => setTicketData({...ticketData, location: e.target.value})}
                  placeholder="Adresse précise ou instructions de localisation"
                />
              </div>
            </CardContent>
          </Card>

          {/* Notes techniques */}
          <Card>
            <CardHeader>
              <CardTitle>Notes techniques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="internalNotes">Notes internes</Label>
                <Textarea
                  id="internalNotes"
                  value={ticketData.internalNotes}
                  onChange={(e) => setTicketData({...ticketData, internalNotes: e.target.value})}
                  placeholder="Notes pour l'équipe, observations techniques..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="immediateAction"
                  checked={ticketData.immediateAction}
                  onCheckedChange={(checked) => 
                    setTicketData({...ticketData, immediateAction: checked as boolean})
                  }
                />
                <Label htmlFor="immediateAction">
                  Action immédiate requise (priorité urgente)
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Actions rapides */}
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button type="button" variant="outline" size="sm" className="h-16 flex flex-col">
                  <Camera className="h-5 w-5 mb-1" />
                  <span className="text-xs">Photo problème</span>
                </Button>
                <Button type="button" variant="outline" size="sm" className="h-16 flex flex-col">
                  <Phone className="h-5 w-5 mb-1" />
                  <span className="text-xs">Appeler client</span>
                </Button>
                <Button type="button" variant="outline" size="sm" className="h-16 flex flex-col">
                  <Navigation className="h-5 w-5 mb-1" />
                  <span className="text-xs">Navigation</span>
                </Button>
                <Button type="button" variant="outline" size="sm" className="h-16 flex flex-col">
                  <Clock className="h-5 w-5 mb-1" />
                  <span className="text-xs">Démarrer chrono</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Link href="/technician">
              <Button variant="outline">Annuler</Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Création...
                </>
              ) : (
                'Créer le ticket'
              )}
            </Button>
          </div>
        </form>
      </div>
    </TechnicianLayout>
  );
}