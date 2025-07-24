'use client';

import { ServiceTicket, Client } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, 
  Clock, 
  Phone,
  Navigation,
  CheckCircle,
  User,
  Calendar,
  Play,
  Pause,
  Wrench,
  FileText,
  Camera
} from 'lucide-react';

interface InterventionCardProps {
  ticket: ServiceTicket;
  client?: Client;
  onStartIntervention: (ticket: ServiceTicket) => void;
  onOpenDetails: (ticket: ServiceTicket) => void;
  isTimerActive: boolean;
}

export default function InterventionCard({ 
  ticket, 
  client, 
  onStartIntervention, 
  onOpenDetails,
  isTimerActive 
}: InterventionCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
      case 'in_progress':
        return <Wrench className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const openGoogleMaps = () => {
    const address = ticket.location || `${client?.address}, ${client?.city}`;
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  const callClient = () => {
    if (client?.phone) {
      window.open(`tel:${client.phone}`, '_self');
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <h3 className="font-semibold text-lg">{ticket.title}</h3>
            <Badge className={`${getStatusColor(ticket.status)} flex items-center`}>
              {getStatusIcon(ticket.status)}
              <span className="ml-1">{ticket.status}</span>
            </Badge>
            <Badge variant="outline">{ticket.priority}</Badge>
          </div>
          <div className="flex items-center space-x-2">
            {ticket.status === 'open' && (
              <Button
                size="sm"
                onClick={() => onStartIntervention(ticket)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Démarrer
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenDetails(ticket)}
            >
              <Wrench className="h-4 w-4 mr-2" />
              Intervenir
            </Button>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">{ticket.description}</p>
          
          {/* Client Info */}
          {client && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="flex items-center mb-2">
                  <User className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="font-medium">{client.firstName} {client.lastName}</span>
                </div>
                <div className="flex items-center mb-2">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  <button 
                    onClick={callClient}
                    className="text-blue-600 hover:underline"
                  >
                    {client.phone}
                  </button>
                </div>
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">
                    {ticket.location || `${client.address}, ${client.city}`}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">
                    {ticket.scheduledDate?.toLocaleTimeString('fr-CA', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Progress */}
        {ticket.workflowSteps && ticket.workflowSteps.length > 0 && (
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span>Progression: {ticket.completionPercentage || 0}%</span>
              <span>
                {ticket.workflowSteps.filter(s => s.completed).length} / {ticket.workflowSteps.length} étapes
              </span>
            </div>
            <Progress value={ticket.completionPercentage || 0} className="h-2" />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={openGoogleMaps}
          >
            <Navigation className="h-4 w-4 mr-1" />
            Navigation
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={callClient}
          >
            <Phone className="h-4 w-4 mr-1" />
            Appeler
          </Button>
          <Button variant="outline" size="sm">
            <Camera className="h-4 w-4 mr-1" />
            Photos
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-1" />
            Rapport
          </Button>
        </div>

        {/* Internal Notes */}
        {ticket.internalNotes && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-1">Notes internes :</h4>
            <p className="text-sm text-yellow-700">{ticket.internalNotes}</p>
          </div>
        )}

        {/* Timer indicator */}
        {isTimerActive && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center text-blue-700">
              <Clock className="h-4 w-4 mr-2" />
              <span className="font-medium">Intervention en cours...</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}