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

export const createTicket = async (ticketData: Omit<ServiceTicket, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    if (!db) {
      return { id: null, error: 'Firebase not configured' };
    }
    
    const docData: any = {
      ...ticketData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    if (ticketData.scheduledDate) {
      docData.scheduledDate = Timestamp.fromDate(ticketData.scheduledDate);
    }
    
    if (ticketData.resolvedAt) {
      docData.resolvedAt = Timestamp.fromDate(ticketData.resolvedAt);
    }
    
    const docRef = await addDoc(collection(db, 'tickets'), docData);
    return { id: docRef.id, error: null };
  } catch (error: any) {
    return { id: null, error: error.message };
  }
};

export const updateTicket = async (ticketId: string, updates: Partial<ServiceTicket>) => {
  try {
    if (!db) {
      return { error: 'Firebase not configured' };
    }
    
    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.now(),
    };
    
    if (updates.scheduledDate) {
      updateData.scheduledDate = Timestamp.fromDate(updates.scheduledDate);
    }
    
    if (updates.resolvedAt) {
      updateData.resolvedAt = Timestamp.fromDate(updates.resolvedAt);
    }
    
    await updateDoc(doc(db, 'tickets', ticketId), updateData);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const getClientTickets = async (clientId: string) => {
  try {
    if (!db) {
      return { tickets: [], error: 'Firebase not configured' };
    }
    
    const q = query(
      collection(db, 'tickets'),
      where('clientId', '==', clientId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const tickets = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      scheduledDate: doc.data().scheduledDate?.toDate(),
      resolvedAt: doc.data().resolvedAt?.toDate(),
    })) as ServiceTicket[];
    
    return { tickets, error: null };
  } catch (error: any) {
    return { tickets: [], error: error.message };
  }
};