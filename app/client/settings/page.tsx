'use client';

import { useEffect, useState } from 'react';
import { getClientByEmail, updateClient } from '@/lib/services/clients';
import { auth } from '@/lib/firebase';
import { Client } from '@/lib/types';
import ClientLayout from '@/components/layout/ClientLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Phone,
  MapPin,
  CreditCard,
  Save,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export default function ClientSettingsPage() {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const fetchClientData = async () => {
      if (!auth.currentUser?.email) return;

      try {
        const { client } = await getClientByEmail(auth.currentUser.email);
        if (client) {
          setClient(client);
        }
      } catch (error) {
        console.error('Error fetching client data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, []);

  const handleSave = async () => {
    if (!client) return;

    setSaving(true);
    setMessage(null);

    const { error } = await updateClient(client.id, {
      firstName: client.firstName,
      lastName: client.lastName,
      phone: client.phone,
      address: client.address,
      city: client.city,
      province: client.province,
      postalCode: client.postalCode,
    });

    if (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde: ' + error });
    } else {
      setMessage({ type: 'success', text: 'Informations mises à jour avec succès!' });
    }

    setSaving(false);
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

  return (
    <ClientLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Paramètres du compte</h1>
          <p className="text-gray-600">Gérez vos informations personnelles et votre abonnement</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`flex items-center p-4 rounded-lg ${
            message.type === 'success' 
              ? 'text-green-800 bg-green-50' 
              : 'text-red-800 bg-red-50'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4 mr-2" />
            ) : (
              <AlertCircle className="h-4 w-4 mr-2" />
            )}
            {message.text}
          </div>
        )}

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Informations personnelles
            </CardTitle>
            <CardDescription>
              Mettez à jour vos informations de contact
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  value={client.firstName}
                  onChange={(e) => setClient({...client, firstName: e.target.value})}
                  placeholder="Votre prénom"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  value={client.lastName}
                  onChange={(e) => setClient({...client, lastName: e.target.value})}
                  placeholder="Votre nom"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Adresse courriel</Label>
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                <Input
                  id="email"
                  value={client.email}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                L'adresse courriel ne peut pas être modifiée
              </p>
            </div>

            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-gray-400 mr-2" />
                <Input
                  id="phone"
                  value={client.phone || ''}
                  onChange={(e) => setClient({...client, phone: e.target.value})}
                  placeholder="(418) 123-4567"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Adresse
            </CardTitle>
            <CardDescription>
              Votre adresse pour les interventions sur site
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={client.address || ''}
                onChange={(e) => setClient({...client, address: e.target.value})}
                placeholder="123 Rue Principale"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  value={client.city}
                  onChange={(e) => setClient({...client, city: e.target.value})}
                  placeholder="Cap-aux-Meules"
                />
              </div>
              <div>
                <Label htmlFor="province">Province</Label>
                <Select value={client.province} onValueChange={(value) => 
                  setClient({...client, province: value})
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="QC">Québec</SelectItem>
                    <SelectItem value="ON">Ontario</SelectItem>
                    <SelectItem value="BC">Colombie-Britannique</SelectItem>
                    <SelectItem value="AB">Alberta</SelectItem>
                    <SelectItem value="MB">Manitoba</SelectItem>
                    <SelectItem value="SK">Saskatchewan</SelectItem>
                    <SelectItem value="NS">Nouvelle-Écosse</SelectItem>
                    <SelectItem value="NB">Nouveau-Brunswick</SelectItem>
                    <SelectItem value="PE">Île-du-Prince-Édouard</SelectItem>
                    <SelectItem value="NL">Terre-Neuve-et-Labrador</SelectItem>
                    <SelectItem value="YT">Yukon</SelectItem>
                    <SelectItem value="NT">Territoires du Nord-Ouest</SelectItem>
                    <SelectItem value="NU">Nunavut</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="postalCode">Code postal</Label>
                <Input
                  id="postalCode"
                  value={client.postalCode || ''}
                  onChange={(e) => setClient({...client, postalCode: e.target.value})}
                  placeholder="G4T 1A1"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-blue-500" />
              <span className="text-sm">
                {client.isInIslands ? (
                  <Badge className="bg-green-100 text-green-800">
                    Îles-de-la-Madeleine - Interventions sur site disponibles
                  </Badge>
                ) : (
                  <Badge className="bg-orange-100 text-orange-800">
                    Hors territoire - Services cloud uniquement
                  </Badge>
                )}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Abonnement
            </CardTitle>
            <CardDescription>
              Informations sur votre forfait actuel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Forfait actuel</Label>
                <div className="mt-1">
                  <Badge className="capitalize">
                    {client.subscription.plan}
                  </Badge>
                </div>
              </div>
              <div>
                <Label>Prix</Label>
                <p className="mt-1 font-medium">
                  {client.subscription.price}$ / {client.subscription.billingCycle === 'monthly' ? 'mois' : 'an'}
                </p>
              </div>
              <div>
                <Label>Statut</Label>
                <div className="mt-1">
                  <Badge className={
                    client.subscription.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }>
                    {client.subscription.status === 'active' ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                Pour modifier votre forfait ou vos options de facturation, 
                veuillez contacter notre équipe de support.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder les modifications
              </>
            )}
          </Button>
        </div>
      </div>
    </ClientLayout>
  );
}