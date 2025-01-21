import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import { usersService } from '@/lib/services/users';
import { Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export function useDrivers() {
  const { drivers, setDrivers } = useStore();
  const { toast } = useToast();

  useEffect(() => {
    if (!drivers) {
      setDrivers([]);
    }
  }, []);

  useEffect(() => {
    try {
      // Subscribe to real-time updates
      let unsubscribePromise = usersService.subscribeToDrivers((data) => {
        if (Array.isArray(data)) {
          setDrivers(data);
        }
      });

      // Cleanup subscription on unmount
      return () => {
        unsubscribePromise.then(unsubscribe => unsubscribe());
      };
    } catch (err) {
      console.error("Error loading drivers:", err);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить список водителей",
        variant: "destructive",
      });
    }
  }, [toast, setDrivers]);

  const loading = !drivers;

  const addDriver = async (data: Omit<User, 'id' | 'created_time'>) => {
    try {
      const id = await usersService.create({
        ...data,
        created_time: Timestamp.now()
      });
      return id;
    } catch (err) {
      console.error('Failed to add driver:', err);
      throw err instanceof Error ? err : new Error('Failed to add driver');
    }
  };

  const updateDriver = async (id: string, data: Partial<User>) => {
    try {
      await usersService.update(id, data);
    } catch (err) {
      console.error('Failed to update driver:', err);
      throw err instanceof Error ? err : new Error('Failed to update driver');
    }
  };

  const deleteDriver = async (id: string) => {
    try {
      await usersService.delete(id);
    } catch (err) {
      console.error('Failed to delete driver:', err);
      throw err instanceof Error ? err : new Error('Failed to delete driver');
    }
  };

  return {
    drivers: Array.isArray(drivers) ? drivers : [],
    loading,
    addDriver,
    updateDriver,
    deleteDriver,
  };
}