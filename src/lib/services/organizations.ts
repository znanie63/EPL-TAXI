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
  onSnapshot,
} from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import type { Organization } from '@/lib/types';
import { auth } from '@/lib/firebase';
import { usersService } from './users';

const COLLECTION = 'organizations';

export const organizationsService = {
  async getAll() {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Not authenticated');

    const userProfile = await usersService.getCurrentUserProfile();
    if (!userProfile) throw new Error('User profile not found');

    if (userProfile.role === 'Super' && userProfile.parthners_uid?.length) {
      const organizationsPromises = userProfile.parthners_uid.map(async (partnerId) => {
        const q = query(
          collection(db, COLLECTION),
          where('parthner_uid', '==', partnerId)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Organization));
      });
      
      const organizationsArrays = await Promise.all(organizationsPromises);
      return organizationsArrays.flat();
    } else if (userProfile.role === 'Parthner') {
      const q = query(
        collection(db, COLLECTION),
        where('parthner_uid', '==', userProfile.uid)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Organization));
    }
    
    return [];
  },

  async getById(id: string) {
    const docRef = doc(db, COLLECTION, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Organization : null;
  },

  async getByStatus(status: Organization['status']) {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Not authenticated');

    const userProfile = await usersService.getCurrentUserProfile();
    if (!userProfile || userProfile.role !== 'Super') {
      throw new Error('Unauthorized');
    }

    const q = query(collection(db, COLLECTION), where('status', '==', status));
    const snapshot = await getDocs(q);
    const organizations = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as Organization));

    return organizations.filter(org => 
      userProfile.parthners_uid?.includes(org.parthner_uid || '') || false
    );
  },

  async create(data: Omit<Organization, 'id' | 'created_time'>) {
    try {
      const timestampData = {
        ...data,
        created_time: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, COLLECTION), {
        ...timestampData,
        status: timestampData.status || 'active'
      });
      toast({
        title: "Организация добавлена",
        description: "Новая организация успешно создана",
      });
      return docRef.id;
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось создать организацию",
        variant: "destructive",
      });
      throw error;
    }
  },

  async update(id: string, data: Partial<Organization>) {
    try {
      const docRef = doc(db, COLLECTION, id);
      await updateDoc(docRef, data);
      toast({
        title: "Организация обновлена",
        description: "Данные организации успешно обновлены",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить организацию",
        variant: "destructive",
      });
      throw error;
    }
  },

  async delete(id: string) {
    try {
      const docRef = doc(db, COLLECTION, id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error('Organization not found');
      }

      const organization = { id: docSnap.id, ...docSnap.data() } as Organization;
        
      // Check if organization has any drivers
      if (organization.driversRefs?.length > 0) {
        throw new Error('Cannot delete organization with active drivers');
      }

      // If all checks pass, delete the organization
      await deleteDoc(docRef);
      toast({
        title: "Организация удалена",
        description: "Организация успешно удалена из системы",
      });
    } catch (error) {
      console.error('Error deleting organization:', error);
      let errorMessage = "Не удалось удалить организацию";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  },

  subscribeToOrganizations(callback: (organizations: Organization[]) => void) {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Not authenticated');

    return new Promise<() => void>(async (resolve) => {
      const userProfile = await usersService.getCurrentUserProfile();
      if (!userProfile) throw new Error('User profile not found');
      
      let q = query(collection(db, COLLECTION));
      
      // Add role-specific filters
      if (userProfile.role === 'Parthner') {
        q = query(q, where('parthner_uid', '==', userProfile.uid));
      }
      
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          let organizations = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Organization));
          
          // Additional filtering for Super users
          if (userProfile.role === 'Super') {
            organizations = organizations.filter(org =>
              userProfile.parthners_uid?.includes(org.parthner_uid || '')
            );
          }
          
          callback(organizations);
        },
        (error) => {
          console.error('Error subscribing to organizations:', error);
          toast({
            title: "Ошибка",
            description: "Не удалось получить обновления списка организаций",
            variant: "destructive",
          });
        }
      );
      
      resolve(unsubscribe);
    });
  }
};