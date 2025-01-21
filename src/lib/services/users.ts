import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { deleteUser } from 'firebase/auth';
import { db } from '@/lib/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import type { User } from '@/lib/types';
import { auth } from '@/lib/firebase';
import { toast } from '@/hooks/use-toast';

const functions = getFunctions();
const createUserWithEmail = httpsCallable(functions, 'createUserWithEmail');

const COLLECTION = 'users';

export const usersService = {
  async getAll() {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Not authenticated');
    
    const userProfile = await this.getCurrentUserProfile();
    if (!userProfile) throw new Error('User profile not found');

    const snapshot = await getDocs(collection(db, COLLECTION));
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));

    if (userProfile.role === 'Super') {
      return users.filter(user => 
        user.role === 'Super' ? user.uid === currentUser.uid :
        userProfile.parthners_uid?.includes(user.driver_parthner_uid || '')
      );
    } else if (userProfile.role === 'Parthner') {
      return users.filter(user => 
        user.uid === currentUser.uid || // Own profile
        user.driver_parthner_uid === userProfile.uid // Own drivers
      );
    }
    
    return [];
  },

  async getCurrentUserProfile() {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;

    const userSnap = await getDocs(
      query(collection(db, COLLECTION), where('uid', '==', currentUser.uid))
    );
    
    return userSnap.docs[0] ? 
      { id: userSnap.docs[0].id, ...userSnap.docs[0].data() } as User : 
      null;
  },

  async getById(id: string) {
    const docRef = doc(db, COLLECTION, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as User : null;
  },

  async getByEmail(email: string) {
    try {
      const q = query(collection(db, COLLECTION), where('email', '==', email));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as User;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  },

  async getByRole(role: User['role']) {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Not authenticated');

    const userProfile = await this.getCurrentUserProfile();
    if (!userProfile) throw new Error('User profile not found');
    
    const q = query(collection(db, COLLECTION), where('role', '==', role));
    const snapshot = await getDocs(q);
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    
    if (userProfile.role === 'Super') {
      if (role === 'Parthner') {
        return users.filter(user => 
          userProfile.parthners_uid?.includes(user.uid || '')
        );
      } else if (role === 'Driver') {
        return users.filter(user =>
          userProfile.parthners_uid?.includes(user.driver_parthner_uid || '')
        );
      }
    } else if (userProfile.role === 'Parthner') {
      if (role === 'Driver') {
        return users.filter(user => 
          user.driver_parthner_uid === userProfile.uid
        );
      }
    }
    
    return [];
  },

  async create(data: Omit<User, 'id' | 'created_time'>) {
    try {
      // Extract organizationRef to handle it separately
      const { organizationRef, licenseIssuedDate, licenseExpiryDate, created_time, ...userData } = data;
      
      // Convert Timestamp objects to seconds for cloud function
      const processedData = {
        ...userData,
        licenseIssuedDate: licenseIssuedDate?.seconds,
        licenseExpiryDate: licenseExpiryDate?.seconds,
        created_time: created_time?.seconds,
      };

      // Call Cloud Function to create user
      const result = await createUserWithEmail({
        dataUser: processedData
      });

      const response = result.data as { 
        userId: string;
        message: string;
        id: string;
        error?: {
          code: string;
          message: string;
        }
      };

      // Check for error in response
      if (response.error) {
        throw { 
          code: response.error.code,
          message: response.error.message 
        };
      }

      // After user is created, update with full references
      if (organizationRef) {
        const docRef = doc(db, COLLECTION, response.id);
        const updateData: Record<string, any> = {
          organizationRef,
          licenseIssuedDate,
          licenseExpiryDate,
          created_time,
        };
        await updateDoc(docRef, updateData);
      }

      toast({
        title: "Успешно",
        description: data.role === 'Driver' ? 
          "Водитель успешно добавлен в систему" :
          response.message
      });

      return response.id;
    } catch (error: any) {
      // Get error details from the cloud function response
      const errorDetails = error.details ? JSON.parse(error.details) : null;
      const errorCode = errorDetails?.code || error.code;
      const errorMessage = error.message || "Не удалось создать пользователя";

      toast({
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive",
      });

      throw { 
        code: errorCode,
        message: errorMessage,
        originalError: error 
      };
    }
  },

  async update(id: string, data: Partial<User>) {
    try {
      const docRef = doc(db, COLLECTION, id);
      
      // Get current user data
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error('User not found');
      }
      
      // Merge current data with updates
      const currentData = docSnap.data();
      const updatedData = {
        ...currentData,
        ...data,
      };
      
      // Update document
      await updateDoc(docRef, data);
      
      toast({
        title: "Данные обновлены",
        description: "Информация пользователя успешно обновлена",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить данные пользователя",
        variant: "destructive",
      });
      throw error;
    }
  },

  async delete(id: string) {
    try {
      const docRef = doc(db, COLLECTION, id);
      const currentUser = auth.currentUser;
      const userProfile = await this.getCurrentUserProfile();
      
      if (!currentUser || !userProfile) {
        throw new Error('Not authenticated');
      }
      
      // Store current auth credentials
      const currentEmail = userProfile.email;
      const currentPassword = sessionStorage.getItem('currentPassword');
      
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error('User not found');
      }
      const userData = docSnap.data();

      // Delete partner's document first
      await deleteDoc(docRef);

      // Get all drivers associated with this partner
      let driversToDelete = [];
      if (userData.role === 'Parthner') {
        const driversSnap = await getDocs(
          query(collection(db, COLLECTION), 
          where('driver_parthner_uid', '==', userData.uid))
        );
        driversToDelete = driversSnap.docs;
      }

      // Delete all drivers first
      for (const driverDoc of driversToDelete) {
        const driverData = driverDoc.data();
        try {
          // Delete driver's document
          await deleteDoc(driverDoc.ref);
          
          // Try to delete driver's auth account
          if (driverData.email && driverData.password) {
            try {
              await signInWithEmailAndPassword(auth, driverData.email, driverData.password);
              if (auth.currentUser) {
                await deleteUser(auth.currentUser);
              }
            } catch (error) {
              console.error('Error deleting driver auth:', error);
            }
            
            // Sign back in as admin
            if (currentEmail && currentPassword) {
              await signInWithEmailAndPassword(auth, currentEmail, currentPassword);
            }
          }
        } catch (error) {
          console.error('Error deleting driver auth:', error);
        }
      }

      // Delete partner's auth account
      try {
        if (userData.role !== 'Super') {
          if (userData.email && userData.password) {
            await signInWithEmailAndPassword(auth, userData.email, userData.password);
            if (auth.currentUser) {
              await deleteUser(auth.currentUser);
            }
            
            // Sign back in as admin
            if (currentEmail && currentPassword) {
              await signInWithEmailAndPassword(auth, currentEmail, currentPassword);
            }
          }
        }
      } catch (error) {
        console.error('Error deleting Firebase Auth user:', error);
      }

      // If this was a partner, update super admin's parthners_uid array
      if (userData.role === 'Parthner') {
        const superAdminSnap = await getDocs(
          query(collection(db, COLLECTION), 
          where('role', '==', 'Super'))
        );

        if (!superAdminSnap.empty) {
          const superAdmin = superAdminSnap.docs[0];
          const parthners_uid = superAdmin.data().parthners_uid || [];
          await updateDoc(superAdmin.ref, {
            parthners_uid: parthners_uid.filter((uid: string) => 
              uid !== userData.uid
            )
          });
        }
      }

      toast({
        title: "Пользователь удален",
        description: userData.role === 'Parthner' 
          ? "Партнер и все его водители успешно удалены из системы"
          : "Пользователь успешно удален из системы",
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      let errorMessage = "Не удалось удалить пользователя";
      
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

  subscribeToDrivers(callback: (drivers: User[]) => void) {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Not authenticated');

    return new Promise<() => void>(async (resolve) => {
      const userProfile = await this.getCurrentUserProfile();
      if (!userProfile) throw new Error('User profile not found');

      let q = query(collection(db, COLLECTION), where('role', '==', 'Driver'));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          let drivers = snapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data() 
          } as User));

          // Filter drivers based on user role
          if (userProfile.role === 'Super') {
            drivers = drivers.filter(driver => 
              userProfile.parthners_uid?.includes(driver.driver_parthner_uid || '')
            );
          } else if (userProfile.role === 'Parthner') {
            drivers = drivers.filter(driver => 
              driver.driver_parthner_uid === userProfile.uid
            );
          } else {
            drivers = [];
          }
          
          // Sort drivers by name
          drivers.sort((a, b) => a.display_name.localeCompare(b.display_name));
          callback(drivers);
        },
        (error) => {
          console.error('Error subscribing to drivers:', error);
          toast({
            title: "Ошибка",
            description: "Не удалось получить обновления списка водителей",
            variant: "destructive",
          });
        }
      );
      
      resolve(unsubscribe);
    });
  },

  subscribeToPartners(callback: (partners: User[]) => void) {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Not authenticated');

    return new Promise<() => void>(async (resolve) => {
      const userProfile = await this.getCurrentUserProfile();
      if (!userProfile) throw new Error('User profile not found');

      let q = query(collection(db, COLLECTION), where('role', '==', 'Parthner'));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          let partners = snapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data() 
          } as User));

          // Filter partners based on user role
          if (userProfile.role === 'Super') {
            partners = partners.filter(partner => 
              userProfile.parthners_uid?.includes(partner.uid || '')
            );
          }
          
          // Sort partners by name
          partners.sort((a, b) => a.display_name.localeCompare(b.display_name));
          callback(partners);
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