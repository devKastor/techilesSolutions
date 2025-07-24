'use client';

import { useEffect, useState } from 'react';
import { getClientByEmail } from '@/lib/services/clients';
import { auth } from '@/lib/firebase';
import { Client } from '@/lib/types';
import ClientLayout from '@/components/layout/ClientLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Cloud, 
  Upload, 
  Download,
  Folder,
  File,
  HardDrive,
  Shield,
  Clock
} from 'lucide-react';

export default function ClientCloudPage() {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<any[]>([]);

  useEffect(() => {
    const fetchClientData = async () => {
      if (!auth.currentUser?.email) return;

      try {
        const { client } = await getClientByEmail(auth.currentUser.email);
        if (client) {
          setClient(client);
          // TODO: Fetch files from Google Drive API
          // For now, using mock data
          setFiles([
            {
              id: '1',
              name: 'Sauvegarde_2025-01-01.zip',
              size: 1024 * 1024 * 150, // 150MB
              type: 'backup',
              createdAt: new Date('2025-01-01'),
            },
            {
              id: '2',
              name: 'Documents_Importants',
              size: 1024 * 1024 * 50, // 50MB
              type: 'folder',
              createdAt: new Date('2024-12-15'),
            },
            {
              id: '3',
              name: 'Configuration_Reseau.pdf',
              size: 1024 * 512, // 512KB
              type: 'document',
              createdAt: new Date('2024-12-10'),
            },
          ]);
        }
      } catch (error) {
        console.error('Error fetching client data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, []);

  const handleUpload = () => {
    // TODO: Implement file upload to Google Drive
    console.log('Upload file');
  };

  const handleDownload = (fileId: string) => {
    // TODO: Implement file download from Google Drive
    console.log('Download file:', fileId);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'folder':
        return <Folder className="h-5 w-5 text-blue-500" />;
      case 'backup':
        return <HardDrive className="h-5 w-5 text-green-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
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
          <Cloud className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Espace cloud non disponible
          </h2>
          <p className="text-gray-600">
            Veuillez contacter le support pour activer votre espace de sauvegarde.
          </p>
        </div>
      </ClientLayout>
    );
  }

  const usagePercent = client.cloudQuota > 0 ? (client.cloudUsed / client.cloudQuota) * 100 : 0;
  const remainingSpace = client.cloudQuota - client.cloudUsed;

  return (
    <ClientLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sauvegarde cloud</h1>
          <p className="text-gray-600">Gérez vos sauvegardes et fichiers sécurisés</p>
        </div>

        {/* Storage Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Espace utilisé</CardTitle>
              <Cloud className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{client.cloudUsed} Go</div>
              <Progress value={usagePercent} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {usagePercent.toFixed(1)}% de {client.cloudQuota} Go
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Espace disponible</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{remainingSpace} Go</div>
              <p className="text-xs text-muted-foreground">
                Espace libre restant
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sécurité</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Actif</div>
              <p className="text-xs text-muted-foreground">
                Chiffrement AES-256
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>
              Gérez vos fichiers et sauvegardes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Button onClick={handleUpload}>
                <Upload className="h-4 w-4 mr-2" />
                Téléverser un fichier
              </Button>
              <Button variant="outline">
                <HardDrive className="h-4 w-4 mr-2" />
                Nouvelle sauvegarde
              </Button>
              <Button variant="outline">
                <Shield className="h-4 w-4 mr-2" />
                Paramètres de sécurité
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Files List */}
        <Card>
          <CardHeader>
            <CardTitle>Mes fichiers</CardTitle>
            <CardDescription>
              {files.length} élément{files.length > 1 ? 's' : ''} dans votre espace cloud
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {files.length === 0 ? (
                <div className="text-center py-8">
                  <Cloud className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Espace cloud vide</h3>
                  <p className="text-gray-600 mb-4">
                    Commencez par téléverser vos premiers fichiers ou créer une sauvegarde.
                  </p>
                  <Button onClick={handleUpload}>
                    <Upload className="h-4 w-4 mr-2" />
                    Téléverser un fichier
                  </Button>
                </div>
              ) : (
                files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      {getFileIcon(file.type)}
                      <div>
                        <h3 className="font-medium">{file.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{formatFileSize(file.size)}</span>
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {file.createdAt.toLocaleDateString('fr-CA')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(file.id)}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Télécharger
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Storage Warning */}
        {usagePercent > 80 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <HardDrive className="h-5 w-5 text-orange-600 mr-3" />
                <div>
                  <h3 className="font-medium text-orange-800">Espace de stockage presque plein</h3>
                  <p className="text-sm text-orange-700">
                    Vous avez utilisé {usagePercent.toFixed(1)}% de votre quota. 
                    Contactez-nous pour augmenter votre espace de stockage.
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