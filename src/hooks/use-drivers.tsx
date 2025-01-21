import { useState, useEffect } from 'react';
import { usersService } from '@/lib/services/users';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/types';

export function useDrivers() {
  const [drivers, setDrivers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const data = await usersService.getByRole('Driver');
        setDrivers(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch drivers'));
        toast({
          title: "Ошибка загрузки",
          description: "Не удалось загрузить список водителей",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, [toast]);

  const addDriver = async (data: Omit<User, 'id' | 'created_time'>) => {
    try {
      const id = await usersService.create({ ...data, role: 'Driver' });
      toast({
        title: "Успешно",
        description: "Водитель добавлен",
      });
      return id;
    } catch (err) {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить водителя",
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateDriver = async (id: string, data: Partial<User>) => {
    try {
      await usersService.update(id, data);
      toast({
        title: "Успешно",
        description: "Данные водителя обновлены",
      });
    } catch (err) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить данные водителя",
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteDriver = async (id: string) => {
    try {
      await usersService.delete(id);
      toast({
        title: "Успешно",
        description: "Водитель удален",
      });
    } catch (err) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить водителя",
        variant: "destructive",
      });
      throw err;
    }
  };

  return {
    drivers,
    loading,
    error,
    addDriver,
    updateDriver,
    deleteDriver,
  };
}