'use client';

import { useState, useEffect } from 'react';
import { ServiceTicket, Client } from '@/lib/types';
import { technicianService, TechNote } from '@/lib/services/technician';
import { WorkflowStep } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  Clock, 
  User, 
  MapPin, 
  Phone,
  FileText,
  Camera,
  Save,
  Play,
  Pause,
  Timer,
  AlertTriangle
} from 'lucide-react';

interface InterventionDetailsProps {
  ticket: ServiceTicket;
  client?: Client;
  onClose: () => void;
  onComplete: (ticketId: string, notes: string, timeSpent: number) => void;
}

export default function InterventionDetails({ 
  ticket, 
  client, 
  onClose, 
  onComplete 
}: InterventionDetailsProps) {
  const [notes, setNotes] = useState<TechNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>(ticket.workflowSteps || []);
  const [completionNotes, setCompletionNotes] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    loadTicketNotes();
    initializeWorkflowSteps();
  }, [ticket.id]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isTimerRunning && startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, startTime]);

  const loadTicketNotes = async () => {
    try {
      const ticketNotes = await technicianService.getTicketNotes(ticket.id);
      setNotes(ticketNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const initializeWorkflowSteps = () => {
    // Créer des étapes par défaut selon le type d'intervention
    const defaultSteps: WorkflowStep[] = [
      {
        id: '1',
        title: 'Diagnostic initial',
        description: 'Évaluer le problème et identifier les causes',
        completed: false,
        required: true
      },
      {
        id: '2',
        title: 'Préparation du matériel',
        description: 'Rassembler les outils et pièces nécessaires',
        completed: false,
        required: true
      },
      {
        id: '3',
        title: 'Intervention technique',
        description: 'Effectuer les réparations ou installations',
        completed: false,
        required: true
      },
      {
        id: '4',
        title: 'Tests et vérifications',
        description: 'Vérifier le bon fonctionnement après intervention',
        completed: false,
        required: true
      },
      {
        id: '5',
        title: 'Nettoyage et rangement',
        description: 'Nettoyer l\'espace de travail et ranger le matériel',
        completed: false,
        required: false
      }
    ];
    setWorkflowSteps(ticket.workflowSteps || defaultSteps);
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      await technicianService.addTechNote(ticket.id, newNote, 'intervention');
      setNewNote('');
      await loadTicketNotes();
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const handleStepToggle = async (stepId: string, completed: boolean) => {
    try {
      await technicianService.updateWorkflowStep(ticket.id, stepId, completed);
      
      setWorkflowSteps(prev => prev.map(step => 
        step.id === stepId 
          ? { ...step, completed, completedAt: completed ? new Date() : undefined }
          : step
      ));
    } catch (error) {
      console.error('Error updating step:', error);
    }
  };

  const startTimer = () => {
    setStartTime(new Date());
    setIsTimerRunning(true);
    setElapsedTime(0);
  };

  const stopTimer = () => {
    setIsTimerRunning(false);
  };

  const handleCompleteIntervention = async () => {
    const timeSpentMinutes = Math.floor(elapsedTime / 60);
    
    try {
      await onComplete(ticket.id, completionNotes, timeSpentMinutes);
      onClose();
    } catch (error) {
      console.error('Error completing intervention:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const completedSteps = workflowSteps.filter(step => step.completed).length;
  const completionPercentage = workflowSteps.length > 0 ? Math.round((completedSteps / workflowSteps.length) * 100) : 0;
  const isInterventionComplete = completionPercentage === 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">{ticket.title}</h2>
              <p className="text-gray-600">{client?.firstName} {client?.lastName}</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Timer */}
              <div className="flex items-center space-x-2">
                {isTimerRunning ? (
                  <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
                    <Timer className="h-5 w-5 text-blue-600" />
                    <span className="font-mono text-blue-700">{formatTime(elapsedTime)}</span>
                    <Button size="sm" variant="outline" onClick={stopTimer}>
                      <Pause className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" onClick={startTimer}>
                    <Play className="h-4 w-4 mr-2" />
                    Démarrer chrono
                  </Button>
                )}
              </div>
              <Button variant="outline" onClick={onClose}>
                Fermer
              </Button>
            </div>
          </div>

          <Tabs defaultValue="workflow" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="workflow">Workflow</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="client">Client</TabsTrigger>
              <TabsTrigger value="completion">Finalisation</TabsTrigger>
            </TabsList>

            {/* Workflow Tab */}
            <TabsContent value="workflow">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Étapes d'intervention</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={completionPercentage} className="w-32" />
                      <span className="text-sm font-medium">{completionPercentage}%</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {workflowSteps.map((step) => (
                      <div key={step.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <Checkbox
                          checked={step.completed}
                          onCheckedChange={(checked) => handleStepToggle(step.id, checked as boolean)}
                          className="mt-1"
                        />
                        <div className="flex-1">
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
                          <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                          {step.completed && step.completedAt && (
                            <p className="text-xs text-green-600 mt-1">
                              Complété le {step.completedAt.toLocaleString('fr-CA')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes">
              <Card>
                <CardHeader>
                  <CardTitle>Notes d'intervention</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Add new note */}
                    <div className="space-y-2">
                      <Label htmlFor="newNote">Ajouter une note</Label>
                      <div className="flex space-x-2">
                        <Textarea
                          id="newNote"
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          placeholder="Décrivez ce que vous avez fait..."
                          rows={3}
                        />
                        <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                          <Save className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Existing notes */}
                    <div className="space-y-3">
                      {notes.map((note) => (
                        <div key={note.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline">{note.type}</Badge>
                            <span className="text-xs text-gray-500">
                              {note.timestamp.toLocaleString('fr-CA')}
                            </span>
                          </div>
                          <p className="text-sm">{note.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Client Tab */}
            <TabsContent value="client">
              <Card>
                <CardHeader>
                  <CardTitle>Informations client</CardTitle>
                </CardHeader>
                <CardContent>
                  {client && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Contact</h4>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-gray-500" />
                            <span>{client.firstName} {client.lastName}</span>
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-gray-500" />
                            <a href={`tel:${client.phone}`} className="text-blue-600 hover:underline">
                              {client.phone}
                            </a>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                            <span>{client.address}, {client.city}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3">Abonnement</h4>
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm text-gray-600">Plan: </span>
                            <Badge>{client.subscription.plan}</Badge>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Priorité: </span>
                            <Badge variant="outline">{client.priority}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Completion Tab */}
            <TabsContent value="completion">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Finalisation de l'intervention
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {!isInterventionComplete && (
                      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="flex items-center">
                          <AlertTriangle className="h-5 w-5 text-amber-600 mr-2" />
                          <span className="text-amber-800">
                            Toutes les étapes obligatoires doivent être complétées avant de finaliser l'intervention.
                          </span>
                        </div>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="completionNotes">Notes de finalisation</Label>
                      <Textarea
                        id="completionNotes"
                        value={completionNotes}
                        onChange={(e) => setCompletionNotes(e.target.value)}
                        placeholder="Résumé de l'intervention, problèmes résolus, recommandations..."
                        rows={5}
                      />
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">Résumé</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Temps passé: </span>
                          <span className="font-medium">{formatTime(elapsedTime)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Étapes complétées: </span>
                          <span className="font-medium">{completedSteps}/{workflowSteps.length}</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleCompleteIntervention}
                      disabled={!isInterventionComplete || !completionNotes.trim()}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Finaliser l'intervention
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}