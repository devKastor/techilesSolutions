'use client';

import { useEffect, useState } from 'react';
import { getClientByEmail } from '@/lib/services/clients';
import { auth } from '@/lib/firebase';
import { Client } from '@/lib/types';
import { validateClientProfile, getProfileCompletionPercentage } from '@/lib/utils/validation';
import ProfileCompletionBanner from '@/components/ProfileCompletionBanner';
import ClientLayout from '@/components/layout/ClientLayout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  Crown, 
  Zap,
  Shield,
  AlertTriangle
} from 'lucide-react';

export default function ClientUpgradePage() {
  const [client, setClient] = useState<Client | null>(null);
  const [profileValidation, setProfileValidation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClientData = async () => {
      if (!auth.currentUser?.email) return;

      try {
        const { client } = await getClientByEmail(auth.currentUser.email);
        if (client) {
          setClient(client);
          const validation = validateClientProfile(client);
          setProfileValidation(validation);
        }
      } catch (error) {
        console.error('Error fetching client data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, []);

  const plans = [
    {
      name: 'Base',
      price: 25,
      description: 'Parfait pour débuter',
      features: [
        '1 intervention/mois',
        '10 Go de sauvegarde',
        'Support par ticket',
        'Accès portail client'
      ],
      current: client?.subscription.plan === 'base'
    },
    {
      name: 'Standard',
      price: 45,
      description: 'Le plus populaire',
      features: [
        '2 interventions/mois',
        '50 Go de sauvegarde',
        'Support prioritaire',
        '10% rabais site web'
      ],
      popular: true,
      current: client?.subscription.plan === 'standard'
    },
    {
      name: 'Plus',
      price: 75,
      description: 'Pour les professionnels',
      features: [
        '4 interventions/mois',
        '100 Go de sauvegarde',
        'Maintenance proactive',
        'Domaine web offert'
      ],
      current: client?.subscription.plan === 'plus'
    },
    {
      name: 'Prestige',
      price: 120,
      description: 'Service complet',
      features: [
        'Interventions illimitées',
        '250 Go de sauvegarde',
        'Support prioritaire 24/7',
        'Site web inclus'
      ],
      premium: true,
      current: client?.subscription.plan === 'prestige'
    }
  ];

  const handleUpgrade = (planName: string) => {
    if (!profileValidation?.canPurchase) {
      alert('Vous devez compléter votre profil avant de pouvoir changer de forfait.');
      return;
    }
    // TODO: Implement Stripe payment integration
    console.log('Upgrade to:', planName);
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
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
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
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Changer de forfait</h1>
          <p className="text-gray-600">Choisissez le forfait qui correspond à vos besoins</p>
        </div>

        {/* Profile Completion Check */}
        {profileValidation && !profileValidation.canPurchase && (
          <ProfileCompletionBanner
            completionPercentage={getProfileCompletionPercentage(client)}
            missingFields={profileValidation.missingFields}
            showUpgradeBlock={true}
          />
        )}

        {/* Error Message */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Current Plan */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">Forfait actuel</h3>
                <p className="text-blue-700 capitalize">
                  {client.subscription.plan} - {client.subscription.price}$/mois
                </p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">
                {client.subscription.status === 'active' ? 'Actif' : 'Inactif'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative h-full ${
              plan.popular ? 'ring-2 ring-blue-600' : 
              plan.premium ? 'ring-2 ring-purple-600' : ''
            } ${plan.current ? 'bg-gray-50' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                    <Zap className="h-3 w-3 mr-1" />
                    Populaire
                  </span>
                </div>
              )}
              {plan.premium && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium
                  </span>
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}$</span>
                  <span className="text-gray-600">/mois</span>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-3" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  {plan.current ? (
                    <Button className="w-full" disabled>
                      Forfait actuel
                    </Button>
                  ) : (
                    <Button 
                      className={`w-full ${
                        !profileValidation?.canPurchase ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      variant={plan.popular || plan.premium ? 'default' : 'outline'}
                      onClick={() => handleUpgrade(plan.name.toLowerCase())}
                      disabled={!profileValidation?.canPurchase}
                    >
                      {!profileValidation?.canPurchase ? (
                        <>
                          <Shield className="h-4 w-4 mr-2" />
                          Profil requis
                        </>
                      ) : (
                        `Passer à ${plan.name}`
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Geographic Limitation Notice */}
        {!client.isInIslands && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-orange-600 mr-3" />
                <div>
                  <h3 className="font-medium text-orange-800">Limitation géographique</h3>
                  <p className="text-sm text-orange-700">
                    Les interventions physiques ne sont disponibles qu'aux Îles-de-la-Madeleine. 
                    Seuls les services cloud et web sont accessibles dans votre région.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ClientLayout>
  );
}