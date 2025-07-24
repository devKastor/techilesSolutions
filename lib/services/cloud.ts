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

export interface CloudFile {
  id: string;
  clientId: string;
  name: string;
  size: number;
  type: string;
  path: string;
  uploadedAt: Date;
  lastModified: Date;
  isBackup: boolean;
  checksum?: string;
}

export interface CloudFolder {
  id: string;
  clientId: string;
  name: string;
  path: string;
  createdAt: Date;
  parentId?: string;
}

export const cloudService = {
  // Créer un dossier client automatiquement
  async createClientFolder(clientId: string, clientName: string) {
    try {
      if (!db) {
        return { folderId: null, error: 'Firebase not configured' };
      }

      const folderData = {
        clientId,
        name: `${clientName}_backup`,
        path: `/clients/${clientId}`,
        createdAt: Timestamp.now(),
        parentId: null
      };

      const docRef = await addDoc(collection(db, 'cloudFolders'), folderData);
      
      // Créer les sous-dossiers par défaut
      const defaultFolders = [
        'Documents',
        'Images', 
        'Sauvegardes_Automatiques',
        'Configuration_Reseau',
        'Rapports_Intervention'
      ];

      for (const folderName of defaultFolders) {
        await addDoc(collection(db, 'cloudFolders'), {
          clientId,
          name: folderName,
          path: `/clients/${clientId}/${folderName}`,
          createdAt: Timestamp.now(),
          parentId: docRef.id
        });
      }

      return { folderId: docRef.id, error: null };
    } catch (error: any) {
      return { folderId: null, error: error.message };
    }
  },

  // Uploader un fichier
  async uploadFile(fileData: Omit<CloudFile, 'id' | 'uploadedAt'>) {
    try {
      if (!db) {
        return { fileId: null, error: 'Firebase not configured' };
      }

      const docRef = await addDoc(collection(db, 'cloudFiles'), {
        ...fileData,
        uploadedAt: Timestamp.now(),
        lastModified: Timestamp.fromDate(fileData.lastModified)
      });

      // Mettre à jour l'utilisation du quota client
      await this.updateClientQuota(fileData.clientId, fileData.size);

      return { fileId: docRef.id, error: null };
    } catch (error: any) {
      return { fileId: null, error: error.message };
    }
  },

  // Obtenir les fichiers d'un client
  async getClientFiles(clientId: string) {
    try {
      if (!db) {
        return { files: [], error: 'Firebase not configured' };
      }

      const q = query(
        collection(db, 'cloudFiles'),
        where('clientId', '==', clientId),
        orderBy('uploadedAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const files = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        uploadedAt: doc.data().uploadedAt?.toDate(),
        lastModified: doc.data().lastModified?.toDate(),
      })) as CloudFile[];

      return { files, error: null };
    } catch (error: any) {
      return { files: [], error: error.message };
    }
  },

  // Obtenir les dossiers d'un client
  async getClientFolders(clientId: string) {
    try {
      if (!db) {
        return { folders: [], error: 'Firebase not configured' };
      }

      const q = query(
        collection(db, 'cloudFolders'),
        where('clientId', '==', clientId),
        orderBy('createdAt', 'asc')
      );
      
      const snapshot = await getDocs(q);
      const folders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as CloudFolder[];

      return { folders, error: null };
    } catch (error: any) {
      return { folders: [], error: error.message };
    }
  },

  // Mettre à jour le quota utilisé
  async updateClientQuota(clientId: string, sizeChange: number) {
    try {
      if (!db) {
        return { error: 'Firebase not configured' };
      }
      
      // En production, mettre à jour le quota dans la collection clients
      console.log(`Updating quota for client ${clientId}: +${sizeChange} bytes`);
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // Créer une sauvegarde automatique
  async createAutoBackup(clientId: string, backupData: any) {
    try {
      const backupFile: Omit<CloudFile, 'id' | 'uploadedAt'> = {
        clientId,
        name: `Sauvegarde_${new Date().toISOString().split('T')[0]}.zip`,
        size: backupData.size || 0,
        type: 'backup',
        path: `/clients/${clientId}/Sauvegardes_Automatiques/`,
        lastModified: new Date(),
        isBackup: true,
        checksum: backupData.checksum
      };

      return await this.uploadFile(backupFile);
    } catch (error: any) {
      return { fileId: null, error: error.message };
    }
  },

  // Synchroniser avec Google Drive (simulation)
  async syncWithGoogleDrive(clientId: string) {
    try {
      // Simulation de synchronisation avec Google Drive
      console.log(`Syncing client ${clientId} with Google Drive`);
      
      // En production, cela utiliserait l'API Google Drive
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};