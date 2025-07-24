'use client';

import { useState } from 'react';
import { ServiceTicket } from '@/lib/types';
import { WorkflowStep } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  Clock, 
  Play,
  Pause,
  Timer,
  AlertTriangle,
  FileText,
  Camera,
  Wrench
} from 'lucide-react';

interface TechWorkflowTrackerProps {
  ticket: ServiceTicket;
  onUpdateStep: (ticketId: string, stepId: string, updates: Partial<WorkflowStep>) => void;
  onStartTimer: () => void;
  onStopTimer: () => void;
  isTimerActive: boolean;
  elapsedTime: number;
}

export default function TechWorkflowTracker({ 
  ticket, 
  onUpdateStep, 
  onStartTimer, 
  onStopTimer, 
  isTimerActive, 
  elapsedTime 
}: TechWorkflowTrackerProps) {
  const [stepNotes, setStepNotes] = useState<{ [key: string]: string }>({});
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  // Étapes par défaut si aucune n'est définie
  const defaultSteps: WorkflowStep[] = [
    {
      id: '1',
      title: 'Arrivée sur site',
      description: 'Confirmer l\'arrivée, contacter le client, évaluer l\'environnement',
      completed: false,
      required: true
    },
    {
      id: '2',
      title: 'Diagnostic initial',
      description: 'Identifier le problème, tester les composants, documenter l\'état actuel',
      completed: false,
      required: true
    },
    {
      id: '3',
      title: 'Préparation intervention',
      description: 'Rassembler outils nécessaires, préparer espace de travail, sauvegarder données si nécessaire',
      completed: false,
      required: true
    },
    {
      id: '4',
      title: 'Intervention technique',
      description: 'Effectuer réparations, installations ou configurations selon le besoin',
      completed: false,
      required: true
    },
    {
      id: '5',
      title: 'Tests et validation',
      description: 'Vérifier fonctionnement, tester toutes les fonctionnalités, valider avec client',
      completed: false,
      required: true
    },
    {
      id: '6',
      title: 'Documentation',
      description: 'Prendre photos, documenter changements, préparer rapport client',
      completed: false,
      required: false
    },
    {
      id: '7',
      title: 'Formation client',
      description: 'Expliquer changements, former sur nouvelles fonctionnalités, donner conseils',
      completed: false,
      required: false
    },
    {
      id: '8',
      title: 'Nettoyage et finalisation',
      description: 'Nettoyer espace travail, ranger outils, finaliser documentation',
      completed: false,
      required: true
    }
  ];

  const workflowSteps = ticket.workflowSteps && ticket.workflowSteps.length > 0 
    ? ticket.workflowSteps 
    : defaultSteps;

  const handleStepToggle = (stepId: string, completed: boolean) => {
    const step = workflowSteps.find(s => s.id === stepId);
    if (!step) return;

    const updates: Partial<WorkflowStep> = {
      completed,
      completedAt: completed ? new Date() : undefined,
      notes: stepNotes[stepId] || step.notes
    };

    onUpdateStep(ticket.id, stepId, updates);
    
    // Clear notes after saving
    if (completed) {
      setStepNotes(prev => ({ ...prev, [stepId]: '' }));
    }
  };

  const handleAddStepNote = (stepId: string) => {
    const note = stepNotes[stepId];
    if (!note?.trim()) return;

    const step = workflowSteps.find(s => s.id === stepId);
    if (!step) return;

    const existingNotes = step.notes || '';
    const timestamp = new Date().toLocaleString('fr-CA');
    const newNotes = existingNotes 
      ? `${existingNotes}\n\n[${timestamp}] ${note}`
      : `[${timestamp}] ${note}`;

    onUpdateStep(ticket.id, stepId, { notes: newNotes });
    setStepNotes(prev => ({ ...prev, [stepId]: '' }));
  };

  const formatElapsedTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const completedSteps = workflowSteps.filter(step => step.completed).length;
  const totalSteps = workflowSteps.length;
  const completionPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const requiredSteps = workflowSteps.filter(step => step.required);
  const completedRequiredSteps = requiredSteps.filter(step => step.completed).length;

  return (
    <div className="space-y-6">
      {/* Header avec timer */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Workflow d'intervention</h3>
          <p className="text-sm text-gray-600">
            {completedSteps}/{totalSteps} étapes complétées 
            ({completedRequiredSteps}/{requiredSteps.length} obligatoires)
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Timer */}
          <div className="flex items-center space-x-2">
            {isTimerActive ? (
              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                <Timer className="h-5 w-5 text-blue-600" />
                <span className="font-mono text-blue-700">{formatElapsedTime(elapsedTime)}</span>
                <Button size="sm" variant="outline" onClick={onStopTimer}>
                  <Pause className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button size="sm" onClick={onStartTimer}>
                <Play className="h-4 w-4 mr-2" />
                Démarrer chrono
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progression globale</span>
              <span>{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-3" />
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Étapes obligatoires: {completedRequiredSteps}/{requiredSteps.length}</span>
              <span>Temps écoulé: {formatElapsedTime(elapsedTime)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Steps */}
      <div className="space-y-4">
        {workflowSteps.map((step, index) => (
          <Card key={step.id} className={`transition-all ${step.completed ? 'bg-green-50 border-green-200' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="flex items-center space-x-2 mt-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    step.completed 
                      ? 'bg-green-600 text-white' 
                      : index === completedSteps 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step.completed ? <CheckCircle className="h-4 w-4" /> : index + 1}
                  </div>
                  <Checkbox
                    checked={step.completed}
                    onCheckedChange={(checked) => handleStepToggle(step.id, checked as boolean)}
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h4 className={`font-medium ${step.completed ? 'line-through text-gray-500' : ''}`}>
                        {step.title}
                      </h4>
                      {step.required && (
                        <Badge variant="outline" className="text-xs">
                          Obligatoire
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                  
                  {step.completed && step.completedAt && (
                    <div className="flex items-center text-xs text-green-600 mb-2">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Complété le {step.completedAt.toLocaleString('fr-CA')}
                    </div>
                  )}

                  {/* Expanded section */}
                  {expandedStep === step.id && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-3">
                      {/* Add note */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Ajouter une note:</label>
                        <div className="flex space-x-2">
                          <Textarea
                            value={stepNotes[step.id] || ''}
                            onChange={(e) => setStepNotes(prev => ({ ...prev, [step.id]: e.target.value }))}
                            placeholder="Détails de cette étape..."
                            rows={2}
                            className="flex-1"
                          />
                          <Button 
                            onClick={() => handleAddStepNote(step.id)}
                            disabled={!stepNotes[step.id]?.trim()}
                          >
                            Ajouter
                          </Button>
                        </div>
                      </div>

                      {/* Existing notes */}
                      {step.notes && (
                        <div className="space-y-1">
                          <label className="text-sm font-medium">Notes existantes:</label>
                          <div className="text-sm text-gray-700 whitespace-pre-wrap bg-white p-2 rounded border">
                            {step.notes}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wrench className="h-5 w-5 mr-2" />
            Actions rapides
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" size="sm" className="h-16 flex flex-col">
              <Camera className="h-5 w-5 mb-1" />
              <span className="text-xs">Photo avant</span>
            </Button>
            <Button variant="outline" size="sm" className="h-16 flex flex-col">
              <Camera className="h-5 w-5 mb-1" />
              <span className="text-xs">Photo après</span>
            </Button>
            <Button variant="outline" size="sm" className="h-16 flex flex-col">
              <FileText className="h-5 w-5 mb-1" />
              <span className="text-xs">Note rapide</span>
            </Button>
            <Button variant="outline" size="sm" className="h-16 flex flex-col">
              <AlertTriangle className="h-5 w-5 mb-1" />
              <span className="text-xs">Problème</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Completion Status */}
      {completionPercentage === 100 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center text-green-800">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">
                Toutes les étapes sont complétées ! L'intervention peut être finalisée.
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}