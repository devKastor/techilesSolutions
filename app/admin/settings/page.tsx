'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  DollarSign, 
  Bell,
  Shield,
  Database,
  Mail,
  Save,
  Download,
  Upload,
  Trash2
} from 'lucide-react';

interface PricingSettings {
  interventionHourlyRate: number;
  travelRate: number;
  urgentSurcharge: number;
  cloudStorageBase: number;
  cloudStoragePerGB: number;
  websiteVitrine: number;
  websitePME: number;
  websiteEcommerce: number;
  maintenanceBase: number;
  maintenanceStandard: number;
  maintenancePlus: number;
  maintenancePrestige: number;
}

interface NotificationSettings {
  emailNotifications: boolean;
  ticketUpdates: boolean;
  paymentReminders: boolean;
  systemAlerts: boolean;
  clientRegistrations: boolean;
  overdueInvoices: boolean;
}

interface SystemSettings {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  taxRate: number;
  defaultPaymentTerms: number;
  autoBackupEnabled: boolean;
  maintenanceMode: boolean;
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [pricingSettings, setPricingSettings] = useState<PricingSettings>({
    interventionHourlyRate: 75,
    travelRate: 0.65,
    urgentSurcharge: 50,
    cloudStorageBase: 10,
    cloudStoragePerGB: 2,
    websiteVitrine: 25,
    websitePME: 60,
    websiteEcommerce: 90,
    maintenanceBase: 25,
    maintenanceStandard: 45,
    maintenancePlus: 75,
    maintenancePrestige: 120
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    ticketUpdates: true,
    paymentReminders: true,
    systemAlerts: true,
    clientRegistrations: true,
    overdueInvoices: true
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    companyName: 'TechÎle Solutions',
    companyEmail: 'dev@kastor.ca',
    companyPhone: '(418) 555-0123',
    companyAddress: 'Îles-de-la-Madeleine, QC',
    taxRate: 15,
    defaultPaymentTerms: 30,
    autoBackupEnabled: true,
    maintenanceMode: false
  });

  const handleSavePricing = async () => {
    setLoading(true);
    try {
      // Simuler sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // En production, sauvegarder dans Firestore
      console.log('Saving pricing settings:', pricingSettings);
      
      setMessage({ type: 'success', text: 'Tarifs mis à jour avec succès!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Saving notification settings:', notificationSettings);
      setMessage({ type: 'success', text: 'Notifications mises à jour avec succès!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSystem = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Saving system settings:', systemSettings);
      setMessage({ type: 'success', text: 'Paramètres système mis à jour avec succès!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    const data = {
      pricing: pricingSettings,
      notifications: notificationSettings,
      system: systemSettings,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `techilesolutions-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.pricing) setPricingSettings(data.pricing);
        if (data.notifications) setNotificationSettings(data.notifications);
        if (data.system) setSystemSettings(data.system);
        setMessage({ type: 'success', text: 'Paramètres importés avec succès!' });
      } catch (error) {
        setMessage({ type: 'error', text: 'Erreur lors de l\'importation' });
      }
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Paramètres système</h1>
            <p className="text-gray-600">Configuration générale de TechÎle Solutions</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleExportData}>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            <label className="cursor-pointer">
              <Button variant="outline" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Importer
                </span>
              </Button>
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <Tabs defaultValue="pricing" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pricing">Tarification</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="system">Système</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
          </TabsList>

          {/* Pricing Settings */}
          <TabsContent value="pricing">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Tarifs des services
                  </CardTitle>
                  <CardDescription>
                    Configurez les tarifs pour tous vos services
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Interventions */}
                  <div>
                    <h3 className="font-semibold mb-4">Interventions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="hourlyRate">Tarif horaire (CAD)</Label>
                        <Input
                          id="hourlyRate"
                          type="number"
                          value={pricingSettings.interventionHourlyRate}
                          onChange={(e) => setPricingSettings({
                            ...pricingSettings,
                            interventionHourlyRate: parseFloat(e.target.value) || 0
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="travelRate">Déplacement (CAD/km)</Label>
                        <Input
                          id="travelRate"
                          type="number"
                          step="0.01"
                          value={pricingSettings.travelRate}
                          onChange={(e) => setPricingSettings({
                            ...pricingSettings,
                            travelRate: parseFloat(e.target.value) || 0
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="urgentSurcharge">Supplément urgent (CAD)</Label>
                        <Input
                          id="urgentSurcharge"
                          type="number"
                          value={pricingSettings.urgentSurcharge}
                          onChange={(e) => setPricingSettings({
                            ...pricingSettings,
                            urgentSurcharge: parseFloat(e.target.value) || 0
                          })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Cloud Storage */}
                  <div>
                    <h3 className="font-semibold mb-4">Sauvegarde cloud</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cloudBase">Base (50 GB) - CAD/mois</Label>
                        <Input
                          id="cloudBase"
                          type="number"
                          value={pricingSettings.cloudStorageBase}
                          onChange={(e) => setPricingSettings({
                            ...pricingSettings,
                            cloudStorageBase: parseFloat(e.target.value) || 0
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cloudPerGB">Par GB supplémentaire - CAD/mois</Label>
                        <Input
                          id="cloudPerGB"
                          type="number"
                          step="0.01"
                          value={pricingSettings.cloudStoragePerGB}
                          onChange={(e) => setPricingSettings({
                            ...pricingSettings,
                            cloudStoragePerGB: parseFloat(e.target.value) || 0
                          })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Websites */}
                  <div>
                    <h3 className="font-semibold mb-4">Sites web</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="websiteVitrine">Site vitrine - CAD/mois</Label>
                        <Input
                          id="websiteVitrine"
                          type="number"
                          value={pricingSettings.websiteVitrine}
                          onChange={(e) => setPricingSettings({
                            ...pricingSettings,
                            websiteVitrine: parseFloat(e.target.value) || 0
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="websitePME">Site PME - CAD/mois</Label>
                        <Input
                          id="websitePME"
                          type="number"
                          value={pricingSettings.websitePME}
                          onChange={(e) => setPricingSettings({
                            ...pricingSettings,
                            websitePME: parseFloat(e.target.value) || 0
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="websiteEcommerce">E-commerce - CAD/mois</Label>
                        <Input
                          id="websiteEcommerce"
                          type="number"
                          value={pricingSettings.websiteEcommerce}
                          onChange={(e) => setPricingSettings({
                            ...pricingSettings,
                            websiteEcommerce: parseFloat(e.target.value) || 0
                          })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Maintenance Plans */}
                  <div>
                    <h3 className="font-semibold mb-4">Forfaits maintenance</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="maintenanceBase">Base - CAD/mois</Label>
                        <Input
                          id="maintenanceBase"
                          type="number"
                          value={pricingSettings.maintenanceBase}
                          onChange={(e) => setPricingSettings({
                            ...pricingSettings,
                            maintenanceBase: parseFloat(e.target.value) || 0
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="maintenanceStandard">Standard - CAD/mois</Label>
                        <Input
                          id="maintenanceStandard"
                          type="number"
                          value={pricingSettings.maintenanceStandard}
                          onChange={(e) => setPricingSettings({
                            ...pricingSettings,
                            maintenanceStandard: parseFloat(e.target.value) || 0
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="maintenancePlus">Plus - CAD/mois</Label>
                        <Input
                          id="maintenancePlus"
                          type="number"
                          value={pricingSettings.maintenancePlus}
                          onChange={(e) => setPricingSettings({
                            ...pricingSettings,
                            maintenancePlus: parseFloat(e.target.value) || 0
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="maintenancePrestige">Prestige - CAD/mois</Label>
                        <Input
                          id="maintenancePrestige"
                          type="number"
                          value={pricingSettings.maintenancePrestige}
                          onChange={(e) => setPricingSettings({
                            ...pricingSettings,
                            maintenancePrestige: parseFloat(e.target.value) || 0
                          })}
                        />
                      </div>
                    </div>
                  </div>

                  <Button onClick={handleSavePricing} disabled={loading}>
                    {loading ? 'Sauvegarde...' : 'Sauvegarder les tarifs'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Paramètres de notification
                </CardTitle>
                <CardDescription>
                  Configurez les notifications automatiques
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Notifications par email</h4>
                      <p className="text-sm text-gray-600">Recevoir les notifications importantes par email</p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked: boolean) => setNotificationSettings({
                        ...notificationSettings,
                        emailNotifications: checked
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Mises à jour de tickets</h4>
                      <p className="text-sm text-gray-600">Notifier lors des changements de statut</p>
                    </div>
                    <Switch
                      checked={notificationSettings.ticketUpdates}
                      onCheckedChange={(checked: boolean) => setNotificationSettings({
                        ...notificationSettings,
                        ticketUpdates: checked
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Rappels de paiement</h4>
                      <p className="text-sm text-gray-600">Envoyer rappels pour factures échues</p>
                    </div>
                    <Switch
                      checked={notificationSettings.paymentReminders}
                      onCheckedChange={(checked: boolean) => setNotificationSettings({
                        ...notificationSettings,
                        paymentReminders: checked
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Alertes système</h4>
                      <p className="text-sm text-gray-600">Notifications pour problèmes techniques</p>
                    </div>
                    <Switch
                      checked={notificationSettings.systemAlerts}
                      onCheckedChange={(checked: boolean) => setNotificationSettings({
                        ...notificationSettings,
                        systemAlerts: checked
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Nouvelles inscriptions</h4>
                      <p className="text-sm text-gray-600">Notifier lors de nouveaux clients</p>
                    </div>
                    <Switch
                      checked={notificationSettings.clientRegistrations}
                      onCheckedChange={(checked: boolean) => setNotificationSettings({
                        ...notificationSettings,
                        clientRegistrations: checked
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Factures en retard</h4>
                      <p className="text-sm text-gray-600">Alertes pour factures non payées</p>
                    </div>
                    <Switch
                      checked={notificationSettings.overdueInvoices}
                      onCheckedChange={(checked: boolean) => setNotificationSettings({
                        ...notificationSettings,
                        overdueInvoices: checked
                      })}
                    />
                  </div>
                </div>

                <Button onClick={handleSaveNotifications} disabled={loading}>
                  {loading ? 'Sauvegarde...' : 'Sauvegarder les notifications'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="system">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Informations de l'entreprise
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="companyName">Nom de l'entreprise</Label>
                      <Input
                        id="companyName"
                        value={systemSettings.companyName}
                        onChange={(e) => setSystemSettings({
                          ...systemSettings,
                          companyName: e.target.value
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="companyEmail">Email principal</Label>
                      <Input
                        id="companyEmail"
                        type="email"
                        value={systemSettings.companyEmail}
                        onChange={(e) => setSystemSettings({
                          ...systemSettings,
                          companyEmail: e.target.value
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="companyPhone">Téléphone</Label>
                      <Input
                        id="companyPhone"
                        value={systemSettings.companyPhone}
                        onChange={(e) => setSystemSettings({
                          ...systemSettings,
                          companyPhone: e.target.value
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="taxRate">Taux de taxe (%)</Label>
                      <Input
                        id="taxRate"
                        type="number"
                        step="0.01"
                        value={systemSettings.taxRate}
                        onChange={(e) => setSystemSettings({
                          ...systemSettings,
                          taxRate: parseFloat(e.target.value) || 0
                        })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="companyAddress">Adresse</Label>
                    <Textarea
                      id="companyAddress"
                      value={systemSettings.companyAddress}
                      onChange={(e) => setSystemSettings({
                        ...systemSettings,
                        companyAddress: e.target.value
                      })}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Paramètres opérationnels</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="paymentTerms">Délai de paiement par défaut (jours)</Label>
                    <Input
                      id="paymentTerms"
                      type="number"
                      value={systemSettings.defaultPaymentTerms}
                      onChange={(e) => setSystemSettings({
                        ...systemSettings,
                        defaultPaymentTerms: parseInt(e.target.value) || 30
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Sauvegarde automatique</h4>
                      <p className="text-sm text-gray-600">Sauvegardes hebdomadaires automatiques</p>
                    </div>
                    <Switch
                      checked={systemSettings.autoBackupEnabled}
                      onCheckedChange={(checked: boolean) => setSystemSettings({
                        ...systemSettings,
                        autoBackupEnabled: checked
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Mode maintenance</h4>
                      <p className="text-sm text-gray-600">Désactiver temporairement le système</p>
                    </div>
                    <Switch
                      checked={systemSettings.maintenanceMode}
                      onCheckedChange={(checked: boolean) => setSystemSettings({
                        ...systemSettings,
                        maintenanceMode: checked
                      })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Button onClick={handleSaveSystem} disabled={loading}>
                {loading ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
              </Button>
            </div>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Sécurité et sauvegarde
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="h-20 flex flex-col">
                      <Database className="h-6 w-6 mb-2" />
                      <span>Sauvegarder données</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col">
                      <Upload className="h-6 w-6 mb-2" />
                      <span>Restaurer données</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col">
                      <Shield className="h-6 w-6 mb-2" />
                      <span>Logs de sécurité</span>
                    </Button>
                    <Button variant="destructive" className="h-20 flex flex-col">
                      <Trash2 className="h-6 w-6 mb-2" />
                      <span>Purger logs anciens</span>
                    </Button>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-medium text-yellow-800 mb-2">Informations de sécurité</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Dernière sauvegarde: {new Date().toLocaleDateString('fr-CA')}</li>
                      <li>• Logs conservés: 90 jours</li>
                      <li>• Chiffrement: AES-256</li>
                      <li>• Authentification: Firebase Auth</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}