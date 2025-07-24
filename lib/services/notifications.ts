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

export interface Notification {
  id: string;
  userId: string;
  type: 'ticket_update' | 'invoice_due' | 'payment_received' | 'system' | 'intervention_scheduled';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
  readAt?: Date;
}

export const notificationService = {
  // Créer une notification
  async createNotification(notificationData: Omit<Notification, 'id' | 'createdAt' | 'read'>) {
    try {
      if (!db) {
        return { notificationId: null, error: 'Firebase not configured' };
      }

      const docRef = await addDoc(collection(db, 'notifications'), {
        ...notificationData,
        read: false,
        createdAt: Timestamp.now()
      });

      return { notificationId: docRef.id, error: null };
    } catch (error: any) {
      return { notificationId: null, error: error.message };
    }
  },

  // Obtenir les notifications d'un utilisateur
  async getUserNotifications(userId: string, limit: number = 20) {
    try {
      if (!db) {
        return { notifications: [], error: 'Firebase not configured' };
      }

      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const notifications = snapshot.docs.slice(0, limit).map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        readAt: doc.data().readAt?.toDate(),
      })) as Notification[];

      return { notifications, error: null };
    } catch (error: any) {
      return { notifications: [], error: error.message };
    }
  },

  // Marquer une notification comme lue
  async markAsRead(notificationId: string) {
    try {
      if (!db) {
        return { error: 'Firebase not configured' };
      }

      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true,
        readAt: Timestamp.now()
      });

      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // Notifications automatiques pour les tickets
  async notifyTicketUpdate(ticketId: string, clientId: string, status: string, title: string) {
    const statusMessages = {
      'in_progress': 'Votre intervention a été démarrée',
      'resolved': 'Votre intervention a été résolue',
      'closed': 'Votre ticket a été fermé'
    };

    const message = statusMessages[status as keyof typeof statusMessages] || 'Votre ticket a été mis à jour';

    return await this.createNotification({
      userId: clientId,
      type: 'ticket_update',
      title: `Mise à jour - ${title}`,
      message,
      actionUrl: `/client/tickets`
    });
  },

  // Notification de facture due
  async notifyInvoiceDue(clientId: string, invoiceNumber: string, amount: number, dueDate: Date) {
    return await this.createNotification({
      userId: clientId,
      type: 'invoice_due',
      title: 'Facture à payer',
      message: `Votre facture ${invoiceNumber} de ${amount.toFixed(2)}$ est due le ${dueDate.toLocaleDateString('fr-CA')}`,
      actionUrl: `/client/invoices`
    });
  },

  // Notification de paiement reçu
  async notifyPaymentReceived(clientId: string, invoiceNumber: string, amount: number) {
    return await this.createNotification({
      userId: clientId,
      type: 'payment_received',
      title: 'Paiement confirmé',
      message: `Votre paiement de ${amount.toFixed(2)}$ pour la facture ${invoiceNumber} a été reçu`,
      actionUrl: `/client/invoices`
    });
  },

  // Notification d'intervention programmée
  async notifyInterventionScheduled(clientId: string, ticketTitle: string, scheduledDate: Date) {
    return await this.createNotification({
      userId: clientId,
      type: 'intervention_scheduled',
      title: 'Intervention programmée',
      message: `Votre intervention "${ticketTitle}" est programmée le ${scheduledDate.toLocaleDateString('fr-CA')} à ${scheduledDate.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}`,
      actionUrl: `/client/tickets`
    });
  }
};