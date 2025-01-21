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
import { db } from '@/lib/firebase';
import type { SavedReport, SavedReportData } from '@/lib/types';
import { auth } from '@/lib/firebase';
import { usersService } from './users';
import { toast } from '@/hooks/use-toast';

const COLLECTION = 'reports';

export const reportsService = {
  async getAll() {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Not authenticated');

    const userProfile = await usersService.getCurrentUserProfile();
    if (!userProfile) throw new Error('User profile not found');

    // Build query based on user role
    let q;
    if (userProfile.role === 'Super') {
      q = query(collection(db, COLLECTION), 
        where('parthner_uid', 'in', userProfile.parthners_uid || []));
    } else {
      q = query(collection(db, COLLECTION), 
        where('parthner_uid', '==', userProfile.uid));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as SavedReport));
  },

  async create(data: SavedReportData & { parthner_uid: string }) {
    try {
      const userProfile = await usersService.getCurrentUserProfile();
      if (!userProfile || !userProfile.uid) throw new Error('User profile not found');
      
      // Only partners can create reports
      if (userProfile.role !== 'Parthner') {
        throw new Error('Only partners can create reports');
      }

      // Ensure parthner_uid is set correctly
      const reportData = {
        ...data,
        parthner_uid: userProfile.uid,
        created_time: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, COLLECTION), {
        ...reportData
      });
      
      toast({
        title: "Отчет сохранен",
        description: "Отчет успешно сохранен в системе",
      });
      
      return docRef.id;
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить отчет",
        variant: "destructive",
      });
      throw error;
    }
  },

  async delete(id: string) {
    try {
      const userProfile = await usersService.getCurrentUserProfile();
      if (!userProfile) throw new Error('User profile not found');

      const docRef = doc(db, COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Report not found');
      }

      const report = docSnap.data();
      
      // Verify user has permission to delete
      if (userProfile.role === 'Parthner' && report.parthner_uid !== userProfile.uid) {
        throw new Error('Unauthorized');
      }
      
      if (userProfile.role === 'Super' && 
          !userProfile.parthners_uid?.includes(report.parthner_uid)) {
        throw new Error('Unauthorized');
      }

      await deleteDoc(docRef);
      
      toast({
        title: "Отчет удален",
        description: "Отчет успешно удален из системы",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить отчет",
        variant: "destructive",
      });
      throw error;
    }
  },

  subscribeToReports(callback: (reports: SavedReport[]) => void) {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Not authenticated');

    return new Promise<() => void>(async (resolve) => {
      const userProfile = await usersService.getCurrentUserProfile();
      if (!userProfile) throw new Error('User profile not found');
      
      // Build query based on user role and permissions
      let q;
      if (userProfile.role === 'Super') {
        // Super admin can see reports from their associated partners
        q = query(
          collection(db, COLLECTION),
          where('parthner_uid', 'in', userProfile.parthners_uid || [])
        );
      } else {
        // Partners can only see their own reports
        q = query(
          collection(db, COLLECTION),
          where('parthner_uid', '==', userProfile.uid)
        );
      }
      
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const reports = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as SavedReport));
          
          callback(reports);
        },
        (error) => {
          console.error('Error subscribing to reports:', error);
          toast({
            title: "Ошибка",
            description: "Не удалось получить обновления списка отчетов",
            variant: "destructive",
          });
        }
      );
      
      resolve(unsubscribe);
    });
  }
};