import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from './types';
import { createClient } from './services/clients';

export const signIn = async (email: string, password: string) => {
  if (!auth) {
    return { user: null, error: 'Firebase not configured. Please set up your Firebase project.' };
  }
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    let user = await getUserData(userCredential.user.uid);
    
    // Si l'utilisateur n'existe pas dans Firestore mais existe dans Auth, créer le document
    if (!user && db) {
      const userData: User = {
        id: userCredential.user.uid,
        email: userCredential.user.email || '',
        role: email === 'dev@kastor.ca' ? 'admin_technician' : 'client',
        createdAt: new Date(),
      };
      
      try {
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          ...userData,
          createdAt: Timestamp.fromDate(userData.createdAt),
        });
        user = userData;
      } catch (firestoreError) {
        console.warn('Could not create user document in Firestore during sign-in');
        user = userData;
      }
    }
    
    return { user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
  if (!auth || !db) {
    return { user: null, error: 'Firebase not configured. Please set up your Firebase project.' };
  }
  
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userRole = email === 'dev@kastor.ca' ? 'admin_technician' : 'client';
    
    const userData: User = {
      id: userCredential.user.uid,
      email,
      role: userRole,
      createdAt: new Date(),
    };
    
    try {
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        ...userData,
        createdAt: Timestamp.fromDate(userData.createdAt),
      });
    } catch (firestoreError: any) {
      console.warn('Could not create user document in Firestore:', firestoreError.message);
    }

    // Si c'est un client, créer automatiquement le profil client
    if (userRole === 'client') {
      const clientData = {
        email,
        firstName,
        lastName,
        phone: '',
        address: '',
        city: '',
        province: 'QC',
        postalCode: '',
        isInIslands: true,
        cloudQuota: 50,
        cloudUsed: 0,
        internalNotes: '',
        priority: 'normal' as const,
        status: 'active' as const,
        subscription: {
          plan: 'base' as const,
          price: 25,
          billingCycle: 'monthly' as const,
          status: 'active' as const,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        }
      };
      
      const { error: clientError } = await createClient(clientData);
      if (clientError) {
        console.warn('Could not create client profile:', clientError);
      }
    }
    
    return { user: userData, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const signOut = async () => {
  if (!auth) {
    return { error: 'Firebase not configured' };
  }
  
  try {
    await firebaseSignOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const getUserData = async (uid: string): Promise<User | null> => {
  if (!db) {
    console.warn('Firestore not configured. Please set up your Firebase project.');
    return null;
  }
  
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        ...data,
        createdAt: data.createdAt.toDate(),
        lastLogin: data.lastLogin?.toDate(),
      } as User;
    }
    return null;
  } catch (error) {
    console.warn('Could not fetch user data from Firestore. This is normal if Firestore rules are not configured yet.');
    return null;
  }
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  if (!auth) {
    callback(null);
    return () => {};
  }
  
  return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      const userData = await getUserData(firebaseUser.uid);
      callback(userData);
    } else {
      callback(null);
    }
  });
};