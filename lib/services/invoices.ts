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
import { Invoice } from '@/lib/types';

export const createInvoice = async (invoiceData: Omit<Invoice, 'id' | 'createdAt'>) => {
  try {
    if (!db) {
      return { id: null, error: 'Firebase not configured' };
    }
    
    const docRef = await addDoc(collection(db, 'invoices'), {
      ...invoiceData,
      dueDate: Timestamp.fromDate(invoiceData.dueDate),
      paidAt: invoiceData.paidAt ? Timestamp.fromDate(invoiceData.paidAt) : null,
      sentAt: invoiceData.sentAt ? Timestamp.fromDate(invoiceData.sentAt) : null,
      createdAt: Timestamp.now(),
    });
    return { id: docRef.id, error: null };
  } catch (error: any) {
    return { id: null, error: error.message };
  }
};

export const updateInvoice = async (invoiceId: string, updates: Partial<Invoice>) => {
  try {
    if (!db) {
      return { error: 'Firebase not configured' };
    }
    
    const updateData: any = { ...updates };
    
    if (updates.dueDate) {
      updateData.dueDate = Timestamp.fromDate(updates.dueDate);
    }
    if (updates.paidAt) {
      updateData.paidAt = Timestamp.fromDate(updates.paidAt);
    }
    if (updates.sentAt) {
      updateData.sentAt = Timestamp.fromDate(updates.sentAt);
    }
    
    await updateDoc(doc(db, 'invoices', invoiceId), updateData);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const getClientInvoices = async (clientId: string) => {
  try {
    if (!db) {
      return { invoices: [], error: 'Firebase not configured' };
    }
    
    const q = query(
      collection(db, 'invoices'),
      where('clientId', '==', clientId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const invoices = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dueDate: doc.data().dueDate?.toDate(),
      paidAt: doc.data().paidAt?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      sentAt: doc.data().sentAt?.toDate(),
    })) as Invoice[];
    
    return { invoices, error: null };
  } catch (error: any) {
    return { invoices: [], error: error.message };
  }
};

export const getAllInvoices = async () => {
  try {
    if (!db) {
      return { invoices: [], error: 'Firebase not configured' };
    }
    
    const q = query(collection(db, 'invoices'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const invoices = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dueDate: doc.data().dueDate?.toDate(),
      paidAt: doc.data().paidAt?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      sentAt: doc.data().sentAt?.toDate(),
    })) as Invoice[];
    
    return { invoices, error: null };
  } catch (error: any) {
    return { invoices: [], error: error.message };
  }
};