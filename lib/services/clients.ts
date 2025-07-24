import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  getDoc,
  query, 
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Client } from '@/lib/types';

export const createClient = async (clientData: Omit<Client, 'id' | 'createdAt'>) => {
  try {
    if (!db) {
      return { id: null, error: 'Firebase not configured' };
    }
    
    const docRef = await addDoc(collection(db, 'clients'), {
      ...clientData,
      subscription: {
        ...clientData.subscription,
        currentPeriodStart: Timestamp.fromDate(clientData.subscription.currentPeriodStart),
        currentPeriodEnd: Timestamp.fromDate(clientData.subscription.currentPeriodEnd),
      },
      lastActivity: clientData.lastActivity ? Timestamp.fromDate(clientData.lastActivity) : null,
      createdAt: Timestamp.now(),
    });
    return { id: docRef.id, error: null };
  } catch (error: any) {
    return { id: null, error: error.message };
  }
};

export const updateClient = async (clientId: string, updates: Partial<Client>) => {
  try {
    if (!db) {
      return { error: 'Firebase not configured' };
    }
    
    const updateData: any = { ...updates };
    
    if (updates.subscription) {
      updateData.subscription = {
        ...updates.subscription,
        currentPeriodStart: Timestamp.fromDate(updates.subscription.currentPeriodStart),
        currentPeriodEnd: Timestamp.fromDate(updates.subscription.currentPeriodEnd),
      };
    }
    
    if (updates.lastActivity) {
      updateData.lastActivity = Timestamp.fromDate(updates.lastActivity);
    }
    
    await updateDoc(doc(db, 'clients', clientId), updateData);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const getClientByEmail = async (email: string) => {
  try {
    if (!db) {
      return { client: null, error: 'Firebase not configured' };
    }
    
    const q = query(collection(db, 'clients'), where('email', '==', email));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return { client: null, error: null };
    }
    
    const doc = snapshot.docs[0];
    const client = {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      lastActivity: doc.data().lastActivity?.toDate(),
      subscription: {
        ...doc.data().subscription,
        currentPeriodStart: doc.data().subscription?.currentPeriodStart?.toDate(),
        currentPeriodEnd: doc.data().subscription?.currentPeriodEnd?.toDate(),
      }
    } as Client;
    
    return { client, error: null };
  } catch (error: any) {
    return { client: null, error: error.message };
  }
};

export const getAllClients = async () => {
  try {
    if (!db) {
      return { clients: [], error: 'Firebase not configured' };
    }
    
    const snapshot = await getDocs(collection(db, 'clients'));
    const clients = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      lastActivity: doc.data().lastActivity?.toDate(),
      subscription: {
        ...doc.data().subscription,
        currentPeriodStart: doc.data().subscription?.currentPeriodStart?.toDate(),
        currentPeriodEnd: doc.data().subscription?.currentPeriodEnd?.toDate(),
      }
    })) as Client[];
    
    return { clients, error: null };
  } catch (error: any) {
    return { clients: [], error: error.message };
  }
};