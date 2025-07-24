'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createTicket } from '@/lib/services/tickets';
import { getClientByEmail } from '@/lib/services/clients';
import { auth } from '@/lib/firebase';
import ClientLayout from '@/components/layout/ClientLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { TicketPriority } from '@/lib/types';

import { 
  FileText, 
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Wrench,
  Phone,
  DollarSign,
  HelpCircle
} from 'lucide-react';
import Link from 'next/link';

export default function NewTicketPage() {
  const router = useRouter();
  const [clientId, setClientId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

const [ticketData, setTicketData] = useState<{
  title: string;
  description: string;
  type: 'support' | 'intervention' | 'billing' | 'general';
  priority: TicketPriority;
  location: string;
  preferredDate: string;
  preferredTime: string;
  urgentRequest: boolean;
  remoteAccessAllowed: boolean;
  equipmentInfo: string;
  previousIssues: string;
  contactPreference: 'email' | 'phone' | 'both';
}>({
  title: '',
  description: '',
  type: 'support',
  priority: 'normal',
  location: '',
  preferredDate: '',
  preferredTime: '',
  urgentRequest: false,
  remoteAccessAllowed: false,
  equipmentInfo: '',
  previousIssues: '',
  contactPreference: 'email',
});


  useEffect(() => {
    const fetchClientData = async () => {
      if (!auth.currentUser?.email) return;

      try {
        const { client } = await getClientByEmail(auth.currentUser.email);
        if (client) {
          setClientId(client.id);
          // Pré-remplir l'adresse si disponible
          if (client.address && client.city) {
            setTicketData(prev => ({
              ...prev,
              location: `${client.address}, ${client.city}`
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching client data:', error);
      }
    };

    fetchClientData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!clientId) {
      setError('Erreur: Client non identifié');
      setLoading(false);
      return;
    }

    // Construire la date programmée si fournie
    let scheduledDate: Date | undefined;
    if (ticketData.preferredDate && ticketData.preferredTime) {
      scheduledDate = new Date(`${ticketData.preferredDate}T${ticketData.preferredTime}`);
    }

    // Déterminer la priorité automatiquement
    let priority = ticketData.priority;
    if (ticketData.urgentRequest) {
      priority = 'urgent';
    }

    const fullDescription = `
${ticketData.description}

--- Informations supplémentaires ---
${ticketData.equipmentInfo ? `Équipement concerné: ${ticketData.equipmentInfo}` : ''}
${ticketData.previousIssues ? `Problèmes précédents: ${ticketData.previousIssues}` : ''}
${ticketData.remoteAccessAllowed ? 'Accès à distance autorisé: Oui' : 'Accès à distance autorisé: Non'}
Préférence de contact: ${ticketData.contactPreference}
${scheduledDate ? `Date souhaitée: ${scheduledDate.toLocaleString('fr-CA')}` : ''}
    `.trim();

    const newTicket = {
      clientId,
      title: ticketData.title,
      description: fullDescription,
      type: ticketData.type,
      priority: priority as any,
      status: 'open' as const,
      location: ticketData.location || undefined,
      scheduledDate,
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
        router.push('/client/tickets');
      }, 2000);
    }
  };

  if (success) {
    return (
      <ClientLayout>
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Ticket créé avec succès !
                </h3>
                <p className="text-sm text-gray-600">
                  Votre demande a été enregistrée. Nous vous contacterons bientôt.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href="/client/tickets">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nouveau ticket de support</h1>
            <p className="text-gray-600">Décrivez votre problème ou demande</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="flex items-center p-4 text-sm text-red-800 bg-red-50 rounded-lg">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}

          {/* Type de demande */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Type de demande
              </CardTitle>
              <CardDescription>
                Sélectionnez le type de service dont vous avez besoin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    ticketData.type === 'intervention' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setTicketData({...ticketData, type: 'intervention'})}
                >
                  <div className="flex items-center space-x-3">
                    <Wrench className="h-6 w-6 text-blue-600" />
                    <div>
                      <h3 className="font-medium">Intervention sur site</h3>
                      <p className="text-sm text-gray-600">Réparation, installation, maintenance</p>
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    ticketData.type === 'support' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setTicketData({...ticketData, type: 'support'})}
                >
                  <div className="flex items-center space-x-3">
                    <Phone className="h-6 w-6 text-green-600" />
                    <div>
                      <h3 className="font-medium">Support technique</h3>
                      <p className="text-sm text-gray-600">Assistance à distance, conseils</p>
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    ticketData.type === 'billing' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setTicketData({...ticketData, type: 'billing'})}
                >
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-6 w-6 text-purple-600" />
                    <div>
                      <h3 className="font-medium">Question de facturation</h3>
                      <p className="text-sm text-gray-600">Factures, paiements, abonnements</p>
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    ticketData.type === 'general' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setTicketData({...ticketData, type: 'general'})}
                >
                  <div className="flex items-center space-x-3">
                    <HelpCircle className="h-6 w-6 text-orange-600" />
                    <div>
                      <h3 className="font-medium">Demande générale</h3>
                      <p className="text-sm text-gray-600">Information, devis, autre</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Détails de la demande */}
          <Card>
            <CardHeader>
              <CardTitle>Détails de votre demande</CardTitle>
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
                <Label htmlFor="description">Description détaillée *</Label>
                <Textarea
                  id="description"
                  value={ticketData.description}
                  onChange={(e) => setTicketData({...ticketData, description: e.target.value})}
                  placeholder="Décrivez votre problème en détail: quand cela a-t-il commencé, que s'est-il passé, avez-vous essayé quelque chose..."
                  rows={5}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priorité</Label>
                  <Select value={ticketData.priority} onValueChange={(value: any) => 
                    setTicketData({...ticketData, priority: value})
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Basse - Pas urgent</SelectItem>
                      <SelectItem value="normal">Normale - Dans les prochains jours</SelectItem>
                      <SelectItem value="high">Haute - Rapidement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="contactPreference">Préférence de contact</Label>
                  <Select value={ticketData.contactPreference} onValueChange={(value: any) => 
                    setTicketData({...ticketData, contactPreference: value})
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Téléphone</SelectItem>
                      <SelectItem value="both">Email et téléphone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations spécifiques selon le type */}
          {ticketData.type === 'intervention' && (
            <Card>
              <CardHeader>
                <CardTitle>Informations pour l'intervention</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="location">Lieu d'intervention</Label>
                  <Input
                    id="location"
                    value={ticketData.location}
                    onChange={(e) => setTicketData({...ticketData, location: e.target.value})}
                    placeholder="Adresse complète ou instructions spécifiques"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="preferredDate">Date souhaitée</Label>
                    <Input
                      id="preferredDate"
                      type="date"
                      value={ticketData.preferredDate}
                      onChange={(e) => setTicketData({...ticketData, preferredDate: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <Label htmlFor="preferredTime">Heure souhaitée</Label>
                    <Input
                      id="preferredTime"
                      type="time"
                      value={ticketData.preferredTime}
                      onChange={(e) => setTicketData({...ticketData, preferredTime: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Informations techniques */}
          <Card>
            <CardHeader>
              <CardTitle>Informations techniques (optionnel)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="equipmentInfo">Équipement concerné</Label>
                <Input
                  id="equipmentInfo"
                  value={ticketData.equipmentInfo}
                  onChange={(e) => setTicketData({...ticketData, equipmentInfo: e.target.value})}
                  placeholder="Ex: Dell Inspiron 15, iPhone 12, Imprimante HP..."
                />
              </div>

              <div>
                <Label htmlFor="previousIssues">Problèmes similaires précédents</Label>
                <Textarea
                  id="previousIssues"
                  value={ticketData.previousIssues}
                  onChange={(e) => setTicketData({...ticketData, previousIssues: e.target.value})}
                  placeholder="Avez-vous déjà eu ce problème ? Qu'avait-on fait pour le résoudre ?"
                  rows={3}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remoteAccess"
                    checked={ticketData.remoteAccessAllowed}
                    onCheckedChange={(checked) => 
                      setTicketData({...ticketData, remoteAccessAllowed: checked as boolean})
                    }
                  />
                  <Label htmlFor="remoteAccess">
                    J'autorise l'accès à distance à mon ordinateur si nécessaire
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="urgent"
                    checked={ticketData.urgentRequest}
                    onCheckedChange={(checked) => 
                      setTicketData({...ticketData, urgentRequest: checked as boolean})
                    }
                  />
                  <Label htmlFor="urgent">
                    Demande urgente (intervention dans les 24h si possible)
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Link href="/client/tickets">
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
    </ClientLayout>
  );
}