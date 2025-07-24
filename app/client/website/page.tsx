'use client';

import { useEffect, useState } from 'react';
import { getClientByEmail } from '@/lib/services/clients';
import { auth } from '@/lib/firebase';
import { Client, WebsiteProject } from '@/lib/types';
import ClientLayout from '@/components/layout/ClientLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Globe, 
  Plus, 
  ExternalLink,
  Palette,
  Settings,
  Eye,
  Code
} from 'lucide-react';

type WebsiteType = 'vitrine' | 'pme' | 'ecommerce';


export default function ClientWebsitePage() {
  const [client, setClient] = useState<Client | null>(null);
  const [websites, setWebsites] = useState<WebsiteProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

const [newWebsite, setNewWebsite] = useState<{
  type: WebsiteType;
  name: string;
  content: {
    companyName: string;
    description: string;
    contact: {
      email: string;
      phone: string;
      address: string;
    };
    colors: {
      primary: string;
      secondary: string;
    };
    pages: any[];
  };
}>({
  type: 'vitrine',
  name: '',
  content: {
    companyName: '',
    description: '',
    contact: {
      email: '',
      phone: '',
      address: '',
    },
    colors: {
      primary: '#3B82F6',
      secondary: '#1F2937',
    },
    pages: [],
  },
});


  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser?.email) return;

      try {
        const { client } = await getClientByEmail(auth.currentUser.email);
        if (client) {
          setClient(client);
          // TODO: Fetch websites from Firestore
          // For now, using mock data
          setWebsites([
            {
              id: '1',
              clientId: client.id,
              type: 'vitrine',
              name: 'Mon Site Vitrine',
              subdomain: 'monsite',
              status: 'live',
              content: {
                logo: '',
                companyName: 'Mon Entreprise',
                description: 'Description de mon entreprise',
                contact: {
                  email: client.email,
                  phone: client.phone || '',
                  address: client.address || '',
                },
                colors: {
                  primary: '#3B82F6',
                  secondary: '#1F2937',
                },
                pages: [
                  {
                    name: 'Accueil',
                    slug: 'home',
                    content: 'Contenu de la page d\'accueil',
                    isPublished: true,
                  },
                ],
              },
              createdAt: new Date('2024-12-01'),
              launchedAt: new Date('2024-12-05'),
            },
          ]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateWebsite = async () => {
    // TODO: Create website in Firestore and generate with Bolt
    console.log('Create website:', newWebsite);
    setIsCreateDialogOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-green-100 text-green-800';
      case 'development':
        return 'bg-blue-100 text-blue-800';
      case 'review':
        return 'bg-yellow-100 text-yellow-800';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'vitrine':
        return { name: 'Site Vitrine', price: '25$/mois', description: '1 page professionnelle' };
      case 'pme':
        return { name: 'Site PME', price: '60$/mois', description: '4-6 pages complètes' };
      case 'ecommerce':
        return { name: 'E-commerce', price: '90$/mois', description: 'Boutique en ligne' };
      default:
        return { name: 'Site Web', price: '', description: '' };
    }
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
          <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Service non disponible
          </h2>
          <p className="text-gray-600">
            Veuillez contacter le support pour activer le service de création de sites web.
          </p>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mon site web</h1>
            <p className="text-gray-600">Créez et gérez votre présence en ligne</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau site
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer un nouveau site web</DialogTitle>
                <DialogDescription>
                  Choisissez le type de site qui correspond à vos besoins
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="websiteType">Type de site</Label>
                  <Select value={newWebsite.type} onValueChange={(value: any) => 
                    setNewWebsite({...newWebsite, type: value})
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vitrine">Site Vitrine - 25$/mois</SelectItem>
                      <SelectItem value="pme">Site PME - 60$/mois</SelectItem>
                      <SelectItem value="ecommerce">E-commerce - 90$/mois</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="websiteName">Nom du site</Label>
                  <Input
                    id="websiteName"
                    value={newWebsite.name}
                    onChange={(e) => setNewWebsite({...newWebsite, name: e.target.value})}
                    placeholder="Mon Site Web"
                  />
                </div>

                <div>
                  <Label htmlFor="companyName">Nom de l'entreprise</Label>
                  <Input
                    id="companyName"
                    value={newWebsite.content.companyName}
                    onChange={(e) => setNewWebsite({
                      ...newWebsite,
                      content: {...newWebsite.content, companyName: e.target.value}
                    })}
                    placeholder="Mon Entreprise"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newWebsite.content.description}
                    onChange={(e) => setNewWebsite({
                      ...newWebsite,
                      content: {...newWebsite.content, description: e.target.value}
                    })}
                    placeholder="Décrivez votre entreprise et vos services..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primaryColor">Couleur principale</Label>
                    <Input
                      id="primaryColor"
                      type="color"
                      value={newWebsite.content.colors.primary}
                      onChange={(e) => setNewWebsite({
                        ...newWebsite,
                        content: {
                          ...newWebsite.content,
                          colors: {...newWebsite.content.colors, primary: e.target.value}
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="secondaryColor">Couleur secondaire</Label>
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={newWebsite.content.colors.secondary}
                      onChange={(e) => setNewWebsite({
                        ...newWebsite,
                        content: {
                          ...newWebsite.content,
                          colors: {...newWebsite.content.colors, secondary: e.target.value}
                        }
                      })}
                    />
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Inclus dans votre site :</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    {newWebsite.type === 'vitrine' && (
                      <>
                        <li>• Page d'accueil professionnelle</li>
                        <li>• Section À propos</li>
                        <li>• Formulaire de contact</li>
                        <li>• Design responsive</li>
                      </>
                    )}
                    {newWebsite.type === 'pme' && (
                      <>
                        <li>• 4-6 pages complètes</li>
                        <li>• Section services</li>
                        <li>• Galerie photos</li>
                        <li>• Témoignages clients</li>
                        <li>• Blog intégré</li>
                      </>
                    )}
                    {newWebsite.type === 'ecommerce' && (
                      <>
                        <li>• Boutique en ligne complète</li>
                        <li>• Jusqu'à 20 produits</li>
                        <li>• Paiement sécurisé</li>
                        <li>• Gestion des commandes</li>
                        <li>• Suivi de stock</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateWebsite}>
                  Créer le site
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Website Types */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Site Vitrine
              </CardTitle>
              <CardDescription>25$/mois</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1">
                <li>• 1 page professionnelle</li>
                <li>• Formulaire de contact</li>
                <li>• Design responsive</li>
                <li>• Hébergement inclus</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Code className="h-5 w-5 mr-2" />
                Site PME
              </CardTitle>
              <CardDescription>60$/mois</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1">
                <li>• 4-6 pages complètes</li>
                <li>• Section services</li>
                <li>• Galerie photos</li>
                <li>• Blog intégré</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                E-commerce
              </CardTitle>
              <CardDescription>90$/mois</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1">
                <li>• Boutique en ligne</li>
                <li>• Jusqu'à 20 produits</li>
                <li>• Paiement sécurisé</li>
                <li>• Gestion des commandes</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Current Websites */}
        <Card>
          <CardHeader>
            <CardTitle>Mes sites web</CardTitle>
            <CardDescription>
              {websites.length} site{websites.length > 1 ? 's' : ''} créé{websites.length > 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {websites.length === 0 ? (
                <div className="text-center py-8">
                  <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun site web</h3>
                  <p className="text-gray-600 mb-4">
                    Créez votre premier site web pour établir votre présence en ligne.
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer mon premier site
                  </Button>
                </div>
              ) : (
                websites.map((website) => {
                  const typeInfo = getTypeInfo(website.type);
                  return (
                    <div key={website.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <Globe className="h-8 w-8 text-blue-500" />
                          <div>
                            <h3 className="font-semibold">{website.name}</h3>
                            <p className="text-sm text-gray-600">{website.content.companyName}</p>
                            <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                              <span>Type: {typeInfo.name}</span>
                              <span>Créé: {website.createdAt?.toLocaleDateString('fr-CA')}</span>
                              {website.launchedAt && (
                                <span>En ligne: {website.launchedAt.toLocaleDateString('fr-CA')}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">{typeInfo.price}</div>
                          <div className="text-xs text-gray-500">{typeInfo.description}</div>
                        </div>
                        <Badge className={getStatusColor(website.status)}>
                          {website.status === 'live' ? 'En ligne' : 
                           website.status === 'development' ? 'Développement' :
                           website.status === 'review' ? 'Révision' : 'Maintenance'}
                        </Badge>
                        <div className="flex space-x-1">
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            Aperçu
                          </Button>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Visiter
                          </Button>
                          <Button variant="outline" size="sm">
                            <Palette className="h-3 w-3 mr-1" />
                            Modifier
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ClientLayout>
  );
}