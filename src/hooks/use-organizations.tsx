import { useState, useEffect } from 'react';
import { organizationsService } from '@/lib/services/organizations';
import { useToast } from '@/hooks/use-toast';
import type { Organization } from '@/lib/types';

export function useOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const data = await organizationsService.getAll();
        setOrganizations(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch organizations'));
        toast({
          title: "Ошибка загрузки",
          description: "Не удалось загрузить список организаций",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, [toast]);

  const addOrganization = async (data: Omit<Organization, 'id' | 'created_time'>) => {
    try {
      const id = await organizationsService.create(data);
      toast({
        title: "Успешно",
        description: "Организация добавлена",
      });
      return id;
    } catch (err) {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить организацию",
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateOrganization = async (id: string, data: Partial<Organization>) => {
    try {
      await organizationsService.update(id, data);
      toast({
        title: "Успешно",
        description: "Организация обновлена",
      });
    } catch (err) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить организацию",
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteOrganization = async (id: string) => {
    try {
      await organizationsService.delete(id);
      toast({
        title: "Успешно",
        description: "Организация удалена",
      });
    } catch (err) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить организацию",
        variant: "destructive",
      });
      throw err;
    }
  };

  return {
    organizations,
    loading,
    error,
    addOrganization,
    updateOrganization,
    deleteOrganization,
  };
}