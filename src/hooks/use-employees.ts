import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import { employeesService } from '@/lib/services/employees';
import { useToast } from '@/hooks/use-toast';
import type { Employee } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

export function useEmployees() {
  const { employees, setEmployees } = useStore();
  const { toast } = useToast();

  // Initialize employees state
  useEffect(() => {
    if (!employees) {
      setEmployees([]);
    }
  }, []);

  useEffect(() => {
    try {
      // Subscribe to real-time updates
      let unsubscribePromise = employeesService.subscribeToEmployees((data) => {
        if (Array.isArray(data)) {
          setEmployees(data);
        }
      });

      // Cleanup subscription on unmount
      return () => {
        unsubscribePromise.then(unsubscribe => unsubscribe());
      };
    } catch (err) {
      console.error("Error loading employees:", err);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить список сотрудников",
        variant: "destructive",
      });
    }
  }, [toast, setEmployees]);

  const addEmployee = async (data: Omit<Employee, 'id' | 'created_time'>) => {
    try {
      const id = await employeesService.create(data);
      const newEmployee = {
        id,
        ...data,
      } as Employee;
      
      // Update will come through subscription
      toast({
        title: "Сотрудник добавлен",
        description: "Новый сотрудник успешно добавлен в систему",
      });
      return id;
    } catch (err) {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить сотрудника",
        variant: "destructive",
      });
      throw err instanceof Error ? err : new Error('Failed to add employee');
    }
  };

  const updateEmployee = async (id: string, data: Partial<Employee>) => {
    try {
      await employeesService.update(id, data);
      // Update will come through subscription
      toast({
        title: "Данные обновлены",
        description: "Информация о сотруднике успешно обновлена",
      });
    } catch (err) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить данные сотрудника",
        variant: "destructive",
      });
      throw err instanceof Error ? err : new Error('Failed to update employee');
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      await employeesService.delete(id);
      // Update will come through subscription
      toast({
        title: "Сотрудник удален",
        description: "Сотрудник успешно удален из системы",
      });
    } catch (err) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить сотрудника",
        variant: "destructive",
      });
      throw err instanceof Error ? err : new Error('Failed to delete employee');
    }
  };

  return {
    employees,
    setEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
  };
}