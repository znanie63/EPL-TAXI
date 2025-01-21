import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import { usersService } from '@/lib/services/users';
import { partnersService } from '@/lib/services/partners';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

export function usePartners() {
  const { partners, setPartners } = useStore();
  const { toast } = useToast();

  // Initialize partners state if needed
  useEffect(() => {
    if (!partners) {
      setPartners([]);
    }
  }, [partners, setPartners]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupSubscription = async () => {
      try {
        const unsubscribePromise = await partnersService.subscribeToPartners((data) => {
          if (Array.isArray(data)) {
            setPartners(data);
          }
        });
        unsubscribe = unsubscribePromise;
      } catch (err) {
        toast({
          title: "Ошибка загрузки",
          description: "Не удалось загрузить список партнеров",
          variant: "destructive",
        });
      }
    };

    setupSubscription();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [toast, setPartners]);

  const addPartner = async (data: Omit<User, 'id' | 'created_time'>) => {
    try {
      const id = await partnersService.createPartner(data);
      const newPartner = {
        id,
        ...data,
        created_time: Timestamp.now(),
      } as User;
      
      // Update will come through subscription
      return id;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to add partner');
    }
  };

  const updatePartner = async (id: string, data: Partial<User>) => {
    try {
      await usersService.update(id, data);
      // Update will come through subscription
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update partner');
    }
  };

  const deletePartner = async (id: string) => {
    try {
      await partnersService.deletePartner(id);
      // Update will come through subscription
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete partner');
    }
  };

  return {
    partners: Array.isArray(partners) ? partners : [],
    addPartner,
    updatePartner,
    deletePartner,
  };
}