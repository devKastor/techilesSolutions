'use client';

import { useState, useRef } from 'react';
import { ServiceTicket } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Camera, 
  Mic,
  Save,
  Clock,
  MapPin,
  AlertTriangle,
  Info,
  CheckCircle,
  Upload
} from 'lucide-react';

interface TechNoteCaptureProps {
  ticket: ServiceTicket;
  onAddNote: (ticketId: string, note: string) => void;
}

interface TechNote {
  id: string;
  content: string;
  type: 'diagnostic' | 'intervention' | 'completion' | 'photo' | 'issue' | 'solution';
  timestamp: Date;
  location?: string;
  attachments?: string[];
}

export default function TechNoteCapture({ ticket, onAddNote }: TechNoteCaptureProps) {
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState<TechNote['type']>('intervention');
  const [isRecording, setIsRecording] = useState(false);
  const [savedNotes, setSavedNotes] = useState<TechNote[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const noteTypes = [
    { value: 'diagnostic', label: 'Diagnostic', icon: FileText, color: 'bg-blue-100 text-blue-800' },
    { value: 'intervention', label: 'Intervention', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
    { value: 'issue', label: 'Problème', icon: AlertTriangle, color: 'bg-red-100 text-red-800' },
    { value: 'solution', label: 'Solution', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
    { value: 'photo', label: 'Photo', icon: Camera, color: 'bg-purple-100 text-purple-800' },
    { value: 'completion', label: 'Finalisation', icon: FileText, color: 'bg-gray-100 text-gray-800' },
  ];

  const quickNotes = [
    'Diagnostic effectué - système fonctionnel',
    'Redémarrage nécessaire après intervention',
    'Mise à jour des pilotes effectuée',
    'Configuration réseau modifiée',
    'Sauvegarde des données réalisée',
    'Formation client dispensée',
    'Problème résolu - tests validés',
    'Maintenance préventive recommandée'
  ];

  const handleSaveNote = async () => {
    if (!newNote.trim()) return;

    const timestamp = new Date().toLocaleString('fr-CA');
    const location = (await getCurrentLocation()) ?? undefined;
    
    const formattedNote = `[${timestamp}] [${noteType.toUpperCase()}] ${newNote}${location ? ` (Position: ${location})` : ''}`;
    
    // Sauvegarder localement pour l'affichage
    const note: TechNote = {
      id: Date.now().toString(),
      content: newNote,
      type: noteType,
      timestamp: new Date(),
      location
    };
    setSavedNotes(prev => [note, ...prev]);

    // Envoyer au parent
    onAddNote(ticket.id, formattedNote);
    
    setNewNote('');
  };

  const handleQuickNote = (note: string) => {
    setNewNote(note);
  };

  const handlePhotoCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const timestamp = new Date().toLocaleString('fr-CA');
      const photoNote = `[${timestamp}] [PHOTO] Photo ajoutée: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
      onAddNote(ticket.id, photoNote);
      
      // Ajouter à l'affichage local
      const note: TechNote = {
        id: Date.now().toString(),
        content: `Photo ajoutée: ${file.name}`,
        type: 'photo',
        timestamp: new Date(),
        attachments: [file.name]
      };
      setSavedNotes(prev => [note, ...prev]);
    });
  };

  const startVoiceRecording = () => {
    setIsRecording(true);
    // Simulation d'enregistrement vocal
    setTimeout(() => {
      setIsRecording(false);
      setNewNote(prev => prev + ' [Note vocale transcrite automatiquement]');
    }, 3000);
  };

  const getCurrentLocation = (): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        },
        () => resolve(null),
        { timeout: 5000 }
      );
    });
  };

  const getTypeIcon = (type: string) => {
    const noteType = noteTypes.find(nt => nt.value === type);
    if (!noteType) return FileText;
    return noteType.icon;
  };

  const getTypeColor = (type: string) => {
    const noteType = noteTypes.find(nt => nt.value === type);
    return noteType?.color || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Note Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Ajouter une note
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Type Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Type de note:</label>
            <Select value={noteType} onValueChange={(value: any) => setNoteType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {noteTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center">
                        <Icon className="h-4 w-4 mr-2" />
                        {type.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Note Content */}
          <div>
            <label className="text-sm font-medium mb-2 block">Contenu:</label>
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Décrivez ce que vous avez fait, observé ou découvert..."
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePhotoCapture}
              >
                <Camera className="h-4 w-4 mr-1" />
                Photo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={startVoiceRecording}
                disabled={isRecording}
              >
                <Mic className={`h-4 w-4 mr-1 ${isRecording ? 'text-red-500' : ''}`} />
                {isRecording ? 'Enregistrement...' : 'Vocal'}
              </Button>
            </div>
            <Button onClick={handleSaveNote} disabled={!newNote.trim()}>
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Quick Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {quickNotes.map((note, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleQuickNote(note)}
                className="text-left justify-start h-auto p-3"
              >
                <span className="text-sm">{note}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Saved Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Notes de cette session</span>
            <Badge variant="outline">{savedNotes.length} notes</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {savedNotes.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Aucune note ajoutée pour cette session
              </p>
            ) : (
              savedNotes.map((note) => {
                const Icon = getTypeIcon(note.type);
                return (
                  <div key={note.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4" />
                        <Badge className={getTypeColor(note.type)}>
                          {note.type}
                        </Badge>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {note.timestamp.toLocaleTimeString('fr-CA')}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{note.content}</p>
                    {note.location && (
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        Position enregistrée
                      </div>
                    )}
                    {note.attachments && note.attachments.length > 0 && (
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Upload className="h-3 w-3 mr-1" />
                        {note.attachments.length} fichier(s) joint(s)
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Session Summary */}
      {savedNotes.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-blue-800">
                <Info className="h-5 w-5 mr-2" />
                <span className="font-medium">
                  {savedNotes.length} note(s) ajoutée(s) cette session
                </span>
              </div>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Exporter notes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}