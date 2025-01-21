import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { GeneratedPdf } from '@/lib/types';
import { auth } from '@/lib/firebase';
import { usersService } from './users';

const COLLECTION = 'generatedPdfs';

export const generatedPdfsService = {
  async getAll() {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Not authenticated');
    
    const userProfile = await usersService.getCurrentUserProfile();
    if (!userProfile) throw new Error('User profile not found');

    const snapshot = await getDocs(collection(db, COLLECTION));
    const pdfs = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as GeneratedPdf));

    if (userProfile.role === 'Super') {
      return pdfs.filter(pdf => 
        userProfile.parthners_uid?.includes(pdf.driverPartnerUid || '')
      );
    } else if (userProfile.role === 'Parthner') {
      return pdfs.filter(pdf => pdf.driverPartnerUid === userProfile.uid);
    }
    
    return [];
  },

  async getById(id: string) {
    try {
      const docRef = doc(db, COLLECTION, id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as GeneratedPdf : null;
    } catch (error) {
      console.error('Error fetching PDF by ID:', error);
      throw error;
    }
  },

  async getByDriverId(driverId: string) {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Not authenticated');

    const userProfile = await usersService.getCurrentUserProfile();
    if (!userProfile) throw new Error('User profile not found');
    
    try {
      // First get the driver details to get their partner ID
      const driver = await usersService.getById(driverId);
      if (!driver) throw new Error('Driver not found');
      
      // Verify access rights
      if (userProfile.role === 'Super' && 
          !userProfile.parthners_uid?.includes(driver.driver_parthner_uid || '')) {
        throw new Error('Unauthorized access to driver');
      } else if (userProfile.role === 'Parthner' && 
                 driver.driver_parthner_uid !== userProfile.uid) {
        throw new Error('Unauthorized access to driver');
      }
      
      // Create a proper DocumentReference
      const userRef = doc(db, 'users', driverId);

      const q = query(
        collection(db, COLLECTION),
        where('userRef', '==', userRef)
      );
      
      const snapshot = await getDocs(q);
      const pdfs = snapshot.docs.map(doc => ({
        id: doc.id, 
        ...doc.data()
      } as GeneratedPdf));
      
      return pdfs;
    } catch (error) {
      console.error('Error fetching PDFs by driver ID:', error);
      throw error;
    }
  },

  async create(data: Omit<GeneratedPdf, 'id' | 'created_time'>) {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
      created_time: Timestamp.now(),
    });
    return docRef.id;
  },

  async update(id: string, data: Partial<GeneratedPdf>) {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, data);
  },

  async delete(id: string) {
    const docRef = doc(db, COLLECTION, id);
    await deleteDoc(docRef);
  },
};