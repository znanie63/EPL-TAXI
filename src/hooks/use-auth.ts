import { useState, useEffect } from 'react';
import { type User } from 'firebase/auth';
import { authService } from '@/lib/services/auth';
import { useToast } from '@/hooks/use-toast';
import { useStore } from '@/lib/store';
import { usersService } from '@/lib/services/users';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { resetStore } = useStore();

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // First get user profile to check role
      const userProfile = await usersService.getByEmail(email);
      
      if (userProfile?.role === 'Driver') {
        toast({
          title: "Доступ запрещен",
          description: "Водители не могут зайти в админ панель",
          variant: "destructive",
        });
        throw new Error('Drivers not allowed');
      }

      await authService.login(email, password);
      toast({
        title: "Успешный вход",
        description: "Добро пожаловать в систему",
      });
    } catch (error) {
      if (error.message === 'Drivers not allowed') {
        throw error;
      }
      toast({
        title: "Ошибка входа",
        description: "Неверный email или пароль",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      resetStore();
      toast({
        title: "Выход выполнен",
        description: "Вы успешно вышли из системы",
      });
    } catch (error) {
      toast({
        title: "Ошибка выхода",
        description: "Не удалось выйти из системы",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    user,
    loading,
    login,
    logout,
  };
}