'use client';

import { useEffect, useState } from 'react';
import { getAllWebsites, createWebsite, updateWebsite } from '@/lib/services/websites';
import { getAllClients } from '@/lib/services/clients';
import { WebsiteProject, Client } from '@/lib/types';
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
  Globe, 
  Plus, 
  Search, 
  ExternalLink,
  Eye,
  Settings,
  Code,
  Palette
} from 'lucide-react';

export default function AdminWebsitesPage() {
  const [websites, setWebsites] = useState<WebsiteProject[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

const [newWebsite, setNewWebsite] = useState({
  clientId: '',
  type: 'vitrine' as const,
  name: '',
  status: 'development' as const, // ✅ valeur initiale logique
  subdomain: '', // ✅ sera généré automatiquement ou par l’utilisateur
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
      const [websitesResult, clientsResult] = await Promise.all([
        getAllWebsites(),
        getAllClients()
      ]);
      
      if (!websitesResult.error) {
        setWebsites(websitesResult.websites);
      }
      if (!clientsResult.error) {
        setClients(clientsResult.clients);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

const handleCreateWebsite = async () => {
  const generatedSubdomain = newWebsite.name
    .toLowerCase()
    .replace(/\s+/g, '-')        // espaces → tirets
    .replace(/[^a-z0-9-]/g, '')  // supprime les caractères non valides

  const { id, error } = await createWebsite({
    ...newWebsite,
    subdomain: generatedSubdomain || 'site-' + Date.now(),
  });

  if (!error && id) {
    const { websites } = await getAllWebsites();
    setWebsites(websites);
    setIsCreateDialogOpen(false);
    setNewWebsite({
      clientId: '',
      type: 'vitrine',
      name: '',
      status: 'development',
      subdomain: '',
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
  }
};


  const handleLaunchWebsite = async (websiteId: string) => {
    const { error } = await updateWebsite(websiteId, {
      status: 'live',
      launchedAt: new Date(),
    });
    
    if (!error) {
      const { websites } = await getAllWebsites();
      setWebsites(websites);
    }
  };

  const filteredWebsites = websites.filter(website => {
    const client = clients.find(c => c.id === website.clientId);
    const clientName = client ? `${client.firstName} ${client.lastName}` : '';
    
    return website.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           website.content.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           clientName.toLowerCase().includes(searchTerm.toLowerCase());
  });

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
        return { name: 'Site Vitrine', price: '25$/mois', icon: Globe };
      case 'pme':
        return { name: 'Site PME', price: '60$/mois', icon: Code };
      case 'ecommerce':
        return { name: 'E-commerce', price: '90$/mois', icon: Settings };
      default:
        return { name: 'Site Web', price: '', icon: Globe };
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
            <h1 className="text-3xl font-bold text-gray-900">Gestion des sites web</h1>
            <p className="text-gray-600">Créez et gérez les sites web de vos clients</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau site web
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer un nouveau site web</DialogTitle>
                <DialogDescription>
                  Créez un site web pour un client
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="clientId">Client</Label>
                  <Select value={newWebsite.clientId} onValueChange={(value) => 
                    setNewWebsite({...newWebsite, clientId: value})
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.firstName} {client.lastName} - {client.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
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
                    placeholder="Décrivez l'entreprise et ses services..."
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

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un site web..."
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
              <CardTitle className="text-sm font-medium">Total sites</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{websites.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sites en ligne</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {websites.filter(w => w.status === 'live').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En développement</CardTitle>
              <Code className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {websites.filter(w => w.status === 'development').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenus mensuels</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {websites.reduce((sum, w) => {
                  const typeInfo = getTypeInfo(w.type);
                  const price = parseInt(typeInfo.price.replace(/[^0-9]/g, '')) || 0;
                  return sum + price;
                }, 0)}$
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Websites List */}
        <Card>
          <CardHeader>
            <CardTitle>Sites web</CardTitle>
            <CardDescription>
              {filteredWebsites.length} site{filteredWebsites.length > 1 ? 's' : ''} trouvé{filteredWebsites.length > 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredWebsites.map((website) => {
                const client = clients.find(c => c.id === website.clientId);
                const typeInfo = getTypeInfo(website.type);
                const TypeIcon = typeInfo.icon;
                
                return (
                  <div key={website.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <TypeIcon className="h-8 w-8 text-blue-500" />
                        <div>
                          <h3 className="font-semibold">{website.name}</h3>
                          <p className="text-sm text-gray-600">{website.content.companyName}</p>
                          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                            <span>Client: {client ? `${client.firstName} ${client.lastName}` : 'Client inconnu'}</span>
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
                        <div className="text-xs text-gray-500">
                          {website.subdomain}.techilesolutions.ca
                        </div>
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
                        {website.status === 'development' && (
                          <Button
                            size="sm"
                            onClick={() => handleLaunchWebsite(website.id)}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Mettre en ligne
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Palette className="h-3 w-3 mr-1" />
                          Modifier
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}