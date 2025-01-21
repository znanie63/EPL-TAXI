import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import { organizationsService } from '@/lib/services/organizations';
import { useToast } from '@/hooks/use-toast';
import type { Organization } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

export function useOrganizations() {
  const { organizations, setOrganizations } = useStore();
  const { toast } = useToast();
  
  // Initialize state if needed
  useEffect(() => {
    if (!organizations) {
      setOrganizations([]);
    }
  }, [organizations, setOrganizations]);

  useEffect(() => {
    try {
      // Subscribe to real-time updates
      let unsubscribePromise = organizationsService.subscribeToOrganizations((data) => {
        if (Array.isArray(data)) {
          setOrganizations(data);
        }
      });
      
      // Cleanup subscription on unmount
      return () => {
        unsubscribePromise.then(unsubscribe => unsubscribe());
      };
    } catch (err) {
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить список организаций",
        variant: "destructive",
      });
    }
  }, [toast, setOrganizations]);

  const addOrganization = async (data: Omit<Organization, 'id' | 'created_time'>) => {
    try {
      const id = await organizationsService.create(data);
      if (!id) throw new Error('Failed to create organization');
      
      const newOrganization = {
        id,
        ...data,
        created_time: Timestamp.now(),
      } as Organization;
      
      // Update will come through subscription
      return id;
    } catch (err) {
      toast({
        title: "Ошибка",
        description: "Не удалось создать организацию",
        variant: "destructive",
      });
      throw err instanceof Error ? err : new Error('Failed to add organization');
    }
  };

  const updateOrganization = async (id: string, data: Partial<Organization>) => {
    try {
      await organizationsService.update(id, data);
      // Update will come through subscription
    } catch (err) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить организацию",
        variant: "destructive",
      });
      throw err instanceof Error ? err : new Error('Failed to update organization');
    }
  };

  const deleteOrganization = async (id: string) => {
    try {
      await organizationsService.delete(id);
      // Update will come through subscription
    } catch (err) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить организацию",
        variant: "destructive",
      });
      throw err instanceof Error ? err : new Error('Failed to delete organization');
    }
  };

  return {
    organizations: Array.isArray(organizations) ? organizations : [],
    setOrganizations,
    addOrganization,
    updateOrganization,
    deleteOrganization,
  };
}