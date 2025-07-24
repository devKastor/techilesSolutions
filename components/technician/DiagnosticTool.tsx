'use client';

import { useState } from 'react';
import { ServiceTicket } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Laptop, 
  Wifi, 
  HardDrive, 
  Monitor, 
  Printer, 
  Smartphone,
  Server,
  Shield,
  Zap,
  CheckCircle,
  AlertTriangle,
  Info,
  Play,
  Save
} from 'lucide-react';

interface DiagnosticToolProps {
  ticket: ServiceTicket;
  onSaveResults: (results: string) => void;
}

interface DiagnosticTest {
  id: string;
  name: string;
  category: string;
  icon: any;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'warning';
  result?: string;
  details?: string;
}

export default function DiagnosticTool({ ticket, onSaveResults }: DiagnosticToolProps) {
  const [selectedCategory, setSelectedCategory] = useState('hardware');
  const [customNotes, setCustomNotes] = useState('');
  const [diagnosticTests, setDiagnosticTests] = useState<DiagnosticTest[]>([
    // Hardware Tests
    { id: 'cpu', name: 'Processeur', category: 'hardware', icon: Laptop, status: 'pending' },
    { id: 'memory', name: 'Mémoire RAM', category: 'hardware', icon: Laptop, status: 'pending' },
    { id: 'storage', name: 'Disque dur', category: 'hardware', icon: HardDrive, status: 'pending' },
    { id: 'display', name: 'Écran', category: 'hardware', icon: Monitor, status: 'pending' },
    
    // Network Tests
    { id: 'connectivity', name: 'Connectivité Internet', category: 'network', icon: Wifi, status: 'pending' },
    { id: 'wifi', name: 'WiFi', category: 'network', icon: Wifi, status: 'pending' },
    { id: 'ethernet', name: 'Ethernet', category: 'network', icon: Server, status: 'pending' },
    { id: 'dns', name: 'Résolution DNS', category: 'network', icon: Server, status: 'pending' },
    
    // Software Tests
    { id: 'os', name: 'Système d\'exploitation', category: 'software', icon: Laptop, status: 'pending' },
    { id: 'updates', name: 'Mises à jour', category: 'software', icon: Laptop, status: 'pending' },
    { id: 'antivirus', name: 'Antivirus', category: 'software', icon: Shield, status: 'pending' },
    { id: 'drivers', name: 'Pilotes', category: 'software', icon: Laptop, status: 'pending' },
    
    // Performance Tests
    { id: 'boot', name: 'Temps de démarrage', category: 'performance', icon: Zap, status: 'pending' },
    { id: 'responsiveness', name: 'Réactivité système', category: 'performance', icon: Zap, status: 'pending' },
    { id: 'temperature', name: 'Température', category: 'performance', icon: Zap, status: 'pending' },
  ]);

  const categories = [
    { id: 'hardware', name: 'Matériel', icon: Laptop },
    { id: 'network', name: 'Réseau', icon: Wifi },
    { id: 'software', name: 'Logiciel', icon: Server },
    { id: 'performance', name: 'Performance', icon: Zap },
  ];

  const runTest = async (testId: string) => {
    setDiagnosticTests(prev => prev.map(test => 
      test.id === testId ? { ...test, status: 'running' } : test
    ));

    // Simuler le test avec délai réaliste
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

    // Résultats simulés mais réalistes
    const results = getTestResults(testId);
    
    setDiagnosticTests(prev => prev.map(test => 
      test.id === testId ? { ...test, ...results } : test
    ));
  };

  const getTestResults = (testId: string) => {
    const testResults: { [key: string]: any } = {
      cpu: {
        status: 'passed',
        result: 'Intel Core i5-8250U @ 1.60GHz',
        details: 'Processeur fonctionnel, température normale (45°C)'
      },
      memory: {
        status: 'warning',
        result: '8 GB DDR4 (6.2 GB utilisés)',
        details: 'Utilisation mémoire élevée (77%), recommandé de fermer applications inutiles'
      },
      storage: {
        status: 'warning',
        result: '256 GB SSD (89% utilisé)',
        details: 'Espace disque faible, nettoyage recommandé'
      },
      display: {
        status: 'passed',
        result: '1920x1080 @ 60Hz',
        details: 'Écran fonctionnel, luminosité optimale'
      },
      connectivity: {
        status: Math.random() > 0.3 ? 'passed' : 'failed',
        result: Math.random() > 0.3 ? 'Connecté (45 Mbps)' : 'Pas de connexion',
        details: Math.random() > 0.3 ? 'Connexion stable, latence 12ms' : 'Vérifier câble réseau ou WiFi'
      },
      wifi: {
        status: 'passed',
        result: 'Connecté à "TechIle_Guest"',
        details: 'Signal fort (-42 dBm), vitesse 54 Mbps'
      },
      ethernet: {
        status: 'passed',
        result: '1 Gbps',
        details: 'Connexion filaire active et stable'
      },
      dns: {
        status: 'passed',
        result: '8.8.8.8, 8.8.4.4',
        details: 'Résolution DNS fonctionnelle (temps: 15ms)'
      },
      os: {
        status: 'passed',
        result: 'Windows 11 Pro (22H2)',
        details: 'Système à jour, aucun problème détecté'
      },
      updates: {
        status: 'warning',
        result: '3 mises à jour en attente',
        details: 'Mises à jour de sécurité disponibles, installation recommandée'
      },
      antivirus: {
        status: 'passed',
        result: 'Windows Defender actif',
        details: 'Protection en temps réel active, dernière analyse: hier'
      },
      drivers: {
        status: 'warning',
        result: '2 pilotes obsolètes',
        details: 'Pilote graphique et audio à mettre à jour'
      },
      boot: {
        status: 'passed',
        result: '28 secondes',
        details: 'Temps de démarrage normal pour ce type de système'
      },
      responsiveness: {
        status: 'warning',
        result: 'Ralentissements détectés',
        details: 'Système parfois lent, possiblement dû à la mémoire saturée'
      },
      temperature: {
        status: 'passed',
        result: 'CPU: 45°C, GPU: 52°C',
        details: 'Températures normales, ventilation efficace'
      }
    };

    return testResults[testId] || { status: 'passed', result: 'Test réussi', details: 'Aucun problème détecté' };
  };

  const runAllTests = async () => {
    const filteredTests = diagnosticTests.filter(test => test.category === selectedCategory);
    
    for (const test of filteredTests) {
      await runTest(test.id);
      // Petit délai entre les tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const generateReport = () => {
    const completedTests = diagnosticTests.filter(test => test.status !== 'pending' && test.status !== 'running');
    const passedTests = completedTests.filter(test => test.status === 'passed');
    const warningTests = completedTests.filter(test => test.status === 'warning');
    const failedTests = completedTests.filter(test => test.status === 'failed');

    const report = `
=== RAPPORT DE DIAGNOSTIC TECHNIQUE ===
Ticket: ${ticket.title}
Date: ${new Date().toLocaleString('fr-CA')}

RÉSUMÉ:
- Tests effectués: ${completedTests.length}
- Tests réussis: ${passedTests.length}
- Avertissements: ${warningTests.length}
- Tests échoués: ${failedTests.length}

DÉTAILS DES TESTS:
${completedTests.map(test => `
${test.name}: ${test.status.toUpperCase()}
Résultat: ${test.result}
Détails: ${test.details}
`).join('')}

RECOMMANDATIONS:
${warningTests.length > 0 ? warningTests.map(test => `- ${test.details}`).join('\n') : '- Aucune action requise'}
${failedTests.length > 0 ? failedTests.map(test => `- URGENT: ${test.details}`).join('\n') : ''}

NOTES TECHNICIEN:
${customNotes}

=== FIN DU RAPPORT ===
    `.trim();

    onSaveResults(report);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'running':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>;
      default:
        return <Info className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTests = diagnosticTests.filter(test => test.category === selectedCategory);
  const completedTests = diagnosticTests.filter(test => test.status !== 'pending' && test.status !== 'running');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Diagnostic technique</h3>
        <div className="flex space-x-2">
          <Button onClick={runAllTests} disabled={filteredTests.some(t => t.status === 'running')}>
            <Play className="h-4 w-4 mr-2" />
            Lancer tous les tests
          </Button>
          {completedTests.length > 0 && (
            <Button onClick={generateReport} variant="outline">
              <Save className="h-4 w-4 mr-2" />
              Générer rapport
            </Button>
          )}
        </div>
      </div>

      {/* Category Selection */}
      <div className="flex space-x-2">
        {categories.map((category) => {
          const CategoryIcon = category.icon;
          const categoryTests = diagnosticTests.filter(t => t.category === category.id);
          const completedInCategory = categoryTests.filter(t => t.status !== 'pending' && t.status !== 'running').length;
          
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center space-x-2"
            >
              <CategoryIcon className="h-4 w-4" />
              <span>{category.name}</span>
              <Badge variant="secondary" className="ml-2">
                {completedInCategory}/{categoryTests.length}
              </Badge>
            </Button>
          );
        })}
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTests.map((test) => {
          const TestIcon = test.icon;
          return (
            <Card key={test.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <TestIcon className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium">{test.name}</h4>
                  </div>
                  <Badge className={getStatusColor(test.status)}>
                    {getStatusIcon(test.status)}
                    <span className="ml-1">{test.status}</span>
                  </Badge>
                </div>
                
                {test.result && (
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Résultat:</span>
                      <p className="text-sm text-gray-600">{test.result}</p>
                    </div>
                    {test.details && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Détails:</span>
                        <p className="text-sm text-gray-600">{test.details}</p>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="mt-3">
                  <Button
                    size="sm"
                    onClick={() => runTest(test.id)}
                    disabled={test.status === 'running'}
                    className="w-full"
                  >
                    {test.status === 'running' ? 'Test en cours...' : 'Lancer le test'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Custom Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes personnalisées</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            placeholder="Ajoutez vos observations personnelles, problèmes spécifiques détectés, solutions appliquées..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Summary */}
      {completedTests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Résumé du diagnostic</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {diagnosticTests.filter(t => t.status === 'passed').length}
                </div>
                <div className="text-sm text-green-700">Tests réussis</div>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {diagnosticTests.filter(t => t.status === 'warning').length}
                </div>
                <div className="text-sm text-yellow-700">Avertissements</div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {diagnosticTests.filter(t => t.status === 'failed').length}
                </div>
                <div className="text-sm text-red-700">Tests échoués</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}