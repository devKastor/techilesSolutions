'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Wifi, 
  HardDrive, 
  Monitor, 
  Printer,
  Smartphone,
  Server,
  Shield,
  Zap,
  Calculator,
  Globe,
  Database,
  Settings,
  Search,
  Copy,
  ExternalLink
} from 'lucide-react';

export default function TechToolbox() {
  const [ipAddress, setIpAddress] = useState('');
  const [subnetMask, setSubnetMask] = useState('255.255.255.0');
  const [pingTarget, setPingTarget] = useState('8.8.8.8');
  const [pingResult, setPingResult] = useState('');
  const [passwordLength, setPasswordLength] = useState(12);
  const [generatedPassword, setGeneratedPassword] = useState('');

  const networkTools = [
    {
      name: 'Calculateur IP',
      description: 'Calculer plages réseau et sous-réseaux',
      action: () => calculateNetwork()
    },
    {
      name: 'Test Ping',
      description: 'Tester connectivité réseau',
      action: () => performPing()
    },
    {
      name: 'Générateur mot de passe',
      description: 'Créer mots de passe sécurisés',
      action: () => generatePassword()
    },
    {
      name: 'Diagnostic WiFi',
      description: 'Analyser réseaux WiFi disponibles',
      action: () => scanWifi()
    }
  ];

  const systemCommands = [
    {
      name: 'ipconfig /all',
      description: 'Configuration réseau complète',
      command: 'ipconfig /all'
    },
    {
      name: 'sfc /scannow',
      description: 'Vérification fichiers système',
      command: 'sfc /scannow'
    },
    {
      name: 'chkdsk C: /f',
      description: 'Vérification disque dur',
      command: 'chkdsk C: /f'
    },
    {
      name: 'netsh wlan show profiles',
      description: 'Profils WiFi enregistrés',
      command: 'netsh wlan show profiles'
    },
    {
      name: 'dism /online /cleanup-image /restorehealth',
      description: 'Réparation image Windows',
      command: 'dism /online /cleanup-image /restorehealth'
    },
    {
      name: 'powercfg /batteryreport',
      description: 'Rapport batterie (laptops)',
      command: 'powercfg /batteryreport'
    }
  ];

  const troubleshootingSteps = [
    {
      category: 'Démarrage',
      steps: [
        'Vérifier alimentation et câbles',
        'Tester avec un autre câble d\'alimentation',
        'Retirer périphériques USB non essentiels',
        'Démarrer en mode sans échec',
        'Vérifier RAM (retirer/réinsérer barrettes)'
      ]
    },
    {
      category: 'Réseau',
      steps: [
        'Vérifier câbles réseau',
        'Redémarrer routeur/modem',
        'Vider cache DNS (ipconfig /flushdns)',
        'Réinitialiser pile TCP/IP',
        'Mettre à jour pilotes réseau'
      ]
    },
    {
      category: 'Performance',
      steps: [
        'Vérifier utilisation CPU/RAM',
        'Nettoyer fichiers temporaires',
        'Défragmenter disque dur',
        'Désactiver programmes au démarrage',
        'Analyser avec antivirus'
      ]
    },
    {
      category: 'Impression',
      steps: [
        'Vérifier connexion imprimante',
        'Redémarrer spooler d\'impression',
        'Mettre à jour pilotes imprimante',
        'Nettoyer file d\'attente',
        'Tester avec autre document'
      ]
    }
  ];

  const calculateNetwork = () => {
    if (!ipAddress) return;
    
    // Simulation calcul réseau
    const ip = ipAddress.split('.').map(Number);
    const mask = subnetMask.split('.').map(Number);
    
    const network = ip.map((octet, i) => octet & mask[i]).join('.');
    const broadcast = ip.map((octet, i) => octet | (255 - mask[i])).join('.');
    
    alert(`Réseau: ${network}\nBroadcast: ${broadcast}\nPlage: ${network} - ${broadcast}`);
  };

  const performPing = () => {
    setPingResult('Test en cours...');
    
    // Simulation ping
    setTimeout(() => {
      const latency = Math.floor(Math.random() * 50) + 10;
      const success = Math.random() > 0.2;
      
      if (success) {
        setPingResult(`Réponse de ${pingTarget}: temps=${latency}ms TTL=64`);
      } else {
        setPingResult(`Délai d'attente de la demande dépassé pour ${pingTarget}`);
      }
    }, 2000);
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < passwordLength; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    setGeneratedPassword(password);
  };

  const scanWifi = () => {
    alert('Scan WiFi simulé:\n\n' +
          'TechIle_Guest - Signal: Fort (-42 dBm)\n' +
          'Videotron_5G - Signal: Moyen (-65 dBm)\n' +
          'Bell_WiFi - Signal: Faible (-78 dBm)');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copié dans le presse-papiers !');
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="network" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="network">Réseau</TabsTrigger>
          <TabsTrigger value="system">Système</TabsTrigger>
          <TabsTrigger value="troubleshooting">Dépannage</TabsTrigger>
          <TabsTrigger value="references">Références</TabsTrigger>
        </TabsList>

        {/* Network Tools */}
        <TabsContent value="network" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* IP Calculator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="h-5 w-5 mr-2" />
                  Calculateur IP
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Adresse IP:</label>
                  <Input
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    placeholder="192.168.1.100"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Masque:</label>
                  <Input
                    value={subnetMask}
                    onChange={(e) => setSubnetMask(e.target.value)}
                    placeholder="255.255.255.0"
                  />
                </div>
                <Button onClick={calculateNetwork} className="w-full">
                  Calculer
                </Button>
              </CardContent>
            </Card>

            {/* Ping Tool */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  Test Ping
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Cible:</label>
                  <Input
                    value={pingTarget}
                    onChange={(e) => setPingTarget(e.target.value)}
                    placeholder="8.8.8.8"
                  />
                </div>
                <Button onClick={performPing} className="w-full">
                  Ping
                </Button>
                {pingResult && (
                  <div className="p-2 bg-gray-100 rounded text-sm font-mono">
                    {pingResult}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Password Generator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Générateur mot de passe
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Longueur:</label>
                  <Input
                    type="number"
                    value={passwordLength}
                    onChange={(e) => setPasswordLength(parseInt(e.target.value) || 12)}
                    min="8"
                    max="32"
                  />
                </div>
                <Button onClick={generatePassword} className="w-full">
                  Générer
                </Button>
                {generatedPassword && (
                  <div className="flex items-center space-x-2">
                    <Input value={generatedPassword} readOnly className="font-mono" />
                    <Button
                      size="sm"
                      onClick={() => copyToClipboard(generatedPassword)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* WiFi Scanner */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wifi className="h-5 w-5 mr-2" />
                  Scanner WiFi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={scanWifi} className="w-full">
                  Scanner réseaux
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Commands */}
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Commandes système utiles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {systemCommands.map((cmd, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{cmd.name}</h4>
                      <p className="text-sm text-gray-600">{cmd.description}</p>
                      <code className="text-xs bg-gray-200 px-2 py-1 rounded mt-1 inline-block">
                        {cmd.command}
                      </code>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => copyToClipboard(cmd.command)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Troubleshooting */}
        <TabsContent value="troubleshooting" className="space-y-4">
          {troubleshootingSteps.map((category, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{category.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {category.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="flex items-start space-x-2">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                        {stepIndex + 1}
                      </span>
                      <span className="text-sm">{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* References */}
        <TabsContent value="references" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Liens utiles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <a href="https://www.speedtest.net" target="_blank" className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <span className="text-sm">Test de débit</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
                <a href="https://downdetector.ca" target="_blank" className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <span className="text-sm">État des services</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
                <a href="https://www.whatismyipaddress.com" target="_blank" className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <span className="text-sm">Mon IP publique</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Codes d'erreur Windows</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm space-y-1">
                  <div><strong>0x80070005:</strong> Accès refusé</div>
                  <div><strong>0x80004005:</strong> Erreur non spécifiée</div>
                  <div><strong>0x80070002:</strong> Fichier introuvable</div>
                  <div><strong>0x8007000E:</strong> Mémoire insuffisante</div>
                  <div><strong>0x80070020:</strong> Fichier en cours d'utilisation</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}