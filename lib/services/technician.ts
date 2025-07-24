import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ServiceTicket } from '@/lib/types';

export interface TechNote {
  id: string;
  ticketId: string;
  content: string;
  type: 'diagnostic' | 'intervention' | 'completion' | 'photo';
  timestamp: Date;
  location?: string;
}

export interface TechTimer {
  ticketId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
}

export const technicianService = {
  // Récupérer les tickets assignés au technicien
  async getAssignedTickets(): Promise<ServiceTicket[]> {
    if (!db) return [];
    
    try {
      const q = query(
        collection(db, 'tickets'),
        where('type', '==', 'intervention'),
        orderBy('scheduledDate', 'asc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        scheduledDate: doc.data().scheduledDate?.toDate(),
        resolvedAt: doc.data().resolvedAt?.toDate(),
      })) as ServiceTicket[];
    } catch (error) {
      console.error('Error fetching assigned tickets:', error);
      return [];
    }
  },

  // Démarrer une intervention
  async startIntervention(ticketId: string): Promise<void> {
    if (!db) return;
    
    try {
      await updateDoc(doc(db, 'tickets', ticketId), {
        status: 'in_progress',
        updatedAt: Timestamp.now(),
        interventionStarted: Timestamp.now()
      });
    } catch (error) {
      console.error('Error starting intervention:', error);
      throw error;
    }
  },

  // Ajouter une note technique
  async addTechNote(ticketId: string, content: string, type: TechNote['type'] = 'intervention'): Promise<void> {
    if (!db) return;
    
    try {
      await addDoc(collection(db, 'techNotes'), {
        ticketId,
        content,
        type,
        timestamp: Timestamp.now(),
        location: navigator.geolocation ? await this.getCurrentLocation() : null
      });
    } catch (error) {
      console.error('Error adding tech note:', error);
      throw error;
    }
  },

  // Mettre à jour une étape du workflow
  async updateWorkflowStep(ticketId: string, stepId: string, completed: boolean, notes?: string): Promise<void> {
    if (!db) return;
    
    try {
      const ticket = await this.getTicketById(ticketId);
      if (!ticket) return;

      const updatedSteps = ticket.workflowSteps?.map(step => 
        step.id === stepId 
          ? { 
              ...step, 
              completed, 
              completedAt: completed ? new Date() : undefined,
              notes: notes || step.notes 
            }
          : step
      ) || [];

      const completedCount = updatedSteps.filter(s => s.completed).length;
      const completionPercentage = Math.round((completedCount / updatedSteps.length) * 100);

      await updateDoc(doc(db, 'tickets', ticketId), {
        workflowSteps: updatedSteps.map(step => ({
          ...step,
          completedAt: step.completedAt ? Timestamp.fromDate(step.completedAt) : null
        })),
        completionPercentage,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating workflow step:', error);
      throw error;
    }
  },

  // Compléter une intervention
  async completeIntervention(ticketId: string, completionNotes: string, timeSpent: number): Promise<void> {
    if (!db) return;
    
    try {
      await updateDoc(doc(db, 'tickets', ticketId), {
        status: 'resolved',
        resolvedAt: Timestamp.now(),
        completionNotes,
        actualDuration: timeSpent,
        updatedAt: Timestamp.now()
      });

      // Ajouter une note de complétion
      await this.addTechNote(ticketId, completionNotes, 'completion');
    } catch (error) {
      console.error('Error completing intervention:', error);
      throw error;
    }
  },

  // Obtenir la position actuelle
  async getCurrentLocation(): Promise<string | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve(`${latitude},${longitude}`);
        },
        () => resolve(null),
        { timeout: 5000 }
      );
    });
  },

  // Récupérer un ticket par ID
  async getTicketById(ticketId: string): Promise<ServiceTicket | null> {
    if (!db) return null;
    
    try {
      const ticketsSnapshot = await getDocs(collection(db, 'tickets'));
      const ticket = ticketsSnapshot.docs.find(doc => doc.id === ticketId);
      
      if (!ticket) return null;
      
      return {
        id: ticket.id,
        ...ticket.data(),
        createdAt: ticket.data().createdAt?.toDate(),
        updatedAt: ticket.data().updatedAt?.toDate(),
        scheduledDate: ticket.data().scheduledDate?.toDate(),
        resolvedAt: ticket.data().resolvedAt?.toDate(),
      } as ServiceTicket;
    } catch (error) {
      console.error('Error fetching ticket:', error);
      return null;
    }
  },

  // Récupérer les notes d'un ticket
  async getTicketNotes(ticketId: string): Promise<TechNote[]> {
    if (!db) return [];
    
    try {
      const q = query(
        collection(db, 'techNotes'),
        where('ticketId', '==', ticketId),
        orderBy('timestamp', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
      })) as TechNote[];
    } catch (error) {
      console.error('Error fetching ticket notes:', error);
      return [];
    }
  }
};