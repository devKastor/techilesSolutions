'use client';

import { AlertTriangle, User, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

interface ProfileCompletionBannerProps {
  completionPercentage: number;
  missingFields: string[];
  showUpgradeBlock?: boolean;
}

export default function ProfileCompletionBanner({ 
  completionPercentage, 
  missingFields, 
  showUpgradeBlock = false 
}: ProfileCompletionBannerProps) {
  const getFieldLabel = (field: string) => {
    const labels: { [key: string]: string } = {
      firstName: 'Prénom',
      lastName: 'Nom',
      phone: 'Téléphone',
      address: 'Adresse',
      city: 'Ville',
      postalCode: 'Code postal'
    };
    return labels[field] || field;
  };

  if (completionPercentage === 100) return null;

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardContent className="pt-6">
        <div className="flex items-start space-x-4">
          <AlertTriangle className="h-6 w-6 text-orange-600 mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold text-orange-800 mb-2">
              Profil incomplet ({completionPercentage}%)
            </h3>
            <Progress value={completionPercentage} className="mb-3" />
            <p className="text-sm text-orange-700 mb-3">
              {showUpgradeBlock ? (
                <>
                  <strong>Vous devez compléter votre profil pour pouvoir souscrire à un forfait ou effectuer des achats.</strong>
                  <br />
                  Champs manquants : {missingFields.map(getFieldLabel).join(', ')}
                </>
              ) : (
                <>
                  Complétez votre profil pour accéder à tous nos services.
                  <br />
                  Champs manquants : {missingFields.map(getFieldLabel).join(', ')}
                </>
              )}
            </p>
            <Link href="/client/settings">
              <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                <User className="h-4 w-4 mr-2" />
                Compléter mon profil
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}