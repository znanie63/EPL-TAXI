import {
  collection,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  query,
  where,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { toast } from '@/hooks/use-toast';
import type { User } from '@/lib/types';
import { usersService } from './users';
import { auth } from '@/lib/firebase';

const functions = getFunctions();
const createUserWithEmail = httpsCallable(functions, 'createUserWithEmail');

const COLLECTION = 'users';

export const partnersService = {
  async createPartner(data: Omit<User, 'id' | 'created_time'>) {
    const userProfile = await usersService.getCurrentUserProfile();
    if (!userProfile) throw new Error('User profile not found');
    if (userProfile.role !== 'Super') throw new Error('Only Super users can create partners');

    try {
      // Call cloud function to create auth user and initial document
      const result = await createUserWithEmail({
        dataUser: {
          ...data,
          role: 'Parthner',
        }
      });

      const response = result.data as {
        userId: string;
        message: string;
        id: string;
      };

      // Update Super user's parthners_uid array
      if (response.userId) {
        const superUserRef = doc(db, COLLECTION, userProfile.id);
        await updateDoc(superUserRef, {
          parthners_uid: [...(userProfile.parthners_uid || []), response.userId]
        });
      }

      toast({
        title: "Партнер добавлен",
        description: "Новый партнер успешно добавлен в систему",
      });

      return response.id;
    } catch (error: any) {
      let message = "Не удалось создать партнера";
      
      if (error.code === 'already-exists') {
        message = "Пользователь с таким email уже существует";
      } else if (error.code === 'invalid-argument') {
        message = error.message || "Неверные данные";
      }

      toast({
        title: "Ошибка",
        description: message,
        variant: "destructive",
      });

      throw error;
    }
  },

  async updatePartner(id: string, data: Partial<User>) {
    try {
      const docRef = doc(db, COLLECTION, id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error('Partner not found');
      }
      
      await updateDoc(docRef, data);
      
      toast({
        title: "Данные обновлены",
        description: "Информация партнера успешно обновлена",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить данные партнера",
        variant: "destructive",
      });
      throw error;
    }
  },
  async deletePartner(id: string) {
    const userProfile = await usersService.getCurrentUserProfile();
    const currentUser = auth.currentUser;
    if (!userProfile) throw new Error('User profile not found');
    
    try {
      const docRef = doc(db, COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Partner not found');
      }

      const partnerData = docSnap.data() as User;
      
      // Get all drivers associated with this partner
      const driversQuery = query(
        collection(db, COLLECTION),
        where('driver_parthner_uid', '==', partnerData.uid)
      );
      const driversSnap = await getDocs(driversQuery);

      // Delete all associated drivers
      for (const driverDoc of driversSnap.docs) {
        await deleteDoc(driverDoc.ref);
      }

      // Delete partner document
      await deleteDoc(docRef);

      // Update super admin's partners list
      const superAdminRef = doc(db, COLLECTION, userProfile.id);
      const parthners_uid = userProfile.parthners_uid || [];
      await updateDoc(superAdminRef, {
        parthners_uid: parthners_uid.filter(uid => uid !== partnerData.uid)
      });

      toast({
        title: "Партнер удален",
        description: "Партнер и все его водители успешно удалены из системы",
      });
    } catch (error) {
      console.error('Error deleting partner:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить партнера",
        variant: "destructive",
      });
      throw error;
    }
  },

  async subscribeToPartners(callback: (partners: User[]) => void) {
    const currentUser = auth.currentUser;
    return new Promise<() => void>(async (resolve) => {
      const userProfile = await usersService.getCurrentUserProfile();
      if (!userProfile) throw new Error('User profile not found');

      // Base query to get all partners
      let q = query(
        collection(db, COLLECTION), 
        where('role', '==', 'Parthner')
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          // Map documents to User objects
          const partners = snapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data() 
          } as User));

          // For Super admin, only show partners in their parthners_uid array
          if (userProfile.role === 'Super') {
            const filteredPartners = partners.filter(partner => 
              userProfile.parthners_uid?.includes(partner.uid)
            ).sort((a, b) => 
              a.display_name.localeCompare(b.display_name)
            );
            callback(filteredPartners);
          } else {
            // For other roles, don't show any partners
            callback([]);
          }
        },
        (error) => {
          console.error('Error subscribing to partners:', error);
          toast({
            title: "Ошибка",
            description: "Не удалось получить обновления списка партнеров",
            variant: "destructive",
          });
        }
      );
      
      resolve(unsubscribe);
    });
  }
};