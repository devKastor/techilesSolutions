'use client';

import { ServiceTicket } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone,
  Mail,
  FileText,
  AlertTriangle,
  Info,
  Wrench
} from 'lucide-react';

interface TechTicketDetailsProps {
  ticket: ServiceTicket;
}

export default function TechTicketDetails({ ticket }: TechTicketDetailsProps) {
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Ticket Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Détails du ticket
            </span>
            <div className="flex space-x-2">
              <Badge className={getStatusColor(ticket.status)}>
                {ticket.status}
              </Badge>
              <Badge className={getPriorityColor(ticket.priority)}>
                {ticket.priority}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">{ticket.title}</h3>
            <p className="text-gray-600 mt-1">{ticket.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                <div>
                  <span className="text-sm text-gray-600">Créé le:</span>
                  <p className="font-medium">{ticket.createdAt?.toLocaleString('fr-CA')}</p>
                </div>
              </div>
              
              {ticket.scheduledDate && (
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  <div>
                    <span className="text-sm text-gray-600">Programmé:</span>
                    <p className="font-medium">{ticket.scheduledDate.toLocaleString('fr-CA')}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center">
                <Wrench className="h-4 w-4 mr-2 text-gray-500" />
                <div>
                  <span className="text-sm text-gray-600">Type:</span>
                  <p className="font-medium capitalize">{ticket.type}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {ticket.estimatedDuration && (
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  <div>
                    <span className="text-sm text-gray-600">Durée estimée:</span>
                    <p className="font-medium">{ticket.estimatedDuration} minutes</p>
                  </div>
                </div>
              )}

              {ticket.actualDuration && (
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  <div>
                    <span className="text-sm text-gray-600">Temps passé:</span>
                    <p className="font-medium">{ticket.actualDuration} minutes</p>
                  </div>
                </div>
              )}

              {ticket.location && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                  <div>
                    <span className="text-sm text-gray-600">Lieu:</span>
                    <p className="font-medium">{ticket.location}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Internal Notes */}
      {ticket.internalNotes && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-800">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Notes internes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700 whitespace-pre-wrap">{ticket.internalNotes}</p>
          </CardContent>
        </Card>
      )}

      {/* Client Notes */}
      {ticket.clientNotes && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800">
              <Info className="h-5 w-5 mr-2" />
              Notes du client
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700 whitespace-pre-wrap">{ticket.clientNotes}</p>
          </CardContent>
        </Card>
      )}

      {/* Attachments */}
      {ticket.attachments && ticket.attachments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Pièces jointes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ticket.attachments.map((attachment, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{attachment}</span>
                  <button className="text-blue-600 hover:underline text-sm">
                    Télécharger
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Chronologie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <div>
                <p className="font-medium">Ticket créé</p>
                <p className="text-sm text-gray-600">{ticket.createdAt?.toLocaleString('fr-CA')}</p>
              </div>
            </div>
            
            {ticket.interventionStarted && (
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                <div>
                  <p className="font-medium">Intervention démarrée</p>
                  <p className="text-sm text-gray-600">{ticket.interventionStarted.toLocaleString('fr-CA')}</p>
                </div>
              </div>
            )}
            
            {ticket.resolvedAt && (
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <div>
                  <p className="font-medium">Ticket résolu</p>
                  <p className="text-sm text-gray-600">{ticket.resolvedAt.toLocaleString('fr-CA')}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Completion Notes */}
      {ticket.completionNotes && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800">
              <FileText className="h-5 w-5 mr-2" />
              Notes de finalisation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700 whitespace-pre-wrap">{ticket.completionNotes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}