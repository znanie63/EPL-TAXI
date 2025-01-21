import { useState, useEffect } from 'react';
import { usersService } from '@/lib/services/users';
import type { User, UserRole } from '@/lib/types';

export function useUsers(role?: UserRole) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = role
          ? await usersService.getByRole(role)
          : await usersService.getAll();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch users'));
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [role]);

  const addUser = async (data: Omit<User, 'id' | 'created_time'>) => {
    try {
      const id = await usersService.create(data);
      const newUser = { ...data, id } as User;
      setUsers(prev => [...prev, newUser]);
      return id;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to add user');
    }
  };

  const updateUser = async (id: string, data: Partial<User>) => {
    try {
      await usersService.update(id, data);
      setUsers(prev =>
        prev.map(user => (user.id === id ? { ...user, ...data } : user))
      );
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update user');
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await usersService.delete(id);
      setUsers(prev => prev.filter(user => user.id !== id));
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete user');
    }
  };

  return {
    users,
    loading,
    error,
    addUser,
    updateUser,
    deleteUser,
  };
}