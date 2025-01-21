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
import { toast } from '@/hooks/use-toast';
import type { Employee } from '@/lib/types';
import { auth } from '@/lib/firebase';
import { usersService } from './users';

const COLLECTION = 'employees';

export const employeesService = {
  async getAll() {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Not authenticated');
    
    const userProfile = await usersService.getCurrentUserProfile();
    if (!userProfile) throw new Error('User profile not found');

    const snapshot = await getDocs(collection(db, COLLECTION));
    const employees = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as Employee));

    if (userProfile.role === 'Super') {
      return employees.filter(employee => 
        userProfile.parthners_uid?.includes(employee.parthner_uid || '')
      );
    } else if (userProfile.role === 'Parthner') {
      return employees.filter(employee => 
        employee.parthner_uid === userProfile.uid
      );
    }
    return [];
  },

  async getById(id: string) {
    const docRef = doc(db, COLLECTION, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Employee : null;
  },

  async getByOrganization(organizationId: string) {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Not authenticated');

    // Get current user's full profile
    const userProfile = await usersService.getCurrentUserProfile();
    if (!userProfile || userProfile.role !== 'Super') {
      throw new Error('Unauthorized');
    }

    const orgRef = doc(db, 'organizations', organizationId);
    const q = query(collection(db, COLLECTION), where('organization_ref', '==', orgRef));
    const snapshot = await getDocs(q);
    const employees = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as Employee));

    // Filter employees based on parthner_uid
    return employees.filter(employee => 
      userProfile.parthners_uid?.includes(employee.parthner_uid || '') || false
    );
  },

  async create(data: Omit<Employee, 'id' | 'created_time'>) {
    try {
      // Get organization reference
      const orgRef = data.organization_ref;
      if (!orgRef) throw new Error('Organization reference is required');

      // Prepare data with proper Timestamp conversions
      const timestampData = {
        ...data,
        created_time: Timestamp.now(),
        valid_from_date: Timestamp.fromDate(new Date(data.valid_from_date + 'T00:00:00')),
        valid_to_date: Timestamp.fromDate(new Date(data.valid_to_date + 'T00:00:00')),
      };

      // Create employee document
      const docRef = await addDoc(collection(db, COLLECTION), {
        ...timestampData
      });
      
      // Update organization with employee reference
      const employeeRef = doc(db, COLLECTION, docRef.id);
      await updateDoc(orgRef, {
        [data.type === 'med' ? 'med_ref' : 'teh_ref']: employeeRef
      });
      
      toast({
        title: "Сотрудник добавлен",
        description: "Новый сотрудник успешно добавлен в систему",
      });
      return docRef.id;
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить сотрудника",
        variant: "destructive",
      });
      throw error;
    }
  },

  async update(id: string, data: Partial<Employee>) {
    try {
      const docRef = doc(db, COLLECTION, id);

      // Get current employee data
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error('Employee not found');
      }

      const currentData = docSnap.data() as Employee;
      
      // Handle organization reference changes
      if (data.organization_ref !== undefined && 
          currentData.organization_ref?.id !== data.organization_ref?.id) {
        
        // Remove reference from old organization if exists
        if (currentData.organization_ref) {
          await updateDoc(currentData.organization_ref, {
            [currentData.type === 'med' ? 'med_ref' : 'teh_ref']: null
          });
        }
        
        // Add reference to new organization if exists
        if (data.organization_ref) {
          await updateDoc(data.organization_ref, {
            [currentData.type === 'med' ? 'med_ref' : 'teh_ref']: docRef
          });
        }
      }
      
      // Update document
      await updateDoc(docRef, data);
      
      toast({
        title: "Данные обновлены",
        description: "Информация о сотруднике успешно обновлена",
      });
    } catch (error) {
      console.error('Error updating employee:', error);
      let errorMessage = "Не удалось обновить данные сотрудника";
      
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

  async delete(id: string) {
    try {
      const docRef = doc(db, COLLECTION, id);
      
      // Get employee data before deletion
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error('Employee not found');
      }
      
      const employeeData = docSnap.data() as Employee;
      
      // Remove reference from organization if exists
      if (employeeData.organization_ref) {
        await updateDoc(employeeData.organization_ref, {
          [employeeData.type === 'med' ? 'med_ref' : 'teh_ref']: null
        });
      }
      
      // Delete employee document
      await deleteDoc(docRef);
      
      toast({
        title: "Сотрудник удален",
        description: "Сотрудник успешно удален из системы",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить сотрудника",
        variant: "destructive",
      });
      throw error;
    }
  },
  subscribeToEmployees(callback: (employees: Employee[]) => void) {
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
          let employees = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Employee));
          
          // Additional filtering for Super users
          if (userProfile.role === 'Super') {
            employees = employees.filter(emp =>
              userProfile.parthners_uid?.includes(emp.parthner_uid || '')
            );
          }
          
          callback(employees);
        },
        (error) => {
          console.error('Error subscribing to employees:', error);
          toast({
            title: "Ошибка",
            description: "Не удалось получить обновления списка сотрудников",
            variant: "destructive",
          });
        }
      );
      
      resolve(unsubscribe);
    });
  }
};